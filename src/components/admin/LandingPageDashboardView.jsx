import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Plus, Trash2, Video, DollarSign, Layout,
    CheckCircle, AlertCircle, Loader2, X, Edit3,
    Type, Globe, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import LandingPagePreview from './LandingPagePreview';

const LandingPageDashboardView = () => {
    const [pricing, setPricing] = useState([]);
    const [videos, setVideos] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [editSection, setEditSection] = useState(null);
    const [editVideo, setEditVideo] = useState(null);
    const [newPlan, setNewPlan] = useState(null);
    const [showPreview, setShowPreview] = useState(true);
    const [activeSelection, setActiveSelection] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 1024;

    // Refs for scrolling
    const pricingRef = React.useRef(null);
    const videosRef = React.useRef(null);
    const cmsRef = React.useRef(null);

    const sectionRefs = {
        'pricing': pricingRef,
        'videos': videosRef,
        'cms-sections': cmsRef
    };

    const handleSelect = (sectionId) => {
        setActiveSelection(sectionId);
        const ref = sectionRefs[sectionId];
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Auto-clear highlight after 2 seconds
        setTimeout(() => setActiveSelection(null), 2000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setMessage(null);
        setHasUnsavedChanges(false);
        try {
            console.log('[LandingDCC] Starting content synchronization...');

            // 1. Pricing
            try {
                const { data, error } = await supabase.from('landing_pricing').select('*').order('created_at', { ascending: true });
                if (error) throw error;
                setPricing(data || []);
            } catch (err) {
                console.warn('[LandingDCC] Pricing table fetch failed, using mock.');
                setPricing([
                    { id: 'mock-1', plan_id: 'standard', name_key: 'standard', price_monthly: 19, price_yearly: 199, is_featured: false, features: ["unlimitedInvoices", "customerManagement"] },
                    { id: 'mock-2', plan_id: 'premium', name_key: 'premium', price_monthly: 79, price_yearly: 799, is_featured: true, features: ["everythingInStandard", "advancedReports"] }
                ]);
            }

            // 2. Videos
            try {
                const { data, error } = await supabase.from('landing_videos').select('*').order('display_order', { ascending: true });
                if (error) throw error;
                setVideos(data || []);
            } catch (err) {
                setVideos([]);
            }

            // 3. Sections
            try {
                const { data, error } = await supabase.from('landing_sections').select('*').order('display_order', { ascending: true });
                if (error) throw error;
                setSections(data || []);
            } catch (err) {
                setSections([]);
            }

        } catch (err) {
            console.error('[LandingDCC] Global Sync Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePricing = async (plan) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('landing_pricing')
                .upsert({
                    id: plan.id.toString().startsWith('mock-') || plan.id.toString().startsWith('new-') ? undefined : plan.id,
                    plan_id: plan.plan_id,
                    name_key: plan.name_key,
                    price_monthly: plan.price_monthly,
                    price_yearly: plan.price_yearly,
                    is_featured: plan.is_featured,
                    features: plan.features
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Pricing updated successfully' });
            fetchData();
            setNewPlan(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeletePricing = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pricing plan?')) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('landing_pricing').delete().eq('id', id);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Pricing plan deleted' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveVideo = async (video) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('landing_videos')
                .upsert({
                    id: video.id.toString().startsWith('new-') ? undefined : video.id,
                    title: video.title,
                    description: video.description,
                    video_url: video.video_url,
                    display_order: video.display_order,
                    is_active: video.is_active
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Video saved successfully' });
            setEditVideo(null);
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Delete this video from the landing page?')) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('landing_videos').delete().eq('id', id);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Video removed' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSection = async (section) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('landing_sections')
                .upsert({
                    id: section.id.toString().startsWith('new-') ? undefined : section.id,
                    slug: section.slug,
                    type: section.type,
                    content: section.content,
                    is_active: section.is_active,
                    display_order: section.display_order
                });

            if (error) throw error;
            setMessage({ type: 'success', text: 'Section saved successfully' });
            setEditSection(null);
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm('Delete this section permanently?')) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('landing_sections').delete().eq('id', id);
            if (error) throw error;
            setMessage({ type: 'success', text: 'Section deleted' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateContent = (type, data) => {
        setHasUnsavedChanges(true);
        if (type === 'sections') {
            setSections(prev => prev.map(s => s.id === data.id ? data : s));
        } else if (type === 'pricing') {
            setPricing(prev => prev.map(p => p.id === data.id ? data : p));
        } else if (type === 'videos') {
            setVideos(prev => prev.map(v => v.id === data.id ? data : v));
        }
    };

    const handleGlobalSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            console.log('[LandingDCC] Starting global deployment...');

            // Batch prepare all upserts
            const sectionsBatch = sections.map(s => ({
                id: s.id.toString().startsWith('new-') ? undefined : s.id,
                slug: s.slug,
                type: s.type,
                content: s.content,
                is_active: s.is_active,
                display_order: s.display_order
            }));

            const pricingBatch = pricing.map(p => ({
                id: p.id.toString().startsWith('mock-') || p.id.toString().startsWith('new-') ? undefined : p.id,
                plan_id: p.plan_id,
                name_key: p.name_key,
                price_monthly: p.price_monthly,
                price_yearly: p.price_yearly,
                is_featured: p.is_featured,
                features: p.features
            }));

            const videosBatch = videos.map(v => ({
                id: v.id.toString().startsWith('new-') ? undefined : v.id,
                title: v.title,
                description: v.description,
                video_url: v.video_url,
                display_order: v.display_order,
                is_active: v.is_active
            }));

            const [secRes, priRes, vidRes] = await Promise.all([
                supabase.from('landing_sections').upsert(sectionsBatch),
                supabase.from('landing_pricing').upsert(pricingBatch),
                supabase.from('landing_videos').upsert(videosBatch)
            ]);

            if (secRes.error) throw secRes.error;
            if (priRes.error) throw priRes.error;
            if (vidRes.error) throw vidRes.error;

            setMessage({ type: 'success', text: 'All changes published to landing page!' });
            setHasUnsavedChanges(false);
            fetchData();
        } catch (err) {
            console.error('[LandingDCC] Global Save Error:', err);
            setMessage({ type: 'error', text: `Publication failed: ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    const handleAddFeature = (planId) => {
        if (newPlan && newPlan.id === planId) {
            setNewPlan({ ...newPlan, features: [...(newPlan.features || []), "new_feature_key"] });
            return;
        }
        setPricing(prev => prev.map(p => {
            if (p.id === planId) {
                return { ...p, features: [...(p.features || []), "new_feature_key"] };
            }
            return p;
        }));
    };

    const handleRemoveFeature = (planId, featureIdx) => {
        if (newPlan && newPlan.id === planId) {
            const newFeatures = [...newPlan.features];
            newFeatures.splice(featureIdx, 1);
            setNewPlan({ ...newPlan, features: newFeatures });
            return;
        }
        setPricing(prev => prev.map(p => {
            if (p.id === planId) {
                const newFeatures = [...p.features];
                newFeatures.splice(featureIdx, 1);
                return { ...p, features: newFeatures };
            }
            return p;
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Visual Editor (No-Code)</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Real-time marketing engine for your business.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {hasUnsavedChanges && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleGlobalSave}
                            disabled={saving}
                            style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '10px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Publish All Changes
                        </motion.button>
                    )}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    {message && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                            color: message.type === 'success' ? '#10b981' : '#ef4444'
                        }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </motion.div>
                    )}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: (showPreview && !isMobile) ? '1fr 1fr' : '1fr',
                gap: '32px',
                alignItems: 'start'
            }}>
                {/* Editor Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: 'fit-content' }}>

                    {/* Pricing Section */}
                    <section
                        ref={pricingRef}
                        style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '24px', border: activeSelection === 'pricing' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)', transition: 'border 0.3s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <DollarSign size={20} color="#3b82f6" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Pricing Plans</h3>
                            </div>
                            <button
                                onClick={() => setNewPlan({ id: `new-${Date.now()}`, plan_id: 'standard', name_key: 'standard', price_monthly: 19, price_yearly: 199, is_featured: false, features: [] })}
                                disabled={!!newPlan}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: newPlan ? 0.5 : 1 }}
                            >
                                <Plus size={14} /> New Plan
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {[...pricing, ...(newPlan ? [newPlan] : [])].map(plan => (
                                <div key={plan.id} style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: plan.id.toString().startsWith('new-') ? '2px dashed #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <input
                                            value={plan.plan_id}
                                            onChange={(e) => {
                                                if (newPlan && newPlan.id === plan.id) setNewPlan({ ...newPlan, plan_id: e.target.value, name_key: e.target.value });
                                                else setPricing(prev => prev.map(p => p.id === plan.id ? { ...p, plan_id: e.target.value, name_key: e.target.value } : p));
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', width: '60%' }}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleDeletePricing(plan.id)} style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={plan.is_featured} onChange={(e) => {
                                            if (newPlan && newPlan.id === plan.id) setNewPlan({ ...newPlan, is_featured: e.target.checked });
                                            else setPricing(prev => prev.map(p => p.id === plan.id ? { ...p, is_featured: e.target.checked } : p));
                                        }} />
                                        Featured Badge
                                    </label>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px' }}>Monthly (€)</div>
                                            <input type="number" value={plan.price_monthly} onChange={(e) => {
                                                if (newPlan && newPlan.id === plan.id) setNewPlan({ ...newPlan, price_monthly: parseFloat(e.target.value) });
                                                else setPricing(prev => prev.map(p => p.id === plan.id ? { ...p, price_monthly: parseFloat(e.target.value) } : p));
                                            }} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px' }}>Yearly (€)</div>
                                            <input type="number" value={plan.price_yearly} onChange={(e) => {
                                                if (newPlan && newPlan.id === plan.id) setNewPlan({ ...newPlan, price_yearly: parseFloat(e.target.value) });
                                                else setPricing(prev => prev.map(p => p.id === plan.id ? { ...p, price_yearly: parseFloat(e.target.value) } : p));
                                            }} style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#cbd5e1' }}>Features</div>
                                            <button onClick={() => handleAddFeature(plan.id)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Plus size={16} /></button>
                                        </div>
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(plan.features || []).map((feature, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                                    <input value={feature} onChange={(e) => {
                                                        const newFeatures = [...plan.features]; newFeatures[idx] = e.target.value;
                                                        if (newPlan && newPlan.id === plan.id) setNewPlan({ ...newPlan, features: newFeatures });
                                                        else setPricing(prev => prev.map(p => p.id === plan.id ? { ...p, features: newFeatures } : p));
                                                    }} style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#94a3b8', fontSize: '0.8rem' }} />
                                                    <button onClick={() => handleRemoveFeature(plan.id, idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={() => handleSavePricing(plan)} disabled={saving} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}>
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Video Gallery */}
                    <section
                        ref={videosRef}
                        style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '24px', border: activeSelection === 'videos' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Video size={18} color="#a855f7" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Video Gallery</h3>
                            </div>
                            <button
                                onClick={() => setEditVideo({ id: `new-${Date.now()}`, title: '', description: '', video_url: '', is_active: true, display_order: 1 })}
                                style={{ background: '#a855f7', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Plus size={14} /> Add Video
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {videos.map(video => (
                                <div key={video.id} style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}><Video size={20} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.video_url}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditVideo(video)} style={{ color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                            <button onClick={() => handleDeleteVideo(video.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CMS Sections */}
                    <section
                        ref={cmsRef}
                        style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '24px', border: activeSelection === 'cms-sections' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.3s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Layout size={20} color="#10b981" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Announcements & Custom Blocks</h3>
                            </div>
                            <button
                                onClick={() => setEditSection({ id: `new-${Date.now()}`, slug: 'new-banner', type: 'alert', content: { title: 'New Banner', text: 'Text goes here' }, is_active: true, display_order: 99 })}
                                style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Plus size={14} /> New Section
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {sections.map(section => (
                                <div key={section.id} style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px', fontWeight: '800' }}>{section.type.toUpperCase()}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setEditSection(section)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 size={18} /></button>
                                            <button onClick={() => handleDeleteSection(section.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{section.content.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '16px' }}>{section.content.text}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                                        <Globe size={12} /> {section.slug}
                                        <span style={{ color: section.is_active ? '#10b981' : '#ef4444', fontWeight: '700' }}>• {section.is_active ? 'LIVE' : 'HIDDEN'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Preview Column */}
                {showPreview && !isMobile && (
                    <div style={{
                        position: 'sticky',
                        top: '20px',
                        height: 'calc(100vh - 150px)',
                        overflow: 'hidden',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#020617'
                    }}>
                        <div style={{
                            padding: '12px 20px',
                            background: 'rgba(255,255,255,0.03)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Live Preview (Canvas)
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            </div>
                        </div>
                        <div style={{ height: '100%', overflowY: 'auto' }}>
                            <LandingPagePreview
                                pricingPlans={[...pricing, ...(newPlan ? [newPlan] : [])]}
                                dynamicVideos={videos}
                                dynamicSections={sections}
                                onSelect={handleSelect}
                                activeSection={activeSelection}
                                onUpdateContent={handleUpdateContent}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Section Modal */}
            <AnimatePresence>
                {editSection && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#1e293b', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Manage Section</h3>
                                <button onClick={() => setEditSection(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Slug (Permanent Access Key)</label>
                                        <input value={editSection.slug} onChange={(e) => setEditSection({ ...editSection, slug: e.target.value })} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Display Mode</label>
                                        <select value={editSection.type} onChange={(e) => setEditSection({ ...editSection, type: e.target.value })} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }}>
                                            <option value="alert">Hero Announcement</option>
                                            <option value="banner">Content Banner</option>
                                            <option value="card">Feature Card</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Headline</label>
                                    <input value={editSection.content.title} onChange={(e) => setEditSection({ ...editSection, content: { ...editSection.content, title: e.target.value } })} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Message / Text Body</label>
                                    <textarea value={editSection.content.text} onChange={(e) => setEditSection({ ...editSection, content: { ...editSection.content, text: e.target.value } })} style={{ width: '100%', height: '100px', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white', resize: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Media URL (Image, Video, or SVG Icon)</label>
                                    <input value={editSection.content.image_url || ''} onChange={(e) => setEditSection({ ...editSection, content: { ...editSection.content, image_url: e.target.value } })} placeholder="/dashboard_v2.png" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={editSection.is_active} onChange={(e) => setEditSection({ ...editSection, is_active: e.target.checked })} />
                                        <span style={{ fontSize: '0.9rem' }}>Show on Landing Page</span>
                                    </label>
                                </div>
                                <button onClick={() => handleSaveSection(editSection)} disabled={saving} style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Section
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Video Modal */}
            <AnimatePresence>
                {editVideo && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#1e293b', width: '100%', maxWidth: '550px', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Video Settings</h3>
                                <button onClick={() => setEditVideo(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Video Title</label>
                                    <input value={editVideo.title} onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })} placeholder="e.g. Quick Introduction" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Embed URL (YouTube/Vimeo)</label>
                                    <input value={editVideo.video_url} onChange={(e) => setEditVideo({ ...editVideo, video_url: e.target.value })} placeholder="https://youtube.com/embed/..." style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Description (Marketing text)</label>
                                    <textarea value={editVideo.description || ''} onChange={(e) => setEditVideo({ ...editVideo, description: e.target.value })} placeholder="What is this video about?" style={{ width: '100%', height: '100px', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white', resize: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>Display Order</label>
                                        <input type="number" value={editVideo.display_order} onChange={(e) => setEditVideo({ ...editVideo, display_order: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={editVideo.is_active} onChange={(e) => setEditVideo({ ...editVideo, is_active: e.target.checked })} />
                                            <span style={{ fontSize: '0.9rem' }}>Active</span>
                                        </label>
                                    </div>
                                </div>
                                <button onClick={() => handleSaveVideo(editVideo)} disabled={saving} style={{ width: '100%', padding: '14px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Video
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPageDashboardView;
