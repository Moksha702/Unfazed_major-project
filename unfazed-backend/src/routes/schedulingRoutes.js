const express = require('express');
const router = express.Router();
const {
  getAvailability,
  updateAvailability,
  getPublicAvailableSlots,
  bookSlot,
  getSessions,
  updateSessionStatus
} = require('../controllers/schedulingController');
const { protect } = require('../middleware/authMiddleware');

// Public booking routes
router.get('/public-slots/:slug', getPublicAvailableSlots);
router.post('/book', bookSlot);

// Protected therapist scheduling routes
router.use(protect);
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);
router.get('/sessions', getSessions);
router.put('/sessions/:id', updateSessionStatus);

module.exports = router;
