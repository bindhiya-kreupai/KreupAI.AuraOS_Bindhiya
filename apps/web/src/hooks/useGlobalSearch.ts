"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchResult } from '@/stores/search-store';

// Static module/page data for search
const SEARCHABLE_PAGES: SearchResult[] = [
  { id: 'm-attendance', title: 'Attendance', category: 'module', path: '/dashboard/attendance', description: 'Time capture, shifts, geo-fencing' },
  { id: 'm-leave', title: 'Leave Management', category: 'module', path: '/dashboard/leave', description: 'Apply leave, balances, approvals' },
  { id: 'm-payroll', title: 'Payroll', category: 'module', path: '/dashboard/payroll', description: 'Payslips, processing, compliance' },
  { id: 'm-recruitment', title: 'Recruitment', category: 'module', path: '/dashboard/recruitment', description: 'Job postings, candidates, interviews' },
  { id: 'm-performance', title: 'Performance', category: 'module', path: '/dashboard/performance', description: 'Goals, reviews, feedback' },
  { id: 'm-learning', title: 'Learning & Development', category: 'module', path: '/dashboard/learning', description: 'Courses, paths, certifications' },
  { id: 'm-benefits', title: 'Benefits', category: 'module', path: '/dashboard/benefits', description: 'Plans, enrollment, claims' },
  { id: 'm-compensation', title: 'Compensation', category: 'module', path: '/dashboard/compensation', description: 'Salary, bonuses, equity' },
  { id: 'm-analytics', title: 'Analytics & Reports', category: 'module', path: '/dashboard/analytics', description: 'Dashboards, custom reports' },
  { id: 'm-engagement', title: 'Employee Engagement', category: 'module', path: '/dashboard/engagement', description: 'Surveys, recognition, events' },
  { id: 'm-helpdesk', title: 'HR Helpdesk', category: 'module', path: '/dashboard/helpdesk', description: 'Tickets, knowledge base' },
  { id: 'm-onboarding', title: 'Onboarding', category: 'module', path: '/dashboard/onboarding', description: 'New hire workflows' },
  { id: 'm-offboarding', title: 'Offboarding', category: 'module', path: '/dashboard/offboarding', description: 'Exit processes' },
  { id: 'm-core-hr', title: 'Core HR', category: 'module', path: '/dashboard/core-hr', description: 'Employee database, org structure' },
  { id: 'm-compliance', title: 'Compliance', category: 'module', path: '/dashboard/compliance', description: 'Labor law, GDPR, audits' },
  { id: 'm-workflow', title: 'Workflow Engine', category: 'module', path: '/dashboard/workflow-engine', description: 'Design and manage workflows' },
  { id: 'm-documents', title: 'My Documents', category: 'module', path: '/dashboard/my-services/my-documents', description: 'Personal document vault' },
  { id: 'm-approvals', title: 'Approvals', category: 'module', path: '/dashboard/approvals', description: 'Pending approvals center' },
  { id: 'a-apply-leave', title: 'Apply Leave', category: 'action', path: '/dashboard/leave/leave-application', description: 'Submit a new leave request' },
  { id: 'a-clock-in', title: 'Clock In/Out', category: 'action', path: '/dashboard/attendance/time-capture', description: 'Record attendance' },
  { id: 'a-payslip', title: 'View Payslip', category: 'action', path: '/dashboard/my-services/payslip-access', description: 'Access pay stubs' },
  { id: 'a-directory', title: 'Employee Directory', category: 'action', path: '/dashboard/my-services/team-directory', description: 'Find colleagues' },
];

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = searchQuery.toLowerCase();
    const filtered = SEARCHABLE_PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.description?.toLowerCase().includes(q) ||
        page.category.includes(q)
    );
    setResults(filtered);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  return { results, loading };
}
