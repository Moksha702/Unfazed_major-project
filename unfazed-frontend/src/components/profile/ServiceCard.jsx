import React from 'react';
import { Tag, Calendar, Check, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const ServiceCard = ({ packages = [], hourlyRate = 1500, onSelectPackage, onSelectSingleSession }) => {
  return (
    <div className="mb-10">
      <div className="text-center md:text-left mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Consultation Offerings & Packages</h2>
        <p className="text-slate-500 text-sm mt-1">Choose single session or multi-session continuity plans</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Single Session Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pay as you go</span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Individual Therapy Session</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">One 60-minute confidential 1-on-1 virtual consultation.</p>

            <div className="mb-6">
              <span className="text-3xl font-black text-slate-900">₹{hourlyRate}</span>
              <span className="text-xs text-slate-400 ml-1">/ session</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>60-minute video session</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted client portal access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Shared takeaways & action plan</span>
              </li>
            </ul>
          </div>

          <Button onClick={onSelectSingleSession} variant="secondary" className="w-full">
            Book Single Session
          </Button>
        </div>

        {/* Dynamic Multi-Session Packages */}
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white rounded-2xl p-6 border-2 border-indigo-500 shadow-lg shadow-indigo-50 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Save {pkg.discountPercent || 10}%
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Package Bundle</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Tag className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">{pkg.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-black text-indigo-950">₹{pkg.price}</span>
                <span className="text-xs text-slate-500 ml-1">for {pkg.totalSessions} sessions</span>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  ₹{Math.round(pkg.price / pkg.totalSessions)} / session (Valid {pkg.validityDays} days)
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{pkg.totalSessions} structured 60-min sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Flexible self-scheduling anytime</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ongoing chat support between sessions</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => onSelectPackage(pkg)}
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Select Package</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCard;
