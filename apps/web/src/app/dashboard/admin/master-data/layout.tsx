import React from 'react';

export default function MasterDataLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full flex flex-col">
            {children}
        </div>
    );
}
