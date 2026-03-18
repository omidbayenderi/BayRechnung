import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/accounting/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SystemHealth from './pages/admin/SystemHealth';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ProjectKanban from './pages/admin/ProjectKanban';
import SiteControlCenterPage from './pages/admin/SiteControlCenterPage';
import DeveloperControlCenter from './pages/admin/DeveloperControlCenter';
import NewInvoice from './pages/accounting/NewInvoice';
import Archive from './pages/accounting/Archive';
import CustomerPortal from './pages/public/CustomerPortal';
import Settings from './pages/settings/Settings';
import ProfileSettings from './pages/settings/ProfileSettings';
import InvoiceView from './pages/accounting/InvoiceView';
import Reports from './pages/accounting/Reports';
import Expenses from './pages/accounting/Expenses';
import Recurring from './pages/accounting/Recurring';
import Success from './pages/Success';
import InvoiceEdit from './pages/accounting/InvoiceEdit';
import Quotes from './pages/accounting/Quotes';
import NewQuote from './pages/accounting/NewQuote';
import UserManagement from './pages/settings/UserManagement';
import MessagesCenter from './pages/MessagesCenter';

import AppointmentDashboard from './pages/appointments/AppointmentDashboard';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';
import BookingsList from './pages/appointments/BookingsList';
import AppointmentSettings from './pages/appointments/AppointmentSettings';
import ServiceSettings from './pages/appointments/ServiceSettings';
import PublicBookingPage from './pages/appointments/PublicBookingPage';

import StockDashboard from './pages/stock/StockDashboard';
import ProductList from './pages/stock/ProductList';
import POS from './pages/stock/POS';
import StockSettings from './pages/stock/StockSettings';

import { WebsiteProvider } from './context/WebsiteContext';
import WebsiteDashboard from './pages/website/WebsiteDashboard';
import WebsiteEditor from './pages/website/WebsiteEditor';
import WebsitePages from './pages/website/WebsitePages';
import WebsiteBlogs from './pages/website/WebsiteBlogs';
import WebsiteStore from './pages/website/WebsiteStore';

import WebsiteSettings from './pages/website/WebsiteSettings';
import SiteWizard from './features/webbuilder/wizard/SiteWizard';
import PublicWebsite from './pages/public/PublicWebsite';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';

import { BayGuardProvider } from './context/BayGuardContext';
import RoleGuard from './components/auth/RoleGuardian';

// AI agents — lazy loaded so they don't block initial bundle
const BayGuardAgent   = React.lazy(() => import('./components/agents/BayGuardAgent'));
const BayPilot        = React.lazy(() => import('./components/agents/BayPilot'));
const BayCreative     = React.lazy(() => import('./components/agents/BayCreative'));
const BayTermin       = React.lazy(() => import('./components/agents/BayTermin'));
const BayInStock      = React.lazy(() => import('./components/agents/BayInStock'));
const BayGrowth       = React.lazy(() => import('./components/agents/BayGrowth'));
const BayGlobeAgent   = React.lazy(() => import('./components/agents/BayGlobeAgent'));
const InternalAutomator = React.lazy(() => import('./components/agents/InternalAutomator'));

import WorkerLayout from './components/worker/WorkerLayout';
import WorkerHome from './pages/worker/WorkerHome';
import DailyReport from './pages/worker/DailyReport';

import SecuritySettings from './pages/admin/SecuritySettings';
import Onboarding from './pages/admin/Onboarding';
import AdminCockpit from './pages/admin/cockpit/AdminCockpit';

import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { isAuthenticated, currentUser } = useAuth();

  // Domain detection logic
  const hostname = window.location.hostname;
  const platformDomain = 'bayzenit.com';

  // Detect if this is a platform subdomain: firmaadi.bayzenit.com
  const isPlatformSubdomain = hostname.endsWith(`.${platformDomain}`) &&
    hostname !== `www.${platformDomain}` &&
    hostname !== platformDomain;

  // Extract slug from subdomain: firmaadi.bayzenit.com → 'firmaadi'
  const subdomainSlug = isPlatformSubdomain
    ? hostname.replace(`.${platformDomain}`, '').replace('www.', '')
    : null;

  // A truly custom domain (not bayzenit.com and not vercel/supabase)
  const isTrulyCustomDomain = hostname !== 'localhost' &&
    hostname !== 'bayrechnung.com' &&
    hostname !== platformDomain &&
    hostname !== `www.${platformDomain}` &&
    !hostname.endsWith('.vercel.app') &&
    !hostname.endsWith('.supabase.co') &&
    !isPlatformSubdomain; // custom domains handled separately

  // Combined: show public website for both platform subdomains AND custom domains
  const isPublicSite = isPlatformSubdomain || isTrulyCustomDomain;

  // The effective domain/slug to pass to PublicWebsite
  const effectivePublicDomain = subdomainSlug || hostname;

  // Use a global to ensure only one log ever (even with remounts/StrictMode)
  const logHostname = () => {
    if (window._bay_hostname_logged) return;
    window._bay_hostname_logged = true;
    console.warn('🌐 [App] Hostname:', window.location.hostname,
      '| isPlatformSubdomain:', isPlatformSubdomain,
      '| subdomainSlug:', subdomainSlug,
      '| isTrulyCustomDomain:', isTrulyCustomDomain
    );
    console.log('🚀 [BayRechnung] VERSION: 2.1 - Supabase Sync Fix Active');
  };

  React.useEffect(() => {
    logHostname();
  }, []);

  return (
    <ThemeProvider>
      <BayGuardProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/booking" element={<PublicBookingPage />} />
            <Route path="/success" element={<Success />} />
            <Route path="/portal/:token" element={<CustomerPortal />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* 1. Public External Website (Custom Domain or Subdomain based) */}
            {isPublicSite ? (
              // When accessed via subdomain (firmaadi.bayzenit.com), ALL paths go to PublicWebsite
              <Route path="/*" element={
                <WebsiteProvider>
                  <PublicWebsite customDomain={effectivePublicDomain} />
                </WebsiteProvider>
              } />
            ) : (
              // Normal platform: show landing at "/"
              <Route path="/" element={<LandingPage />} />
            )}

            {/* Path-based fallback: bayzenit.com/s/firmaadi (always available) */}
            <Route path="/s/:domain/*" element={
              <WebsiteProvider>
                <PublicWebsite />
              </WebsiteProvider>
            } />

            {/* 2. Public Platform Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/admin" /> : <Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            {/* Legacy Path Fix */}
            <Route path="/Rechnung/*" element={<Navigate to="/admin" replace />} />

            {/* 3. Internal Application Routes (WITH BayPilot & Co.) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<InternalAgentWrapper />}>
                <Route element={<Layout />}>
                  {/* Admin Role Only */}
                  <Route element={<RoleGuard allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/cockpit" element={<AdminCockpit />} />
                    <Route path="/admin/health" element={<SystemHealth />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/kanban" element={<ProjectKanban />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/admin/sites" element={<SiteControlCenterPage />} />
                    <Route path="/developer/control-center" element={
                      currentUser?.email?.toLowerCase() === 'admin@bayrechnung.com' ? <DeveloperControlCenter /> : <Navigate to="/admin" />
                    } />
                  </Route>

                  <Route element={<RoleGuard allowedRoles={['admin', 'finance']} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/new" element={<NewInvoice />} />
                    <Route path="/quotes" element={<Quotes />} />
                    <Route path="/quotes/new" element={<NewQuote />} />
                    <Route path="/archive" element={<Archive />} />
                    <Route path="/reports" element={<Reports />} />
                  </Route>

                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/recurring" element={<Recurring />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/profile" element={<ProfileSettings />} />
                  <Route path="/settings/security" element={<SecuritySettings />} />

                  <Route path="/invoice/:id" element={<InvoiceView type="invoice" />} />
                  <Route path="/quote/:id" element={<InvoiceView type="quote" />} />
                  <Route path="/invoice/:id/edit" element={<InvoiceEdit type="invoice" />} />
                  <Route path="/quote/:id/edit" element={<InvoiceEdit type="quote" />} />

                  <Route path="/messages" element={<MessagesCenter />} />
                  <Route path="/onboarding" element={<Onboarding />} />

                  {/* Appointment System */}
                  <Route path="/appointments/*" element={
                    <RoleGuard allowedRoles={['admin', 'finance', 'site_lead']}>
                      <Routes>
                        <Route path="dashboard" element={<AppointmentDashboard />} />
                        <Route path="calendar" element={<AppointmentCalendar />} />
                        <Route path="bookings" element={<BookingsList />} />
                        <Route path="services" element={<ServiceSettings />} />
                        <Route path="settings" element={<AppointmentSettings />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </RoleGuard>
                  } />

                  {/* Stock & Sales Panel */}
                  <Route path="/stock/*" element={
                    <RoleGuard allowedRoles={['admin', 'site_lead', 'finance']}>
                      <Routes>
                        <Route path="" element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<StockDashboard />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="pos" element={<POS />} />
                        <Route path="settings" element={<StockSettings />} />
                        <Route path="*" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </RoleGuard>
                  } />

                  {/* Website Builder */}
                  <Route path="/website/*" element={
                    <RoleGuard allowedRoles={['admin']}>
                      <Routes>
                        <Route path="dashboard" element={<WebsiteDashboard />} />
                        <Route path="wizard" element={<SiteWizard />} />
                        <Route path="editor" element={<WebsiteEditor />} />
                        <Route path="pages" element={<WebsitePages />} />
                        <Route path="blogs" element={<WebsiteBlogs />} />
                        <Route path="store" element={<WebsiteStore />} />

                        <Route path="settings" element={<WebsiteSettings />} />
                        <Route path="*" element={<Navigate to="/website/dashboard" replace />} />
                      </Routes>
                    </RoleGuard>
                  } />

                  {/* Worker Specific */}
                  <Route path="/worker" element={<RoleGuard allowedRoles={['worker', 'admin', 'site_lead']} redirectToLogin={true}><WorkerLayout /></RoleGuard>}>
                    <Route index element={<Navigate to="/worker/home" replace />} />
                    <Route path="home" element={<WorkerHome />} />
                    <Route path="report" element={<DailyReport />} />
                    <Route path="notifications" element={<MessagesCenter />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </BayGuardProvider>
    </ThemeProvider>
  );
}

// Lazy-loaded agents wrapped in Suspense (null fallback = agents don't block UI)
const InternalAgentWrapper = () => (
  <React.Suspense fallback={null}>
    <BayGuardAgent />
    <BayCreative />
    <BayTermin />
    <BayInStock />
    <BayGrowth />
    <BayPilot />
    <BayGlobeAgent />
    <InternalAutomator />
    <Outlet />
  </React.Suspense>
);

export default App;
