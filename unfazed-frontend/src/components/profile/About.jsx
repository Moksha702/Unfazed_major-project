import React from 'react';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const About = ({ therapist }) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-indigo-600" />
        Clinical Focus & Specializations
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Primary Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(therapist?.specializations || []).map((spec, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-100 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            What to Expect in Session
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>100% confidential, non-judgmental environment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Evidence-based clinical techniques (CBT, Mindfulness)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Actionable takeaways and weekly reflection frameworks</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
