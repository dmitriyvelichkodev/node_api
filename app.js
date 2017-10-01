const express = require('express');
const path = require('path');
const logger = require('morgan');
const httpStatus = require('http-status');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const rfs = require('rotating-file-stream');
const fs = require('fs');
const expressWinston = require('express-winston');
const helmet = require('helmet');

const api = require('./routes/api.routes');
const er = require('./helpers/errors');
const config = require('config');
const winstonInstance =require('./helpers/winston');
const logDirectory = path.join(__dirname, 'log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory,
});

const app = express();


app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// detailed dev logging
if (process.env.NODE_ENV === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        winstonInstance,
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}' +
             ' {{res.responseTime}}ms',
        colorStatus: true, // (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
}

// small middleware for protection, works with headers
app.use(helmet());

// mount all routes on /api path
app.use('/api', api);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new er.APIError('API not found', httpStatus.NOT_FOUND);
    return next(err);
});

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
    const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
    res.status(status);
    res.json({
        message: err.message || httpStatus[status],
        stack: config.env === 'development' ? err.stack : {},
    });
    next();
});

module.exports = app;
