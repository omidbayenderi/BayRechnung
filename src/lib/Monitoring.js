/**
 * BayRechnung Monitoring & Analytics Service
 * Centralized logging for errors and user behavior.
 */

class MonitoringService {
    constructor() {
        this.env = import.meta.env.MODE;
        this.isDevelopment = this.env === 'development';
    }

    /**
     * Log an error to the monitoring system
     */
    logError(error, info = {}) {
        const errorData = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack,
            componentStack: info.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        if (this.isDevelopment) {
            console.group('%c[ERROR MONITOR]', 'background: #ef4444; color: white; padding: 2px 5px;');
            console.error(errorData);
            console.groupEnd();
        } else {
            // In production, send to service like Sentry or LogLib
            // fetch('https://analytics.bayrechnung.com/errors', { method: 'POST', body: JSON.stringify(errorData) });
        }
    }

    /**
     * Track a user event (page view, button click, etc)
     */
    trackEvent(eventName, params = {}) {
        const eventData = {
            timestamp: new Date().toISOString(),
            event: eventName,
            ...params
        };

        if (this.isDevelopment) {
            console.log(`%c[EVENT]: ${eventName}`, 'color: #3b82f6; font-weight: bold;', params);
        } else {
            // Send to analytics provider (GA4, Mixpanel, etc)
        }
    }
}

export const monitoring = new MonitoringService();
