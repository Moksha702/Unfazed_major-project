import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ChatWindow from '../../components/chat/ChatWindow';
import Loader from '../../components/common/Loader';
import { Calendar, FileText, Download, MessageSquare, Shield, CheckCircle } from 'lucide-react';

const ClientPortal = () => {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        // Fetch shared notes (firewalled endpoint)
        const notesRes = await axiosInstance.get(`/notes/client-shared/${clientId}`);
        if (notesRes.data.success) {
          setSharedNotes(notesRes.data.notes || []);
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [clientId]);

  if (loading) return <Loader size="lg" text="Loading secure client portal..." />;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Client Telehealth Space</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Your Care Portal</h1>
            <p className="text-xs text-slate-300 mt-1">
              Access shared therapeutic takeaways, action plans, and communicate with your psychologist.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Client ID:</span>
            <span className="font-mono text-xs text-indigo-300 bg-white/10 px-2 py-1 rounded-lg">
              {clientId?.slice(-6) || 'CL-001'}
            </span>
          </div>
        </div>

        {/* 2 Columns: Shared Notes vs Live Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Shared Clinical Notes & Action Plans */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Shared Takeaways & Plans
                </h2>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Shared Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Reflections, frameworks, and assignments shared by your therapist.
              </p>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {sharedNotes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">
                      No shared notes released yet. Notes shared during your session will appear here.
                    </p>
                  </div>
                ) : (
                  sharedNotes.map((note) => (
                    <div
                      key={note._id}
                      className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.content || note.soapData?.plan || 'Action plan shared.'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Private clinical logs are strictly firewalled and inaccessible to clients.</span>
            </div>
          </div>

          {/* Column 2: Live Chat with Therapist */}
          <div>
            <ChatWindow
              roomId={`room_therapist_${clientId}`}
              senderId={clientId}
              senderName="Client"
              senderRole="client"
              title="Direct Therapist Messaging"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
