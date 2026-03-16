import React, { useState, useEffect } from 'react';
import { useWebsite } from '../../context/WebsiteContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Edit3, Trash2, Eye, EyeOff,
    Calendar, Tag, Search, X, Save, ChevronDown, Globe
} from 'lucide-react';

const EMPTY_POST = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: '',
    tags: '',
    is_published: false,
};

const slugify = (text) =>
    text.toLowerCase().trim()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const WebsiteBlogs = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingPost, setEditingPost] = useState(null); // null = list, {} = new, {id,...} = edit
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState(EMPTY_POST);

    useEffect(() => { fetchPosts(); }, [currentUser]);

    const fetchPosts = async () => {
        if (!currentUser?.id) { setLoading(false); return; }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            if (!error) setPosts(data || []);
        } catch (e) { /* table may not exist yet */ }
        setLoading(false);
    };

    const openNew = () => {
        setForm(EMPTY_POST);
        setEditingPost({});
    };

    const openEdit = (post) => {
        setForm({ ...post, tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '' });
        setEditingPost(post);
    };

    const handleFormChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'title' && !prev.id) {
                updated.slug = slugify(value);
            }
            return updated;
        });
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        const payload = {
            ...form,
            user_id: currentUser.id,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            updated_at: new Date().toISOString(),
        };
        try {
            if (editingPost?.id) {
                await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
                setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...payload } : p));
            } else {
                payload.created_at = new Date().toISOString();
                const { data } = await supabase.from('blog_posts').insert([payload]).select().single();
                if (data) setPosts(prev => [data, ...prev]);
            }
            setEditingPost(null);
        } catch (e) { console.error('[Blog] Save error:', e); }
        setSaving(false);
    };

    const handleTogglePublish = async (post) => {
        const newVal = !post.is_published;
        await supabase.from('blog_posts').update({ is_published: newVal }).eq('id', post.id);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: newVal } : p));
    };

    const handleDelete = async (id) => {
        await supabase.from('blog_posts').delete().eq('id', id);
        setPosts(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
    };

    const filtered = posts.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const cardStyle = {
        background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid #1f1f23',
        padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start',
        transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
    };

    if (editingPost !== null) {
        return (
            <div style={{ padding: '32px', minHeight: '100vh', background: '#0a0a0c', color: '#fff' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={() => setEditingPost(null)} 
                                style={{ 
                                    width: '44px', height: '44px', background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid #1f1f23', borderRadius: '12px', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer' 
                                }}>
                                <X size={22} />
                            </button>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                                {editingPost?.id ? 'Düzenleme Modu' : 'Yeni İçerik'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setEditingPost(null)}
                                style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #1f1f23', borderRadius: '14px', fontWeight: '700', color: '#6b7280', cursor: 'pointer' }}>
                                İptal
                            </button>
                            <button onClick={handleSave} disabled={saving || !form.title.trim()}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', 
                                    background: '#818cf8', color: 'white', border: 'none', borderRadius: '14px', 
                                    fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                                    boxShadow: '0 8px 16px rgba(129,140,248,0.2)'
                                }}>
                                <Save size={18} />
                                {saving ? 'İşleniyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Başlık</label>
                                    <input value={form.title} onChange={e => handleFormChange('title', e.target.value)}
                                        placeholder="Göz alıcı bir başlık yazın..."
                                        style={{ width: '100%', padding: '16px', background: '#131316', border: '1px solid #1f1f23', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', color: '#fff', outline: 'none' }} />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>İçerik Editörü</label>
                                    <textarea value={form.content} onChange={e => handleFormChange('content', e.target.value)}
                                        rows={15} placeholder="Okuyucularınız için değerli bilgiler paylaşın..."
                                        style={{ width: '100%', padding: '16px', background: '#131316', border: '1px solid #1f1f23', borderRadius: '12px', resize: 'vertical', fontSize: '1rem', lineHeight: '1.6', color: '#fff', outline: 'none' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '20px' }}>Yayın Ayarları</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>Durum</span>
                                    <div onClick={() => handleFormChange('is_published', !form.is_published)}
                                        style={{
                                            width: '50px', height: '26px', borderRadius: '100px', position: 'relative', cursor: 'pointer',
                                            background: form.is_published ? '#10b981' : '#1f1f23', transition: 'all 0.3s'
                                        }}>
                                        <div style={{
                                            position: 'absolute', top: '3px', left: form.is_published ? '27px' : '3px',
                                            width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                            transition: 'all 0.3s'
                                        }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '8px' }}>URL SLUG</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#0a0a0c', border: '1px solid #1f1f23', borderRadius: '10px' }}>
                                        <Globe size={14} color="#4b5563" />
                                        <input value={form.slug} onChange={e => handleFormChange('slug', e.target.value)}
                                            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.8rem', color: '#818cf8', fontWeight: '600' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '8px' }}>KATEGORİ</label>
                                    <input value={form.category} onChange={e => handleFormChange('category', e.target.value)}
                                        placeholder="ör. Duyuru"
                                        style={{ width: '100%', padding: '12px', background: '#131316', border: '1px solid #1f1f23', borderRadius: '10px', fontSize: '0.85rem', color: '#fff', fontWeight: '600' }} />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid #1f1f23' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '20px' }}>Arama Motoru (SEO)</h3>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '8px' }}>KISA ÖZET</label>
                                    <textarea value={form.summary} onChange={e => handleFormChange('summary', e.target.value)}
                                        rows={4} placeholder="Google'da görünecek kısa açıklama..."
                                        style={{ width: '100%', padding: '12px', background: '#131316', border: '1px solid #1f1f23', borderRadius: '10px', fontSize: '0.85rem', color: '#fff', outline: 'none', resize: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '8px' }}>ETİKETLER</label>
                                    <input value={form.tags} onChange={e => handleFormChange('tags', e.target.value)}
                                        placeholder="virgülle ayırın..."
                                        style={{ width: '100%', padding: '12px', background: '#131316', border: '1px solid #1f1f23', borderRadius: '10px', fontSize: '0.85rem', color: '#fff', fontWeight: '600' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: '#0a0a0c', color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} color="white" />
                        </div>
                        Blog Yönetimi
                    </h1>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '1rem', fontWeight: '500' }}>
                        {posts.length} toplam yazı · {posts.filter(p => p.is_published).length} yayında
                    </p>
                </div>
                <button onClick={openNew}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', 
                        border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(99,102,241,0.2)', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} /> Yeni Yazı Oluştur
                </button>
            </div>

            {/* Search & Stats Section */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', maxWidth: '600px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Bloglarda ara..."
                        style={{ 
                            width: '100%', padding: '14px 16px 14px 48px', background: '#131316', 
                            border: '1px solid #1f1f23', borderRadius: '14px', fontSize: '0.95rem', 
                            color: '#fff', outline: 'none', fontWeight: '600' 
                        }} />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: '#6b7280' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #1f1f23', borderTop: '3px solid #6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    Veriler yükleniyor...
                </div>
            ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ 
                        background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid #1f1f23', 
                        padding: '80px 32px', textAlign: 'center' 
                    }}>
                    <div style={{ 
                        width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', 
                        borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <FileText size={36} color="#818cf8" />
                    </div>
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
                        {search ? 'Sonuç bulunamadı' : 'Henüz blog yazınız yok'}
                    </h3>
                    <p style={{ margin: '0 0 32px', color: '#6b7280', fontSize: '1.05rem', fontWeight: '500', maxWidth: '400px', margin: '0 auto 32px' }}>
                        {search ? 'Arama kriterlerinizi değiştirerek tekrar deneyebilirsiniz.' : 'Sektörel yazılarınızı, haberlerinizi ve duyurularınızı buradan paylaşmaya başlayın.'}
                    </p>
                    {!search && (
                        <button onClick={openNew}
                            style={{ 
                                padding: '14px 32px', background: '#818cf8', color: 'white', 
                                border: 'none', borderRadius: '14px', fontWeight: '800', 
                                cursor: 'pointer', transition: 'all 0.2s' 
                            }}>
                            İlk Blog Yazısını Başlat
                        </button>
                    )}
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(post => (
                        <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={cardStyle}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            {/* Status indicator */}
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: post.is_published ? '#22c55e' : '#cbd5e1', marginTop: '6px', flexShrink: 0 }} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{post.title}</span>
                                    <div style={{ 
                                        padding: '4px 10px', 
                                        background: post.is_published ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                                        color: post.is_published ? '#10b981' : '#6b7280', 
                                        borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800' 
                                    }}>
                                        {post.is_published ? 'YAYINDA' : 'TASLAK'}
                                    </div>
                                </div>
                                {post.summary && (
                                    <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.summary}</p>
                                )}
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    {post.category && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <Tag size={14} /> {post.category}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '0.8rem', fontWeight: '600' }}>
                                        <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                    <span style={{ color: '#4b5563', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Globe size={14} /> /blog/{post.slug}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button onClick={() => handleTogglePublish(post)} 
                                    style={{ 
                                        width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid #1f1f23', cursor: 'pointer', 
                                        color: post.is_published ? '#10b981' : '#6b7280', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                    {post.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => openEdit(post)} 
                                    style={{ 
                                        width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid #1f1f23', cursor: 'pointer', color: '#818cf8', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => setDeleteConfirm(post.id)} 
                                    style={{ 
                                        width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.05)', 
                                        border: '1px solid rgba(239, 68, 68, 0.1)', cursor: 'pointer', 
                                        color: '#ef4444', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete confirm dialog */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: '#131316', borderRadius: '24px', padding: '40px 32px', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #1f1f23' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Trash2 size={28} color="#ef4444" />
                            </div>
                            <h3 style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>Yazıyı silmek istediğinize emin misiniz?</h3>
                            <p style={{ margin: '0 0 32px', color: '#6b7280', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.5' }}>Bu içerik kalıcı olarak silinecektir ve bu işlem geri alınamaz.</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setDeleteConfirm(null)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1f1f23', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                                    İptal
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)}
                                    style={{ flex: 1, padding: '14px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>
                                    Evet, Sil
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WebsiteBlogs;
