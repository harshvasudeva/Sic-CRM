/**
 * Debit Notes Routes
 * RESTful API endpoints for vendor debit notes
 */

const express = require('express');
const router = express.Router();
const debitNotesController = require('../controllers/debitNotesController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/debit-notes - List all debit notes with filters
router.get('/', debitNotesController.getAllDebitNotes);

// GET /api/debit-notes/:id - Get single debit note
router.get('/:id', debitNotesController.getDebitNote);

// POST /api/debit-notes - Create new debit note
router.post('/', debitNotesController.createDebitNote);

// POST /api/debit-notes/:id/issue - Issue debit note
router.post('/:id/issue', debitNotesController.issueDebitNote);

// POST /api/debit-notes/:id/apply - Apply debit note to bill
router.post('/:id/apply', debitNotesController.applyDebitNote);

// POST /api/debit-notes/:id/void - Void debit note
router.post('/:id/void', debitNotesController.voidDebitNote);

module.exports = router;
