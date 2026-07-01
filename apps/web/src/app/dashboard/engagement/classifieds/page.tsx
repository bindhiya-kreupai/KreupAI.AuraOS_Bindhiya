'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  MessageCircle,
  Heart,
  DollarSign,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassifiedService } from '../services';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Fashion', 'Books', 'Other'];

export default function ClassifiedsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    price: '',
    condition: 'New',
    category: 'Electronics',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await ClassifiedService.getClassifieds();
      setItems(result);
    } catch {
      setToast({ type: 'error', msg: 'Failed to load listings.' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleLike = (id: string) => {
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter((i) => i !== id));
    } else {
      setLikedItems([...likedItems, id]);
    }
  };

  const handlePostAd = async () => {
    if (!form.title.trim()) {
      showToast('error', 'Please enter a title.');
      return;
    }
    try {
      setSubmitting(true);
      await ClassifiedService.createClassified({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        condition: form.condition,
        price: form.price ? parseFloat(form.price) : undefined,
      });
      showToast('success', 'Listing published!');
      setForm({ title: '', price: '', condition: 'New', category: 'Electronics', description: '' });
      setShowPostModal(false);
      await fetchData();
    } catch {
      showToast('error', 'Failed to publish listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item: any) =>
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      ((item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
      {toast && (
        <div
          className={`absolute top-2 right-2 z-[60] px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-500" />
            Classifieds
          </h1>
          <p className="text-silver-mist text-sm">
            Buy, sell, and trade within the company network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Post Ad
          </button>
          <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-ink-black dark:text-pearl">
              My Listings ({items.length})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0 overflow-hidden">
        <div className="lg:col-span-4 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border
                                        ${
                                          selectedCategory === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }
                                    `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No listings found.</p>
              <p className="text-sm">Post an ad to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-2 pb-20">
              {filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  <div
                    className={`w-full aspect-square ${item.color || 'bg-slate-100'} rounded-xl mb-4 flex items-center justify-center text-7xl shadow-inner relative`}
                  >
                    {item.image || ''}
                    <button
                      onClick={() => toggleLike(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-4 h-4 ${likedItems.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="font-bold text-ink-black dark:text-pearl text-lg leading-tight line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      {item.price !== undefined && (
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {item.currency || '$'}
                          {item.price}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-silver-mist line-clamp-2 mb-4 flex-1">
                      {item.description || ''}
                    </p>

                    <div className="border-t border-cloud dark:border-slate-800 pt-3 mt-auto space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                            {(item.seller || item.authorName || 'U').charAt(0)}
                          </div>
                          {item.seller || item.authorName || 'User'}
                        </div>
                        <span className="text-silver-mist">
                          {item.posted || item.createdDate || ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.condition && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                            {item.condition}
                          </span>
                        )}
                        {item.category && (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Contact Seller
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">
                Sell an Item
              </h2>
              <p className="text-sm text-silver-mist mb-6">
                Create a listing to reach colleagues across the company.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Title</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., Mechanical Keyboard"
                        className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">
                          Condition
                        </label>
                        <select
                          value={form.condition}
                          onChange={(e) => setForm({ ...form, condition: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                        >
                          <option>New</option>
                          <option>Like New</option>
                          <option>Good</option>
                          <option>Fair</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the item condition, specs, etc."
                    className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                  ></textarea>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300">
                    Your listing will be visible to all employees. Please ensure items comply with
                    workplace policy.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePostAd}
                disabled={submitting}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Publish Listing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
