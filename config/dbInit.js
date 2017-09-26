const config = require('config'),
    debug = require('debug')('test-node:server'),
    mysql = require('promise-mysql');

const dbConfig = config.get('db');

const creatingConnection = () => {
    return mysql.createConnection({
            host: dbConfig.get('host'),
            user: dbConfig.get('user'),
            password: dbConfig.get('password'),
            port: dbConfig.get('port')
        })
        .then(conn => {
            debug("Connected to mysql for pre configuration");
            return conn;
        })
};

const creatingDatabase = conn => {
    return conn.query('CREATE DATABASE IF NOT EXISTS ' + dbConfig.get("dbName"))
        .then(() => {
            debug("Database: " + dbConfig.get("dbName") + " was created");
            return conn.end();
        })
};

const syncingModels = () => {
    const models = require('../models/models');
    return models.db.sequelize.sync();
};

// Sequilize doesn't support creating database while or before establishing connection to mysql db,
// also creates connection only to pointed database. In that way just make additional
// connection before start server to ensure that database from config exists.
const init = () => Promise.resolve()
    .then(creatingConnection)
    .then(creatingDatabase)
    .then(syncingModels);


module.exports = {
    init: init,
    creatingConnection: creatingConnection,
    creatingDatabase: creatingDatabase,
    syncingModels: syncingModels
};

