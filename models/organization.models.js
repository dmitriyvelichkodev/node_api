const db = require('./db');

const Organization = db.sequelize.define('organization', {
    name: {
        type: db.Sequelize.STRING,
        primaryKey: true
    }
}, {
    timestamps: false,
    underscored: false,
});

module.exports = Organization;