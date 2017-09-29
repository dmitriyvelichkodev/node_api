const express = require('express');

const organizationsCtrl = require('../controllers/organizations.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
    /**
     * POST /api/organizations - Create new organizations with relations
     */
    .post(organizationsCtrl.createOrganizationsNetwork);

router.route('/:name/relations')
    /**
     * GET /api/organizations/:name/relations - Get list of relations for
     * organization with :name
     */
    .get(organizationsCtrl.getAllRelations);

module.exports = router;
