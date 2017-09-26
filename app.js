const express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    httpStatus = require('http-status'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

const api = require('./routes/api.routes'),
    er = require('./helpers/errors'),
    config = require('./config/index');

const app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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
