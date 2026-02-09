import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Project, WorkLog, Employee } from '../types';
import { Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Project Assignments Mapping
const PROJECT_ASSIGNMENTS: Record<string, string[]> = {
    'raj@anvriksh.com': ['Website Redesign', 'Mobile App Dev', 'AI Integration', 'E-commerce Platform'], // Admin - Access to all
    'ammar@anvriksh.com': ['Mobile App Dev'],
    'raksha@anvriksh.com': ['Website Redesign'],
    'vaibhav@anvriksh.com': ['AI Integration'],
    'naresh@anvriksh.com': ['E-commerce Platform'],
};

interface WorkLogFormProps {
    onSuccess: () => void;
    currentEmployee?: Employee;
}

const WorkLogForm = ({ onSuccess, currentEmployee }: WorkLogFormProps) => {
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

                let filteredProjects = data;

                // Explicitly check for admin role or email
                if (currentEmployee?.role === 'admin' || currentEmployee?.email === 'raj@anvriksh.com') {
                    // Admin sees all projects
                    filteredProjects = data;
                } else if (currentEmployee && PROJECT_ASSIGNMENTS[currentEmployee.email]) {
                    const assignedNames = PROJECT_ASSIGNMENTS[currentEmployee.email];
                    filteredProjects = data.filter(p => assignedNames.includes(p.project_name));
                } else {
                    // Default behavior
                    filteredProjects = data.filter(p => p.status === 'ongoing');
                }

                // Fallback debug: if filter results in 0 but data exists, check generic ongoing
                if (filteredProjects.length === 0 && data.length > 0) {
                    console.warn('Filter returned 0 projects. Admin logic might be skipped or assignment mismatch. Showing ongoing.');
                    filteredProjects = data.filter(p => p.status === 'ongoing');
                }

                setProjects(filteredProjects);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProjects();
    }, [currentEmployee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId) {
            alert('Employee ID not found. Please log in again.');
            return;
        }

        setLoading(true);
        try {
            let dataToSubmit = { ...formData };

            // Handle Custom Project
            if (dataToSubmit.project_id === 'custom') {
                const customName = (window as any).customProjectName;
                if (!customName || customName.trim() === '') {
                    alert('Please enter a custom project name.');
                    setLoading(false);
                    return;
                }
                // Prepend to Task
                dataToSubmit.task = `[Project: ${customName}] ${dataToSubmit.task}`;
                // Set project_id to null (allowed by schema)
                // However, the `Project` type in `types/index.ts` might expect string?
                // `project_id` in types is `project_id?: string`.
                // Actually supabase will accept null if column is nullable.
                // But TypeScript might complain if we send 'custom' or empty string if it expects UUID.
                // Let's send null (as any or specific override).
                (dataToSubmit as any).project_id = null;
            }

            await api.addWorkLog(dataToSubmit);
            // Reset form
            setFormData(prev => ({ ...prev, task: '', hours: 0, project_id: '' }));
            (window as any).customProjectName = ''; // Reset temp global
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to log work.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden">
            <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
                    <Clock className="text-white" size={20} />
                </div>
                Log Daily Work
            </h3>

            {currentEmployee && (
                <div className="mb-4 text-xs text-slate-400">
                    Logging as: <span className="text-cyan-400 font-medium">{currentEmployee.name}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Project</label>
                        <div className="relative">
                            <select
                                required
                                value={formData.project_id === 'custom' ? 'custom' : formData.project_id}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'custom') {
                                        setFormData(prev => ({ ...prev, project_id: 'custom' }));
                                    } else {
                                        setFormData(prev => ({ ...prev, project_id: val }));
                                    }
                                }}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option value="" className="bg-slate-800 text-slate-400">Select Project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id} className="bg-slate-800 text-slate-200">{p.project_name}</option>
                                ))}
                                <option value="custom" className="bg-slate-800 text-cyan-400 font-bold border-t border-slate-700">+ Write your own...</option>
                            </select>
                        </div>
                    </div>
                </div>

                {formData.project_id === 'custom' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-cyan-400">Custom Project Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter project name..."
                            className="w-full px-4 py-2 bg-slate-800/80 border border-cyan-500/50 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                            onChange={(e) => {
                                // Store custom project name in a temp property or handle in submit
                                // For now, we will handle in submit by prepending to task
                                (window as any).customProjectName = e.target.value;
                            }}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Task Description</label>
                    <textarea
                        required
                        rows={2}
                        value={formData.task}
                        onChange={e => setFormData({ ...formData, task: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-600"
                        placeholder="What did you work on today?"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Hours</label>
                        <input
                            type="number"
                            required
                            min="0.5"
                            step="0.5"
                            value={formData.hours}
                            onChange={e => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600 font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Status</label>
                        <div className="relative">
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option value="completed" className="bg-slate-800">Completed</option>
                                <option value="in_progress" className="bg-slate-800">In Progress</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform active:scale-95 flex justify-center items-center gap-2 mt-2"
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
