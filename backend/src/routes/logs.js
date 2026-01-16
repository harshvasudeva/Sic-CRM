const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
// potentially add auth middleware here

router.post('/', logsController.createLog);
router.get('/', logsController.getLogs);

module.exports = router;
