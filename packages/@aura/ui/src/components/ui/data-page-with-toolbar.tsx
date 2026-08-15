'use client';

import React, { useState } from 'react';
import { DataPage, type DataPageProps } from './data-page';
import { ExportMenu, type ExportFormat } from './export-menu';
import { ImportDialog, type ImportPreview } from './import-dialog';
import { FilterPanel, type FilterFieldDef, type SavedViewSummary } from './filter-panel';

/**
 * Pre-wired adoption layer for the six shared UI primitives.
 *
 * Closes the audit's "no consumer adoption" gap on the table-features
 * (`T`) dimension. The 6 primitives — ExportMenu, ImportDialog,
 * FilterPanel + SavedView, AttachmentUploader, EmailRecipientPicker,
 * StatusBadge — already ship in `@aura/ui` and have 40 passing tests,
 * but zero dashboard pages import them today.
 *
 * `DataPageWithToolbar` wraps `DataPage` and composes the three
 * list-page primitives (Export, Import, Filter+SavedView) into the
 * underlying `toolbarSlot`. Consumers pass typed configs:
 *
 *   <DataPageWithToolbar
 *     title="Employees"
 *     columns={...}
 *     data={employees}
 *     exportConfig={{ onExport: handleExport, rowCount: 1234 }}
 *     importConfig={{
 *       title: 'Import employees',
 *       onDryRun,
 *       onCommit,
 *     }}
 *     filterConfig={{
 *       fields,
 *       value: filters,
 *       onChange: setFilters,
 *       savedViews,
 *       activeViewId,
 *       onPickSavedView,
 *       onSaveView,
 *     }}
 *   />
 *
 * Pages that pass only the configs they need (no `importConfig` →
 * import button stays hidden, etc.) get a clean toolbar without
 * boilerplate. Pages that need the raw `toolbarSlot` for custom
 * controls can still pass it; the wrapper merges both.
 */

export interface DataPageExportConfig {
    onExport: (format: ExportFormat) => Promise<Blob | void> | Blob | void;
    filename?: string;
    formats?: ExportFormat[];
    rowCount?: number;
    disabled?: boolean;
}

export interface DataPageImportConfig {
    /** Sheet title (e.g. "Import employees"). */
    title: string;
    description?: string;
    accept?: string;
    onDryRun: (file: File) => Promise<ImportPreview>;
    onCommit: (file: File) => Promise<void>;
    maxSampleRows?: number;
    /** Trigger button label, defaults to "Import". */
    triggerLabel?: string;
}

export interface DataPageFilterConfig {
    fields: FilterFieldDef[];
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    savedViews?: SavedViewSummary[];
    activeViewId?: string | null;
    onPickSavedView?: (id: string | null) => void;
    onSaveView?: (name: string, filters: Record<string, unknown>) => Promise<void> | void;
    onDeleteSavedView?: (id: string) => Promise<void> | void;
}

export interface DataPageWithToolbarProps<T extends { id: string | number }>
    extends Omit<DataPageProps<T>, 'onExport' | 'onImport' | 'onFilter'> {
    exportConfig?: DataPageExportConfig;
    importConfig?: DataPageImportConfig;
    filterConfig?: DataPageFilterConfig;
}

export function DataPageWithToolbar<T extends { id: string | number }>(
    props: DataPageWithToolbarProps<T>
) {
    const { exportConfig, importConfig, filterConfig, toolbarSlot, ...rest } = props;
    const [isImportOpen, setIsImportOpen] = useState(false);

    const composed = (
        <>
            {filterConfig && (
                <FilterPanel
                    fields={filterConfig.fields}
                    value={filterConfig.value}
                    onChange={filterConfig.onChange}
                    savedViews={filterConfig.savedViews}
                    activeViewId={filterConfig.activeViewId}
                    onPickSavedView={filterConfig.onPickSavedView}
                    onSaveView={filterConfig.onSaveView}
                    onDeleteSavedView={filterConfig.onDeleteSavedView}
                    compact
                />
            )}
            {exportConfig && (
                <ExportMenu
                    onExport={exportConfig.onExport}
                    filename={exportConfig.filename}
                    formats={exportConfig.formats}
                    rowCount={exportConfig.rowCount}
                    disabled={exportConfig.disabled}
                />
            )}
            {importConfig && (
                <>
                    <button
                        type="button"
                        onClick={() => setIsImportOpen(true)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        {importConfig.triggerLabel ?? 'Import'}
                    </button>
                    <ImportDialog
                        isOpen={isImportOpen}
                        onClose={() => setIsImportOpen(false)}
                        title={importConfig.title}
                        description={importConfig.description}
                        accept={importConfig.accept}
                        onDryRun={importConfig.onDryRun}
                        onCommit={importConfig.onCommit}
                        maxSampleRows={importConfig.maxSampleRows}
                    />
                </>
            )}
            {toolbarSlot}
        </>
    );

    return <DataPage<T> {...rest} toolbarSlot={composed} />;
}
