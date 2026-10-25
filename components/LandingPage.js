'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  LifeBuoy, 
  Calendar, 
  Layers, 
  Webhook, 
  FlaskConical, 
  ScrollText, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Activity, 
  Terminal, 
  Zap, 
  Globe, 
  PhoneCall, 
  Check, 
  ChevronRight,
  Database,
  Key,
  Clock,
  ExternalLink,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage({ onLaunchDashboard }) {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      id: 'customer',
      title: 'Customer Intelligence & 360° Identity',
      subtitle: 'Authoritative Identity Resolution & Security Verification',
      icon: Users,
      badge: 'Core CRM',
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Streamline customer discovery and identity verification. Instantly match callers by primary or alternate phone numbers, enforce strict verification levels, and inspect comprehensive customer histories.',
      capabilities: [
        'Deterministic phone number matching (E.164 normalization)',
        'Multi-tiered customer verification status enforcement',
        'Customer 360° view unifying orders, support tickets, and appointments',
        'Internal account notes, corporate manager tags, and direct deletion controls'
      ],
      metric: '99.98% Match Precision',
      demoTag: 'TC-P21-006 Verified'
    },
    {
      id: 'order',
      title: 'Order Tracking & Speech Normalization',
      subtitle: 'Real-Time Order Lifecycle & Gateway Resilience',
      icon: ShoppingBag,
      badge: 'Orders Engine',
      gradient: 'from-indigo-600 to-violet-600',
      description: 'Track orders with instant authoritativeness. Features an intelligent speech normalizer that extracts order IDs from noisy or conversational inputs, with automatic timeout recovery and duplicate suppression.',
      capabilities: [
        'Natural speech query normalization (e.g. "Where my order EB 7 7 8 2 1 3 dey?" → "EB-778213")',
        'Honest 404 response compliance with zero fabricated or hallucinated data',
        'Simulated 504 gateway timeout fallback with auto-ticket creation',
        'Live fulfillment, tracking number sync, and itemized billing records'
      ],
      metric: '< 15ms Authoritative Lookup',
      demoTag: 'TC-P21-007 Verified'
    },
    {
      id: 'helpdesk',
      title: 'Omnichannel Helpdesk & Support Tickets',
      subtitle: 'Unified Queuing with Simulated SMS Dispatch',
      icon: LifeBuoy,
      badge: 'Omnichannel Support',
      gradient: 'from-purple-600 to-pink-600',
      description: 'Centralize support inquiries across phone, web, email, and API channels. Auto-escalate urgent delivery disputes, maintain full call transcripts, and dispatch real-time SMS notifications.',
      capabilities: [
        'Unified cross-channel queue grouping phone, web, and chat tickets',
        'Intelligent idempotency prevents duplicate tickets on network retries',
        'Integrated simulated SMS dispatcher clearly labelled for compliance',
        'Real-time priority escalation and department queue assignments'
      ],
      metric: 'Zero Duplicate Escalations',
      demoTag: 'TC-P21-008 Verified'
    },
    {
      id: 'calendar',
      title: 'Smart Calendar & Booking Engine',
      subtitle: 'Double-Booking Conflict Prevention & Free Slot Discovery',
      icon: Calendar,
      badge: 'Scheduling',
      gradient: 'from-cyan-600 to-blue-600',
      description: 'Manage agent schedules with zero collision risk. Checks agent availability across time zones, calculates free consultation windows, and prevents overlapping reservations automatically.',
      capabilities: [
        'Mathematical double-booking collision prevention with HTTP 409 protection',
        'Free slots discovery engine generating available 30-min consultation windows',
        'Time-zone aware scheduling with Zoom/Video meeting links',
        'Cancel and delete appointment lifecycle management'
      ],
      metric: '100% Conflict Free',
      demoTag: 'Conflict Engine Active'
    },
    {
      id: 'connectors',
      title: 'Integrations & Connector Management',
      subtitle: 'AES-256-GCM Vault & Least-Privilege Scopes',
      icon: Layers,
      badge: 'Enterprise Security',
      gradient: 'from-blue-600 to-teal-600',
      description: 'Connect third-party enterprise clouds, retailer gateways, and internal microservices. Store API credentials with AES-256-GCM encryption, rotate secrets on demand, and audit excessive permission scopes.',
      capabilities: [
        'Encrypted credentials at rest using AES-256-GCM authenticated cipher',
        'One-click secret rotation generating fresh cryptographic keys',
        'Automated least-privilege permission audits detecting excess scopes',
        'Live connection verification measuring roundtrip network latency'
      ],
      metric: 'AES-256-GCM Encryption',
      demoTag: 'Least-Privilege Audited'
    },
    {
      id: 'webhooks',
      title: 'Authoritative Webhooks Gateway',
      subtitle: 'HMAC-SHA256 Signatures & Replay Attack Defense',
      icon: Webhook,
      badge: 'Event Gateway',
      gradient: 'from-emerald-600 to-teal-600',
      description: 'Push and receive real-time webhook events with enterprise cryptographic integrity. Validates HMAC signatures, enforces a 5-minute replay window, and provides a full JSON payload inspector.',
      capabilities: [
        'Outbound event dispatcher signing payloads with HMAC-SHA256 headers',
        'Inbound webhook receiver with 5-minute replay attack window defense',
        'Complete delivery attempt telemetry including HTTP codes and latency',
        'Live JSON payload inspector for audit compliance and debugging'
      ],
      metric: 'HMAC-SHA256 Authenticated',
      demoTag: 'Replay-Protected'
    },
    {
      id: 'testlab',
      title: 'Integration Test Lab & Assertions',
      subtitle: 'Preconfigured QA Suites & Fault Injection Simulator',
      icon: FlaskConical,
      badge: 'QA & Compliance',
      gradient: 'from-amber-600 to-rose-600',
      description: 'Evaluate system resilience without production risk. Execute automated preconfigured test cases for caller security, order normalization, and phone complaints, plus safely simulate 11 failure scenarios.',
      capabilities: [
        'Automated test runs for TC-P21-006, TC-P21-007, and TC-P21-008',
        'Live failure simulation: HTTP 401, 403, 404, 429, 500, 504, 409 collisions',
        'Cryptographic evidence capture and detailed assertion logs',
        'Exportable CSV test reports with per-case reset and clear controls'
      ],
      metric: '100% Pass Rate Target',
      demoTag: 'Section 11 Simulation Lab'
    },
    {
      id: 'logs',
      title: 'Execution Telemetry & Audit Trails',
      subtitle: 'End-to-End Correlation Tracing & Redaction Audits',
      icon: ScrollText,
      badge: 'Observability',
      gradient: 'from-slate-700 to-slate-900',
      description: 'Complete observability over every API execution and administrative action. Trace requests across distributed boundaries using correlation IDs, verify sensitive token redaction, and export audit trails.',
      capabilities: [
        'End-to-end telemetry with correlation IDs, latency tracking, and status codes',
        'Comprehensive security audit trails recording entity mutations and role switches',
        'Automatic token and secret masking preserving caller confidentiality',
        'Individual log deletion and full view clearing with instant CSV export'
      ],
      metric: '100% Traceability',
      demoTag: 'Full Redaction Audit'
    }
  ];

  const currentFeature = features[activeFeatureIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
              C
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Connect<span className="text-blue-400">CRM</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block -mt-1">
                Enterprise & QA Platform
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#testlab" className="hover:text-white transition-colors">Test Lab</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login?mode=signin"
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <span>Launch Platform</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[200px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Authoritative Enterprise Platform for Customer & Voice Operations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Next-Gen CRM, Omnichannel Helpdesk & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">QA Test Lab</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Unify customer identity resolution, order tracking, and support ticketing with bank-grade AES-256 encryption, HMAC webhooks, and an interactive integration testing suite.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/login?mode=signup"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Get Started (Sign Up)</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/login?mode=signin"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700 shadow-lg flex items-center gap-2"
            >
              <span>Sign In to Platform</span>
            </Link>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block">Security</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={16} className="text-emerald-400" />
                AES-256-GCM Vault
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block">Integrations</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Webhook size={16} className="text-blue-400" />
                HMAC-SHA256 Webhooks
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block">Data Integrity</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Database size={16} className="text-purple-400" />
                Retentive Database
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block">QA Compliance</span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <FlaskConical size={16} className="text-amber-400" />
                11 Fault Simulators
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 8 Core Features Showcase */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            8 Powerful Modules Engineered for Performance
          </h2>
          <p className="text-slate-400 text-sm">
            Everything your operations team needs: caller matching, conversational order tracking, unified tickets, collision-free scheduling, and complete QA test automation.
          </p>
        </div>

        {/* Feature Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const isActive = activeFeatureIndex === idx;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFeatureIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 font-bold'
                    : 'bg-slate-800/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={`mb-1.5 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <span className="truncate w-full text-center sm:text-left">{f.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Card */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {currentFeature.badge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-700/60 text-slate-300">
                  {currentFeature.demoTag}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentFeature.title}
                </h3>
                <p className="text-sm font-semibold text-blue-400 mt-1">
                  {currentFeature.subtitle}
                </p>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {currentFeature.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {currentFeature.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={onLaunchDashboard}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-blue-600/30"
                >
                  <span>Open {currentFeature.title.split(' ')[0]} Module</span>
                  <ArrowRight size={14} />
                </button>
                <div className="text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
                  Benchmarked: <span className="text-emerald-400 font-bold">{currentFeature.metric}</span>
                </div>
              </div>
            </div>

            {/* Feature Mockup Preview Card */}
            <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-700/80 p-5 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[11px] text-slate-400">connectcrm/{currentFeature.id}.api</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300 space-y-1">
                  <span className="text-emerald-400 font-bold block">// Security Redaction & Integrity:</span>
                  <div>• Authorization: Bearer [REDACTED]</div>
                  <div>• Encrypted Secrets: AES-256-GCM Vault</div>
                  <div>• Data Retentive Mode: Active</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300 space-y-1">
                  <span className="text-blue-400 font-bold block">// Authoritative Status:</span>
                  <div>• Correlation ID: req-8891238</div>
                  <div>• Response Time: 4ms</div>
                  <div>• Deletion Action: Direct & Confirmed</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-purple-300 font-bold">
                  ✓ Enterprise Zero-Tolerance Assertions Passed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Reliability Section */}
      <section id="architecture" className="py-20 border-t border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Enterprise Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered with Zero Data Loss Guarantees
            </h2>
            <p className="text-slate-400 text-sm">
              Built from the ground up for authoritative precision, cryptographic credential storage, and resilient edge fault recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Database size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Retentive Data Persistence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual-file atomic writing and automated backup recovery prevent unexpected data resets. Added customers, orders, and tickets remain retentive until you explicitly delete them.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Cryptographic Vault & RBAC</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connectors encrypt keys at rest using AES-256-GCM. Four distinct personas (QA Lead, Admin, Support Agent, Auditor) enforce strict least-privilege scoping across all modules.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Edge Resilience & Fault Testing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Handle timeouts gracefully with instant ticket creation and callback scheduling. Simulate 11 edge fault scenarios safely in the Integration Test Lab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section (id="security") */}
      <section id="security" className="py-20 border-t border-slate-800 bg-slate-900/60 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Enterprise Security & Compliance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bank-Grade Encryption, Cryptographic Vault & RBAC
            </h2>
            <p className="text-slate-400 text-sm">
              Built with zero-trust architecture, authenticated ciphers, and deterministic role segregation to protect enterprise customer data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-white">AES-256-GCM Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                External connector secrets are encrypted at rest with Node.js crypto AES-256-GCM. Decrypted solely in memory for authorized API requests.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Zero Plaintext Leakage</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Webhook size={20} />
              </div>
              <h3 className="text-base font-bold text-white">HMAC Signatures</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All outbound and inbound webhook events are signed and verified with HMAC-SHA256 headers, backed by a strict 5-minute replay defense.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Replay Attack Protected</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-white">4-Tier RBAC Scoping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict least-privilege policies for Administrator, QA Lead, Support Agent, and Auditor. Enforced server-side with HTTP 403 gates.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Least-Privilege Audited</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ScrollText size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Log Sanitization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sensitive headers matching authorization, secret, token, apiKey, and password are recursively replaced with [REDACTED] in all telemetry.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Compliance Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Test Lab & QA Automation Suite (id="testlab") */}
      <section id="testlab" className="py-20 border-t border-slate-800 bg-slate-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              QA Automation & Test Lab
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive Integration Testing & Fault Injection Suite
            </h2>
            <p className="text-slate-400 text-sm">
              Execute core acceptance tests, simulate partner outages, and test timeout resilience with instant audit evidence generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* TC-P21-006 Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  TC-P21-006
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Passed (42ms)
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Caller Security & Telephony Match</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Normalizes caller numbers to E.164. Verifies private account data is locked for unverified callers until authenticated.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                assert caller.match === "Alice Johnson"
              </div>
            </div>

            {/* TC-P21-007 Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  TC-P21-007
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Passed (52ms)
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Order Tracking & Speech Normalization</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Extracts order IDs from conversational speech ("Where my order EB 7 7 8 2 1 3 dey?"). Enforces honest HTTP 404 responses.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                normalize("EB 7 7 8 2 1 3") → "EB-778213"
              </div>
            </div>

            {/* TC-P21-008 Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  TC-P21-008
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Passed (48ms)
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Phone Complaint & Unified Queue</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Groups phone complaints into unified helpdesk queue, dispatches simulated SMS reference code, and suppresses duplicate tickets.
                </p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                idempotencyKey.check() === unique
              </div>
            </div>
          </div>

          {/* Controlled Fault Injector Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <h4 className="text-sm font-bold text-slate-200">
              11 Controlled Fault Injection Simulators Included
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">504 Gateway Timeout</span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">401 Unauthorized</span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">403 Forbidden</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">404 Not Found</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">409 Booking Conflict</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">429 Rate Limit</span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">500 Server Error</span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">Malformed JSON</span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">Invalid HMAC Signature</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Experience ConnectCRM?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Test the live CRM modules, simulate partner voice calls, run integration test cases, or inspect encrypted connector configurations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login?mode=signup"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Create Account & Launch</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login?mode=signin"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700 shadow-md"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              C
            </div>
            <span className="font-bold text-slate-300">ConnectCRM Enterprise Suite</span>
            <span>— Authoritative CRM & Integration Test Lab</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Authoritative Engine Online</span>
            <span>•</span>
            <span>AES-256-GCM Secure</span>
            <span>•</span>
            <Link href="/login?mode=signin" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
