'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  RotateCw, 
  Activity, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  X,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export default function ConnectorsTab({ onNotify }) {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [rotatingId, setRotatingId] = useState(null);

  // New Connector Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConn, setNewConn] = useState({
    name: '',
    description: '',
    type: 'rest_api',
    provider: 'Custom Cloud Provider',
    environment: 'staging',
    baseApiUrl: 'https://api.external-partner.com/v1',
    webhookUrl: 'https://api.connectcrm.internal/webhooks/custom',
    authType: 'api_key',
    secretHeaderName: 'X-API-Key',
    secret: 'sk_live_sample_token_8891230491823',
    scopes: ['read_contact', 'read_orders']
  });

  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/connectors');
      const data = await res.json();
      if (data.success) {
        setConnectors(data.connectors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/connectors/${id}/test`, {
        method: 'POST'
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [id]: data }));

      if (data.success) {
        onNotify?.(`Connection test passed for "${data.connectorName}" (${data.latencyMs}ms)`, 'success');
      } else {
        onNotify?.(`Connection test failed: ${data.error}`, 'error');
      }
    } catch (err) {
      onNotify?.(`Connection test error: ${err.message}`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleRotateSecret = async (id) => {
    setRotatingId(id);
    try {
      const res = await fetch(`/api/connectors/${id}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        onNotify?.(data.message, 'success');
        fetchConnectors();
      } else {
        onNotify?.(data.error || 'Failed to rotate secret', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setRotatingId(null);
    }
  };

  const handleCreateConnector = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/connectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConn)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchConnectors();
        onNotify?.(`Connector "${data.connector.name}" registered and secret encrypted!`, 'success');
      } else {
        onNotify?.(data.error || 'Failed to register connector', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Integration Connectors & Cryptographic Credential Vault</h2>
          <p className="text-xs text-slate-500">
            All authentication tokens and secrets are encrypted at rest using AES-256-GCM. Decryption occurs only in server-side memory upon execution.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
        >
          <Plus size={15} />
          <span>Register Connector</span>
        </button>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
            Loading active connectors...
          </div>
        ) : (
          connectors.map((c) => {
            const result = testResults[c.id];
            const isRetailerPhone = c.id === 'conn-retailer-phone';

            return (
              <div 
                key={c.id} 
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase font-mono">
                          {c.environment}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{c.description}</p>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {c.status}
                    </span>
                  </div>

                  {/* Required Configuration Fields Display */}
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Webhook URL:</span>
                      <span className="font-mono text-slate-800 text-[11px] truncate max-w-[250px]" title={c.webhookUrl}>
                        {c.webhookUrl}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Base API URL:</span>
                      <span className="font-mono text-slate-800 text-[11px] truncate max-w-[250px]">
                        {c.baseApiUrl || 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Secret Header Name:</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {c.secretHeaderName || 'X-API-Key'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Auth Token / Secret:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                          {c.maskedSecret || '••••••••'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                          <Lock size={10} /> AES-256-GCM
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-semibold block mb-1">Granted Scopes & Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {c.scopes?.map((scope) => (
                          <span 
                            key={scope}
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              isRetailerPhone && (scope === 'read_contact' || scope === 'read_orders')
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Test Connection Result Box */}
                  {result && (
                    <div className={`p-3 rounded-lg border text-xs mb-3 ${
                      result.success 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          {result.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                          <span>{result.message}</span>
                        </span>
                        <span className="font-mono">{result.latencyMs}ms</span>
                      </div>

                      {result.leastPrivilegeWarning && (
                        <div className="mt-1.5 p-2 bg-amber-100 text-amber-900 rounded border border-amber-300 font-medium">
                          {result.leastPrivilegeWarning}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => handleRotateSecret(c.id)}
                    disabled={rotatingId === c.id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Revoke and generate new AES-256 cipher"
                  >
                    <RotateCw size={13} className={rotatingId === c.id ? 'animate-spin' : ''} />
                    <span>Rotate Secret</span>
                  </button>

                  <button
                    onClick={() => handleTestConnection(c.id)}
                    disabled={testingId === c.id}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-xs"
                  >
                    <Activity size={13} className={testingId === c.id ? 'animate-pulse' : ''} />
                    <span>{testingId === c.id ? 'Verifying...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Register Connector Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Register Connector Endpoint</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateConnector} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Retailer Voice & Phone Integration"
                  value={newConn.name}
                  onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newConn.description}
                  onChange={(e) => setNewConn({ ...newConn, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Webhook URL *</label>
                <input
                  required
                  type="url"
                  placeholder="https://api.connectcrm.internal/webhooks/endpoint"
                  value={newConn.webhookUrl}
                  onChange={(e) => setNewConn({ ...newConn, webhookUrl: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Secret Header Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="X-API-Key or Authorization"
                    value={newConn.secretHeaderName}
                    onChange={(e) => setNewConn({ ...newConn, secretHeaderName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Auth Type</label>
                  <select
                    value={newConn.authType}
                    onChange={(e) => setNewConn({ ...newConn, authType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="api_key">API Key (Header)</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="custom">Custom Header</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Auth Token / Secret (Will be encrypted with AES-256-GCM) *
                </label>
                <input
                  required
                  type="password"
                  placeholder="Enter raw secret"
                  value={newConn.secret}
                  onChange={(e) => setNewConn({ ...newConn, secret: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Scopes (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="read_contact, read_orders"
                  value={newConn.scopes.join(', ')}
                  onChange={(e) => setNewConn({ 
                    ...newConn, 
                    scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
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
                  className="px-4 py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  Encrypt & Save Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
