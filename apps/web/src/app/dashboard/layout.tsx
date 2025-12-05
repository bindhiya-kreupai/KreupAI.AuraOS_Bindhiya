import React from 'react';
import { SidebarMenu, TopNav } from '@aura/ui/components/menu';
import { RightPanel } from '@aura/ui/components/layout';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-pearl dark:bg-deep-cosmos overflow-hidden">
            {/* Sidebar */}
            <SidebarMenu />

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
