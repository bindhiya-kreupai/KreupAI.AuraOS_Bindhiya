'use client';

/**
 * @module RightPanel
 * @description Collapsible right panel for quick access, history, and notifications
 * @project AURA HCM Platform
 * @reference docs/aura-uiux-design.md
 */


import React, { useState, useEffect } from 'react';
import {
    History,
    Bell,
    Star,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Download,
    Calendar,
    CheckSquare
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const RightPanel = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [activeTab, setActiveTab] = useState<'quick' | 'recent' | 'notifications'>('quick');

    // Handle hover expansion with delay
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleMouseEnter = () => {
            if (!isPinned) {
                timeoutId = setTimeout(() => setIsExpanded(true), 300);
            }
        };

        const handleMouseLeave = () => {
            if (!isPinned) {
                timeoutId = setTimeout(() => setIsExpanded(false), 300);
            }
        };

        const panel = document.getElementById('aura-right-panel');
        if (panel) {
            panel.addEventListener('mouseenter', handleMouseEnter);
            panel.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (panel) {
                panel.removeEventListener('mouseenter', handleMouseEnter);
                panel.removeEventListener('mouseleave', handleMouseLeave);
            }
            clearTimeout(timeoutId);
        };
    }, [isPinned]);

    return (
        <aside
            id="aura-right-panel"
            className={cn(
                'fixed right-0 top-0 h-screen bg-white dark:bg-deep-cosmos border-l border-cloud dark:border-nebula-purple transition-all duration-300 z-50 flex shadow-xl',
                (isExpanded || isPinned) ? 'w-80' : 'w-14'
            )}
        >
            {/* Icon Bar (Always Visible) */}
            <div className="w-14 flex flex-col items-center py-4 gap-6 bg-pearl/50 dark:bg-stellar-blue/50 h-full border-r border-cloud dark:border-nebula-purple/50">
                <button
                    onClick={() => setActiveTab('quick')}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        activeTab === 'quick' ? "bg-celestial-indigo text-white shadow-glow-indigo" : "text-twilight dark:text-silver-mist hover:bg-white dark:hover:bg-deep-cosmos"
                    )}
                >
                    <Star className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        activeTab === 'recent' ? "bg-quantum-rose text-white shadow-glow-rose" : "text-twilight dark:text-silver-mist hover:bg-white dark:hover:bg-deep-cosmos"
                    )}
                >
                    <History className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        activeTab === 'notifications' ? "bg-neural-mint text-white shadow-glow-mint" : "text-twilight dark:text-silver-mist hover:bg-white dark:hover:bg-deep-cosmos"
                    )}
                >
                    <Bell className="w-5 h-5" />
                </button>

                <div className="flex-1" />

                <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn(
                        "p-2 rounded-xl transition-all mb-4",
                        isPinned ? "text-celestial-indigo bg-celestial-indigo/10" : "text-twilight dark:text-silver-mist hover:bg-white dark:hover:bg-deep-cosmos"
                    )}
                >
                    {isPinned ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Expanded Content */}
            <div className={cn(
                "flex-1 flex flex-col overflow-hidden transition-opacity duration-300",
                (isExpanded || isPinned) ? "opacity-100" : "opacity-0"
            )}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-cloud dark:border-nebula-purple">
                    <h3 className="font-display font-semibold text-ink-black dark:text-pearl">
                        {activeTab === 'quick' && 'Quick Access'}
                        {activeTab === 'recent' && 'Recent History'}
                        {activeTab === 'notifications' && 'Notifications'}
                    </h3>
                    <button className="p-1 hover:bg-pearl dark:hover:bg-stellar-blue rounded-lg text-silver-mist">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeTab === 'quick' && (
                        <div className="space-y-2">
                            <QuickAccessItem icon={Download} label="Export Report" />
                            <QuickAccessItem icon={Calendar} label="Team Calendar" />
                            <QuickAccessItem icon={CheckSquare} label="My Tasks" />
                        </div>
                    )}

                    {activeTab === 'recent' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-silver-mist uppercase tracking-wider">Today</p>
                                <RecentItem title="Payroll Report Q3" type="Report" time="2m ago" />
                                <RecentItem title="Sarah Johnson" type="Employee Profile" time="1h ago" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-silver-mist uppercase tracking-wider">Yesterday</p>
                                <RecentItem title="Leave Policy" type="Document" time="1d ago" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-3">
                            <NotificationItem
                                title="Leave Request"
                                message="John Doe requested sick leave"
                                time="5m ago"
                                unread
                            />
                            <NotificationItem
                                title="System Update"
                                message="Maintenance scheduled for tonight"
                                time="2h ago"
                            />
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

const QuickAccessItem = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-pearl dark:hover:bg-stellar-blue transition-colors group">
        <div className="p-2 rounded-lg bg-white dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple group-hover:border-celestial-indigo/30 transition-colors">
            <Icon className="w-4 h-4 text-celestial-indigo" />
        </div>
        <span className="text-sm font-medium text-ink-black dark:text-pearl">{label}</span>
    </button>
);

const RecentItem = ({ title, type, time }: { title: string, type: string, time: string }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-pearl dark:hover:bg-stellar-blue transition-colors cursor-pointer">
        <div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">{title}</p>
            <p className="text-xs text-silver-mist">{type}</p>
        </div>
        <span className="text-xs text-silver-mist">{time}</span>
    </div>
);

const NotificationItem = ({ title, message, time, unread }: { title: string, message: string, time: string, unread?: boolean }) => (
    <div className={cn(
        "p-3 rounded-xl border transition-all cursor-pointer",
        unread
            ? "bg-white dark:bg-stellar-blue border-celestial-indigo/30 shadow-sm"
            : "border-transparent hover:bg-pearl dark:hover:bg-stellar-blue"
    )}>
        <div className="flex items-start justify-between mb-1">
            <p className={cn("text-sm font-medium", unread ? "text-celestial-indigo" : "text-ink-black dark:text-pearl")}>
                {title}
            </p>
            <span className="text-xs text-silver-mist">{time}</span>
        </div>
        <p className="text-xs text-twilight dark:text-silver-mist line-clamp-2">{message}</p>
    </div>
);
