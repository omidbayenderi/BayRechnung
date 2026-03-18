-- Migration: Add Cover Image to Blog Posts
-- Description: Adds a column for the cover image URL to the blog_posts table

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
