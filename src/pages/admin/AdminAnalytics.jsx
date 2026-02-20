import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, Users, FileText, Database, Shield, Zap } from 'lucide-react';

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalInvoices: 0,
        totalExpenses: 0,
        activeSubscriptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // In a real SaaS, we would have an 'admin' schema or specific RPCs
            // For this simulation, we count from public tables
            const [usersRes, invRes, expRes] = await Promise.all([
                supabase.from('users').select('id', { count: 'exact' }),
                supabase.from('invoices').select('id', { count: 'exact' }),
                supabase.from('expenses').select('id', { count: 'exact' })
            ]);

            setStats({
                totalUsers: usersRes.count || 0,
                totalInvoices: invRes.count || 0,
                totalExpenses: expRes.count || 0,
                activeSubscriptions: 1 // Simulation
            });
            setLoading(false);
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>Sistem Analitiği</h1>
                    <p className="text-muted">Platform genelindeki kullanım istatistikleri ve performans verileri.</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '12px', borderRadius: '12px' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Toplam Kullanıcı</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: '#dcfce7', color: '#10b981', padding: '12px', borderRadius: '12px' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Toplam Fatura</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalInvoices}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: '#fef9c3', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
                        <Database size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Veri Kaydı</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalInvoices + stats.totalExpenses}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ background: '#f3e8ff', color: '#8b5cf6', padding: '12px', borderRadius: '12px' }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Aktif Abonelik</p>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.activeSubscriptions}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} />
                        Büyüme Grafiği (Simülasyon)
                    </h3>
                    <div style={{ height: '300px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px' }}>
                        {[40, 60, 45, 80, 55, 90, 100].map((h, i) => (
                            <div key={i} style={{ width: '40px', height: `${h}%`, background: '#3b82f6', borderRadius: '6px' }}></div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} />
                        Sunucu Durumu
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>Supabase DB</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>ONLINE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>Auth Service</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>ONLINE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px' }}>Storage Buckets</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>STABLE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
