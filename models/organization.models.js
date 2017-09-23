module.exports = db => {

    const Organization = db.sequelize.define('Organization', {
        name: {
            type: db.Sequelize.STRING,
            primaryKey: true
        }
    }, {
        timestamps: false,
        underscored: false,
    });

    return Organization;
};