import { useState } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Search, FileText, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TOOLS = [
    {
        id: 'hero',
        label: 'Hero Metni Oluştur',
        icon: Sparkles,
        color: '#8b5cf6',
        bg: '#f5f3ff',
        prompt: (info) => `Write a compelling hero section for a ${info.industry} business called "${info.company}".\nInclude: 1 headline (max 8 words), 1 subheadline (max 20 words), 1 CTA button text (max 4 words).\nFormat as JSON: {"headline":"...","subheadline":"...","cta":"..."}\nLanguage: Turkish if company appears Turkish, otherwise English.`,
    },
    {
        id: 'about',
        label: 'Hakkımızda Yaz',
        icon: FileText,
        color: '#0ea5e9',
        bg: '#f0f9ff',
        prompt: (info) => `Write a professional "About Us" section for a ${info.industry} business called "${info.company}".\n2-3 short paragraphs. Highlight trustworthiness, expertise, and customer focus.\n${info.city ? `Based in ${info.city}.` : ''}\nLanguage: Turkish if company appears Turkish, otherwise English.`,
    },
    {
        id: 'seo',
        label: 'SEO Meta Üret',
        icon: Search,
        color: '#10b981',
        bg: '#f0fdf4',
        prompt: (info) => `Generate SEO meta tags for a ${info.industry} business called "${info.company}".\n${info.city ? `Located in ${info.city}.` : ''}\nFormat as JSON: {"title":"...","description":"...","keywords":"..."}\nTitle: max 60 chars. Description: max 155 chars. Keywords: 8-10 comma-separated.\nLanguage: Turkish if company appears Turkish, otherwise English.`,
    },
    {
        id: 'services',
        label: 'Hizmet Açıklamaları',
        icon: Cpu,
        color: '#f59e0b',
        bg: '#fffbeb',
        prompt: (info) => `Write short, professional descriptions for 4 typical services of a ${info.industry} business.\nFormat as JSON array: [{"name":"...","description":"..."}]\nEach description: 1-2 sentences, max 25 words.\nLanguage: Turkish if company appears Turkish, otherwise English.`,
    },
];

const WebsiteAITools = () => {
    const { siteConfig, updateSiteConfig } = useWebsite();
    const { currentUser } = useAuth();
    const [activeTool, setActiveTool] = useState(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState('');

    const companyInfo = {
        company: currentUser?.companyName || siteConfig?.businessName || 'My Business',
        industry: currentUser?.industry || siteConfig?.businessCategory || 'service',
        city: currentUser?.city || '',
    };

    const runTool = async (tool) => {
        setActiveTool(tool.id);
        setResult('');
        setError('');
        setApplied(false);
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-content-generator`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`,
                    },
                    body: JSON.stringify({ prompt: tool.prompt(companyInfo), tool: tool.id }),
                }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setResult(data.content || JSON.stringify(data, null, 2));
        } catch {
            setError('AI servisi şu an ulaşılamıyor. Aşağıdaki promptu ChatGPT veya Claude\'a kopyalayıp kullanabilirsiniz:');
            setResult(tool.prompt(companyInfo));
        }
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApplySEO = () => {
        try {
            const parsed = JSON.parse(result);
            updateSiteConfig({ seo: { ...siteConfig?.seo, ...parsed } });
            setApplied(true);
            setTimeout(() => setApplied(false), 2000);
        } catch { /* not JSON */ }
    };

    const currentTool = TOOLS.find(t => t.id === activeTool);

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={24} color="#8b5cf6" /> Website AI Araçları
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                    Şirketiniz için otomatik içerik üretin — <strong>{companyInfo.company}</strong> · {companyInfo.industry}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                {TOOLS.map(tool => (
                    <motion.button key={tool.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                        onClick={() => runTool(tool)} disabled={loading}
                        style={{
                            padding: '20px', borderRadius: '14px', textAlign: 'left', cursor: loading ? 'not-allowed' : 'pointer',
                            border: `2px solid ${activeTool === tool.id ? tool.color : '#e2e8f0'}`,
                            background: activeTool === tool.id ? tool.bg : 'white',
                            transition: 'all 0.15s', opacity: loading && activeTool !== tool.id ? 0.5 : 1
                        }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tool.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            <tool.icon size={20} color={tool.color} />
                        </div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', marginBottom: '2px' }}>{tool.label}</div>
                        {activeTool === tool.id && loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: tool.color, fontSize: '0.75rem', fontWeight: '600', marginTop: '6px' }}>
                                <Loader2 size={11} style={{ animation: 'aispin 1s linear infinite' }} /> Üretiliyor…
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {(result || loading) && (
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: 'white', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{currentTool?.label} — Sonuç</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {activeTool === 'seo' && result && !error && (
                                    <button onClick={handleApplySEO}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                                        {applied ? <><Check size={13} /> Uygulandı</> : 'Siteme Uygula'}
                                    </button>
                                )}
                                <button onClick={handleCopy}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', color: '#475569' }}>
                                    {copied ? <><Check size={13} /> Kopyalandı</> : <><Copy size={13} /> Kopyala</>}
                                </button>
                                <button onClick={() => runTool(currentTool)} disabled={loading}
                                    style={{ padding: '7px 10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}>
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div style={{ padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '0.82rem' }}>{error}</p>
                            </div>
                        )}
                        <div style={{ padding: '20px' }}>
                            {loading
                                ? <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                                    <Loader2 size={18} style={{ animation: 'aispin 1s linear infinite', color: currentTool?.color }} />
                                    <span style={{ fontSize: '0.9rem' }}>İçerik üretiliyor…</span>
                                  </div>
                                : <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', lineHeight: '1.7', color: '#334155' }}>{result}</pre>
                            }
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`@keyframes aispin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default WebsiteAITools;
