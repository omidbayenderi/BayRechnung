import React from 'react';
import SiteControlCenter from '../../components/SiteControlCenter';
import { useLanguage } from '../../context/LanguageContext';

const SiteControlCenterPage = () => {
    const { t } = useLanguage();

    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>{t('site_control_center') || 'Şantiye Kontrol Merkezi'}</h1>
                    <p style={{ color: '#64748b' }}>Tüm projeleri tek ekrandan izleyin ve yönetin.</p>
                </div>
            </header>

            <SiteControlCenter t={t} />
        </div>
    );
};

export default SiteControlCenterPage;
