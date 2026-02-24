/**
 * @module useGlobalSearch
 * @description Debounced search hook with categorized results for employees, modules/pages, and documents
 * @project AURA HCM Platform
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { superAdminMenu } from '@aura/config/src/super-admin-menu';
import type { MenuModule } from '@aura/config/src/super-admin-menu';
import type { SearchCategory } from '@/stores/search-store';

// ── Result Types ───────────────────────────────────────────────────────────────

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  category: 'employees' | 'modules' | 'documents';
  path: string;
  icon?: string;
  tags?: string[];
  score: number;
}

export interface SearchResults {
  employees: SearchResultItem[];
  modules: SearchResultItem[];
  documents: SearchResultItem[];
  total: number;
}

interface UseGlobalSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  category?: SearchCategory;
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResults;
  isSearching: boolean;
  hasResults: boolean;
  totalResults: number;
}

// ── Search Index Builders ──────────────────────────────────────────────────────

function buildModuleIndex(): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  function processModule(mod: MenuModule, parentLabel?: string) {
    // Add the module itself
    const modulePath = mod.path || `/dashboard/${mod.code.toLowerCase().replace(/_/g, '-')}`;
    items.push({
      id: `mod_${mod.code}`,
      title: mod.label,
      description: parentLabel ? `${parentLabel} > ${mod.label}` : `Module`,
      category: 'modules',
      path: modulePath,
      icon: mod.icon,
      tags: mod.features,
      score: 0,
    });

    // Add each feature as a page
    if (mod.features) {
      for (const feature of mod.features) {
        const featureSlug = feature
          .toLowerCase()
          .replace(/[&]/g, 'and')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        items.push({
          id: `feat_${mod.code}_${featureSlug}`,
          title: feature,
          description: parentLabel ? `${parentLabel} > ${mod.label}` : mod.label,
          category: 'modules',
          path: `${modulePath}/${featureSlug}`,
          icon: mod.icon,
          tags: [mod.label],
          score: 0,
        });
      }
    }

    // Process sub-modules
    if (mod.items) {
      for (const subMod of mod.items) {
        processModule(subMod, mod.label);
      }
    }
  }

  for (const mod of superAdminMenu.items) {
    processModule(mod);
  }

  return items;
}

// Mock employee data - in production, this calls the Elasticsearch API
function buildEmployeeIndex(): SearchResultItem[] {
  return [
    {
      id: 'emp_001',
      title: 'Sarah Johnson',
      description: 'Sr. Developer · Engineering',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['engineering', 'developer'],
      score: 0,
    },
    {
      id: 'emp_002',
      title: 'Mike Chen',
      description: 'UI Designer · Design',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['design', 'ui'],
      score: 0,
    },
    {
      id: 'emp_003',
      title: 'Ana Garcia',
      description: 'QA Engineer · Quality',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['qa', 'quality'],
      score: 0,
    },
    {
      id: 'emp_004',
      title: 'Tom Wilson',
      description: 'Backend Developer · Engineering',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['engineering', 'backend'],
      score: 0,
    },
    {
      id: 'emp_005',
      title: 'Lisa Park',
      description: 'Product Manager · Product',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['product', 'manager'],
      score: 0,
    },
    {
      id: 'emp_006',
      title: 'James Lee',
      description: 'DevOps Engineer · Infrastructure',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['devops', 'infrastructure'],
      score: 0,
    },
    {
      id: 'emp_007',
      title: 'Priya Sharma',
      description: 'HR Manager · Human Resources',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['hr', 'manager'],
      score: 0,
    },
    {
      id: 'emp_008',
      title: 'Alex Turner',
      description: 'Data Analyst · Analytics',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['data', 'analytics'],
      score: 0,
    },
    {
      id: 'emp_009',
      title: 'Emily Roberts',
      description: 'Marketing Lead · Marketing',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['marketing', 'lead'],
      score: 0,
    },
    {
      id: 'emp_010',
      title: 'David Kim',
      description: 'Finance Controller · Finance',
      category: 'employees',
      path: '/dashboard/core-hr/employee-database',
      tags: ['finance', 'controller'],
      score: 0,
    },
  ];
}

// Mock document data - in production, this calls the Elasticsearch API
function buildDocumentIndex(): SearchResultItem[] {
  return [
    {
      id: 'doc_001',
      title: 'Employee Handbook 2026',
      description: 'Policy · HR Department · Updated Feb 2026',
      category: 'documents',
      path: '/dashboard/core-hr/employee-database',
      tags: ['policy', 'handbook'],
      score: 0,
    },
    {
      id: 'doc_002',
      title: 'Leave Policy',
      description: 'Policy · Leave Management · v3.2',
      category: 'documents',
      path: '/dashboard/leave/my-leaves',
      tags: ['policy', 'leave'],
      score: 0,
    },
    {
      id: 'doc_003',
      title: 'Payroll Processing Guide',
      description: 'SOP · Payroll · Updated Jan 2026',
      category: 'documents',
      path: '/dashboard/payroll/payroll-processing',
      tags: ['sop', 'payroll'],
      score: 0,
    },
    {
      id: 'doc_004',
      title: 'Code of Conduct',
      description: 'Policy · Compliance · Mandatory',
      category: 'documents',
      path: '/dashboard/admin/compliance',
      tags: ['policy', 'compliance', 'conduct'],
      score: 0,
    },
    {
      id: 'doc_005',
      title: 'Recruitment SOP',
      description: 'SOP · Recruitment · v2.1',
      category: 'documents',
      path: '/dashboard/recruitment/job-posting',
      tags: ['sop', 'recruitment'],
      score: 0,
    },
    {
      id: 'doc_006',
      title: 'Performance Review Template',
      description: 'Template · Performance · Q4 2025',
      category: 'documents',
      path: '/dashboard/performance/performance-reviews',
      tags: ['template', 'performance'],
      score: 0,
    },
    {
      id: 'doc_007',
      title: 'IT Security Policy',
      description: 'Policy · IT · Mandatory',
      category: 'documents',
      path: '/dashboard/admin/system',
      tags: ['policy', 'security', 'it'],
      score: 0,
    },
    {
      id: 'doc_008',
      title: 'Expense Reimbursement Form',
      description: 'Form · Finance · v1.4',
      category: 'documents',
      path: '/dashboard/payroll/payroll-processing',
      tags: ['form', 'expense', 'finance'],
      score: 0,
    },
  ];
}

// ── Fuzzy Scoring ──────────────────────────────────────────────────────────────

function scoreMatch(item: SearchResultItem, query: string): number {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const tags = (item.tags || []).join(' ').toLowerCase();

  let score = 0;

  // Exact title match
  if (title === q) return 100;

  // Title starts with query
  if (title.startsWith(q)) score += 80;
  // Title contains query
  else if (title.includes(q)) score += 60;

  // Description match
  if (desc.includes(q)) score += 30;

  // Tags match
  if (tags.includes(q)) score += 20;

  // Word-level matching for multi-word queries
  const words = q.split(/\s+/);
  if (words.length > 1) {
    const matchedWords = words.filter(
      (w) => title.includes(w) || desc.includes(w) || tags.includes(w)
    );
    score += (matchedWords.length / words.length) * 40;
  }

  return score;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useGlobalSearch(options: UseGlobalSearchOptions = {}): UseGlobalSearchReturn {
  const { debounceMs = 200, maxResults = 8, category = 'all' } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    employees: [],
    modules: [],
    documents: [],
    total: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build indices once
  const moduleIndex = useMemo(() => buildModuleIndex(), []);
  const employeeIndex = useMemo(() => buildEmployeeIndex(), []);
  const documentIndex = useMemo(() => buildDocumentIndex(), []);

  const performSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults({ employees: [], modules: [], documents: [], total: 0 });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      // Score and filter each category
      const searchCategory = (
        items: SearchResultItem[],
        cat: 'employees' | 'modules' | 'documents'
      ): SearchResultItem[] => {
        if (category !== 'all' && category !== cat) return [];
        return items
          .map((item) => ({ ...item, score: scoreMatch(item, q) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxResults);
      };

      const employees = searchCategory(employeeIndex, 'employees');
      const modules = searchCategory(moduleIndex, 'modules');
      const documents = searchCategory(documentIndex, 'documents');

      setResults({
        employees,
        modules,
        documents,
        total: employees.length + modules.length + documents.length,
      });
      setIsSearching(false);
    },
    [category, maxResults, moduleIndex, employeeIndex, documentIndex]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults({ employees: [], modules: [], documents: [], total: 0 });
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debounceMs, performSearch]);

  const hasResults = results.total > 0;
  const totalResults = results.total;

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    totalResults,
  };
}

export default useGlobalSearch;
