import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div style={{
            height: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <AlertTriangle size={64} color="#ef4444" />
            </div>
            
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>
                {t('page_not_found') || 'Sayfa Bulunamadı'}
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '32px' }}>
                {t('page_not_found_desc') || 'Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.'}
            </p>

            <button 
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <Home size={20} />
                {t('backToHome') || 'Ana Sayfaya Dön'}
            </button>
        </div>
    );
};

export default NotFound;
