const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const { generateUniqueSlug } = require('../utils/generateSlug');
const { getEntitlementSummary } = require('../services/entitlementService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'unfazed_super_secret_jwt_key_2026_safe_dev', {
    expiresIn: '30d'
  });
};

/**
 * @desc Register new therapist
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, specializations, hourlyRate, qualifications } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await Therapist.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Generate unique branded link slug
    const slug = await generateUniqueSlug(name, Therapist);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      slug,
      specializations: specializations || ['Anxiety', 'CBT', 'Stress Management'],
      hourlyRate: hourlyRate || 1500,
      qualifications: qualifications || 'Licensed Clinical Psychologist',
      tier: 'free'
    });

    // Create default availability schedule
    await Availability.create({
      therapist_id: therapist._id
    });

    const token = generateToken(therapist._id);
    const entitlementSummary = await getEntitlementSummary(therapist._id);

    res.status(201).json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        tier: therapist.tier,
        hourlyRate: therapist.hourlyRate,
        specializations: therapist.specializations
      },
      entitlements: entitlementSummary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Authenticate therapist & return JWT
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const therapist = await Therapist.findOne({ email: email.toLowerCase() });
    if (!therapist) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, therapist.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(therapist._id);
    const entitlementSummary = await getEntitlementSummary(therapist._id);

    res.json({
      success: true,
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        tier: therapist.tier,
        hourlyRate: therapist.hourlyRate,
        specializations: therapist.specializations,
        bio: therapist.bio,
        languages: therapist.languages,
        qualifications: therapist.qualifications,
        experienceYears: therapist.experienceYears,
        avatarUrl: therapist.avatarUrl,
        customTheme: therapist.customTheme
      },
      entitlements: entitlementSummary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get currently logged-in therapist + fresh entitlements
 * @route GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const therapist = req.therapist;
    const entitlementSummary = await getEntitlementSummary(therapist._id);

    res.json({
      success: true,
      therapist,
      entitlements: entitlementSummary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update therapist profile
 * @route PUT /api/auth/me
 */
const updateMe = async (req, res, next) => {
  try {
    const updates = req.body;
    // Don't allow direct password_hash update here
    delete updates.password_hash;
    delete updates.email;

    // If updating slug, check uniqueness
    if (updates.slug && updates.slug !== req.therapist.slug) {
      const conflict = await Therapist.findOne({ slug: updates.slug, _id: { $ne: req.therapist._id } });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'This branded URL slug is already taken' });
      }
    }

    const updated = await Therapist.findByIdAndUpdate(req.therapist._id, updates, {
      new: true,
      runValidators: true
    }).select('-password_hash');

    const entitlementSummary = await getEntitlementSummary(updated._id);

    res.json({
      success: true,
      therapist: updated,
      entitlements: entitlementSummary
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Upgrade / switch tier (demo / admin)
 * @route POST /api/auth/switch-tier
 */
const switchTier = async (req, res, next) => {
  try {
    const { tier } = req.body;
    if (!['free', 'growth', 'pro'].includes(tier)) {
      return res.status(400).json({ success: false, message: 'Invalid tier specified' });
    }

    req.therapist.tier = tier;
    await req.therapist.save();

    const entitlementSummary = await getEntitlementSummary(req.therapist._id);

    res.json({
      success: true,
      message: `Tier upgraded to ${tier.toUpperCase()}`,
      therapist: req.therapist,
      entitlements: entitlementSummary
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  switchTier
};
