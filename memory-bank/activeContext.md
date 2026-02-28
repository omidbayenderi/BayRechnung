# Active Context: BayRechnung

## Current State
All core modules (Invoices, Appointments, Stock, Admin) are functional and synced with Supabase. Recent focus has been on application stability (crash fixes), data persistence for recurring items, and comprehensive localization.

## Recent Changes (Last Session Highlights)
- **Sync Reliability**:
  - Refactored `SyncService.js` to use batch processing.
  - Implemented **Schema Safety Layer** to strip non-DB columns (e.g., `services.description`, `products.supplier_info`) before sync, preventing operations from failing due to schema mismatches.
  - Added **Manual Force Sync** ("Buluta Gönder" button) to resolve Safari's false-offline reporting issue.
- **App Resilience & Crash Fixes**:
  - `UserManagement`: Added null-safe checks (`?.`) for employee names/emails to prevent filter crashes.
  - `MessagesCenter`: Fixed crash by correctly injecting `AuthContext` and resolving `t` function shadowing.
  - Resolved Vite/Babel build error caused by duplicate imports.
- **Data Persistence**:
  - `InvoiceContext`: Fixed recurring template key mismatch (`bay_recurring_` -> `bay_recurring_templates_`).
  - Verified `mergeWithLocalQueue` logic in `InvoiceContext` and `AppointmentContext` to prevent data loss.
- **Localization (i18n)**:
  - Fully localized "Reports Hub" across all 5 languages.
  - Localized "Strategic Insights" block in Admin Panel with dynamic tax rate placeholders.

## Active Decisions
- **Manual Overrides**: We provide manual sync buttons because browser-level networking state (`navigator.onLine`) is historically unreliable in certain PWA-like scenarios.
- **Schema Decoupling**: The app can evolve faster than the database by allowing extra data fields to exist locally without breaking cloud sync.

## Known Issues (Next Steps)
- **Database Alignment**: Eventually, migrations should be run to add the `description` column to `services` and `supplier_info` to `products` to fully persist all captured data.
- **Audit Logging**: Ensure all security actions are properly reaching the `audit_logs` table (requires table existence check).
