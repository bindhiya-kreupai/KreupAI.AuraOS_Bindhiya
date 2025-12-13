import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full'
};

export function Sheet({ isOpen, onClose, title, children, footer, className, size = 'md' }: SheetProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={cn("fixed inset-0 z-[100] flex justify-end pointer-events-none", className)}>
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    "relative w-full h-full bg-white dark:bg-deep-cosmos shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col pointer-events-auto",
                    sizeClasses[size],
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-cloud dark:border-nebula-purple/50">
                    <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-silver-mist hover:text-ink-black dark:hover:text-pearl hover:bg-cloud/50 dark:hover:bg-nebula-purple/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-cloud dark:border-nebula-purple/50 bg-pearl/30 dark:bg-deep-cosmos/30">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
