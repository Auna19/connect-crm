'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  MapPin, 
  Search,
  X,
  CalendarCheck
} from 'lucide-react';

export default function CalendarTab({ onNotify }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // list, day, week

  // Check Availability State
  const [checkDate, setCheckDate] = useState('2026-10-23');
  const [checkStart, setCheckStart] = useState('14:00');
  const [checkEnd, setCheckEnd] = useState('14:45');
  const [checkAgent, setCheckAgent] = useState('Sarah Jenkins');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Free Slots Generator State
  const [freeSlots, setFreeSlots] = useState([]);
  const [isFindingSlots, setIsFindingSlots] = useState(false);

  // Book Appointment Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    title: '',
    customerId: 'cust-101',
    date: '2026-10-25',
    startTime: '10:00',
    endTime: '10:30',
    timeZone: 'America/New_York',
    location: 'Zoom Video Link',
    appointmentType: 'Support Followup',
    assignedAgent: 'Sarah Jenkins',
    notes: ''
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckAvailability = async () => {
    setIsChecking(true);
    setAvailabilityResult(null);

    const startTime = `${checkDate}T${checkStart}:00Z`;
    const endTime = `${checkDate}T${checkEnd}:00Z`;

    try {
      const res = await fetch('/api/appointments/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime,
          endTime,
          assignedAgent: checkAgent
        })
      });
      const data = await res.json();
      setAvailabilityResult(data);
    } catch (err) {
      onNotify?.(`Availability check failed: ${err.message}`, 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleFindFreeSlots = async () => {
    setIsFindingSlots(true);
    try {
      const res = await fetch(`/api/appointments/free-slots?date=${checkDate}&duration=30&agent=${encodeURIComponent(checkAgent)}`);
      const data = await res.json();
      if (data.success) {
        setFreeSlots(data.freeSlots);
        onNotify?.(`Found ${data.totalSlots} available slots on ${checkDate}`, 'info');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setIsFindingSlots(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    const startTime = `${newAppt.date}T${newAppt.startTime}:00Z`;
    const endTime = `${newAppt.date}T${newAppt.endTime}:00Z`;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAppt,
          startTime,
          endTime
        })
      });
      const data = await res.json();

      if (data.success) {
        setShowBookModal(false);
        fetchAppointments();
        onNotify?.(`Appointment "${data.appointment.title}" confirmed!`, 'success');
      } else if (data.conflict) {
        onNotify?.(`Booking Conflict: ${data.error}`, 'error');
      } else {
        onNotify?.(data.error || 'Failed to book', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Availability & Free Slots Engine */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-600/30 border border-cyan-500/40 text-cyan-400">
              <CalendarCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Calendar Availability & Conflict Prevention Engine</h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono">
                  Multi-Provider Sync
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Check real-time agent availability, compute free appointment slots, and verify server-side conflict guards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFindFreeSlots}
              disabled={isFindingSlots}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isFindingSlots ? 'Computing...' : 'Find Free Slots'}
            </button>
            <button
              onClick={handleCheckAvailability}
              disabled={isChecking}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {isChecking ? 'Checking...' : 'Check Availability'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mb-3">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Target Date</label>
            <input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Start Time (UTC)</label>
            <input
              type="time"
              value={checkStart}
              onChange={(e) => setCheckStart(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">End Time (UTC)</label>
            <input
              type="time"
              value={checkEnd}
              onChange={(e) => setCheckEnd(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Assigned Agent</label>
            <select
              value={checkAgent}
              onChange={(e) => setCheckAgent(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 text-white text-xs"
            >
              <option value="Sarah Jenkins">Sarah Jenkins (VIP Audio)</option>
              <option value="Mark Davis">Mark Davis (Hardware)</option>
              <option value="Elena Rostova">Elena Rostova (Escalations)</option>
            </select>
          </div>
        </div>

        {/* Live Availability Result */}
        {availabilityResult && (
          <div className={`mt-3 p-3 rounded-lg border text-xs ${
            availabilityResult.available 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {availabilityResult.available ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Time Slot Available: No conflicting commitments on calendar.</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-rose-400" />
                  <span>Conflict Detected: Agent {checkAgent} is already booked for "{availabilityResult.conflictingAppointment?.title}" ({availabilityResult.conflictingAppointment?.startTime.slice(11, 16)} UTC).</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Free Slots Grid */}
        {freeSlots.length > 0 && (
          <div className="mt-3 p-3 bg-slate-950/60 rounded-lg border border-slate-700 text-xs">
            <span className="font-bold text-cyan-300 block mb-2">Available Free Slots on {checkDate}:</span>
            <div className="flex flex-wrap gap-2">
              {freeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCheckStart(slot.formatted.slice(0, 5));
                    setCheckEnd(new Date(new Date(slot.startTime).getTime() + 30 * 60000).toISOString().slice(11, 16));
                    setNewAppt({
                      ...newAppt,
                      date: checkDate,
                      startTime: slot.formatted.slice(0, 5),
                      endTime: new Date(new Date(slot.startTime).getTime() + 30 * 60000).toISOString().slice(11, 16),
                      assignedAgent: checkAgent
                    });
                    setShowBookModal(true);
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-900/40 hover:bg-cyan-700/60 border border-cyan-500/30 font-mono text-[11px] text-cyan-200 transition-colors"
                >
                  {slot.formatted}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Appointments Schedule Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Controls */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-800">Scheduled Appointments & Consultations</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bold">
              {appointments.length} Upcoming
            </span>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus size={15} />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No appointments scheduled.</div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{a.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 uppercase">
                      {a.appointmentType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {a.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Clock size={13} className="text-slate-400" />
                      {new Date(a.startTime).toLocaleString()} ({a.timeZone})
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <User size={13} className="text-slate-400" />
                      Agent: {a.assignedAgent}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Video size={13} className="text-slate-400" />
                      {a.location}
                    </span>
                  </div>
                  {a.notes && (
                    <p className="text-slate-500 text-[11px] italic">Notes: {a.notes}</p>
                  )}
                </div>

                <div className="font-mono text-[10px] text-slate-400 shrink-0">
                  Ref: {a.externalCalendarEventId || a.id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Consultation / Callback</h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Appointment Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. VIP Audio Consultation"
                  value={newAppt.title}
                  onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Agent</label>
                  <select
                    value={newAppt.assignedAgent}
                    onChange={(e) => setNewAppt({ ...newAppt, assignedAgent: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Mark Davis">Mark Davis</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time (UTC)</label>
                  <input
                    type="time"
                    value={newAppt.startTime}
                    onChange={(e) => setNewAppt({ ...newAppt, startTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time (UTC)</label>
                  <input
                    type="time"
                    value={newAppt.endTime}
                    onChange={(e) => setNewAppt({ ...newAppt, endTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Location / Link</label>
                <input
                  type="text"
                  placeholder="Zoom / Teams / Phone"
                  value={newAppt.location}
                  onChange={(e) => setNewAppt({ ...newAppt, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 font-semibold text-white hover:bg-cyan-700"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
