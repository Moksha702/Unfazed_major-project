const express = require('express');
const router = express.Router();
const { getPublicProfileBySlug, checkSlugAvailable, getTherapistDashboardSummary } = require('../controllers/therapistController');
const { protect } = require('../middleware/authMiddleware');
const { captureAndDistributeLead } = require('../services/leadDistributionService');

// Public branded link route
router.get('/public/:slug', getPublicProfileBySlug);
router.get('/check-slug/:slug', checkSlugAvailable);

// Public lead submission
router.post('/public/:slug/contact', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const Therapist = require('../models/Therapist');
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) return res.status(404).json({ success: false, message: 'Therapist not found' });

    const lead = await captureAndDistributeLead({
      therapistId: therapist._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message
    });

    res.json({ success: true, message: 'Inquiry received. The therapist will contact you shortly.', lead });
  } catch (err) {
    next(err);
  }
});

// Protected therapist routes
router.get('/dashboard-summary', protect, getTherapistDashboardSummary);

module.exports = router;
