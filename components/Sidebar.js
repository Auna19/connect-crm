'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  LifeBuoy,
  Calendar,
  Layers,
  Webhook,
  Terminal,
  FlaskConical,
  ScrollText,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  LogIn,
  UserCheck,
  User,
  LogOut,
  X
} from 'lucide-react';
import Link from 'next/link';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'helpdesk', label: 'Helpdesk & Tickets', icon: LifeBuoy },
  { id: 'calendar', label: 'Calendar & Appointments', icon: Calendar },
  { id: 'connectors', label: 'Integrations & Connectors', icon: Layers },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'explorer', label: 'API Explorer', icon: Terminal },
  { id: 'testlab', label: 'Integration Test Lab', icon: FlaskConical, badge: 'QA' },
  { id: 'logs', label: 'Execution History & Logs', icon: ScrollText },
  { id: 'security', label: 'Security & Permissions', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'My Profile', icon: UserCheck },
];

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenLandingPage,
  currentUser,
  onLogout
}) {
  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-200 border-r border-slate-800 ${
          /* Desktop behavior */
          'hidden md:flex shrink-0 ' + (collapsed ? 'w-20' : 'w-64')
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
          {!collapsed && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                C
              </div>
              <div className="min-w-0">
                <span className="font-bold text-white tracking-tight text-base block leading-none truncate">
                  Connect<span className="text-blue-400">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  Enterprise Platform
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        {!collapsed && (
          <div className="px-3 py-2 border-t border-slate-800/80 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserCheck size={14} className="text-blue-400" />
              <span className="truncate">{currentUser?.name || 'My Profile'}</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Environment / System Footer */}
        {!collapsed ? (
          <div className="p-3 border-t border-slate-800 bg-slate-950/30 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400">Data Shield</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              AES-256-GCM Secure
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-slate-800 text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" title="Active"></span>
          </div>
        )}
      </aside>

      {/* Mobile Drawer (Visible when mobileOpen is true on < md screens) */}
      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 flex flex-col z-50 md:hidden shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                C
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base block leading-none">
                  Connect<span className="text-blue-400">CRM</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  Mobile Menu
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
            <button
              onClick={() => {
                setMobileOpen(false);
                setActiveTab('profile');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <UserCheck size={15} className="text-blue-400" />
              <span>My Profile ({currentUser?.name?.split(' ')[0] || 'User'})</span>
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogout?.();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
