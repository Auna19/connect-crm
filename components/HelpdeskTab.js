'use client';

import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Plus, 
  Phone, 
  Globe, 
  Mail, 
  Cpu, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Send, 
  Eye, 
  X,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export default function HelpdeskTab({ onNotify }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Phone Complaint Simulation State (TC-P21-008)
  const [complaintPhone, setComplaintPhone] = useState('+1 (555) 234-5678');
  const [complaintOrder, setComplaintOrder] = useState('EB-778213');
  const [complaintText, setComplaintText] = useState('Customer called regarding delayed delivery. Outer packaging arrived torn and inner seal was broken. Requesting urgent courier claim.');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintResult, setComplaintResult] = useState(null);

  // New Ticket Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    channel: 'web',
    priority: 'medium',
    callerPhone: '',
    orderNumber: '',
    assignedQueue: 'General Support'
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const url = `/api/tickets?channel=${channelFilter}&priority=${priorityFilter}&status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [channelFilter, priorityFilter, statusFilter, searchQuery]);

  const handleSimulatePhoneComplaint = async () => {
    setIsSubmittingComplaint(true);
    setComplaintResult(null);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-idempotency-key': `complaint-${complaintOrder}-${Date.now().toString().slice(-4)}`
        },
        body: JSON.stringify({
          callerPhone: complaintPhone,
          orderNumber: complaintOrder,
          subject: `Damaged Delivery Report — Order ${complaintOrder}`,
          description: complaintText,
          transcript: `Customer (+1-555-234-5678): "${complaintText}"\nAgent: "I have recorded your complaint. Priority escalated to urgent, and reference ticket dispatched by SMS."`,
          channel: 'phone',
          assignedQueue: 'Escalations & Claims'
        })
      });

      const data = await res.json();
      setComplaintResult(data);
      fetchTickets();

      if (data.success) {
        onNotify?.(`Phone ticket ${data.ticket.ticketNumber} logged in unified queue! Simulated SMS sent.`, 'success');
      }
    } catch (err) {
      onNotify?.(`Complaint submission failed: ${err.message}`, 'error');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchTickets();
        onNotify?.(`Ticket ${data.ticket.ticketNumber} created!`, 'success');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel?.toLowerCase()) {
      case 'phone':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Phone size={11} /> Phone
          </span>
        );
      case 'web':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Globe size={11} /> Web
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Mail size={11} /> Email
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Cpu size={11} /> API
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-300 uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* TC-P21-008: Phone Complaint & Unified Queue Simulation Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-400">
              <Phone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Phone Complaint & Omnichannel Dispatcher</h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                  TC-P21-008 Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Log a phone complaint, capture conversation transcript, escalate priority, and trigger simulated SMS delivery.
              </p>
            </div>
          </div>

          <button
            onClick={handleSimulatePhoneComplaint}
            disabled={isSubmittingComplaint}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 shadow-sm"
          >
            {isSubmittingComplaint ? 'Routing Ticket...' : 'Simulate Phone Complaint'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Caller Phone Number</label>
            <input
              type="text"
              value={complaintPhone}
              onChange={(e) => setComplaintPhone(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Related Order Number</label>
            <input
              type="text"
              value={complaintOrder}
              onChange={(e) => setComplaintOrder(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 font-mono text-white text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Queue & Destination</label>
            <input
              type="text"
              readOnly
              value="Escalations & Claims (Phone L1)"
              className="w-full bg-slate-950/30 border border-slate-800 rounded-lg p-2 font-mono text-slate-400 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Captured Complaint Transcript</label>
          <textarea
            rows="2"
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2 text-white text-xs"
          />
        </div>

        {/* Live Complaint Result */}
        {complaintResult && (
          <div className="mt-4 p-4 rounded-lg bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Ticket {complaintResult.ticket.ticketNumber} Logged in Unified Queue
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-400/40 text-purple-300 font-mono text-[10px]">
                Priority: {complaintResult.ticket.priority.toUpperCase()}
              </span>
            </div>

            {complaintResult.smsDelivery && (
              <div className="p-2.5 bg-slate-900/80 rounded border border-purple-500/20 text-[11px] text-slate-200 flex items-start gap-2">
                <Smartphone size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-400">
                    [{complaintResult.smsDelivery.mode} SMS PROVIDER]
                  </span>{' '}
                  {complaintResult.smsDelivery.note}
                  <div className="font-mono text-slate-300 mt-1">
                    To: {complaintResult.smsDelivery.recipientPhone} — "{complaintResult.smsDelivery.message}"
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Unified Helpdesk Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-60">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets, transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Channels (Unified)</option>
              <option value="phone">Phone Calls</option>
              <option value="web">Web Forms</option>
              <option value="email">Email</option>
              <option value="api">API Ingest</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus size={15} />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ticket #</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Subject & Complaint</th>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">Loading helpdesk queue...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">No tickets found.</td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700">{t.ticketNumber}</td>
                    <td className="px-4 py-3">{getChannelBadge(t.channel)}</td>
                    <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="font-semibold text-slate-800 block truncate">{t.subject}</span>
                      <span className="text-slate-500 text-[11px] truncate block">{t.description}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{t.orderNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.assignedQueue}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Transcript & Details Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedTicket.ticketNumber}</h3>
                  {getChannelBadge(selectedTicket.channel)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <span className="text-xs text-slate-500">{selectedTicket.subject}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Caller Phone</span>
                <span className="font-mono font-bold text-slate-800">{selectedTicket.callerPhone || 'Not provided'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Related Order</span>
                <span className="font-mono font-bold text-blue-600">{selectedTicket.orderNumber || 'None'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Assigned Queue</span>
                <span className="font-medium text-slate-800">{selectedTicket.assignedQueue}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">External Reference</span>
                <span className="font-mono text-slate-800">{selectedTicket.externalRefId || 'N/A'}</span>
              </div>
            </div>

            {/* Conversation Transcript Box */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-purple-600" />
                Preserved Interaction Transcript
              </h4>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-700">
                {selectedTicket.transcript || selectedTicket.description || 'No audio transcript captured for this submission.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Support Ticket</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject *</label>
                <input
                  required
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Channel</label>
                  <select
                    value={newTicket.channel}
                    onChange={(e) => setNewTicket({ ...newTicket, channel: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="web">Web Portal</option>
                    <option value="phone">Phone Support</option>
                    <option value="email">Email</option>
                    <option value="api">API Ingest</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Caller / Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555 234 5678"
                    value={newTicket.callerPhone}
                    onChange={(e) => setNewTicket({ ...newTicket, callerPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Order #</label>
                  <input
                    type="text"
                    placeholder="EB-778213"
                    value={newTicket.orderNumber}
                    onChange={(e) => setNewTicket({ ...newTicket, orderNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Complaint Description</label>
                <textarea
                  rows="3"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 font-semibold text-white hover:bg-purple-700"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
