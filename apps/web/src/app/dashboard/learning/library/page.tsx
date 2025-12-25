"use client";

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    Book,
    Download,
    PlayCircle,
    Bookmark,
    Calendar,
    ChevronRight,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseService } from '../services';

// --- MOCK DATA ---

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Soft Skills', 'Fiction'];

const BOOKS = [
    {
        id: 1,
        title: 'The Clean Coder',
        author: 'Robert C. Martin',
        category: 'Technology',
        rating: 4.8,
        status: 'Available',
        type: 'Physical',
        cover: 'bg-emerald-600',
        due: null
    },
    {
        id: 2,
        title: 'Zero to One',
        author: 'Peter Thiel',
        category: 'Business',
        rating: 4.6,
        status: 'Checked Out',
        type: 'Physical',
        cover: 'bg-indigo-600',
        due: 'Dec 12'
    },
    {
        id: 3,
        title: 'Design of Everyday Things',
        author: 'Don Norman',
        category: 'Design',
        rating: 4.9,
        status: 'Available',
        type: 'E-Book',
        cover: 'bg-orange-500',
        due: null
    },
    {
        id: 4,
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Soft Skills',
        rating: 4.9,
        status: 'Available',
        type: 'Physical',
        cover: 'bg-amber-500',
        due: null
    },
    {
        id: 5,
        title: 'Refactoring UI',
        author: 'Adam Wathan',
        category: 'Design',
        rating: 5.0,
        status: 'Available',
        type: 'Pdf',
        cover: 'bg-cyan-600',
        due: null
    },
    {
        id: 6,
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        category: 'Technology',
        rating: 4.7,
        status: 'Checked Out',
        type: 'Physical',
        cover: 'bg-slate-700',
        due: 'Dec 15'
    }
];

const MY_LOANS = [
    { id: 101, title: 'Deep Work', author: 'Cal Newport', due: 'Today', cover: 'bg-yellow-500', daysLeft: 0 },
    { id: 102, title: 'Sprint', author: 'Jake Knapp', due: 'In 3 days', cover: 'bg-blue-500', daysLeft: 3 }
];

const DIGITAL_RESOURCES = [
    { id: 1, title: 'Q4 Marketing Trends Handout', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Leadership Workshop Recording', type: 'Video', duration: '45 min' },
    { id: 3, title: 'Employee Handbook 2025', type: 'EPUB', size: '5.1 MB' }
];

export default function LibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result.length > 0 ? result : BOOKS);
            } catch (error) {
                console.error('Error fetching library data:', error);
                setData(BOOKS);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const displayData = data.length > 0 ? data : BOOKS;

    const filteredBooks = displayData.filter(book =>
        (selectedCategory === 'All' || book.category === selectedCategory) &&
        (book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                        Library & Resources
                    </h1>
                    <p className="text-silver-mist text-sm">Expand your knowledge with our curated collection.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <Bookmark className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">2 Active Loans</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Catalog */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col gap-4 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by title, author, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border
                                        ${selectedCategory === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Book Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20">
                        {filteredBooks.map(book => (
                            <div key={book.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group flex flex-col h-full">
                                <div className={`aspect-[3/4] rounded-lg ${book.cover} mb-4 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform`}>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                        <Book className="w-12 h-12 text-white/50 mb-2" />
                                        <h3 className="text-white font-serif font-bold text-lg leading-tight line-clamp-3">{book.title}</h3>
                                        <p className="text-white/80 text-xs mt-1">{book.author}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> {book.rating}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-silver-mist uppercase">{book.type}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                            ${book.status === 'Available' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}
                                        `}>
                                            {book.status}
                                        </span>
                                    </div>

                                    <button className={`w-full py-2 rounded-lg text-sm font-bold transition-colors
                                        ${book.status === 'Available'
                                            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'}
                                    `}>
                                        {book.status === 'Available' ? (book.type === 'Physical' ? 'Reserve' : 'Read Now') : `Due ${book.due}`}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Bookshelf & Resources */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* My Bookshelf */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Book className="w-5 h-5 text-emerald-500" /> My Bookshelf
                        </h3>

                        <div className="space-y-4">
                            {MY_LOANS.map(loan => (
                                <div key={loan.id} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className={`w-12 h-16 rounded ${loan.cover} shadow-sm shrink-0`}></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl truncate">{loan.title}</h4>
                                        <p className="text-xs text-silver-mist mb-2">{loan.author}</p>
                                        <div className={`text-[10px] font-bold inline-flex items-center gap-1
                                            ${loan.daysLeft <= 1 ? 'text-rose-500' : 'text-emerald-500'}
                                        `}>
                                            <Clock className="w-3 h-3" /> {loan.due}
                                        </div>
                                    </div>
                                    <button className="self-center p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            View All Loans
                        </button>
                    </div>

                    {/* Digital Resources */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Download className="w-5 h-5 text-indigo-500" /> Quick Resources
                            </h3>
                        </div>

                        <div className="overflow-y-auto space-y-3 pr-1">
                            {DIGITAL_RESOURCES.map(res => (
                                <div key={res.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 hover:border-indigo-300 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-1.5 rounded-lg
                                            ${res.type === 'PDF' ? 'bg-rose-100 text-rose-600' :
                                                res.type === 'Video' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-emerald-100 text-emerald-600'}
                                        `}>
                                            {res.type === 'PDF' ? <BookOpen className="w-4 h-4" /> : res.type === 'Video' ? <PlayCircle className="w-4 h-4" /> : <Book className="w-4 h-4" />}
                                        </div>
                                        <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-tight mb-1">{res.title}</h4>
                                    <div className="text-[10px] text-silver-mist">{res.size || res.duration}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
