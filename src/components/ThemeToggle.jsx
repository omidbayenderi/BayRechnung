import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Clock } from 'lucide-react';

const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();

  const themes = [
    { id: 'light', icon: Sun, label: 'Açık', color: 'text-amber-500' },
    { id: 'dark', icon: Moon, label: 'Koyu', color: 'text-indigo-400' },
    { id: 'system', icon: Monitor, label: 'Sistem', color: 'text-slate-400' },
    { id: 'auto', icon: Clock, label: 'Oto', color: 'text-emerald-400' },
  ];

  if (compact) {
    return (
      <div className="flex bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
        {themes.map((t) => {
          const TIcon = t.icon;
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => toggleTheme(t.id)}
              title={t.label}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/50 text-indigo-600 dark:text-indigo-400 scale-110' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <TIcon size={16} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block px-1">Görünüm Modu</label>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((t) => {
          const TIcon = t.icon;
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => toggleTheme(t.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 border-indigo-500/20 dark:border-indigo-400/20 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/20 scale-[1.02]' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <TIcon size={18} className={isActive ? t.color : 'text-slate-400'} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeToggle;
