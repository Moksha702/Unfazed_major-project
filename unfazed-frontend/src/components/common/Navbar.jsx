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
    free: { label: 'Free Plan', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    growth: { label: 'Growth Plan', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    pro: { label: 'Pro Clinic', color: 'bg-purple-100 text-purple-700 border-purple-200' }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-100">
                  %
                </div>
                <div>
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    UNFAZED
                  </span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Therapist OS
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
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer hover:shadow-xs transition-all ${
                  tierBadges[currentTier]?.color || tierBadges.free.color
                }`}
                title="Click to change subscription plan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {tierBadges[currentTier]?.label || 'Free'}
                <span className="text-[10px] underline ml-0.5">Upgrade</span>
              </button>

              {/* Public Branded Page link */}
              {user?.slug && (
                <a
                  href={`/${user.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  <span>unfazed.in/{user.slug}</span>
                </a>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                  {user?.name ? user.name.charAt(0) : 'T'}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 pt-2 pb-4 space-y-2 bg-white shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user?.slug && (
                <a
                  href={`/${user.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-medium text-indigo-600 px-3 py-2"
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
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700"
              >
                <Sparkles className="w-4 h-4" />
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
