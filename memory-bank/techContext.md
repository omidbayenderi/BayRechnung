# Tech Context: BayRechnung

## Core Stack
- **Frontend**: React (Functional Components, Hooks), Vite (Build Tool).
- **Backend-as-a-Service**: Supabase (Auth, Postgres DB, Storage).
- **Styling**: Vanilla CSS with modern flexbox/grid architecture.
- **Icons**: Lucide React.
- **Animations**: Framer Motion.

## Environment Configuration
- `VITE_SUPABASE_URL`: Project URL.
- `VITE_SUPABASE_ANON_KEY`: Public API key.
- `VITE_PROD_MODE`: Toggle for production features (e.g., login fallbacks).

## Development Setup
- **Package Manager**: NPM.
- **Diagnostics**: Built-in `ConnectionDiagnostics` component (accessible to admins) for real-time monitoring of DB health and sync status.
- **Caching**: Local-first via `localStorage`, used for both UI state and the synchronization queue.

## Constraints & Dependencies
- **Browser Compatibility**: Safari (iOS/macOS), Chrome, Firefox. Special logic included for Safari's inconsistent `navigator.onLine` reporting.
- **Data Integrity**: Enforced via "Empty-DB Guards" in React Contexts to prevent local data loss from network race conditions.
- **QR APIs**: External dependencies on QuickChart and QRServer (fallback).
