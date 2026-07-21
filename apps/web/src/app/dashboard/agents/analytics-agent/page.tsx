'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { TrendingUp, BarChart3, AlertTriangle, FileText, Send, User } from 'lucide-react';
import { agentsClient } from '@/lib/services/agents-client';
import { AGENT_TYPES } from '@/lib/ai/agent-types';

type ChatMessage = { role: 'user' | 'agent'; content: string; timestamp: string };

export default function AnalyticsAgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const capabilities = [
    {
      title: 'Insights',
      icon: BarChart3,
      examples: ['Generate workforce insights', 'Summarize org health'],
    },
    {
      title: 'Trends',
      icon: TrendingUp,
      examples: ['Analyze headcount trends', 'Compare attrition over time'],
    },
    { title: 'Anomalies', icon: AlertTriangle, examples: ['Detect attendance anomalies'] },
    { title: 'Reports', icon: FileText, examples: ['Create workforce summary report'] },
  ];

  useEffect(() => {
    agentsClient
      .startSession(AGENT_TYPES.ANALYTICS)
      .then((session) => {
        setSessionId(session.sessionId);
        setMessages(
          session.messages?.length
            ? session.messages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'agent',
                content: m.content,
                timestamp: m.timestamp || new Date().toISOString(),
              }))
            : [
                {
                  role: 'agent',
                  content:
                    "Hello! I'm your Analytics Agent. I can generate insights, analyze trends, detect anomalies, and create reports from your workforce data.",
                  timestamp: new Date().toISOString(),
                },
              ]
        );
      })
      .catch(() => {
        setMessages([
          {
            role: 'agent',
            content:
              "Hello! I'm your Analytics Agent. Ask me about workforce insights, trends, anomalies, or reports.",
            timestamp: new Date().toISOString(),
          },
        ]);
      });
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
      const result = await agentsClient.chatAnalytics(userMessage.content, sessionId);
      setSessionId(result.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: result.message, timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: error instanceof Error ? error.message : 'Error processing request.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, sessionId]);

  return (
    <div className="space-y-8 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Agent</h1>
          <p className="text-slate-600 dark:text-slate-400">Workforce analytics assistant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'agent' ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-slate-200'}`}
                >
                  {message.role === 'agent' ? (
                    <TrendingUp className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg whitespace-pre-wrap ${message.role === 'agent' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-orange-600 text-white'}`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about workforce analytics..."
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border p-6 space-y-4">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium">{c.title}</h4>
                </div>
                {c.examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInput(ex)}
                    className="block text-sm text-slate-600 hover:text-orange-600 ml-6"
                  >
                    • {ex}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
