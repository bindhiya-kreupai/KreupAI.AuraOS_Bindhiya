import React, { useState } from 'react';
import { PageHeader } from '../layout/page-header';
import { DataTable, type Column } from './data-table';
import { Sheet } from './sheet';
import { Trash2, Save } from 'lucide-react';

interface DataPageProps<T> {
    title: string;
    breadcrumbs?: { label: string; href?: string }[];
    data: T[];
    columns: Column<T>[];
    onSave?: (data: Partial<T>) => void;
    onDelete?: (row: T) => void;
    onExport?: () => void;
    onImport?: () => void;
    onFilter?: () => void;
    renderForm: (data: Partial<T>, onChange: (field: keyof T, value: any) => void) => React.ReactNode;
    defaultValues?: Partial<T>;
}

export function DataPage<T extends { id: string | number }>({
    title,
    breadcrumbs,
    data,
    columns,
    onSave,
    onDelete,
    onExport,
    onImport,
    onFilter,
    renderForm,
    defaultValues = {} as Partial<T>
}: DataPageProps<T>) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<T>>(defaultValues);
    const [searchQuery, setSearchQuery] = useState('');

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
    };

    const handleFieldChange = (field: keyof T, value: any) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    // Filter data
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Add actions column if not present
    const displayColumns = [
        ...columns,
        {
            key: 'actions',
            header: '',
            width: '80px',
            render: (row: T) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(row); }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 h-full flex flex-col relative overflow-hidden">
            <PageHeader
                title={title}
                breadcrumbs={breadcrumbs}
                action={{
                    label: `Add ${title.slice(0, -1)}`, // Simple plural to singular
                    onClick: handleAdd
                }}
            />

            <div className="flex-1 min-h-0">
                <DataTable
                    data={filteredData}
                    columns={displayColumns}
                    onSearch={setSearchQuery}
                    onRowClick={handleEdit}
                    onExport={onExport}
                    onImport={onImport}
                    onFilter={onFilter}
                    className="h-full"
                />
            </div>

            <Sheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={currentRecord.id ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
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
                    {renderForm(currentRecord, handleFieldChange)}
                </div>
            </Sheet>
        </div>
    );
}
