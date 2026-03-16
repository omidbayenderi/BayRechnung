import React, { useState, useMemo } from 'react';
import { 
    LayoutGrid, List, Kanban, Calendar as CalendarIcon, 
    MoreVertical, ArrowRight, User, Users, Clock, 
    CheckCircle, AlertTriangle, Play, Plus, Search,
    Filter, Layout, Activity, Briefcase, Settings2,
    Calendar, ChevronRight, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
    { 
        id: 1, 
        name: 'BayPark Residence', 
        progress: 65, 
        status: 'ongoing', 
        team: 12, 
        end: '2026-12-24', 
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=600',
        stage: 'İnce İşler',
        category: 'Konut',
        priority: 'high'
    },
    { 
        id: 2, 
        name: 'Koru Villaları', 
        progress: 32, 
        status: 'ongoing', 
        team: 8, 
        end: '2027-06-15', 
        image: 'https://images.unsplash.com/photo-1448630327803-d6bd95ef85a1?auto=format&fit=crop&q=80&w=600',
        stage: 'Kaba İnşaat',
        category: 'Villa',
        priority: 'medium'
    },
    { 
        id: 3, 
        name: 'Merkez Plaza', 
        progress: 95, 
        status: 'review', 
        team: 4, 
        end: '2026-07-30', 
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
        stage: 'Teslimat',
        category: 'Ofis',
        priority: 'low'
    },
];

const SiteWorkflow = () => {
    const [view, setView] = useState('grid'); // grid, kanban, gantt
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = useMemo(() => 
        projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery]
    );

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 cockpit-gradient-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Briefcase size={18} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Saha Yönetimi</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Şantiyeler & İş Akışı</h1>
                    <p className="text-slate-500 font-medium">Projelerin canlı takibi ve operasyonel verimlilik</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    {[
                        { id: 'grid', icon: LayoutGrid, label: 'Kılavuz' },
                        { id: 'kanban', icon: Kanban, label: 'Kanban' },
                        { id: 'gantt', icon: CalendarIcon, label: 'Zaman' }
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setView(btn.id)}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${view === btn.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <btn.icon size={14} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Proje veya şantiye ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl shadow-slate-100/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <button className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl shadow-slate-100/50 flex items-center gap-3 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                    <Filter size={18} />
                    Filtrele
                </button>
                <button className="px-8 py-4 cockpit-gradient-primary text-white rounded-[1.5rem] shadow-xl shadow-indigo-100/50 font-black flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-tight">
                    <Plus size={20} />
                    Yeni Şantiye
                </button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'grid' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProjects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                        <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                                <Plus size={32} />
                            </div>
                            <p className="font-black uppercase text-xs tracking-widest">Yeni Proje Ekle</p>
                        </div>
                    </motion.div>
                )}

                {view === 'kanban' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide"
                    >
                        <KanbanColumn title="Planlama" status="planning" projects={[]} color="bg-slate-400" />
                        <KanbanColumn title="Aktif Şantiye" status="ongoing" projects={filteredProjects.filter(p => p.status === 'ongoing')} color="bg-indigo-500" />
                        <KanbanColumn title="Denetim" status="review" projects={filteredProjects.filter(p => p.status === 'review')} color="bg-amber-400" />
                        <KanbanColumn title="Bitenler" status="completed" projects={[]} color="bg-emerald-500" />
                    </motion.div>
                )}

                {view === 'gantt' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-10 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Timeline Projeksiyonu</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gantt Görünümü Demo</p>
                            </div>
                            <div className="flex gap-2">
                                {['H', 'A', 'Y'].map(t => (
                                    <button key={t} className="w-8 h-8 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all">{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-12">
                            {filteredProjects.map((p, idx) => (
                                <div key={p.id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-black">0{idx + 1}</div>
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Bitiş: {new Date(p.end).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="h-6 bg-slate-50 rounded-full relative p-1 group">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.progress}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-lg shadow-indigo-200/50 flex items-center justify-end px-3"
                                        >
                                            <span className="text-[9px] font-black text-white">%{p.progress}</span>
                                        </motion.div>
                                        <div className="absolute top-0 left-0 w-full h-full border-x-2 border-slate-100/50 pointer-events-none grid grid-cols-4">
                                            {Array.from({length: 4}).map((_, i) => <div key={i} className="border-r border-slate-100/50"></div>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProjectCard = ({ project }) => (
    <motion.div 
        whileHover={{ y: -8 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden group"
    >
        <div className="h-48 relative overflow-hidden">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute top-6 right-6 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-lg">
                    {project.category}
                </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl font-black text-white tracking-tight uppercase leading-tight mb-2">{project.name}</h3>
                <div className="flex items-center gap-3 text-white/80 text-[11px] font-bold">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-indigo-300" />
                        <span>{new Date(project.end).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-indigo-300" />
                        <span>{project.team} Aktif</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="p-8">
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span>Saha İlerlemesi</span>
                    <span className="text-indigo-600">%{project.progress}</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-md"
                    ></motion.div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{project.stage}</span>
                    <span className="flex items-center gap-1 text-emerald-500">
                        <Activity size={10} />
                        Canlı Akış
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="team" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                        +5
                    </div>
                </div>
                <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 group/btn">
                    Yönet
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    </motion.div>
);

const KanbanColumn = ({ title, status, projects, color }) => (
    <div className="min-w-[340px] flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color} shadow-lg shadow-${color.split('-')[1]}-200 animate-pulse`}></div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
                <span className="px-2 py-0.5 bg-white border border-slate-100 text-slate-400 text-[10px] font-black rounded-lg shadow-sm">{projects.length}</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings2 size={16} />
            </button>
        </div>
        <div className="space-y-6 flex-1 bg-slate-50/50 p-4 rounded-[2.5rem] border border-slate-100 min-h-[500px]">
            {projects.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 hover:border-indigo-100 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                            {p.category}
                        </span>
                        <Bookmark size={14} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight mb-2">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 font-bold mb-4">{p.stage}</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${p.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            Hafta 12
                        </div>
                        <div className="flex -space-x-2">
                            {[1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200"></div>)}
                        </div>
                    </div>
                </div>
            ))}
            <button className="w-full py-5 bg-white border border-dashed border-slate-200 rounded-[2rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-500 transition-all">
                + Kart Ekle
            </button>
        </div>
    </div>
);

export default SiteWorkflow;

