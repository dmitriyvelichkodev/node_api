const Sequelize = require('sequelize');
const config = require('config');

const dbConfig = config.get('db');

const sequelize = new Sequelize(
    dbConfig.get('dbName'),
    dbConfig.get('user'),
    dbConfig.get('password'), {
        host: dbConfig.get('host'),
        port: dbConfig.get('port'),
        dialect: dbConfig.get('dialect'),
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        timezone: 'UTC',
    }
);

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
};

const Organization = require('./organization.models')(db);
const Relation = require('./relation.models')(db);

module.exports = {
    db: db,
    Organization: Organization,
    Relation: Relation,
};
