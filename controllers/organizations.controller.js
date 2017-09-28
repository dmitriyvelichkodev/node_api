/**
 * Provides classes and methods that process requests for /api/organizations
 * @module organizations.controller
 */

const debug = require('debug')('test-node:server'),
    _ = require('lodash'),
    httpStatus = require('http-status');

const models = require('../models/models'),
    er = require('../helpers/errors');

/**
 * Allows to parse input JSON data in format:
 * {
 *   "org_name": "Name of organization",
 *   "daughters":[
 *       {
 *           "org_name": "Name of organization",
 *               "daughters": [...]
 *       },
 *       ...
 *       ]
 * }
 * and fill data into db with method collectingData;
 * @class OrgNetworkParser
 */
class OrgNetworkParser {
    /**
     * OrgNetworkParser think about requested data as a single transaction,
     * also handle all db operation asynchronous. Handle all db promises with
     * promises array.
     * @method constructor
     */
    constructor() {
        this.transaction = null;
        this.promises = [];
    }

    /**
     * Recursive function that goes by organizations object,
     * and fetch data for db insertion. Throws exception in
     * case at least one organization has reference to itself.
     *
     * @method fetchRecords
     * @param {Object} srcObj Object has structure described in OrgNetworkParser class description.
     * @param {String} parentName Name of organization which daughters currently
     * parsing
     */
    fetchRecords(srcObj, parentName) {
        if (_.isEmpty(srcObj)) return;

        const currentOrg = {name: srcObj.org_name};

        if (parentName === currentOrg.name) {
            const msg = `Received data has organization that referenced to itself: ${parentName}`;
            throw new er.APIError(msg, httpStatus.UNPROCESSABLE_ENTITY);
        }

        this.promises.push(
            models.Organization.creating(currentOrg, this.transaction)
                .then(() => {
                    return {
                        parentName: parentName,
                        daughterName: currentOrg.name
                    }
                })
                .then(relationObj => models.Relation.creating(relationObj, this.transaction))
        );

        if (srcObj.daughters) {
            srcObj.daughters.forEach((el) => {
                this.fetchRecords(el, srcObj.org_name);
            });
        }
    }

    /**
     * Method used for succeeded transaction end. Can be used in chain
     * several times, COMMIT transaction only ones.
     *
     * @method handleSucceededCollecting
     * @return {Promise} Returns transaction promise object if commit done.
     */
    handleSucceededCollecting() {
        if (!this.transaction.finished) {
            return this.transaction.commit();
        }
    }

    /**
     * Method used for failed transaction end. Can be used in chain
     * several times, ROLLBACK transaction only ones. Send exception further.
     * Just used for rollback operation.
     *
     * @method handleFailedCollecting
     * @return {Promise} Returns transaction promise object if rollback done.
     */
    handleFailedCollecting(err) {
        if (!this.transaction.finished) {
            this.transaction.rollback();
        }
        throw err;
    }

    /**
     * Class main method, that starts transaction and process all parsing and handle data
     * db insertion.
     * @method collectingData
     * @param {Object} obj Object has structure described in OrgNetworkParser class description.
     * @return {Promise} Returns transaction promise object if rollback done.
     */
    collectingData(obj) {
        if (_.isEmpty(obj)) return Promise.resolve();

        return models.db.sequelize.transaction()
            .then(t => {
                this.transaction = t;
                this.fetchRecords(obj, null);
            })
            .catch((err) => this.handleFailedCollecting(err))
            .then(() => Promise.all(this.promises))
            .then((results) => this.handleSucceededCollecting(results))
            .catch((err) => this.handleFailedCollecting(err))
    }
}


/**
 * Handler for POST api/organizations
 * @method createOrganizationsNetwork
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Object} next Middleware function used by Express.
 */
const createOrganizationsNetwork = function(req, res, next) {
    const parser = new OrgNetworkParser();
    parser.collectingData(req.body)
        .then(() => {
            const status = httpStatus.CREATED;
            res.status(status);
            res.json({message: httpStatus[status]})
        })
        .catch((er) => {
            let status = er.status || httpStatus.INTERNAL_SERVER_ERROR,
                msg = er.message || httpStatus[status];
            if (status === httpStatus.INTERNAL_SERVER_ERROR) {
                msg = httpStatus[status];
            }

            res.status(status);
            res.json({message: msg});
        });
};

/**
 * Handler for GET api/organizations/:name/relations
 * @method getAllRelations
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Object} next Middleware function used by Express.
 */
const getAllRelations = function(req, res, next) {
    let pageNumber = parseInt(req.query.page),
        targetName = req.params.name;

    // default value if not pointed
    if (typeof req.query.page === "undefined") {
        pageNumber = 1;
    }

    if (isNaN(pageNumber) || pageNumber < 1) {
        throw new er.APIError("Invalid page number", httpStatus.UNPROCESSABLE_ENTITY);
    }
    if (!targetName) {
        throw new er.APIError("Invalid target organization name", httpStatus.UNPROCESSABLE_ENTITY);
    }

    models.Relation.gettingPaginated(targetName, pageNumber)
        .then((result) => {
            res.json(result);
        });
};

module.exports = {
    getAllRelations: getAllRelations,
    createOrganizationsNetwork: createOrganizationsNetwork
};
