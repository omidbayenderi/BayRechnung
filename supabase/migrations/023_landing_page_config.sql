-- Landing Page Configuration Tables
-- Migration: 023_landing_page_config.sql

-- 1. Pricing Plans Table
CREATE TABLE IF NOT EXISTS public.landing_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id TEXT UNIQUE NOT NULL, -- e.g., 'standard', 'premium'
    name_key TEXT NOT NULL, -- translation key, e.g., 'standard'
    price_monthly NUMERIC NOT NULL,
    price_yearly NUMERIC NOT NULL,
    savings_percent NUMERIC DEFAULT 17,
    is_featured BOOLEAN DEFAULT false,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Videos Gallery Table
CREATE TABLE IF NOT EXISTS public.landing_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL, -- e.g., YouTube embed URL
    thumbnail_type TEXT DEFAULT 'icon', -- 'icon', 'image'
    icon_name TEXT, -- e.g., 'TrendingUp', 'Zap'
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Dynamic Sections Table (Headless CMS style)
CREATE TABLE IF NOT EXISTS public.landing_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- e.g., 'hero-alert', 'announcement'
    type TEXT NOT NULL, -- 'alert', 'banner', 'text-block'
    content JSONB NOT NULL, -- { "title": "...", "body": "...", "link": "..." }
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.landing_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- 5. Read Policies (Public)
CREATE POLICY "Public read landing_pricing" ON public.landing_pricing FOR SELECT USING (true);
CREATE POLICY "Public read landing_videos" ON public.landing_videos FOR SELECT USING (true);
CREATE POLICY "Public read landing_sections" ON public.landing_sections FOR SELECT USING (true);

-- 6. Write Policies (Admin only)
-- Note: Reuses the common check_is_admin() if exists, or checks email for MVP
CREATE POLICY "Admin write landing_pricing" ON public.landing_pricing 
    FOR ALL USING (auth.jwt()->>'email' = 'admin@bayrechnung.com');
CREATE POLICY "Admin write landing_videos" ON public.landing_videos 
    FOR ALL USING (auth.jwt()->>'email' = 'admin@bayrechnung.com');
CREATE POLICY "Admin write landing_sections" ON public.landing_sections 
    FOR ALL USING (auth.jwt()->>'email' = 'admin@bayrechnung.com');

-- 7. Seed Data
INSERT INTO public.landing_pricing (plan_id, name_key, price_monthly, price_yearly, is_featured, features)
VALUES 
('standard', 'standard', 19, 199, false, '["unlimitedInvoices", "customerManagement", "basicStock", "multiLanguageInvoices", "emailSupport", "mobileAccess", "pdfExport", "dashboardOverview"]'),
('premium', 'premium', 79, 799, true, '["everythingInStandard", "advancedReports", "fullStockPOS", "employeeManagement", "appointmentSystem", "websiteBuilder", "apiIntegrations", "prioritySupport", "multiUser", "customBranding", "notifications", "aiAssistant"]');

INSERT INTO public.landing_videos (title, video_url, icon_name, display_order)
VALUES 
('Create Invoices in 30s', 'https://www.youtube.com/embed/YOUR_ID_1', 'FileText', 1),
('AI Stock Assistant', 'https://www.youtube.com/embed/YOUR_ID_2', 'Bot', 2),
('Website Builder Demo', 'https://www.youtube.com/embed/YOUR_ID_3', 'Layout', 3);

INSERT INTO public.landing_sections (slug, type, content, is_active)
VALUES 
('hero-alert', 'alert', '{"text": "BayPilot AI Assistant is live!", "badge": "New", "link": "#action"}', true);
