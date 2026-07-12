import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layout/page-header';
import { DataTable, type Column } from './data-table';
import { Sheet } from './sheet';
import { Trash2, Save, Download, Upload, Filter, Plus, Search } from 'lucide-react';
import { cn } from '../../utils';

export interface RowAction<T> {
    label: string;
    icon?: any;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'ghost' | 'secondary' | 'outline' | 'link';
    onClick?: (row: T) => void;
    apiEndpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    onSuccess?: () => void;
    successMessage?: string;
    requiresInput?: boolean;
    inputFields?: FormField[];
    className?: string;
    confirmTitle?: string;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'password' | 'select' | 'date' | 'datetime-local' | 'textarea' | 'checkbox';
    required?: boolean;
    placeholder?: string;
    options?: { value: string; label: string }[];
    rows?: number;
    apiEndpoint?: string;
    valueKey?: string;
    labelKey?: string;
    labelFormat?: (item: any) => string;
    helpText?: string;
    defaultValue?: any;
    step?: number;
}

export interface DataPageProps<T> {
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    data?: T[];
    apiEndpoint?: string;
    columns: Column<T>[];
    onSave?: (data: Partial<T>) => void;
    onDelete?: (row: T) => void;
    onExport?: () => void;
    onImport?: () => void;
    onFilter?: () => void;
    renderForm?: (data: Partial<T>, onChange: (field: keyof T, value: any) => void) => React.ReactNode;
    formFields?: FormField[];
    rowActions?: (row: T) => RowAction<T>[];
    onDataChange?: () => void;
    defaultValues?: Partial<T>;
    searchKeys?: string[];
    searchPlaceholder?: string;
    pageSize?: number;
    singularTitle?: string;
    enableCreate?: boolean;
    enableEdit?: boolean;
    enableDelete?: boolean;
    enableExport?: boolean;
    enableImport?: boolean;
    enableFilter?: boolean;
    enableColumnVisibility?: boolean;
    emptyState?: {
        title: string;
        description: string;
        icon?: any;
    };
    addButtonText?: string;
    filterParams?: Record<string, any>;
    filterOptions?: {
        label: string;
        value: string;
    }[];
    /**
     * Extra controls (e.g. ExportMenu, ImportDialog trigger, SavedView dropdown)
     * rendered in the DataTable toolbar after the built-in icon buttons.
     */
    toolbarSlot?: React.ReactNode;
}

export function DataPage<T extends { id: string | number }>({
    title,
    description,
    breadcrumbs,
    data,
    apiEndpoint,
    columns,
    onSave,
    onDelete,
    onExport,
    onImport,
    onFilter,
    renderForm,
    formFields,
    rowActions,
    onDataChange,
    defaultValues = {} as Partial<T>,
    searchKeys,
    searchPlaceholder,
    pageSize,
    enableCreate,
    enableEdit,
    enableDelete,
    enableExport,
    enableImport,
    enableFilter,
    enableColumnVisibility,
    addButtonText,
    singularTitle,
    filterParams,
    toolbarSlot,
}: DataPageProps<T>) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<T>>(defaultValues);
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchedData, setFetchedData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (apiEndpoint) {
            fetchData();
        }
    }, [apiEndpoint]);

    const fetchData = async () => {
        if (!apiEndpoint) return;
        setLoading(true);
        try {
            const res = await fetch(apiEndpoint);
            const json = await res.json();
            if (json.success) {
                setFetchedData(json.data);
            } else if (Array.isArray(json)) {
                setFetchedData(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const effectiveData = apiEndpoint ? fetchedData : (data || []);

    const handleAdd = () => {
        setCurrentRecord(defaultValues);
        setIsSheetOpen(true);
    };

    const handleEdit = (row: T) => {
        setCurrentRecord(row);
        setIsSheetOpen(true);
    };

    const handleSave = () => {
        onSave?.(currentRecord);
        setIsSheetOpen(false);
        onDataChange?.();
    };

    const handleFieldChange = (field: keyof T, value: any) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    const renderDefaultForm = (data: Partial<T>, onChange: (field: keyof T, value: any) => void) => {
        if (!formFields) return null;
        return (
            <div className="space-y-4">
                {formFields.map((field: any) => (
                    <div key={field.name} className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                            <select
                                value={String(data[field.name as keyof T] || '')}
                                onChange={(e) => onChange(field.name as keyof T, e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="">Select...</option>
                                {field.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                value={String(data[field.name as keyof T] || '')}
                                onChange={(e) => onChange(field.name as keyof T, e.target.value)}
                                className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const formRenderer = renderForm || renderDefaultForm;

    // Filter data
    const filteredData = effectiveData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Add actions column
    const displayColumns = [
        ...columns,
        {
            key: 'actions',
            header: '',
            width: '120px',
            render: (row: T) => {
                const actions = rowActions ? rowActions(row) : [];
                return (
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {actions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (action.onClick) {
                                            action.onClick(row);
                                        } else if (action.apiEndpoint) {
                                            try {
                                                const res = await fetch(action.apiEndpoint, {
                                                    method: action.method || 'GET',
                                                });
                                                if (res.ok) action.onSuccess?.();
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }
                                    }}
                                    className={cn(
                                        Icon ? "p-1.5 rounded-md transition-colors" : "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                                        action.variant === 'danger' ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" :
                                            action.variant === 'success' ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" :
                                                action.variant === 'warning' ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" :
                                                    "text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/10"
                                    )}
                                    title={action.label}
                                >
                                    {Icon ? <Icon className="w-4 h-4" /> : action.label}
                                </button>
                            );
                        })}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-6 space-y-6 h-full flex flex-col relative overflow-hidden">
            <PageHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
                action={enableCreate !== false ? {
                    label: addButtonText || `Add ${singularTitle || title.slice(0, -1)}`,
                    onClick: handleAdd
                } : undefined}
            />

            <div className="flex-1 min-h-0">
                <DataTable
                    data={filteredData}
                    columns={displayColumns}
                    onSearch={setSearchQuery}
                    onRowClick={onSave ? handleEdit : undefined}
                    onExport={onExport}
                    onImport={onImport}
                    onFilter={onFilter}
                    toolbarSlot={toolbarSlot}
                    className="h-full"
                />
            </div>

            <Sheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={currentRecord.id ? `Edit ${singularTitle || title.slice(0, -1)}` : `New ${singularTitle || title.slice(0, -1)}`}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsSheetOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {formRenderer(currentRecord, handleFieldChange)}
                </div>
            </Sheet>
        </div>
    );
}
