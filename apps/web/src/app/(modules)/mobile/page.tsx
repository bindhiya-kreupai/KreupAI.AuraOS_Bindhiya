'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone, Bell, WifiOff, CheckCircle2,
  Download, Shield, Fingerprint, MapPin,
  Camera, Clock, FileText, MessageSquare,
  Bot, Sparkles, Plus, Zap, Users,
  TrendingUp, Star, Settings2, Eye,
  MonitorSmartphone, Tablet, Watch,
  AppWindow, ChevronRight
} from 'lucide-react';
import { cn } from '@aura/ui/src/lib/utils';

// ── Mock Data ──────────────────────────────────────────────────────────
const MOBILE_STATS = [
  { title: 'Active Installs', value: '1.2K', icon: Smartphone, color: 'blue' },
  { title: 'Daily Active', value: '680', icon: Users, color: 'emerald' },
  { title: 'Push Delivered', value: '3.4K', icon: Bell, color: 'amber' },
  { title: 'Offline Syncs', value: '89', icon: WifiOff, color: 'violet' },
  { title: 'App Rating', value: '4.8', icon: Star, color: 'rose' },
];

const MOBILE_FEATURES = [
  { icon: Clock, title: 'Attendance & Check-in', desc: 'GPS + Facial recognition clock-in/out. Geofenced auto-check-in when entering office zone.', platforms: ['iOS', 'Android'], status: 'Live' },
  { icon: CheckCircle2, title: 'Approval Workflows', desc: 'Leave, expense, travel, and overtime approvals with swipe-to-approve. Batch approval support.', platforms: ['iOS', 'Android'], status: 'Live' },
  { icon: FileText, title: 'Payslip & Documents', desc: 'Encrypted payslip viewer, salary certificate download, HR letter requests from mobile.', platforms: ['iOS', 'Android'], status: 'Live' },
  { icon: MessageSquare, title: 'AI Chatbot', desc: 'Bilingual EN/AR chatbot for leave balance, policy queries, and HR helpdesk tickets.', platforms: ['iOS', 'Android'], status: 'Live' },
  { icon: Camera, title: 'Document Upload', desc: 'Scan and upload ID, visa, passport with OCR extraction. Auto-categorization.', platforms: ['iOS', 'Android'], status: 'Live' },
  { icon: Shield, title: 'Biometric Auth', desc: 'Face ID, Touch ID, and PIN-based authentication. OWASP MASVS compliant.', platforms: ['iOS', 'Android'], status: 'Live' },
];

export default function MobileExperienceCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'push' | 'offline'>('overview');
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const insights = [
      'Mobile adoption: 82% of employees use the app weekly. Top action: leave requests (34%), payslip views (28%).',
      'Push notification open rate: 67% — above industry average of 45%. Peak time: 8:30 AM for attendance reminders.',
      'Offline mode synced 89 attendance records today. Average sync delay: 4.2 seconds on reconnect.',
      'App store rating: 4.8★ (iOS), 4.7★ (Android). Latest review: "Best HR app I\'ve used — Arabic support is perfect."',
    ];
    setAiInsight(insights[Math.floor(Math.random() * insights.length)]);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'App Overview', icon: Smartphone },
    { id: 'features', label: 'Features', icon: AppWindow },
    { id: 'push', label: 'Push Notifications', icon: Bell },
    { id: 'offline', label: 'Offline & Sync', icon: WifiOff },
  ];

  return (
    <div className="min-h-screen bg-ghost-white dark:bg-deep-space p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink-black dark:text-pearl tracking-tight uppercase italic">
                Mobile Experience Center
              </h1>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">
                Native iOS & Android • Offline-First • Push Notifications • Biometric Auth
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl shadow-sm">
            <Download className="w-4 h-4" /> Download APK
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Settings2 className="w-4 h-4" /> Configure
          </button>
        </div>
      </div>

      {/* AI Sentinel */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-[2rem] p-6 shadow-xl shadow-blue-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10"><Bot className="w-32 h-32" /></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><Sparkles className="w-5 h-5 text-white" /></div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Mobile Intelligence</h3>
            <p className="text-sm text-white font-medium leading-relaxed">{aiInsight}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {MOBILE_STATS.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-stellar-blue rounded-3xl p-5 border border-cloud dark:border-nebula-purple/30 transition-all hover:shadow-xl group">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2.5 rounded-2xl",
                stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                  stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                    stat.color === 'amber' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                      stat.color === 'violet' ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600" :
                        "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
              )}><stat.icon className="w-5 h-5" /></div>
            </div>
            <p className="text-[10px] font-black text-silver-mist uppercase tracking-widest leading-none mb-1">{stat.title}</p>
            <div className="text-2xl font-black text-ink-black dark:text-pearl group-hover:text-blue-600 transition-colors">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-1.5 shadow-sm w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-slate-50 dark:hover:bg-slate-800"
            )}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'features' && <FeaturesTab />}
      {activeTab === 'push' && <PushTab />}
      {activeTab === 'offline' && <OfflineTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════
function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🍎', platform: 'iOS', version: '4.2.1', size: '48 MB', minOS: 'iOS 15+', store: 'App Store', rating: '4.8★', installs: '620' },
          { icon: '🤖', platform: 'Android', version: '4.2.1', size: '32 MB', minOS: 'Android 10+', store: 'Play Store', rating: '4.7★', installs: '580' },
          { icon: '🌐', platform: 'PWA', version: '4.2.0', size: '< 5 MB', minOS: 'Any Browser', store: 'Web Install', rating: '4.6★', installs: '120' },
        ].map((p, i) => (
          <div key={i} className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
            <span className="text-4xl block mb-4">{p.icon}</span>
            <h3 className="text-xl font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{p.platform}</h3>
            <p className="text-[10px] text-silver-mist font-bold uppercase tracking-widest mb-6">v{p.version} • {p.store}</p>
            <div className="space-y-3">
              {[
                { label: 'App Size', value: p.size },
                { label: 'Min OS', value: p.minOS },
                { label: 'Rating', value: p.rating },
                { label: 'Installs', value: p.installs },
              ].map((detail, j) => (
                <div key={j} className="flex justify-between">
                  <span className="text-[10px] font-bold text-silver-mist uppercase tracking-widest">{detail.label}</span>
                  <span className="text-xs font-black text-ink-black dark:text-pearl">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Device Support */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/20">
        <h3 className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight mb-6">Multi-Device Ecosystem</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Smartphone, label: 'Smartphone', desc: 'Native iOS & Android apps with full feature parity', status: 'Live' },
            { icon: Tablet, label: 'Tablet', desc: 'Optimized iPad/Android tablet layouts for managers', status: 'Live' },
            { icon: MonitorSmartphone, label: 'Desktop PWA', desc: 'Installable web app with native-like experience', status: 'Live' },
            { icon: Watch, label: 'Wearable', desc: 'Apple Watch & WearOS for quick attendance and approvals', status: 'Beta' },
          ].map((d, i) => (
            <div key={i} className="p-5 bg-white/80 dark:bg-slate-900/50 rounded-2xl text-center">
              <d.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <p className="font-black text-sm text-ink-black dark:text-pearl">{d.label}</p>
              <p className="text-[10px] text-silver-mist leading-relaxed mt-1 mb-2">{d.desc}</p>
              <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                d.status === 'Live' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              )}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Features
// ═══════════════════════════════════════════════════════════════
function FeaturesTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm">
        <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic mb-8">Mobile Feature Matrix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOBILE_FEATURES.map((f, i) => (
            <div key={i} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><f.icon className="w-5 h-5 text-blue-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-sm text-ink-black dark:text-pearl group-hover:text-blue-600 transition-colors">{f.title}</h4>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full uppercase tracking-widest">{f.status}</span>
                  </div>
                  <p className="text-xs text-silver-mist leading-relaxed mb-3">{f.desc}</p>
                  <div className="flex gap-2">
                    {f.platforms.map((p, j) => (
                      <span key={j} className="text-[8px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Push Notifications
// ═══════════════════════════════════════════════════════════════
function PushTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Bell className="w-48 h-48" /></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Push Notification Engine</h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">FCM + APNS • Segmented Delivery • A/B Testing</p>
            </div>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">+ Send Push</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl text-center">
              <p className="text-2xl font-black text-emerald-600">3.4K</p>
              <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Sent Today</p>
            </div>
            <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl text-center">
              <p className="text-2xl font-black text-blue-600">67%</p>
              <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Open Rate</p>
            </div>
            <div className="p-5 bg-violet-50/50 dark:bg-violet-900/10 rounded-2xl text-center">
              <p className="text-2xl font-black text-violet-600">2.1s</p>
              <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Avg Delivery</p>
            </div>
            <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl text-center">
              <p className="text-2xl font-black text-amber-600">12</p>
              <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest">Templates</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cloud dark:border-nebula-purple/20">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Category</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Trigger</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Delivery</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-silver-mist uppercase tracking-widest">Open %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/10">
                {[
                  { cat: 'Attendance Reminder', trigger: 'Daily @ 8:30 AM', delivery: 'Instant', open: '82%' },
                  { cat: 'Leave Approval', trigger: 'On submission', delivery: 'Instant', open: '91%' },
                  { cat: 'Payslip Ready', trigger: 'Monthly payroll close', delivery: 'Batch', open: '95%' },
                  { cat: 'Training Due', trigger: '7 days before deadline', delivery: 'Scheduled', open: '58%' },
                  { cat: 'Birthday / Anniversary', trigger: 'Day-of', delivery: 'Morning batch', open: '72%' },
                ].map((n, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-6 py-5 font-bold text-sm text-ink-black dark:text-pearl">{n.cat}</td>
                    <td className="px-6 py-5 text-xs text-silver-mist font-bold">{n.trigger}</td>
                    <td className="px-6 py-5"><span className="text-[9px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">{n.delivery}</span></td>
                    <td className="px-6 py-5 text-sm font-black text-ink-black dark:text-pearl">{n.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB: Offline & Sync
// ═══════════════════════════════════════════════════════════════
function OfflineTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><WifiOff className="w-48 h-48" /></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-black dark:text-pearl uppercase tracking-tight italic">Offline-First Architecture</h2>
              <p className="text-xs text-silver-mist font-bold uppercase tracking-widest">Local SQLite Cache • Background Sync • Conflict Resolution</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">All Synced</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Attendance Records', offline: true, cached: 89, pending: 0, lastSync: '2 min ago' },
              { title: 'Leave Requests', offline: true, cached: 12, pending: 1, lastSync: '5 min ago' },
              { title: 'Employee Directory', offline: true, cached: 450, pending: 0, lastSync: '1 hr ago' },
              { title: 'Payslips (Last 3)', offline: true, cached: 3, pending: 0, lastSync: '2 hr ago' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border border-cloud dark:border-nebula-purple/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black text-sm text-ink-black dark:text-pearl">{item.title}</h4>
                    <p className="text-[10px] text-silver-mist font-bold">Last sync: {item.lastSync}</p>
                  </div>
                  <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                    item.pending === 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>{item.pending === 0 ? 'Synced' : `${item.pending} Pending`}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center">
                    <p className="text-lg font-black text-ink-black dark:text-pearl">{item.cached}</p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">Cached</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center">
                    <p className="text-lg font-black text-emerald-600">✓</p>
                    <p className="text-[8px] font-black text-silver-mist uppercase tracking-widest">Offline Ready</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
