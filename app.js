const express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    httpStatus = require('http-status'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    rfs = require('rotating-file-stream'),
    fs = require('fs'),
    expressWinston = require('express-winston');

const api = require('./routes/api.routes'),
    er = require('./helpers/errors'),
    config = require('./config/index'),
    winstonInstance =require('./helpers/winston'),
    logDirectory = path.join(__dirname, 'log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

const app = express();


app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//detailed dev logging
if (process.env.NODE_ENV === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        winstonInstance,
        meta: true,
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true //status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
}


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
        stack: config.env === 'development' ? err.stack : {}
    });
    next();
});

module.exports = app;
