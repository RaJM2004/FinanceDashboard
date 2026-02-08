
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'admin' | 'employee' | 'investor' | null;
    employeeId: string | null;
    loading: boolean;
    signIn: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    employeeId: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'employee' | 'investor' | null>(null);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user?.email) {
                fetchRole(session.user.email);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user?.email) {
                fetchRole(session.user.email);
            } else {
                setRole(null);
                setEmployeeId(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRole = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('role, id')
                .eq('email', email)
                .single();

            if (error) {
                console.error('Role fetch error:', error.message);
                // If the error is regarding missing row (PGRST116), it means the user exists in Auth but not in Employees.
                if (error.code === 'PGRST116') {
                    console.error('User authenticated but no employee profile found. Please run the fix_admin_user.sql script in Supabase.');
                }
                setRole(null);
                setEmployeeId(null);
            } else if (data) {
                setRole(data.role as any);
                setEmployeeId(data.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (_email: string) => {
        // For this demo, using Magic Link or standard email/password if configured.
        // The prompt asked for email/password.
        // But since I don't know the password setup for the user, 
        // I'll implement standard signInWithPassword in the Login form itself,
        // or expose a helper here. 
        // Actually, `signIn` here might just be a wrapper. 
        // To be flexible, I'll let the component call supabase.auth.signInWithPassword directly.
        // But for context consistency, I can just leave it as is or remove it if unused.
        // Placeholder matches previous logic
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setEmployeeId(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, role, employeeId, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

