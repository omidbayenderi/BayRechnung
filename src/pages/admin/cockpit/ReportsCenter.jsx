import React, { useState } from 'react';
import { 
    FileText, FileBarChart, Download, Search, Filter, 
    Calendar, FolderOpen, HardHat, Package, PieChart,
    ChevronRight, FileSpreadsheet, Plus, Star,
    Clock, MoreVertical, ExternalLink, ShieldCheck,
    Briefcase, FileArchive, Share2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reportCategories = [
    { id: 'daily', name: 'Şantiye Defteri', icon: HardHat, count: 124, lastDate: 'Bugün', color: 'bg-indigo-500' },
    { id: 'finance', name: 'Mali Raporlar', icon: FileBarChart, count: 12, lastDate: 'Dün', color: 'bg-emerald-500' },
    { id: 'stock', name: 'Stok Envanter', icon: Package, count: 48, lastDate: '2 Haz', color: 'bg-amber-500' },
    { id: 'progress', name: 'Hakediş & İlerleme', icon: PieChart, count: 8, lastDate: '1 Haz', color: 'bg-rose-500' },
    { id: 'legal', name: 'Hukuki / İzinler', icon: ShieldCheck, count: 22, lastDate: '12 May', color: 'bg-slate-700' },
];

const ReportsCenter = () => {
    const [activeCategory, setActiveCategory] = useState('daily');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 cockpit-gradient-primary rounded-lg flex items-center justify-center text-white shadow-lg">
                            <FileArchive size={18} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Dokümantasyon</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Raporlar & Arşiv</h1>
                    <p className="text-slate-500 font-medium">Kurumsal hafıza ve dijital saha raporları</p>
                </div>
                <button className="px-8 py-4 cockpit-gradient-primary text-white rounded-[1.5rem] shadow-xl shadow-indigo-100/50 font-black flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-tight">
                    <Plus size={20} />
                    Yeni Rapor
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 p-8 space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Kategoriler</h3>
                        <div className="space-y-2">
                            {reportCategories.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all duration-300 group ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 shadow-offset-y-4' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-tight">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'} transition-colors`}>
                                            <cat.icon size={16} className={activeCategory === cat.id ? 'text-white' : 'text-slate-400'} />
                                        </div>
                                        {cat.name}
                                    </div>
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black transition-colors ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {cat.count}
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50">
                            <div className="bg-indigo-50/50 rounded-[2rem] p-6">
                                <h4 className="text-[10px] font-black text-indigo-900 flex items-center gap-2 mb-3 uppercase tracking-widest">
                                    <Briefcase size={12} />
                                    Hızlı Arşiv
                                </h4>
                                <p className="text-[11px] text-indigo-700/70 font-bold mb-4 leading-relaxed">Projeye göre gruplanmış raporlar için seçim yapın.</p>
                                <div className="relative">
                                    <select className="w-full bg-white border border-indigo-100 rounded-2xl py-3 px-4 text-xs font-black text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer">
                                        <option>Proje Seçiniz</option>
                                        <option>BayPark Residence</option>
                                        <option>Koru Villaları</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-indigo-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-sm font-black mb-2 flex items-center gap-2 text-indigo-400 uppercase tracking-widest">
                            <Star size={16} />
                            Premium Depolama
                        </h4>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-6">Tüm şantiyeler için sınırsız bulut arşivleme aktif.</p>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                            <span>Kullanım</span>
                            <span>%42</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[42%] rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Rapor ismi, tarih veya ekip ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="p-4 bg-slate-50 rounded-3xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                    <Filter size={20} />
                                </button>
                                <button className="p-4 bg-slate-50 rounded-3xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                    <Calendar size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            <ReportRow name="Günlük Şantiye Raporu - B Blok" date="03 Haz 2026" author="Mehmet Demir" size="2.4 MB" type="pdf" tags={['Saha', 'Hava Durumu']} />
                            <ReportRow name="Beton Döküm Tutanağı - Temel" date="02 Haz 2026" author="Mehmet Demir" size="1.1 MB" type="pdf" tags={['İmalat']} />
                            <ReportRow name="Haftalık Personel Puantajı" date="01 Haz 2026" author="Selin Kaya" size="840 KB" type="xlsx" tags={['İK', 'Puantaj']} />
                            <ReportRow name="Malzeme Sevkiyat Formu #442" date="31 May 2026" author="Can Özkan" size="1.8 MB" type="pdf" tags={['Lojistik']} />
                            <ReportRow name="Zemin Etüdü Özet Raporu" date="28 May 2026" author="Ahmet Yılmaz" size="4.6 MB" type="pdf" tags={['Mühendislik']} />
                            <ReportRow name="Mayıs Ayı Hakediş Dosyası" date="25 May 2026" author="Selin Kaya" size="12.4 MB" type="zip" tags={['Finans', 'Resmi']} />
                        </div>

                        <div className="p-8 bg-slate-50/30 flex justify-center">
                            <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-all flex items-center gap-2 py-2 px-6 bg-white rounded-full border border-slate-100 shadow-sm hover:shadow-md">
                                Eski Raporları Yükle 
                                <ChevronRight size={14} className="rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportRow = ({ name, date, author, size, type, tags }) => (
    <div className="p-6 md:p-8 flex items-center justify-between hover:bg-indigo-50/20 transition-all group cursor-pointer border-l-4 border-transparent hover:border-indigo-500">
        <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${type === 'pdf' ? 'bg-rose-50 text-rose-500 shadow-rose-100/50' : type === 'xlsx' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100/50' : 'bg-blue-50 text-blue-500 shadow-blue-100/50'}`}>
                {type === 'pdf' ? <FileText size={24} /> : type === 'xlsx' ? <FileSpreadsheet size={24} /> : <FileArchive size={24} />}
            </div>
            <div>
                <div className="flex items-center gap-3 mb-1.5">
                    <h4 className="text-[15px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{name}</h4>
                    <div className="flex gap-1">
                        {tags?.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 hover:text-slate-600">
                        <Calendar size={12} className="text-slate-300" />
                        {date}
                    </span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <span className="flex items-center gap-1.5 hover:text-slate-600">
                        <User size={12} className="text-slate-300" />
                        {author}
                    </span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <span className="text-slate-300">{size}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all opacity-0 group-hover:opacity-100">
                <Download size={18} />
            </button>
            <button className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all opacity-0 group-hover:opacity-100">
                <Share2 size={18} />
            </button>
            <button className="p-3 bg-white border border-slate-100 shadow-sm rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <MoreVertical size={18} />
            </button>
        </div>
    </div>
);

const User = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" strokeWidth="2" 
        strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export default ReportsCenter;

