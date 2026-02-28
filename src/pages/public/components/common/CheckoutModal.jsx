
import React from 'react';
import {
    ShoppingBag, ChevronLeft, X, Trash2, ArrowRight, User, MapPin,
    CreditCard, Phone, Package, Download, ExternalLink
} from 'lucide-react';

const CheckoutModal = ({
    isOpen, onClose, theme,
    step, setStep,
    cart, updateQuantity, removeFromCart,
    total, subtotal, discountCode, setDiscountCode, handleApplyDiscount, discountAmount, appliedDiscount,
    currentUser, setCurrentUser,
    authMode, setAuthMode, authForm, setAuthForm, handleAuthAction,
    handlePlaceOrder, profile, // Company profile for payment links
    t // Translation function
}) => {
    if (!isOpen) return null;

    const inputStyle = {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none',
        transition: 'border-color 0.2s', marginBottom: '8px'
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

                {/* Modal Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {step !== 'cart' && (
                            <button onClick={() => setStep(step === 'payment' ? 'address' : step === 'address' ? (currentUser ? 'cart' : 'auth') : 'cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft color="#64748b" /></button>
                        )}
                        <ShoppingBag color={theme.primaryColor} />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
                            {step === 'cart' ? `${t('cart_title')} (${cart.length})` :
                                step === 'auth' ? t('auth_title') :
                                    step === 'address' ? t('address_title') : t('payment_title')}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X /></button>
                </div>

                {/* Content Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

                    {/* --- STEP 1: CART --- */}
                    {step === 'cart' && (
                        <>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                    <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                    <p>{t('cart_empty_msg')}</p>
                                    <button onClick={onClose} style={{ marginTop: '10px', color: theme.primaryColor, background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t('cart_start_shopping')}</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {cart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px' }}>
                                                {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ShoppingBag size={20} color="#cbd5e1" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</div>
                                                <div style={{ color: theme.primaryColor, fontWeight: 'bold' }}>{Number(item.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                                                <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><Trash2 size={18} /></button>
                                        </div>
                                    ))}

                                    {/* Discount Input */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                        <input type="text" placeholder={t('cart_discount_placeholder')} value={discountCode} onChange={e => setDiscountCode(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                        <button onClick={handleApplyDiscount} style={{ padding: '0 16px', background: '#334155', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>{t('cart_apply_discount')}</button>
                                    </div>

                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.95rem' }}>
                                            <span>{t('cart_subtotal')}</span>
                                            <span>{subtotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontSize: '0.95rem' }}>
                                                <span>{t('cart_discount')}</span>
                                                <span>-{discountAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginTop: '12px', marginBottom: '20px' }}>
                                            <span>{t('cart_total')}</span>
                                            <span>{total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                        </div>
                                        <button
                                            onClick={() => setStep(currentUser ? 'address' : 'auth')}
                                            style={{ width: '100%', padding: '16px', background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        >
                                            {t('cart_checkout_btn')} <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- STEP 2: AUTH --- */}
                    {step === 'auth' && (
                        <div style={{ padding: '20px 0' }}>
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: theme.primaryColor }}>
                                    <User size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                    {authMode === 'login' ? t('auth_welcome') : t('auth_new_account')}
                                </h3>
                                <p style={{ color: '#64748b' }}>{t('auth_desc')}</p>
                            </div>

                            <form onSubmit={handleAuthAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {authMode === 'register' && (
                                    <input type="text" placeholder={t('form_fullname')} required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} style={inputStyle} />
                                )}
                                <input type="email" placeholder={t('form_email')} required value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} style={inputStyle} />
                                <input type="password" placeholder={t('form_password')} required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} style={inputStyle} />
                                {authMode === 'register' && (
                                    <>
                                        <input type="tel" placeholder={t('form_phone')} required value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} style={inputStyle} />

                                        {/* Professional Address Inputs */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{t('form_address_title')}</label>
                                            <input
                                                type="text" placeholder={t('form_street')} required
                                                value={authForm.street || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setAuthForm(prev => ({
                                                        ...prev, street: val,
                                                        address: `${val}, ${prev.zip || ''} ${prev.city || ''}, ${prev.country || 'Almanya'}`
                                                    }));
                                                }}
                                                style={inputStyle}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                                <input
                                                    type="text" placeholder={t('form_zip')} required
                                                    value={authForm.zip || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setAuthForm(prev => ({
                                                            ...prev, zip: val,
                                                            address: `${prev.street || ''}, ${val} ${prev.city || ''}, ${prev.country || 'Almanya'}`
                                                        }));
                                                    }}
                                                    style={inputStyle}
                                                />
                                                <input
                                                    type="text" placeholder={t('form_city')} required
                                                    value={authForm.city || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setAuthForm(prev => ({
                                                            ...prev, city: val,
                                                            address: `${prev.street || ''}, ${prev.zip || ''} ${val}, ${prev.country || 'Almanya'}`
                                                        }));
                                                    }}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <input
                                                type="text" placeholder={t('form_country')}
                                                value={authForm.country || 'Almanya'}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setAuthForm(prev => ({
                                                        ...prev, country: val,
                                                        address: `${prev.street || ''}, ${prev.zip || ''} ${prev.city || ''}, ${val}`
                                                    }));
                                                }}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </>
                                )}

                                <button type="submit" style={{ padding: '16px', background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                                    {authMode === 'login' ? t('btn_login') : t('btn_register')}
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: theme.primaryColor, fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                                    {authMode === 'login' ? t('auth_no_account') : t('auth_have_account')}
                                </button>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                <button onClick={() => { setCurrentUser({ email: 'guest@bayrechnung.com', name: 'Misafir', address: '', phone: '' }); setStep('address'); }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    {t('auth_continue_as_guest')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: ADDRESS --- */}
                    {step === 'address' && (
                        <div>
                            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                                <MapPin size={24} color="#d97706" />
                                <div>
                                    <h4 style={{ margin: '0 0 4px', color: '#92400e' }}>{t('address_confirm_title')}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#b45309' }}>{t('address_confirm_desc')}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{t('form_fullname')}</label>
                                    <input type="text" value={currentUser?.name || ''} onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{t('form_phone')}</label>
                                    <input type="tel" value={currentUser?.phone || ''} onChange={e => setCurrentUser({ ...currentUser, phone: e.target.value })} placeholder="0555 123 45 67" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>{t('form_address_title')}</label>
                                    <textarea rows="4" value={currentUser?.address || ''} onChange={e => setCurrentUser({ ...currentUser, address: e.target.value })} placeholder={t('form_full_address_placeholder')} style={inputStyle} />
                                </div>
                            </div>
                            <button onClick={() => { if (!currentUser.address || currentUser.address.length < 5) { alert(t('address_validation_error')); return; } setStep('payment'); }} style={{ width: '100%', marginTop: '30px', padding: '16px', background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                {t('btn_confirm_address_and_pay')}
                            </button>
                        </div>
                    )}

                    {/* --- STEP 4: PAYMENT --- */}
                    {step === 'payment' && (
                        <div>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                            </div>
                            <p style={{ fontWeight: '600', marginBottom: '12px', color: '#334155', fontSize: '0.9rem' }}>Ödeme Yöntemi Seçiniz:</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {(profile?.stripeLink || profile?.stripeApiKey) && (
                                    <button onClick={async () => {
                                        try {
                                            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ceqitkloquydkgxwikvk.supabase.co'}/functions/v1/create-checkout-session`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    orderId: `ORD-${Date.now()}`,
                                                    amount: Math.round(total * 100), // convert to cents
                                                    currency: 'eur',
                                                    customerEmail: currentUser.email,
                                                    customerName: currentUser.name,
                                                    items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
                                                    stripeAccountId: profile.stripe_account_id || null
                                                })
                                            });
                                            const data = await response.json();
                                            if (data.url) {
                                                window.location.href = data.url;
                                            } else {
                                                throw new Error('No checkout URL returned.');
                                            }
                                        } catch (e) {
                                            console.error('Stripe error:', e);
                                            alert('Ödeme başlatılırken bir hata oluştu. Lütfen tekrar deneyin.');
                                        }
                                    }} style={{ background: 'white', border: '2px solid #e2e8f0', color: '#1e293b', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: '#635bff', padding: '8px', borderRadius: '8px', color: 'white' }}><CreditCard size={20} /></div>Kredi Kartı ile Öde (Stripe)</button>
                                )}
                                <button onClick={handlePlaceOrder} style={{ background: 'white', border: '2px solid #e2e8f0', color: '#1e293b', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: '#f59e0b', padding: '8px', borderRadius: '8px', color: 'white' }}><ShoppingBag size={20} /></div>Kapıda Ödeme / Havale</button>
                            </div>
                            <button onClick={handlePlaceOrder} style={{ width: '100%', marginTop: '30px', padding: '18px', background: theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>Siparişi Onayla</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
