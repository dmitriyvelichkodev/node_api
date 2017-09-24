const express = require('express');

const organizationsRoutes = require('./api.organizations.routes');

const router = express.Router();

// mount organizations routes at /organizations for api
router.use('/organizations', organizationsRoutes);

module.exports = router;