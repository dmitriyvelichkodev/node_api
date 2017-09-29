const nconf = require('nconf');
const path = require('path');

let configFile = null;

switch (process.env.NODE_ENV) {
    case 'production':
        configFile = './production.json';
        break;
    case 'test':
        configFile = './test.json';
        break;
    default:
        configFile = './development.json';
        process.env.NODE_ENV = 'development';
        break;
}

nconf.argv()
    .env()
    .file({file: path.join(__dirname, configFile)});

module.exports = nconf;
