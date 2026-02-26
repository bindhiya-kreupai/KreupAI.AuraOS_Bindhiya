'use client';

import React, { useState } from 'react';
import {
  Shield,
  LayoutGrid,
  BookOpen,
  Award,
  BarChart3,
  UserPlus,
  Home,
  ChevronRight,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { ComplianceTrainingDashboard } from '@/components/compliance-training/ComplianceTrainingDashboard';
import { TrainingModuleList } from '@/components/compliance-training/TrainingModuleList';
import { TrainingPlayer } from '@/components/compliance-training/TrainingPlayer';
import { CertificationTracker } from '@/components/compliance-training/CertificationTracker';
import { ComplianceReport } from '@/components/compliance-training/ComplianceReport';
import { TrainingAssignment } from '@/components/compliance-training/TrainingAssignment';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'trainings' | 'certifications' | 'report' | 'assignments';

type SubView = 'list' | 'player' | 'complete';

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  description: string;
  adminOnly?: boolean;
}[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    description: 'Compliance training overview and priority trainings',
  },
  {
    id: 'trainings',
    label: 'My Trainings',
    icon: BookOpen,
    description: 'Browse and complete assigned compliance trainings',
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    description: 'Track your compliance certificates and expiry dates',
  },
  {
    id: 'report',
    label: 'Compliance Report',
    icon: BarChart3,
    description: 'Department-level compliance rates and insights',
    adminOnly: true,
  },
  {
    id: 'assignments',
    label: 'Assign Trainings',
    icon: UserPlus,
    description: 'Assign compliance trainings to employees',
    adminOnly: true,
  },
];

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({
  tab,
  subView,
  onNavigate,
}: {
  tab: ActiveTab;
  subView: SubView;
  onNavigate: (target: 'tab' | 'list') => void;
}) {
  const currentTab = TABS.find((t) => t.id === tab);
  return (
    <nav className="flex items-center gap-2 text-sm">
      <button
        onClick={() => onNavigate('tab')}
        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:block">Compliance Training</span>
      </button>
      {currentTab && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            onClick={() => (subView !== 'list' ? onNavigate('list') : undefined)}
            className={`font-medium transition-colors ${
              subView !== 'list'
                ? 'text-slate-400 hover:text-indigo-600'
                : 'text-slate-700 dark:text-slate-300 cursor-default'
            }`}
          >
            {currentTab.label}
          </button>
        </>
      )}
      {subView === 'player' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Training Player</span>
        </>
      )}
      {subView === 'complete' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Completed</span>
        </>
      )}
    </nav>
  );
}

// ── Completion screen ─────────────────────────────────────────────────────────

function CompletionScreen({
  score,
  passingScore,
  onContinue,
}: {
  score: number;
  passingScore: number;
  onContinue: () => void;
}) {
  const passed = score >= passingScore;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center ${
          passed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
        }`}
      >
        {passed ? (
          <Trophy className="w-12 h-12 text-emerald-600" />
        ) : (
          <CheckCircle2 className="w-12 h-12 text-amber-600" />
        )}
      </div>
      <div>
        <h2 className={`text-3xl font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
          {passed ? 'Training Passed!' : 'Training Completed'}
        </h2>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-2">
          Score: {score}%
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {passed
            ? 'Congratulations! Your certificate has been issued.'
            : `You need ${passingScore}% to pass. You can retake the training.`}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Back to Trainings
        </button>
        {passed && (
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Award className="w-4 h-4" />
            View Certificate
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComplianceTrainingPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [subView, setSubView] = useState<SubView>('list');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [completedScore, setCompletedScore] = useState<number>(0);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSubView('list');
    setActiveAssignmentId(null);
  };

  const handleStartTraining = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    setActiveTab('trainings');
    setSubView('player');
  };

  const handleTrainingComplete = (score: number) => {
    setCompletedScore(score);
    setSubView('complete');
  };

  const handleBack = () => {
    setSubView('list');
    setActiveAssignmentId(null);
  };

  const handleBreadcrumbNavigate = (target: 'tab' | 'list') => {
    if (target === 'tab') {
      setActiveTab('dashboard');
      setSubView('list');
      setActiveAssignmentId(null);
    } else {
      setSubView('list');
      setActiveAssignmentId(null);
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col overflow-y-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Compliance Training
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">{currentTab?.description}</p>
            </div>
          </div>
        </div>
        <Breadcrumb tab={activeTab} subView={subView} onNavigate={handleBreadcrumbNavigate} />
      </div>

      {/* Tab navigation */}
      <div className="flex overflow-x-auto shrink-0 -mx-1 px-1">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.adminOnly && (
                <span className="text-xs px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full font-medium">
                  Admin
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {/* Dashboard */}
        {activeTab === 'dashboard' && subView === 'list' && (
          <ComplianceTrainingDashboard
            employeeId="emp-001"
            onStartTraining={handleStartTraining}
            onViewAll={() => handleTabChange('trainings')}
            onViewCertifications={() => handleTabChange('certifications')}
          />
        )}

        {/* Trainings - list */}
        {activeTab === 'trainings' && subView === 'list' && (
          <TrainingModuleList employeeId="emp-001" onStartTraining={handleStartTraining} />
        )}

        {/* Training player */}
        {activeTab === 'trainings' && subView === 'player' && activeAssignmentId && (
          <TrainingPlayer
            assignmentId={activeAssignmentId}
            onComplete={handleTrainingComplete}
            onBack={handleBack}
          />
        )}

        {/* Training completion */}
        {activeTab === 'trainings' && subView === 'complete' && (
          <CompletionScreen score={completedScore} passingScore={80} onContinue={handleBack} />
        )}

        {/* Certifications */}
        {activeTab === 'certifications' && (
          <CertificationTracker
            employeeId="emp-001"
            onRenew={(_moduleId) => {
              // Find and start the renewal assignment
              handleTabChange('trainings');
            }}
          />
        )}

        {/* Compliance report */}
        {activeTab === 'report' && <ComplianceReport />}

        {/* Training assignments */}
        {activeTab === 'assignments' && <TrainingAssignment onAssigned={() => {}} />}
      </div>
    </div>
  );
}
