/**
 * Credit Notes Routes
 * RESTful API endpoints for customer credit notes
 */

const express = require('express');
const router = express.Router();
const creditNotesController = require('../controllers/creditNotesController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/credit-notes - List all credit notes with filters
router.get('/', creditNotesController.getAllCreditNotes);

// GET /api/credit-notes/:id - Get single credit note
router.get('/:id', creditNotesController.getCreditNote);

// POST /api/credit-notes - Create new credit note
router.post('/', creditNotesController.createCreditNote);

// POST /api/credit-notes/:id/issue - Issue credit note
router.post('/:id/issue', creditNotesController.issueCreditNote);

// POST /api/credit-notes/:id/apply - Apply credit note to invoice
router.post('/:id/apply', creditNotesController.applyCreditNote);

// POST /api/credit-notes/:id/void - Void credit note
router.post('/:id/void', creditNotesController.voidCreditNote);

module.exports = router;
