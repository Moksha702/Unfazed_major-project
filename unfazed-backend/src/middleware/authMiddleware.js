const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unfazed_super_secret_jwt_key_2026_safe_dev');
    const therapist = await Therapist.findById(decoded.id).select('-password_hash');

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: 'Therapist associated with this token no longer exists.'
      });
    }

    req.therapist = therapist;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session token expired or invalid.'
    });
  }
};

module.exports = {
  protect
};
