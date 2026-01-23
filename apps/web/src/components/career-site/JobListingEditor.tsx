"use client";

import React, { useState } from "react";
import { Plus, Edit2, Eye, EyeOff, Trash2, Briefcase, MapPin } from "lucide-react";
import type { JobListing } from "./CareerSiteBuilder";

interface JobListingEditorProps {
  listings: JobListing[];
  onUpdate: (listings: JobListing[]) => void;
}

export default function JobListingEditor({ listings, onUpdate }: JobListingEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", department: "", location: "", type: "Full-time" });

  const togglePublish = (id: string) => {
    onUpdate(listings.map((l) => (l.id === id ? { ...l, published: !l.published } : l)));
  };

  const deleteListing = (id: string) => {
    onUpdate(listings.filter((l) => l.id !== id));
  };

  const startEdit = (listing: JobListing) => {
    setEditingId(listing.id);
    setEditForm({ title: listing.title, department: listing.department, location: listing.location, type: listing.type });
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(listings.map((l) => (l.id === editingId ? { ...l, ...editForm } : l)));
      setEditingId(null);
    }
  };

  const addListing = () => {
    const newListing: JobListing = {
      id: String(Date.now()),
      title: "New Position",
      department: "Department",
      location: "Location",
      type: "Full-time",
      published: false,
    };
    onUpdate([...listings, newListing]);
    startEdit(newListing);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Job Listings ({listings.length})</h3>
        <button onClick={addListing} className="px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-medium flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add Listing
        </button>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30">
            {editingId === listing.id ? (
              <div className="space-y-3">
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" placeholder="Job Title" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" placeholder="Department" />
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" placeholder="Location" />
                  <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-medium">Save</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-100 dark:bg-deep-cosmos text-ink-black dark:text-pearl rounded-lg text-xs font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-ink-black dark:text-pearl">{listing.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{listing.department}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location}</span>
                    <span className="bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded-full">{listing.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${listing.published ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                    {listing.published ? "Published" : "Draft"}
                  </span>
                  <button onClick={() => togglePublish(listing.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded-lg">
                    {listing.published ? <EyeOff className="w-3.5 h-3.5 text-silver-mist" /> : <Eye className="w-3.5 h-3.5 text-silver-mist" />}
                  </button>
                  <button onClick={() => startEdit(listing)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded-lg">
                    <Edit2 className="w-3.5 h-3.5 text-silver-mist" />
                  </button>
                  <button onClick={() => deleteListing(listing.id)} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
