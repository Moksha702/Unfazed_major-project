import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import { Check, Zap, Sparkles, ShieldCheck } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, featureReason, recommendedTier = 'growth' }) => {
  const { user, switchTier } = useAuth();
  const [updating, setUpdating] = useState(false);

  const tiers = [
    {
      id: 'free',
      name: 'Starter / Free',
      price: '₹0',
      period: 'forever',
      features: ['Up to 5 active clients', 'Freeform session notes', 'Basic appointment booking', 'Manual slot scheduling'],
      current: user?.tier === 'free'
    },
    {
      id: 'growth',
      name: 'Growth Practice',
      price: '₹1,999',
      period: '/month',
      badge: 'Most Popular',
      features: ['Up to 25 active clients', 'Structured SOAP clinical notes', 'Discount session packages', 'Revenue trend analytics', 'In-app chat & WhatsApp stub alerts'],
      current: user?.tier === 'growth'
    },
    {
      id: 'pro',
      name: 'Pro Clinic',
      price: '₹4,999',
      period: '/month',
      badge: 'Full Power',
      features: ['Unlimited active clients (1000+)', 'All note templates (SOAP + DAP)', 'Advanced retention analytics', 'Custom branding & domain', 'Priority support'],
      current: user?.tier === 'pro'
    }
  ];

  const handleSelectTier = async (tierId) => {
    try {
      setUpdating(true);
      await switchTier(tierId);
      setUpdating(false);
      onClose();
    } catch (err) {
      alert('Error updating plan: ' + err.message);
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unlock Practice Capabilities" maxWidth="max-w-3xl">
      {featureReason && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Entitlement Limit Reached</p>
            <p className="text-xs text-amber-700 mt-0.5">{featureReason}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isCurrent = tier.current;
          const isTarget = tier.id === recommendedTier;

          return (
            <div
              key={tier.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isTarget
                  ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400'
                  : isCurrent
                  ? 'border-orange-300 bg-orange-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{tier.name}</h4>
                  {tier.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      {tier.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-3 mb-4">
                  <span className="text-2xl font-black text-slate-900">{tier.price}</span>
                  <span className="text-xs text-slate-500 ml-1">{tier.period}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={isTarget ? 'primary' : isCurrent ? 'secondary' : 'dark'}
                size="sm"
                className="w-full"
                disabled={isCurrent || updating}
                loading={updating}
                onClick={() => handleSelectTier(tier.id)}
              >
                {isCurrent ? 'Current Plan' : `Switch to ${tier.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-amber-500" />
        Config-driven entitlement layer • Instant activation without lock-in
      </div>
    </Modal>
  );
};

export default UpgradeModal;
