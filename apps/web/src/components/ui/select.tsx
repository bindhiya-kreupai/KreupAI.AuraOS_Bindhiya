import * as React from "react"

const Select = ({ children, value, onValueChange }: any) => {
    return (
        <div className="relative">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
                }
                return child;
            })}
        </div>
    );
};

const SelectTrigger = ({ children, className }: any) => (
    <button className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
        {children}
    </button>
);

const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;

const SelectContent = ({ children }: any) => (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
        <div className="p-1">{children}</div>
    </div>
);

const SelectItem = ({ value, children, onValueChange }: any) => (
    <div
        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        onClick={() => onValueChange?.(value)}
    >
        {children}
    </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
