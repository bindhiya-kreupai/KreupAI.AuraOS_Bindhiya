"use client";

import React, { useState } from 'react';
import { FileText, Plus, Copy, Edit2, Trash2, Clock, Users, Star, ChevronRight } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  questions: string[];
  category: string;
  usageCount: number;
  lastUsed: string;
  isDefault: boolean;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Weekly 1:1 Check-in',
    description: 'Standard weekly check-in template for direct reports',
    questions: ['What did you accomplish this week?', 'What blockers are you facing?', 'What are your priorities for next week?', 'How can I support you better?'],
    category: '1:1 Meetings',
    usageCount: 45,
    lastUsed: '2 days ago',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Career Development',
    description: 'Quarterly career growth and development discussion',
    questions: ['How do you feel about your career progress?', 'What skills would you like to develop?', 'Where do you see yourself in 1-2 years?', 'What projects excite you most?'],
    category: 'Development',
    usageCount: 12,
    lastUsed: '2 weeks ago',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Performance Mid-Cycle',
    description: 'Mid-cycle performance review discussion guide',
    questions: ['Progress on current goals?', 'Any goals need to be adjusted?', 'Feedback on recent projects', 'Areas for improvement', 'Recognition and wins'],
    category: 'Performance',
    usageCount: 8,
    lastUsed: '1 month ago',
    isDefault: false,
  },
  {
    id: '4',
    name: 'New Hire 30-Day',
    description: 'Check-in template for new employees at 30 days',
    questions: ['How is onboarding going?', 'Do you have everything you need?', 'How is the team culture?', 'Any surprises (good or bad)?', 'Questions about role expectations?'],
    category: 'Onboarding',
    usageCount: 6,
    lastUsed: '3 weeks ago',
    isDefault: false,
  },
  {
    id: '5',
    name: 'Project Retrospective',
    description: 'Post-project reflection and learnings',
    questions: ['What went well?', 'What could be improved?', 'What did you learn?', 'Who deserves recognition?'],
    category: 'Projects',
    usageCount: 15,
    lastUsed: '1 week ago',
    isDefault: false,
  },
];

const categories = ['All', '1:1 Meetings', 'Development', 'Performance', 'Onboarding', 'Projects'];

export default function CheckInTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'All'
    ? mockTemplates
    : mockTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Check-in Templates</h1>
          <p className="text-sm text-silver-mist mt-1">Manage discussion templates for meetings and reviews</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="space-y-3">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden"
          >
            <div
              className="px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
              onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-celestial-indigo/10 flex-shrink-0">
                  <FileText className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{template.name}</p>
                    {template.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded font-medium">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-silver-mist mt-0.5">{template.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-silver-mist">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {template.questions.length} questions</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Used {template.usageCount} times</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {template.lastUsed}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-silver-mist hover:text-celestial-indigo transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className={`w-4 h-4 text-silver-mist transition-transform ${expandedTemplate === template.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </div>
            {expandedTemplate === template.id && (
              <div className="px-5 pb-4 border-t border-cloud dark:border-nebula-purple/50 pt-3 ml-14">
                <p className="text-xs font-medium text-ink-black dark:text-pearl mb-2">Discussion Questions:</p>
                <ol className="space-y-1.5">
                  {template.questions.map((q, i) => (
                    <li key={i} className="text-xs text-silver-mist flex items-start gap-2">
                      <span className="text-celestial-indigo font-medium">{i + 1}.</span> {q}
                    </li>
                  ))}
                </ol>
                <button className="mt-3 text-xs text-celestial-indigo font-medium hover:underline">
                  Use this template →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
