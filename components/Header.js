'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  RotateCcw, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  User,
  LogOut,
  Menu,
  Globe,
  LogIn,
  AlertTriangle,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  onResetDatabase, 
  activeTabTitle,
  isResetting,
  onToggleMobileMenu,
  onOpenLandingPage,
  currentUser,
  onOpenProfile,
  onLogout
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  const roles = [
    { id: 'qa', title: 'QA Engineer', tag: 'Full Test Lab Access' },
    { id: 'admin', title: 'Administrator', tag: 'Full Control & Secrets' },
    { id: 'agent', title: 'Support Agent', tag: 'Customer & Order CRM' },
    { id: 'auditor', title: 'Auditor', tag: 'Read-only Logs' }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  const confirmAndReset = () => {
    setShowConfirmResetModal(false);
    onResetDatabase?.();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
      {/* Current Page Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
          {activeTabTitle}
        </h1>

        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Authoritative Engine Online
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Profile Page Action Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
          title="Open Profile Page"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            {(currentUser?.name || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:inline text-xs font-semibold">{currentUser?.name?.split(' ')[0] || 'Profile'}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
          title="Log out of ConnectCRM"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>

        {/* Reset Database Button with Confirmation Safeguard */}
        <button
          onClick={() => setShowConfirmResetModal(true)}
          disabled={isResetting}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="Restore baseline sample data (requires confirmation)"
        >
          <RotateCcw size={14} className={isResetting ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span className="hidden md:inline">{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
          >
            <Shield size={14} className="text-blue-600 shrink-0" />
            <span className="hidden xl:inline font-mono text-slate-500 uppercase text-[10px]">Role:</span>
            <span className="truncate max-w-[90px] sm:max-w-none">{currentRoleObj.title}</span>
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
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>System Alerts & Notifications</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">Live</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block">Data Retention Shield</span>
                  <span className="text-slate-500 text-[11px]">All newly added data is retentive and safeguarded against automatic resets.</span>
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

      {/* Confirmation Safeguard Modal for Database Reset */}
      {showConfirmResetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Demo Database?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  This action will restore the 5 initial sample customers, 10 orders, and test cases back to pristine seed state. Any records you created without manually deleting them will be overwritten.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium">
              Note: If you want to keep your entered data, you can cancel and manage individual items using their respective Delete buttons.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel & Keep My Data
              </button>
              <button
                type="button"
                onClick={confirmAndReset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Restore Demo State
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
