/**
 * @module AgendaTemplates
 * @description Reusable agenda templates for one-on-one meetings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  FileText,
  Plus,
  X,
  Check,
  Copy,
  Edit3,
  Trash2,
  LayoutTemplate,
  GripVertical,
} from 'lucide-react';
import type { AgendaTemplate, MeetingType } from '@/services/oneOnOneService';
import { MEETING_TYPE_LABELS, MEETING_TYPE_COLORS } from '@/services/oneOnOneService';

interface AgendaTemplatesProps {
  templates: AgendaTemplate[];
  onApply: (template: AgendaTemplate) => void;
}

export const AgendaTemplates: React.FC<AgendaTemplatesProps> = ({
  templates: initialTemplates,
  onApply,
}) => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'weekly_sync' as MeetingType,
    items: [''],
  });

  const startEdit = useCallback((tpl: AgendaTemplate) => {
    setEditingId(tpl.id);
    setNewTemplate({ name: tpl.name, type: tpl.type, items: [...tpl.items] });
    setShowCreate(false);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setShowCreate(false);
    setNewTemplate({ name: '', type: 'weekly_sync', items: [''] });
  }, []);

  const addItemToForm = useCallback(() => {
    setNewTemplate((prev) => ({ ...prev, items: [...prev.items, ''] }));
  }, []);

  const updateItemInForm = useCallback((idx: number, value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? value : item)),
    }));
  }, []);

  const removeItemFromForm = useCallback((idx: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }, []);

  const saveTemplate = useCallback(() => {
    const validItems = newTemplate.items.filter((i) => i.trim());
    if (!newTemplate.name.trim() || validItems.length === 0) return;

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name: newTemplate.name.trim(), type: newTemplate.type, items: validItems }
            : t
        )
      );
    } else {
      const tpl: AgendaTemplate = {
        id: `tpl-${Date.now()}`,
        name: newTemplate.name.trim(),
        type: newTemplate.type,
        items: validItems,
        isDefault: false,
      };
      setTemplates((prev) => [...prev, tpl]);
    }

    cancelEdit();
  }, [newTemplate, editingId, cancelEdit]);

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) cancelEdit();
    },
    [editingId, cancelEdit]
  );

  const duplicateTemplate = useCallback((tpl: AgendaTemplate) => {
    const dup: AgendaTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isDefault: false,
    };
    setTemplates((prev) => [...prev, dup]);
  }, []);

  const isEditing = editingId !== null || showCreate;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-sunset-amber" />
          Agenda Templates ({templates.length})
        </h3>
        {!isEditing && (
          <button
            onClick={() => {
              setShowCreate(true);
              setNewTemplate({ name: '', type: 'weekly_sync', items: [''] });
            }}
            className="flex items-center gap-1 text-[11px] text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> New Template
          </button>
        )}
      </div>

      {/* Templates grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((tpl) => {
          const isCurrentlyEditing = editingId === tpl.id;

          if (isCurrentlyEditing) return null; // Rendered in the edit form below

          return (
            <div
              key={tpl.id}
              className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue overflow-hidden group"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-cloud/50 dark:border-nebula-purple/10 bg-pearl/20 dark:bg-deep-cosmos/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-silver-mist" />
                  <span className="text-xs font-semibold text-ink-black dark:text-pearl">
                    {tpl.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${MEETING_TYPE_COLORS[tpl.type]}`}
                >
                  {MEETING_TYPE_LABELS[tpl.type]}
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                {tpl.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <GripVertical className="w-2.5 h-2.5 text-silver-mist/30 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-ink-black dark:text-pearl">{item}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1 px-3 py-2 border-t border-cloud/50 dark:border-nebula-purple/10">
                <button
                  onClick={() => onApply(tpl)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
                >
                  <Check className="w-3 h-3" /> Use Template
                </button>
                <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => duplicateTemplate(tpl)}
                    className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3 text-silver-mist" />
                  </button>
                  <button
                    onClick={() => startEdit(tpl)}
                    className="p-1 rounded hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3 h-3 text-silver-mist" />
                  </button>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => deleteTemplate(tpl.id)}
                      className="p-1 rounded hover:bg-coral-alert/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-coral-alert/60" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit form */}
      {isEditing && (
        <div className="rounded-xl border border-celestial-indigo/30 bg-celestial-indigo/5 dark:bg-celestial-indigo/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink-black dark:text-pearl">
              {editingId ? 'Edit Template' : 'New Template'}
            </h4>
            <button
              onClick={cancelEdit}
              className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
            >
              <X className="w-3.5 h-3.5 text-silver-mist" />
            </button>
          </div>

          {/* Name */}
          <input
            type="text"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Template name..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />

          {/* Type */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setNewTemplate((prev) => ({ ...prev, type }))}
                className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                  newTemplate.type === type
                    ? `border-current ${MEETING_TYPE_COLORS[type]} font-semibold`
                    : 'border-cloud dark:border-nebula-purple/30 text-silver-mist'
                }`}
              >
                {MEETING_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          {/* Agenda items */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-silver-mist">Agenda Items</label>
            {newTemplate.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-silver-mist/60 w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItemInForm(idx, e.target.value)}
                  placeholder="Agenda topic..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
                />
                {newTemplate.items.length > 1 && (
                  <button
                    onClick={() => removeItemFromForm(idx)}
                    className="p-0.5 rounded hover:bg-pearl dark:hover:bg-deep-cosmos"
                  >
                    <X className="w-3 h-3 text-silver-mist" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addItemToForm}
              className="flex items-center gap-1 text-[10px] text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={cancelEdit}
              className="flex-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-cloud dark:border-nebula-purple/30 text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              disabled={!newTemplate.name.trim() || !newTemplate.items.some((i) => i.trim())}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Check className="w-3 h-3" /> {editingId ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaTemplates;
