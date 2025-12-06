"use client";

import React from 'react';

export default function AttendanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full h-full space-y-6">
            {children}
        </div>
    );
}
