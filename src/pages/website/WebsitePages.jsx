import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useWebsite } from '../../context/WebsiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, Edit3, ExternalLink, Globe, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WebsitePages = () => {
    const { t } = useLanguage();
    const { pages, addPage, deletePage, setActivePageId } = useWebsite();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');
    const [newPageSlug, setNewPageSlug] = useState('');
    const navigate = useNavigate();

    const handleAddPage = async (e) => {
        e.preventDefault();
        if (!newPageTitle || !newPageSlug) return;
        
        const res = await addPage(newPageTitle, newPageSlug.startsWith('/') ? newPageSlug : `/${newPageSlug}`);
        if (res.success) {
            setIsAddModalOpen(false);
            setNewPageTitle('');
            setNewPageSlug('');
        }
    };

    const handleEditPage = (pageId) => {
        setActivePageId(pageId);
        navigate('/website/editor');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <Layout className="text-primary" />
                        {t('menu_pages')}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Sitenizin yapısını ve sayfalarını buradan yönetin.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20 transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    Yeni Sayfa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {pages.map((page, i) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all p-5 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-50 group-hover:bg-primary/10 text-gray-400 group-hover:text-primary rounded-xl flex items-center justify-center transition-colors">
                                    <Globe size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEditPage(page.id)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                        title="Sayfayı Düzenle"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    {pages.length > 1 && (
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Bu sayfayı silmek istediğinize emin misiniz?')) deletePage(page.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                                            title="Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{page.title}</h3>
                            <p className="text-gray-400 text-sm font-medium mb-6 flex items-center gap-1.5">
                                <ExternalLink size={14} />
                                {page.slug}
                            </p>

                            <button 
                                onClick={() => handleEditPage(page.id)}
                                className="w-full py-2.5 bg-gray-50 group-hover:bg-primary group-hover:text-white text-gray-600 rounded-xl text-sm font-bold transition-all"
                            >
                                Editörde Aç
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Addition Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Yeni Sayfa Oluştur</h2>
                            <p className="text-gray-500 text-sm mb-8 font-medium">Sitenize yeni bir bölüm ekleyin.</p>
                            
                            <form onSubmit={handleAddPage} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Sayfa Başlığı</label>
                                    <input 
                                        type="text" 
                                        value={newPageTitle}
                                        onChange={(e) => {
                                            setNewPageTitle(e.target.value);
                                            if(!newPageSlug) setNewPageSlug('/' + e.target.value.toLowerCase().replace(/\s+/g, '-'));
                                        }}
                                        autoFocus
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                        placeholder="Örn: Hakkımızda"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">URL Uzantısı (Slug)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">/</span>
                                        <input 
                                            type="text" 
                                            value={newPageSlug.startsWith('/') ? newPageSlug.substring(1) : newPageSlug}
                                            onChange={(e) => setNewPageSlug('/' + e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                            placeholder="hakkimizda"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                                    >
                                        Oluştur
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default WebsitePages;
