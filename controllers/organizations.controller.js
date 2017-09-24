// TODO correctly check empty objects
// TODO if cycles or transaction try decorating

const Promise = require("bluebird");
require('bluebird-settle');

const models = require('../models/db');


class OrgNetworkParser {
    constructor() {
        // For detecting cycle dependencies in received data collects passed orgs
        this.cyclePath = [];
        // Think about request for creating as a single transaction
        this.transaction = null;
        // To send response in proper time observe all promises in one place
        this.promises = [];
    }

    addToPath(name) {

        console.log(this.cyclePath, name);

        if (~this.cyclePath.indexOf(name)) {
            throw new Error("Received data has cycle dependency");
        } else {
            this.cyclePath.push(name);
        }
    }

    fetchRecords(srcObj, parentName) {
        if (!srcObj) return;

        const currentOrg = {name: srcObj.org_name};
        this.addToPath(srcObj.org_name);

        this.promises.push(
            models.Organization.creating(currentOrg, this.transaction)
                .then(() => {
                    console.log("^^^^^^^^^^^^^^^^^^^^^^^^" + parentName + "|" + currentOrg.name);
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

    promisesFailed() {
        console.log("ERROR" + this.transaction);
        this.transaction.rollback();
        console.log("TRANSACTION ROLLBACK");
    }

    promisesSucceeded() {
        console.log("OKEY"+this.transaction);
        this.transaction.commit();
        console.log("TRANSACTION COMMITED");
    }

    checkSettleResults(results) {
        let isComplited = true;
        results.forEach((result) => {
            isComplited = isComplited && !result.isRejected() && result.isResolved();
            if (result.isRejected()) {
                console.log('Rejected with reason: ' + result.reason());
            } else if (result.isResolved()) {
                console.log('Resolved with value: ' + result.value());
            }
        });

        isComplited ? this.promisesSucceeded() : this.promisesFailed();
    }

    collectingData(obj) {
        if (!obj) return Promise.resolve();
        return models.db.sequelize.transaction()
            .then(t => {
                this.transaction = t;
                this.fetchRecords(obj, null);
            })
            .then(() => Promise.settle(this.promises))
            .then((results) => this.checkSettleResults(results))
            .catch((err) => this.promisesFailed(err))
    }
}


const createOrganizationsNetwork = function(req, res, next) {
    const orgNetworkSource = req.body;
    if (!orgNetworkSource) return Promise.resolve();

    const parser = new OrgNetworkParser();
    parser.collectingData(orgNetworkSource)
        .then(() => res.json("Created."))
        .catch((er) => res.json(er.toString()));
};


const getAllRelations = function(req, res, next) {

};

module.exports = {
    getAllRelations: getAllRelations,
    createOrganizationsNetwork: createOrganizationsNetwork
};
