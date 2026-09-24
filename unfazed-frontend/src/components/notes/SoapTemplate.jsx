import React from 'react';

const SoapTemplate = ({ soapData, onChange }) => {
  const fields = [
    { key: 'subjective', label: 'Subjective (S)', placeholder: "Client's reported symptoms, emotional state, complaints, and quotes..." },
    { key: 'objective', label: 'Objective (O)', placeholder: 'Clinician observations: affect, behavior, speech, alertness, physical indicators...' },
    { key: 'assessment', label: 'Assessment (A)', placeholder: 'Diagnostic impressions, symptom progress, behavioral patterns identified...' },
    { key: 'plan', label: 'Plan (P)', placeholder: 'Interventions, homework/practices assigned, next session objectives...' }
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {f.label}
          </label>
          <textarea
            rows={3}
            value={soapData[f.key] || ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      ))}
    </div>
  );
};

export default SoapTemplate;
