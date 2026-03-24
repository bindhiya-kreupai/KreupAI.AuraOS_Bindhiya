/**
 * @module HRChatbot
 * @description Floating HR chatbot widget — chat bubble UI, quick questions,
 *              formatted card responses, human escalation, localStorage persistence,
 *              typing indicator (Sec 7.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, UserCog, Trash2 } from 'lucide-react';
import { AIService, type ChatbotMessage, type ChatbotCard } from '@/services/aiService';

// ── Types ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aura_chatbot_history';

// ── Quick Questions ───────────────────────────────────────────────────────────

const QUICK_QUESTIONS = [
  '📅 What is my leave balance?',
  '💰 Show my latest payslip',
  '🏠 What is the WFH policy?',
  '📞 How do I contact HR?',
  '🔐 How to reset my password?',
  '🎓 What training is available?',
];

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatbotMessage }) {
  const isUser = message.role === 'user';

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-[11px] font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
          }`}
        >
          {formatContent(message.content)}
        </div>

        {/* Card response */}
        {message.card && <CardResponse card={message.card} />}

        <span className="text-[10px] text-slate-400">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

function CardResponse({ card }: { card: ChatbotCard }) {
  const cardIcons: Record<ChatbotCard['type'], string> = {
    leave_balance: '📅',
    payslip: '💰',
    policy: '📄',
    contact: '📞',
    faq: '❓',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full">
      <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
        <span className="text-base">{cardIcons[card.type]}</span>
        <span className="text-white text-xs font-semibold">{card.title}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {Object.entries(card.data).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{key}</span>
            <span className="font-semibold text-slate-800">{String(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[11px] font-bold">AI</span>
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Widget ────────────────────────────────────────────────────────────────

interface HRChatbotProps {
  defaultOpen?: boolean;
}

export default function HRChatbot({ defaultOpen = false }: HRChatbotProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);

  // Listen for toggle events from the header AI button
  useEffect(() => {
    const handler = () => setIsOpen((v) => !v);
    window.addEventListener('aura:toggle-chatbot', handler);
    return () => window.removeEventListener('aura:toggle-chatbot', handler);
  }, []);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        // corrupted, ignore
      }
    } else {
      // Welcome message
      const welcome: ChatbotMessage = {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hi! I'm your AI HR assistant. I can help with leave balances, payslips, policies, and more.\n\nWhat can I help you with today?",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatbotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTyping(true);

    const result = await AIService.getChatbotResponse(text);

    const assistantMsg: ChatbotMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: result.response,
      timestamp: new Date().toISOString(),
      card: result.card,
    };

    setTyping(false);
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleEscalate = () => {
    setEscalated(true);
    const escalateMsg: ChatbotMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content:
        "No problem! I've flagged this conversation for a human HR agent. You should receive a response within 4 business hours.\n\n📞 You can also reach HR directly:\n**Email**: hr@kreupai.com\n**Phone**: +1-800-HR-HELP\n**Office Hours**: Mon–Fri, 9 AM–6 PM IST",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, escalateMsg]);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    const welcome: ChatbotMessage = {
      id: 'welcome-new',
      role: 'assistant',
      content: 'Chat history cleared. How can I help you?',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    setShowClearConfirm(false);
    setEscalated(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  return (
    <>
      {/* Chat widget */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] max-w-sm shadow-2xl rounded-2xl overflow-hidden flex flex-col bg-white border border-slate-200"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">HR Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] text-white/80">AI-powered · Always available</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions (only when no messages beyond welcome) */}
          {messages.length <= 1 && !typing && (
            <div className="px-3 pb-2">
              <p className="text-[10px] text-slate-400 mb-1.5 font-medium">QUICK QUESTIONS</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Escalate button */}
          {messages.length > 2 && !escalated && (
            <div className="px-3 pb-1">
              <button
                onClick={handleEscalate}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
              >
                <UserCog className="w-3.5 h-3.5" />
                Talk to a human HR agent
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-3 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a question..."
              disabled={typing}
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || typing}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {typing ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Clear confirm modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-1">Clear Chat History?</h3>
            <p className="text-sm text-slate-500 mb-4">
              This will permanently delete all messages in this conversation.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearHistory}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && messages.filter((m) => m.role === 'user').length === 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
}
