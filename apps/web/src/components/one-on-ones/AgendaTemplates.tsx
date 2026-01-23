"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  GripVertical,
  CheckSquare,
  Briefcase,
  TrendingUp,
  FolderOpen,
} from "lucide-react";

interface AgendaItem {
  id: string;
  text: string;
}

interface AgendaTemplate {
  id: string;
  name: string;
  description: string;
  icon: "checkin" | "career" | "performance" | "project";
  items: AgendaItem[];
}

const mockTemplates: AgendaTemplate[] = [
  {
    id: "1",
    name: "Weekly Check-in",
    description: "Regular weekly sync to discuss progress and blockers",
    icon: "checkin",
    items: [
      { id: "1a", text: "How are you feeling this week?" },
      { id: "1b", text: "What did you accomplish since our last meeting?" },
      { id: "1c", text: "What are you working on this week?" },
      { id: "1d", text: "Any blockers or challenges?" },
      { id: "1e", text: "Is there anything I can help you with?" },
    ],
  },
  {
    id: "2",
    name: "Career Development",
    description: "Discuss career goals, growth opportunities, and skill development",
    icon: "career",
    items: [
      { id: "2a", text: "Review current career goals progress" },
      { id: "2b", text: "Discuss skill development opportunities" },
      { id: "2c", text: "Identify stretch assignments or projects" },
      { id: "2d", text: "Review training and learning resources" },
      { id: "2e", text: "Set next milestones and timeline" },
    ],
  },
  {
    id: "3",
    name: "Performance Review",
    description: "Formal performance discussion with goals and feedback",
    icon: "performance",
    items: [
      { id: "3a", text: "Review accomplishments since last review" },
      { id: "3b", text: "Discuss areas of strength" },
      { id: "3c", text: "Identify areas for improvement" },
      { id: "3d", text: "Set performance goals for next period" },
      { id: "3e", text: "Discuss compensation and role growth" },
      { id: "3f", text: "Gather feedback on management and team" },
    ],
  },
  {
    id: "4",
    name: "Project Update",
    description: "Focused discussion on specific project status and decisions",
    icon: "project",
    items: [
      { id: "4a", text: "Project status overview and timeline" },
      { id: "4b", text: "Key decisions needed" },
      { id: "4c", text: "Resource and dependency updates" },
      { id: "4d", text: "Risk assessment and mitigation" },
      { id: "4e", text: "Next steps and action items" },
    ],
  },
];

const templateIcons = {
  checkin: <CheckSquare className="w-5 h-5" />,
  career: <Briefcase className="w-5 h-5" />,
  performance: <TrendingUp className="w-5 h-5" />,
  project: <FolderOpen className="w-5 h-5" />,
};

export default function AgendaTemplates() {
  const [templates, setTemplates] = useState<AgendaTemplate[]>(mockTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ templateId: string; itemId: string } | null>(null);
  const [editText, setEditText] = useState("");

  const startEditItem = (templateId: string, item: AgendaItem) => {
    setEditingItem({ templateId, itemId: item.id });
    setEditText(item.text);
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id === editingItem.templateId) {
          return {
            ...template,
            items: template.items.map((item) =>
              item.id === editingItem.itemId ? { ...item, text: editText } : item
            ),
          };
        }
        return template;
      })
    );
    setEditingItem(null);
    setEditText("");
  };

  const deleteItem = (templateId: string, itemId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id === templateId) {
          return {
            ...template,
            items: template.items.filter((item) => item.id !== itemId),
          };
        }
        return template;
      })
    );
  };

  const addItem = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id === templateId) {
          const newItem: AgendaItem = {
            id: `${templateId}-${Date.now()}`,
            text: "New agenda item",
          };
          return { ...template, items: [...template.items, newItem] };
        }
        return template;
      })
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Agenda Templates
          </h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isEditing = editingTemplate === template.id;

          return (
            <div
              key={template.id}
              className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-celestial-indigo/10 text-celestial-indigo">
                    {templateIcons[template.icon]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                      {template.name}
                    </h3>
                    <p className="text-xs text-silver-mist">{template.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTemplate(isEditing ? null : template.id)}
                  className="p-1.5 rounded hover:bg-cloud dark:hover:bg-nebula-purple/20 text-silver-mist hover:text-celestial-indigo transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Agenda Items */}
              <div className="space-y-1.5">
                {template.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 group"
                  >
                    {isEditing && (
                      <GripVertical className="w-3 h-3 text-silver-mist flex-shrink-0" />
                    )}
                    <span className="text-xs text-silver-mist font-medium w-5 flex-shrink-0">
                      {index + 1}.
                    </span>

                    {editingItem?.templateId === template.id &&
                    editingItem?.itemId === item.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditItem()}
                          className="flex-1 px-2 py-1 text-xs border border-celestial-indigo rounded bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={saveEditItem}
                          className="p-1 text-aurora-green hover:bg-aurora-green/10 rounded"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1 text-silver-mist hover:bg-cloud rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-xs text-ink-black dark:text-pearl">
                          {item.text}
                        </span>
                        {isEditing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditItem(template.id, item)}
                              className="p-1 text-silver-mist hover:text-celestial-indigo rounded"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteItem(template.id, item.id)}
                              className="p-1 text-silver-mist hover:text-coral-alert rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              {isEditing && (
                <button
                  onClick={() => addItem(template.id)}
                  className="flex items-center gap-1 mt-3 text-xs text-celestial-indigo hover:text-celestial-indigo/80 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add agenda item
                </button>
              )}

              {/* Item Count */}
              <div className="mt-3 pt-2 border-t border-cloud dark:border-nebula-purple/50">
                <span className="text-xs text-silver-mist">
                  {template.items.length} agenda items
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
