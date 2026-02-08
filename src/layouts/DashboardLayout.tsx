import { type ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Navigate } from 'react-router-dom';
import NetworkBackground from '../components/NetworkBackground';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="relative min-h-screen overflow-hidden text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white">
            <NetworkBackground />

            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 overflow-y-auto h-full p-4 lg:p-8 scrollbar-hide relative w-full">
                    <header className="mb-8 flex justify-between items-center backdrop-blur-sm bg-slate-900/30 p-4 rounded-2xl border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                    Command Center
                                </h1>
                                <p className="text-slate-400 text-xs lg:text-sm mt-1 hidden sm:block">Welcome back, Agent {user?.email?.split('@')[0]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-md px-3 py-1.5 lg:px-4 lg:py-2 rounded-full border border-slate-700/50 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                <span className="relative flex h-2 w-2 lg:h-3 lg:w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 lg:h-3 lg:w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs lg:text-sm text-cyan-100 font-mono hidden sm:inline-block">SYSTEM ONLINE</span>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-6 animate-fade-in-up pb-20 lg:pb-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
