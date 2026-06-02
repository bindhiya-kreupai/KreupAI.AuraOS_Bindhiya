// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module CustomFieldsManager
 * @description Admin panel for managing custom fields — entity tabs, drag-to-reorder,
 *              create/edit form, type-specific config, and validation rules.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  AlertTriangle,
  X,
  Loader2,
  Save,
  Eye,
  Type,
  Hash,
  Calendar,
  List,
  CheckSquare,
  Upload,
  Mail,
  Phone,
  Link,
  AlignLeft,
} from 'lucide-react';
import {
  CustomFieldsService,
  type CustomField,
  type FieldType,
  type EntityType,
  type CreateCustomFieldInput,
  type UpdateCustomFieldInput,
  type FieldOption,
} from '@/services/customFieldsService';

// ── Field Type Config ─────────────────────────────────────────────────────────

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ElementType }[] = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Select (single)', icon: List },
  { value: 'multi-select', label: 'Multi-Select', icon: CheckSquare },
  { value: 'checkbox', label: 'Checkbox (boolean)', icon: CheckSquare },
  { value: 'file', label: 'File Upload', icon: Upload },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'rich-text', label: 'Rich Text', icon: AlignLeft },
];

const ENTITY_TABS: { value: EntityType; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'department', label: 'Department' },
  { value: 'position', label: 'Position' },
  { value: 'leave', label: 'Leave' },
  { value: 'expense', label: 'Expense' },
  { value: 'candidate', label: 'Candidate' },
];

// ── Field Type Icon ───────────────────────────────────────────────────────────

function FieldTypeIcon({ type }: { type: FieldType }) {
  const config = FIELD_TYPES.find((t) => t.value === type);
  const Icon = config?.icon ?? Type;
  return <Icon className="h-4 w-4" />;
}

// ── Field Row ─────────────────────────────────────────────────────────────────

function FieldRow({
  field,
  _index,
  dragging,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}: {
  field: CustomField;
  index: number;
  dragging: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (targetId: string) => void;
  onEdit: (field: CustomField) => void;
  onDelete: (field: CustomField) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(field.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, field.id);
      }}
      onDrop={() => onDrop(field.id)}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move ${
        dragging
          ? 'border-blue-400 bg-blue-50 opacity-60'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />

      <div className="flex items-center gap-2 w-8 h-8 bg-slate-100 rounded-lg justify-center shrink-0 text-slate-500">
        <FieldTypeIcon type={field.type} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900">{field.label}</span>
          {field.validation.required && <span className="text-xs text-red-500">Required</span>}
          {field.isSystemField && (
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              System
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 font-mono">{field.apiKey}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">
            {FIELD_TYPES.find((t) => t.value === field.type)?.label}
          </span>
          {field.usageCount > 0 && (
            <>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{field.usageCount} records</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(field)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit field"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {!field.isSystemField && (
          <button
            onClick={() => onDelete(field)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete field"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Create/Edit Form ──────────────────────────────────────────────────────────

function FieldForm({
  entityType,
  existingField,
  onSuccess,
  onCancel,
}: {
  entityType: EntityType;
  existingField?: CustomField;
  onSuccess: (field: CustomField) => void;
  onCancel: () => void;
}) {
  const isEdit = !!existingField;
  const [form, setForm] = useState<CreateCustomFieldInput>({
    entityType,
    name: existingField?.name ?? '',
    label: existingField?.label ?? '',
    type: existingField?.type ?? 'text',
    description: existingField?.description ?? '',
    placeholder: existingField?.placeholder ?? '',
    defaultValue: existingField?.defaultValue,
    options: existingField?.options ?? [],
    validation: existingField?.validation ?? { required: false },
  });
  const [optionInput, setOptionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('Label is required.');
      return;
    }
    if (!form.name.trim()) {
      setError('API Key (name) is required.');
      return;
    }
    if (
      (form.type === 'select' || form.type === 'multi-select') &&
      (!form.options || form.options.length === 0)
    ) {
      setError('At least one option is required for select fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      let result: CustomField;
      if (isEdit && existingField) {
        result = await CustomFieldsService.updateCustomField(
          existingField.id,
          form as UpdateCustomFieldInput
        );
      } else {
        result = await CustomFieldsService.createCustomField(form);
      }
      onSuccess(result);
    } catch {
      setError('Failed to save field. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    const value = optionInput.trim().toLowerCase().replace(/\s+/g, '-');
    const option: FieldOption = { value, label: optionInput.trim() };
    setForm((prev) => ({ ...prev, options: [...(prev.options ?? []), option] }));
    setOptionInput('');
  };

  const removeOption = (value: string) => {
    setForm((prev) => ({
      ...prev,
      options: (prev.options ?? []).filter((o) => o.value !== value),
    }));
  };

  const needsOptions = form.type === 'select' || form.type === 'multi-select';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">
          {isEdit ? 'Edit Field' : 'New Custom Field'}
        </h3>
        <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Display Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => {
                const label = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  label,
                  name: isEdit
                    ? prev.name
                    : label
                        .toLowerCase()
                        .replace(/\s+/g, '_')
                        .replace(/[^a-z0-9_]/g, ''),
                }));
              }}
              placeholder="e.g., T-Shirt Size"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                }))
              }
              placeholder="e.g., shirt_size"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              disabled={isEdit}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Field Type</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value as FieldType, options: [] }))
              }
              disabled={isEdit}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-50"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Placeholder</label>
            <input
              type="text"
              value={form.placeholder ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))}
              placeholder="e.g., Select a size..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Helper text shown to users"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Validation */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Validation Rules
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.validation?.required ?? false}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  validation: { ...prev.validation, required: e.target.checked },
                }))
              }
              className="rounded"
            />
            Required field
          </label>
          {form.type === 'text' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Min Length</label>
                <input
                  type="number"
                  value={form.validation?.minLength ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        minLength: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="w-full text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Max Length</label>
                <input
                  type="number"
                  value={form.validation?.maxLength ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="w-full text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {form.type === 'number' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Min Value</label>
                <input
                  type="number"
                  value={form.validation?.min ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        min: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="w-full text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Max Value</label>
                <input
                  type="number"
                  value={form.validation?.max ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        max: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  className="w-full text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {(form.type === 'text' ||
            form.type === 'email' ||
            form.type === 'phone' ||
            form.type === 'url') && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">Regex Pattern</label>
              <input
                type="text"
                value={form.validation?.pattern ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    validation: { ...prev.validation, pattern: e.target.value || undefined },
                  }))
                }
                placeholder="e.g., ^\+?[1-9]\d{1,14}$"
                className="w-full text-sm px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Options for Select Fields */}
        {needsOptions && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Options</label>
            <div className="space-y-1 mb-2">
              {(form.options ?? []).map((opt) => (
                <div key={opt.value} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="flex-1 text-sm text-slate-700">{opt.label}</span>
                  <span className="text-xs text-slate-400 font-mono">{opt.value}</span>
                  <button
                    type="button"
                    onClick={() => removeOption(opt.value)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOption();
                  }
                }}
                placeholder="Add option..."
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addOption}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? 'Saving...' : isEdit ? 'Update Field' : 'Create Field'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CustomFieldsManager() {
  const [activeEntity, setActiveEntity] = useState<EntityType>('employee');
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomField | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [_dragOverId, setDragOverId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CustomFieldsService.getCustomFields(activeEntity);
      setFields(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeEntity]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...fields];
    const fromIdx = reordered.findIndex((f) => f.id === draggingId);
    const toIdx = reordered.findIndex((f) => f.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    setFields(reordered);
    setDraggingId(null);
    setDragOverId(null);

    try {
      await CustomFieldsService.reorderFields(
        activeEntity,
        reordered.map((f) => f.id)
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (field: CustomField) => {
    try {
      await CustomFieldsService.deleteCustomField(field.id);
      setFields((prev) => prev.filter((f) => f.id !== field.id));
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleFormSuccess = (field: CustomField) => {
    if (editingField) {
      setFields((prev) => prev.map((f) => (f.id === field.id ? field : f)));
    } else {
      setFields((prev) => [...prev, field]);
    }
    setShowForm(false);
    setEditingField(undefined);
  };

  const _entityFieldCount = ENTITY_TABS.map((tab) => ({
    ...tab,
    // We show a rough count since we only loaded for activeEntity
    count: tab.value === activeEntity ? fields.length : undefined,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Custom Fields Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define and manage custom data fields for each entity type
          </p>
        </div>
        <button
          onClick={() => {
            setEditingField(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Field
        </button>
      </div>

      {/* Entity Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {ENTITY_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveEntity(tab.value);
              setShowForm(false);
              setEditingField(undefined);
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
              activeEntity === tab.value
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.value === activeEntity && fields.length > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {fields.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      {(showForm || editingField) && (
        <FieldForm
          entityType={activeEntity}
          existingField={editingField}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingField(undefined);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                Delete &quot;{deleteConfirm.label}&quot;?
              </p>
              {deleteConfirm.usageCount > 0 && (
                <p className="text-sm text-red-600">
                  Warning: {deleteConfirm.usageCount} records have values for this field. Data will
                  be lost.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Drag rows to reorder. Fields appear in this order in forms.
          </p>
          <Eye className="h-4 w-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500">
              No custom fields defined for {activeEntity} entities.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Create the first field
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <FieldRow
                key={field.id}
                field={field}
                index={idx}
                dragging={draggingId === field.id}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={(f) => {
                  setEditingField(f);
                  setShowForm(false);
                }}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomFieldsManager;
