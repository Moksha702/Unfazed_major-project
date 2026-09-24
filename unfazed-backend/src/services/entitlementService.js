const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const SubscriptionTierConfig = require('../models/SubscriptionTierConfig');

// Default fallback configuration in case DB is not yet seeded
const DEFAULT_CONFIGS = {
  free: {
    tier: 'free',
    name: 'Starter / Free',
    monthlyPrice: 0,
    activeClientCap: 5,
    allowedNoteTemplates: ['freeform'],
    analyticsDepth: 'basic',
    customBranding: false,
    canExportInvoices: true,
    canAccessChat: true,
    canAccessPackages: false
  },
  growth: {
    tier: 'growth',
    name: 'Growth Practice',
    monthlyPrice: 1999,
    activeClientCap: 25,
    allowedNoteTemplates: ['freeform', 'soap'],
    analyticsDepth: 'advanced',
    customBranding: true,
    canExportInvoices: true,
    canAccessChat: true,
    canAccessPackages: true
  },
  pro: {
    tier: 'pro',
    name: 'Pro Clinic',
    monthlyPrice: 4999,
    activeClientCap: 1000,
    allowedNoteTemplates: ['freeform', 'soap', 'dap'],
    analyticsDepth: 'full',
    customBranding: true,
    canExportInvoices: true,
    canAccessChat: true,
    canAccessPackages: true
  }
};

/**
 * Get the full tier config for a therapist
 */
const getTherapistTierConfig = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).select('tier');
  const tierKey = therapist?.tier || 'free';

  let config = await SubscriptionTierConfig.findOne({ tier: tierKey });
  if (!config) {
    config = DEFAULT_CONFIGS[tierKey] || DEFAULT_CONFIGS.free;
  }
  return config;
};

/**
 * Single source of truth for feature access across the system:
 * canAccess(therapistId, featureKey, context)
 * Returns { allowed: boolean, reason?: string, currentUsage?: number, limit?: number, tier?: string }
 */
const canAccess = async (therapistId, featureKey, context = {}) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    return { allowed: false, reason: 'Therapist not found' };
  }

  const tierConfig = await getTherapistTierConfig(therapistId);
  const currentTier = therapist.tier || 'free';

  switch (featureKey) {
    case 'add_client': {
      // Check active client count against tier cap
      const activeCount = await Client.countDocuments({
        therapist_id: therapistId,
        status: 'active'
      });
      const cap = tierConfig.activeClientCap;
      if (activeCount >= cap) {
        return {
          allowed: false,
          featureKey,
          reason: `You have reached the limit of ${cap} active clients for your ${tierConfig.name} plan. Upgrade to add more clients.`,
          currentUsage: activeCount,
          limit: cap,
          tier: currentTier,
          upgradeRecommended: currentTier === 'free' ? 'growth' : 'pro'
        };
      }
      return {
        allowed: true,
        featureKey,
        currentUsage: activeCount,
        limit: cap,
        tier: currentTier
      };
    }

    case 'note_template': {
      const requestedTemplate = context.template || 'freeform';
      const allowedTemplates = tierConfig.allowedNoteTemplates || ['freeform'];
      if (!allowedTemplates.includes(requestedTemplate)) {
        return {
          allowed: false,
          featureKey,
          reason: `The '${requestedTemplate.toUpperCase()}' template is not available on your ${tierConfig.name} plan. Upgrade to unlock structured SOAP/DAP clinical notes.`,
          tier: currentTier,
          upgradeRecommended: 'growth'
        };
      }
      return { allowed: true, featureKey, tier: currentTier };
    }

    case 'advanced_analytics': {
      const allowed = ['advanced', 'full'].includes(tierConfig.analyticsDepth);
      if (!allowed) {
        return {
          allowed: false,
          featureKey,
          reason: `Advanced revenue forecasting and no-show trend analytics require the Growth or Pro plan.`,
          tier: currentTier,
          upgradeRecommended: 'growth'
        };
      }
      return { allowed: true, featureKey, tier: currentTier };
    }

    case 'packages': {
      if (!tierConfig.canAccessPackages) {
        return {
          allowed: false,
          featureKey,
          reason: `Creating multi-session discount packages is available on the Growth and Pro plans.`,
          tier: currentTier,
          upgradeRecommended: 'growth'
        };
      }
      return { allowed: true, featureKey, tier: currentTier };
    }

    case 'custom_branding': {
      if (!tierConfig.customBranding) {
        return {
          allowed: false,
          featureKey,
          reason: `Custom branding and themes are available on Growth and Pro plans.`,
          tier: currentTier,
          upgradeRecommended: 'growth'
        };
      }
      return { allowed: true, featureKey, tier: currentTier };
    }

    default:
      return { allowed: true, featureKey, tier: currentTier };
  }
};

/**
 * Get comprehensive entitlement status for the frontend dashboard
 */
const getEntitlementSummary = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) return null;

  const tierConfig = await getTherapistTierConfig(therapistId);
  const activeClientsCount = await Client.countDocuments({
    therapist_id: therapistId,
    status: 'active'
  });

  return {
    tier: therapist.tier || 'free',
    tierName: tierConfig.name,
    monthlyPrice: tierConfig.monthlyPrice,
    usage: {
      activeClients: {
        current: activeClientsCount,
        max: tierConfig.activeClientCap,
        percentage: Math.min(100, Math.round((activeClientsCount / tierConfig.activeClientCap) * 100))
      }
    },
    features: {
      allowedNoteTemplates: tierConfig.allowedNoteTemplates,
      analyticsDepth: tierConfig.analyticsDepth,
      customBranding: tierConfig.customBranding,
      canAccessPackages: tierConfig.canAccessPackages,
      canAccessChat: tierConfig.canAccessChat
    }
  };
};

module.exports = {
  canAccess,
  getTherapistTierConfig,
  getEntitlementSummary,
  DEFAULT_CONFIGS
};
