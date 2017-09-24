const debug = require('debug')('test-node:server'),
    _ = require('lodash'),
    httpStatus = require('http-status');

const models = require('../models/db'),
    er = require('../helpers/errors');


class OrgNetworkParser {
    constructor() {
        // For detecting cycle dependencies in received data collects passed orgs
        this.cyclePath = [];
        // Think about request for creating as a single transaction
        this.transaction = null;
        // To send response in proper time observe all promises in one place
        this.promises = [];
    }

    detectCycle(name) {
        if (~this.cyclePath.indexOf(name)) {
            this.cyclePath.push(name);
            const msg = `Received data has cycle dependency: ${this.cyclePath}`;
            throw new er.APIError(msg, httpStatus.UNPROCESSABLE_ENTITY);
        } else {
            this.cyclePath.push(name);
        }
    }

    fetchRecords(srcObj, parentName) {
        if (_.isEmpty(srcObj)) return;

        const currentOrg = {name: srcObj.org_name};
        this.detectCycle(srcObj.org_name);

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

        this.cyclePath.pop();
    }

    handleSucceededCollecting() {
        const transactionId = this.transaction.id;
        const t = this.transaction.commit();
        debug(`Transaction: ${transactionId} COMMITED`);
        return t;
    }

    handleFailedCollecting(err) {
        const transactionId = this.transaction.id;
        this.transaction.rollback();
        debug(`Transaction: ${transactionId} ROLLBACKED`);
        throw err;
    }

    collectingData(obj) {
        if (_.isEmpty(obj)) return Promise.resolve();

        return models.db.sequelize.transaction()
            .then(t => {
                this.transaction = t;
                this.fetchRecords(obj, null);
            })
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
            const status = er.status || httpStatus.INTERNAL_SERVER_ERROR;
            res.status(status);
            res.json({message: er.message || httpStatus[status]});
        });
};


const getAllRelations = function(req, res, next) {

};

module.exports = {
    getAllRelations: getAllRelations,
    createOrganizationsNetwork: createOrganizationsNetwork
};
