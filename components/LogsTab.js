'use client';

import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Eye, 
  X,
  Smartphone,
  Trash2
} from 'lucide-react';

export default function LogsTab({ onNotify }) {
  const [logs, setLogs] = useState([]);
  const [logType, setLogType] = useState('execution'); // execution, audit, sms
  const [statusFilter, setStatusFilter] = useState('all');
  const [integrationFilter, setIntegrationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/logs?type=${logType}&status=${statusFilter}&integration=${integrationFilter}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logType, statusFilter, integrationFilter]);

  const handleExportCSV = () => {
    window.location.href = '/api/logs?format=csv';
    onNotify?.('Downloading execution logs CSV...', 'info');
  };

  const handleDeleteLog = async (id) => {
    try {
      const res = await fetch(`/api/logs?type=${logType}&id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.('Log record deleted', 'info');
        fetchLogs();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleClearLogs = async () => {
    const typeLabel = logType === 'execution' ? 'API execution' : logType === 'audit' ? 'security audit' : 'simulated SMS';
    if (!window.confirm(`Are you sure you want to clear all ${typeLabel} logs?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/logs?type=${logType}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.(`All ${typeLabel} logs cleared`, 'success');
        fetchLogs();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Logs Header & View Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Unified Execution Telemetry & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            End-to-end request tracing with correlation IDs, latency tracking, and sensitive token redaction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setLogType('execution')}
              className={`px-3 py-1 rounded-md transition-colors ${
                logType === 'execution' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              API Execution ({logType === 'execution' ? logs.length : '—'})
            </button>
            <button
              onClick={() => setLogType('audit')}
              className={`px-3 py-1 rounded-md transition-colors ${
                logType === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Security Audit ({logType === 'audit' ? logs.length : '—'})
            </button>
            <button
              onClick={() => setLogType('sms')}
              className={`px-3 py-1 rounded-md transition-colors ${
                logType === 'sms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulated SMS ({logType === 'sms' ? logs.length : '—'})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors shadow-xs"
              title="Clear all logs for current view"
            >
              <Trash2 size={14} />
              <span>Clear View</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      {logType === 'execution' && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="all">All Results</option>
            <option value="success">Success Only</option>
            <option value="error">Errors Only</option>
          </select>

          <select
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="all">All Integrations</option>
            <option value="Retailer Voice">Retailer Voice Gateway</option>
            <option value="GlobalDesk">GlobalDesk Cloud</option>
            <option value="Simulation">Simulation Fault Injector</option>
          </select>

          <span className="text-slate-400 ml-auto font-mono text-[11px]">
            Showing {logs.length} telemetry records
          </span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {logType === 'execution' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Correlation ID</th>
                  <th className="px-4 py-3">Integration</th>
                  <th className="px-4 py-3">Operation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">Loading execution logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">No logs found matching filters.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-blue-600 font-bold">
                        {log.correlationId || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{log.integrationName}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{log.operation}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          log.httpStatus < 300 ? 'bg-emerald-100 text-emerald-800' :
                          log.httpStatus < 500 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          HTTP {log.httpStatus || 200}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{log.durationMs}ms</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          log.result === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Trace
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                            title="Delete log entry"
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
        )}

        {logType === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User / Actor</th>
                  <th className="px-4 py-3">Security Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Audit Details</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">No security audit logs found.</td>
                  </tr>
                ) : (
                  logs.map((aud) => (
                    <tr key={aud.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {new Date(aud.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{aud.userId}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{aud.action}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {aud.entity} #{aud.entityId}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{aud.details}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteLog(aud.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                          title="Delete audit entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {logType === 'sms' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Recipient Phone</th>
                  <th className="px-4 py-3">Provider Mode</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3">Message Content</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">No SMS dispatch records found.</td>
                  </tr>
                ) : (
                  logs.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{s.recipientPhone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {s.isSimulated ? 'SIMULATED SMS' : 'LIVE CARRIER'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 italic max-w-sm truncate">
                        "{s.message}"
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteLog(s.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                          title="Delete SMS entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trace Inspection Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Execution Telemetry Trace</h3>
                <span className="font-mono text-xs text-blue-600 font-bold">{selectedLog.correlationId}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Integration Name</span>
                  <span className="font-bold text-slate-800">{selectedLog.integrationName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Operation</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.operation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Method & Endpoint</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedLog.method} {selectedLog.endpoint}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">HTTP Response Code</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.httpStatus || 200}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration / Latency</span>
                  <span className="font-mono text-slate-800">{selectedLog.durationMs}ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Execution Result</span>
                  <span className="font-bold text-emerald-600 uppercase">{selectedLog.result}</span>
                </div>
              </div>

              {selectedLog.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-mono text-[11px]">
                  <span className="font-bold block mb-1">Captured Error Detail:</span>
                  {selectedLog.error}
                </div>
              )}

              <div className="p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-[11px] space-y-1">
                <span className="text-slate-500 block">Security Redaction Audit:</span>
                <div>All API Keys: <span className="text-emerald-400">REDACTED [AES-256-GCM]</span></div>
                <div>Bearer Tokens: <span className="text-emerald-400">MASKED</span></div>
                <div>Caller Phone: <span className="text-emerald-400">E.164 NORMALIZED</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
