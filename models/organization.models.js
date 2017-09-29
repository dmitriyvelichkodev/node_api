module.exports = function(db) {
    const Organization = db.sequelize.define('Organization', {
        name: {
            type: db.Sequelize.STRING,
            primaryKey: true,
        },
    }, {
        timestamps: false,
        underscored: false,
    });

    Organization.creating = (currentOrg, transaction) => {
        if (!currentOrg || !currentOrg.name) return Promise.resolve();

        return Organization.findOrCreate({
                where: currentOrg,
                transaction: transaction,
            })
            .spread((organization, created) => {

            });
    };

    return Organization;
};
