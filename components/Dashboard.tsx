
import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  MessageCircle, 
  Award,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  LayoutGrid,
  Radio,
  Users,
  UserCheck
} from 'lucide-react';
import { AppRole, Issue, IssueCategory, IssueStatus, User } from '../types';
import { MOCK_ISSUES } from '../constants';
import MapInterface from './MapInterface';
import RoadAI from './RoadAI';
import ReportIssue from './ReportIssue';
import SocialFeed from './SocialFeed';
import AIChat from './AIChat';
import LiveReport from './LiveReport';
import { Language, translations } from '../translations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  role: AppRole;
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ role, user, activeView, onViewChange, language }) => {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);
  const [filter, setFilter] = useState<IssueCategory | 'ALL'>('ALL');
  const [isReporting, setIsReporting] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const t = translations[language];

  const analyticsData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 30 },
    { label: 'Sat', value: 10 },
    { label: 'Sun', value: 8 },
  ];

  const handleReportSuccess = (newIssue: Issue) => {
    setIssues([newIssue, ...issues]);
    setIsReporting(false);
    onViewChange('dashboard');
  };

  const renderCitizenDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-700">
      {isReporting || activeView === 'report' ? (
        <ReportIssue 
          user={user}
          onSuccess={handleReportSuccess} 
          onCancel={() => { setIsReporting(false); onViewChange('dashboard'); }} 
        />
      ) : activeView === 'live' ? (
        <LiveReport 
          user={user} 
          onEnd={() => onViewChange('dashboard')} 
        />
      ) : (
        <SocialFeed 
          issues={issues} 
          user={user} 
          onAddIssue={() => setIsReporting(true)} 
        />
      )}
    </div>
  );

  const renderAuthorityDashboard = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700 pb-10">
      <div className="flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-left duration-500">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.commandCenter}</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Regional Grid Status: <span className="text-emerald-500 dark:text-emerald-400 font-bold">OPTIMAL</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-500 delay-100">
           <button className="glass p-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:scale-105 active:scale-95 border border-slate-200 dark:border-white/10">
              <Filter size={20} />
           </button>
           <button className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all hover:scale-105 active:scale-95">
              <ShieldAlert size={20} className="animate-pulse" /> Critical Dispatch
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Fix Time', value: '4.2 hrs', trend: '-15%', color: 'sky' },
          { label: 'Active Reports', value: issues.length.toString(), trend: '+12%', color: 'amber' },
          { label: 'Citizen Satisfaction', value: '92%', trend: '+2%', color: 'emerald' },
          { label: 'Department Backlog', value: '18', trend: '-5%', color: 'sky' }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="glass-hover glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 transition-all duration-300 animate-slide-up opacity-0 fill-mode-forwards"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <p className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</span>
              <div className={`px-2 py-1 rounded-lg bg-${stat.color === 'emerald' ? 'emerald' : 'red'}-500/10 border border-${stat.color === 'emerald' ? 'emerald' : 'red'}-500/20`}>
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass glass-hover p-8 rounded-[2rem] h-[450px] border border-slate-200 dark:border-white/5 animate-slide-up opacity-0 fill-mode-forwards delay-300">
           <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
             <TrendingUp size={20} className="text-sky-500" />
             Response Efficiency
           </h4>
           <ResponsiveContainer width="100%" height="85%">
              <LineChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#0ea5e9', strokeWidth: 2 }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} 
                  itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff', r: 4 }} 
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3, className: 'animate-pulse' }} 
                  animationDuration={2000}
                />
              </LineChart>
           </ResponsiveContainer>
        </div>

        <div className="glass glass-hover p-8 rounded-[2rem] h-[450px] border border-slate-200 dark:border-white/5 animate-slide-up opacity-0 fill-mode-forwards delay-500">
           <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
             <Users size={20} className="text-purple-500" />
             Staff Load
           </h4>
           <ResponsiveContainer width="100%" height="85%">
              <BarChart data={[
                { name: 'Roads', v: 45 },
                { name: 'Water', v: 32 },
                { name: 'Waste', v: 61 },
                { name: 'Elec', v: 28 },
              ]}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="v" radius={[12, 12, 12, 12]} animationDuration={1500} barSize={40}>
                   {[45, 32, 61, 28].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : 'rgba(99, 102, 241, 0.8)'} />
                   ))}
                </Bar>
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 animate-slide-up opacity-0 fill-mode-forwards delay-500 shadow-2xl">
         <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/5">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
               <Radio className="text-red-500 animate-pulse" size={18} /> Live Departmental Feed
            </h4>
            <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              SYNCED: 12ms
            </span>
         </div>
         <div className="divide-y divide-slate-200 dark:divide-white/5">
            {issues.map((issue, index) => (
              <div key={issue.id} className="p-6 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                 <div className="flex items-center gap-6">
                    <img src={issue.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300 border border-white/10" />
                    <div>
                       <p className="text-base font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors mb-1">{issue.title}</p>
                       <p className="text-xs text-slate-500 font-medium">Reported by <span className="text-slate-700 dark:text-slate-300">@{issue.reporterName?.split(' ')[0]}</span> • {new Date(issue.timestamp).toLocaleTimeString()}</p>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black tracking-wider text-sky-600 dark:text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 uppercase">
                      {issue.department}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      issue.status === IssueStatus.OPEN ? 'text-red-500' : 
                      issue.status === IssueStatus.RESOLVED ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {issue.status}
                    </span>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
      case 'command':
      case 'report':
        return role === AppRole.CITIZEN ? renderCitizenDashboard() : renderAuthorityDashboard();
      case 'live':
        return <LiveReport user={user} onEnd={() => onViewChange('dashboard')} />;
      case 'map':
        return (
          <div className="h-[calc(100vh-140px)] animate-in zoom-in duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <MapInterface issues={issues} />
          </div>
        );
      case 'ai-road':
        return <RoadAI />;
      case 'ai-chat':
        return <AIChat user={user} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 dark:text-slate-500 opacity-50 space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse-slow shadow-xl">
               <Clock size={64} className="text-sky-500/50" />
             </div>
             <p className="text-2xl font-black italic tracking-wider text-slate-300 dark:text-slate-700 uppercase">Module Under Construction</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-10 animate-in fade-in slide-in-from-top duration-500 z-40 relative">
        <div className="relative w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search issues, tags, or departments..." 
            className="w-full glass bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all shadow-sm group-hover:shadow-lg"
          />
        </div>
        <div className="flex items-center gap-5">
          <button 
            type="button"
            className="relative glass p-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 border border-slate-200 dark:border-white/10"
            aria-label="Notifications"
          >
            <Bell size={22} className="animate-icon-neon" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-white/10 group focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-sky-500 transition-colors">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{role}</p>
              </div>
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg">
                   <img src={user.avatar} className="w-full h-full rounded-2xl object-cover border-2 border-white dark:border-slate-950" alt="" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-6 w-80 glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-300 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/90 z-50">
                <div className="flex flex-col items-center text-center mb-6">
                   <div className="w-24 h-24 rounded-full p-1 border-2 border-sky-500 story-border mb-4 shadow-xl">
                      <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                   <p className="text-xs text-sky-500 font-bold uppercase tracking-wider mb-2">{role}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user.followers || 0}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Followers</p>
                  </div>
                  <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer">
                    <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{user.following || 0}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Following</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Reputation</span>
                    <Award size={16} className="text-amber-500" />
                  </div>
                  <div className="w-full bg-amber-500/20 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-[10px] text-right text-amber-600 dark:text-amber-400 mt-2 font-mono font-bold">{user.reputation} Points</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {renderContent()}
    </div>
  );
};

export default Dashboard;
