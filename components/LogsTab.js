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
  Smartphone
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

  return (
    <div className="space-y-6">
      {/* Logs Header & View Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Unified Execution Telemetry & Audit Trail</h2>
          <p className="text-xs text-slate-500">
            End-to-end request tracing with correlation IDs, latency tracking, and sensitive token redaction.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              Security Audit
            </button>
            <button
              onClick={() => setLogType('sms')}
              className={`px-3 py-1 rounded-md transition-colors ${
                logType === 'sms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Simulated SMS
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success Only</option>
            <option value="error">Errors & Faults</option>
          </select>

          <select
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700"
          >
            <option value="all">All Integrations</option>
            <option value="Retailer Voice">Retailer Voice Gateway</option>
            <option value="GlobalDesk">GlobalDesk Cloud</option>
            <option value="Inbound Webhook">Inbound Webhook Gateway</option>
            <option value="Simulation">Simulation Fault Injector</option>
          </select>
        </div>
      )}

      {/* Main Table Card */}
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
                  <th className="px-4 py-3">HTTP Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3 text-right">Details</th>
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
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Trace
                        </button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((aud) => (
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
                  </tr>
                ))}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((s) => (
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
                    <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">{s.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Execution Telemetry Trace</h3>
                <span className="text-xs font-mono text-blue-600">ID: {selectedLog.id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono max-h-72 overflow-y-auto border border-slate-800">
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
