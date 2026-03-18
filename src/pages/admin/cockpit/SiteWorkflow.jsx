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
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 cockpit-gradient-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                            <Briefcase size={18} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Saha Yönetimi</span>
                    </div>
                    <h1 className="text-3xl font-black text-main tracking-tight">Şantiyeler & İş Akışı</h1>
                    <p className="text-muted font-medium">Projelerin canlı takibi ve operasyonel verimlilik</p>
                </div>
                <div className="flex bg-card p-1.5 rounded-2xl border border-white/5 shadow-xl shadow-black/10 shrink-0">
                    {[
                        { id: 'grid', icon: LayoutGrid, label: 'Kılavuz' },
                        { id: 'kanban', icon: Kanban, label: 'Kanban' },
                        { id: 'gantt', icon: CalendarIcon, label: 'Zaman' }
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            onClick={() => setView(btn.id)}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${view === btn.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-muted hover:text-main'}`}
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Proje veya şantiye ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-card border border-white/5 rounded-[1.5rem] shadow-xl shadow-black/5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-main"
                    />
                </div>
                <button className="px-6 py-4 bg-card border border-white/5 rounded-[1.5rem] shadow-xl shadow-black/5 flex items-center gap-3 text-muted font-bold hover:bg-white/5 transition-all">
                    <Filter size={18} />
                    Filtrele
                </button>
                <button className="px-8 py-4 cockpit-gradient-primary text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/20 font-black flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-tight">
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
                        <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-muted hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer group">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                                <Plus size={32} />
                            </div>
                            <p className="font-black uppercase text-xs tracking-widest text-center">Yeni Proje Ekle</p>
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
                        <KanbanColumn title="Planlama" status="planning" projects={[]} color="bg-indigo-300" />
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
                        className="bg-card rounded-[2.5rem] border border-white/5 shadow-xl shadow-black/10 p-10 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-main tracking-tight">Timeline Projeksiyonu</h3>
                                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Gantt Görünümü Demo</p>
                            </div>
                            <div className="flex gap-2">
                                {['H', 'A', 'Y'].map(t => (
                                    <button key={t} className="w-8 h-8 rounded-lg text-[10px] font-black uppercase text-muted hover:bg-white/5 transition-all">{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-12">
                            {filteredProjects.map((p, idx) => (
                                <div key={p.id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-card border border-white/5 flex items-center justify-center text-muted text-xs font-black">0{idx + 1}</div>
                                            <span className="text-sm font-black text-main uppercase tracking-tight">{p.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Bitiş: {new Date(p.end).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="h-6 bg-card border border-white/5 rounded-full relative p-1 group">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.progress}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-end px-3"
                                        >
                                            <span className="text-[9px] font-black text-white">%{p.progress}</span>
                                        </motion.div>
                                        <div className="absolute top-0 left-0 w-full h-full border-x-2 border-white/5 pointer-events-none grid grid-cols-4">
                                            {Array.from({length: 4}).map((_, i) => <div key={i} className="border-r border-white/5"></div>)}
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
        className="bg-card rounded-[2.5rem] border border-white/5 shadow-xl shadow-black/10 overflow-hidden group"
    >
        <div className="h-48 relative overflow-hidden">
            <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
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
                <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest text-muted">
                    <span>Saha İlerlemesi</span>
                    <span className="text-indigo-500">%{project.progress}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-md"
                    ></motion.div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted">
                    <span>{project.stage}</span>
                    <span className="flex items-center gap-1 text-emerald-500">
                        <Activity size={10} />
                        Canlı Akış
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="team" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white/10 bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-500">
                        +5
                    </div>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 group/btn">
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
                <div className={`w-3 h-3 rounded-full ${color} shadow-lg animate-pulse`}></div>
                <h3 className="text-sm font-black text-main uppercase tracking-widest">{title}</h3>
                <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-muted text-[10px] font-black rounded-lg shadow-sm">{projects.length}</span>
            </div>
            <button className="p-2 text-muted hover:text-main transition-colors">
                <Settings2 size={16} />
            </button>
        </div>
        <div className="space-y-6 flex-1 bg-black/5 p-4 rounded-[2.5rem] border border-white/5 min-h-[500px]">
            {projects.map(p => (
                <div key={p.id} className="bg-card p-6 rounded-[2rem] shadow-xl shadow-black/5 border border-white/5 hover:border-indigo-500/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                            {p.category}
                        </span>
                        <Bookmark size={14} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black text-main tracking-tight group-hover:text-indigo-500 transition-colors uppercase leading-tight mb-2">{p.name}</h4>
                    <p className="text-[11px] text-muted font-bold mb-4">{p.stage}</p>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${p.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            Hafta 12
                        </div>
                        <div className="flex -space-x-2">
                            {[1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border border-card bg-white/10"></div>)}
                        </div>
                    </div>
                </div>
            ))}
            <button className="w-full py-5 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-[10px] font-black text-muted uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-500 hover:bg-white/10 transition-all">
                + Kart Ekle
            </button>
        </div>
    </div>
);

export default SiteWorkflow;

