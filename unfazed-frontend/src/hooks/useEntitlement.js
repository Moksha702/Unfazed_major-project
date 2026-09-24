import { useAuth } from '../context/AuthContext';

/**
 * Hook to enforce centralized feature gating on frontend components
 * Avoids any hardcoded tier checks in UI components!
 */
export const useEntitlement = () => {
  const { entitlements, user } = useAuth();

  const canAccess = (featureKey, context = {}) => {
    if (!entitlements) {
      return { allowed: true };
    }

    switch (featureKey) {
      case 'add_client': {
        const usage = entitlements.usage?.activeClients;
        if (usage && usage.current >= usage.max) {
          return {
            allowed: false,
            reason: `You've reached your limit of ${usage.max} active clients on the ${entitlements.tierName} plan.`,
            current: usage.current,
            limit: usage.max,
            upgradeTier: user?.tier === 'free' ? 'growth' : 'pro'
          };
        }
        return {
          allowed: true,
          current: usage?.current || 0,
          limit: usage?.max || 5
        };
      }

      case 'note_template': {
        const requested = context.template || 'soap';
        const allowedTemplates = entitlements.features?.allowedNoteTemplates || ['freeform'];
        const allowed = allowedTemplates.includes(requested);
        return {
          allowed,
          reason: allowed ? '' : `Structured ${requested.toUpperCase()} notes require the Growth or Pro plan.`,
          upgradeTier: 'growth'
        };
      }

      case 'packages': {
        const allowed = !!entitlements.features?.canAccessPackages;
        return {
          allowed,
          reason: allowed ? '' : 'Creating multi-session discount packages requires a Growth or Pro plan.',
          upgradeTier: 'growth'
        };
      }

      case 'advanced_analytics': {
        const allowed = ['advanced', 'full'].includes(entitlements.features?.analyticsDepth);
        return {
          allowed,
          reason: allowed ? '' : 'Advanced retention and cancellation forecasting requires an upgraded plan.',
          upgradeTier: 'growth'
        };
      }

      default:
        return { allowed: true };
    }
  };

  return {
    canAccess,
    tier: entitlements?.tier || 'free',
    tierName: entitlements?.tierName || 'Free Plan',
    entitlements
  };
};

export default useEntitlement;
