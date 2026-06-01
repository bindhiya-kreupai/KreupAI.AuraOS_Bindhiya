import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { JobPostingService } from '@/app/dashboard/recruitment/services';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        type: 'Full-time'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await JobPostingService.createPosting({
                ...formData,
                status: 'Active',
                channels: { linkedin: false, indeed: false, website: true, glassdoor: false }
            } as any);

            // Reset and close
            setFormData({ title: '', department: '', location: '', type: 'Full-time' });
            onSuccess();
        } catch (error: any) {
            console.error('Failed to create job:', error);
            setError('Failed to create job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-2xl shadow-2xl border border-cloud dark:border-nebula-purple/50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-cloud dark:border-nebula-purple/20">
                    <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Create Job Posting</h2>
                    <button onClick={onClose} className="text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">Job Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue/50 focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none transition-all"
                            placeholder="e.g. Senior Product Designer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">Department</label>
                        <select
                            required
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue/50 focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none transition-all"
                        >
                            <option value="" disabled>Select Department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">Location</label>
                        <input
                            required
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue/50 focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none transition-all"
                            placeholder="e.g. New York, NY"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-ink-black dark:text-pearl mb-1">Employment Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue/50 focus:ring-2 focus:ring-celestial-indigo/20 focus:border-celestial-indigo outline-none transition-all"
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Creating...' : 'Create Posting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
