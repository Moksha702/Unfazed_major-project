const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, switchTier } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/switch-tier', protect, switchTier); // Demo / quick tier toggle

module.exports = router;
