import { cn } from '@aura/ui/src/lib/utils';
import { DocumentService } from '@/app/dashboard/core-hr/services';
import { EmployeeDocument } from '@/app/dashboard/core-hr/types';
import { format } from 'date-fns';

const EXPIRING_DOCS = [
    { id: 'DOC-101', employee: 'Ahmed Mansoor', docType: 'Emirates ID', expiry: 'In 12 days', status: 'Critical', color: 'text-rose-600 bg-rose-50' },
    { id: 'DOC-102', employee: 'Sarah Chen', docType: 'Passport', expiry: 'In 28 days', status: 'Warning', color: 'text-amber-600 bg-amber-50' },
    { id: 'DOC-103', employee: 'Raj Patel', docType: 'Visa (KSA)', expiry: 'In 45 days', status: 'Monitor', color: 'text-blue-600 bg-blue-50' },
];

export default function DocumentIntelligencePage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<Partial<EmployeeDocument> | null>(null);
    const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        async function loadDocs() {
            const data = await DocumentService.getAllDocuments();
            setDocuments(data);
            setIsLoading(false);
        }
        loadDocs();
    }, []);

    const handleScan = async () => {
        setIsScanning(true);
        setScanResults(null);
        // Simulate scanning a dummy file
        const result = await DocumentService.scanDocumentAI(new File([], "scan.jpg"));
        setScanResults(result);
        setIsScanning(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
                        <ShieldCheck className="w-4 h-4" /> AI-Powered Admin
                    </div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Document Intelligence Center</h1>
                    <p className="text-silver-mist text-sm leading-relaxed">AI-orchestrated document lifecycles with OCR parsing and automated compliance monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-cloud dark:border-nebula-purple/30 rounded-xl bg-white dark:bg-stellar-blue text-sm font-semibold hover:shadow-md transition-all">
                        <Languages className="w-4 h-4" /> Multi-Language Templates
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
                        <Upload className="w-4 h-4" /> Batch Upload
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* OCR Scanner Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-stellar-blue border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-3xl p-12 text-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {isScanning ? (
                            <div className="space-y-6 py-8">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/20 rounded-full animate-ping" />
                                    <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin" />
                                    <Scan className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">AI Scan in Progress...</h3>
                                    <p className="text-sm text-silver-mist">Parsing document structure and extracting jurisdictional metadata.</p>
                                </div>
                            </div>
                        ) : scanResults ? (
                            <div className="space-y-6 py-4 animate-in zoom-in-95 duration-300 text-left">
                                <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    <div>
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Scan Successful!</h4>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-500">Extracted data with {Math.round((scanResults.ocrData?.parsingConfidence || 0) * 100)}% confidence</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/20">
                                        <p className="text-[10px] font-bold text-silver-mist uppercase">Document Number</p>
                                        <p className="text-sm font-bold">{scanResults.ocrData?.documentNumber}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/20">
                                        <p className="text-[10px] font-bold text-silver-mist uppercase">Expiry Date</p>
                                        <p className="text-sm font-bold">{scanResults.ocrData?.expiryDate ? format(scanResults.ocrData.expiryDate, 'MMM dd, yyyy') : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setScanResults(null)} className="flex-1 py-2 text-sm font-bold border border-cloud dark:border-nebula-purple/30 rounded-xl">Discard</button>
                                    <button onClick={() => setScanResults(null)} className="flex-1 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl shadow-lg">Save to Profile</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                    <Scan className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-ink-black dark:text-pearl mb-2">Drop Identification Document</h3>
                                <p className="text-silver-mist text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                                    Upload Passports, IDs, or Visas. Our AI will automatically parse the data, verify compliance, and set expiry alerts.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={handleScan}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                                    >
                                        Select File to Scan
                                    </button>
                                    <div className="text-xs font-bold text-silver-mist">OR</div>
                                    <button className="px-6 py-3 border border-cloud dark:border-nebula-purple/30 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                        Use Camera
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Intelligent Document Vault</h2>
                            <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-slate-50 rounded-lg text-silver-mist"><FileSearch className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="p-2 space-y-1">
                            {isLoading ? (
                                Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                            <div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40 mb-2" />
                                                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-24" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                documents.length > 0 ? documents.map(file => (
                                    <div key={file.documentId} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-indigo-900/10 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{file.documentName}</h4>
                                                <p className="text-[10px] text-silver-mist font-medium">{file.category || 'General'} • {Math.round(file.fileSize / 1024)} KB • Uploaded {format(new Date(file.uploadedDate), 'MMM dd')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-silver-mist shadow-sm"><Eye className="w-4 h-4" /></button>
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-silver-mist shadow-sm"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-xs text-silver-mist">No recent documents found.</div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Expiry & Compliance Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-silver-mist uppercase tracking-widest">Expiry Sentinel</h2>
                            <Clock className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="space-y-4">
                            {EXPIRING_DOCS.map(doc => (
                                <div key={doc.id} className="p-4 rounded-2xl border border-cloud dark:border-nebula-purple/20 space-y-3 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-ink-black dark:text-pearl">{doc.employee}</h4>
                                        <span className={cn("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full", doc.color)}>{doc.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-silver-mist font-medium">
                                        <FileText className="w-3.5 h-3.5" /> {doc.docType}
                                    </div>
                                    <div className="pt-1 flex items-center justify-between">
                                        <div className="text-xs font-bold text-rose-600">{doc.expiry}</div>
                                        <button className="text-[10px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                                            Send Notice <ChevronRight className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all shadow-xl" />
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-300" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Compliance Risk</h3>
                            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                8 documents across your Mumbai entity are missing mandatory digital signatures under the <strong>New Indian Labour Code 2025</strong>.
                            </p>
                            <button className="w-full py-2.5 bg-white text-indigo-900 rounded-xl font-bold text-xs shadow-lg hover:shadow-white/20 transition-all">
                                Audit Missing Docs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
