'use client';

import React, { useState, useCallback } from 'react';
import { SidebarMenu, TopNav } from '@aura/ui/components/menu';
import { RightPanel } from '@aura/ui/components/layout';

interface FavoriteItem {
    path: string;
    title: string;
    module: string;
    icon?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

    const handleToggleFavorite = useCallback((item: FavoriteItem) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.path === item.path);
            if (exists) {
                return prev.filter(f => f.path !== item.path);
            }
            return [...prev, item];
        });
    }, []);

    const handleNavigate = useCallback((item: { path: string; title: string; module: string }) => {
        // Track navigation for recent activity
        console.log('Navigated to:', item);
    }, []);

    return (
        <div className="flex h-screen bg-pearl dark:bg-deep-cosmos overflow-hidden">
            {/* Sidebar */}
            <SidebarMenu
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onNavigate={handleNavigate}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navigation */}
                <TopNav />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-2 scroll-smooth pr-16">
                    <div className="max-w-full mx-auto w-full h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Right Panel (Action Hub) */}
            <RightPanel />
        </div>
    );
}
