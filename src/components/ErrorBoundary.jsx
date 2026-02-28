import React from 'react';
import { monitoring } from '../lib/Monitoring';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        monitoring.logError(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    background: '#f8fafc'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚡</div>
                    <h1 style={{ marginBottom: '10px', color: '#1e293b' }}>Sistem Refresh Ediliyor...</h1>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>Küçük bir aksaklık tespit edildi ve BayGuardAgent tarafından onarılıyor.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        Hemen Yenile
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ marginTop: '40px', padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left', overflow: 'auto', maxWidth: '100%' }}>
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
