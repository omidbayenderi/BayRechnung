import React, { useState } from 'react';
import {
    LayoutDashboard, Users, Construction, FileBarChart,
    MessageSquare, Settings, Bell, Search,
    Menu, Sparkles, Shield, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useInvoice } from '../../../context/InvoiceContext';
import './AdminCockpit.css';

// Import sub-components
import FinanceDashboard from './FinanceDashboard';
import UserManagement from './UserManagement';
import SiteWorkflow from './SiteWorkflow';
import ReportsCenter from './ReportsCenter';
import CommandCenter from './CommandCenter';

const AdminCockpit = () => {
    const { currentUser } = useAuth();
    const { messages } = useInvoice();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const unreadCount = messages.filter(m => !m.is_read).length;
    const userInitials = currentUser?.name
        ? currentUser.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
        : 'AD';

    const tabs = [
        { id: 'dashboard', name: 'Finans Dashboard', icon: LayoutDashboard },
        { id: 'users', name: 'Kullanıcı Yönetimi', icon: Users },
        { id: 'sites', name: 'Şantiye & İş Akışı', icon: Construction },
        { id: 'reports', name: 'Raporlar', icon: FileBarChart },
        { id: 'messages', name: 'Mesajlar', icon: MessageSquare },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <FinanceDashboard />;
            case 'users': return <UserManagement />;
            case 'sites': return <SiteWorkflow />;
            case 'reports': return <ReportsCenter />;
            case 'messages': return <CommandCenter />;
            default: return <FinanceDashboard />;
        }
    };

    return (
        <div className="cockpit-container flex h-screen overflow-hidden">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="border-r flex flex-col z-50 relative h-full"
                style={{ backgroundColor: 'var(--cockpit-sidebar)', borderColor: 'var(--cockpit-border)' }}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 cockpit-gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                        <Building2 size={24} />
                    </div>
                    {isSidebarOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="font-black text-xl tracking-tight"
                            style={{ color: 'var(--cockpit-text-main)' }}
                        >
                            BAY<span style={{ color: 'var(--cockpit-primary)' }}>RECHNUNG</span>
                        </motion.div>
                    )}
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto cockpit-scroll">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group"
                            style={{ 
                                backgroundColor: activeTab === tab.id ? 'var(--cockpit-primary-light)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--cockpit-primary)' : 'var(--cockpit-text-muted)',
                                fontWeight: activeTab === tab.id ? '700' : '500'
                            }}
                        >
                            <tab.icon size={20} style={{ color: activeTab === tab.id ? 'var(--cockpit-primary)' : '#94A3B8' }} />
                            {isSidebarOpen && <span>{tab.name}</span>}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full"
                                    style={{ backgroundColor: 'var(--cockpit-primary)' }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--cockpit-border)' }}>
                    <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ backgroundColor: 'var(--cockpit-bg)', borderColor: 'var(--cockpit-border)' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: 'var(--cockpit-primary)' }}>
                            {userInitials}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate" style={{ color: 'var(--cockpit-text-main)' }}>{currentUser?.name || 'Admin'}</p>
                                <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--cockpit-primary)' }}>
                                    <Shield size={10} /> {currentUser?.role || 'admin'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Wrapper */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 border-b px-8 flex items-center justify-between shrink-0" style={{ backgroundColor: 'var(--cockpit-sidebar)', borderColor: 'var(--cockpit-border)' }}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            style={{ color: 'var(--cockpit-text-muted)' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ backgroundColor: 'var(--cockpit-bg)', borderColor: 'var(--cockpit-border)', color: 'var(--cockpit-text-muted)' }}>
                            <Search size={16} />
                            <span className="text-sm">Hızlı arama...</span>
                            <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border ml-4" style={{ borderColor: 'var(--cockpit-border)' }}>⌘K</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'var(--cockpit-primary-light)', borderColor: 'rgba(79, 70, 229, 0.1)' }}>
                            <Sparkles size={16} style={{ color: 'var(--cockpit-primary)' }} />
                            <span className="text-xs font-bold" style={{ color: 'var(--cockpit-primary)' }}>BayGuard AI Aktif</span>
                        </div>
                        <div className="w-px h-6" style={{ backgroundColor: 'var(--cockpit-border)' }}></div>
                        <div className="flex items-center gap-4">
                            <button className="relative transition-colors" style={{ color: 'var(--cockpit-text-muted)' }} onClick={() => setActiveTab('messages')}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 flex items-center justify-center px-0.5" style={{ borderColor: 'var(--cockpit-sidebar)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button className="transition-colors" style={{ color: 'var(--cockpit-text-muted)' }}>
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Viewport */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 cockpit-scroll">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-[1400px] mx-auto w-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminCockpit;
