import React, { useState, useEffect } from 'react';
import { Shield, Zap, Bug, Users, Activity, Lock, Terminal, AlertTriangle, CheckCircle, RefreshCw, Globe, ChevronRight, X, Database, AlertCircle, LayoutDashboard } from 'lucide-react';
import FeatureManagementView from '../../components/admin/FeatureManagementView';
import UserLogsView from '../../components/admin/UserLogsView';
import LandingPageDashboardView from '../../components/admin/LandingPageDashboardView';
import { useBayGuard } from '../../context/BayGuardContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';



const DeveloperControlCenter = () => {
    const { logs: localLogs, interventions, mtdState, rotateMtdTargets, addLog, clearLogs } = useBayGuard();
    const { currentUser, logSecurityAction } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // overview, security, users, logs, testing
    const [statFlash, setStatFlash] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [testStatus, setTestStatus] = useState('Idle');
    const [persistentLogCount, setPersistentLogCount] = useState(0);
    const [severityCounts, setSeverityCounts] = useState({ critical: 0, warning: 0, info: 0 });

    const fetchLogStats = async () => {
        try {
            const { count, error } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true });
            if (!error) setPersistentLogCount(count || 0);

            // Fetch severity breakdown
            const { data: critData } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('severity', 'critical');
            const { data: warnData } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('severity', 'warning');
            const { data: infoData } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('severity', 'info');

            setSeverityCounts({
                critical: critData?.length || 0,
                warning: warnData?.length || 0,
                info: infoData?.length || 0
            });
        } catch (err) {
            console.error('[DCC] Failed to fetch log stats:', err);
        }
    };

    useEffect(() => {
        fetchLogStats();
        const interval = setInterval(fetchLogStats, 30000); // Sync count every 30s
        return () => clearInterval(interval);
    }, []);

    // Stress Test Logic
    const triggerRuntimeError = () => {
        setTestStatus('Triggering Runtime Error...');
        throw new Error("DCC Manual Stress Test: Runtime Error");
    };

    const triggerQuotaError = () => {
        setTestStatus('Simulating Quota Exceeded...');
        try {
            const bigData = new Array(1000000).join('A');
            for (let i = 0; i < 100; i++) {
                localStorage.setItem('dcc_quota_test_' + i, bigData);
            }
        } catch (e) {
            console.error("DCC Quota Simulation Catch:", e);
            throw e;
        }
    };

    const triggerInfiniteLoop = () => {
        setTestStatus('Simulating Loop Re-renders...');
        throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
    };

    const triggerUnhandledRejection = () => {
        setTestStatus('Triggering Promise Rejection...');
        new Promise((resolve, reject) => {
            reject("DCC Manual Stress Test: Promise Rejected");
        });
    };

    // Live User registry state
    const [userRegistry, setUserRegistry] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            console.log('[DCC] Fetching real user registry from Supabase...');
            const { data, error } = await supabase
                .from('users')
                .select(`
                    id, 
                    email, 
                    full_name, 
                    created_at,
                    subscriptions(plan_type, status)
                `);

            if (error) throw error;

            const formattedUsers = data.map(u => ({
                id: u.id,
                email: u.email,
                name: u.full_name || 'Anonymous',
                plan: u.subscriptions?.[0]?.plan_type || 'free',
                status: u.subscriptions?.[0]?.status || 'active',
                joined: new Date(u.created_at).toLocaleDateString()
            }));

            // Fallback to mock data if no users in Supabase (initial state)
            if (formattedUsers.length === 0) {
                console.warn('[DCC] No users in Supabase, using mock fallback list.');
                setUserRegistry([
                    { id: '1', email: 'demo@bayrechnung.com', name: 'Caner Arslan (Mock)', plan: 'standard', status: 'active', joined: '2024-01-10' },
                    { id: '2', email: 'admin@bayrechnung.com', name: 'Süleyman Bayenderi (Mock)', plan: 'premium', status: 'active', joined: '2023-12-05' }
                ]);
            } else {
                setUserRegistry(formattedUsers);
            }
        } catch (err) {
            console.error('[DCC] Error fetching users:', err);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const handlePlanUpdate = async (newPlan) => {
        if (!editingUser) return;
        setIsUpdating(true);
        try {
            console.log(`[DCC] Updating plan for ${editingUser.email} to ${newPlan}...`);
            const { error } = await supabase
                .from('subscriptions')
                .update({ plan_type: newPlan })
                .eq('user_id', editingUser.id);

            if (error) throw error;

            await fetchUsers(); // Refresh the list
            setEditingUser(null);
            if (addLog) addLog(new Error(`User Plan CLOUD UPDATED: ${editingUser.email} to ${newPlan}`), { severity: 'info' });
            if (logSecurityAction) await logSecurityAction('PLAN_UPGRADED', 'subscription', editingUser.id, { newPlan, email: editingUser.email }, 'info');
        } catch (err) {
            console.error('[DCC] Plan update failed:', err);
            alert('Failed to update plan in cloudy registry.');
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        setStatFlash(true);
        setTimeout(() => setStatFlash(false), 500);
    }, [mtdState.rotationCount, localLogs.length]);

    if (!currentUser || currentUser.email?.toLowerCase() !== 'admin@bayrechnung.com') {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <Lock size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>ACCESS DENIED</h1>
                    <p style={{ color: '#94a3b8' }}>Unauthorized personnel restricted.</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, trend }) => (
        <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            borderRadius: '16px',
            color: 'white'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ background: `${color}20`, color: color, padding: '10px', borderRadius: '12px' }}>
                    <Icon size={24} />
                </div>
                {trend && <span style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>{trend > 0 ? '+' : ''}{trend}%</span>}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '4px', color: statFlash ? color : 'white', transition: 'color 0.3s' }}>{value}</div>
        </div>
    );

    const tabStyle = (tab) => ({
        padding: '10px 24px',
        borderRadius: '10px',
        border: 'none',
        background: activeTab === tab ? '#3b82f6' : 'transparent',
        color: activeTab === tab ? 'white' : '#94a3b8',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textTransform: 'capitalize'
    });

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '40px', fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', borderBottom: '1px solid #1e293b', paddingBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '8px' }}>
                            <Terminal size={20} />
                            <span style={{ fontWeight: '800', letterSpacing: '2px', fontSize: '0.8rem' }}>KERNEL_v4.2.0_{localLogs.length > 10 ? 'UNDER_LOAD' : 'STABLE'}</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Developer Control Center</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase' }}>System Status</div>
                                <div style={{ color: localLogs.length > 40 ? '#ef4444' : localLogs.length > 15 ? '#f59e0b' : '#10b981', fontWeight: '700', fontSize: '1.2rem' }}>
                                    {localLogs.length > 40 ? 'CRITICAL' : localLogs.length > 15 ? 'WARNING' : 'HEALTHY'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase' }}>Security Matrix</div>
                                <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '1.2rem' }}>{interventions.length > 0 ? 'INTERVENTION' : 'BALANCED'}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                console.log('[DCC] Forcing MTD Rotation...');
                                rotateMtdTargets();
                            }}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}
                        >
                            <RefreshCw size={14} /> Force MTD Rotation
                        </button>
                    </div>
                </header>

                <div style={{ display: 'flex', gap: '8px', background: 'rgba(30, 41, 59, 0.5)', padding: '6px', borderRadius: '14px', width: 'fit-content', marginBottom: '32px' }}>
                    <button onClick={() => handleTabChange('overview')} style={tabStyle('overview')}>
                        <LayoutDashboard size={16} /> Overview
                    </button>
                    <button onClick={() => handleTabChange('security')} style={tabStyle('security')}>
                        <Shield size={16} /> Security
                    </button>
                    <button onClick={() => handleTabChange('users')} style={tabStyle('users')}>
                        <Users size={16} /> Users
                    </button>
                    <button onClick={() => handleTabChange('flags')} style={tabStyle('flags')}>
                        <Globe size={16} /> Flags
                    </button>
                    <button onClick={() => handleTabChange('logs')} style={tabStyle('logs')}>
                        <Terminal size={16} /> Logs
                    </button>
                    <button onClick={() => handleTabChange('testing')} style={tabStyle('testing')}>
                        <Bug size={16} /> Testing
                    </button>
                    <button onClick={() => handleTabChange('landing')} style={tabStyle('landing')}>
                        <Globe size={16} /> Landing Page
                    </button>
                </div>

                <div style={{ position: 'relative' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="overview">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                                    <StatCard icon={Users} label="Total Users" value={userRegistry.length || 0} color="#3b82f6" trend={12} />
                                    <StatCard icon={Shield} label="MTD Rotations" value={mtdState.rotationCount} color="#6366f1" />
                                    <StatCard icon={AlertTriangle} label="Detected Threats" value={interventions.length} color="#f59e0b" />
                                    <StatCard icon={Terminal} label="Persistent Protocols" value={persistentLogCount} color="#ef4444" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Real-time Security Stream</h3>
                                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Live Feed</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {interventions.length > 0 ? interventions.slice(0, 5).map(i => (
                                                <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <div style={{ color: i.type.includes('block') || i.type.includes('alert') ? '#ef4444' : '#3b82f6' }}>
                                                        {i.type.includes('block') ? <Lock size={20} /> : <Zap size={20} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{i.message}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(i.timestamp).toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#475569', background: '#0f172a', padding: '2px 8px', borderRadius: '4px' }}>{i.type.replace('_', ' ').toUpperCase()}</div>
                                                </div>
                                            )) : (
                                                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No security events synchronized.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Security Matrix</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '800', marginBottom: '4px' }}>CRITICAL</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{severityCounts.critical}</div>
                                            </div>
                                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '800', marginBottom: '4px' }}>WARNING</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{severityCounts.warning}</div>
                                            </div>
                                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '800', marginBottom: '4px' }}>INFO</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{severityCounts.info}</div>
                                            </div>
                                        </div>

                                        {/* Local Buffer Card */}
                                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600', color: 'white' }}>Event Buffer Load</span>
                                                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>Local Storage (max 50)</span>
                                                </div>
                                                <span style={{
                                                    color: localLogs.length > 40 ? '#ef4444' : localLogs.length > 15 ? '#f59e0b' : '#10b981',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {localLogs.length > 40 ? 'CRITICAL' : localLogs.length > 15 ? 'WARNING' : 'HEALTHY'}
                                                </span>
                                            </div>
                                            <div style={{ height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((localLogs.length / 50) * 100, 100)}%` }}
                                                    style={{
                                                        height: '100%',
                                                        background: localLogs.length > 40 ? '#ef4444' : localLogs.length > 15 ? '#f59e0b' : '#3b82f6'
                                                    }}
                                                />
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Local Log Buffer temizlensin mi? Bu işlem sistem sağlık durumunu normale döndürür.')) {
                                                        clearLogs();
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    background: '#1e293b',
                                                    border: '1px solid #334155',
                                                    color: '#94a3b8',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#334155'}
                                                onMouseLeave={(e) => e.target.style.background = '#1e293b'}
                                            >
                                                Reset Local Event Buffer
                                            </button>
                                        </div>

                                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #3b82f6', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}>
                                                <Activity size={32} color="#3b82f6" />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#475569' }}>Heartbeat: {new Date(mtdState.lastRotation).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key="security">
                                <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Security Protocol Registry</h3>
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {interventions.map(i => (
                                            <div key={i.id} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <div style={{ color: i.type === 'mtd-block' ? '#f59e0b' : '#3b82f6' }}>
                                                    <Shield size={24} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{i.type.toUpperCase().replace('-', ' ')}</div>
                                                    <div style={{ color: '#94a3b8', margin: '4px 0 12px 0' }}>{i.message}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                        {Object.entries(i.details || {}).map(([key, val]) => (
                                                            <span key={key} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', color: '#64748b' }}>
                                                                {key}: {String(val)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>
                                                    {new Date(i.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                        {interventions.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
                                                No security interventions logged in the current matrix session.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} key="users">
                                <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>User</th>
                                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>Plan</th>
                                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>Status</th>
                                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>Joined</th>
                                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingUsers ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                                                        Synchronizing with Enterprise Data...
                                                    </td>
                                                </tr>
                                            ) : userRegistry.map(user => (
                                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{
                                                            background: user.plan === 'premium' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                                            color: user.plan === 'premium' ? '#818cf8' : '#94a3b8',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {user.plan}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ color: user.status === 'active' ? '#10b981' : '#f59e0b', fontSize: '0.9rem' }}>• {user.status}</span>
                                                    </td>
                                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{user.joined}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'flags' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} key="flags">
                                <FeatureManagementView />
                            </motion.div>
                        )}

                        {activeTab === 'logs' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} key="logs">
                                <UserLogsView />
                            </motion.div>
                        )}
                        {activeTab === 'landing' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} key="landing">
                                <LandingPageDashboardView />
                            </motion.div>
                        )}

                        {activeTab === 'testing' && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} key="testing">
                                <div style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>BayGuard Resilience Testing</h3>
                                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Manually trigger system failures to verify BayGuard recovery and logging sub-systems.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                        {[
                                            { id: 'runtime', label: 'Runtime Error', icon: Bug, color: '#ef4444', action: triggerRuntimeError, desc: 'Throws a generic JS error.' },
                                            { id: 'quota', label: 'Quota Exceeded', icon: Database, color: '#f59e0b', action: triggerQuotaError, desc: 'Fills localStorage to trigger quota limit.' },
                                            { id: 'loop', label: 'Infinite Sync', icon: RefreshCw, color: '#6366f1', action: triggerInfiniteLoop, desc: 'Simulates React render loop detected.' },
                                            { id: 'async', label: 'Async Rejection', icon: AlertCircle, color: '#fb7185', action: triggerUnhandledRejection, desc: 'Triggers an unhandled promise rejection.' }
                                        ].map(test => (
                                            <button
                                                key={test.id}
                                                onClick={test.action}
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '24px',
                                                    background: 'rgba(15, 23, 42, 0.4)',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '16px'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'}
                                            >
                                                <div style={{ padding: '12px', background: `${test.color}20`, color: test.color, borderRadius: '12px' }}>
                                                    <test.icon size={24} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px' }}>{test.label}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{test.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '32px', padding: '16px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Test Probe Status:</span>
                                            <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '700' }}>{testStatus}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>RESILIENCE_CORE_v1.0</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {editingUser && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(2, 6, 23, 0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    background: '#1e293b',
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '32px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Manage User Plan</h3>
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>Target User</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{editingUser.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{editingUser.email}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {['free', 'standard', 'premium'].map(plan => (
                                        <button
                                            key={plan}
                                            disabled={isUpdating}
                                            onClick={() => handlePlanUpdate(plan)}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '16px',
                                                border: editingUser.plan === plan ? '2px solid #3b82f6' : '1px solid #334155',
                                                background: editingUser.plan === plan ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                                                color: editingUser.plan === plan ? '#3b82f6' : 'white',
                                                fontWeight: '700',
                                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s',
                                                textTransform: 'uppercase',
                                                fontSize: '0.9rem',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: `2px solid ${editingUser.plan === plan ? '#3b82f6' : '#334155'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {editingUser.plan === plan && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />}
                                            </div>
                                            {plan}
                                            {isUpdating && editingUser.plan !== plan && <RefreshCw size={14} className="animate-spin" style={{ marginLeft: 'auto' }} />}
                                        </button>
                                    ))}
                                </div>

                                <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                                    Changes will be applied immediately to the system registry.
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DeveloperControlCenter;
