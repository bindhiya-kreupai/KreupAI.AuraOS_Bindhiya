/**
 * @module MenuTypes
 * @description Type definitions for AURA navigation menu system
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

export interface MenuItem {
  id: string;
  code: string;
  label: string;
  labelKey: string; // i18n key
  icon: string;
  path: string;
  permissions?: string[];
  featureFlag?: string;
  badge?: {
    count: number;
    variant: 'default' | 'warning' | 'error' | 'success';
  };
  isActive?: boolean;
  isExpanded?: boolean;
  children?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  code: string;
  label: string;
  labelKey: string;
  path: string;
  permissions?: string[];
  featureFlag?: string;
  badge?: {
    count: number;
    variant: 'default' | 'warning' | 'error' | 'success';
  };
  isActive?: boolean;
}

export interface MenuGroup {
  id: string;
  title: string;
  titleKey: string;
  items: MenuItem[];
  isCollapsible?: boolean;
  isExpanded?: boolean;
}

export interface MenuConfig {
  role: string;
  menuName: string;
  groups: MenuGroup[];
}

export interface MenuState {
  activeItemId: string | null;
  expandedItems: string[];
  searchQuery: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
}

export type MenuVariant = 'sidebar' | 'topbar' | 'mobile' | 'constellation';

export interface MenuProps {
  variant?: MenuVariant;
  collapsed?: boolean;
  onItemClick?: (item: MenuItem | SubMenuItem) => void;
  onToggleCollapse?: () => void;
  className?: string;
}

export interface MenuContextValue {
  config: MenuConfig | null;
  state: MenuState;
  setActiveItem: (id: string) => void;
  toggleExpanded: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleCollapsed: () => void;
  toggleMobileMenu: () => void;
  getFilteredItems: () => MenuGroup[];
}

// Icon mapping type
export type MenuIconName =
  | 'ai'
  | 'attendance'
  | 'security'
  | 'benefits'
  | 'career'
  | 'chatbot'
  | 'compensation'
  | 'competency'
  | 'contract'
  | 'coreHr'
  | 'dei'
  | 'ess'
  | 'engagementEmployee'
  | 'engagement'
  | 'gamification'
  | 'healthSafety'
  | 'hrBudgeting'
  | 'hrHelpdesk'
  | 'hrsd'
  | 'jobLibrary'
  | 'learning'
  | 'labor'
  | 'leave'
  | 'localization'
  | 'mobile'
  | 'mss'
  | 'offboarding'
  | 'onboarding'
  | 'orgDesign'
  | 'payroll'
  | 'performance'
  | 'policy'
  | 'positionBudgeting'
  | 'recruitment'
  | 'remoteWork'
  | 'reports'
  | 'succession'
  | 'travel'
  | 'userManagement'
  | 'wellness'
  | 'workflow'
  | 'workforcePlanning'
  | 'dashboard'
  | 'settings'
  | 'help'
  | 'logout';
