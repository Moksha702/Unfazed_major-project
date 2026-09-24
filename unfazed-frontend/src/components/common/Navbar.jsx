import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UpgradeModal from './UpgradeModal';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  BarChart3,
  ExternalLink,
  LogOut,
  Sparkles,
  Shield,
  Menu,
  X
} from 'lucide-react';

/* ── Stylized "U" Lettermark Logo ─────────────────────────────────────── */
const UnfazedLogo = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Unfazed logo"
  >
    <defs>
      <linearGradient id="unfazed-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    {/* Rounded square background */}
    <rect width="36" height="36" rx="10" fill="url(#unfazed-grad)" />
    {/* Stylized U lettermark */}
    <path
      d="M10 10 L10 22 C10 27.5 14.5 28 18 28 C21.5 28 26 27.5 26 22 L26 10"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const Navbar = () => {
  const { user, logout, entitlements } = useAuth();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Schedule', to: '/dashboard/schedule', icon: Calendar },
    { label: 'Clients', to: '/dashboard/clients', icon: Users },
    { label: 'Clinical Notes', to: '/dashboard/notes', icon: FileText },
    { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 }
  ];

  const currentTier = user?.tier || 'free';
  const tierBadges = {
    free: { label: 'Free Plan', color: 'bg-stone-100 text-stone-700 border-stone-200' },
    growth: { label: 'Growth Plan', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    pro: { label: 'Pro Clinic', color: 'bg-orange-50 text-orange-800 border-orange-200' }
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <UnfazedLogo />
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-stone-900 font-display">
                    UNFAZED
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                    Therapist Hub
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-50 text-amber-800 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Entitlement Tier Pill */}
              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer hover:shadow-xs transition-all ${
                  tierBadges[currentTier]?.color || tierBadges.free.color
                }`}
                title="Click to view subscription plan details"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {tierBadges[currentTier]?.label || 'Free'}
                <span className="text-[10px] underline ml-0.5 opacity-80">Upgrade</span>
              </button>

              {/* Public Branded Page link */}
              {user?.slug && (
                <a
                  href={`/${user.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-amber-300 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                  <span>unfazed.in/{user.slug}</span>
                </a>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-200">
                  {user?.name ? user.name.charAt(0) : 'T'}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 px-4 pt-2 pb-4 space-y-2 bg-white shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-stone-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              {user?.slug && (
                <a
                  href={`/${user.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-amber-700 px-3 py-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public Link: unfazed.in/{user.slug}
                </a>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowUpgradeModal(true);
                }}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-50 text-amber-800"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Current: {tierBadges[currentTier]?.label} — Upgrade
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-xs font-semibold text-rose-600 px-3 py-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};

export default Navbar;


