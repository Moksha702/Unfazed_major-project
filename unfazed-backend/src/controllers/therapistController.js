const Therapist = require('../models/Therapist');
const Package = require('../models/Package');
const Session = require('../models/Session');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const { slugify } = require('../utils/generateSlug');

/**
 * @desc Get public branded therapist profile by slug (e.g., /dr-sharma)
 * @route GET /api/therapists/public/:slug
 */
const getPublicProfileBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() }).select('-password_hash');

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }

    // Get active packages if available
    const packages = await Package.find({ therapist_id: therapist._id, isActive: true });

    // OpenGraph meta structure for rich shareability
    const metaTags = {
      title: `${therapist.name} | Licensed Therapist on Unfazed`,
      description: therapist.bio || `Book a therapy session with ${therapist.name}. Specializing in ${therapist.specializations.join(', ')}.`,
      url: `https://unfazed.in/${therapist.slug}`,
      image: therapist.avatarUrl || 'https://images.unsplash.com/photo-1594824813572-c5112beec021?w=800&auto=format&fit=crop&q=80'
    };

    res.json({
      success: true,
      therapist,
      packages,
      metaTags
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Check if a slug is available
 * @route GET /api/therapists/check-slug/:slug
 */
const checkSlugAvailable = async (req, res, next) => {
  try {
    const testSlug = slugify(req.params.slug);
    const existing = await Therapist.findOne({ slug: testSlug });
    res.json({
      success: true,
      slug: testSlug,
      available: !existing
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get therapist dashboard metrics
 * @route GET /api/therapists/dashboard-summary
 */
const getTherapistDashboardSummary = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      activeClientsCount,
      todaySessionsCount,
      upcomingSessions,
      paymentsSummary
    ] = await Promise.all([
      Client.countDocuments({ therapist_id: therapistId, status: 'active' }),
      Session.countDocuments({
        therapist_id: therapistId,
        startTime: { $gte: startOfToday, $lte: endOfToday },
        status: { $ne: 'cancelled' }
      }),
      Session.find({
        therapist_id: therapistId,
        startTime: { $gte: startOfToday },
        status: 'scheduled'
      })
        .populate('client_id', 'name email phone')
        .sort({ startTime: 1 })
        .limit(5),
      Payment.aggregate([
        { $match: { therapist_id: therapistId, status: 'captured' } },
        { $group: { _id: null, totalEarnings: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    const totalEarnings = paymentsSummary[0]?.totalEarnings || 0;

    res.json({
      success: true,
      summary: {
        activeClients: activeClientsCount,
        todaySessions: todaySessionsCount,
        upcomingSessions,
        totalEarnings,
        currency: req.therapist.currency || 'INR'
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicProfileBySlug,
  checkSlugAvailable,
  getTherapistDashboardSummary
};
