module.exports = function(db) {

    const Organization = db.sequelize.define('Organization', {
        name: {
            type: db.Sequelize.STRING,
            primaryKey: true
        }
    }, {
        timestamps: false,
        underscored: false,
    });

    Organization.creating = (currentOrg) => {
        return Organization.findOrCreate({
                where: currentOrg
            })
            .spread((organization, created) => {

            })
    };

    return Organization;
};