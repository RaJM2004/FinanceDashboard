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
            if (initialData?.id) {
                await api.updateProject(initialData.id, formData);
            } else {
                await api.createProject(formData);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>

                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ClipboardCheck className="text-blue-600" size={24} />
                    {initialData ? 'Edit Project' : 'New Project'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Project Name</label>
                            <input
                                type="text"
                                required
                                value={formData.project_name}
                                onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Client Name</label>
                            <input
                                type="text"
                                required
                                value={formData.client_name}
                                onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute top-2.5 left-3 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute top-2.5 left-3 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Project Owner</label>
                            <div className="relative">
                                <User className="absolute top-2.5 left-3 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.owner || ''}
                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                    className="w-full pl-10 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="on_hold">On Hold</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Revenue Budget</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.revenue}
                            onChange={e => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
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
