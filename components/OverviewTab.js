'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Truck, 
  LifeBuoy, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Award,
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function OverviewTab({ stats, onNavigate, onRefresh }) {
  const [dateRange, setDateRange] = useState('all');

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Activity className="animate-spin mx-auto mb-2 text-blue-600" size={28} />
        Loading real-time enterprise metrics...
      </div>
    );
  }

  const {
    totalCustomers = 0,
    totalOrders = 0,
    ordersAwaitingDelivery = 0,
    openTickets = 0,
    highPriorityTickets = 0,
    upcomingAppointments = 0,
    activeIntegrations = 0,
    failedRequests = 0,
    apiSuccessRate = 100,
    avgResponseTime = 45,
    testPassRate = 0,
    passedTests = 0,
    totalExecutedTests = 0,
    ticketStatusDistribution = {},
    orderStatusDistribution = {},
    channelDistribution = {},
    recentActivity = []
  } = stats;

  const metricCards = [
    {
      id: 'customers',
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'blue',
      subtext: 'Active CRM directory records',
      tab: 'customers'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'indigo',
      subtext: 'Retail order history',
      tab: 'orders'
    },
    {
      id: 'awaiting_delivery',
      title: 'Awaiting Delivery',
      value: ordersAwaitingDelivery,
      icon: Truck,
      color: 'amber',
      subtext: 'In transit & processing',
      tab: 'orders'
    },
    {
      id: 'open_tickets',
      title: 'Open Support Tickets',
      value: openTickets,
      icon: LifeBuoy,
      color: 'purple',
      subtext: 'Unified omnichannel queue',
      tab: 'helpdesk'
    },
    {
      id: 'high_priority',
      title: 'High-Priority Tickets',
      value: highPriorityTickets,
      icon: AlertTriangle,
      color: 'rose',
      subtext: 'Requires urgent resolution',
      tab: 'helpdesk'
    },
    {
      id: 'appointments',
      title: 'Upcoming Appointments',
      value: upcomingAppointments,
      icon: Calendar,
      color: 'cyan',
      subtext: 'Consultations & callbacks',
      tab: 'calendar'
    },
    {
      id: 'active_integrations',
      title: 'Active Integrations',
      value: activeIntegrations,
      icon: Layers,
      color: 'emerald',
      subtext: 'Encrypted connector endpoints',
      tab: 'connectors'
    },
    {
      id: 'failed_requests',
      title: 'Failed Integration Calls',
      value: failedRequests,
      icon: XCircle,
      color: failedRequests > 0 ? 'rose' : 'slate',
      subtext: 'Logged errors & simulated faults',
      tab: 'logs'
    },
    {
      id: 'api_success_rate',
      title: 'API Success Rate',
      value: `${apiSuccessRate}%`,
      icon: CheckCircle,
      color: apiSuccessRate >= 90 ? 'emerald' : 'amber',
      subtext: 'Based on authoritative logs',
      tab: 'logs'
    },
    {
      id: 'avg_latency',
      title: 'Avg API Response Time',
      value: `${avgResponseTime}ms`,
      icon: Clock,
      color: 'blue',
      subtext: 'Endpoint performance',
      tab: 'logs'
    },
    {
      id: 'test_pass_rate',
      title: 'Integration Test Pass Rate',
      value: `${testPassRate}%`,
      icon: Award,
      color: testPassRate === 100 ? 'emerald' : testPassRate > 0 ? 'amber' : 'slate',
      subtext: `${passedTests} passed of ${totalExecutedTests} run`,
      tab: 'testlab'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Operational & Integration Telemetry</h2>
          <p className="text-xs text-slate-500">Live authoritative CRM data, external connector states, and QA test executions.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Time Range:</span>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time (Authoritative)</option>
          </select>
        </div>
      </div>

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.tab)}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </span>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
                {card.value}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{card.subtext}</span>
                <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Delivery Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Order Delivery Status Distribution</h3>
            <span className="text-xs text-slate-400">{totalOrders} total orders</span>
          </div>
          <div className="space-y-3">
            {Object.entries(orderStatusDistribution).map(([status, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              const colorClass = 
                status === 'Delivered' ? 'bg-emerald-500' :
                status === 'Shipped' ? 'bg-blue-500' :
                status === 'Processing' ? 'bg-indigo-500' :
                status === 'OutForDelivery' ? 'bg-cyan-500' :
                status === 'Delayed' ? 'bg-amber-500' : 'bg-slate-400';
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} transition-all duration-500`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets Channel Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Unified Helpdesk Tickets by Channel</h3>
            <span className="text-xs text-slate-400">{openTickets} open tickets</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Object.entries(channelDistribution).map(([channel, count]) => {
              const channelColors = {
                phone: 'border-l-4 border-l-blue-600 bg-blue-50/40 text-blue-900',
                web: 'border-l-4 border-l-purple-600 bg-purple-50/40 text-purple-900',
                email: 'border-l-4 border-l-emerald-600 bg-emerald-50/40 text-emerald-900',
                api: 'border-l-4 border-l-amber-600 bg-amber-50/40 text-amber-900'
              };
              return (
                <div key={channel} className={`p-3 rounded-lg border border-slate-200 ${channelColors[channel] || ''}`}>
                  <span className="text-xs font-semibold capitalize block text-slate-500">{channel} Channel</span>
                  <span className="text-xl font-bold">{count}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tickets logged</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Omnichannel Assurance:</span> Phone complaints and web form submissions are synchronized into a single unified queue per requirements (TC-P21-008).
          </div>
        </div>
      </div>

      {/* Recent Audit & Activity Trail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Recent Audit Events & Integration Activity</h3>
          </div>
          <button 
            onClick={() => onNavigate('logs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Complete Logs <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No recent events recorded yet.</p>
          ) : (
            recentActivity.map((event) => (
              <div key={event.id} className="py-2.5 flex items-start justify-between text-xs gap-4">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                    {event.action}
                  </span>
                  <div>
                    <span className="font-medium text-slate-800">{event.details}</span>
                    <span className="text-slate-400 text-[11px] block">
                      Entity: {event.entity} #{event.entityId}
                    </span>
                  </div>
                </div>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
