module.exports = function(db) {

    const Relation = db.sequelize.define('Relation', {}, {
        timestamps: false,
        underscored: false,
    });

    const Organization = require('./organization.models')(db);

    Relation.belongsTo(Organization,
        {foreignKey: {name: 'parentName', allowNull: false}, onDelete: 'CASCADE'});
    Relation.belongsTo(Organization,
        {foreignKey: {name: 'daughterName', allowNull: false}, onDelete: 'CASCADE'});

    Relation.creating = (relationObj, transaction) => {
        if (!relationObj || !relationObj.parentName || !relationObj.daughterName) {
            return Promise.resolve();
        }

        return Relation.findOrCreate({
                where: relationObj,
                transaction: transaction
            })
            .spread((relation, created) => {

            })
    };

    return Relation;
};






