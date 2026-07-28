'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bot, Calendar, Clock, FileText, HelpCircle, Send, User } from 'lucide-react';
import { agentsClient } from '@/lib/services/agents-client';
import { AGENT_TYPES } from '@/lib/ai/agent-types';

type ChatMessage = { role: 'user' | 'agent'; content: string; timestamp: string };

export default function HRAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [bootError, setBootError] = useState<string | null>(null);

  const capabilities = [
    {
      title: 'Leave Management',
      icon: Calendar,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      examples: [
        'Check my leave balance',
        'Apply for annual leave from June 1-5',
        'View my leave requests',
      ],
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      examples: ['Show my attendance today', 'Get attendance summary for this month'],
    },
    {
      title: 'Payroll',
      icon: FileText,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      examples: ['Show my latest payslip', 'What are my tax details?', 'View my salary structure'],
    },
    {
      title: 'Policies & Documents',
      icon: HelpCircle,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      examples: ['Search for remote work policy', 'Request experience certificate'],
    },
  ];

  useEffect(() => {
    agentsClient
      .startSession(AGENT_TYPES.HR)
      .then((session) => {
        setSessionId(session.sessionId);
        const initial: ChatMessage[] =
          session.messages?.length > 0
            ? session.messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'agent',
                content: m.content,
                timestamp: m.timestamp || new Date().toISOString(),
              }))
            : [
                {
                  role: 'agent',
                  content:
                    "Hello! I'm your HR Agent. I can help you with leave management, attendance tracking, payroll queries, policy searches, and document requests. How can I assist you today?",
                  timestamp: new Date().toISOString(),
                },
              ];
        setMessages(initial);
      })
      .catch((err) => setBootError(err instanceof Error ? err.message : 'Failed to start session'));
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const result = await agentsClient.chatHR(userMessage.content, sessionId);
      setSessionId(result.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: result.message, timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      const content =
        error instanceof Error ? error.message : 'I encountered an error processing your request.';
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, sessionId]);

  const handleExampleClick = (example: string) => setInput(example);

  return (
    <div className="space-y-8 pb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">HR Agent</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your autonomous HR assistant for leave, attendance, payroll, and more
            </p>
          </div>
        </div>
        {bootError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{bootError}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'agent'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  {message.role === 'agent' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg whitespace-pre-wrap ${
                      message.role === 'agent'
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="inline-block px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about HR..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              What I Can Do
            </h3>
            <div className="space-y-4">
              {capabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <div key={capability.title}>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${capability.color} flex items-center justify-center`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {capability.title}
                      </h4>
                    </div>
                    <div className="ml-10 space-y-1">
                      {capability.examples.map((example) => (
                        <button
                          key={example}
                          onClick={() => handleExampleClick(example)}
                          className="block text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-left"
                        >
                          • {example}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
