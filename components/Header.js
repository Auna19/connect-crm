'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  RotateCcw, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  onResetDatabase, 
  activeTabTitle,
  isResetting 
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles = [
    { id: 'qa', title: 'QA Engineer', tag: 'Full Test Lab Access' },
    { id: 'admin', title: 'Administrator', tag: 'Full Control & Secrets' },
    { id: 'agent', title: 'Support Agent', tag: 'Customer & Order CRM' },
    { id: 'auditor', title: 'Auditor', tag: 'Read-only Logs' }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
      {/* Current Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
          {activeTabTitle}
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Authoritative Engine Online
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Reset Database Button */}
        <button
          onClick={onResetDatabase}
          disabled={isResetting}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="Reset sample customers, orders, and test cases to initial seed state"
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span className="hidden md:inline">{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
          >
            <Shield size={14} className="text-blue-600" />
            <span className="font-mono text-slate-500 uppercase text-[10px]">Role:</span>
            <span>{currentRoleObj.title}</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Security Persona</p>
                <p className="text-xs text-slate-500">Test role-based access control and restrictions</p>
              </div>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${
                    currentRole === r.id ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-[10px] text-slate-400">{r.tag}</div>
                  </div>
                  {currentRole === r.id && <CheckCircle2 size={14} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="System alerts"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>System Alerts & Notifications</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">Simulated</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block">Mock SMS Dispatcher</span>
                  <span className="text-slate-500 text-[11px]">Ready for phone complaint notifications (TC-P21-008).</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block">AES-256-GCM Vault</span>
                  <span className="text-slate-500 text-[11px]">Connector credentials securely encrypted at rest.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
