/**
 * @module MenuIconsTest
 * @description Comprehensive tests for menu icon mapping utilities
 * @project AURA HCM Platform - QA Implementation
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Brain,
  Clock,
  Shield,
  Gift,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Target,
  FileText,
  Users,
  Heart,
  User,
  ThumbsUp,
  PartyPopper,
  Gamepad2,
  HeartPulse,
  Calculator,
  HelpCircle,
  Headphones,
  Briefcase,
  GraduationCap,
  Scale,
  Calendar,
  Globe,
  Smartphone,
  UserCheck,
  LogOut,
  UserPlus,
  Network,
  Wallet,
  BarChart3,
  FileCheck,
  Building2,
  Search,
  Home as HomeIcon,
  Plane,
  Settings,
  Award,
  Workflow,
  LineChart,
  LayoutDashboard,
  LogOutIcon,
} from 'lucide-react';
import { menuIconMap, getMenuIcon } from './menu-icons';
import type { MenuIconName } from '@aura/types';

describe('MenuIcons', () => {
  describe('menuIconMap', () => {
    describe('Core HR Module Icons', () => {
      it('maps coreHr to Users icon', () => {
        expect(menuIconMap.coreHr).toBe(Users);
      });

      it('maps recruitment to Search icon', () => {
        expect(menuIconMap.recruitment).toBe(Search);
      });

      it('maps onboarding to UserPlus icon', () => {
        expect(menuIconMap.onboarding).toBe(UserPlus);
      });

      it('maps offboarding to LogOut icon', () => {
        expect(menuIconMap.offboarding).toBe(LogOut);
      });

      it('maps orgDesign to Network icon', () => {
        expect(menuIconMap.orgDesign).toBe(Network);
      });

      it('maps positionBudgeting to Building2 icon', () => {
        expect(menuIconMap.positionBudgeting).toBe(Building2);
      });
    });

    describe('Time & Attendance Module Icons', () => {
      it('maps attendance to Clock icon', () => {
        expect(menuIconMap.attendance).toBe(Clock);
      });

      it('maps leave to Calendar icon', () => {
        expect(menuIconMap.leave).toBe(Calendar);
      });
    });

    describe('Payroll & Compensation Module Icons', () => {
      it('maps payroll to Wallet icon', () => {
        expect(menuIconMap.payroll).toBe(Wallet);
      });

      it('maps compensation to DollarSign icon', () => {
        expect(menuIconMap.compensation).toBe(DollarSign);
      });

      it('maps benefits to Gift icon', () => {
        expect(menuIconMap.benefits).toBe(Gift);
      });
    });

    describe('Performance & Talent Module Icons', () => {
      it('maps performance to BarChart3 icon', () => {
        expect(menuIconMap.performance).toBe(BarChart3);
      });

      it('maps competency to Target icon', () => {
        expect(menuIconMap.competency).toBe(Target);
      });

      it('maps succession to Award icon', () => {
        expect(menuIconMap.succession).toBe(Award);
      });

      it('maps career to TrendingUp icon', () => {
        expect(menuIconMap.career).toBe(TrendingUp);
      });
    });

    describe('Learning & Development Module Icons', () => {
      it('maps learning to GraduationCap icon', () => {
        expect(menuIconMap.learning).toBe(GraduationCap);
      });
    });

    describe('Employee Engagement Module Icons', () => {
      it('maps engagement to PartyPopper icon', () => {
        expect(menuIconMap.engagement).toBe(PartyPopper);
      });

      it('maps engagementEmployee to ThumbsUp icon', () => {
        expect(menuIconMap.engagementEmployee).toBe(ThumbsUp);
      });

      it('maps gamification to Gamepad2 icon', () => {
        expect(menuIconMap.gamification).toBe(Gamepad2);
      });

      it('maps wellness to HeartPulse icon', () => {
        expect(menuIconMap.wellness).toBe(HeartPulse);
      });
    });

    describe('Compliance & Policy Module Icons', () => {
      it('maps policy to FileCheck icon', () => {
        expect(menuIconMap.policy).toBe(FileCheck);
      });

      it('maps contract to FileText icon', () => {
        expect(menuIconMap.contract).toBe(FileText);
      });

      it('maps security to Shield icon', () => {
        expect(menuIconMap.security).toBe(Shield);
      });

      it('maps labor to Scale icon', () => {
        expect(menuIconMap.labor).toBe(Scale);
      });
    });

    describe('Workforce Planning Module Icons', () => {
      it('maps workforcePlanning to LineChart icon', () => {
        expect(menuIconMap.workforcePlanning).toBe(LineChart);
      });

      it('maps hrBudgeting to Calculator icon', () => {
        expect(menuIconMap.hrBudgeting).toBe(Calculator);
      });
    });

    describe('DEI & Culture Module Icons', () => {
      it('maps dei to Heart icon', () => {
        expect(menuIconMap.dei).toBe(Heart);
      });
    });

    describe('Service & Support Module Icons', () => {
      it('maps hrHelpdesk to HelpCircle icon', () => {
        expect(menuIconMap.hrHelpdesk).toBe(HelpCircle);
      });

      it('maps hrsd to Headphones icon', () => {
        expect(menuIconMap.hrsd).toBe(Headphones);
      });

      it('maps help to HelpCircle icon', () => {
        expect(menuIconMap.help).toBe(HelpCircle);
      });
    });

    describe('Self-Service Module Icons', () => {
      it('maps ess to User icon', () => {
        expect(menuIconMap.ess).toBe(User);
      });

      it('maps mss to UserCheck icon', () => {
        expect(menuIconMap.mss).toBe(UserCheck);
      });
    });

    describe('Travel & Remote Work Module Icons', () => {
      it('maps travel to Plane icon', () => {
        expect(menuIconMap.travel).toBe(Plane);
      });

      it('maps remoteWork to HomeIcon icon', () => {
        expect(menuIconMap.remoteWork).toBe(HomeIcon);
      });
    });

    describe('System & Tools Module Icons', () => {
      it('maps dashboard to LayoutDashboard icon', () => {
        expect(menuIconMap.dashboard).toBe(LayoutDashboard);
      });

      it('maps reports to LineChart icon', () => {
        expect(menuIconMap.reports).toBe(LineChart);
      });

      it('maps workflow to Workflow icon', () => {
        expect(menuIconMap.workflow).toBe(Workflow);
      });

      it('maps ai to Brain icon', () => {
        expect(menuIconMap.ai).toBe(Brain);
      });

      it('maps chatbot to MessageSquare icon', () => {
        expect(menuIconMap.chatbot).toBe(MessageSquare);
      });

      it('maps settings to Settings icon', () => {
        expect(menuIconMap.settings).toBe(Settings);
      });

      it('maps userManagement to Settings icon', () => {
        expect(menuIconMap.userManagement).toBe(Settings);
      });

      it('maps logout to LogOutIcon icon', () => {
        expect(menuIconMap.logout).toBe(LogOutIcon);
      });
    });

    describe('Additional Features Module Icons', () => {
      it('maps healthSafety to HeartPulse icon', () => {
        expect(menuIconMap.healthSafety).toBe(HeartPulse);
      });

      it('maps jobLibrary to Briefcase icon', () => {
        expect(menuIconMap.jobLibrary).toBe(Briefcase);
      });

      it('maps localization to Globe icon', () => {
        expect(menuIconMap.localization).toBe(Globe);
      });

      it('maps mobile to Smartphone icon', () => {
        expect(menuIconMap.mobile).toBe(Smartphone);
      });
    });

    describe('Icon Map Completeness', () => {
      it('contains all expected icon mappings', () => {
        const expectedIconCount = 48; // Total number of mapped icons
        expect(Object.keys(menuIconMap).length).toBe(expectedIconCount);
      });

      it('has unique icon names', () => {
        const iconNames = Object.keys(menuIconMap);
        const uniqueIconNames = new Set(iconNames);
        expect(uniqueIconNames.size).toBe(iconNames.length);
      });

      it('all values are valid Lucide icon components', () => {
        Object.values(menuIconMap).forEach((IconComponent) => {
          expect(IconComponent).toBeDefined();
          expect(typeof IconComponent).toBe('function');
        });
      });
    });
  });

  describe('getMenuIcon', () => {
    describe('Valid Icon Names', () => {
      it('returns Brain icon for "ai"', () => {
        const Icon = getMenuIcon('ai');
        expect(Icon).toBe(Brain);
      });

      it('returns Clock icon for "attendance"', () => {
        const Icon = getMenuIcon('attendance');
        expect(Icon).toBe(Clock);
      });

      it('returns Users icon for "coreHr"', () => {
        const Icon = getMenuIcon('coreHr');
        expect(Icon).toBe(Users);
      });

      it('returns Search icon for "recruitment"', () => {
        const Icon = getMenuIcon('recruitment');
        expect(Icon).toBe(Search);
      });

      it('returns Wallet icon for "payroll"', () => {
        const Icon = getMenuIcon('payroll');
        expect(Icon).toBe(Wallet);
      });

      it('returns BarChart3 icon for "performance"', () => {
        const Icon = getMenuIcon('performance');
        expect(Icon).toBe(BarChart3);
      });

      it('returns GraduationCap icon for "learning"', () => {
        const Icon = getMenuIcon('learning');
        expect(Icon).toBe(GraduationCap);
      });

      it('returns Settings icon for "settings"', () => {
        const Icon = getMenuIcon('settings');
        expect(Icon).toBe(Settings);
      });

      it('returns LogOutIcon icon for "logout"', () => {
        const Icon = getMenuIcon('logout');
        expect(Icon).toBe(LogOutIcon);
      });

      it('returns LayoutDashboard icon for "dashboard"', () => {
        const Icon = getMenuIcon('dashboard');
        expect(Icon).toBe(LayoutDashboard);
      });
    });

    describe('Fallback Behavior', () => {
      it('returns HelpCircle for invalid icon name', () => {
        const Icon = getMenuIcon('invalidIconName' as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });

      it('returns HelpCircle for undefined icon name', () => {
        const Icon = getMenuIcon(undefined as unknown as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });

      it('returns HelpCircle for null icon name', () => {
        const Icon = getMenuIcon(null as unknown as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });

      it('returns HelpCircle for empty string icon name', () => {
        const Icon = getMenuIcon('' as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });
    });

    describe('Icon Component Rendering', () => {
      it('returned icon can be rendered as React component', () => {
        const Icon = getMenuIcon('ai');
        const { container } = render(<Icon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      it('renders different icons for different names', () => {
        const Icon1 = getMenuIcon('ai');
        const Icon2 = getMenuIcon('payroll');

        const { container: container1 } = render(<Icon1 data-testid="icon1" />);
        const { container: container2 } = render(<Icon2 data-testid="icon2" />);

        const svg1 = container1.querySelector('svg');
        const svg2 = container2.querySelector('svg');

        expect(svg1).toBeInTheDocument();
        expect(svg2).toBeInTheDocument();
        // Icons should be different
        expect(svg1?.innerHTML).not.toBe(svg2?.innerHTML);
      });

      it('fallback icon renders correctly', () => {
        const Icon = getMenuIcon('invalidName' as MenuIconName);
        const { container } = render(<Icon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });

      it('can render icon with custom props', () => {
        const Icon = getMenuIcon('dashboard');
        const { container } = render(<Icon className="custom-class" size={24} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('custom-class');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
      });
    });

    describe('All Icons Can Be Retrieved', () => {
      it('retrieves all icons from the map', () => {
        const iconNames = Object.keys(menuIconMap) as MenuIconName[];

        iconNames.forEach((iconName) => {
          const Icon = getMenuIcon(iconName);
          expect(Icon).toBeDefined();
          expect(Icon).toBe(menuIconMap[iconName]);
        });
      });
    });

    describe('Edge Cases', () => {
      it('handles icon names with special characters gracefully', () => {
        const Icon = getMenuIcon('icon@name!' as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });

      it('handles numeric icon names gracefully', () => {
        const Icon = getMenuIcon('123' as MenuIconName);
        expect(Icon).toBe(HelpCircle);
      });

      it('handles very long icon names gracefully', () => {
        const longName = 'a'.repeat(1000) as MenuIconName;
        const Icon = getMenuIcon(longName);
        expect(Icon).toBe(HelpCircle);
      });

      it('handles icon names with whitespace gracefully', () => {
        const Icon = getMenuIcon('  ai  ' as MenuIconName);
        expect(Icon).toBe(HelpCircle); // Should fallback as trimming is not performed
      });
    });

    describe('Type Safety', () => {
      it('returns a component that can be used in JSX', () => {
        const Icon = getMenuIcon('ai');
        expect(() => render(<Icon />)).not.toThrow();
      });

      it('returned component accepts Lucide icon props', () => {
        const Icon = getMenuIcon('recruitment');
        expect(() =>
          render(<Icon size={32} color="red" strokeWidth={2} />)
        ).not.toThrow();
      });
    });

    describe('Consistency', () => {
      it('returns same icon component for same icon name', () => {
        const Icon1 = getMenuIcon('payroll');
        const Icon2 = getMenuIcon('payroll');
        expect(Icon1).toBe(Icon2);
      });

      it('returns consistent fallback for invalid names', () => {
        const Icon1 = getMenuIcon('invalid1' as MenuIconName);
        const Icon2 = getMenuIcon('invalid2' as MenuIconName);
        expect(Icon1).toBe(Icon2);
        expect(Icon1).toBe(HelpCircle);
      });
    });

    describe('Integration Tests', () => {
      it('works correctly in a typical menu rendering scenario', () => {
        const menuItems: MenuIconName[] = ['dashboard', 'coreHr', 'payroll', 'recruitment'];

        menuItems.forEach((iconName) => {
          const Icon = getMenuIcon(iconName);
          const { container } = render(<Icon />);
          expect(container.querySelector('svg')).toBeInTheDocument();
        });
      });

      it('handles mixed valid and invalid icon names', () => {
        const iconNames = ['dashboard', 'invalid' as MenuIconName, 'payroll'];

        const icons = iconNames.map(getMenuIcon);

        expect(icons[0]).toBe(LayoutDashboard);
        expect(icons[1]).toBe(HelpCircle);
        expect(icons[2]).toBe(Wallet);
      });
    });
  });

  describe('Icon Map vs getMenuIcon Consistency', () => {
    it('getMenuIcon returns icons from menuIconMap', () => {
      const iconNames = Object.keys(menuIconMap) as MenuIconName[];

      iconNames.forEach((iconName) => {
        const directIcon = menuIconMap[iconName];
        const retrievedIcon = getMenuIcon(iconName);
        expect(retrievedIcon).toBe(directIcon);
      });
    });

    it('menuIconMap keys match expected MenuIconName types', () => {
      const iconNames = Object.keys(menuIconMap);

      iconNames.forEach((iconName) => {
        expect(typeof iconName).toBe('string');
        expect(iconName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('getMenuIcon executes quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getMenuIcon('dashboard');
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete 1000 lookups in less than 10ms
      expect(executionTime).toBeLessThan(10);
    });

    it('handles rapid successive calls efficiently', () => {
      const iconNames: MenuIconName[] = ['ai', 'payroll', 'recruitment', 'dashboard', 'learning'];

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        iconNames.forEach(getMenuIcon);
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete 500 lookups in less than 10ms
      expect(executionTime).toBeLessThan(10);
    });
  });
});
