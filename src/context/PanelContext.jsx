import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { usePlanGuard } from '../hooks/usePlanGuard';
import {
    LayoutDashboard, FileText, Settings, PlusCircle, Archive, BarChart3, Receipt, Repeat, Users, MessageSquare, // Existing
    Calendar, Clock, Monitor, ShoppingCart, Package, Globe, Layers, Command, Wrench, Shield, Map, CreditCard
} from 'lucide-react';

const PanelContext = createContext();

export const usePanel = () => useContext(PanelContext);

export const PanelProvider = ({ children }) => {
    const [activePanel, setActivePanel] = useState('accounting'); // accounting, appointments, stock, website
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { isPremium } = usePlanGuard();

    // Sync active panel with URL path on load/change
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/appointments')) setActivePanel('appointments');
        else if (path.startsWith('/stock')) setActivePanel('stock');
        else if (path.startsWith('/website')) setActivePanel('website');
        else if (path.startsWith('/admin')) setActivePanel('admin'); // Added for admin panel
        else setActivePanel('accounting'); // Default to accounting if no specific path matches
    }, [location.pathname]);

    const switchPanel = (panelId) => {
        setActivePanel(panelId);
        switch (panelId) {
            case 'accounting': navigate('/dashboard'); break;
            case 'appointments': navigate('/appointments/dashboard'); break;
            case 'stock': navigate('/stock/dashboard'); break;
            case 'website': navigate('/website/dashboard'); break;
            case 'admin': navigate('/admin'); break;
            default: navigate('/dashboard');
        }
    };

    const allModules = [
        {
            id: 'accounting',
            name: t('module_accounting_name'),
            icon: commandProps => <Command {...commandProps} />,
            desc: t('module_accounting_desc'),
            color: 'var(--primary)',
            premium: false
        },
        {
            id: 'appointments',
            name: t('module_appointments_name'),
            icon: calendarProps => <Calendar {...calendarProps} />,
            desc: t('module_appointments_desc'),
            color: '#8b5cf6', // Violet
            premium: true
        },
        {
            id: 'stock',
            name: t('module_stock_name'),
            icon: shoppingProps => <ShoppingCart {...shoppingProps} />,
            desc: t('module_stock_desc'),
            color: '#10b981', // Emerald
            premium: true
        },
        {
            id: 'website',
            name: t('module_website_name'),
            icon: globeProps => <Globe {...globeProps} />,
            desc: t('module_website_desc'),
            color: '#f59e0b', // Amber
            premium: true
        },
        {
            id: 'admin',
            name: t('module_admin_name'),
            icon: shieldProps => <Shield {...shieldProps} />,
            desc: t('module_admin_desc'),
            color: '#ef4444', // Red
            premium: false
        }
    ];

    // For locking UI, we filter modules based on premium status if not premium
    const modules = isPremium() ? allModules : allModules.filter(m => !m.premium);

    const getMenuItems = () => {
        const menu = [];
        switch (activePanel) {
            case 'admin':
                menu.push({ path: '/admin?tab=overview', icon: LayoutDashboard, label: t('dashboard') });

                // Only show Site Management if we are in Construction industry.
                // Assuming we will need to inject company profile or we can filter it in Sidebar.
                // We'll leave the item here with a special flag that Sidebar can filter, or import InvoiceContext.
                menu.push({ path: '/admin?tab=sites', icon: Map, label: t('site_management'), premium: true, industryOnly: ['Bauwesen / İnşaat', 'general_contractor', 'construction'] });

                menu.push(
                    { path: '/admin?tab=users', icon: Users, label: t('users'), premium: true },
                    { path: '/admin?tab=reports', icon: FileText, label: t('reports'), premium: true },
                    { path: '/admin?tab=messages', icon: MessageSquare, label: t('messages') },
                    { path: '/admin?tab=integrations', icon: Globe, label: t('integration_hub'), premium: true },
                    { path: '/admin?tab=subscription', icon: CreditCard, label: t('subscription_management') },
                    { path: '/admin?tab=settings', icon: Settings, label: t('settings') }
                );
                break;
            case 'appointments':
                menu.push(
                    { path: '/appointments/dashboard', icon: LayoutDashboard, label: t('menu_panel_summary') },
                    { path: '/appointments/calendar', icon: Calendar, label: t('menu_calendar') },
                    { path: '/appointments/bookings', icon: Clock, label: t('menu_bookings') },
                    { path: '/appointments/services', icon: Wrench, label: t('menu_services') },
                    { path: '/appointments/settings', icon: Settings, label: t('menu_settings') }
                );
                break;
            case 'stock':
                menu.push(
                    { path: '/stock/dashboard', icon: LayoutDashboard, label: t('menu_sales_summary') },
                    { path: '/stock/products', icon: Package, label: t('menu_products_stock') },
                    { path: '/stock/pos', icon: ShoppingCart, label: t('menu_pos') },
                    { path: '/stock/settings', icon: Settings, label: t('menu_settings') }
                );
                break;
            case 'website':
                menu.push(
                    { path: '/website/dashboard', icon: LayoutDashboard, label: t('menu_site_status') },
                    { path: '/website/editor', icon: Monitor, label: t('menu_site_editor') },
                    { path: '/website/settings', icon: Globe, label: t('menu_domain_settings') }
                );
                break;
            case 'accounting':
            default:
                // Existing Rechnung Menu
                menu.push(
                    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
                    { path: '/new', icon: PlusCircle, label: t('newInvoice') },
                    { path: '/archive', icon: Archive, label: t('archive') },
                    { path: '/quotes', icon: FileText, label: t('quotes') },
                    { path: '/reports', icon: BarChart3, label: t('reports') },
                    { path: '/expenses', icon: Receipt, label: t('expenses') },
                    { path: '/recurring', icon: Repeat, label: t('recurring') }
                );
                break;
        }
        return menu;
    };

    return (
        <PanelContext.Provider value={{ activePanel, setActivePanel, switchPanel, modules, getMenuItems }}>
            {children}
        </PanelContext.Provider>
    );
};
