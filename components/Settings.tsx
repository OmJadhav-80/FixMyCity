
import React from 'react';
import { Languages, Shield, Bell, Globe, Moon, Monitor, Check, Smartphone, Info, Sun, Palette } from 'lucide-react';
import { Language, translations } from '../translations';

interface SettingsProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

const Settings: React.FC<SettingsProps> = ({ language, onLanguageChange, theme, onThemeChange }) => {
  const t = translations[language];

  const languages = [
    { code: 'EN', name: 'English', sub: 'Default' },
    { code: 'MR', name: 'मराठी', sub: 'Marathi' },
    { code: 'HI', name: 'हिन्दी', sub: 'Hindi' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.settings}</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your FixMyCity experience and identity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500 dark:text-sky-400">
              <Languages size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.language}</h3>
          </div>
          
          <div className="space-y-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code as Language)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  language === lang.code 
                    ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400' 
                    : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-sky-500/30 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold">{lang.name}</p>
                  <p className="text-[10px] uppercase opacity-60 font-mono">{lang.sub}</p>
                </div>
                {language === lang.code && <Check size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 dark:text-purple-400">
              <Palette size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.theme}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => onThemeChange('light')}
               className={`p-6 border rounded-2xl flex flex-col items-center gap-3 transition-all ${
                 theme === 'light'
                   ? 'bg-white shadow-xl border-sky-500 ring-1 ring-sky-500'
                   : 'bg-white/50 border-slate-200 hover:bg-white hover:shadow-lg'
               }`}
             >
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                   <Sun size={24} />
                </div>
                <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-500'}`}>Light Mode</span>
             </button>

             <button 
               onClick={() => onThemeChange('dark')}
               className={`p-6 border rounded-2xl flex flex-col items-center gap-3 transition-all ${
                 theme === 'dark'
                   ? 'bg-slate-800 shadow-xl border-sky-500 ring-1 ring-sky-500'
                   : 'bg-slate-900/40 border-white/5 hover:bg-slate-800'
               }`}
             >
                <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
                   <Moon size={24} />
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>Dark Mode</span>
             </button>
          </div>
        </div>

        {/* Region & Location */}
        <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 dark:text-indigo-400">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.region}</h3>
          </div>
          
          <div className="p-4 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-white/5">
             <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Jurisdiction</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold uppercase">Solapur</span>
             </div>
             <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">{t.solapurRegion}</p>
             <p className="text-xs text-slate-500">Maharashtra State, India</p>
             <button className="mt-4 w-full py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-all">
                Change Region
             </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 dark:text-amber-400">
              <Bell size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.notifications}</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Critical Safety Alerts', desc: 'Instant pings for road closures or emergencies', checked: true },
              { label: 'Repair Progress', desc: 'Updates on issues you followed or reported', checked: true },
              { label: 'City Announcements', desc: 'Department bulletins and water cuts', checked: false },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{n.label}</p>
                  <p className="text-xs text-slate-500">{n.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${n.checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${n.checked ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility & Display */}
        <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-500 dark:text-pink-400">
              <Monitor size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.accessibility}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <button className="p-4 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-sky-500/30 transition-all">
                <Moon size={20} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-white">High Contrast</span>
             </button>
             <button className="p-4 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-sky-500/30 transition-all">
                <Monitor size={20} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-white">Large Text</span>
             </button>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
             <div className="flex items-center gap-3 mb-2">
                <Info size={16} className="text-sky-500 dark:text-sky-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Version Info</span>
             </div>
             <p className="text-xs text-slate-500 font-mono">App Build: 2.1.0-Solapur-Stable</p>
             <p className="text-xs text-slate-500 font-mono">Engine: AI-V8-RoadIntel</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 pb-12">
         <button className="px-8 py-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-2xl transition-all">
           Reset Default
         </button>
         <button className="px-12 py-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 transition-all">
           {t.saveChanges}
         </button>
      </div>
    </div>
  );
};

export default Settings;
