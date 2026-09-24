import React, { useState } from 'react';
import SoapTemplate from './SoapTemplate';
import Button from '../common/Button';
import { Lock, Users, Sparkles, Check } from 'lucide-react';
import { useEntitlement } from '../../hooks/useEntitlement';
import UpgradeModal from '../common/UpgradeModal';

const NoteEditor = ({ sessionId, clientId, onSave, onCancel, initialData = null }) => {
  const { canAccess } = useEntitlement();
  const [type, setType] = useState(initialData?.type || 'private');
  const [title, setTitle] = useState(initialData?.title || '');
  const [format, setFormat] = useState(initialData?.format || 'freeform');
  const [content, setContent] = useState(initialData?.content || '');
  const [soapData, setSoapData] = useState(initialData?.soapData || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const handleSoapChange = (field, value) => {
    setSoapData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormatSelect = (newFormat) => {
    if (newFormat === 'soap' || newFormat === 'dap') {
      const check = canAccess('note_template', { template: newFormat });
      if (!check.allowed) {
        setUpgradeReason(check.reason);
        setShowUpgradeModal(true);
        return;
      }
    }
    setFormat(newFormat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({
        sessionId,
        clientId,
        type,
        title: title || (type === 'private' ? 'Confidential Clinical Record' : 'Shared Action Plan'),
        format,
        content: format === 'freeform' ? content : '',
        soapData: format === 'soap' ? soapData : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* Type Toggle: Private vs Shared */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Access Visibility Firewall
            </label>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setType('private')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'private'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Private (Therapist Only)
              </button>
              <button
                type="button"
                onClick={() => setType('shared')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  type === 'shared'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Shared (Visible to Client)
              </button>
            </div>
          </div>

          {/* Note Format Selectors */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Template Structure
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFormatSelect('freeform')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  format === 'freeform'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Freeform Editor
              </button>
              <button
                type="button"
                onClick={() => handleFormatSelect('soap')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  format === 'soap'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                SOAP Template
              </button>
            </div>
          </div>
        </div>

        {/* Note Title */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'private' ? 'e.g. Session 3 Diagnosis & Symptom Assessment' : 'e.g. Action Items & Reflection'}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Note Body */}
        {format === 'soap' ? (
          <SoapTemplate soapData={soapData} onChange={handleSoapChange} />
        ) : (
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Observations & Notes
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record therapeutic observations, breakthroughs, or homework assignments..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel
            </Button>
          )}
          <Button type="submit" loading={loading} variant="primary" size="sm">
            Save Note
          </Button>
        </div>
      </form>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureReason={upgradeReason}
        recommendedTier="growth"
      />
    </>
  );
};

export default NoteEditor;
