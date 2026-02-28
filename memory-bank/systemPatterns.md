# System Patterns: BayRechnung

## Architecture Overview
The application is built using React (Vite) and Supabase. It follows a "Local-First, Sync-Later" pattern to ensure reliability and performance.

## Key Technical Decisions
1. **SyncService Engine**: A centralized service (`SyncService.js`) manages a persistent queue of database operations. 
   - **Batch Processing**: Operations are grouped to improve efficiency.
   - **Schema Compliance Layer**: Automatically strips unexpected fields before database writes to prevent sync failures during schema evolution.
   - **Force Sync**: Provides a manual override for browsers (like Safari) that may misreport online status.
2. **Context-Driven State**:
   - `AuthContext`: Manages user profiles with "Skeleton" mode support for faster initial renders. Includes guards against stale closures and stuck loading states.
   - `InvoiceContext`, `StockContext`, `AppointmentContext`: Standardized data provision with "Empty-DB Guards" that protect local data from being overwritten by empty network responses during pending syncs.
3. **Responsive Glassmorphism UI**: Uses Vanilla CSS with modern patterns (sticky headers, grid layouts) to provide a premium feel without the overhead of heavy frameworks.

## Data Patterns
- **Standardization**: Field names are mapped between JS-friendly camelCase (UI) and DB-friendly snake_case.
- **Deduplication**: Sync queue consolidation prevents multiple redundant updates for the same record.
- **Safety Fallback**: QR Code components (InvoicePaper) use multi-provider fallbacks (QuickChart -> QRServer) to ensure 100% availability.
