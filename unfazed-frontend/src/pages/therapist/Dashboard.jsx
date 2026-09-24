import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import UpgradeModal from '../../components/common/UpgradeModal';
import {
  Calendar,
  Users,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Video,
  Sparkles,
  ArrowRight,
  BellRing,
  Lock
} from 'lucide-react';

const Dashboard = () => {
  const { user, entitlements } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, notifRes] = await Promise.all([
          axiosInstance.get('/therapists/dashboard-summary'),
          axiosInstance.get('/analytics/notifications-log')
        ]);

        if (sumRes.data.success) setSummary(sumRes.data.summary);
        if (notifRes.data.success) setNotificationLogs(notifRes.data.logs || []);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/${user?.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loader size="lg" text="Loading practice dashboard..." />;

  const clientUsage = entitlements?.usage?.activeClients || { current: summary?.activeClients || 0, max: 5, percentage: 40 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Branded Link Hero Card */}
      <div className="bg-gradient-to-r from-orange-800 via-orange-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Practice Management Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Welcome back, {user?.name}!</h1>
          <p className="text-amber-200 text-xs sm:text-sm mt-1 max-w-xl">
            Your single branded link is live. Share it with prospective clients on WhatsApp, Instagram, or email.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white">
              <span className="font-mono text-amber-300">unfazed.in/{user?.slug}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-stone-950 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={`/${user?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/60 hover:bg-orange-500 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Public Page
            </a>
          </div>
        </div>

        {/* Client Entitlement Meter */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-200">Active Client Capacity</span>
            <span className="text-xs font-black text-white">
              {clientUsage.current} / {clientUsage.max}
            </span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${
                clientUsage.percentage > 80 ? 'bg-amber-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, clientUsage.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-200 capitalize">{entitlements?.tierName || 'Free Plan'}</span>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-white font-bold underline hover:text-amber-200 cursor-pointer"
            >
              Upgrade Tier
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Today's Appointments"
          value={summary?.todaySessions || 0}
          subtitle="sessions scheduled today"
          icon={Calendar}
          color="orange"
        />
        <StatCard
          title="Active Clients"
          value={summary?.activeClients || 0}
          subtitle={`under ${entitlements?.tierName || 'Free'} limits`}
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Total Gross Earnings"
          value={`₹${(summary?.totalEarnings || 0).toLocaleString('en-IN')}`}
          subtitle="processed via Razorpay"
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Subscription Tier"
          value={(user?.tier || 'free').toUpperCase()}
          subtitle="central entitlement gated"
          icon={Lock}
          color="amber"
        />
      </div>

      {/* Two Column Layout: Upcoming Sessions + Notification Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Appointments</h2>
              <p className="text-xs text-slate-500">Scheduled clinical sessions with clients</p>
            </div>
            <Link
              to="/dashboard/schedule"
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <span>Manage Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!summary?.upcomingSessions || summary.upcomingSessions.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No upcoming sessions today</p>
                <p className="text-xs text-slate-400 mt-1">
                  Share your public booking link to allow clients to schedule.
                </p>
              </div>
            ) : (
              summary.upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-amber-200 hover:bg-slate-50/50 transition-all gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-orange-600 font-bold flex items-center justify-center shrink-0">
                      {session.client_id?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {session.client_id?.name || 'Client'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {new Date(session.startTime).toLocaleString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • {session.durationMinutes} min consultation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={session.meetingLink || 'https://meet.jit.si/unfazed-demo'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 shadow-sm transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video Call
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: WhatsApp / Email Event Dispatch Stream */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-orange-500" />
                Notification Stream
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Stub Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Automated WhatsApp & Email triggers logged on domain events
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {notificationLogs.length === 0 ? (
                <p className="text-xs text-slate-400">No events dispatched yet.</p>
              ) : (
                notificationLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11px]">{log.recipientName}</span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{log.messageBody}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.2 rounded">
                      {log.eventType}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Integrated with Nodemailer + WhatsApp Business Event Architecture
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default Dashboard;
