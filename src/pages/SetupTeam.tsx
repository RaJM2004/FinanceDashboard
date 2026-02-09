import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const TEAM_MEMBERS = [
    { name: 'Raj', email: 'raj@anvriksh.com', password: 'AnvrikshTeam123!' },
    { name: 'Ammar', email: 'ammar@anvriksh.com', password: 'AnvrikshTeam123!' },
    { name: 'Raksha', email: 'raksha@anvriksh.com', password: 'AnvrikshTeam123!' },
    { name: 'Vaibhav', email: 'vaibhav@anvriksh.com', password: 'AnvrikshTeam123!' },
    { name: 'Naresh', email: 'naresh@anvriksh.com', password: 'AnvrikshTeam123!' },
];

const SetupTeam = () => {
    const [status, setStatus] = useState<Record<string, 'pending' | 'loading' | 'success' | 'error'>>({});
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const createUsers = async () => {
        addLog('Starting team creation process...');

        for (const member of TEAM_MEMBERS) {
            setStatus(prev => ({ ...prev, [member.email]: 'loading' }));
            addLog(`Creating user: ${member.name} (${member.email})...`);

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: member.email,
                    password: member.password,
                    options: {
                        data: {
                            name: member.name,
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    addLog(`User ${member.email} already exists.`);
                    setStatus(prev => ({ ...prev, [member.email]: 'success' }));
                } else {
                    addLog(`Successfully signed up ${member.name}. Please check email for confirmation if required.`);
                    setStatus(prev => ({ ...prev, [member.email]: 'success' }));
                }

            } catch (err: any) {
                console.error(err);
                addLog(`Error creating ${member.name}: ${err.message}`);
                setStatus(prev => ({ ...prev, [member.email]: 'error' }));
            }
        }
        addLog('Process completed.');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-400 mb-2">Team Setup Tool</h1>
                    <p className="text-slate-400">
                        Use this tool to initialize the authentication accounts for your team.
                        <br />
                        <span className="text-yellow-400 text-sm">
                            ⚠️ Note: If "Confirm Email" is enabled in your Supabase project, you will need to confirm the emails before logging in.
                        </span>
                    </p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Team Members</h2>
                        <button
                            onClick={createUsers}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            Initialize Accounts
                        </button>
                    </div>

                    <div className="space-y-3">
                        {TEAM_MEMBERS.map(member => (
                            <div key={member.email} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-slate-500">{member.email}</div>
                                    <div className="text-xs text-slate-600 font-mono mt-1">Pass: {member.password}</div>
                                </div>
                                <div>
                                    {status[member.email] === 'loading' && <Loader2 className="animate-spin text-blue-400" />}
                                    {status[member.email] === 'success' && <CheckCircle className="text-emerald-400" />}
                                    {status[member.email] === 'error' && <XCircle className="text-red-400" />}
                                    {!status[member.email] && <span className="text-xs text-slate-500">Pending</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 font-mono text-xs h-64 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-300 border-b border-slate-800/50 py-1">{log}</div>
                    ))}
                    {logs.length === 0 && <span className="text-slate-600">Waiting to start...</span>}
                </div>
            </div>
        </div>
    );
};

export default SetupTeam;
