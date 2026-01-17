const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

router.post('/test', setupController.testConnection);
router.post('/save', setupController.saveConfiguration);
router.get('/status', setupController.checkStatus);

module.exports = router;
