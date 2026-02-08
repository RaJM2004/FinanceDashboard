import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Project, WorkLog } from '../types';
import { Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WorkLogFormProps {
    onSuccess: () => void;
}

const WorkLogForm = ({ onSuccess }: WorkLogFormProps) => {
    const { employeeId } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [formData, setFormData] = useState<Omit<WorkLog, 'id' | 'created_at'>>({
        employee_id: employeeId || '',
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        task: '',
        hours: 0,
        status: 'completed',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employeeId) {
            setFormData(prev => ({ ...prev, employee_id: employeeId }));
        }
    }, [employeeId]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.getProjects();
                // Filter mainly ongoing projects, or all
                setProjects(data.filter(p => p.status === 'ongoing'));
            } catch (error) {
                console.error(error);
            }
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) {
            alert('Employee ID not found. Please log in again.');
            return;
        }

        setLoading(true);
        try {
            await api.addWorkLog(formData);
            // Reset form (except date/employee)
            setFormData(prev => ({ ...prev, task: '', hours: 0, project_id: '' }));
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to log work.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Log Daily Work
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Project</label>
                        <select
                            required
                            value={formData.project_id}
                            onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select Project...</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.project_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Task Description</label>
                    <textarea
                        required
                        rows={2}
                        value={formData.task}
                        onChange={e => setFormData({ ...formData, task: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="What did you work on today?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Hours</label>
                        <input
                            type="number"
                            required
                            min="0.5"
                            step="0.5"
                            value={formData.hours}
                            onChange={e => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                    {loading ? 'Logging...' : (
                        <>
                            <CheckCircle size={18} /> Log Work
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default WorkLogForm;
