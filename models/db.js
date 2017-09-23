const Sequelize = require('sequelize'),
    config = require('config'),
    debug = require('debug')('test-node:server'),
    mysql = require('promise-mysql');

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

const createDatabase = conn => {
    return conn.query('CREATE DATABASE IF NOT EXISTS ' + dbConfig.get("dbName"))
        .then(() => {
            debug("Database: " + dbConfig.get("dbName") + " was created");
            conn.end();
        })
};

// Sequilize doesn't support creating database while or before connection to mysql db,
// but creates connection only to pointed database. In that way just make additional
// connection before start server to ensure that database from config exists.
const preConfiging = () => mysql.createConnection({
        host: dbConfig.get('host'),
        user: dbConfig.get('user'),
        password: dbConfig.get('password'),
        port: dbConfig.get('port')
    })
    .then(conn => {
        debug("Connected to mysql for pre configuration");
        return conn;
    })
    .then(createDatabase);

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    preConfiging: preConfiging
};
