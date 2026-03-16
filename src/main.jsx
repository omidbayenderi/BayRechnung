import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { InvoiceProvider } from './context/InvoiceContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppointmentProvider } from './context/AppointmentContext.jsx';
import { FeatureFlagProvider } from './context/FeatureFlagContext.jsx';
import { WebsiteProvider } from './context/WebsiteContext.jsx';
import { BayVisionProvider } from './context/BayVisionContext.jsx';
import { StockProvider } from './context/StockContext.jsx';
import { PanelProvider } from './context/PanelContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';
import App from './App.jsx';

// Handle legacy path redirect (if needed) or just start
console.log('🚀 BayRechnung starting...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Failed to find the root element');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <FeatureFlagProvider>
                <InvoiceProvider>
                  <AppointmentProvider>
                    <NotificationProvider>
                      <StockProvider>
                        <PanelProvider>
                          <WebsiteProvider>
                            <BayVisionProvider>
                              <App />
                            </BayVisionProvider>
                          </WebsiteProvider>
                        </PanelProvider>
                      </StockProvider>
                    </NotificationProvider>
                  </AppointmentProvider>
                </InvoiceProvider>
              </FeatureFlagProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
