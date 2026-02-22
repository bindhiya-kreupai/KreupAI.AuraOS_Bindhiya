import * as React from 'react';
import { cn } from '../../utils';
import {
  FileText,
  Globe,
  Users,
  Building2,
  CalendarDays,
  Briefcase,
  MapPin,
  DollarSign,
  Star,
  Award,
  Clock,
  Package,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  leave: CalendarDays,
  department: Building2,
  globe: Globe,
  location: MapPin,
  currency: DollarSign,
  designation: Briefcase,
  skill: Star,
  shift: Clock,
  employee: Users,
  document: FileText,
  award: Award,
  default: Package,
};

export interface EmptyPageProps {
  /** Module name displayed as the page title */
  module?: string;
  /** Icon key from the icon map or a custom React element */
  icon?: string | React.ElementType;
  /** List of planned features to display */
  features?: string[];
  /** Display variant */
  variant?: 'default' | 'coming-soon';
  /** Custom title (overrides module-based title) */
  title?: string;
  /** Custom description text */
  description?: string;
  /** Additional CSS class names */
  className?: string;
}

export function EmptyPage({
  module,
  icon,
  features = [],
  variant = 'default',
  title,
  description,
  className,
}: EmptyPageProps) {
  const IconComponent = React.useMemo(() => {
    if (typeof icon === 'string') {
      return iconMap[icon] || iconMap.default;
    }
    if (icon) return icon;
    return iconMap.default;
  }, [icon]);

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[60vh] p-8', className)}>
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <IconComponent className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          {title || module}
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          {description ||
            (variant === 'coming-soon'
              ? 'This feature is coming soon. Stay tuned!'
              : 'This module is under development. The following features are planned:')}
        </p>

        {features.length > 0 && (
          <ul className="w-full text-left space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
