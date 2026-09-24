import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import NoteEditor from '../../components/notes/NoteEditor';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { FileText, Lock, Users, Plus, CheckCircle2 } from 'lucide-react';

const Notes = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWritingNote, setIsWritingNote] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/scheduling/sessions');
      if (res.data.success) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0) {
          setSelectedSession(res.data.sessions[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching sessions for notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionNotes = async (sessionId) => {
    try {
      const res = await axiosInstance.get(`/notes/session/${sessionId}`);
      if (res.data.success) {
        setNotes(res.data.notes);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionNotes(selectedSession._id);
    }
  }, [selectedSession]);

  const handleSaveNote = async (notePayload) => {
    try {
      const res = await axiosInstance.post('/notes', notePayload);
      if (res.data.success) {
        setIsWritingNote(false);
        setStatusMessage('Note recorded successfully!');
        setTimeout(() => setStatusMessage(''), 3000);
        fetchSessionNotes(selectedSession._id);
      }
    } catch (err) {
      alert('Error creating note: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Loader size="lg" text="Loading clinical documentation hub..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Clinical Documentation Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Role-restricted clinical notes: Private therapist records vs. Client-facing shared takeaways.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Sessions selector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Select Consultation Session
          </h2>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400">No sessions recorded yet.</p>
            ) : (
              sessions.map((s) => {
                const isSelected = selectedSession?._id === s._id;
                return (
                  <button
                    key={s._id}
                    onClick={() => {
                      setSelectedSession(s);
                      setIsWritingNote(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-amber-50/50 shadow-xs'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {s.client_id?.name || 'Client'}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {s.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {new Date(s.startTime).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Notes view and authoring */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSession && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-amber-300">Session Documentation For</span>
                <h3 className="text-xl font-bold mt-0.5">{selectedSession.client_id?.name}</h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedSession.startTime).toLocaleString('en-IN')}
                </p>
              </div>

              {!isWritingNote && (
                <Button
                  onClick={() => setIsWritingNote(true)}
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  className="bg-amber-500 hover:bg-orange-500"
                >
                  Write Clinical Note
                </Button>
              )}
            </div>
          )}

          {isWritingNote ? (
            <NoteEditor
              sessionId={selectedSession?._id}
              clientId={selectedSession?.client_id?._id}
              onSave={handleSaveNote}
              onCancel={() => setIsWritingNote(false)}
            />
          ) : (
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No notes written for this session yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Write Clinical Note" to record private observations or shared takeaways.
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className={`p-6 rounded-3xl border transition-all ${
                      note.type === 'private'
                        ? 'bg-amber-50/20 border-amber-200'
                        : 'bg-amber-50/20 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                          note.type === 'private'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {note.type === 'private' ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-700" />
                            Confidential Private Note (Therapist Only)
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 text-amber-700" />
                            Shared Client Plan (Visible in Portal)
                          </>
                        )}
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-2">{note.title}</h4>

                    {note.format === 'soap' && note.soapData ? (
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                        <p><strong className="text-orange-500">S (Subjective):</strong> {note.soapData.subjective}</p>
                        <p><strong className="text-orange-500">O (Objective):</strong> {note.soapData.objective}</p>
                        <p><strong className="text-orange-500">A (Assessment):</strong> {note.soapData.assessment}</p>
                        <p><strong className="text-orange-500">P (Plan):</strong> {note.soapData.plan}</p>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
