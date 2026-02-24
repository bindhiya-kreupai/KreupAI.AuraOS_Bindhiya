/**
 * @module CandidateCommunicationHub
 * @description Unified candidate communication hub with email threads,
 *              SMS messaging, template-based composing, and conversation history
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Search,
  Paperclip,
  Clock,
  CheckCheck,
  Check,
  Star,
  StarOff,
  Archive,
  FileText,
  AlertCircle,
  Zap,
  ArrowLeft,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

type ChannelType = 'email' | 'sms';

type MessageDirection = 'outbound' | 'inbound';

type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending';

type TemplateCategory =
  | 'application_received'
  | 'interview_scheduled'
  | 'offer_sent'
  | 'rejection'
  | 'follow_up'
  | 'assessment'
  | 'general';

interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface ThreadMessage {
  id: string;
  channel: ChannelType;
  direction: MessageDirection;
  status: MessageStatus;
  subject?: string;
  body: string;
  timestamp: string;
  sender: string;
  senderRole?: string;
  attachments?: MessageAttachment[];
}

interface CandidateThread {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateAvatar?: string;
  jobTitle: string;
  stage: string;
  isStarred: boolean;
  isArchived: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  lastChannel: ChannelType;
  messages: ThreadMessage[];
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: TemplateCategory;
  channel: ChannelType;
  variables: string[];
  usageCount: number;
}

interface CandidateCommunicationHubProps {
  threads: CandidateThread[];
  templates: MessageTemplate[];
}

// ── Config ───────────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<MessageStatus, { icon: LucideIcon; color: string }> = {
  pending: { icon: Clock, color: 'text-silver-mist' },
  sent: { icon: Check, color: 'text-silver-mist' },
  delivered: { icon: CheckCheck, color: 'text-silver-mist' },
  read: { icon: CheckCheck, color: 'text-celestial-indigo' },
  failed: { icon: AlertCircle, color: 'text-coral-alert' },
};

const CHANNEL_CONFIG: Record<
  ChannelType,
  { icon: LucideIcon; label: string; color: string; bg: string }
> = {
  email: {
    icon: Mail,
    label: 'Email',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10',
  },
  sms: { icon: Phone, label: 'SMS', color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  application_received: 'Application Received',
  interview_scheduled: 'Interview Scheduled',
  offer_sent: 'Offer Sent',
  rejection: 'Rejection',
  follow_up: 'Follow Up',
  assessment: 'Assessment',
  general: 'General',
};

const STAGE_COLORS: Record<string, string> = {
  Applied: 'bg-silver-mist/20 text-silver-mist',
  Screening: 'bg-sunset-amber/10 text-sunset-amber',
  Interview: 'bg-celestial-indigo/10 text-celestial-indigo',
  'Technical Test': 'bg-nebula-purple/10 text-nebula-purple',
  Offer: 'bg-neural-mint/10 text-neural-mint',
  Hired: 'bg-neural-mint/20 text-neural-mint',
  Rejected: 'bg-coral-alert/10 text-coral-alert',
};

// ── Mock Data ────────────────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Application Received',
    subject: 'We received your application for {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nThank you for applying for the {{jobTitle}} position at AURA Technologies. We have received your application and our team is currently reviewing it.\n\nWe will be in touch within 5-7 business days with an update.\n\nBest regards,\nAURA Talent Team',
    category: 'application_received',
    channel: 'email',
    variables: ['candidateName', 'jobTitle'],
    usageCount: 234,
  },
  {
    id: 'tpl-2',
    name: 'Interview Invitation',
    subject: 'Interview Invitation — {{jobTitle}} at AURA Technologies',
    body: 'Hi {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{jobTitle}} position.\n\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nFormat: {{interviewFormat}}\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\nAURA Talent Team',
    category: 'interview_scheduled',
    channel: 'email',
    variables: ['candidateName', 'jobTitle', 'interviewDate', 'interviewTime', 'interviewFormat'],
    usageCount: 178,
  },
  {
    id: 'tpl-3',
    name: 'Technical Assessment Link',
    subject: 'Technical Assessment — {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nAs part of the {{jobTitle}} interview process, please complete the following assessment:\n\nLink: {{assessmentLink}}\nDeadline: {{deadline}}\n\nThe assessment should take approximately {{duration}}. Good luck!\n\nBest regards,\nAURA Talent Team',
    category: 'assessment',
    channel: 'email',
    variables: ['candidateName', 'jobTitle', 'assessmentLink', 'deadline', 'duration'],
    usageCount: 89,
  },
  {
    id: 'tpl-4',
    name: 'Offer Letter',
    subject: 'Offer of Employment — {{jobTitle}} at AURA Technologies',
    body: 'Dear {{candidateName}},\n\nWe are thrilled to extend an offer for the {{jobTitle}} position at AURA Technologies.\n\nPlease find your offer details in the attached document. The offer is valid until {{expiryDate}}.\n\nWe look forward to having you on the team!\n\nBest regards,\nAURA Talent Team',
    category: 'offer_sent',
    channel: 'email',
    variables: ['candidateName', 'jobTitle', 'expiryDate'],
    usageCount: 45,
  },
  {
    id: 'tpl-5',
    name: 'Rejection — Post Interview',
    subject: 'Update on your application — {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nThank you for taking the time to interview for the {{jobTitle}} position. After careful consideration, we have decided to move forward with another candidate.\n\nWe appreciate your interest and encourage you to apply for future positions.\n\nBest regards,\nAURA Talent Team',
    category: 'rejection',
    channel: 'email',
    variables: ['candidateName', 'jobTitle'],
    usageCount: 312,
  },
  {
    id: 'tpl-6',
    name: 'Interview Reminder (SMS)',
    subject: '',
    body: 'Hi {{candidateName}}, this is a reminder about your interview for {{jobTitle}} at AURA Technologies on {{interviewDate}} at {{interviewTime}}. Reply CONFIRM to confirm.',
    category: 'interview_scheduled',
    channel: 'sms',
    variables: ['candidateName', 'jobTitle', 'interviewDate', 'interviewTime'],
    usageCount: 156,
  },
  {
    id: 'tpl-7',
    name: 'Application Status (SMS)',
    subject: '',
    body: 'Hi {{candidateName}}, your application for {{jobTitle}} at AURA has moved to the next stage. Check your email for details. — AURA Talent',
    category: 'follow_up',
    channel: 'sms',
    variables: ['candidateName', 'jobTitle'],
    usageCount: 98,
  },
  {
    id: 'tpl-8',
    name: 'Follow Up — No Response',
    subject: 'Following up on your {{jobTitle}} application',
    body: "Hi {{candidateName}},\n\nWe wanted to follow up regarding your application for the {{jobTitle}} position. We sent you an interview invitation on {{sentDate}} but haven't heard back.\n\nAre you still interested in this opportunity? Please let us know.\n\nBest regards,\nAURA Talent Team",
    category: 'follow_up',
    channel: 'email',
    variables: ['candidateName', 'jobTitle', 'sentDate'],
    usageCount: 67,
  },
];

export const MOCK_THREADS: CandidateThread[] = [
  {
    id: 'thread-1',
    candidateId: 'cand-1',
    candidateName: 'Sarah Chen',
    candidateEmail: 'sarah.chen@email.com',
    candidatePhone: '+1 (415) 555-0192',
    jobTitle: 'Senior Software Engineer',
    stage: 'Interview',
    isStarred: true,
    isArchived: false,
    unreadCount: 2,
    lastMessage: 'Thank you! I can confirm the interview slot on Thursday at 2 PM.',
    lastMessageTime: '2026-02-24T10:30:00Z',
    lastChannel: 'email',
    messages: [
      {
        id: 'msg-1-1',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'We received your application for Senior Software Engineer',
        body: 'Hi Sarah,\n\nThank you for applying for the Senior Software Engineer position at AURA Technologies. We have received your application and our team is currently reviewing it.\n\nWe will be in touch within 5-7 business days with an update.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-15T09:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
      {
        id: 'msg-1-2',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        body: 'Thank you for the quick response! Looking forward to hearing from you.',
        timestamp: '2026-02-15T11:30:00Z',
        sender: 'Sarah Chen',
      },
      {
        id: 'msg-1-3',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'Interview Invitation — Senior Software Engineer at AURA Technologies',
        body: 'Hi Sarah,\n\nWe are pleased to invite you for an interview for the Senior Software Engineer position.\n\nDate: Thursday, February 27, 2026\nTime: 2:00 PM PST\nFormat: Video Call (link will be sent separately)\n\nPlease confirm your availability by replying to this email.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-20T14:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
        attachments: [
          { id: 'att-1', name: 'interview-prep-guide.pdf', size: '245 KB', type: 'pdf' },
        ],
      },
      {
        id: 'msg-1-4',
        channel: 'sms',
        direction: 'outbound',
        status: 'delivered',
        body: 'Hi Sarah, this is a reminder about your interview for Sr. Software Engineer at AURA on Feb 27 at 2PM PST. Reply CONFIRM to confirm.',
        timestamp: '2026-02-23T10:00:00Z',
        sender: 'AURA Talent',
      },
      {
        id: 'msg-1-5',
        channel: 'sms',
        direction: 'inbound',
        status: 'read',
        body: 'CONFIRM',
        timestamp: '2026-02-23T10:15:00Z',
        sender: 'Sarah Chen',
      },
      {
        id: 'msg-1-6',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        body: 'Thank you! I can confirm the interview slot on Thursday at 2 PM. Looking forward to it!\n\nBest,\nSarah',
        timestamp: '2026-02-24T10:30:00Z',
        sender: 'Sarah Chen',
      },
    ],
  },
  {
    id: 'thread-2',
    candidateId: 'cand-2',
    candidateName: 'Marcus Johnson',
    candidateEmail: 'marcus.j@outlook.com',
    candidatePhone: '+1 (212) 555-0847',
    jobTitle: 'Product Manager',
    stage: 'Technical Test',
    isStarred: false,
    isArchived: false,
    unreadCount: 0,
    lastMessage: 'Your technical assessment link has been sent. Please complete by March 1.',
    lastMessageTime: '2026-02-22T16:00:00Z',
    lastChannel: 'email',
    messages: [
      {
        id: 'msg-2-1',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'We received your application for Product Manager',
        body: 'Hi Marcus,\n\nThank you for applying for the Product Manager position. We will review your application shortly.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-10T09:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
      {
        id: 'msg-2-2',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'Technical Assessment — Product Manager',
        body: 'Hi Marcus,\n\nAs part of the Product Manager interview process, please complete the following assessment:\n\nLink: https://assess.aura.tech/pm-challenge-2026\nDeadline: March 1, 2026\n\nThe assessment should take approximately 90 minutes. Good luck!\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-22T16:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
    ],
  },
  {
    id: 'thread-3',
    candidateId: 'cand-3',
    candidateName: 'Priya Patel',
    candidateEmail: 'priya.patel@gmail.com',
    candidatePhone: '+1 (650) 555-0391',
    jobTitle: 'UX Designer',
    stage: 'Offer',
    isStarred: true,
    isArchived: false,
    unreadCount: 1,
    lastMessage: 'I have a couple of questions about the benefits package before signing.',
    lastMessageTime: '2026-02-24T08:45:00Z',
    lastChannel: 'email',
    messages: [
      {
        id: 'msg-3-1',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'Offer of Employment — UX Designer at AURA Technologies',
        body: 'Dear Priya,\n\nWe are thrilled to extend an offer for the UX Designer position at AURA Technologies.\n\nPlease find your offer details in the attached document. The offer is valid until March 10, 2026.\n\nWe look forward to having you on the team!\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-21T11:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Hiring Manager',
        attachments: [
          { id: 'att-2', name: 'offer-letter-priya-patel.pdf', size: '320 KB', type: 'pdf' },
          { id: 'att-3', name: 'benefits-overview.pdf', size: '1.2 MB', type: 'pdf' },
        ],
      },
      {
        id: 'msg-3-2',
        channel: 'sms',
        direction: 'outbound',
        status: 'delivered',
        body: 'Hi Priya, your offer letter for UX Designer at AURA has been sent to your email. Please review at your convenience. — AURA Talent',
        timestamp: '2026-02-21T11:05:00Z',
        sender: 'AURA Talent',
      },
      {
        id: 'msg-3-3',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        body: 'I have a couple of questions about the benefits package before signing. Could we schedule a quick call to discuss?\n\nThanks,\nPriya',
        timestamp: '2026-02-24T08:45:00Z',
        sender: 'Priya Patel',
      },
    ],
  },
  {
    id: 'thread-4',
    candidateId: 'cand-4',
    candidateName: 'James Wilson',
    candidateEmail: 'jwilson@protonmail.com',
    candidatePhone: '+1 (512) 555-0274',
    jobTitle: 'Data Analyst',
    stage: 'Screening',
    isStarred: false,
    isArchived: false,
    unreadCount: 0,
    lastMessage: 'Thank you for applying. We are reviewing your resume.',
    lastMessageTime: '2026-02-23T09:00:00Z',
    lastChannel: 'email',
    messages: [
      {
        id: 'msg-4-1',
        channel: 'email',
        direction: 'outbound',
        status: 'delivered',
        subject: 'We received your application for Data Analyst',
        body: 'Hi James,\n\nThank you for applying for the Data Analyst position at AURA Technologies. We are reviewing your resume and will get back to you shortly.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-23T09:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
    ],
  },
  {
    id: 'thread-5',
    candidateId: 'cand-5',
    candidateName: 'Elena Rodriguez',
    candidateEmail: 'elena.r@yahoo.com',
    candidatePhone: '+1 (310) 555-0618',
    jobTitle: 'DevOps Engineer',
    stage: 'Rejected',
    isStarred: false,
    isArchived: true,
    unreadCount: 0,
    lastMessage: 'Thank you for your time. I appreciate the feedback.',
    lastMessageTime: '2026-02-19T14:20:00Z',
    lastChannel: 'email',
    messages: [
      {
        id: 'msg-5-1',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'Update on your application — DevOps Engineer',
        body: 'Hi Elena,\n\nThank you for taking the time to interview for the DevOps Engineer position. After careful consideration, we have decided to move forward with another candidate.\n\nWe appreciate your interest and encourage you to apply for future positions.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-18T16:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
      {
        id: 'msg-5-2',
        channel: 'email',
        direction: 'inbound',
        status: 'read',
        body: 'Thank you for your time. I appreciate the feedback and hope to apply again in the future.\n\nBest,\nElena',
        timestamp: '2026-02-19T14:20:00Z',
        sender: 'Elena Rodriguez',
      },
    ],
  },
  {
    id: 'thread-6',
    candidateId: 'cand-6',
    candidateName: 'David Kim',
    candidateEmail: 'dkim@tech.io',
    candidatePhone: '+1 (408) 555-0935',
    jobTitle: 'Senior Software Engineer',
    stage: 'Interview',
    isStarred: false,
    isArchived: false,
    unreadCount: 1,
    lastMessage: 'Sounds great, I will be available for the panel interview.',
    lastMessageTime: '2026-02-24T07:10:00Z',
    lastChannel: 'sms',
    messages: [
      {
        id: 'msg-6-1',
        channel: 'email',
        direction: 'outbound',
        status: 'read',
        subject: 'Interview Invitation — Senior Software Engineer',
        body: 'Hi David,\n\nWe would like to invite you for a panel interview for the Senior Software Engineer role on Feb 28 at 10 AM PST.\n\nBest regards,\nAURA Talent Team',
        timestamp: '2026-02-23T15:00:00Z',
        sender: 'AURA Talent Team',
        senderRole: 'Recruiter',
      },
      {
        id: 'msg-6-2',
        channel: 'sms',
        direction: 'inbound',
        status: 'read',
        body: 'Sounds great, I will be available for the panel interview.',
        timestamp: '2026-02-24T07:10:00Z',
        sender: 'David Kim',
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Component ────────────────────────────────────────────────────────────────────

export const CandidateCommunicationHub: React.FC<CandidateCommunicationHubProps> = ({
  threads: initialThreads,
  templates,
}) => {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | ChannelType>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Compose state
  const [composeChannel, setComposeChannel] = useState<ChannelType>('email');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<'all' | ChannelType>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null;

  // Auto-scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread?.messages.length]);

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    if (!showArchived && t.isArchived) return false;
    if (showStarredOnly && !t.isStarred) return false;
    if (channelFilter !== 'all' && t.lastChannel !== channelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.candidateName.toLowerCase().includes(q) ||
        t.jobTitle.toLowerCase().includes(q) ||
        t.candidateEmail.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (templateFilter !== 'all' && t.channel !== templateFilter) return false;
    return true;
  });

  const handleSelectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
    // Mark as read
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)));
    setShowTemplates(false);
    setComposeSubject('');
    setComposeBody('');
  }, []);

  const handleToggleStar = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isStarred: !t.isStarred } : t))
    );
  }, []);

  const handleArchive = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isArchived: !t.isArchived } : t))
    );
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!selectedThread || !composeBody.trim()) return;

    const newMsg: ThreadMessage = {
      id: `msg-new-${Date.now()}`,
      channel: composeChannel,
      direction: 'outbound',
      status: 'sent',
      subject: composeChannel === 'email' ? composeSubject : undefined,
      body: composeBody,
      timestamp: new Date().toISOString(),
      sender: 'AURA Talent Team',
      senderRole: 'Recruiter',
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedThread.id
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: composeBody.slice(0, 80),
              lastMessageTime: newMsg.timestamp,
              lastChannel: composeChannel,
            }
          : t
      )
    );

    setComposeBody('');
    setComposeSubject('');
  }, [selectedThread, composeChannel, composeSubject, composeBody]);

  const handleUseTemplate = useCallback((template: MessageTemplate) => {
    setComposeChannel(template.channel);
    setComposeSubject(template.subject);
    setComposeBody(template.body);
    setShowTemplates(false);
  }, []);

  // ── Inbox List ────────────────────────────────────────────────────────────
  const renderInbox = () => (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="p-3 space-y-2 border-b border-cloud dark:border-nebula-purple/20">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-8 pr-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'email', 'sms'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-2 py-1 rounded-md text-[9px] font-bold transition-colors ${
                channelFilter === ch
                  ? 'bg-celestial-indigo text-white'
                  : 'text-silver-mist hover:bg-cloud/50 dark:hover:bg-nebula-purple/10'
              }`}
            >
              {ch === 'all' ? 'All' : ch.toUpperCase()}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setShowStarredOnly((p) => !p)}
            className={`p-1 rounded-md transition-colors ${showStarredOnly ? 'text-sunset-amber' : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'}`}
            title="Starred only"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowArchived((p) => !p)}
            className={`p-1 rounded-md transition-colors ${showArchived ? 'text-celestial-indigo' : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'}`}
            title="Show archived"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto text-silver-mist/40 mb-2" />
            <p className="text-[10px] text-silver-mist">No conversations found</p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const ChIcon = CHANNEL_CONFIG[thread.lastChannel].icon;
            return (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-cloud/50 dark:border-nebula-purple/10 transition-colors ${
                  isSelected
                    ? 'bg-celestial-indigo/5 border-l-2 border-l-celestial-indigo'
                    : 'hover:bg-cloud/30 dark:hover:bg-nebula-purple/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo">
                      {getInitials(thread.candidateName)}
                    </div>
                    {thread.unreadCount > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-coral-alert text-white text-[7px] font-bold flex items-center justify-center">
                        {thread.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] truncate ${thread.unreadCount > 0 ? 'font-bold text-ink-black dark:text-pearl' : 'font-semibold text-ink-black/80 dark:text-pearl/80'}`}
                      >
                        {thread.candidateName}
                      </span>
                      <span className="text-[8px] text-silver-mist shrink-0">
                        {formatTime(thread.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-bold ${STAGE_COLORS[thread.stage] || 'bg-silver-mist/20 text-silver-mist'}`}
                      >
                        {thread.stage}
                      </span>
                      <span className="text-[8px] text-silver-mist truncate">
                        · {thread.jobTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ChIcon
                        className={`w-2.5 h-2.5 shrink-0 ${CHANNEL_CONFIG[thread.lastChannel].color}`}
                      />
                      <p
                        className={`text-[9px] truncate ${thread.unreadCount > 0 ? 'font-semibold text-ink-black dark:text-pearl' : 'text-silver-mist'}`}
                      >
                        {thread.lastMessage}
                      </p>
                    </div>
                  </div>

                  {/* Star */}
                  {thread.isStarred && (
                    <Star className="w-3 h-3 text-sunset-amber fill-sunset-amber shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-2 border-t border-cloud dark:border-nebula-purple/20 flex items-center justify-between">
        <span className="text-[8px] text-silver-mist">
          {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[8px] text-silver-mist">
          {threads.reduce((s, t) => s + t.unreadCount, 0)} unread
        </span>
      </div>
    </div>
  );

  // ── Thread Detail ─────────────────────────────────────────────────────────
  const renderThread = () => {
    if (!selectedThread) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <MessageSquare className="w-12 h-12 text-silver-mist/30 mb-3" />
          <p className="text-[11px] font-semibold text-silver-mist">Select a conversation</p>
          <p className="text-[9px] text-silver-mist/70 mt-1">
            Choose a candidate thread from the inbox
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Thread Header */}
        <div className="p-3 border-b border-cloud dark:border-nebula-purple/20 flex items-center gap-3">
          <button
            onClick={() => setSelectedThreadId(null)}
            className="lg:hidden p-1 rounded-md text-silver-mist hover:text-ink-black dark:hover:text-pearl"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[11px] font-bold text-celestial-indigo shrink-0">
            {getInitials(selectedThread.candidateName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-ink-black dark:text-pearl">
                {selectedThread.candidateName}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${STAGE_COLORS[selectedThread.stage] || 'bg-silver-mist/20 text-silver-mist'}`}
              >
                {selectedThread.stage}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[8px] text-silver-mist">
              <span className="flex items-center gap-0.5">
                <Mail className="w-2.5 h-2.5" />
                {selectedThread.candidateEmail}
              </span>
              <span className="flex items-center gap-0.5">
                <Phone className="w-2.5 h-2.5" />
                {selectedThread.candidatePhone}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleStar(selectedThread.id)}
              className={`p-1.5 rounded-md transition-colors ${selectedThread.isStarred ? 'text-sunset-amber' : 'text-silver-mist hover:text-sunset-amber'}`}
            >
              {selectedThread.isStarred ? (
                <Star className="w-3.5 h-3.5 fill-current" />
              ) : (
                <StarOff className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => handleArchive(selectedThread.id)}
              className="p-1.5 rounded-md text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {selectedThread.messages.map((msg) => {
            const isOutbound = msg.direction === 'outbound';
            const StatusIcon = STATUS_ICON[msg.status].icon;
            const ChIcon = CHANNEL_CONFIG[msg.channel].icon;

            return (
              <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${isOutbound ? 'order-2' : 'order-1'}`}>
                  {/* Subject line for emails */}
                  {msg.subject && (
                    <p
                      className={`text-[8px] font-bold mb-0.5 px-1 ${isOutbound ? 'text-right text-celestial-indigo' : 'text-ink-black/60 dark:text-pearl/60'}`}
                    >
                      <Mail className="w-2.5 h-2.5 inline mr-0.5" />
                      {msg.subject}
                    </p>
                  )}

                  <div
                    className={`rounded-xl px-3 py-2 ${
                      isOutbound
                        ? 'bg-celestial-indigo text-white rounded-br-sm'
                        : 'bg-cloud/50 dark:bg-nebula-purple/10 text-ink-black dark:text-pearl rounded-bl-sm'
                    }`}
                  >
                    <p className="text-[10px] whitespace-pre-wrap leading-relaxed">{msg.body}</p>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] ${
                              isOutbound
                                ? 'bg-white/15'
                                : 'bg-white dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/20'
                            }`}
                          >
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate font-medium">{att.name}</span>
                            <span className="shrink-0 opacity-70">{att.size}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div
                    className={`flex items-center gap-1.5 mt-0.5 px-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <ChIcon className={`w-2.5 h-2.5 ${CHANNEL_CONFIG[msg.channel].color}`} />
                    <span className="text-[7px] text-silver-mist">{msg.sender}</span>
                    {msg.senderRole && (
                      <span className="text-[7px] text-silver-mist/60">· {msg.senderRole}</span>
                    )}
                    <span className="text-[7px] text-silver-mist">
                      {formatFullTime(msg.timestamp)}
                    </span>
                    {isOutbound && (
                      <StatusIcon className={`w-2.5 h-2.5 ${STATUS_ICON[msg.status].color}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Compose Area */}
        <div className="border-t border-cloud dark:border-nebula-purple/20 p-3 space-y-2">
          {/* Channel Toggle & Template */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-cloud dark:border-nebula-purple/20 overflow-hidden">
              {(['email', 'sms'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setComposeChannel(ch)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold transition-colors ${
                    composeChannel === ch
                      ? `${CHANNEL_CONFIG[ch].bg} ${CHANNEL_CONFIG[ch].color}`
                      : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
                  }`}
                >
                  {(() => {
                    const Icon = CHANNEL_CONFIG[ch].icon;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {CHANNEL_CONFIG[ch].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTemplates((p) => !p)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors ${
                showTemplates
                  ? 'border-celestial-indigo/30 bg-celestial-indigo/5 text-celestial-indigo'
                  : 'border-cloud dark:border-nebula-purple/20 text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              <Zap className="w-3 h-3" />
              Templates
            </button>
            <div className="flex-1" />
            <span className="text-[8px] text-silver-mist">
              {composeChannel === 'sms' ? `${composeBody.length}/160` : ''}
            </span>
          </div>

          {/* Template Picker */}
          {showTemplates && (
            <div className="border border-cloud dark:border-nebula-purple/20 rounded-xl bg-white dark:bg-stellar-blue p-2 max-h-[200px] overflow-y-auto space-y-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-bold text-ink-black dark:text-pearl">
                  Message Templates
                </p>
                <div className="flex gap-1">
                  {(['all', 'email', 'sms'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTemplateFilter(f)}
                      className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${
                        templateFilter === f
                          ? 'bg-celestial-indigo text-white'
                          : 'text-silver-mist hover:bg-cloud/50 dark:hover:bg-nebula-purple/10'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {filteredTemplates.map((tpl) => {
                const TplIcon = CHANNEL_CONFIG[tpl.channel].icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleUseTemplate(tpl)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-cloud/30 dark:hover:bg-nebula-purple/5 transition-colors"
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${CHANNEL_CONFIG[tpl.channel].bg}`}
                    >
                      <TplIcon className={`w-3 h-3 ${CHANNEL_CONFIG[tpl.channel].color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-semibold text-ink-black dark:text-pearl truncate">
                        {tpl.name}
                      </p>
                      <p className="text-[7px] text-silver-mist truncate">
                        {CATEGORY_LABELS[tpl.category]} · {tpl.usageCount} uses
                      </p>
                    </div>
                    <span className="text-[7px] text-silver-mist">{tpl.variables.length} vars</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Subject (email only) */}
          {composeChannel === 'email' && (
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Subject..."
              className="w-full px-3 py-1.5 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          )}

          {/* Body */}
          <div className="flex items-end gap-2">
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder={
                composeChannel === 'email' ? 'Write your email...' : 'Type SMS message...'
              }
              rows={composeChannel === 'email' ? 3 : 2}
              className="flex-1 px-3 py-2 text-[10px] rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
            />
            <div className="flex flex-col gap-1">
              {composeChannel === 'email' && (
                <button className="p-2 rounded-lg text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/20 transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={!composeBody.trim()}
                className="p-2 rounded-lg bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main Layout ───────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] h-[650px]">
        {/* Inbox Panel — hide on mobile when thread selected */}
        <div
          className={`border-r border-cloud dark:border-nebula-purple/20 flex flex-col ${selectedThreadId ? 'hidden lg:flex' : 'flex'}`}
        >
          {renderInbox()}
        </div>

        {/* Thread Panel — hide on mobile when no thread selected */}
        <div className={`flex flex-col ${!selectedThreadId ? 'hidden lg:flex' : 'flex'}`}>
          {renderThread()}
        </div>
      </div>
    </div>
  );
};

export default CandidateCommunicationHub;
