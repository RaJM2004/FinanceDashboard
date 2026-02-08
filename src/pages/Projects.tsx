import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Project } from '../types';
import ProjectForm from '../components/ProjectForm';
import { Plus, LayoutList, Calendar, DollarSign, User, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'timeline'>('list');
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setShowForm(true);
    };

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'ongoing': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Projects Portfolio</h2>
                    <p className="text-slate-400">Track project timelines and status</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-1 border border-slate-700/50 flex">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            title="List View"
                        >
                            <LayoutList size={20} />
                        </button>
                        <button
                            onClick={() => setView('timeline')}
                            className={`p-2 rounded-md transition-all ${view === 'timeline' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            title="Timeline View"
                        >
                            <Calendar size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => { setEditingProject(null); setShowForm(true); }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.25)] whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">New Project</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {view === 'timeline' ? (
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700/50 p-6 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px]">
                        <div className="flex border-b border-slate-700/50 pb-4 mb-4">
                            <div className="w-48 font-semibold text-cyan-400">Project</div>
                            <div className="flex-1 text-xs text-slate-400 flex justify-between">
                                <span>Timeline Start</span>
                                <span>Timeline End</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {projects.map(project => (
                                <div key={project.id} className="flex items-center group cursor-pointer hover:bg-slate-800/30 p-2 rounded-lg transition-colors" onClick={() => handleEdit(project)}>
                                    <div className="w-48 pr-4">
                                        <div className="font-medium text-slate-200 truncate">{project.project_name}</div>
                                        <div className="text-xs text-slate-500 truncate">{project.client_name}</div>
                                    </div>
                                    <div className="flex-1 relative h-2 bg-slate-800 rounded-full overflow-hidden">
                                        {/* Simple visualization of status/progress based on hardcoded simplistic logic for now since explicit dates logic was removed for brevity previously */}
                                        <div
                                            className={`absolute top-0 bottom-0 rounded-full h-full ${getStatusColor(project.status).split(' ')[0]} opacity-80`}
                                            style={{ width: project.status === 'completed' ? '100%' : '50%', left: '0%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer relative group hover:-translate-y-1 hover:shadow-cyan-500/10"
                            onClick={() => handleEdit(project)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border bg-opacity-10 ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                                <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                                    <Clock size={12} /> {project.end_date ? formatDate(project.end_date) : 'Ongoing'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-100 mb-1 tracking-tight group-hover:text-cyan-300 transition-colors">{project.project_name}</h3>
                            <p className="text-sm text-slate-400 mb-6 font-light">{project.client_name}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-700/50 relative z-10">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <User size={14} /> Owner
                                    </div>
                                    <span className="font-medium text-slate-300">{project.owner || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <DollarSign size={14} /> Budget
                                    </div>
                                    <span className="font-medium text-emerald-400 font-mono">{formatCurrency(project.revenue)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && !loading && (
                        <div className="col-span-full text-center py-20 text-slate-500 font-mono border border-dashed border-slate-800 rounded-2xl">
                            No projects found. Initialize sequence.
                        </div>
                    )}
                </div>
            )}

            {showForm && (
                <ProjectForm
                    initialData={editingProject || undefined}
                    onSuccess={() => { setShowForm(false); fetchProjects(); }}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default Projects;
