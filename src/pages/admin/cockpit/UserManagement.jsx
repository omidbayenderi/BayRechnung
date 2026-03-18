import { useState } from 'react';
import {
    Users, Search, UserPlus, Filter, MoreVertical,
    Shield, Briefcase, CheckCircle2, XCircle,
    UserCheck, UserCog, MapPin, Mail, Phone,
    Building2, Activity, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoice } from '../../../context/InvoiceContext';

const ROLE_CONFIG = {
    'admin': { label: 'Yönetici', color: 'indigo', icon: ShieldCheck },
    'Admin': { label: 'Yönetici', color: 'indigo', icon: ShieldCheck },
    'site_lead': { label: 'Şantiye Şefi', color: 'amber', icon: HardHatIcon },
    'finance': { label: 'Muhasebe', color: 'emerald', icon: Activity },
    'Worker': { label: 'Saha Personeli', color: 'blue', icon: Briefcase },
    'worker': { label: 'Saha Personeli', color: 'blue', icon: Briefcase }
};

function HardHatIcon({ size, className }) {
    return (
        <svg 
            width={size} height={size} viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
            strokeLinejoin="round" className={className}
        >
            <path d="M2 18V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v9" />
            <path d="M9 21v-3" />
            <path d="M15 21v-3" />
            <path d="M22 18H2" />
            <path d="M12 7V2" />
        </svg>
    );
}

const UserManagement = () => {
    const { employees, saveEmployee, deleteEmployee, updateEmployee, sites } = useInvoice();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newEmp, setNewEmp] = useState({ 
        name: '', 
        email: '', 
        role: 'Worker', 
        status: 'Active',
        site_id: ''
    });

    const filtered = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = employees.filter(e => e.status === 'Active' || e.status === 'Aktif').length;
    const managerCount = employees.filter(e => ['Admin', 'Manager', 'admin', 'site_lead'].includes(e.role)).length;

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newEmp.name) return;
        await saveEmployee(newEmp);
        setNewEmp({ name: '', email: '', role: 'Worker', status: 'Active', site_id: '' });
        setShowForm(false);
    };

    const toggleStatus = (emp) => {
        const next = (emp.status === 'Active' || emp.status === 'Aktif') ? 'Inactive' : 'Active';
        updateEmployee(emp.id, { status: next });
    };

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-main tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-muted font-medium">Ekip üyeleri, roller ve şantiye yetkilendirmeleri</p>
                </div>
                <button
                    onClick={() => setShowForm(f => !f)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                    <UserPlus size={18} />
                    Yeni Personel Ekle
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Toplam Personel', value: employees.length, icon: Users, color: 'indigo', trend: '+2 bu ay' },
                    { label: 'Aktif Personel', value: activeCount, icon: UserCheck, color: 'emerald', trend: '%95 aktiflik' },
                    { label: 'Yönetim Kadrosu', value: managerCount, icon: UserCog, color: 'amber', trend: '4 birim' },
                ].map(stat => (
                    <div key={stat.label} className="bg-card p-6 rounded-3xl border border-white/5 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-indigo-500/20 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={26} />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-main">{stat.value}</p>
                            </div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-lg`}>
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Employee Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleAdd} 
                        className="bg-card p-8 rounded-[2rem] border-2 border-indigo-500/10 shadow-2xl shadow-black/20 space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <UserPlus size={20} />
                            </div>
                            <h3 className="text-lg font-black text-main">Yeni Personel Tanımla</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted ml-1 uppercase tracking-tighter">AD SOYAD</label>
                                <input
                                    type="text" placeholder="Mehmet Yılmaz" required
                                    value={newEmp.name}
                                    onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-sm border-2 border-white/5 focus:border-indigo-500 focus:bg-white/10 outline-none transition-all text-main placeholder:text-muted/40"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted ml-1 uppercase tracking-tighter">E-POSTA</label>
                                <input
                                    type="email" placeholder="mehmet@firma.com"
                                    value={newEmp.email}
                                    onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-sm border-2 border-white/5 focus:border-indigo-500 focus:bg-white/10 outline-none transition-all text-main placeholder:text-muted/40"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted ml-1 uppercase tracking-tighter">ROL</label>
                                <select
                                    value={newEmp.role}
                                    onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-sm border-2 border-white/5 focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none text-main"
                                >
                                    <option value="Worker" className="bg-card text-main">Saha Personeli</option>
                                    <option value="site_lead" className="bg-card text-main">Şantiye Şefi</option>
                                    <option value="finance" className="bg-card text-main">Muhasebe</option>
                                    <option value="admin" className="bg-card text-main">Yönetici (Admin)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted ml-1 uppercase tracking-tighter">ŞANTİYE ATAMASI</label>
                                <select
                                    value={newEmp.site_id}
                                    onChange={e => setNewEmp(p => ({ ...p, site_id: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 rounded-xl text-sm border-2 border-white/5 focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none text-main"
                                >
                                    <option value="" className="bg-card text-main">Tüm Şantiyeler (Genel)</option>
                                    {sites?.map(s => <option key={s.id} value={s.id} className="bg-card text-main">{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                             <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/5 text-muted rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Vazgeç</button>
                             <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all">Personeli Kaydet</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Table / List View */}
            <div className="bg-card rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between bg-black/5">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="İsim, e-post veya rol ile filtrele..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-main placeholder:text-muted/40"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 text-muted bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-colors border border-white/5">
                            <Filter size={18} /> Filtrele
                        </button>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-white/10" />
                        </div>
                        <p className="font-black text-main text-xl tracking-tight uppercase">Eşleşen personel bulunamadı</p>
                        <p className="text-muted mt-2 max-w-xs mx-auto text-sm">Arama kriterlerini değiştirerek tekrar deneyebilir veya yeni bir personel ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto cockpit-scroll">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/2 text-muted uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/5">
                                    <th className="px-8 py-5">Personel Detayları</th>
                                    <th className="px-8 py-5">Rol & Yetki</th>
                                    <th className="px-8 py-5">Bağlı Şantiye</th>
                                    <th className="px-8 py-5">Durum</th>
                                    <th className="px-8 py-5 text-right">Eylemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(emp => {
                                    const roleConf = ROLE_CONFIG[emp.role] || ROLE_CONFIG['Worker'];
                                    const RoleIcon = roleConf.icon;
                                    const assignedSite = sites?.find(s => s.id === emp.site_id)?.name || 'Merkez Ofis';
                                    
                                    return (
                                        <tr key={emp.id} className="group hover:bg-white/2 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-inner group-hover:scale-110 transition-transform border border-white/10"
                                                        style={{ backgroundColor: emp.color || '#6366f1' }}
                                                    >
                                                        {emp.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-main tracking-tight uppercase leading-tight">{emp.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Mail size={12} className="text-muted/60" />
                                                            <p className="text-[11px] text-muted font-bold tracking-tight">{emp.email || 'tanımsız@firma.com'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-${roleConf.color}-500/10 text-${roleConf.color}-500 w-fit text-[11px] font-black border border-${roleConf.color}-500/10 uppercase tracking-wider`}>
                                                    <RoleIcon size={14} />
                                                    {roleConf.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-muted font-bold text-xs uppercase tracking-tight">
                                                    <Building2 size={14} className="text-muted/40" />
                                                    {assignedSite}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => toggleStatus(emp)}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        (emp.status === 'Active' || emp.status === 'Aktif') 
                                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10' 
                                                        : 'bg-white/5 text-muted hover:bg-white/10'
                                                    }`}
                                                >
                                                    {(emp.status === 'Active' || emp.status === 'Aktif') ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                    {(emp.status === 'Active' || emp.status === 'Aktif') ? 'Aktif' : 'Pasif'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button className="p-2.5 text-muted/60 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"><UserCog size={18} /></button>
                                                    <button
                                                        onClick={() => deleteEmployee(emp.id)}
                                                        className="p-2.5 text-muted/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-8 py-6 bg-black/5 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[11px] font-black text-muted uppercase tracking-widest">Görüntülenen: {filtered.length} Personel</p>
                    <div className="flex gap-2">
                         <button className="p-1.5 text-muted hover:text-indigo-500 transition-colors"><MapPin size={16} /></button>
                         <button className="p-1.5 text-muted hover:text-indigo-500 transition-colors"><Phone size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

