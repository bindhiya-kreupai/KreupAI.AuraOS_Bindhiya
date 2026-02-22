'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@aura/ui/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  Users,
  Zap,
  Shield,
  Globe,
  Home,
  Briefcase,
  Clock,
  TrendingUp,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Play,
  X,
  MessageCircle,
} from 'lucide-react';

// Interactive Dashboard Preview Component
function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'employees', icon: Users, label: 'Employees' },
    { id: 'time', icon: Clock, label: 'Time & Attendance' },
    { id: 'performance', icon: TrendingUp, label: 'Performance' },
  ];

  const stats = [
    { label: 'Total Employees', value: '2,847', change: '+12%', color: 'text-green-500' },
    { label: 'Open Positions', value: '23', change: '+5', color: 'text-blue-500' },
    { label: 'Avg. Tenure', value: '3.2 yrs', change: '+0.4', color: 'text-purple-500' },
    { label: 'Engagement Score', value: '87%', change: '+3%', color: 'text-green-500' },
  ];

  const employees = [
    { name: 'Sarah Chen', role: 'Engineering Manager', dept: 'Engineering', status: 'Active' },
    { name: 'Marcus Williams', role: 'Sr. Designer', dept: 'Product', status: 'Active' },
    { name: 'Priya Patel', role: 'HR Business Partner', dept: 'People Ops', status: 'On Leave' },
  ];

  return (
    <div className="w-full h-full flex bg-white dark:bg-slate-900 rounded-lg overflow-hidden text-left text-sm">
      {/* Mini Sidebar */}
      <div className="w-48 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 hidden md:block">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Image
            src="/images/auraos-logo.png"
            alt="AuraOS"
            width={36}
            height={36}
            className="w-9 h-9 object-contain mix-blend-multiply dark:mix-blend-screen"
          />
          <span className="font-semibold text-slate-800 dark:text-white text-sm">AuraOS</span>
        </div>
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-celestial-indigo text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-10 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-48">
            <Search className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">Search...</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-celestial-indigo to-quantum-rose" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Dashboard Overview
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Chart Mockup & Employee List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Headcount Trend
                </span>
                <span className="text-xs text-slate-400">Last 6 months</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {[40, 55, 45, 60, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-celestial-indigo to-celestial-indigo/50 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>

            {/* Employee List */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  Recent Employees
                </span>
                <span className="text-xs text-celestial-indigo cursor-pointer flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="space-y-3">
                {employees.map((emp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
                      {emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 dark:text-white truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{emp.role}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Demo Modal Component
function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
          {/* Placeholder for video embed - replace with actual video URL */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-celestial-indigo to-purple-600">
            <div className="text-center text-white">
              <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Video Demo Placeholder</p>
              <p className="text-sm opacity-75 mt-2">
                Replace this with your video embed (YouTube, Vimeo, etc.)
              </p>
            </div>
          </div>
          {/* Example: Uncomment and add your video URL
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    */}
        </div>
      </div>
    </div>
  );
}

// Live Chat Widget Component
function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ type: 'user' | 'bot'; text: string; actions?: Array<{ label: string; href: string }> }>
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const chatContentRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  React.useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const autoResponses = {
    pricing: {
      text: 'Great question! AuraOS offers flexible pricing:\n\n• Starter: $8/user/month - Perfect for small teams\n• Professional: $15/user/month - Most popular, includes AI features\n• Enterprise: Custom pricing - Full platform power\n\nAll plans include a 14-day free trial with no credit card required!',
      actions: [
        { label: 'View Full Pricing', href: '/pricing' },
        { label: 'Start Free Trial', href: '/auth/register' },
      ],
    },
    demo: {
      text: "Great choice! Our personalized demo typically takes 30-45 minutes and includes:\n\n✓ Live walkthrough of AuraOS tailored to your needs\n✓ See AI agents automate resume screening in real-time\n✓ Explore the analytics dashboard with live data\n✓ Review custom workflow builder (no coding required)\n✓ Q&A with our product specialists\n\nWhat you'll discover:\n• How to reduce HR admin time by 80%\n• AI-powered insights for attrition prediction\n• Integration options with your existing tools\n• Implementation timeline for your organization\n\nOur team will reach out within 24 hours to schedule a time that works best for you. Please share your contact details below.",
      needsContact: true,
    },
    features: {
      text: 'AuraOS includes comprehensive features:\n\n✓ Core HR & Employee Database\n✓ AI Resume Screening\n✓ Performance Management\n✓ Time & Attendance\n✓ Payroll Integration\n✓ Analytics & Reporting\n✓ Mobile App\n\nProfessional plan adds AI agents, custom workflows, and advanced analytics. Enterprise includes global payroll, succession planning, and dedicated support.',
      actions: [
        { label: 'See All Features', href: '/#features' },
        { label: 'Compare Plans', href: '/pricing' },
      ],
    },
  };

  const handleQuickAction = (questionType: 'pricing' | 'demo' | 'features') => {
    const userMessage =
      questionType === 'pricing'
        ? 'How does pricing work?'
        : questionType === 'demo'
          ? 'I would like to schedule a demo'
          : 'Can you show me the feature comparison?';

    // Add user message
    setChatMessages((prev) => [...prev, { type: 'user', text: userMessage }]);

    // Simulate typing delay then show bot response
    setTimeout(() => {
      const response = autoResponses[questionType];
      setChatMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: response.text,
          actions: response.actions,
        },
      ]);

      // If it needs contact info, show form after response
      if (response.needsContact) {
        setTimeout(() => {
          setShowForm(true);
          setMessage(userMessage);
        }, 1000);
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          type: message.includes('pricing')
            ? 'pricing'
            : message.includes('demo')
              ? 'demo'
              : message.includes('feature')
                ? 'features'
                : 'general',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setStatusMessage(data.message || 'Message sent successfully!');
        // Reset form
        setTimeout(() => {
          setName('');
          setEmail('');
          setMessage('');
          setShowForm(false);
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setStatusMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px] bg-white dark:bg-deep-cosmos rounded-2xl shadow-2xl border border-cloud dark:border-nebula-purple flex flex-col">
          {/* Header */}
          <div className="bg-celestial-indigo text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/auraos-logo.png"
                alt="AuraOS"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full bg-white/10 p-1 mix-blend-screen"
              />
              <div>
                <h3 className="font-semibold">Chat with us</h3>
                <p className="text-xs text-white/80">We typically reply within 24 hours</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowForm(false);
                setSubmitStatus('idle');
                setChatMessages([]);
              }}
              className="hover:bg-white/20 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat content */}
          <div ref={chatContentRef} className="flex-1 p-4 overflow-y-auto">
            {!showForm ? (
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-celestial-indigo flex items-center justify-center text-white text-sm flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-pearl dark:bg-stellar-blue/10 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm text-ink-black dark:text-pearl">
                      Hi there! 👋 I&apos;m here to help you learn more about AuraOS. What would you
                      like to know?
                    </p>
                  </div>
                </div>

                {/* Chat conversation messages */}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-celestial-indigo flex items-center justify-center text-white text-sm flex-shrink-0">
                        AI
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3 max-w-[80%] ${
                        msg.type === 'user'
                          ? 'bg-celestial-indigo text-white rounded-tr-none'
                          : 'bg-pearl dark:bg-stellar-blue/10 text-ink-black dark:text-pearl rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.actions.map((action, i) => (
                            <a
                              key={i}
                              href={action.href}
                              className="block px-4 py-2 rounded-lg bg-celestial-indigo text-white text-center hover:bg-celestial-indigo/90 transition-colors text-sm font-medium"
                            >
                              {action.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Quick action buttons - only show if no messages yet */}
                {chatMessages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-twilight dark:text-silver-mist px-2">
                      Quick questions:
                    </p>
                    <button
                      onClick={() => handleQuickAction('pricing')}
                      className="w-full text-left px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple hover:border-celestial-indigo hover:bg-celestial-indigo/5 transition-colors text-sm text-ink-black dark:text-pearl"
                    >
                      How does pricing work?
                    </button>
                    <button
                      onClick={() => handleQuickAction('demo')}
                      className="w-full text-left px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple hover:border-celestial-indigo hover:bg-celestial-indigo/5 transition-colors text-sm text-ink-black dark:text-pearl"
                    >
                      Schedule a demo
                    </button>
                    <button
                      onClick={() => handleQuickAction('features')}
                      className="w-full text-left px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple hover:border-celestial-indigo hover:bg-celestial-indigo/5 transition-colors text-sm text-ink-black dark:text-pearl"
                    >
                      See feature comparison
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setMessage('');
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple hover:border-celestial-indigo hover:bg-celestial-indigo/5 transition-colors text-sm text-ink-black dark:text-pearl"
                    >
                      Ask a custom question
                    </button>
                  </div>
                )}

                {/* Show "Ask another question" button after conversation */}
                {chatMessages.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-cloud dark:border-nebula-purple">
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setMessage('');
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-celestial-indigo text-white hover:bg-celestial-indigo/90 transition-colors text-sm font-medium"
                    >
                      Have another question?
                    </button>
                    <button
                      onClick={() => {
                        setChatMessages([]);
                        setShowForm(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-stellar-blue/5 transition-colors text-sm"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitStatus === 'success' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                    <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                      ✓ Message Sent!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">{statusMessage}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-ink-black dark:text-pearl mb-1">
                        Name (optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-pearl dark:bg-stellar-blue/10 text-ink-black dark:text-pearl placeholder:text-twilight/50 focus:outline-none focus:ring-2 focus:ring-celestial-indigo text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-black dark:text-pearl mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-pearl dark:bg-stellar-blue/10 text-ink-black dark:text-pearl placeholder:text-twilight/50 focus:outline-none focus:ring-2 focus:ring-celestial-indigo text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-black dark:text-pearl mb-1">
                        Message *
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help you?"
                        required
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple bg-pearl dark:bg-stellar-blue/10 text-ink-black dark:text-pearl placeholder:text-twilight/50 focus:outline-none focus:ring-2 focus:ring-celestial-indigo text-sm resize-none"
                      />
                    </div>

                    {submitStatus === 'error' && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-sm text-red-700 dark:text-red-300">{statusMessage}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setMessage('');
                          setSubmitStatus('idle');
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-stellar-blue/5 transition-colors text-sm"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 rounded-lg bg-celestial-indigo text-white hover:bg-celestial-indigo/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          {!showForm && (
            <div className="p-4 border-t border-cloud dark:border-nebula-purple">
              <p className="text-xs text-twilight dark:text-silver-mist text-center">
                Powered by AuraOS AI
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Exit Intent Popup Component
function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  React.useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves from top of viewport
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setIsVisible(false)}
    >
      <div
        className="relative bg-white dark:bg-deep-cosmos rounded-2xl p-8 md:p-12 max-w-2xl mx-4 shadow-2xl border border-cloud dark:border-nebula-purple"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-twilight hover:text-ink-black dark:hover:text-pearl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* AuraOS Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/auraos-logo.png"
              alt="AuraOS Logo"
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 mix-blend-multiply dark:mix-blend-screen"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-ink-black dark:text-pearl mb-4">
            Wait! Before you go...
          </h2>

          <p className="text-lg text-twilight dark:text-silver-mist mb-6 max-w-xl mx-auto">
            See how AuraOS can transform your HR operations. Start your free 14-day trial with no
            credit card required.
          </p>

          {/* Special offer */}
          <div className="bg-gradient-to-r from-celestial-indigo/10 to-quantum-rose/10 rounded-xl p-6 mb-8 border border-celestial-indigo/20">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="bg-celestial-indigo text-white text-xs px-3 py-1 rounded-full font-semibold">
                LIMITED OFFER
              </span>
            </div>
            <p className="text-ink-black dark:text-pearl font-semibold text-xl mb-2">
              Get 20% off your first 3 months
            </p>
            <p className="text-twilight dark:text-silver-mist text-sm">
              Exclusive offer for first-time visitors. Use code{' '}
              <span className="font-mono font-bold text-celestial-indigo">WELCOME20</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full px-8 h-12"
              >
                Claim Your Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsVisible(false)}
              className="rounded-full px-8 h-12"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-twilight dark:text-silver-mist mt-6">
            No credit card required • Cancel anytime • Full feature access
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* AuraOS Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/auraos-logo.png"
              alt="AuraOS Logo"
              width={200}
              height={200}
              className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mix-blend-multiply dark:mix-blend-screen"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-celestial-indigo/10 text-celestial-indigo dark:text-quantum-rose text-sm font-medium mb-8">
            <span className="bg-celestial-indigo text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
            <span>Experience the Future of Work</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-display font-bold text-ink-black dark:text-pearl mb-8 tracking-tight leading-tight">
            Transform Your Workforce with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-celestial-indigo via-purple-500 to-quantum-rose">
              AI-Powered Intelligence
            </span>
          </h1>

          <p className="text-xl text-twilight dark:text-silver-mist max-w-3xl mx-auto mb-8 leading-relaxed">
            The world&apos;s first truly agentic HCM platform. Automate 80% of HR workflows, predict
            attrition before it happens, and unlock actionable insights that drive business growth.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-8 mb-12 text-sm text-twilight dark:text-silver-mist">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-celestial-indigo/25"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsVideoModalOpen(true)}
              className="rounded-full px-8 h-12 text-base border-2 hover:bg-pearl dark:hover:bg-stellar-blue"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Interactive Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border-4 border-cloud dark:border-nebula-purple bg-white dark:bg-deep-cosmos shadow-2xl overflow-hidden aspect-[16/9]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-black/40 pointer-events-none z-10" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-pearl dark:bg-stellar-blue/5 border-y border-cloud dark:border-nebula-purple">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-twilight dark:text-silver-mist text-sm uppercase tracking-wide font-semibold mb-8">
              Trusted by forward-thinking companies worldwide
            </p>

            {/* Company logos placeholder - replace with actual logos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-12 opacity-60">
              {[
                'TechCorp',
                'InnovateLabs',
                'GlobalRetail',
                'HealthFirst',
                'FinanceGo',
                'ManufacturePro',
                'EduTech',
                'LogisticsX',
              ].map((company, i) => (
                <div key={i} className="text-twilight dark:text-silver-mist font-semibold text-lg">
                  {company}
                </div>
              ))}
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-celestial-indigo mb-2">500+</div>
              <div className="text-twilight dark:text-silver-mist text-sm">Companies Trust Us</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-celestial-indigo mb-2">2.5M+</div>
              <div className="text-twilight dark:text-silver-mist text-sm">Employees Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-celestial-indigo mb-2">80%</div>
              <div className="text-twilight dark:text-silver-mist text-sm">Tasks Automated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-celestial-indigo mb-2">99.9%</div>
              <div className="text-twilight dark:text-silver-mist text-sm">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white dark:bg-deep-cosmos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-4">
              Everything you need to run a modern workforce
            </h2>
            <p className="text-twilight dark:text-silver-mist max-w-2xl mx-auto">
              From core HR to advanced AI analytics, AuraOS unifies every aspect of human capital
              management into one seamless operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI & Automation',
                desc: 'Automate routine tasks, screen resumes, and answer employee queries with our advanced AI agents.',
              },
              {
                icon: Users,
                title: 'Core HR & Payroll',
                desc: 'Manage the entire employee lifecycle with global compliance, automated payroll, and document management.',
              },
              {
                icon: BarChart3,
                title: 'People Analytics',
                desc: 'Real-time insights into attrition, performance, and engagement to make data-driven decisions.',
              },
              {
                icon: Globe,
                title: 'Global Mobility',
                desc: 'Seamlessly manage a distributed workforce with multi-currency, multi-language, and tax compliance support.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Bank-grade security with role-based access control, audit logs, and GDPR/SOC2 compliance.',
              },
              {
                icon: CheckCircle,
                title: 'Talent Management',
                desc: 'From recruitment to succession planning, nurture your top talent and build high-performing teams.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-pearl dark:bg-stellar-blue/20 border border-cloud dark:border-nebula-purple hover:border-celestial-indigo/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-deep-cosmos flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-celestial-indigo" />
                </div>
                <h3 className="text-xl font-semibold text-ink-black dark:text-pearl mb-3">
                  {feature.title}
                </h3>
                <p className="text-twilight dark:text-silver-mist leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-pearl dark:bg-stellar-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-black dark:text-pearl mb-4">
              Loved by HR teams and employees alike
            </h2>
            <p className="text-lg text-twilight dark:text-silver-mist max-w-2xl mx-auto">
              See how companies are transforming their HR operations with AuraOS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'AuraOS reduced our time-to-hire by 45% and cut HR administrative work by 80%. The AI resume screening alone saves us 20 hours per week.',
                name: 'Sarah Chen',
                role: 'VP of People Operations',
                company: 'TechVentures Inc.',
                metric: '45% faster hiring',
              },
              {
                quote:
                  'We predicted and prevented attrition of 15 key employees last quarter using AuraOS analytics. The ROI paid for itself in 3 months.',
                name: 'Marcus Rodriguez',
                role: 'CHRO',
                company: 'GlobalRetail Corp',
                metric: '3-month ROI',
              },
              {
                quote:
                  "Migrating from our legacy system took just 2 weeks. Employee satisfaction with HR services jumped from 62% to 94%. It's night and day.",
                name: 'Priya Patel',
                role: 'Head of HR',
                company: 'FinanceFirst',
                metric: '94% satisfaction',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white dark:bg-deep-cosmos rounded-2xl p-8 border border-cloud dark:border-nebula-purple shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* 5-star rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <svg
                      key={starIndex}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-twilight dark:text-silver-mist leading-relaxed mb-6 italic">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-celestial-indigo to-quantum-rose flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-black dark:text-pearl">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-twilight dark:text-silver-mist">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-twilight dark:text-silver-mist">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-cloud dark:border-nebula-purple">
                  <div className="text-celestial-indigo font-bold text-lg">
                    {testimonial.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-4">
              Beautiful, Insightful Dashboards
            </h2>
            <p className="text-twilight dark:text-silver-mist max-w-2xl mx-auto">
              Purpose-built interfaces for every stakeholder, from detailed analytics to talent
              pipelines.
            </p>
          </div>

          <div className="space-y-20">
            {/* Analytics */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <Image
                  src="/images/dashboards/real-analytics.png"
                  alt="HR Analytics Dashboard"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-lg bg-celestial-indigo/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-celestial-indigo" />
                </div>
                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-4">
                  Deep Analytics
                </h3>
                <p className="text-twilight dark:text-silver-mist text-lg leading-relaxed mb-6">
                  Visualize your workforce data like never before. Track attrition, engagement, and
                  performance trends in real-time with AI-powered insights.
                </p>
                <ul className="space-y-3">
                  {[
                    'Predictive turnover models',
                    'Real-time engagement scoring',
                    'Compensation analysis',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle className="w-4 h-4 text-celestial-indigo" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Employee Management */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-2 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <Image
                  src="/images/dashboards/real-employee.png"
                  alt="Employee Profile Dashboard"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 lg:order-1">
                <div className="w-12 h-12 rounded-lg bg-quantum-rose/10 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-quantum-rose" />
                </div>
                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-4">
                  Employee 360
                </h3>
                <p className="text-twilight dark:text-silver-mist text-lg leading-relaxed mb-6">
                  A complete view of every employee. Manage skills, career progression, and
                  performance reviews in one unified profile.
                </p>
                <ul className="space-y-3">
                  {['Skills gap analysis', 'Performance timeline', 'Career path visualization'].map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <CheckCircle className="w-4 h-4 text-quantum-rose" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Recruitment */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                <Image
                  src="/images/dashboards/real-recruitment.png"
                  alt="Recruitment Dashboard"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-ink-black dark:text-pearl mb-4">
                  Smart Recruitment
                </h3>
                <p className="text-twilight dark:text-silver-mist text-lg leading-relaxed mb-6">
                  Accelerate hiring with an AI-driven applicant tracking system. Visualize pipelines
                  and automate candidate screening.
                </p>
                <ul className="space-y-3">
                  {['Visual Kanban pipelines', 'Automated screening', 'Time-to-hire metrics'].map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 bg-white dark:bg-deep-cosmos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-ink-black dark:text-pearl mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-twilight dark:text-silver-mist max-w-2xl mx-auto">
              Your data security is our top priority. We employ industry-leading practices to keep
              your information safe.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { badge: 'SOC 2 Type II', desc: 'Certified' },
              { badge: 'GDPR', desc: 'Compliant' },
              { badge: 'ISO 27001', desc: 'Certified' },
              { badge: 'HIPAA', desc: 'Ready' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl border border-cloud dark:border-nebula-purple hover:border-celestial-indigo/50 transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-celestial-indigo/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-celestial-indigo" />
                </div>
                <div className="font-bold text-ink-black dark:text-pearl mb-1">{item.badge}</div>
                <div className="text-sm text-twilight dark:text-silver-mist">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Bank-Grade Encryption',
                desc: 'All data encrypted at rest and in transit using AES-256 and TLS 1.3.',
              },
              {
                title: 'Regular Security Audits',
                desc: 'Quarterly penetration testing and annual third-party security assessments.',
              },
              {
                title: '99.9% Uptime SLA',
                desc: 'Multi-region redundancy ensures your HR operations never stop.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <h4 className="font-semibold text-ink-black dark:text-pearl mb-2">{item.title}</h4>
                <p className="text-sm text-twilight dark:text-silver-mist">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-deep-cosmos">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink-black dark:text-pearl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-twilight dark:text-silver-mist">
              Everything you need to know about AuraOS
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How long does implementation take?',
                a: 'Most companies are fully operational within 2-4 weeks. Our Express Setup can get you started in as little as 48 hours with core HR and payroll modules.',
              },
              {
                q: 'Is my data secure and compliant?',
                a: 'Yes. AuraOS is SOC 2 Type II certified, GDPR compliant, and uses bank-grade encryption (AES-256). We maintain 99.9% uptime SLA with data centers in multiple regions for redundancy.',
              },
              {
                q: 'Can I migrate from my existing HRIS?',
                a: 'Absolutely. We provide dedicated migration support and have pre-built connectors for major platforms like Workday, SAP SuccessFactors, BambooHR, and more. Data integrity is guaranteed.',
              },
              {
                q: 'What kind of support do you offer?',
                a: 'All plans include email and chat support. Professional plans get phone support and dedicated customer success managers. Enterprise plans receive 24/7 priority support with SLA guarantees.',
              },
              {
                q: 'How does AI improve HR processes?',
                a: 'Our AI agents handle resume screening, answer employee questions via chatbot, predict attrition, recommend career paths, and automate approval workflows. This frees up 60-80% of time previously spent on admin tasks.',
              },
              {
                q: 'Can I customize workflows and reports?',
                a: 'Yes. AuraOS includes a visual workflow builder (no coding required) and custom report designer. Enterprise customers can also use our API for deeper integrations.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-pearl dark:bg-stellar-blue/10 rounded-xl border border-cloud dark:border-nebula-purple p-6 cursor-pointer hover:border-celestial-indigo/50 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-ink-black dark:text-pearl list-none">
                  <span className="text-left pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-celestial-indigo shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-twilight dark:text-silver-mist leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-twilight dark:text-silver-mist mb-4">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full">
                Contact Our Team
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-celestial-indigo via-purple-600 to-quantum-rose opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Join 500+ companies transforming their workforce with AuraOS
          </h2>
          <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Start your 14-day free trial. No credit card required. Full access to all features.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-celestial-indigo hover:bg-white/90 rounded-full px-10 h-14 text-lg font-semibold shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg font-semibold bg-transparent"
              >
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>2.5M+ Employees Managed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 3 Components */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
      <LiveChatWidget />
      <ExitIntentPopup />
    </div>
  );
}

