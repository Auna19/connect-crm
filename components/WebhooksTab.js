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
  Check
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Webhook Dispatcher & HMAC-SHA256 Signer</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  Idempotent Delivery
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Trigger outbound events with cryptographically signed payloads, delivery retries, and latency tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="order.shipped">order.shipped</option>
              <option value="order.created">order.created</option>
              <option value="order.delivered">order.delivered</option>
              <option value="ticket.created">ticket.created</option>
              <option value="appointment.created">appointment.created</option>
            </select>

            <button
              onClick={handleTriggerWebhook}
              disabled={isTriggering}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm shrink-0"
            >
              <Send size={13} className={isTriggering ? 'animate-spin' : ''} />
              <span>{isTriggering ? 'Signing...' : 'Trigger Event'}</span>
            </button>
          </div>
        </div>

        {/* Live Trigger Result Box */}
        {triggerResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950/70 border border-emerald-500/30 text-xs text-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Dispatched Event: {triggerResult.eventType} (HTTP {triggerResult.httpStatus})</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">Latency: {triggerResult.latencyMs}ms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800">
              <div>
                <span className="text-slate-400 block font-semibold">Destination Endpoint:</span>
                <span className="font-mono text-white truncate block">{triggerResult.destinationUrl}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">HMAC-SHA256 Signature Header:</span>
                <span className="font-mono text-emerald-300 truncate block">{triggerResult.signature}</span>
              </div>
            </div>
          </div>
        )}
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
          <h3 className="font-bold text-sm text-slate-800">Webhook Delivery Log & Payload Inspection</h3>
          <span className="text-xs text-slate-500">{deliveries.length} total deliveries</span>
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
                <th className="px-4 py-3 text-right">Payload</th>
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
                      <button
                        onClick={() => setInspectedPayload(del)}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> View JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
