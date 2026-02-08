import React, { useState } from 'react';
import { api } from '../services/api';
import type { FinanceTransaction } from '../types';
import { Plus, X } from 'lucide-react';

interface TransactionFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const TransactionForm = ({ onSuccess, onCancel }: TransactionFormProps) => {
    // ... (state hooks remain same)
    const [formData, setFormData] = useState<Omit<FinanceTransaction, 'id' | 'created_at'>>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        credit: 0,
        debit: 0,
        category: 'Revenue', // default
    });
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState<number>(0);

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (submit logic remains same)
        e.preventDefault();
        setLoading(true);
        try {
            const finalData = {
                ...formData,
                credit: type === 'credit' ? amount : 0,
                debit: type === 'debit' ? amount : 0,
            };
            await api.addTransaction(finalData);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to add transaction. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200 ring-1 ring-white/10">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-1 rounded-full hover:bg-slate-700"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
                        <Plus className="text-white" size={20} />
                    </div>
                    Add Transaction
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">
                            {type === 'credit' ? 'Received From' : 'Credited For'}
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={type === 'credit' ? "e.g. Client Name" : "e.g. Service or Item"}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Type</label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as 'credit' | 'debit')}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none transition-all"
                                >
                                    <option value="credit">Credit (+)</option>
                                    <option value="debit">Debit (-)</option>
                                </select>
                                {/* Custom arrow could be added here if needed */}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-400">Amount</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600 font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none appearance-none transition-all"
                        >
                            <option value="Revenue">Revenue</option>
                            <option value="Investment">Investment</option>
                            <option value="Operations">Operations</option>
                            <option value="Software">Software</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Payroll">Payroll</option>
                            <option value="Other">Other</option>
                        </select>
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
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all transform active:scale-95"
                        >
                            {loading ? 'Processing...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
