
import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Camera, 
  Settings as SettingsIcon, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  MessageSquare,
  Trophy,
  ChevronRight,
  LogOut,
  Radio,
  Bot,
  Hexagon,
  Zap
} from 'lucide-react';
import { AppRole } from '../types';
import { Language, translations } from '../translations';

interface SidebarProps {
  role: AppRole;
  onRoleSwitch: (role: AppRole) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  language: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onRoleSwitch, activeView, onViewChange, onLogout, language }) => {
  const t = translations[language];

  const citizenLinks = [
    { id: 'dashboard', label: t.feed, icon: <MessageSquare size={20} className="animate-icon-neon" /> },
    { id: 'map', label: t.map, icon: <MapIcon size={20} className="animate-icon-neon" /> },
    { id: 'report', label: t.report, icon: <Camera size={20} className="animate-icon-neon" /> },
    { id: 'ai-chat', label: t.aiAssistant, icon: <Bot size={20} className="animate-icon-neon text-indigo-500 dark:text-indigo-400" /> },
    { id: 'live', label: 'Go Live', icon: <Radio size={20} className="animate-icon-neon" /> },
    { id: 'leaderboard', label: t.leaderboard, icon: <Trophy size={20} className="animate-icon-neon" /> },
    { id: 'settings', label: t.settings, icon: <SettingsIcon size={20} className="animate-icon-neon" /> },
  ];

  const authorityLinks = [
    { id: 'command', label: t.commandCenter, icon: <LayoutDashboard size={20} className="animate-icon-neon" /> },
    { id: 'map', label: t.map, icon: <MapIcon size={20} className="animate-icon-neon" /> },
    { id: 'ai-road', label: t.aiRoadIntel, icon: <ShieldAlert size={20} className="animate-icon-neon" /> },
    { id: 'ai-chat', label: t.aiAssistant, icon: <Bot size={20} className="animate-icon-neon text-indigo-500 dark:text-indigo-400" /> },
    { id: 'analytics', label: t.analytics, icon: <BarChart3 size={20} className="animate-icon-neon" /> },
    { id: 'field-staff', label: t.fieldUnits, icon: <Users size={20} className="animate-icon-neon" /> },
    { id: 'settings', label: t.settings, icon: <SettingsIcon size={20} className="animate-icon-neon" /> },
  ];

  const links = role === AppRole.CITIZEN ? citizenLinks : authorityLinks;

  return (
    <aside className="w-64 glass h-screen fixed left-0 top-0 flex flex-col p-4 z-50 transition-all duration-300 border-r border-slate-200 dark:border-white/5 backdrop-blur-2xl">
      <div className="flex items-center gap-3 mb-10 px-2 animate-in fade-in slide-in-from-left duration-500 mt-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center neon-border shadow-lg hover:rotate-12 transition-transform duration-300 relative group">
           <Hexagon className="text-white fill-white/10" size={28} strokeWidth={2} />
           <Zap className="text-yellow-300 absolute" size={14} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">FixMyCity</h1>
          <span className="text-[10px] font-mono text-sky-500 tracking-widest uppercase">AI CIVIC PLATFORM</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {links.map((link, index) => (
          <button
            key={link.id}
            onClick={() => onViewChange(link.id)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 animate-slide-up opacity-0 fill-mode-forwards group relative overflow-hidden ${
              activeView === link.id 
                ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-white border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <div className={`relative z-10 transition-transform duration-300 ${activeView === link.id ? 'scale-110' : 'group-hover:scale-110'}`}>
               {link.icon}
            </div>
            <span className="font-medium relative z-10 text-sm tracking-wide">{link.label}</span>
            
            {activeView === link.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent opacity-50" />
            )}
            
            {activeView === link.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse relative z-10" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-slate-200/50 dark:border-white/5 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="p-3.5 bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-sky-500/30 transition-colors group cursor-pointer backdrop-blur-sm">
          <div 
             onClick={() => onRoleSwitch(role === AppRole.CITIZEN ? AppRole.AUTHORITY : AppRole.CITIZEN)}
             className="flex items-center justify-between"
          >
             <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold group-hover:text-sky-500 transition-colors">Current Mode</p>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {role === AppRole.CITIZEN ? 'Citizen Portal' : 'Authority View'}
                </span>
             </div>
             <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <ChevronRight size={14} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
             </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold tracking-wide"
        >
          <LogOut size={18} />
          <span>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
