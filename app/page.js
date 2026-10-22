'use client';

import React, { useState, useEffect } from 'react';
import Sidebar, { NAV_ITEMS } from '@/components/Sidebar';
import Header from '@/components/Header';
import OverviewTab from '@/components/OverviewTab';
import CustomersTab from '@/components/CustomersTab';
import OrdersTab from '@/components/OrdersTab';
import HelpdeskTab from '@/components/HelpdeskTab';
import CalendarTab from '@/components/CalendarTab';
import ConnectorsTab from '@/components/ConnectorsTab';
import WebhooksTab from '@/components/WebhooksTab';
import ApiExplorerTab from '@/components/ApiExplorerTab';
import TestLabTab from '@/components/TestLabTab';
import LogsTab from '@/components/LogsTab';
import SecurityTab from '@/components/SecurityTab';
import SettingsTab from '@/components/SettingsTab';
import { ShieldAlert, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState('qa'); // 'qa', 'admin', 'agent', 'auditor'
  const [stats, setStats] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/test-lab/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Demo records and test cases reset to initial state!', 'success');
        fetchStats();
      } else {
        showToast(data.error || 'Failed to reset database', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const currentTabObj = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];

  // RBAC Access Rule: Support Agent cannot access Connectors or Test Lab. Auditor can only access Logs and Overview.
  const isTabRestricted = 
    (currentRole === 'agent' && ['connectors', 'testlab', 'webhooks'].includes(activeTab)) ||
    (currentRole === 'auditor' && !['overview', 'logs', 'security'].includes(activeTab));

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
      {/* Collapsible Left Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          onResetDatabase={handleResetDatabase}
          activeTabTitle={currentTabObj.label}
          isResetting={isResetting}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
          <div className="max-w-7xl mx-auto space-y-6">
            {isTabRestricted ? (
              <div className="bg-white rounded-xl border border-rose-200 p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <ShieldAlert size={26} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Access Restricted by Role Policy</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your current role (<span className="font-bold uppercase text-slate-800">{currentRole}</span>) lacks required permission to access <span className="font-semibold">{currentTabObj.label}</span>. Switch to Administrator or QA Engineer to evaluate this module.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentRole('qa')}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                  >
                    Switch to QA Engineer
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Return to Overview
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    stats={stats} 
                    onNavigate={setActiveTab} 
                    onRefresh={fetchStats} 
                  />
                )}
                {activeTab === 'customers' && (
                  <CustomersTab onNotify={showToast} />
                )}
                {activeTab === 'orders' && (
                  <OrdersTab onNotify={showToast} />
                )}
                {activeTab === 'helpdesk' && (
                  <HelpdeskTab onNotify={showToast} />
                )}
                {activeTab === 'calendar' && (
                  <CalendarTab onNotify={showToast} />
                )}
                {activeTab === 'connectors' && (
                  <ConnectorsTab onNotify={showToast} />
                )}
                {activeTab === 'webhooks' && (
                  <WebhooksTab onNotify={showToast} />
                )}
                {activeTab === 'explorer' && (
                  <ApiExplorerTab onNotify={showToast} />
                )}
                {activeTab === 'testlab' && (
                  <TestLabTab onNotify={showToast} onRefreshStats={fetchStats} />
                )}
                {activeTab === 'logs' && (
                  <LogsTab onNotify={showToast} />
                )}
                {activeTab === 'security' && (
                  <SecurityTab 
                    currentRole={currentRole} 
                    setCurrentRole={setCurrentRole} 
                    onNotify={showToast} 
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab 
                    onResetDatabase={handleResetDatabase} 
                    isResetting={isResetting} 
                    onNotify={showToast} 
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium bg-slate-900 text-white border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400" />}
          {toast.type === 'info' && <Info size={16} className="text-blue-400" />}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
