"use client";

import React, { useState } from 'react';
import { TrendingUp, BarChart3, AlertTriangle, FileText, Send, User, Zap, Activity } from 'lucide-react';

export default function AnalyticsAgentPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'Hello! I\'m your Analytics Agent. I can generate insights, analyze trends, detect anomalies, and create comprehensive reports across all HR domains. What would you like to analyze today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const capabilities = [
    {
      title: 'Insight Generation',
      icon: Zap,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      examples: [
        'Generate insights on employee retention',
        'Analyze diversity metrics across departments',
        'Show workforce planning insights',
      ]
    },
    {
      title: 'Trend Analysis',
      icon: TrendingUp,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      examples: [
        'Analyze turnover trends over last 6 months',
        'Show recruitment cost trends',
        'Compare headcount growth by quarter',
      ]
    },
    {
      title: 'Anomaly Detection',
      icon: AlertTriangle,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      examples: [
        'Detect anomalies in attendance patterns',
        'Find unusual compensation outliers',
        'Identify recruitment bottlenecks',
      ]
    },
    {
      title: 'Report Generation',
      icon: FileText,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      examples: [
        'Generate monthly workforce report',
        'Create quarterly diversity report',
        'Generate annual compensation analysis',
      ]
    }
  ];

  const quickStats = [
    { label: 'Insights Generated', value: '15.8K', color: 'text-orange-600', icon: Zap },
    { label: 'Trends Analyzed', value: '8.4K', color: 'text-blue-600', icon: Activity },
    { label: 'Anomalies Detected', value: '342', color: 'text-red-600', icon: AlertTriangle },
    { label: 'Reports Created', value: '1.2K', color: 'text-green-600', icon: FileText },
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

      const response = await fetch('/api/agents/analytics', {
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

    if (lower.includes('insight') || lower.includes('generate')) {
      let domain = 'WORKFORCE';
      if (lower.includes('retention')) domain = 'RETENTION';
      else if (lower.includes('diversity') || lower.includes('dei')) domain = 'DIVERSITY';
      else if (lower.includes('recruitment') || lower.includes('hiring')) domain = 'RECRUITMENT';
      else if (lower.includes('compensation')) domain = 'COMPENSATION';

      return {
        type: 'GENERATE_INSIGHT',
        params: {
          domain,
          question: input,
        }
      };
    } else if (lower.includes('trend') || lower.includes('analyze')) {
      return {
        type: 'ANALYZE_TREND',
        params: {
          metricId: 'turnover_rate',
        }
      };
    } else if (lower.includes('anomal') || lower.includes('detect') || lower.includes('unusual')) {
      let domain = 'WORKFORCE';
      if (lower.includes('attendance')) domain = 'ATTENDANCE';
      else if (lower.includes('compensation')) domain = 'COMPENSATION';

      return {
        type: 'DETECT_ANOMALIES',
        params: { domain }
      };
    } else if (lower.includes('report') || lower.includes('generate')) {
      let reportType = 'WORKFORCE_SUMMARY';
      if (lower.includes('diversity')) reportType = 'DIVERSITY_REPORT';
      else if (lower.includes('compensation')) reportType = 'COMPENSATION_ANALYSIS';
      else if (lower.includes('monthly')) reportType = 'MONTHLY_METRICS';

      return {
        type: 'GENERATE_REPORT',
        params: { reportType }
      };
    }

    return {
      type: 'GENERATE_INSIGHT',
      params: {
        domain: 'WORKFORCE',
        question: input
      }
    };
  };

  // Format response based on action type
  const formatAgentResponse = (actionType: string, data: any): string => {
    switch (actionType) {
      case 'GENERATE_INSIGHT':
        if (data.insights && Array.isArray(data.insights)) {
          return `Analysis Complete:\n\n${data.insights.map((insight: any) =>
            `${insight.type.toUpperCase()}: ${insight.description}\n${insight.recommendation ? 'Recommendation: ' + insight.recommendation : ''}`
          ).join('\n\n')}`;
        }
        return data.summary || 'Insight generated successfully.';

      case 'ANALYZE_TREND':
        return `Trend Analysis:\n\nMetric: ${data.metricName}\nPeriod: ${new Date(data.period.start).toLocaleDateString()} to ${new Date(data.period.end).toLocaleDateString()}\n\nTrend: ${data.trend} (${data.direction})\nChange: ${data.percentageChange}%\n\n${data.insights?.join('\n') || ''}`;

      case 'DETECT_ANOMALIES':
        if (data.anomalies && Array.isArray(data.anomalies)) {
          return `${data.anomalies.length} Anomal${data.anomalies.length === 1 ? 'y' : 'ies'} Detected:\n\n${data.anomalies.map((anomaly: any) =>
            `${anomaly.type} - ${anomaly.description}\nSeverity: ${anomaly.severity}\nRecommendation: ${anomaly.recommendation}`
          ).join('\n\n')}`;
        }
        return 'No anomalies detected.';

      case 'GENERATE_REPORT':
        return `Report Generated: ${data.title}\n\nPeriod: ${new Date(data.period?.start).toLocaleDateString()} to ${new Date(data.period?.end).toLocaleDateString()}\n\nKey Metrics:\n${Object.entries(data.metrics || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\nStatus: ${data.status}\nFormat: ${data.format}`;

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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Analytics Agent
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              AI-powered insights, trend analysis, anomaly detection, and automated reporting
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          );
        })}
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
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {message.role === 'agent' ? (
                    <TrendingUp className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === 'agent'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'bg-orange-600 text-white'
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <BarChart3 className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Analyzing data...</span>
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
                placeholder="Ask me to analyze anything..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className="block text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
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

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Analysis Domains
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Workforce & Headcount</li>
              <li>• Recruitment & Hiring</li>
              <li>• Compensation & Benefits</li>
              <li>• Performance & Engagement</li>
              <li>• Attrition & Retention</li>
              <li>• Diversity & Inclusion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
