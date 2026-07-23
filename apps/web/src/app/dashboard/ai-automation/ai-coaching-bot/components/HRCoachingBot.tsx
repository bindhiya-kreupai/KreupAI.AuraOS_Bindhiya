'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Bot,
  User,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  History,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  PanelLeftOpen,
  PanelLeftClose,
  Zap,
  Scale,
  ChevronRight,
  CheckCircle2,
  FileText,
  Calendar,
  ExternalLink,
  BookOpen,
  FileDown,
} from 'lucide-react';
import {
  aiCoachingBot,
  type CoachingAutomationAction,
  type CoachingConfigResponse,
  type CoachingRecommendation,
} from '@/lib/services/ai-automation-client';
import { getMessageReferences } from '@/lib/ai/coaching-references';
import {
  exportCoachingConversationPdf,
  exportCoachingMessagePdf,
} from '@/lib/ai/export-coaching-pdf';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AutomationAction = CoachingAutomationAction;

type MessageType = 'user' | 'bot';

type DecisionOption = {
  id: string;
  label: string;
  pros: string[];
  cons: string[];
  recommendation?: boolean;
};

type ChatMessage = {
  id: number | string;
  type: MessageType;
  content: string;
  timestamp: string;
  provider?: 'groq' | 'openai' | 'gemini';
  suggestions?: string[];
  actions?: AutomationAction[];
  decisions?: {
    title: string;
    context: string;
    options: DecisionOption[];
    recommendedAction?: string;
  };
  citations?: { title: string; source: string; policyId?: string; href?: string }[];
  sources?: {
    index: number;
    title: string;
    source: string;
    snippet?: string;
    similarity?: number;
    policyId?: string;
    href?: string;
  }[];
  employeeContext?: {
    name: string;
    employeeCode: string;
    department?: string;
    jobTitle?: string;
    pendingLeaveRequests?: number;
    approvedLeaveDaysYtd?: number;
    latestPerformanceRating?: number;
    tenureMonths?: number;
  };
  grounded?: boolean;
  automationsQueued?: { task: string; status: 'ready' | 'pending' }[];
};

type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type ChatData = {
  threads: Thread[];
  activeThreadId: string | null;
  conversations: Record<string, ChatMessage[]>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'aura_hr_coaching_bot';

const ASSISTANT = {
  name: 'Aura HR Coach',
  color: '#6366f1',
};

const SUGGESTED_PROMPTS = [
  'How to handle underperformance?',
  'Preparing for a promotion review',
  'Conflict resolution strategies',
  'Review pending leave approvals',
  'Who is at attrition risk?',
  'Draft constructive feedback',
];

const createWelcomeMessage = (): ChatMessage => ({
  id: 1,
  type: 'bot',
  content: `Hello! I'm your **Aura HR Coach**. I help HR professionals make informed decisions and automate routine tasks.

**Decision support** — underperformance, promotions, conflicts, leave, separations
**Task automation** — draft documents, schedule meetings, trigger workflows
**Policy guidance** — best practices with policy citations

What HR challenge are you working on today?`,
  timestamp: new Date().toISOString(),
  suggestions: SUGGESTED_PROMPTS.slice(0, 4),
});

const createThread = (): Thread => ({
  id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: 'New Chat',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const getDefaultData = (): ChatData => {
  const thread = createThread();
  return {
    threads: [thread],
    activeThreadId: thread.id,
    conversations: { [thread.id]: [createWelcomeMessage()] },
  };
};

const loadStoredData = (): ChatData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatData;
    if (!parsed.threads?.length || !parsed.activeThreadId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveData = (data: ChatData) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
};

/** Lightweight markdown renderer for bot messages */
function BotMessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={i}
              className="text-base font-semibold text-ink-black dark:text-pearl mt-3 first:mt-0"
            >
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={i} className="font-semibold text-ink-black dark:text-pearl">
              {trimmed.slice(2, -2)}
            </p>
          );
        }
        if (trimmed.startsWith('- ')) {
          const text = trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, '$1');
          const boldMatch = trimmed.slice(2).match(/^\*\*(.+?)\*\*(.*)/);
          return (
            <li key={i} className="ml-4 list-disc leading-6 text-sm">
              {boldMatch ? (
                <>
                  <span className="font-semibold">{boldMatch[1]}</span>
                  {boldMatch[2]}
                </>
              ) : (
                text
              )}
            </li>
          );
        }
        if (trimmed.startsWith('⚠️')) {
          return (
            <p
              key={i}
              className="text-amber-700 dark:text-amber-400 text-sm font-medium bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2"
            >
              {trimmed}
            </p>
          );
        }

        const parts = trimmed.split(/(\*\*.+?\*\*)/g);
        return (
          <p key={i} className="leading-7 text-sm">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HRCoachingBot() {
  const router = useRouter();
  const [data, setData] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | string | null>(null);
  const [exportingPdf, setExportingPdf] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<CoachingRecommendation[]>([]);
  const [aiConfig, setAiConfig] = useState<CoachingConfigResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    const stored = loadStoredData();
    setData(stored ?? getDefaultData());
    setIsLoading(false);

    aiCoachingBot.getRecommendations().then((res) => {
      if (res.success && res.data?.recommendations) {
        setRecommendations(res.data.recommendations);
      }
    });

    aiCoachingBot.getConfig().then((res) => {
      if (res.success && res.data) {
        setAiConfig(res.data);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const activeId = data?.activeThreadId;
    if (activeId && data?.conversations?.[activeId]) {
      setMessages(data.conversations[activeId]);
    } else {
      setMessages([createWelcomeMessage()]);
    }
  }, [data?.activeThreadId, data?.conversations]);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  const updateConversation = useCallback(
    (activeThreadId: string, newMessages: ChatMessage[], userQuery?: string) => {
      setData((prev) => {
        if (!prev) return prev;
        const existing = prev.conversations[activeThreadId] || [];
        const isFirstUserMsg = existing.filter((m) => m.type === 'user').length === 0;
        const nextTitle =
          userQuery && isFirstUserMsg
            ? userQuery.length > 48
              ? `${userQuery.slice(0, 48)}...`
              : userQuery
            : undefined;

        return {
          ...prev,
          conversations: { ...prev.conversations, [activeThreadId]: newMessages },
          threads: prev.threads.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  title: nextTitle ?? t.title,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        };
      });
    },
    []
  );

  const handleSendMessage = async (overrideText?: string) => {
    const queryText = (overrideText ?? inputValue).trim();
    if (!queryText || !data?.activeThreadId || isTyping) return;

    const activeThreadId = data.activeThreadId;
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    const withUser = [...messages, userMessage];
    setMessages(withUser);
    setInputValue('');
    setIsTyping(true);

    const history = messages
      .map((m) => ({
        role: (m.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
      .slice(-10);

    try {
      const result = await aiCoachingBot.sendMessage(
        queryText,
        sessionIdRef.current || undefined,
        history
      );

      if (result.success && result.data) {
        if (result.data.sessionId) sessionIdRef.current = result.data.sessionId;

        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content:
            result.data.response ||
            result.data.message ||
            "I'm here to help. Could you provide more details about your HR situation?",
          timestamp: result.data.timestamp || new Date().toISOString(),
          provider: result.data.provider,
          suggestions: result.data.suggestions,
          actions: result.data.actions,
          decisions: result.data.decisions,
          citations: result.data.citations,
          sources: result.data.sources,
          employeeContext: result.data.employeeContext,
          grounded: result.data.grounded,
          automationsQueued: result.data.automationsQueued,
        };

        const full = [...withUser, botMessage];
        setMessages(full);
        updateConversation(activeThreadId, full, queryText);
      } else {
        throw new Error(result.error || 'Request failed');
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : undefined;
      const errMsg: ChatMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: detail?.includes('GROQ_API_KEY')
          ? `⚠️ **AI not configured.** Add \`GROQ_API_KEY\` (or OpenAI/Gemini) to your environment and restart the server.`
          : detail || 'Sorry, there was an error connecting to the HR Coach. Please try again.',
        timestamp: new Date().toISOString(),
      };
      const full = [...withUser, errMsg];
      setMessages(full);
      updateConversation(activeThreadId, full, queryText);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = async (action: AutomationAction) => {
    if (action.type === 'navigate' && action.path) {
      router.push(action.path);
      return;
    }

    setRunningAction(action.id);
    try {
      const result = await aiCoachingBot.runAutomation(action.id, action.payload);
      if (result.success && result.data) {
        const confirmMsg: ChatMessage = {
          id: Date.now(),
          type: 'bot',
          content: result.data.message || `✅ "${action.label}" completed.`,
          timestamp: new Date().toISOString(),
        };
        const activeThreadId = data?.activeThreadId;
        if (activeThreadId) {
          const full = [...messages, confirmMsg];
          setMessages(full);
          updateConversation(activeThreadId, full);
        }
        if (result.data.path) router.push(result.data.path);
      }
    } catch {
      /* silent */
    } finally {
      setRunningAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (!data?.activeThreadId) return;
    const welcome = createWelcomeMessage();
    setMessages([welcome]);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        conversations: { ...prev.conversations, [prev.activeThreadId!]: [welcome] },
        threads: prev.threads.map((t) =>
          t.id === prev.activeThreadId
            ? { ...t, title: 'New Chat', updatedAt: new Date().toISOString() }
            : t
        ),
      };
    });
  };

  const createNewThread = () => {
    const newThread = createThread();
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        threads: [newThread, ...prev.threads],
        activeThreadId: newThread.id,
        conversations: {
          ...prev.conversations,
          [newThread.id]: [createWelcomeMessage()],
        },
      };
    });
    setInputValue('');
    setShowHistory(true);
  };

  const switchThread = (threadId: string) => {
    setData((prev) => (prev ? { ...prev, activeThreadId: threadId } : prev));
    setInputValue('');
  };

  const deleteThread = (threadId: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const remaining = prev.threads.filter((t) => t.id !== threadId);
      const threads = remaining.length > 0 ? remaining : [createThread()];
      const nextActive = prev.activeThreadId === threadId ? threads[0].id : prev.activeThreadId;
      const conversations = { ...prev.conversations };
      delete conversations[threadId];
      if (!conversations[nextActive!]) {
        conversations[nextActive!] = [createWelcomeMessage()];
      }
      return { threads, activeThreadId: nextActive, conversations };
    });
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 1200);
    } catch {
      /* ignore */
    }
  };

  const handleExportMessagePdf = (message: ChatMessage) => {
    if (message.type !== 'bot') return;
    const id = String(message.id);
    setExportingPdf(id);
    try {
      exportCoachingMessagePdf(message, { filename: 'hr-coach-response' });
    } finally {
      setTimeout(() => setExportingPdf(null), 600);
    }
  };

  const handleExportConversationPdf = () => {
    if (!data?.activeThreadId) return;
    const thread = data.threads.find((t) => t.id === data.activeThreadId);
    setExportingPdf('conversation');
    try {
      exportCoachingConversationPdf(messages, {
        title: thread?.title,
        filename: thread?.title || 'hr-coach-conversation',
      });
    } finally {
      setTimeout(() => setExportingPdf(null), 600);
    }
  };

  const getRecentQuestions = () =>
    (data?.conversations?.[data.activeThreadId!] || [])
      .filter((m) => m.type === 'user')
      .slice(-8)
      .reverse();

  const providerLabel = (provider?: string) => {
    switch (provider) {
      case 'groq':
        return 'Groq';
      case 'openai':
        return 'OpenAI';
      case 'gemini':
        return 'Gemini';
      default:
        return null;
    }
  };

  const activeProviderLabel = aiConfig?.aiEnabled
    ? providerLabel(aiConfig.primary ?? undefined) || 'AI'
    : null;

  const actionIcon = (type: AutomationAction['type']) => {
    switch (type) {
      case 'navigate':
        return <ExternalLink className="h-3.5 w-3.5" />;
      case 'draft':
        return <FileText className="h-3.5 w-3.5" />;
      case 'schedule':
        return <Calendar className="h-3.5 w-3.5" />;
      default:
        return <Zap className="h-3.5 w-3.5" />;
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] min-h-[520px] overflow-hidden flex flex-col bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/40 dark:to-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-cloud dark:border-nebula-purple/50 bg-white/90 dark:bg-stellar-blue/90 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink-black dark:text-pearl">
                {ASSISTANT.name}
              </h1>
              <p className="text-xs text-silver-mist flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                HR decisions, policy guidance & task automation
                <span className="inline-flex items-center gap-1 ml-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      aiConfig?.aiEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span
                    className={
                      aiConfig?.aiEnabled
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600'
                    }
                  >
                    {activeProviderLabel
                      ? `AI · ${activeProviderLabel}${aiConfig?.model ? ` (${aiConfig.model})` : ''}${aiConfig?.ragEnabled ? ' · RAG' : ''}${aiConfig?.jurisdiction ? ` · ${aiConfig.jurisdiction.countryCode}` : ''}`
                      : 'AI unavailable — configure GROQ_API_KEY'}
                  </span>
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportConversationPdf}
              disabled={exportingPdf === 'conversation' || messages.length < 2}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Export conversation as PDF"
            >
              {exportingPdf === 'conversation' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Export PDF
            </button>
            <button
              onClick={createNewThread}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              title="Chat history"
            >
              {showHistory ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              title="Clear chat"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* History sidebar */}
        {showHistory && (
          <div className="w-72 border-r border-cloud dark:border-nebula-purple/50 bg-white/80 dark:bg-stellar-blue/80 backdrop-blur flex flex-col shrink-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="font-semibold text-sm text-ink-black dark:text-pearl flex items-center gap-2">
                <History className="h-4 w-4" /> Chats
              </h3>
              <button
                onClick={createNewThread}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                + New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-2">
              {data.threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border ${
                    data.activeThreadId === thread.id
                      ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                      : 'border-cloud dark:border-nebula-purple/30'
                  }`}
                >
                  <button
                    onClick={() => switchThread(thread.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-medium truncate text-ink-black dark:text-pearl">
                      {thread.title}
                    </p>
                    <p className="text-xs text-silver-mist">
                      {new Date(thread.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  {data.threads.length > 1 && (
                    <button
                      onClick={() => deleteThread(thread.id)}
                      className="p-1 text-silver-mist hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="border-t border-cloud dark:border-nebula-purple/30 my-4" />
              <h3 className="font-semibold text-sm text-ink-black dark:text-pearl mb-2">
                Recent Questions
              </h3>
              {getRecentQuestions().length === 0 ? (
                <p className="text-sm text-silver-mist">No questions yet.</p>
              ) : (
                getRecentQuestions().map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(q.content)}
                    className="w-full text-left p-2 mb-1 border border-cloud dark:border-nebula-purple/30 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-sm"
                  >
                    <p className="line-clamp-2 font-medium">{q.content}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main chat */}
        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 py-6 pb-32 space-y-5 max-w-3xl mx-auto w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                        message.type === 'user'
                          ? 'bg-indigo-600'
                          : 'bg-indigo-100 dark:bg-indigo-900/50'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>

                    <div
                      className={`rounded-2xl p-4 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-md'
                          : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-tl-md'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <BotMessageContent content={message.content} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}

                      {/* Decision framework */}
                      {message.type === 'bot' && message.decisions && (
                        <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-indigo-500" />
                            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
                              {message.decisions.title}
                            </p>
                          </div>
                          <p className="text-xs text-silver-mist mb-3">
                            {message.decisions.context}
                          </p>
                          <div className="space-y-2">
                            {message.decisions.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs ${
                                  opt.recommendation
                                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                                    : 'border-cloud dark:border-nebula-purple/30'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-ink-black dark:text-pearl">
                                    {opt.label}
                                  </span>
                                  {opt.recommendation && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div>
                                    <span className="text-emerald-600 font-medium">Pros: </span>
                                    {opt.pros.join(', ')}
                                  </div>
                                  <div>
                                    <span className="text-red-500 font-medium">Cons: </span>
                                    {opt.cons.join(', ')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {message.decisions.recommendedAction && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                              → {message.decisions.recommendedAction}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Automation actions */}
                      {message.type === 'bot' && message.actions && message.actions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/30">
                          <p className="text-xs font-semibold text-silver-mist mb-2 flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5" /> Quick Actions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.actions.map((action) => (
                              <button
                                key={action.id}
                                onClick={() => handleAction(action)}
                                disabled={runningAction === action.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                              >
                                {runningAction === action.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  actionIcon(action.type)
                                )}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Queued automations */}
                      {message.type === 'bot' && message.automationsQueued && (
                        <div className="mt-3 space-y-1">
                          {message.automationsQueued.map((auto, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              {auto.task}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Employee grounding */}
                      {message.type === 'bot' && message.employeeContext && (
                        <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/30">
                          <p className="text-xs font-semibold text-silver-mist mb-2 flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> Employee Context (live data)
                          </p>
                          <div className="text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 space-y-1">
                            <p className="font-semibold text-ink-black dark:text-pearl">
                              {message.employeeContext.name}{' '}
                              <span className="text-silver-mist font-normal">
                                ({message.employeeContext.employeeCode})
                              </span>
                            </p>
                            {message.employeeContext.department && (
                              <p>
                                {message.employeeContext.jobTitle || 'Role'} ·{' '}
                                {message.employeeContext.department}
                              </p>
                            )}
                            <p className="text-silver-mist">
                              {message.employeeContext.tenureMonths != null &&
                                `${message.employeeContext.tenureMonths} mo tenure · `}
                              {message.employeeContext.pendingLeaveRequests ?? 0} pending leave ·{' '}
                              {message.employeeContext.approvedLeaveDaysYtd ?? 0} leave days YTD
                              {message.employeeContext.latestPerformanceRating != null &&
                                ` · Rating ${message.employeeContext.latestPerformanceRating}`}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* References — policy RAG + LLM citations */}
                      {message.type === 'bot' &&
                        (() => {
                          const references = getMessageReferences(message);
                          if (!references.length) return null;
                          return (
                            <div className="mt-3 pt-2 border-t border-cloud dark:border-nebula-purple/30 text-xs text-silver-mist">
                              <p className="font-medium mb-2 text-ink-black dark:text-pearl flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                References ({references.length})
                              </p>
                              <div className="space-y-2">
                                {references.map((ref) => (
                                  <div
                                    key={ref.key}
                                    className="rounded-lg border border-cloud dark:border-nebula-purple/30 p-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                        {ref.index != null && `[${ref.index}] `}
                                        {ref.title}
                                        {ref.similarity != null && (
                                          <span className="text-silver-mist font-normal">
                                            {' '}
                                            ({Math.round(ref.similarity * 100)}%)
                                          </span>
                                        )}
                                      </p>
                                      {ref.href && (
                                        <Link
                                          href={ref.href}
                                          className="shrink-0 inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          View policy
                                        </Link>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-silver-mist mt-0.5">
                                      {ref.source}
                                    </p>
                                    {ref.snippet && (
                                      <p className="text-[11px] mt-1 line-clamp-3 text-ink-black/80 dark:text-pearl/80">
                                        {ref.snippet}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                      {/* Suggestions */}
                      {message.type === 'bot' &&
                        message.suggestions &&
                        message.suggestions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {message.suggestions.map((s, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(s)}
                                className="text-xs px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}

                      <div
                        className={`text-[10px] mt-2 flex items-center gap-2 ${
                          message.type === 'user' ? 'text-indigo-200' : 'text-silver-mist'
                        }`}
                      >
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.type === 'bot' && message.provider && (
                          <span className="text-indigo-400 dark:text-indigo-300">
                            · {providerLabel(message.provider)}
                          </span>
                        )}
                      </div>

                      {message.type === 'bot' && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-cloud dark:border-nebula-purple/30">
                          <button className="p-1 text-silver-mist hover:text-emerald-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-silver-mist hover:text-red-500 transition-colors">
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyMessage(message)}
                            className={`p-1 transition-colors ${
                              copiedMessageId === message.id
                                ? 'text-emerald-600'
                                : 'text-silver-mist hover:text-indigo-600'
                            }`}
                            title="Copy response"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportMessagePdf(message)}
                            disabled={exportingPdf === String(message.id)}
                            className="p-1 text-silver-mist hover:text-indigo-600 transition-colors disabled:opacity-50"
                            title="Export as PDF"
                          >
                            {exportingPdf === String(message.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-2xl rounded-tl-sm p-4">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="sticky bottom-0 z-20 border-t border-cloud dark:border-nebula-purple/50 bg-white/95 dark:bg-stellar-blue/95 backdrop-blur px-4 py-4">
            <div className="max-w-3xl mx-auto w-full">
              {messages.length <= 2 && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
                  {SUGGESTED_PROMPTS.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => setInputValue(topic)}
                      className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end bg-white dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-2xl p-2 shadow-sm">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${ASSISTANT.name} about HR decisions or automation...`}
                  className="flex-1 min-h-[40px] max-h-32 border-0 bg-transparent text-sm resize-none focus:outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
                  rows={1}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-silver-mist mt-2">
                AI assists with HR decisions — always verify policy and consult ER/Legal for
                high-risk actions.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel — recommendations & automations */}
        <div className="w-72 border-l border-cloud dark:border-nebula-purple/50 bg-white/80 dark:bg-stellar-blue/80 backdrop-blur hidden lg:flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Suggested Automations
            </h3>
            <div className="space-y-2">
              {recommendations.length === 0 ? (
                <p className="text-xs text-silver-mist">Loading recommendations...</p>
              ) : (
                recommendations.map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(rec.title)}
                    className="w-full text-left p-3 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                          {rec.type}
                        </span>
                        <p className="text-sm font-semibold text-ink-black dark:text-pearl mt-0.5 group-hover:text-indigo-600">
                          {rec.title}
                        </p>
                        <p className="text-xs text-silver-mist mt-1">{rec.action}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-silver-mist group-hover:text-indigo-500 shrink-0 mt-1" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-cloud dark:border-nebula-purple/30">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-4 rounded-xl text-white">
              <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Practice Mode
              </h3>
              <p className="text-xs text-indigo-200 mb-3">
                Simulate a difficult HR conversation — termination, PIP delivery, or conflict
                mediation.
              </p>
              <button
                onClick={() =>
                  handleSendMessage('Start practice mode for a difficult HR conversation')
                }
                className="w-full py-2 bg-white text-indigo-900 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
