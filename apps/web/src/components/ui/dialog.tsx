import * as React from "react"

const Dialog = ({ children, open, onOpenChange }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {children}
        </div>
    );
};

const DialogTrigger = ({ children, asChild }: any) => children;

const DialogContent = ({ children, className }: any) => (
    <div className={`bg-background p-6 shadow-lg rounded-lg max-w-lg w-full ${className}`}>
        {children}
    </div>
);

const DialogHeader = ({ children }: any) => <div className="space-y-1.5 text-center sm:text-left mb-4">{children}</div>;

const DialogTitle = ({ children }: any) => <h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>;

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle }
