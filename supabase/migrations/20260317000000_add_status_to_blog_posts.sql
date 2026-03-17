-- Add 'status' column to blog_posts table for moderation workflow
-- Status values: 'draft' | 'pending' | 'published' | 'rejected'

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Backfill: mark all currently published posts as 'published'
UPDATE public.blog_posts
SET status = 'published'
WHERE published = true;

-- Add check constraint to enforce valid status values
ALTER TABLE public.blog_posts
DROP CONSTRAINT IF EXISTS blog_posts_status_check;

ALTER TABLE public.blog_posts
ADD CONSTRAINT blog_posts_status_check
CHECK (status IN ('draft', 'pending', 'published', 'rejected'));

-- Update RLS: admins need to see pending and rejected posts in admin panel
-- Drop and recreate the select policy to include admin access
DROP POLICY IF EXISTS "Public can read published blog_posts" ON public.blog_posts;

CREATE POLICY "Public can read published blog_posts"
ON public.blog_posts
FOR SELECT
USING (
    published = true 
    OR auth.uid() = author_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
