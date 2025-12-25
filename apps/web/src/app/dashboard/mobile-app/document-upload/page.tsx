"use client";

import React, { useState, useEffect } from 'react';
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    MoreHorizontal,
    Search,
    Filter,
    Eye,
    DownloadCloud,
    CheckCircle2
} from 'lucide-react';
import { DocumentUploadService } from '../services';

export default function DocumentUploadPage() {
    const [config, setConfig] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, documentsData] = await Promise.all([
                DocumentUploadService.getConfig(),
                DocumentUploadService.getAllDocuments()
            ]);
            if (configData) setConfig(configData);
            if (documentsData.length > 0) setDocuments(documentsData);
        } catch (error) {
            console.error('Error fetching document upload data:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UploadCloud className="w-6 h-6 text-indigo-500" />
                        Document Upload
                    </h1>
                    <p className="text-slate-500 text-sm">Review documents scanned and uploaded via the mobile app.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search docs..."
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                    { name: 'Receipt_Lunch.jpg', user: 'John Doe', date: '2h ago', size: '1.2 MB', type: 'image' },
                    { name: 'ID_Front.png', user: 'Sarah Smith', date: '5h ago', size: '3.4 MB', type: 'image' },
                    { name: 'Contract_Signed.pdf', user: 'Mike Ross', date: '1d ago', size: '0.8 MB', type: 'doc' },
                    { name: 'Site_Photo_01.jpg', user: 'Emma Stone', date: '1d ago', size: '4.5 MB', type: 'image' },
                    { name: 'Safety_Check.pdf', user: 'Bob Brown', date: '2d ago', size: '0.5 MB', type: 'doc' },
                    { name: 'Expense_Uber.png', user: 'John Doe', date: '2d ago', size: '1.1 MB', type: 'image' },
                    { name: 'Vaccine_Cert.pdf', user: 'Alice Wu', date: '3d ago', size: '2.2 MB', type: 'doc' },
                    { name: 'Passport_Copy.jpg', user: 'Tom Hardy', date: '4d ago', size: '2.8 MB', type: 'image' },
                    { name: 'Visa_Doc.pdf', user: 'Tom Hardy', date: '4d ago', size: '0.9 MB', type: 'doc' },
                    { name: 'Fuel_Bill.jpg', user: 'Jane Doe', date: '5d ago', size: '1.4 MB', type: 'image' },
                ].map((doc, i) => (
                    <div key={i} className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
                            {/* Preview Placeholder */}
                            {doc.type === 'image' ? (
                                <ImageIcon className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <FileText className="w-12 h-12 text-indigo-300 group-hover:scale-110 transition-transform duration-500" />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors">
                                    <DownloadCloud className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-3">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-sm truncate pr-2 text-slate-900 dark:text-slate-100" title={doc.name}>{doc.name}</div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-between items-end text-xs text-slate-500">
                                <div>
                                    <div>{doc.user}</div>
                                    <div>{doc.date}</div>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">{doc.size}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Upload New Card */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-400 transition-all cursor-pointer">
                    <UploadCloud className="w-10 h-10 mb-2" />
                    <span className="text-sm font-bold">Manual Upload</span>
                </div>
            </div>

            {/* Storage Summary */}
            <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">OCR Auto-Processing Active</h3>
                        <p className="text-indigo-200 text-sm">Receipts and ID cards are automatically scanned for data extraction.</p>
                    </div>
                </div>
                <div className="flex items-center gap-8 w-full md:w-auto">
                    <div>
                        <div className="text-xs text-indigo-300 font-medium mb-1">Storage Used</div>
                        <div className="text-2xl font-bold">45.2 <span className="text-sm font-normal text-indigo-300">GB</span></div>
                    </div>
                    <div className="h-10 w-px bg-white/20"></div>
                    <div>
                        <div className="text-xs text-indigo-300 font-medium mb-1">Files</div>
                        <div className="text-2xl font-bold">12.5k</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
