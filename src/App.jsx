import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SystemHealth from './pages/admin/SystemHealth';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ProjectKanban from './pages/admin/ProjectKanban';
import SiteControlCenterPage from './pages/admin/SiteControlCenterPage';
import DeveloperControlCenter from './pages/admin/DeveloperControlCenter';
import NewInvoice from './pages/NewInvoice';
import Archive from './pages/Archive';
import CustomerPortal from './pages/public/CustomerPortal';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
import InvoiceView from './pages/InvoiceView';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import Recurring from './pages/Recurring';
import Success from './pages/Success';
import InvoiceEdit from './pages/InvoiceEdit';
import Quotes from './pages/Quotes';
import NewQuote from './pages/NewQuote';
import UserManagement from './pages/UserManagement';
import MessagesCenter from './pages/MessagesCenter';
import { PanelProvider } from './context/PanelContext';
import { StockProvider } from './context/StockContext';

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
import WebsiteSettings from './pages/website/WebsiteSettings';
import PublicWebsite from './pages/public/PublicWebsite';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';

import { BayGuardProvider } from './context/BayGuardContext';
import BayGuardAgent from './components/agents/BayGuardAgent';
import BayPilot from './components/agents/BayPilot'; // New User Assistant
import BayCreative from './components/agents/BayCreative';
import BayTermin from './components/agents/BayTermin';
import BayInStock from './components/agents/BayInStock';
import BayGrowth from './components/agents/BayGrowth';
import BayGlobeAgent from './components/agents/BayGlobeAgent';
import { useBayVision } from './context/BayVisionContext';
import RoleGuardian from './components/auth/RoleGuardian';
import ConnectionDiagnostics from './components/Debug/ConnectionDiagnostics';

import WorkerLayout from './components/worker/WorkerLayout';
import WorkerHome from './pages/worker/WorkerHome';
import DailyReport from './pages/worker/DailyReport';

import SecuritySettings from './pages/admin/SecuritySettings';
import Onboarding from './pages/admin/Onboarding';

function App() {
  const { isAuthenticated, currentUser } = useAuth();
  const vision = useBayVision(); // CEO Agent

  // Domain detection logic
  const hostname = window.location.hostname;
  const isCustomDomain = hostname !== 'localhost' && hostname !== 'bayrechnung.com' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.supabase.co');

  if (isCustomDomain) {
    return (
      <WebsiteProvider>
        <PublicWebsite customDomain={hostname} />
      </WebsiteProvider>
    );
  }

  return (
    <BayGuardProvider>
      <Routes>
        {/* 1. Public External Website (NO Internal Agents) */}
        <Route path="/s/:domain" element={
          <WebsiteProvider>
            <PublicWebsite />
          </WebsiteProvider>
        } />

        {/* 2. Public Platform Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/admin" /> : <Register />} />
        <Route path="/success" element={<Success />} />
        <Route path="/booking" element={<PublicBookingPage />} />
        <Route path="/portal/:token" element={<CustomerPortal />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Legacy Path Fix */}
        <Route path="/Rechnung/*" element={<Navigate to="/admin" replace />} />

        {/* 3. Internal Application Routes (WITH BayPilot & Co.) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<InternalAgentWrapper />}>
            <Route element={<Layout />}>
              {/* Admin Role Only */}
              <Route element={<RoleGuardian allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/health" element={<SystemHealth />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/kanban" element={<ProjectKanban />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/admin/sites" element={<SiteControlCenterPage />} />
                <Route path="/developer/control-center" element={
                  currentUser?.email?.toLowerCase() === 'admin@bayrechnung.com' ? <DeveloperControlCenter /> : <Navigate to="/admin" />
                } />
              </Route>

              <Route element={<RoleGuardian allowedRoles={['admin', 'finance']} />}>
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
                <RoleGuardian allowedRoles={['admin', 'finance', 'site_lead']}>
                  <Routes>
                    <Route path="dashboard" element={<AppointmentDashboard />} />
                    <Route path="calendar" element={<AppointmentCalendar />} />
                    <Route path="bookings" element={<BookingsList />} />
                    <Route path="services" element={<ServiceSettings />} />
                    <Route path="settings" element={<AppointmentSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </RoleGuardian>
              } />

              {/* Stock & Sales Panel */}
              <Route path="/stock/*" element={
                <RoleGuardian allowedRoles={['admin', 'site_lead', 'finance']}>
                  <Routes>
                    <Route path="" element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<StockDashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="settings" element={<StockSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </RoleGuardian>
              } />

              {/* Website Builder */}
              <Route path="/website/*" element={
                <RoleGuardian allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<WebsiteDashboard />} />
                    <Route path="editor" element={<WebsiteEditor />} />
                    <Route path="settings" element={<WebsiteSettings />} />
                    <Route path="*" element={<Navigate to="/website/dashboard" replace />} />
                  </Routes>
                </RoleGuardian>
              } />

              {/* Worker Specific */}
              <Route path="/worker" element={<RoleGuardian allowedRoles={['worker', 'admin', 'site_lead']} redirectToLogin={true}><WorkerLayout /></RoleGuardian>}>
                <Route index element={<Navigate to="/worker/home" replace />} />
                <Route path="home" element={<WorkerHome />} />
                <Route path="report" element={<DailyReport />} />
                <Route path="notifications" element={<MessagesCenter />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BayGuardProvider>
  );
}

// Helper to wrap Internal Agents (only for logged-in management area)
const InternalAgentWrapper = () => (
  <>
    <BayGuardAgent />
    <BayCreative />
    <BayTermin />
    <BayInStock />
    <BayGrowth />
    <BayPilot />
    <BayGlobeAgent />
    <Outlet />
  </>
);

export default App;
