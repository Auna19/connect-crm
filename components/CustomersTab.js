'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  PhoneCall, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  ShoppingBag,
  LifeBuoy,
  Calendar,
  Lock
} from 'lucide-react';

export default function CustomersTab({ onNotify }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Phone Call Simulation State (TC-P21-006)
  const [testPhone, setTestPhone] = useState('+1 (555) 234-5678');
  const [callResult, setCallResult] = useState(null);
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    primaryPhone: '',
    altPhone: '',
    address: '',
    status: 'active',
    verificationStatus: 'verified',
    internalNotes: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleSimulateCall = async (phoneToTest) => {
    const phone = phoneToTest || testPhone;
    setIsSimulatingCall(true);
    setCallResult(null);

    try {
      const res = await fetch('/api/customers/match-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setCallResult(data);
      if (data.matched) {
        onNotify?.('Caller matched successfully!', 'success');
      } else {
        onNotify?.('Unknown caller detected. Private data protected.', 'info');
      }
    } catch (err) {
      onNotify?.(`Simulation failed: ${err.message}`, 'error');
    } finally {
      setIsSimulatingCall(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchCustomers();
        onNotify?.(`Customer ${data.customer.firstName} created successfully!`, 'success');
        setNewCustomer({
          firstName: '',
          lastName: '',
          email: '',
          primaryPhone: '',
          altPhone: '',
          address: '',
          status: 'active',
          verificationStatus: 'verified',
          internalNotes: ''
        });
      } else {
        onNotify?.(data.error || 'Failed to create customer', 'error');
      }
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const viewCustomerDetails = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCustomer(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* TC-P21-006: Interactive Phone Match & Verification Security Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400">
              <PhoneCall size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Telephony Match & Caller Security Tester</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                  TC-P21-006 Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulate inbound phone calls to verify caller normalization, identity matching, and data disclosure protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTestPhone('+1 (555) 234-5678');
                handleSimulateCall('+1 (555) 234-5678');
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
            >
              Test Known: Alice (+1 555-234-5678)
            </button>
            <button
              onClick={() => {
                setTestPhone('+1 (555) 999-0000');
                handleSimulateCall('+1 (555) 999-0000');
              }}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition-colors"
            >
              Test Unknown (+1 555-999-0000)
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Enter phone number (e.g., +1 555 234 5678)"
              className="w-full bg-slate-950/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
            />
          </div>
          <button
            onClick={() => handleSimulateCall()}
            disabled={isSimulatingCall}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0 shadow-sm"
          >
            {isSimulatingCall ? 'Evaluating Security Rule...' : 'Simulate Inbound Call'}
          </button>
        </div>

        {/* Live Call Result Display */}
        {callResult && (
          <div className={`mt-4 p-4 rounded-lg border text-xs ${
            callResult.matched 
              ? 'bg-blue-950/30 border-blue-500/30 text-blue-200' 
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center justify-between font-bold mb-2">
              <span className="flex items-center gap-2">
                {callResult.matched ? (
                  <ShieldCheck size={16} className="text-emerald-400" />
                ) : (
                  <Lock size={16} className="text-amber-400" />
                )}
                <span>Caller Type: {callResult.callerType}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Correlation ID: {callResult.correlationId}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">System Greeting</span>
                <span className="font-semibold text-white text-sm">"{callResult.greeting}"</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Verification Policy</span>
                <span className="font-medium text-white">
                  {callResult.requiresVerification 
                    ? '⚠️ Restricted: Private disclosures locked pending order/email verification' 
                    : '✅ Verified: Account authorized for phone inquiry'}
                </span>
              </div>
            </div>

            {callResult.matched && callResult.customer?.recentOrderContext && (
              <div className="p-2.5 bg-slate-900/70 rounded border border-blue-500/20 text-[11px] text-slate-300">
                <span className="font-bold text-blue-400">Retrieved Order Context:</span> Order{' '}
                <span className="font-mono font-bold text-white">{callResult.customer.recentOrderContext.orderNumber}</span> —{' '}
                Status: <span className="text-emerald-400 font-bold">{callResult.customer.recentOrderContext.status}</span>{' '}
                (Est. Delivery: {callResult.customer.recentOrderContext.estimatedDeliveryDate})
              </div>
            )}

            {!callResult.matched && (
              <div className="p-2.5 bg-amber-900/30 rounded border border-amber-500/20 text-[11px] text-amber-100">
                <span className="font-bold text-amber-300">Security Prompt:</span> {callResult.verificationPrompt}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <Plus size={15} />
            <span>New Customer</span>
          </button>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Primary Phone</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{c.primaryPhone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c.verificationStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.verificationStatus === 'verified' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {c.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewCustomerDetails(c.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> View 360°
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360° Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCustomer.customer.firstName} {selectedCustomer.customer.lastName}
                </h3>
                <span className="text-xs font-mono text-slate-400">ID: {selectedCustomer.customer.id}</span>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Primary Phone</span>
                <span className="font-mono font-bold text-slate-800">{selectedCustomer.customer.primaryPhone}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-medium text-slate-800">{selectedCustomer.customer.email}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Address</span>
                <span className="text-slate-800">{selectedCustomer.customer.address || 'None'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-medium">Verification Status</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedCustomer.customer.verificationStatus}</span>
              </div>
            </div>

            {/* Linked Orders */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-blue-600" />
                Linked Order History ({selectedCustomer.history.orders.length})
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedCustomer.history.orders.map(o => (
                  <div key={o.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-600">{o.orderNumber}</span>
                    <span className="text-slate-600">${o.total.toFixed(2)}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {o.deliveryStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Tickets */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <LifeBuoy size={14} className="text-purple-600" />
                Support Tickets ({selectedCustomer.history.tickets.length})
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedCustomer.history.tickets.map(t => (
                  <div key={t.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-purple-700 mr-2">{t.ticketNumber}</span>
                      <span className="text-slate-700">{t.subject}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    required
                    type="text"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Phone *</label>
                  <input
                    required
                    type="text"
                    placeholder="+1 555 234 5678"
                    value={newCustomer.primaryPhone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, primaryPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alt Phone</label>
                  <input
                    type="text"
                    value={newCustomer.altPhone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, altPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
