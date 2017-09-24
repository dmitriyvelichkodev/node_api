// TODO correctly check empty objects
// TODO if cycles or transaction try decorating

const models = require('../models/db');

const getAllRelations = function(req, res, next) {

};

const fetchOrg = function(srcObj, parentName) {
    if (!srcObj) return;

    let currentOrg = {name: srcObj.org_name};

    models.Organization.creating(currentOrg)
        .then(() => {
            return {
                parentName: parentName,
                daughterName: currentOrg.name
            }
        })
        .then(relationObj => models.Relation.creating(relationObj));


    if (srcObj.daughters) {
        srcObj.daughters.forEach((el) => {
            fetchOrg(el, srcObj.org_name);
        });
    }
};


const createOrganizationsNetwork = function(req, res, next) {

    const orgNetworkSource = req.body;

    // TODO correct check emptiness
    if (!orgNetworkSource) return Promise.resolve();

    fetchOrg(orgNetworkSource);

    return this.fetch(obj, false)
};


module.exports = {
    getAllRelations: getAllRelations,
    createOrganizationsNetwork: createOrganizationsNetwork
};
