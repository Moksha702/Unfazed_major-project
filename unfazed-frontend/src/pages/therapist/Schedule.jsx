import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { Calendar, Clock, Check, Save, Video, AlertCircle } from 'lucide-react';

const Schedule = () => {
  const [availability, setAvailability] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 0, name: 'Sunday' }
  ];

  const fetchData = async () => {
    try {
      const [availRes, sessRes] = await Promise.all([
        axiosInstance.get('/scheduling/availability'),
        axiosInstance.get('/scheduling/sessions')
      ]);

      if (availRes.data.success) {
        setAvailability(availRes.data.availability);
      }
      if (sessRes.data.success) {
        setSessions(sessRes.data.sessions);
      }
    } catch (err) {
      console.error('Error fetching schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleDay = (dayNum) => {
    setAvailability(prev => {
      const updated = prev.weeklySchedule.map(day => {
        if (day.dayOfWeek === dayNum) {
          return { ...day, isWorkingDay: !day.isWorkingDay };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  const handleSlotChange = (dayNum, field, value) => {
    setAvailability(prev => {
      const updated = prev.weeklySchedule.map(day => {
        if (day.dayOfWeek === dayNum) {
          const slots = day.slots.length > 0 ? [...day.slots] : [{ startTime: '10:00', endTime: '18:00' }];
          slots[0] = { ...slots[0], [field]: value };
          return { ...day, slots };
        }
        return day;
      });
      return { ...prev, weeklySchedule: updated };
    });
  };

  const handleSaveAvailability = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await axiosInstance.put('/scheduling/availability', availability);
      if (res.data.success) {
        setMessage('Availability schedule saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Error updating schedule: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (sessionId, newStatus) => {
    try {
      await axiosInstance.put(`/scheduling/sessions/${sessionId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update session status: ' + err.message);
    }
  };

  if (loading) return <Loader size="lg" text="Loading schedule & appointments..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Practice Scheduling & Working Hours</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure your weekly appointment windows, session buffer time, and view booked sessions.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Settings (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Weekly Working Hours
            </h2>
            <Button
              onClick={handleSaveAvailability}
              loading={saving}
              variant="primary"
              size="sm"
              icon={Save}
            >
              Save Schedule
            </Button>
          </div>

          {/* Buffer Time & Session Durations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Buffer Time Between Sessions
              </label>
              <select
                value={availability?.bufferMinutes || 15}
                onChange={(e) => setAvailability(prev => ({ ...prev, bufferMinutes: Number(e.target.value) }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 minutes buffer</option>
                <option value={15}>15 minutes buffer</option>
                <option value={30}>30 minutes buffer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Default Session Duration
              </label>
              <select
                value={availability?.sessionDurations?.[0] || 60}
                onChange={(e) => setAvailability(prev => ({ ...prev, sessionDurations: [Number(e.target.value)] }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={45}>45 minutes consultation</option>
                <option value={60}>60 minutes consultation</option>
                <option value={90}>90 minutes consultation</option>
              </select>
            </div>
          </div>

          {/* Weekly Days List */}
          <div className="space-y-3">
            {daysOfWeek.map((day) => {
              const scheduleDay = availability?.weeklySchedule?.find(d => d.dayOfWeek === day.num) || {
                isWorkingDay: false,
                slots: [{ startTime: '10:00', endTime: '18:00' }]
              };
              const slot = scheduleDay.slots?.[0] || { startTime: '10:00', endTime: '18:00' };

              return (
                <div
                  key={day.num}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    scheduleDay.isWorkingDay ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`day-${day.num}`}
                      checked={scheduleDay.isWorkingDay}
                      onChange={() => handleToggleDay(day.num)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor={`day-${day.num}`} className="text-xs font-bold text-slate-800 cursor-pointer w-24">
                      {day.name}
                    </label>
                  </div>

                  {scheduleDay.isWorkingDay ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(day.num, 'startTime', e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(day.num, 'endTime', e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Day Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Booked Sessions & Status Management (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Booked Sessions</h2>
            <p className="text-xs text-slate-500 mb-6">Manage appointment statuses and join video rooms</p>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400">No sessions booked yet.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {session.client_id?.name || 'Client'}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        session.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : session.status === 'no_show'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    <p className="text-slate-500">
                      {new Date(session.startTime).toLocaleString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={session.meetingLink || 'https://meet.jit.si/unfazed-demo'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px]"
                      >
                        <Video className="w-3 h-3" />
                        Join Call
                      </a>

                      {session.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(session._id, 'completed')}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 cursor-pointer"
                          >
                            Mark Done
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(session._id, 'no_show')}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold text-[11px] hover:bg-rose-100 cursor-pointer"
                          >
                            No-Show
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
