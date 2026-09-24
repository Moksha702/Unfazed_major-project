import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import StatCard from '../../components/analytics/StatCard';
import RevenueChart from '../../components/analytics/RevenueChart';
import Loader from '../../components/common/Loader';
import { DollarSign, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loader size="lg" text="Calculating database aggregation pipelines..." />;

  const { metrics, revenueTrend, clientRetention } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Practice Business Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics computed directly via MongoDB aggregation framework.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Practice Revenue"
          value={`₹${(metrics?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Processed through gateway"
          icon={DollarSign}
          trend="+18%"
          color="indigo"
        />
        <StatCard
          title="Active Client Base"
          value={metrics?.activeClients || 0}
          subtitle="Currently enrolled clients"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="No-Show Rate"
          value={`${metrics?.noShowRate || 0}%`}
          subtitle="Of all scheduled sessions"
          icon={AlertTriangle}
          color={Number(metrics?.noShowRate) > 10 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Session Completion"
          value={`${metrics?.completionRate || 0}%`}
          subtitle="Successfully conducted"
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Revenue Trend Chart & Session Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monthly Revenue Trend</h2>
              <p className="text-xs text-slate-500">Gross transaction earnings grouped by month</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Aggregated from Payments
            </span>
          </div>

          <RevenueChart data={revenueTrend} />
        </div>

        {/* Session Status Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Session Outcomes</h2>
          <p className="text-xs text-slate-500 mb-6">Pipeline status breakdown</p>

          <div className="space-y-4">
            {[
              { label: 'Completed', count: metrics?.sessionDistribution?.completed || 0, color: 'bg-emerald-500' },
              { label: 'Upcoming Scheduled', count: metrics?.sessionDistribution?.scheduled || 0, color: 'bg-indigo-500' },
              { label: 'No-Shows', count: metrics?.sessionDistribution?.noShows || 0, color: 'bg-rose-500' },
              { label: 'Cancelled', count: metrics?.sessionDistribution?.cancelled || 0, color: 'bg-slate-400' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${stat.color}`} />
                  <span className="text-xs font-semibold text-slate-700">{stat.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{stat.count}</span>
              </div>
            ))}
          </div>

          {/* Client Retention Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Top Client Continuity
            </h3>
            <div className="space-y-2">
              {(clientRetention || []).map((ret, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{ret.clientName}</span>
                  <span className="font-bold text-indigo-600">{ret.completedSessions} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
