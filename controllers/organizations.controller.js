const debug = require('debug')('test-node:server'),
    _ = require('lodash'),
    httpStatus = require('http-status');

const models = require('../models/models'),
    er = require('../helpers/errors');


class OrgNetworkParser {
    constructor() {
        // Think about request for creating as a single transaction
        this.transaction = null;
        // To send response in proper time observe all promises in one place
        this.promises = [];
    }

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

    handleSucceededCollecting(results) {
        (this.transaction.finished) ? this.transaction : this.transaction.commit()
    }

    handleFailedCollecting(err) {
        (this.transaction.finished) ? this.transaction : this.transaction.rollback();
        throw err;
    }

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


const getAllRelations = function(req, res, next) {

};

module.exports = {
    getAllRelations: getAllRelations,
    createOrganizationsNetwork: createOrganizationsNetwork
};
