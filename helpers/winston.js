/**
 * Provides extensive winston logger with transports pipes
 * @module errors
 */
const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true,
        }),
    ],
});

module.exports = logger;
