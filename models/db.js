const Sequelize = require('sequelize'),
    config = require('config');

const dbConfig = config.get('db');

const sequelize = new Sequelize(
    dbConfig.get('dbName'),
    dbConfig.get('user'),
    dbConfig.get('password'), {
        host: dbConfig.get('host'),
        port: dbConfig.get('port'),
        dialect: dbConfig.get('dialect'),
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        timezone: 'UTC'
    }
);

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
};
