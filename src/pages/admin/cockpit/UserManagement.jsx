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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-slate-500 font-medium">Ekip üyeleri, roller ve şantiye yetkilendirmeleri</p>
                </div>
                <button
                    onClick={() => setShowForm(f => !f)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
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
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={26} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
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
                        className="bg-white p-8 rounded-[2rem] border-2 border-indigo-50 shadow-xl space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <UserPlus size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">Yeni Personel Tanımla</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">AD SOYAD</label>
                                <input
                                    type="text" placeholder="Mehmet Yılmaz" required
                                    value={newEmp.name}
                                    onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">E-POSTA</label>
                                <input
                                    type="email" placeholder="mehmet@firma.com"
                                    value={newEmp.email}
                                    onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">ROL</label>
                                <select
                                    value={newEmp.role}
                                    onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all appearance-none"
                                >
                                    <option value="Worker">Saha Personeli</option>
                                    <option value="site_lead">Şantiye Şefi</option>
                                    <option value="finance">Muhasebe</option>
                                    <option value="admin">Yönetici (Admin)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 ml-1">ŞANTİYE ATAMASI</label>
                                <select
                                    value={newEmp.site_id}
                                    onChange={e => setNewEmp(p => ({ ...p, site_id: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm border-2 border-transparent focus:border-indigo-400 focus:bg-white outline-none transition-all appearance-none"
                                >
                                    <option value="">Tüm Şantiyeler (Genel)</option>
                                    {sites?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                             <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Vazgeç</button>
                             <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Personeli Kaydet</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Table / List View */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="İsim, e-post veya rol ile filtrele..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 bg-white hover:bg-slate-50 rounded-2xl text-sm font-bold transition-colors border border-slate-200">
                            <Filter size={18} /> Filtrele
                        </button>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-slate-200" />
                        </div>
                        <p className="font-black text-slate-900 text-xl tracking-tight">Eşleşen personel bulunamadı</p>
                        <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">Arama kriterlerini değiştirerek tekrar deneyebilir veya yeni bir personel ekleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto cockpit-scroll">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                    <th className="px-8 py-4">Personel Detayları</th>
                                    <th className="px-8 py-4">Rol & Yetki</th>
                                    <th className="px-8 py-4">Bağlı Şantiye</th>
                                    <th className="px-8 py-4">Durum</th>
                                    <th className="px-8 py-4 text-right">Eylemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(emp => {
                                    const roleConf = ROLE_CONFIG[emp.role] || ROLE_CONFIG['Worker'];
                                    const RoleIcon = roleConf.icon;
                                    const assignedSite = sites?.find(s => s.id === emp.site_id)?.name || 'Merkez Ofis';
                                    
                                    return (
                                        <tr key={emp.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-inner group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: emp.color || '#6366f1' }}
                                                    >
                                                        {emp.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 tracking-tight">{emp.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Mail size={12} className="text-slate-400" />
                                                            <p className="text-xs text-slate-400 font-medium">{emp.email || 'tanımsız@firma.com'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-${roleConf.color}-50 text-${roleConf.color}-700 w-fit text-[11px] font-black border border-${roleConf.color}-100 uppercase tracking-wider`}>
                                                    <RoleIcon size={14} />
                                                    {roleConf.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                                    <Building2 size={14} className="text-slate-400" />
                                                    {assignedSite}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <button
                                                    onClick={() => toggleStatus(emp)}
                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        (emp.status === 'Active' || emp.status === 'Aktif') 
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {(emp.status === 'Active' || emp.status === 'Aktif') ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                    {(emp.status === 'Active' || emp.status === 'Aktif') ? 'Aktif' : 'Pasif'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><UserCog size={18} /></button>
                                                    <button
                                                        onClick={() => deleteEmployee(emp.id)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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

                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Görüntülenen: {filtered.length} Personel</p>
                    <div className="flex gap-2">
                         <button className="p-1.5 text-slate-400 hover:text-slate-600"><MapPin size={16} /></button>
                         <button className="p-1.5 text-slate-400 hover:text-slate-600"><Phone size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

