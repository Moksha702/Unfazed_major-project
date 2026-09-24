import React, { useState } from 'react';
import { Calendar, CreditCard, FileText, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

const ClientCard = ({ clientDetail, onBack, onStartChat }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!clientDetail) return null;

  const { client, sessions = [], payments = [], notes = [] } = clientDetail;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Client Profile Header */}
      <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Back to Clients"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">{client.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {client.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {client.email} {client.phone && `• ${client.phone}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onStartChat(client)}
            variant="primary"
            size="sm"
            className="bg-amber-500 hover:bg-orange-500"
          >
            Open Live Chat
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50">
        {[
          { id: 'overview', label: 'Intake & History' },
          { id: 'sessions', label: `Sessions (${sessions.length})` },
          { id: 'notes', label: `Clinical Notes (${notes.length})` },
          { id: 'payments', label: `Billing & Invoices (${payments.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="p-6 md:p-8">
        {/* 1. Overview & Intake */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Intake Demographics</h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-400">Age</dt>
                    <dd className="font-semibold text-slate-700">{client.intakeData?.age || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Gender</dt>
                    <dd className="font-semibold text-slate-700">{client.intakeData?.gender || 'Not specified'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-400">Emergency Contact</dt>
                    <dd className="font-semibold text-slate-700">
                      {client.intakeData?.emergencyContact?.name
                        ? `${client.intakeData.emergencyContact.name} (${client.intakeData.emergencyContact.relationship}) - ${client.intakeData.emergencyContact.phone}`
                        : 'None provided'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Informed Consent & Compliance Record
                </h3>
                {client.consentAgreed ? (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-amber-700">✓ Digital Telehealth Consent Form Executed</p>
                    <p className="text-slate-400 text-[11px]">
                      Timestamp: {new Date(client.consentTimestamp).toLocaleString('en-IN')}
                    </p>
                    <p className="text-slate-400 text-[11px]">Record ID: {client._id}</p>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">
                    Consent form is pending signature by client.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Presenting Clinical Concern</h3>
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-slate-700 leading-relaxed">
                {client.intakeData?.presentingConcern || 'No intake details entered yet.'}
              </div>
            </div>
          </div>
        )}

        {/* 2. Sessions History */}
        {activeTab === 'sessions' && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400">No sessions recorded yet for this client.</p>
            ) : (
              sessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 text-orange-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {new Date(s.startTime).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.durationMinutes} mins
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Clinical Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400">No notes written for this client yet.</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note._id}
                  className={`p-4 rounded-2xl border ${
                    note.type === 'private'
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-amber-50/30 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        note.type === 'private'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {note.type === 'private' ? '🔒 Private Note (Therapist Only)' : '👥 Shared with Client'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{note.title}</h4>
                  {note.format === 'soap' && note.soapData ? (
                    <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
                      <p><strong>S:</strong> {note.soapData.subjective}</p>
                      <p><strong>O:</strong> {note.soapData.objective}</p>
                      <p><strong>A:</strong> {note.soapData.assessment}</p>
                      <p><strong>P:</strong> {note.soapData.plan}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Billing & Invoices */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400">No payment records found.</p>
            ) : (
              payments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Invoice #{p.invoiceNumber || 'INV-UNFAZED'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString()} • {p.paymentMethod || 'Razorpay Gateway'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">₹{p.amount}</span>
                    <a
                      href={`http://localhost:5000/api/payments/invoice/${p._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-orange-500 font-semibold hover:underline"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
