import React, { useState } from 'react';
import { api } from '../services/api';
import type { Project } from '../types';
import { X, Calendar, ClipboardCheck, User } from 'lucide-react';

interface ProjectFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: Project;
}

const ProjectForm = ({ onSuccess, onCancel, initialData }: ProjectFormProps) => {
    const [formData, setFormData] = useState<Omit<Project, 'id' | 'created_at'>>({
        project_name: initialData?.project_name || '',
        client_name: initialData?.client_name || '',
        start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData?.end_date || '',
        status: initialData?.status || 'ongoing',
        revenue: initialData?.revenue || 0,
        owner: initialData?.owner || '',
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare payload: convert empty strings to null for optional dates
            const payload = {
                ...formData,
                end_date: formData.end_date === '' ? null : formData.end_date,
            };

            if (initialData?.id) {
                await api.updateProject(initialData.id, payload as any);
            } else {
                await api.createProject(payload as any);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save project. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200 ring-1 ring-white/10">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-1 rounded-full hover:bg-slate-700"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                        <ClipboardCheck className="text-white" size={20} />
                    </div>
                    {initialData ? 'Edit Project' : 'New Project'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Project Name</label>
                            <input
                                type="text"
                                required
                                value={formData.project_name}
                                onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                placeholder="e.g. Website Redesign"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Client Name</label>
                            <input
                                type="text"
                                required
                                value={formData.client_name}
                                onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute top-3 left-3 text-slate-500 pointer-events-none" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full pl-10 px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute top-3 left-3 text-slate-500 pointer-events-none" size={16} />
                                <input
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full pl-10 px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Project Owner</label>
                            <div className="relative">
                                <User className="absolute top-3 left-3 text-slate-500 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.owner || ''}
                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                    className="w-full pl-10 px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Status</label>
                            <div className="relative">
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
                                >
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Revenue Budget</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.revenue}
                            onChange={e => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600 font-mono"
                        />
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-700/50 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
