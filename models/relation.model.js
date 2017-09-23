const db = require('./db'),
    Organization = require('./organization.model');

const Relation = db.sequelize.define('Relation', {}, {
    timestamps: false,
    underscored: false,
});

Relation.belongsTo(Organization,
    {foreignKey: {name: 'ParentName', allowNull: false}, onDelete: 'CASCADE'});
Relation.belongsTo(Organization,
    {foreignKey: {name: 'DaughterName', allowNull: false}, onDelete: 'CASCADE'});

module.exports = Relation;
