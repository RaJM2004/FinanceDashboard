import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Employee, WorkLog } from '../types';
import WorkLogForm from '../components/WorkLogForm';
import { Users, Clock, CalendarDays } from 'lucide-react';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Team = () => {
    const { role } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);

    // Filters

    const fetchData = async () => {
        try {
            const [empData, logData] = await Promise.all([
                api.getEmployees(),
                api.getWorkLogs().catch(() => [])
            ]);
            setEmployees(empData);
            setWorkLogs(logData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [role]); // Refetch if role changes (unlikely)

    // Chart Data: Hours by Employee
    const hoursByEmployee = workLogs.reduce((acc: any, log) => {
        const name = log.employees?.name || 'Unknown';
        if (!acc[name]) acc[name] = { name: name, hours: 0 };
        acc[name].hours += Number(log.hours);
        return acc;
    }, {});
    const chartData = Object.values(hoursByEmployee);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Team & Productivity</h2>
                    <p className="text-slate-400">Manage neural links and activity logs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Team List & Stats */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Team Members */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden">
                        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <Users className="text-cyan-400" size={20} /> Team Members
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {employees.map(emp => (
                                <div key={emp.id} className="flex items-center p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors group">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold mr-3 border border-slate-600 group-hover:border-cyan-400/50 transition-colors">
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">{emp.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">{emp.role}</div>
                                    </div>
                                    <span className={`ml-auto px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${emp.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                        {emp.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Productivity Chart */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
                        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <Clock className="text-purple-400" size={20} /> Productivity Stats
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                        cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                                    />
                                    <Bar dataKey="hours" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total Hours" barSize={15} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Work Logs List */}
                    <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
                        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                            <CalendarDays className="text-blue-400" size={20} /> Recent Work Logs
                        </h3>
                        <div className="space-y-4">
                            {workLogs.slice(0, 5).map(log => (
                                <div key={log.id} className="border-b border-slate-700/50 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/20 p-2 -mx-2 rounded transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{log.task}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                <span className="font-semibold text-cyan-400">{log.employees?.name}</span> • {log.projects?.project_name} • {formatDate(log.date)}
                                            </p>
                                        </div>
                                        <span className="bg-slate-800/80 border border-slate-700 px-2 py-1 rounded text-xs font-mono font-semibold text-slate-300">
                                            {log.hours}h
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {workLogs.length === 0 && <p className="text-slate-500 text-sm text-center py-4 border border-dashed border-slate-800 rounded-lg">No work logs found.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Log Form specific for Employee */}
                <div className="lg:col-span-1 space-y-6">
                    {(role === 'employee' || role === 'admin') && (
                        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
                            <h3 className="font-bold text-slate-100 mb-4">Log Activity</h3>
                            <WorkLogForm onSuccess={fetchData} />
                        </div>
                    )}

                    {/* Additional Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-2xl p-6 text-white shadow-lg border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 p-8 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                        <h3 className="font-bold mb-2 text-indigo-100 relative z-10">Team Strength</h3>
                        <div className="text-4xl font-bold mb-1 relative z-10">{employees.length}</div>
                        <p className="text-indigo-200 text-sm mb-4 relative z-10">Active Agents</p>

                        <div className="pt-4 border-t border-white/10 relative z-10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-indigo-200 text-sm">Total Cycle Time</span>
                                <span className="font-bold font-mono">{workLogs.reduce((acc, l) => acc + Number(l.hours), 0)}h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Team;
