import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: string;
}

const KPICard = ({ title, value, icon: Icon, trend, trendUp, color = "blue" }: KPICardProps) => {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
        emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
        red: "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    };

    return (
        <div className="group relative bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-slate-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-slate-400 group-hover:text-cyan-200 transition-colors uppercase tracking-wider text-[10px]">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-100 mt-2 font-mono tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || "bg-slate-800"}`}>
                    <Icon size={24} className="drop-shadow-[0_0_8px_currentColor]" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs relative z-10">
                    <span className={`font-mono font-bold ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
                        {trend}
                    </span>
                    <span className="text-slate-500 ml-2">vs last cycle</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
