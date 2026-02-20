import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const WorkerHome = () => {
    const { currentUser } = useAuth();
    const { appointments } = useAppointments();

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    return (
        <div className="worker-home">
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Merhaba, {currentUser?.name?.split(' ')[0]}!</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Bugün için planlanan işlerin burada.</p>

            <div style={{ display: 'grid', gap: '16px' }}>
                {/* Stats Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    padding: '20px',
                    borderRadius: '16px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Bugünkü Görevler</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{todayAppointments.length}</div>
                </div>

                {/* Task List */}
                <div className="card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} color="#8b5cf6" />
                        Zaman Çizelgesi
                    </h3>

                    {todayAppointments.length > 0 ? (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {todayAppointments.map(appt => (
                                <div key={appt.id} style={{
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #8b5cf6'
                                }}>
                                    <div style={{ fontWeight: 'bold' }}>{appt.time} - {appt.customerName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{appt.notes || 'Detay belirtilmedi'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                            Bugün için kayıtlı görev bulunamadı.
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="#8b5cf6" />
                        Hızlı İşlemler
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button style={{
                            padding: '16px',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#1e293b'
                        }}>
                            <CheckCircle size={24} color="#10b981" />
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>İş Bitir</span>
                        </button>
                        <button style={{
                            padding: '16px',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#1e293b'
                        }}>
                            <Clock size={24} color="#3b82f6" />
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Mola Ver</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerHome;
