# Active Context: BayRechnung

## Current State
All core modules (Invoices, Appointments, Stock, Admin) are functional and synced with Supabase. Recent focus has been on application stability (crash fixes), data persistence for recurring items, and comprehensive localization.

## Recent Changes (Last Session Highlights)
- **Sync & Schema Resilience**:
  - Implemented **Schema Safety Layer** to strip non-DB columns (`services.color`, `services.icon`, `services.image_url`) before sync, preventing operations from failing due to schema mismatches until SQL migrations are run.
  - Added **Sync Error Queue** to `SyncService.js` to capture and report 400 Bad Request / Schema errors to the user UI.
  - Added **Manual Force Sync** ("Buluta Gönder" button) to resolve Safari's false-offline reporting issue.
- **Subdomain & Routing Fixes**:
  - Improved `PublicWebsite.jsx` and `PublicBookingPage.jsx` to correctly detect subdomains like `bayenderi.bayzenit.com` vs path-based `/s/bayenderi`.
  - Fixed logic to avoid duplicate/incorrect slug detection across `bayzenit.com`, `bayrechnung.com` and `vercel.app`.
- **App Resilience & Crash Fixes**:
  - `UserManagement`: Added null-safe checks (`?.`) for employee names/emails to prevent filter crashes.
  - `MessagesCenter`: Fixed crash by correctly injecting `AuthContext` and resolving `t` function shadowing.
  - Resolved Vite/Babel build error caused by duplicate imports.
- **Data Persistence**:
  - `InvoiceContext`: Fixed recurring template key mismatch (`bay_recurring_` -> `bay_recurring_templates_`).
  - Verified `mergeWithLocalQueue` logic in `InvoiceContext` and `AppointmentContext` to prevent data loss.
- **UI/UX Aesthetics & Resilience**:
  - Fully localized "Reports Hub" across all 5 languages.
  - Fixed **Chart Rendering Warnings** in `SystemOverview.jsx` by adding `minHeight` and fixing `ResponsiveContainer` widths.
  - Enhanced `StandardTheme` in `PublicWebsite` to use dynamic Lucide icons for services if image_url is missing.
  - Added Turkish translation keys for SEO and Brand sections.

## Active Decisions
- **Manual Overrides**: We provide manual sync buttons because browser-level networking state (`navigator.onLine`) is historically unreliable in certain PWA-like scenarios.
- **Schema Decoupling**: The app can evolve faster than the database by allowing extra data fields to exist locally without breaking cloud sync.

## Known Issues (Next Steps)
- **Database Alignment**: SQL migrations are **REQUIRED** to add `color`, `icon`, and `image_url` columns to `services`, and `image_url` to `products` to ensure full data persistence in Supabase.
- **Audit Logging**: Ensure all security actions are properly reaching the `audit_logs` table (requires table existence check).
