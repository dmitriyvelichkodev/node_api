const express = require('express');

const organizationsRoutes = require('./api.organizations.routes');

const router = express.Router(); // eslint-disable-line new-cap


/** GET api/service-check end point for testing service availability*/
router.get('/service-check', (req, res) =>
    res.send({message: 'OK'})
);

// mount organizations routes at /organizations for api
router.use('/organizations', organizationsRoutes);

module.exports = router;
