# Production Deployment Guide

Follow these steps to deploy the application to a production environment.

## 1. Environment Variables
Ensure the following variables are set in your production environment (e.g., Vercel, Netlify, or your local `.env.production` file).

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Public Key |
| `VITE_PROD_MODE` | Set to `true` to disable mock user fallbacks |

## 2. Supabase Storage Setup
The application uses Supabase Storage for logos, avatars, and attachments. You MUST create the following buckets and set them to **Public**.

1.  **`avatars`**: Stores user profile pictures.
2.  **`logos`**: Stores company logos.
3.  **`products`**: Stores product images for the stock system.
4.  **`attachments`**: Stores receipt scans and other document attachments.

## 3. Database Migrations
Apply all migration files in the `supabase/migrations/` directory to your production database.

> [!IMPORTANT]
> Ensure the latest migration [021_recurring_and_settings.sql](file:///Users/omidbayanadarimoghaddam/BayRechnung/supabase/migrations/021_recurring_and_settings.sql) is applied to support recurring templates and module-specific settings.

## 4. Key Performance Features
The application is optimized for production with:
- **Memoized Contexts**: Prevents unnecessary re-renders in heavy modules like Invoicing and Stock management.
- **Offline Sync**: Uses `SyncService` to queue operations if the connection is lost.
- **Security**: Strict Row Level Security (RLS) policies ensure data isolation between users.

## 5. Verification Checklist
- [ ] Login with a real Supabase user works.
- [ ] Profile picture upload works (check the `avatars` bucket).
- [ ] Company logo upload works (check the `logos` bucket).
- [ ] CTRL+K opens the global search palette.
- [ ] Real-time notifications appear for critical events (e.g., setting a low stock item).

**Deployment complete!**
