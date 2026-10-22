'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ShieldAlert
} from 'lucide-react';

export default function SecurityTab({ currentRole, setCurrentRole, onNotify }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch('/api/auth/session', {
      headers: { 'x-user-role': currentRole }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setSession(d);
      })
      .catch(console.error);
  }, [currentRole]);

  const permissions = [
    { key: 'canManageIntegrations', label: 'Configure Connectors & Webhooks' },
    { key: 'canViewSecrets', label: 'View Plaintext Secrets (Vault Root)' },
    { key: 'canRunTests', label: 'Execute QA Test Cases & Fault Injection' },
    { key: 'canManageCustomers', label: 'Create & Edit Customer Records' },
    { key: 'canManageOrders', label: 'Modify Orders & Delivery Status' },
    { key: 'canManageTickets', label: 'Assign & Resolve Support Tickets' },
    { key: 'canManageCalendar', label: 'Schedule Consultations & Callbacks' },
    { key: 'canViewAuditLogs', label: 'Inspect Security Audit Logs' },
    { key: 'canResetDatabase', label: 'System Wipe / Demo Database Reset' }
  ];

  const roles = [
    { id: 'admin', title: 'Administrator' },
    { id: 'qa', title: 'QA Engineer' },
    { id: 'agent', title: 'Support Agent' },
    { id: 'auditor', title: 'Read-only Auditor' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Role-Based Access Control (RBAC) & Governance</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
              Enforced Server-Side
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation of duties. Restricted operations are rejected with HTTP 403 by API routes regardless of client modifications.
          </p>
        </div>

        {/* Current Active Persona Badge */}
        {session && (
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
              {session.user.role.toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">{session.user.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">{session.user.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Authorization Matrix by Role</h3>
          <span className="text-xs text-slate-400">Click a role button in the header to switch persona</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Security Capability / Action</th>
                {roles.map(r => (
                  <th key={r.id} className="px-4 py-3 text-center">
                    <span className={currentRole === r.id ? 'text-blue-600 font-bold' : ''}>
                      {r.title}
                      {currentRole === r.id && ' (Active)'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.key} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.label}</td>
                  {roles.map(r => {
                    const isAllowed = session?.rolePermissionsMatrix?.[r.id]?.[p.key];
                    return (
                      <td key={r.id} className="px-4 py-3 text-center">
                        {isAllowed ? (
                          <CheckCircle2 size={16} className="inline text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="inline text-slate-300" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Least Privilege & Secret Storage Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Least-Privilege Integration Scopes</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Per requirement Section 8, the Retailer Phone integration is strictly granted only the minimal required scopes:
          </p>
          <div className="flex gap-2 font-mono text-[11px]">
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-bold">
              read_contact
            </span>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-bold">
              read_orders
            </span>
          </div>
          <p className="text-slate-500 text-[11px] pt-1">
            Ticket creation, calendar operations, or excessive write scopes are blocked by the connector validator.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Lock size={18} className="text-blue-600" />
            <span>AES-256-GCM Cryptographic Vault</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Connector secrets and tokens are encrypted at rest with Node.js crypto AES-256-GCM using authenticated Galois/Counter Mode.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
            <li>Frontend API responses mask values as <code className="font-mono text-slate-700">••••••••xxxx</code></li>
            <li>HTTP logs recursively redact authorization headers</li>
            <li>Server-side request forgery (SSRF) filters protect private subnets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
