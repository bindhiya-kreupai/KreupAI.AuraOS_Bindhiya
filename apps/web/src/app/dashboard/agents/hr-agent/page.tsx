"use client";

import React, { useState } from 'react';
import { Bot, Calendar, Clock, FileText, HelpCircle, Send, User } from 'lucide-react';

export default function HRAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'Hello! I\'m your HR Agent. I can help you with leave management, attendance tracking, payroll queries, policy searches, and document requests. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const capabilities = [
    {
      title: 'Leave Management',
      icon: Calendar,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      examples: [
        'Check my leave balance',
        'Apply for annual leave from June 1-5',
        'View my leave requests',
      ]
    },
    {
      title: 'Attendance',
      icon: Clock,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      examples: [
        'Show my attendance today',
        'Get attendance summary for this month',
      ]
    },
    {
      title: 'Payroll',
      icon: FileText,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      examples: [
        'Show my latest payslip',
        'What are my tax details?',
        'View my salary structure',
      ]
    },
    {
      title: 'Policies & Documents',
      icon: HelpCircle,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      examples: [
        'Search for remote work policy',
        'Request experience certificate',
      ]
    }
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

      const response = await fetch('/api/agents/hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.type,
          employeeId: 'current-user', // TODO: Get from session
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
    } catch (error) {
            console.error('Error:', error);
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

    if (lower.includes('leave balance') || lower.includes('check my leave')) {
      return { type: 'GET_LEAVE_BALANCE', params: {} };
    } else if (lower.includes('apply') && lower.includes('leave')) {
      return { type: 'GET_LEAVE_BALANCE', params: {} }; // Simplified for demo
    } else if (lower.includes('leave request')) {
      return { type: 'GET_LEAVE_REQUESTS', params: {} };
    } else if (lower.includes('attendance today') || lower.includes('my attendance')) {
      return { type: 'GET_ATTENDANCE', params: {} };
    } else if (lower.includes('attendance summary')) {
      return { type: 'GET_ATTENDANCE_SUMMARY', params: {} };
    } else if (lower.includes('payslip') || lower.includes('pay slip')) {
      return { type: 'GET_PAYSLIP', params: {} };
    } else if (lower.includes('tax')) {
      return { type: 'GET_TAX_DETAILS', params: {} };
    } else if (lower.includes('salary structure')) {
      return { type: 'GET_SALARY_STRUCTURE', params: {} };
    } else if (lower.includes('search') && lower.includes('polic')) {
      const query = input.replace(/search|for|policy|policies/gi, '').trim();
      return { type: 'SEARCH_POLICIES', params: { query: query || 'remote work' } };
    }

    return { type: 'GET_LEAVE_BALANCE', params: {} }; // Default action
  };

  // Format response based on action type
  const formatAgentResponse = (actionType: string, data: any): string => {
    switch (actionType) {
      case 'GET_LEAVE_BALANCE':
        if (Array.isArray(data)) {
          return `Here's your leave balance:\n\n${data.map((leave: any) =>
            `${leave.leaveTypeName}: ${leave.balance} days available (${leave.used} used, ${leave.pending} pending)`
          ).join('\n')}`;
        }
        return 'Leave balance information retrieved.';

      case 'GET_LEAVE_REQUESTS':
        if (Array.isArray(data)) {
          return `You have ${data.length} leave request(s):\n\n${data.map((req: any) =>
            `${req.leaveType} - ${new Date(req.startDate).toLocaleDateString()} to ${new Date(req.endDate).toLocaleDateString()} (${req.status})`
          ).join('\n')}`;
        }
        return 'No leave requests found.';

      case 'GET_ATTENDANCE':
        return `Today's attendance:\nCheck-in: ${data.checkIn || 'Not yet'}\nCheck-out: ${data.checkOut || 'Not yet'}\nStatus: ${data.status}`;

      case 'GET_PAYSLIP':
        return `Your payslip for ${data.month}/${data.year}:\nGross: ${data.grossSalary}\nDeductions: ${data.totalDeductions}\nNet Pay: ${data.netPay}`;

      case 'SEARCH_POLICIES':
        if (Array.isArray(data) && data.length > 0) {
          return `Found ${data.length} policy document(s):\n\n${data.map((policy: any) =>
            `${policy.title} - ${policy.category}`
          ).join('\n')}`;
        }
        return 'No policies found matching your query.';

      default:
        return JSON.stringify(data, null, 2);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              HR Agent
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your autonomous HR assistant for leave, attendance, payroll, and more
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {message.role === 'agent' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'agent'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'bg-blue-600 text-white'
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
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
                placeholder="Ask me anything about HR..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Capabilities & Examples */}
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
                          className="block text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
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

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Ask questions in natural language</li>
              <li>• Be specific with dates and details</li>
              <li>• Use the examples as templates</li>
              <li>• I can handle multiple requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

