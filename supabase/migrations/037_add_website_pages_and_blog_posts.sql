-- Migration: Add Website Pages and Blog Posts Tables
-- Description: Creates missing tables for the website builder and blog management system

-- 1. Website Pages Table
CREATE TABLE IF NOT EXISTS public.website_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    sections JSONB DEFAULT '[]'::jsonb,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Fix website_configs missing columns
ALTER TABLE public.website_configs ADD COLUMN IF NOT EXISTS advanced JSONB DEFAULT '{"customCss": "", "headScripts": "", "bodyScripts": ""}'::jsonb;

-- 4. Enable RLS
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Users can manage own website pages" ON public.website_pages 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own blog posts" ON public.blog_posts 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view published pages" ON public.website_pages
    FOR SELECT USING (true);

CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (is_published = true);

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_website_pages_user_id ON public.website_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON public.blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
