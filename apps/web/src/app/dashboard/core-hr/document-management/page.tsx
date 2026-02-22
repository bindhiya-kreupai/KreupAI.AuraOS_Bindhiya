"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Folder,
    FileText,
    Upload,
    FileCheck,
    X,
    Eye,
    Download,
    Trash
} from 'lucide-react';
import { DocumentService } from '../services';

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function DocumentManagementPage() {
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await DocumentService.getAllDocuments();
            setDocuments(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group documents by documentType to create folder-like categories
    const folders = useMemo(() => {
        const typeSet = new Set<string>();
        documents.forEach((doc) => {
            const typeName = typeof doc.documentType === 'string'
                ? doc.documentType
                : doc.documentType?.name || doc.category || 'Uncategorized';
            typeSet.add(typeName);
        });
        return Array.from(typeSet).sort();
    }, [documents]);

    // Auto-select the first folder when documents load
    useEffect(() => {
        if (folders.length > 0 && !selectedFolder) {
            setSelectedFolder(folders[0]);
        }
    }, [folders, selectedFolder]);

    const currentFiles = useMemo(() => {
        if (!selectedFolder) return [];
        return documents.filter((doc) => {
            const typeName = typeof doc.documentType === 'string'
                ? doc.documentType
                : doc.documentType?.name || doc.category || 'Uncategorized';
            return typeName === selectedFolder;
        });
    }, [documents, selectedFolder]);

    const handleFileAction = (action: string, fileName: string) => {
        alert(`${action} on ${fileName}`);
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileCheck className="w-6 h-6 text-indigo-500" />
                        Document Management
                    </h1>
                    <p className="text-slate-500 text-sm">Secure storage for contracts, policies, and employee records.</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Upload className="w-4 h-4" /> Upload Document
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && documents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <FileCheck className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm">Documents will appear here once records are added.</p>
                </div>
            )}

            {!loading && documents.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[calc(100%-100px)]">
                    {/* Folders */}
                    <div className="lg:col-span-1 space-y-3 overflow-y-auto">
                        <h3 className="font-bold text-slate-500 text-xs uppercase mb-2">Folders</h3>
                        {folders.map((folder, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedFolder(folder)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                                ${selectedFolder === folder ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                            `}>
                                <Folder className={`w-5 h-5 ${selectedFolder === folder ? 'fill-indigo-500 text-indigo-500' : 'fill-slate-300 text-slate-300'}`} />
                                <span className="text-sm font-bold">{folder}</span>
                                <span className="ml-auto text-xs text-slate-400">
                                    {documents.filter(d => {
                                        const tn = typeof d.documentType === 'string' ? d.documentType : d.documentType?.name || d.category || 'Uncategorized';
                                        return tn === folder;
                                    }).length}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Files */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                            {selectedFolder || 'Select a folder'}
                        </h3>

                        {currentFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Folder className="w-8 h-8 opacity-50" />
                                </div>
                                <p>No files in this folder.</p>
                                <button onClick={() => setShowUploadModal(true)} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">Upload a file</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {currentFiles.map((file, i) => {
                                    const displayName = file.fileName || file.documentName || 'Unnamed Document';
                                    const displaySize = file.fileSize ? formatFileSize(file.fileSize) : 'N/A';
                                    const displayDate = formatDate(file.uploadedDate);
                                    return (
                                        <div key={file.documentId || i} className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:shadow-lg transition-all group relative flex flex-col bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 p-1 transition-opacity">
                                                <button onClick={() => handleFileAction('Preview', displayName)} className="p-1 hover:text-indigo-600" title="Preview"><Eye className="w-3 h-3" /></button>
                                                <button onClick={() => handleFileAction('Download', displayName)} className="p-1 hover:text-emerald-600" title="Download"><Download className="w-3 h-3" /></button>
                                                <button onClick={() => handleFileAction('Delete', displayName)} className="p-1 hover:text-rose-600" title="Delete"><Trash className="w-3 h-3" /></button>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="font-bold text-sm truncate w-full" title={displayName}>{displayName}</div>
                                            <div className="text-xs text-slate-500 mt-1">{displaySize} &bull; {displayDate}</div>
                                            {file.employeeName && (
                                                <div className="text-xs text-slate-400 mt-1 truncate">{file.employeeName}</div>
                                            )}
                                            {file.status && (
                                                <div className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block w-fit font-bold ${
                                                    file.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                    file.status === 'expired' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {file.status}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Upload Document</h2>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-500 mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Click to Upload</h3>
                            <p className="text-sm text-slate-500 mb-6">or drag and drop files here</p>

                            <div className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4 cursor-pointer hover:border-indigo-400 transition-colors">
                                <span className="text-xs text-slate-400">Supported: PDF, DOCX, JPG (Max 10MB)</span>
                            </div>

                            <button
                                onClick={() => {
                                    alert('Upload functionality requires file storage integration.');
                                    setShowUploadModal(false);
                                }}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Upload to {selectedFolder || 'Documents'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

