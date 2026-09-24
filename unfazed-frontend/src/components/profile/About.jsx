import React from 'react';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

const About = ({ therapist }) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs mb-10">
      <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 font-display">
        <Heart className="w-5 h-5 text-amber-700" />
        Clinical Focus & Specializations
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            Primary Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(therapist?.specializations || []).map((spec, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200/60 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
            What to Expect in Session
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>100% confidential, supportive and non-judgmental environment</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Evidence-based clinical modalities (CBT, Mindfulness, MBSR)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Structured reflection frameworks and actionable takeaways</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
