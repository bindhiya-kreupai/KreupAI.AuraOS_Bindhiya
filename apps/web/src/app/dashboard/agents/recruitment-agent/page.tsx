"use client";

import React, { useState } from 'react';
import { Brain, Users, Calendar, Mail, FileText, Send, User, TrendingUp } from 'lucide-react';

export default function RecruitmentAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'Hello! I\'m your Recruitment Agent. I can help you with candidate screening, interview scheduling, pipeline management, and automated communication. What would you like to do today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const capabilities = [
    {
      title: 'Candidate Screening',
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      examples: [
        'Screen candidates for Senior Developer position',
        'Shortlist top 10 candidates for Marketing Manager',
        'Show screening results for job #1234',
      ]
    },
    {
      title: 'Interview Scheduling',
      icon: Calendar,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      examples: [
        'Schedule interview for candidate John Doe',
        'Reschedule interview #5678 to next Tuesday',
        'Show upcoming interviews this week',
      ]
    },
    {
      title: 'Pipeline Management',
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      examples: [
        'Show pipeline stats for all positions',
        'Get open positions summary',
        'Show candidates in final round',
      ]
    },
    {
      title: 'Communication',
      icon: Mail,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      examples: [
        'Send interview confirmation to candidate',
        'Send rejection emails to all unselected candidates',
        'Send status update to shortlisted candidates',
      ]
    }
  ];

  const quickStats = [
    { label: 'Active Candidates', value: '247', color: 'text-purple-600' },
    { label: 'Interviews Scheduled', value: '18', color: 'text-blue-600' },
    { label: 'Open Positions', value: '12', color: 'text-green-600' },
    { label: 'Offers Pending', value: '5', color: 'text-orange-600' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Parse user intent and call appropriate API
      const action = parseUserIntent(input);

      const response = await fetch('/api/agents/recruitment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.type,
          tenantId: 'tenant-1', // TODO: Get from session
          params: action.params,
        }),
      });

      const result = await response.json();

      let content = '';
      if (result.success) {
        content = formatAgentResponse(action.type, result.data);
      } else {
        content = `I encountered an error: ${result.error}`;
      }

      const agentMessage = {
        role: 'agent' as const,
        content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, agentMessage]);
    } catch {
      const agentMessage = {
        role: 'agent' as const,
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, agentMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple intent parser
  const parseUserIntent = (input: string): { type: string; params: any } => {
    const lower = input.toLowerCase();

    if (lower.includes('screen') && lower.includes('candidate')) {
      const jobIdMatch = input.match(/job[#\s](\w+)/i);
      return {
        type: 'SCREEN_CANDIDATES',
        params: { jobId: jobIdMatch ? jobIdMatch[1] : 'job-123' }
      };
    } else if (lower.includes('schedule') && lower.includes('interview')) {
      return {
        type: 'GET_UPCOMING_INTERVIEWS',
        params: {}
      };
    } else if (lower.includes('upcoming') && lower.includes('interview')) {
      return {
        type: 'GET_UPCOMING_INTERVIEWS',
        params: {}
      };
    } else if (lower.includes('pipeline') || lower.includes('stats')) {
      return {
        type: 'GET_PIPELINE_STATS',
        params: {}
      };
    } else if (lower.includes('open position')) {
      return {
        type: 'GET_OPEN_POSITIONS',
        params: {}
      };
    } else if (lower.includes('shortlist')) {
      return {
        type: 'GET_PIPELINE_STATS',
        params: {}
      };
    }

    return { type: 'GET_PIPELINE_STATS', params: {} }; // Default action
  };

  // Format response based on action type
  const formatAgentResponse = (actionType: string, data: any): string => {
    switch (actionType) {
      case 'SCREEN_CANDIDATES':
        if (data.screeningResults && Array.isArray(data.screeningResults)) {
          return `Screening complete! ${data.screeningResults.length} candidates evaluated:\n\n${data.screeningResults.slice(0, 5).map((result: any) =>
            `${result.candidateName} - Score: ${result.overallScore}/100 (${result.recommendation})`
          ).join('\n')}`;
        }
        return 'Candidate screening completed.';

      case 'GET_UPCOMING_INTERVIEWS':
        if (Array.isArray(data) && data.length > 0) {
          return `You have ${data.length} upcoming interview(s):\n\n${data.map((interview: any) =>
            `${interview.candidateName} - ${new Date(interview.scheduledAt).toLocaleDateString()} at ${interview.startTime} (${interview.interviewType})`
          ).join('\n')}`;
        }
        return 'No upcoming interviews scheduled.';

      case 'GET_PIPELINE_STATS':
        return `Recruitment Pipeline Stats:\n\nTotal Candidates: ${data.totalCandidates}\nScreened: ${data.screened}\nShortlisted: ${data.shortlisted}\nInterviewed: ${data.interviewed}\nOffers Extended: ${data.offersExtended}\nOffers Accepted: ${data.offersAccepted}`;

      case 'GET_OPEN_POSITIONS':
        if (Array.isArray(data) && data.length > 0) {
          return `${data.length} open position(s):\n\n${data.map((position: any) =>
            `${position.title} - ${position.department} (${position.applicants} applicants)`
          ).join('\n')}`;
        }
        return 'No open positions found.';

      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Recruitment Agent
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Automate candidate screening, interview scheduling, and recruitment workflow
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'agent'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {message.role === 'agent' ? (
                    <Brain className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'agent'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {message.content}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me about recruitment..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Capabilities & Examples */}
        <div className="space-y-6">
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
                      <div className={`w-8 h-8 rounded-lg ${capability.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {capability.title}
                      </h4>
                    </div>
                    <div className="ml-10 space-y-1">
                      {capability.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExampleClick(example)}
                          className="block text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left"
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

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Mention job titles or IDs for specific positions</li>
              <li>• Include candidate names or IDs when applicable</li>
              <li>• I can handle bulk operations efficiently</li>
              <li>• Ask for pipeline insights and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
