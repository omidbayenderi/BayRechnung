import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { db, storage } from '../../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';

const MediaGalleryModal = ({ isOpen, onClose, onSelect }) => {
    const { currentUser } = useAuth();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchGallery = async () => {
            if (!currentUser || !isOpen) return;
            try {
                const docRef = doc(db, 'website_business', currentUser.uid);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().gallery) {
                    setImages(snap.data().gallery);
                }
            } catch (err) {
                console.error('Error fetching gallery:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, [currentUser, isOpen]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            const storageRef = ref(storage, `websites/${currentUser.uid}/gallery/${Date.now()}_${file.name}`);
            const uploadSnap = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(uploadSnap.ref);

            const docRef = doc(db, 'website_business', currentUser.uid);
            await updateDoc(docRef, {
                gallery: arrayUnion(url)
            });

            setImages(prev => [...prev, url]);
            toast.success('Görsel galeriye eklendi.');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Görsel yüklenemedi.');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                width: '800px',
                maxWidth: '90%',
                maxHeight: '80vh',
                background: 'white',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>Medya Galerisi</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                        {/* Upload Button */}
                        <label style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            color: '#64748b',
                            transition: 'all 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                            <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
                            {uploading ? <Loader2 size={32} className="spin" /> : <Upload size={32} />}
                            <span style={{ fontSize: '0.85rem', marginTop: '8px', fontWeight: '500' }}>Görsel Yükle</span>
                        </label>

                        {/* Images */}
                        {images.map((url, i) => (
                            <div 
                                key={i} 
                                onClick={() => onSelect(url)}
                                style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    aspectRatio: '1',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                <img src={url} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="overlay" style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.4)',
                                    opacity: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s',
                                    color: 'white'
                                }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                    <Check size={32} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {loading && <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} className="spin" /></div>}
                    {!loading && images.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            <p>Henüz yüklenmiş bir görsel bulunmuyor.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>İptal</button>
                </div>
            </div>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MediaGalleryModal;
