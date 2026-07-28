import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, Filter, ArrowUpDown, Download, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Column<T> {
    key: string;
    header?: string;
    label?: string; // Alias for header
    render?: (row: T) => React.ReactNode;
    width?: string;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onSearch?: (query: string) => void;
    onRowClick?: (row: T) => void;
    onExport?: () => void;
    onImport?: () => void;
    onFilter?: () => void;
    /**
     * Extra controls rendered in the toolbar after the built-in icon buttons.
     * Use to inject ExportMenu, ImportDialog triggers, FilterPanel toggles, etc.
     */
    toolbarSlot?: React.ReactNode;
    className?: string;
    /** Client-side pagination */
    pagination?: {
        currentPage: number;
        totalPages: number;
        total: number;
        pageSize: number;
        onPageChange: (page: number) => void;
    };
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onSearch,
    onRowClick,
    onExport,
    onImport,
    onFilter,
    toolbarSlot,
    className,
    pagination
}: DataTableProps<T>) {
    const showPagination = pagination && pagination.totalPages > 1;

    return (
        <div className={cn("bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden", className)}>
            {/* Toolbar */}
            <div className="p-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos border-none rounded-lg focus:ring-2 focus:ring-celestial-indigo/50 placeholder:text-silver-mist text-ink-black dark:text-pearl"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {onFilter && (
                        <button
                            onClick={onFilter}
                            className="p-2 text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10 rounded-lg transition-colors"
                            title="Filter"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    )}
                    {onImport && (
                        <button
                            onClick={onImport}
                            className="p-2 text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10 rounded-lg transition-colors"
                            title="Import"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                    )}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="p-2 text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10 rounded-lg transition-colors"
                            title="Export"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                    {toolbarSlot}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-silver-mist uppercase bg-pearl/50 dark:bg-deep-cosmos/50 border-b border-cloud dark:border-nebula-purple/50">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap" style={{ width: col.width }}>
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-celestial-indigo transition-colors group">
                                        {col.header || col.label}
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-silver-mist">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row)}
                                    className="group hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 transition-colors cursor-pointer"
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-2.5 text-ink-black dark:text-pearl whitespace-nowrap">
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            {showPagination && pagination ? (
                <div className="px-4 py-3 border-t border-cloud dark:border-nebula-purple/50 flex items-center justify-between text-xs text-silver-mist">
                    <span>
                        Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
                        {pagination.total} entries
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                pagination.currentPage <= 1
                                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                    : "text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (pagination.totalPages <= 7) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage <= 4) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 3) {
                                pageNum = pagination.totalPages - 6 + i;
                            } else {
                                pageNum = pagination.currentPage - 3 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => pagination.onPageChange(pageNum)}
                                    className={cn(
                                        "px-2.5 py-1 text-sm rounded-md transition-colors",
                                        pageNum === pagination.currentPage
                                            ? "bg-celestial-indigo text-white"
                                            : "text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                pagination.currentPage >= pagination.totalPages
                                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                    : "text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                            )}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-cloud dark:border-nebula-purple/50 flex items-center justify-between text-xs text-silver-mist">
                    <span>Showing {data.length} entries</span>
                </div>
            )}
        </div>
    );
}
