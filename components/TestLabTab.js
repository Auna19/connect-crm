'use client';

import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Eye, 
  Zap, 
  FileText,
  Sliders,
  X,
  RefreshCw,
  Award,
  Trash2
} from 'lucide-react';


const FAILURE_SCENARIOS = [
  { id: 'auth_failure_401', label: 'HTTP 401 Unauthorized', desc: 'Invalid or missing API Key / Bearer token' },
  { id: 'forbidden_403', label: 'HTTP 403 Forbidden', desc: 'Missing required scope (e.g. write_orders)' },
  { id: 'unknown_customer', label: 'HTTP 404 Unknown Customer', desc: 'Lookup against unseeded caller identifier' },
  { id: 'unknown_order', label: 'HTTP 404 Unknown Order (EB-000001)', desc: 'Authoritative lookup returns honest not found' },
  { id: 'rate_limit_429', label: 'HTTP 429 Rate Limit', desc: 'Threshold exceeded (>100 calls/min)' },
  { id: 'api_timeout_504', label: 'HTTP 504 Gateway Timeout', desc: 'Remote endpoint times out after 2000ms' },
  { id: 'internal_error_500', label: 'HTTP 500 Server Error', desc: 'Downstream unhandled connector exception' },
  { id: 'malformed_json', label: 'HTTP 400 Malformed JSON', desc: 'Payload corruption or broken syntax' },
  { id: 'calendar_conflict', label: 'HTTP 409 Booking Conflict', desc: 'Agent double-booking collision prevention' },
  { id: 'invalid_webhook_signature', label: 'HTTP 401 Invalid Signature', desc: 'Tampered HMAC-SHA256 signature payload' },
  { id: 'connection_refused', label: 'HTTP 503 Connection Refused', desc: 'ECONNREFUSED network layer simulation' }
];

export default function TestLabTab({ onNotify, onRefreshStats }) {
  const [testCases, setTestCases] = useState([]);
  const [summary, setSummary] = useState({ total: 3, passed: 0, failed: 0, notTested: 3, passRate: 0 });
  const [loading, setLoading] = useState(true);
  const [runningTestId, setRunningTestId] = useState(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [inspectedTestCase, setInspectedTestCase] = useState(null);

  // Failure Simulation State
  const [selectedScenario, setSelectedScenario] = useState('auth_failure_401');
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/test-cases');
      const data = await res.json();
      if (data.success) {
        setTestCases(data.testCases);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  const handleRunTest = async (testId) => {
    setRunningTestId(testId);
    try {
      const res = await fetch('/api/test-lab/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId })
      });
      const data = await res.json();
      fetchTestCases();
      onRefreshStats?.();

      if (data.status === 'Passed') {
        onNotify?.(`Test case ${testId} PASSED!`, 'success');
      } else {
        onNotify?.(`Test case ${testId} completed with status: ${data.status}`, 'error');
      }
    } catch (err) {
      onNotify?.(`Test execution failed: ${err.message}`, 'error');
    } finally {
      setRunningTestId(null);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunningAll(true);
    try {
      for (const tc of testCases) {
        await fetch('/api/test-lab/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId: tc.testId })
        });
      }
      await fetchTestCases();
      onRefreshStats?.();
      onNotify?.('All preconfigured test cases executed successfully!', 'success');
    } catch (err) {
      onNotify?.(`Run all error: ${err.message}`, 'error');
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleResetTest = async (testId) => {
    try {
      const res = await fetch(`/api/test-cases?testId=${testId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.(`Test case ${testId} state reset`, 'info');
        fetchTestCases();
        onRefreshStats?.();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleResetAllTests = async () => {
    if (!window.confirm('Reset all test execution results back to Not Tested?')) {
      return;
    }
    try {
      const res = await fetch('/api/test-cases', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify?.('All test cases reset to initial state', 'success');
        fetchTestCases();
        onRefreshStats?.();
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };


  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/test-lab/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: selectedScenario })
      });
      const data = await res.json();
      setSimResult(data);
      onRefreshStats?.();
      onNotify?.(`Failure scenario "${selectedScenario}" executed: HTTP ${data.httpStatus}`, 'info');
    } catch (err) {
      onNotify?.(`Simulation failed: ${err.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'TestID,Title,Status,HTTPStatus,ResponseTimeMs,ActualResult,Preconditions\n';
    const rows = testCases.map(t => 
      `"${t.testId}","${t.title}","${t.status}","${t.httpStatus || ''}","${t.responseTimeMs || ''}","${(t.actualResult || '').replace(/"/g, '""')}","${(t.preconditions || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connectcrm-qa-test-report-${Date.now()}.csv`;
    a.click();
    onNotify?.('QA Test Execution Report exported to CSV!', 'success');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={13} /> Passed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle size={13} /> Failed
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle size={13} /> Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">
            <Clock size={13} /> Not Tested
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Lab Summary Dashboard Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">QA Integration Test Lab & Assertion Suite</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              Enterprise QA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end integration verification, fault injection testing, and least-privilege permission validation.
          </p>
        </div>

        {/* Global Test Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={handleResetAllTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
            title="Reset all test case execution records"
          >
            <RotateCcw size={14} />
            <span>Reset All Runs</span>
          </button>

          <button
            onClick={handleRunAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <Play size={14} className={isRunningAll ? 'animate-spin' : ''} />
            <span>{isRunningAll ? 'Executing Suite...' : 'Run All Test Cases'}</span>
          </button>
        </div>
      </div>


      {/* Pass Rate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Pass Rate</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {summary.passRate}%
          </div>
          <span className="text-[11px] text-slate-400">Calculated from actual runs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block mb-1">Passed Cases</span>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">
            {summary.passed}
          </div>
          <span className="text-[11px] text-slate-400">Zero tolerance failures</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block mb-1">Failed Cases</span>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">
            {summary.failed}
          </div>
          <span className="text-[11px] text-slate-400">Assertion or scope violations</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Pending Tests</span>
          <div className="text-2xl font-bold text-slate-700 tracking-tight">
            {summary.notTested}
          </div>
          <span className="text-[11px] text-slate-400">Ready to execute</span>
        </div>
      </div>

      {/* Preconfigured Test Cases Suite */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Award size={17} className="text-blue-600" />
          Mandatory Preconfigured Acceptance Test Cases
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {testCases.map((tc) => {
            const isRunning = runningTestId === tc.testId;

            return (
              <div 
                key={tc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      {tc.testId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{tc.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(tc.status)}
                    {tc.status !== 'Not Tested' && (
                      <button
                        onClick={() => handleResetTest(tc.testId)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Clear execution result"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRunTest(tc.testId)}
                      disabled={isRunning || isRunningAll}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
                    >
                      <Play size={13} className={isRunning ? 'animate-spin' : ''} />
                      <span>{isRunning ? 'Running...' : 'Run Test'}</span>
                    </button>
                  </div>
                </div>


                {/* Test Metadata & Expected vs Actual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider">
                      Preconditions & Setup
                    </span>
                    <p className="text-slate-700 leading-relaxed">{tc.preconditions}</p>
                    <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider pt-1">
                      Expected Result
                    </span>
                    <p className="text-slate-700 leading-relaxed">{tc.expectedResult}</p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                          Actual Execution Outcome
                        </span>
                        {tc.responseTimeMs && (
                          <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock size={11} /> {tc.responseTimeMs}ms
                          </span>
                        )}
                      </div>
                      <p className={`leading-relaxed font-medium ${
                        tc.status === 'Passed' ? 'text-emerald-700' :
                        tc.status === 'Failed' ? 'text-rose-700' : 'text-slate-400 italic'
                      }`}>
                        {tc.actualResult || 'Test has not been executed yet. Click "Run Test" to evaluate.'}
                      </p>
                    </div>

                    {tc.responsePayload && (
                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => setInspectedTestCase(tc)}
                          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-xs"
                        >
                          <Eye size={13} /> View Audit Evidence & Payloads
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controlled Fault Injection & Simulation Panel (Section 11) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-600/30 border border-rose-500/40 text-rose-400">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Controlled Failure Injection & Edge Simulator</h3>
              <p className="text-xs text-slate-300">
                Safely inject timeouts, authentication rejections, malformed responses, and network collisions without disrupting production.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 shadow-sm"
          >
            <Play size={13} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? 'Injecting Fault...' : 'Simulate Failure Scenario'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-4 text-xs">
          {FAILURE_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenario === scenario.id;
            return (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-rose-950/60 border-rose-500 text-white shadow-xs' 
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">{scenario.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{scenario.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Live Simulation Output Box */}
        {simResult && (
          <div className={`p-4 rounded-lg border text-xs ${
            simResult.httpStatus < 400 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center justify-between font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={15} />
                <span>Simulation Result: HTTP {simResult.httpStatus}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400">Duration: {simResult.durationMs}ms</span>
                <button
                  onClick={() => setSimResult(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded"
                  title="Clear simulation result"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <p className="font-mono text-white text-xs">{simResult.error || 'Fault injected and recorded in execution history.'}</p>
          </div>

        )}
      </div>

      {/* Evidence & Payload Inspector Modal */}
      {inspectedTestCase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {inspectedTestCase.testId}: {inspectedTestCase.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Executed: {new Date(inspectedTestCase.executedAt).toLocaleString()}</span>
              </div>
              <button onClick={() => setInspectedTestCase(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-xs text-slate-700 block mb-1">Actual Result Summary:</span>
                <p className="text-xs p-2.5 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800">
                  {inspectedTestCase.actualResult}
                </p>
              </div>

              <div>
                <span className="font-bold text-xs text-slate-700 block mb-1">Execution Evidence Payload:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono max-h-72 overflow-y-auto border border-slate-800">
                  {JSON.stringify(inspectedTestCase.responsePayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
