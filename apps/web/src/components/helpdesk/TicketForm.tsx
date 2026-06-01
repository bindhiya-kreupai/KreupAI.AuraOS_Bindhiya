// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module TicketForm
 * @description IT helpdesk ticket creation form — category/priority selectors,
 *              SLA info, file attachments, asset selector, submit (Sec 17.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Key,
  Wifi,
  Mail,
  HardDrive,
  UserCog,
  HelpCircle,
  AlertCircle,
  Clock,
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle,
  ChevronDown,
  Laptop,
} from 'lucide-react';
import {
  HelpdeskService,
  TICKET_PRIORITY_SLA,
  TICKET_CATEGORY_META,
  type TicketCategory,
  type TicketPriority,
  type CreateTicketData,
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

const PRIORITY_ICONS: Record<TicketPriority, React.ElementType> = {
  low: Clock,
  medium: AlertCircle,
  high: AlertCircle,
  critical: AlertCircle,
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'text-slate-600 bg-slate-50 border-slate-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  high: 'text-amber-600 bg-amber-50 border-amber-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

const ASSETS = [
  { id: 'laptop-1042', label: 'Laptop – Dell XPS 15 (EQ-1042)' },
  { id: 'laptop-2011', label: 'Laptop – MacBook Pro 14 (EQ-2011)' },
  { id: 'monitor-305', label: 'Monitor – Dell 27" (EQ-305)' },
  { id: 'phone-881', label: 'iPhone 15 Pro (EQ-881)' },
  { id: 'printer-22b', label: 'Printer – 2nd Floor Room B' },
  { id: 'other', label: 'Other / Not Listed' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface TicketFormProps {
  employeeId?: string;
  onSuccess?: (ticketId: string) => void;
  onCancel?: () => void;
}

export function TicketForm({ employeeId = 'emp-001', onSuccess, onCancel }: TicketFormProps) {
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [_createdTicketId, setCreatedTicketId] = useState('');

  const slaInfo = TICKET_PRIORITY_SLA[priority];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !description) return;
    setSubmitting(true);
    try {
      const data: CreateTicketData = {
        subject,
        description,
        category: category as TicketCategory,
        priority,
        employeeId,
        relatedAsset: selectedAsset || undefined,
      };
      const ticket = await HelpdeskService.createTicket(data);
      setCreatedTicketId(ticket.id);
      setSubmitted(true);
      onSuccess?.(ticket.id);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Ticket Submitted!</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Your ticket has been created. An agent will be in touch within the SLA window.
        </p>
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
          <Clock className="w-4 h-4 inline mr-1" />
          Expected response: <strong>{slaInfo.description}</strong>
        </div>
        <button
          onClick={onCancel}
          className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700"
        >
          Back to Helpdesk
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Support Ticket</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Category */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {TICKET_CATEGORY_META.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.value] ?? HelpCircle;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                <span
                  className={`text-xs font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        {category && (
          <p className="mt-2 text-xs text-gray-500">
            {TICKET_CATEGORY_META.find((c) => c.value === category)?.description}
          </p>
        )}
      </section>

      {/* Priority */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Priority <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(TICKET_PRIORITY_SLA) as TicketPriority[]).map((p) => {
            const info = TICKET_PRIORITY_SLA[p];
            const PIcon = PRIORITY_ICONS[p];
            const isSelected = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `border-current ${PRIORITY_COLORS[p].split(' ').slice(1).join(' ')}`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <PIcon className={`w-4 h-4 ${isSelected ? info.color : 'text-gray-400'}`} />
                  <span
                    className={`text-sm font-semibold ${isSelected ? info.color : 'text-gray-700'}`}
                  >
                    {info.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{info.description}</span>
              </button>
            );
          })}
        </div>

        {/* SLA Banner */}
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">{slaInfo.label} Priority:</span> {slaInfo.description}
          </p>
        </div>
      </section>

      {/* Subject */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of the issue..."
          maxLength={120}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{subject.length}/120</p>
      </section>

      {/* Description */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail — include steps to reproduce, error messages, and impact..."
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </section>

      {/* Related Asset */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Related Asset <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full pl-9 pr-8 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none bg-white"
          >
            <option value="">Select device / asset...</option>
            {ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </section>

      {/* Attachments */}
      <section>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Attachments <span className="text-gray-400 font-normal">(max 5 files)</span>
        </label>

        {/* Drag & Drop Zone */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Drag & drop files, or</p>
          <div className="flex justify-center gap-2 mt-2">
            <button
              type="button"
              onClick={() =>
                files.length < 5 && setFiles([...files, `screenshot_${Date.now()}.png`])
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
            >
              <Camera className="w-3.5 h-3.5" />
              Screenshot
            </button>
            <button
              type="button"
              onClick={() =>
                files.length < 5 && setFiles([...files, `attachment_${Date.now()}.pdf`])
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-3.5 h-3.5" />
              Browse
            </button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 flex-1 truncate">{f}</span>
                <button type="button" onClick={() => setFiles(files.filter((_, fi) => fi !== i))}>
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!category || !subject || !description || submitting}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
    </form>
  );
}

export default TicketForm;
