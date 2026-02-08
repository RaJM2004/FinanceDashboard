import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { FinanceTransaction } from '../types';
import TransactionForm from '../components/TransactionForm';
import { Plus, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Finance = () => {
    const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<FinanceTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Filters
    const [dateFilter, setDateFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await api.getTransactions();
            setTransactions(data);
            setFilteredTransactions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        let result = transactions;
        if (dateFilter) {
            result = result.filter(t => t.date.startsWith(dateFilter)); // Simple string match YYYY-MM
        }
        if (categoryFilter !== 'All') {
            result = result.filter(t => t.category === categoryFilter);
        }
        setFilteredTransactions(result);
    }, [dateFilter, categoryFilter, transactions]);

    // Chart Data: Group by month
    const chartData = filteredTransactions.reduce((acc: any, t) => {
        const month = t.date.slice(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { name: month, amount: 0 };
        acc[month].amount += (t.credit - t.debit);
        return acc;
    }, {});
    const lineChartData = Object.values(chartData).sort((a: any, b: any) => a.name.localeCompare(b.name));

    const categories = ['All', ...Array.from(new Set(transactions.map(t => t.category)))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Financial Overview</h2>
                    <p className="text-slate-400">Manage and track company finances</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                >
                    <Plus size={20} />
                    Add Transaction
                </button>
            </div>

            {/* Filters & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters */}
                <div className="lg:col-span-1 space-y-4 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50 h-fit">
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                        <Filter size={18} className="text-cyan-400" /> Filters
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Month</label>
                        <input
                            type="month"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => { setDateFilter(''); setCategoryFilter('All'); }}
                        className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
                    <h3 className="font-bold text-slate-100 mb-4">Cash Flow Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="99%" height="100%">
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(val) => formatCurrency(val as number)}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    cursor={{ stroke: 'rgba(6, 182, 212, 0.5)' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22d3ee' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700/50">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-400">Received From</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-400">Credited For</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-400">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading transactions...</td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions found</td></tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap font-mono">{formatDate(t.date)}</td>
                                        <td className={`px-6 py-4 text-sm font-medium text-right font-mono ${t.credit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {t.credit > 0 ? `+${formatCurrency(t.credit)}` : `-${formatCurrency(t.debit)}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">
                                            {t.credit > 0 ? t.description : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">
                                            {t.debit > 0 ? t.description : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border border-slate-700 group-hover:border-slate-600 transition-colors">
                                                {t.category}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-slate-800/30 border-t border-slate-700/50 font-bold">
                            <tr>
                                <td className="px-6 py-4 text-slate-100">Total</td>
                                <td className={`px-6 py-4 text-right font-mono ${filteredTransactions.reduce((acc, t) => acc + t.credit - t.debit, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatCurrency(filteredTransactions.reduce((acc, t) => acc + t.credit - t.debit, 0))}
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {showForm && (
                <TransactionForm
                    onSuccess={() => { setShowForm(false); fetchTransactions(); }}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};

export default Finance;
