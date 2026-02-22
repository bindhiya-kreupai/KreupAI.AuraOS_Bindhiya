import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ElementType;
    };
    className?: string;
}

export function PageHeader({ title, description, breadcrumbs, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between mb-6", className)}>
            <div>
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center text-xs text-silver-mist mb-1">
                        {breadcrumbs.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
                                <span className={cn(
                                    index === breadcrumbs.length - 1 ? "text-ink-black dark:text-pearl font-medium" : "hover:text-celestial-indigo transition-colors cursor-pointer"
                                )}>
                                    {item.label}
                                </span>
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold text-ink-black dark:text-pearl tracking-tight">{title}</h1>
                {description && <p className="text-sm text-silver-mist mt-1">{description}</p>}
            </div>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    {action.icon ? <action.icon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {action.label}
                </button>
            )}
        </div>
    );
}
