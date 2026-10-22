'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Code2, 
  CheckCircle2, 
  AlertTriangle,
  Play
} from 'lucide-react';

const SAVED_TEMPLATES = [
  {
    name: 'Order Lookup: EB-778213 (Shipped)',
    method: 'GET',
    endpoint: '/api/orders/EB-778213',
    body: ''
  },
  {
    name: 'Order Lookup: Nonexistent EB-000001',
    method: 'GET',
    endpoint: '/api/orders/EB-000001',
    body: ''
  },
  {
    name: 'Caller Phone Match (Known: Alice)',
    method: 'POST',
    endpoint: '/api/customers/match-phone',
    body: JSON.stringify({ phone: '+1 (555) 234-5678' }, null, 2)
  },
  {
    name: 'Caller Phone Match (Unknown Caller)',
    method: 'POST',
    endpoint: '/api/customers/match-phone',
    body: JSON.stringify({ phone: '+1 (555) 999-0000' }, null, 2)
  },
  {
    name: 'Calendar Availability Check',
    method: 'POST',
    endpoint: '/api/appointments/availability',
    body: JSON.stringify({
      startTime: '2026-10-23T14:00:00Z',
      endTime: '2026-10-23T14:45:00Z',
      assignedAgent: 'Sarah Jenkins'
    }, null, 2)
  },
  {
    name: 'Create Phone Support Ticket',
    method: 'POST',
    endpoint: '/api/tickets',
    body: JSON.stringify({
      callerPhone: '+1 (555) 234-5678',
      orderNumber: 'EB-778213',
      subject: 'Damaged item inquiry',
      description: 'Outer carton was damaged in transit.',
      channel: 'phone'
    }, null, 2)
  },
  {
    name: 'Real-time System Stats',
    method: 'GET',
    endpoint: '/api/stats',
    body: ''
  }
];

export default function ApiExplorerTab({ onNotify }) {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/orders/EB-778213');
  const [requestBody, setRequestBody] = useState('');
  const [connectorId, setConnectorId] = useState('');
  const [connectors, setConnectors] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  useEffect(() => {
    fetch('/api/connectors')
      .then(r => r.json())
      .then(d => {
        if (d.success) setConnectors(d.connectors);
      })
      .catch(console.error);
  }, []);

  const handleApplyTemplate = (tmpl) => {
    setMethod(tmpl.method);
    setEndpoint(tmpl.endpoint);
    setRequestBody(tmpl.body || '');
    setResponseResult(null);
  };

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setResponseResult(null);

    let parsedBody = null;
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e) {
        onNotify?.('Invalid JSON in request body editor', 'error');
        setIsExecuting(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/api-explorer/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          endpoint,
          body: parsedBody,
          connectorId: connectorId || undefined
        })
      });
      const data = await res.json();
      setResponseResult(data);
      if (data.status < 400) {
        onNotify?.(`Request completed: HTTP ${data.status} (${data.durationMs}ms)`, 'success');
      } else {
        onNotify?.(`Request returned HTTP ${data.status}`, 'info');
      }
    } catch (err) {
      onNotify?.(`Execution error: ${err.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCurlToClipboard = () => {
    if (responseResult?.curl) {
      navigator.clipboard.writeText(responseResult.curl);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
      onNotify?.('cURL command copied with sanitized placeholders!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Templates Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase font-mono mr-1">Preconfigured Templates:</span>
        {SAVED_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyTemplate(tmpl)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors"
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* Main Request Builder & Response Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Builder Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Terminal size={17} className="text-blue-600" />
                HTTP Request Builder
              </h3>
              <span className="text-xs text-slate-400 font-mono">Server-Side Proxy</span>
            </div>

            {/* Method & Endpoint Input */}
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-slate-100 border border-slate-300 font-mono font-bold text-xs rounded-lg px-3 py-2 text-slate-800 shrink-0"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/orders/EB-778213"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Connector Credential Selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Inject Stored Connector Authentication (Server-Side Decryption)
              </label>
              <select
                value={connectorId}
                onChange={(e) => setConnectorId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-700 bg-slate-50"
              >
                <option value="">None (Standard Internal Request)</option>
                {connectors.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Header: {c.secretHeaderName} (Secret Encrypted)
                  </option>
                ))}
              </select>
            </div>

            {/* Request Body Editor */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  JSON Request Body
                </label>
                <textarea
                  rows="6"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder="{\n  &quot;orderNumber&quot;: &quot;EB-778213&quot;\n}"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono bg-slate-950 text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteRequest}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <Play size={14} className={isExecuting ? 'animate-spin' : ''} />
            <span>{isExecuting ? 'Dispatching...' : 'Execute Request'}</span>
          </button>
        </div>

        {/* Response Viewer Panel */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between text-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Execution Response</h3>
              </div>

              {responseResult && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseResult.status < 300 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    responseResult.status < 500 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    HTTP {responseResult.status}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {responseResult.durationMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* Formatted JSON Output */}
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-y-auto max-h-[350px] border border-slate-800/80">
              {responseResult ? (
                JSON.stringify(responseResult.response, null, 2)
              ) : (
                <span className="text-slate-500">// Response payload will appear here after execution...</span>
              )}
            </pre>
          </div>

          {/* Copyable cURL Box */}
          {responseResult?.curl && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Sanitized cURL Command (Tokens Redacted)
                </span>
                <button
                  onClick={copyCurlToClipboard}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  {copiedCurl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
                </button>
              </div>
              <div className="p-2 bg-slate-950 text-slate-300 rounded font-mono text-[11px] truncate border border-slate-800">
                {responseResult.curl}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
