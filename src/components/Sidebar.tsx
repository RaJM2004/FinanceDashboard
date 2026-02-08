import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, Users, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { role, signOut } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'employee', 'investor'] },
        { name: 'Finance', path: '/finance', icon: Wallet, roles: ['admin', 'investor'] },
        { name: 'Projects', path: '/projects', icon: Briefcase, roles: ['admin', 'employee', 'investor'] },
        { name: 'Team & Work Logs', path: '/team', icon: Users, roles: ['admin', 'employee'] },
    ];
    // Filter logic
    const filteredLinks = links.filter(link => role && link.roles.includes(role));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
                bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                            ANVRiksh
                        </h1>
                        <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">SYSTEM V1.0</p>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {filteredLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => onClose()} // Close on mobile navigation
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-blue-600/20 text-cyan-400 border border-blue-500/30'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 hover:translate-x-1'
                                }`
                            }
                        >
                            <link.icon size={20} className="relative z-10" />
                            <span className="font-medium relative z-10">{link.name}</span>

                            {/* Active/Hover Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <button
                        onClick={signOut}
                        className="flex items-center space-x-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2 rounded-lg hover:bg-red-500/10 group"
                    >
                        <LogOut size={20} className="group-hover:stroke-red-400" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
