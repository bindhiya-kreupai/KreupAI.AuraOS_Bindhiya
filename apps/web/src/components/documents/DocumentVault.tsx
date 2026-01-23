"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Upload,
  Grid,
  List,
  MoreVertical,
  File,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import DocumentUploader from "./DocumentUploader";
import DocumentViewer from "./DocumentViewer";
import DocumentCategories from "./DocumentCategories";
import DocumentSearch from "./DocumentSearch";

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  category: string;
  size: string;
  sizeBytes: number;
  uploadedDate: string;
  version: number;
  description?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Employment Contract.pdf",
    type: "pdf",
    category: "Employment",
    size: "2.4 MB",
    sizeBytes: 2516582,
    uploadedDate: "2025-11-15",
    version: 2,
    description: "Current employment contract with amendments",
  },
  {
    id: "2",
    name: "Tax Form W-2 2024.pdf",
    type: "pdf",
    category: "Tax",
    size: "1.1 MB",
    sizeBytes: 1153434,
    uploadedDate: "2025-01-20",
    version: 1,
    description: "W-2 wage and tax statement for 2024",
  },
  {
    id: "3",
    name: "Health Insurance Card.png",
    type: "image",
    category: "Benefits",
    size: "845 KB",
    sizeBytes: 865280,
    uploadedDate: "2025-03-10",
    version: 1,
    description: "Current health insurance membership card",
  },
  {
    id: "4",
    name: "Performance Review Q3.pdf",
    type: "pdf",
    category: "Personal",
    size: "3.2 MB",
    sizeBytes: 3355443,
    uploadedDate: "2025-10-05",
    version: 1,
    description: "Quarterly performance review document",
  },
  {
    id: "5",
    name: "Training Certificate - AWS.pdf",
    type: "pdf",
    category: "Training",
    size: "512 KB",
    sizeBytes: 524288,
    uploadedDate: "2025-08-22",
    version: 1,
    description: "AWS Solutions Architect certification",
  },
  {
    id: "6",
    name: "Expense Report Dec 2024.xlsx",
    type: "spreadsheet",
    category: "Personal",
    size: "1.8 MB",
    sizeBytes: 1887437,
    uploadedDate: "2025-01-05",
    version: 3,
    description: "Monthly expense report for December",
  },
  {
    id: "7",
    name: "ID Proof - Passport.png",
    type: "image",
    category: "Personal",
    size: "2.1 MB",
    sizeBytes: 2202009,
    uploadedDate: "2024-06-18",
    version: 1,
    description: "Passport scan for identity verification",
  },
  {
    id: "8",
    name: "Benefits Enrollment Form.pdf",
    type: "pdf",
    category: "Benefits",
    size: "967 KB",
    sizeBytes: 990208,
    uploadedDate: "2025-04-01",
    version: 2,
    description: "Annual benefits enrollment selections",
  },
];

const fileTypeIcons: Record<Document["type"], React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  image: <FileImage className="h-5 w-5 text-green-500" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5 text-emerald-600" />,
  document: <File className="h-5 w-5 text-celestial-indigo" />,
};

export default function DocumentVault() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    types: string[];
    dateRange: string | null;
    category: string | null;
  }>({ types: [], dateRange: null, category: null });

  const filteredDocuments = useMemo(() => {
    let docs = [...mockDocuments];

    if (selectedCategory !== "All") {
      docs = docs.filter((doc) => doc.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query)
      );
    }

    if (activeFilters.types.length > 0) {
      docs = docs.filter((doc) => activeFilters.types.includes(doc.type));
    }

    if (activeFilters.category) {
      docs = docs.filter((doc) => doc.category === activeFilters.category);
    }

    return docs;
  }, [selectedCategory, searchQuery, activeFilters]);

  const handleUploadComplete = () => {
    setShowUploader(false);
  };

  const handleDeleteDocument = (docId: string) => {
    if (selectedDocument?.id === docId) {
      setSelectedDocument(null);
    }
  };

  return (
    <div className="flex h-full min-h-[600px] bg-white dark:bg-stellar-blue rounded-lg border border-cloud overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-cloud flex-shrink-0">
        <DocumentCategories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          documents={mockDocuments}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-cloud">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-ink-black dark:text-pearl">
              Document Vault
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-celestial-indigo/10 text-celestial-indigo"
                    : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-celestial-indigo/10 text-celestial-indigo"
                    : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-md hover:bg-celestial-indigo/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload</span>
              </button>
            </div>
          </div>

          <DocumentSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </div>

        {/* Upload Zone */}
        {showUploader && (
          <div className="p-4 border-b border-cloud">
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Document Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-silver-mist">
              <FileText className="h-12 w-12 mb-3" />
              <p className="text-sm">No documents found</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                    selectedDocument?.id === doc.id
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud hover:border-celestial-indigo/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    {fileTypeIcons[doc.type]}
                    <span className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                      <MoreVertical className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-ink-black dark:text-pearl truncate mb-1">
                    {doc.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-silver-mist">
                    <span>{doc.size}</span>
                    <span>&middot;</span>
                    <span>{doc.uploadedDate}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-celestial-indigo/10 text-celestial-indigo">
                      {doc.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                    selectedDocument?.id === doc.id
                      ? "border-celestial-indigo bg-celestial-indigo/5"
                      : "border-cloud hover:border-celestial-indigo/50"
                  }`}
                >
                  {fileTypeIcons[doc.type]}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-silver-mist truncate">
                      {doc.description}
                    </p>
                  </div>
                  <span className="text-xs text-silver-mist flex-shrink-0">
                    {doc.size}
                  </span>
                  <span className="text-xs text-silver-mist flex-shrink-0">
                    {doc.uploadedDate}
                  </span>
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-celestial-indigo/10 text-celestial-indigo flex-shrink-0">
                    {doc.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Pane */}
      {selectedDocument && (
        <div className="w-80 border-l border-cloud flex-shrink-0">
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onDelete={handleDeleteDocument}
          />
        </div>
      )}
    </div>
  );
}
