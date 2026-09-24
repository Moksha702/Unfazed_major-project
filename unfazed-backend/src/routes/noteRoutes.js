const express = require('express');
const router = express.Router();
const {
  getSessionNotes,
  getClientSharedNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const { requireEntitlement } = require('../middleware/entitlementMiddleware');

// Client-accessible shared notes only (firewalled)
router.get('/client-shared/:clientId', getClientSharedNotes);

// Protected therapist clinical documentation routes
router.use(protect);
router.get('/session/:sessionId', getSessionNotes);
router.post('/', requireEntitlement('note_template'), createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
