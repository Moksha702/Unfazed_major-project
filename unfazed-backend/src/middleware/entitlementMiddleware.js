const { canAccess } = require('../services/entitlementService');

/**
 * Higher-order middleware to enforce feature gating via the Entitlement Service
 * @param {string} featureKey e.g. 'add_client', 'note_template', 'advanced_analytics', 'packages'
 */
const requireEntitlement = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.therapist) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const result = await canAccess(req.therapist._id, featureKey, {
        template: req.body?.format,
        ...req.body
      });

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'ENTITLEMENT_RESTRICTION',
          message: result.reason,
          details: {
            featureKey,
            tier: result.tier,
            currentUsage: result.currentUsage,
            limit: result.limit,
            upgradeRecommended: result.upgradeRecommended || 'growth'
          }
        });
      }

      // Feature allowed, proceed
      req.entitlement = result;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  requireEntitlement
};
