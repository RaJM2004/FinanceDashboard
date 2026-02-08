import { supabase } from './supabase';
import type { Employee, Project, FinanceTransaction, WorkLog } from '../types';

export const api = {
    // Employees
    getEmployees: async () => {
        const { data, error } = await supabase.from('employees').select('*').order('name');
        if (error) throw error;
        return data as Employee[];
    },

    getEmployeeRole: async (email: string) => {
        const { data, error } = await supabase
            .from('employees')
            .select('role')
            .eq('email', email)
            .single();

        if (error) return null;
        return data?.role as 'admin' | 'employee' | 'investor';
    },

    // Projects
    getProjects: async () => {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Project[];
    },

    createProject: async (project: Omit<Project, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('projects').insert(project).select().single();
        if (error) throw error;
        return data;
    },

    updateProject: async (id: string, updates: Partial<Project>) => {
        const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    // Finance
    getTransactions: async () => {
        const { data, error } = await supabase.from('finance_transactions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data as FinanceTransaction[];
    },

    addTransaction: async (transaction: Omit<FinanceTransaction, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('finance_transactions').insert(transaction).select().single();
        if (error) throw error;
        return data;
    },

    // Work Logs
    getWorkLogs: async () => {
        const { data, error } = await supabase
            .from('work_logs')
            .select('*, projects(*), employees(*)')
            .order('date', { ascending: false });

        if (error) throw error;
        return data as WorkLog[];
    },

    addWorkLog: async (log: Omit<WorkLog, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('work_logs').insert(log).select().single();
        if (error) throw error;
        return data;
    }
};
