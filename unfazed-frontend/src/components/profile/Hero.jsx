import React from 'react';
import { ShieldCheck, Award, Clock, Globe } from 'lucide-react';
import Button from '../common/Button';

const Hero = ({ therapist, onBookClick }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl mb-10">
      {/* Decorative gradient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Therapist Profile Picture */}
        <div className="relative shrink-0">
          <img
            src={
              therapist?.avatarUrl ||
              'https://images.unsplash.com/photo-1594824813572-c5112beec021?w=800&auto=format&fit=crop&q=80'
            }
            alt={therapist?.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white/10 shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Accepting Clients
          </div>
        </div>

        {/* Bio & Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-medium mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Healthcare Practitioner</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            {therapist?.name}
          </h1>

          <p className="text-indigo-200 text-sm md:text-base font-medium mb-4">
            {therapist?.qualifications}
          </p>

          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mb-6">
            {therapist?.bio ||
              'Dedicated to guiding individuals towards emotional clarity, mindful calm, and mental wellness through scientifically validated modalities.'}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 mb-6">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{therapist?.experienceYears || 5}+ Years Experience</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>60 Min Sessions</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{(therapist?.languages || ['English']).join(', ')}</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Button
              onClick={onBookClick}
              size="lg"
              className="bg-white text-indigo-950 hover:bg-slate-100 font-bold shadow-lg"
            >
              Book an Appointment • ₹{therapist?.hourlyRate}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
