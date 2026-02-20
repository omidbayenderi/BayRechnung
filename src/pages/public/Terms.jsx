import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const Terms = () => {
    return (
        <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="landing-bg-glow"></div>

            <div className="landing-container" style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '800px', width: '100%', padding: '40px' }}
                >
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 32, fontWeight: 500 }}>
                        <ArrowLeft size={18} /> Back to Home
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: '#3b82f6', padding: 12, borderRadius: 12, color: 'white' }}>
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>Terms & Conditions</h1>
                            <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style={{ color: '#f8fafc', lineHeight: 1.7 }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>1. Introduction</h2>
                        <p style={{ color: '#cbd5e1' }}>Welcome to BayZenit. By using our services, you agree to these terms. Please read them carefully.</p>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>2. Trial Period & Billing</h2>
                        <ul style={{ paddingLeft: 20, margin: 0, color: '#cbd5e1' }}>
                            <li style={{ marginBottom: 12 }}><strong style={{ color: '#ffffff' }}>14-Day Free Trial:</strong> We offer a 14-day free trial for all new accounts. You will not be charged until the trial period ends.</li>
                            <li style={{ marginBottom: 12 }}><strong style={{ color: '#ffffff' }}>Cancellation:</strong> You may cancel at any time during the trial to avoid charges.</li>
                            <li style={{ marginBottom: 12 }}><strong style={{ color: '#ffffff' }}>Billing Cycle:</strong> After the trial, you will be billed according to your selected plan (Monthly or Yearly).</li>
                        </ul>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>3. Acceptable Use</h2>
                        <p style={{ color: '#cbd5e1' }}>Our services are provided for legitimate business management purposes. You agree not to misuse our services or help anyone else do so.</p>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>4. Limitation of Liability</h2>
                        <p style={{ color: '#cbd5e1' }}>To the maximum extent permitted by law, BayZenit shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues.</p>

                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 32, marginBottom: 16, color: '#ffffff' }}>5. Changes to Terms</h2>
                        <p style={{ color: '#cbd5e1' }}>We may modify these terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
                    </div>

                    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.9rem' }}>
                        If you have any questions about these Terms, please contact us at support@bayzenit.com.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Terms;
