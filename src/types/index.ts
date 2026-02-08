export interface Employee {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee' | 'investor';
    active: boolean;
    created_at?: string;
}

export interface Project {
    id: string;
    project_name: string;
    client_name: string;
    start_date: string;
    end_date?: string;
    status: 'ongoing' | 'completed' | 'on_hold';
    revenue: number;
    owner?: string;
    created_at?: string;
}

export interface FinanceTransaction {
    id: string;
    date: string;
    description: string;
    credit: number;
    debit: number;
    category: string;
    created_at?: string;
}

export interface WorkLog {
    id: string;
    employee_id: string;
    project_id?: string;
    date: string;
    task: string;
    hours: number;
    status: 'in_progress' | 'completed';
    created_at?: string;
    // joined fields
    projects?: Project;
    employees?: Employee;
}
