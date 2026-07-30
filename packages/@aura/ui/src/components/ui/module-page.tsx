import * as React from 'react';
import { cn } from '../../utils/index';
import {
  Heart,
  Workflow,
  Users,
  Brain,
  Shield,
  Briefcase,
  GraduationCap,
  Activity,
  Package,
} from 'lucide-react';

const moduleIconMap: Record<string, React.ElementType> = {
  benefits: Heart,
  workflow: Workflow,
  wellness: Activity,
  'user-management': Users,
  ai: Brain,
  security: Shield,
  recruitment: Briefcase,
  learning: GraduationCap,
  default: Package,
};

export interface ModulePageProps {
  /** Internal module code (e.g., 'BENEFITS') */
  moduleCode: string;
  /** Display name of the module */
  moduleName: string;
  /** Icon key from the module icon map */
  moduleIcon?: string;
  /** Number of planned features */
  featureCount?: number;
  /** Whether the module is implemented */
  isImplemented?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export function ModulePage({
  moduleCode,
  moduleName,
  moduleIcon,
  featureCount,
  isImplemented = false,
  className,
}: ModulePageProps) {
  const IconComponent = moduleIconMap[moduleIcon || ''] || moduleIconMap.default;

  if (isImplemented) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[60vh] p-8', className)}>
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight mb-2">{moduleName}</h2>

        <p className="text-sm text-muted-foreground mb-4">
          The {moduleName} module is currently under development.
        </p>

        {featureCount != null && featureCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {featureCount} features planned
          </span>
        )}
      </div>
    </div>
  );
}
