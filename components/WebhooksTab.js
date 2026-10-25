'use client';

import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  ShieldCheck, 
  Activity, 
  Eye, 
  X, 
  Copy, 
  Check,
  Trash2
} from 'lucide-react';

export default function WebhooksTab({ onNotify }) {
  const [webhooks, setWebhooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState('order.shipped');
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [inspectedPayload, setInspectedPayload] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: 'https://webhook.site/sample-endpoint',
    eventTypes: ['order.shipped', 'order.delivered'],
    environment: 'production'
  });

  const fetchWebhooksData = async () => {
    try {
      setLoading(true);
      const [whRes, delRes] = await Promise.all([
        fetch('/api/webhooks'),
        fetch('/api/webhooks/deliveries')
      ]);
      const whData = await whRes.json();
      const delData = await delRes.json();

      if (whData.success) setWebhooks(whData.webhooks);
      if (delData.success) setDeliveries(delData.deliveries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooksData();
  }, []);

  const handleTriggerWebhook = async () => {
    setIsTriggering(true);
    setTriggerResult(null);

    try {
      const res = await fetch('/api/webhooks/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: selectedEventType,
          payload: {
            event: selectedEventType,
            timestamp: new Date().toISOString(),
            data: {
              orderNumber: 'EB-778213',
              carrier: 'FedEx Express',
              status: selectedEventType === 'order.shipped' ? 'Shipped' : 'Delivered',
              estimatedDelivery: '2026-10-25'
            }
          }
        })
      });
      const data = await res.json();
      setTriggerResult(data);
      fetchWebhooksData();
      if (data.success) {
        onNotify?.(`Webhook "${selectedEventType}" dispatched with HMAC-SHA256 signature!`, 'success');
      }
    } catch (err) {
      onNotify?.(`Webhook dispatch failed: ${err.message}`, 'error');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchWebhooksData();
        onNotify?.(`Webhook "${data.webhook.name}" registered successfully!`, 'success');
        setNewWebhook({
          name: '',
          url: 'https://webhook.site/sample-endpoint',
          eventTypes: ['order.shipped', 'order.delivered'],
          environment: 'production'
        });
      } else {
        onNotify?.(data.error || 'Failed to create webhook', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDeleteWebhook = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete webhook "${name || id}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.(`Webhook "${name || id}" deleted successfully`, 'success');
        fetchWebhooksData();
      } else {
        onNotify?.(data.error || 'Failed to delete webhook', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDeleteDelivery = async (id) => {
    try {
      const res = await fetch(`/api/webhooks/deliveries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.('Delivery log entry deleted', 'info');
        fetchWebhooksData();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleClearDeliveries = async () => {
    if (!window.confirm('Are you sure you want to clear all webhook delivery history logs?')) {
      return;
    }
    try {
      const res = await fetch('/api/webhooks/deliveries', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.('All webhook deliveries cleared', 'success');
        fetchWebhooksData();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    onNotify?.('Inbound Webhook URL copied!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Outbound Webhook Test Runner & HMAC Signer */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400">
              <Webhook size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Outbound Webhook Dispatcher & HMAC-SHA256 Signer</h3>
              <p className="text-xs text-slate-400">
                Dispatches authoritative payloads to configured subscribers with cryptographic hash validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-hidden"
            >
              <option value="order.shipped">order.shipped</option>
              <option value="order.delivered">order.delivered</option>
              <option value="ticket.created">ticket.created</option>
              <option value="ticket.escalated">ticket.escalated</option>
              <option value="customer.verified">customer.verified</option>
            </select>

            <button
              onClick={handleTriggerWebhook}
              disabled={isTriggering}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send size={13} className={isTriggering ? 'animate-bounce' : ''} />
              <span>{isTriggering ? 'Signing & Sending...' : 'Trigger Webhook'}</span>
            </button>
          </div>
        </div>

        {triggerResult && (
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Dispatched: {triggerResult.eventType}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Latency: {triggerResult.latencyMs}ms | Status: HTTP {triggerResult.httpStatus || 200}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto">
              <span className="text-slate-500 block mb-1">X-Signature-SHA256 Header:</span>
              <span className="text-indigo-300 break-all">{triggerResult.signature || 'sha256=a7b92f4e8812...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Configured Webhooks Management Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Registered Webhook Endpoints</h3>
            <p className="text-xs text-slate-500">Active endpoints listening for platform events and state changes</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add Webhook Endpoint</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {webhooks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No custom webhook endpoints registered yet.</div>
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{wh.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {wh.status}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                      {wh.environment}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-500 truncate">{wh.url}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {wh.eventTypes?.map((ev) => (
                      <span key={ev} className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteWebhook(wh.id, wh.name)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete webhook endpoint"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inbound Webhook Receiver Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Authoritative Inbound Webhook Gateway</h3>
        <p className="text-xs text-slate-500 mb-3">
          Configured endpoint for partner systems to push real-time order and ticket updates. Includes replay attack defense (5-minute timestamp validity check).
        </p>
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="font-mono text-xs text-slate-800 flex-1 truncate">
            https://api.connectcrm.internal/api/webhooks/inbound
          </span>
          <button
            onClick={() => copyToClipboard('https://api.connectcrm.internal/api/webhooks/inbound')}
            className="flex items-center gap-1 px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shrink-0"
          >
            {copiedUrl ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Delivery History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Webhook Delivery Log & Payload Inspection</h3>
            <span className="text-xs text-slate-500">{deliveries.length} total deliveries</span>
          </div>
          {deliveries.length > 0 && (
            <button
              onClick={handleClearDeliveries}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">HTTP Code</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">Loading delivery records...</td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">No webhook deliveries recorded yet.</td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(del.deliveredAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{del.eventType}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {del.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{del.statusCode || 200}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{del.latencyMs}ms</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{del.attempts}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectedPayload(del)}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View JSON
                        </button>
                        <button
                          onClick={() => handleDeleteDelivery(del.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                          title="Delete delivery record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Webhook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Webhook Endpoint</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWebhook} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Endpoint Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ERP Order Sync Hook"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination URL *</label>
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Environment</label>
                <select
                  value={newWebhook.environment}
                  onChange={(e) => setNewWebhook({ ...newWebhook, environment: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                </select>
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  Register Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payload Modal */}
      {inspectedPayload && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Webhook Payload: {inspectedPayload.eventType}</h3>
                <span className="text-[11px] font-mono text-slate-400">ID: {inspectedPayload.id}</span>
              </div>
              <button onClick={() => setInspectedPayload(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono max-h-72 overflow-y-auto border border-slate-800">
              {JSON.stringify(inspectedPayload.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
