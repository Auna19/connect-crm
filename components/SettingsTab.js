'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  Calendar, 
  Lock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function SettingsTab({ onResetDatabase, isResetting, onNotify }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-800">System Configuration & Provider Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage cryptographic security tokens, simulated testing adapters, and environment state.
        </p>
      </div>

      {/* Security & Cryptography Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock size={18} className="text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Cryptographic Cipher & Vault Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-0.5">Algorithm</span>
            <span className="font-mono font-bold text-slate-800 text-xs">AES-256-GCM</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-0.5">Key Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle2 size={13} /> Active (32 Bytes SHA-256)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-0.5">Secret Exposure</span>
            <span className="font-bold text-blue-700">0% Plaintext Leakage</span>
          </div>
        </div>
      </div>

      {/* Simulated Integration Providers Mode Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu size={18} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Deterministic QA Mock Providers</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} className="text-purple-600" />
              <div>
                <span className="font-bold text-slate-800 block">Simulated SMS Gateway</span>
                <span className="text-[11px] text-slate-500">
                  Logs outbound cellular notifications without incurring third-party carrier costs. Clearly marked as simulated in all responses.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 font-bold font-mono text-[10px]">
              Active Simulation
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Calendar size={18} className="text-cyan-600" />
              <div>
                <span className="font-bold text-slate-800 block">Mock Calendar Adapter</span>
                <span className="text-[11px] text-slate-500">
                  Simulates Google Calendar / Microsoft Outlook synchronization with server-side conflict guards.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-100 text-cyan-800 font-bold font-mono text-[10px]">
              Active Adapter
            </span>
          </div>
        </div>
      </div>

      {/* Database Reset Danger Zone */}
      <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-3 text-rose-800">
          <AlertTriangle size={18} />
          <h3 className="font-bold text-sm">System Reset & Seed Data Restore</h3>
        </div>

        <p className="text-slate-600">
          Restore the entire application to the initial baseline seed state. Re-populates the 5 customers, 10 orders (including EB-778213), 5 helpdesk tickets, 3 upcoming appointments, and resets QA test cases.
        </p>

        <button
          onClick={() => setShowConfirmReset(true)}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors disabled:opacity-50 shadow-xs"
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
          <span>Reset All Demo Data & Test Cases</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Database Reset?</h3>
            <p className="text-slate-500">
              This will overwrite current customer and ticket state with the pristine official demo seed data.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetDatabase();
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 font-bold text-white hover:bg-rose-700"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
