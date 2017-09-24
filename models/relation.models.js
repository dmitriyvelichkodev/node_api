module.exports = function(db) {

    const Relation = db.sequelize.define('Relation', {}, {
        timestamps: false,
        underscored: false,
    });

    const Organization = require('./organization.models')(db);

    Relation.belongsTo(Organization,
        {foreignKey: {name: 'ParentName', allowNull: false}, onDelete: 'CASCADE'});
    Relation.belongsTo(Organization,
        {foreignKey: {name: 'DaughterName', allowNull: false}, onDelete: 'CASCADE'});

    Relation.creating = (relationObj) => {
        return Relation.findOrCreate({
                where: relationObj
            })
            .spread((relation, created) => {

            })
    };

    return Relation;
};






