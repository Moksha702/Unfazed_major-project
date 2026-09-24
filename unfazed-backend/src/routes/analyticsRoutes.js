const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { getNotificationLogs } = require('../services/notificationService');

router.use(protect);
router.get('/', getAnalytics);

// Notification audit log view for therapist (WhatsApp/email event stream)
router.get('/notifications-log', (req, res) => {
  res.json({
    success: true,
    logs: getNotificationLogs()
  });
});

module.exports = router;
