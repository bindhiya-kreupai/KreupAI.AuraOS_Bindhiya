"use client";

import React, { useMemo } from "react";
import {
  Folder,
  FolderOpen,
  User,
  Receipt,
  Briefcase,
  Heart,
  GraduationCap,
  Files,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  sizeBytes: number;
  uploadedDate: string;
  version: number;
  description?: string;
}

interface DocumentCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  documents: Document[];
}

interface CategoryItem {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const categories: CategoryItem[] = [
  {
    name: "All",
    icon: <Files className="h-4 w-4" />,
    color: "text-celestial-indigo",
  },
  {
    name: "Personal",
    icon: <User className="h-4 w-4" />,
    color: "text-blue-500",
  },
  {
    name: "Tax",
    icon: <Receipt className="h-4 w-4" />,
    color: "text-amber-500",
  },
  {
    name: "Employment",
    icon: <Briefcase className="h-4 w-4" />,
    color: "text-purple-500",
  },
  {
    name: "Benefits",
    icon: <Heart className="h-4 w-4" />,
    color: "text-rose-500",
  },
  {
    name: "Training",
    icon: <GraduationCap className="h-4 w-4" />,
    color: "text-emerald-500",
  },
];

export default function DocumentCategories({
  selectedCategory,
  onSelectCategory,
  documents,
}: DocumentCategoriesProps) {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: documents.length };
    documents.forEach((doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const totalSize = useMemo(() => {
    const bytes = documents.reduce((sum, doc) => sum + doc.sizeBytes, 0);
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }, [documents]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stellar-blue">
      {/* Header */}
      <div className="p-4 border-b border-cloud">
        <h2 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
          Categories
        </h2>
        <p className="text-xs text-silver-mist">
          {documents.length} documents &middot; {totalSize}
        </p>
      </div>

      {/* Category List */}
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-0.5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            const count = categoryCounts[category.name] || 0;

            return (
              <li key={category.name}>
                <button
                  onClick={() => onSelectCategory(category.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all ${
                    isSelected
                      ? "bg-celestial-indigo/10 text-celestial-indigo"
                      : "text-ink-black dark:text-pearl hover:bg-cloud/50 dark:hover:bg-cloud/10"
                  }`}
                >
                  <span className={isSelected ? "text-celestial-indigo" : category.color}>
                    {isSelected ? <FolderOpen className="h-4 w-4" /> : category.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {category.name}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-celestial-indigo/20 text-celestial-indigo"
                        : "bg-cloud/70 text-silver-mist"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Storage Usage */}
      <div className="p-4 border-t border-cloud">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-silver-mist">Storage Used</span>
          <span className="text-xs font-medium text-ink-black dark:text-pearl">
            {totalSize} / 5.0 GB
          </span>
        </div>
        <div className="w-full bg-cloud rounded-full h-1.5">
          <div
            className="bg-celestial-indigo h-1.5 rounded-full transition-all"
            style={{
              width: `${Math.min(
                (documents.reduce((sum, doc) => sum + doc.sizeBytes, 0) /
                  (5 * 1024 * 1024 * 1024)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
