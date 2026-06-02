// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module HelpdeskDashboard
 * @description IT Helpdesk dashboard — ticket stats, create button, SLA countdown,
 *              recent tickets, FAQ quick links, category distribution (Sec 17.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Ticket,
  HelpCircle,
  ChevronRight,
  Wifi,
  Monitor,
  Key,
  Mail,
  HardDrive,
  UserCog,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  HelpdeskService,
  TICKET_STATUS_META,
  TICKET_PRIORITY_SLA,
  TICKET_CATEGORY_META,
  type SupportTicket,
  type KnowledgeBaseArticle,
} from '@/services/helpdeskService';

// ── Category Icon Map ──────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  it_equipment: Monitor,
  software_access: Key,
  network: Wifi,
  email: Mail,
  hardware: HardDrive,
  account: UserCog,
  other: HelpCircle,
};

// ── SLA Timer ─────────────────────────────────────────────────────────────────

function SLATimer({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('');
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setRemaining('Breached');
        setIsWarning(true);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m`);
      setIsWarning(diff < 2 * 3600000);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <span
      className={`text-xs font-medium flex items-center gap-1 ${isWarning ? 'text-red-600' : 'text-amber-600'}`}
    >
      <Clock className="w-3 h-3" />
      {remaining}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HelpdeskDashboardProps {
  employeeId?: string;
  onCreateTicket?: () => void;
  onViewTicket?: (ticketId: string) => void;
}

export function HelpdeskDashboard({
  employeeId = 'emp-001',
  onCreateTicket,
  onViewTicket,
}: HelpdeskDashboardProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<KnowledgeBaseArticle[]>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, f, s] = await Promise.all([
        HelpdeskService.getTickets({ employeeId }),
        HelpdeskService.getKnowledgeBase(),
        HelpdeskService.getTicketStats(employeeId),
      ]);
      setTickets(t);
      setFaqs(f.slice(0, 5));
      setStats(s);
      setLoading(false);
    };
    load();
  }, [employeeId]);

  const openTickets = tickets.filter((t) =>
    ['open', 'in_progress', 'pending_user', 'reopened'].includes(t.status)
  );

  // Category distribution
  const categoryDist = TICKET_CATEGORY_META.map((cat) => ({
    ...cat,
    count: tickets.filter((t) => t.category === cat.value).length,
  })).filter((c) => c.count > 0);

  const maxCount = Math.max(...categoryDist.map((c) => c.count), 1);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IT Helpdesk</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Report issues · Request access · Get support
          </p>
        </div>
        <button
          onClick={onCreateTicket}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Ticket</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Open',
            value: stats.open,
            icon: AlertCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'In Progress',
            value: stats.inProgress,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Resolved',
            value: stats.resolved,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Closed',
            value: stats.closed,
            icon: XCircle,
            color: 'text-slate-500',
            bg: 'bg-slate-100',
          },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Tickets with SLA */}
      {openTickets.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-indigo-500" />
            Open Tickets
          </h2>
          <div className="space-y-2">
            {openTickets.slice(0, 5).map((ticket) => {
              const statusMeta = TICKET_STATUS_META[ticket.status];
              const priorityMeta = TICKET_PRIORITY_SLA[ticket.priority];
              const CatIcon = CATEGORY_ICONS[ticket.category] ?? HelpCircle;
              return (
                <button
                  key={ticket.id}
                  onClick={() => onViewTicket?.(ticket.id)}
                  className="w-full bg-white rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <CatIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusMeta.bgColor} ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{ticket.ticketNumber}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs font-medium ${priorityMeta.color}`}>
                        {priorityMeta.label}
                      </span>
                      <SLATimer deadline={ticket.slaDeadline} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
          {openTickets.length > 5 && (
            <button className="mt-2 text-sm text-indigo-600 font-medium flex items-center gap-1">
              View all {openTickets.length} tickets <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </section>
      )}

      {/* Category Distribution */}
      {categoryDist.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Tickets by Category
          </h2>
          <div className="bg-white rounded-2xl p-4 space-y-3">
            {categoryDist.map((cat) => (
              <div key={cat.value}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{cat.label}</span>
                  <span className="text-sm font-bold text-gray-900">{cat.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(cat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick FAQ */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          Quick Help
        </h2>
        <div className="space-y-2">
          {faqs.map((faq) => {
            const CatIcon = CATEGORY_ICONS[faq.category] ?? HelpCircle;
            return (
              <button
                key={faq.id}
                className="w-full bg-white rounded-xl p-3.5 flex items-center gap-3 hover:shadow-sm transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <CatIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{faq.title}</p>
                  <p className="text-xs text-gray-500 truncate">{faq.summary}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">{faq.views}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default HelpdeskDashboard;
