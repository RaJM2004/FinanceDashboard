import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { FinanceTransaction, Project } from '../types';
import KPICard from '../components/KPICard';
import { DollarSign, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { role } = useAuth();
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transData, projData] = await Promise.all([
                    api.getTransactions().catch(() => []), // return empty if error (e.g. permission)
                    api.getProjects().catch(() => [])
                ]);
                setTransactions(transData);
                setProjects(projData);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [role]);

    // Aggregations
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.category === 'Revenue' || t.credit > 0 ? t.credit : 0), 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.debit, 0);
    const netProfit = totalRevenue - totalExpenses;
    const activeProjects = projects.filter(p => p.status === 'ongoing').length;

    // Chart Data Preparation
    const monthlyData = transactions.reduce((acc: any, t) => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) acc[month] = { name: month, revenue: 0, expenses: 0 };
        if (t.credit > 0) acc[month].revenue += t.credit;
        if (t.debit > 0) acc[month].expenses += t.debit;
        return acc;
    }, {});

    const lineChartData = Object.values(monthlyData); // Convert to array

    // Project Status Data
    const projectStatusData = [
        { name: 'Ongoing', value: projects.filter(p => p.status === 'ongoing').length, color: '#10B981' }, // Emerald
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#3B82F6' }, // Blue
        { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: '#F59E0B' }, // Amber
    ];

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm bg-slate-900/20 p-6 rounded-2xl border border-slate-700/50">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Executive Overview</h2>
                    <p className="text-slate-400 mt-1">Real-time system monitoring and financial analysis.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-cyan-400 font-mono transition-colors shadow-[0_0_10px_rgba(6,182,212,0.1)] active:scale-95"
                    >
                        Generate Report
                    </button>
                    <button
                        onClick={() => {
                            setLoading(true);
                            // Re-fetch data
                            Promise.all([
                                api.getTransactions().catch(() => []),
                                api.getProjects().catch(() => [])
                            ]).then(([transData, projData]) => {
                                setTransactions(transData);
                                setProjects(projData);
                                setLoading(false);
                            });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={DollarSign}
                    color="emerald"
                    trend="+12%"
                    trendUp={true}
                />
                <KPICard
                    title="Total Expenses"
                    value={formatCurrency(totalExpenses)}
                    icon={TrendingDown}
                    color="red"
                />
                <KPICard
                    title="Net Profit"
                    value={formatCurrency(netProfit)}
                    icon={TrendingUp}
                    color="blue"
                    trend="+8%"
                    trendUp={true}
                />
                <KPICard
                    title="Active Projects"
                    value={activeProjects}
                    icon={Briefcase}
                    color="purple"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Revenue Trend */}
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <TrendingUp className="text-cyan-400 w-24 h-24 transform rotate-12" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                        Financial Performance
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value as number)}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Project Distribution */}
                <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden hover:border-slate-600 transition-colors">
                    <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                        Project Status
                    </h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
