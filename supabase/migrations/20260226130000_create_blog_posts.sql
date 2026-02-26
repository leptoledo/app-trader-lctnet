-- Create public.blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    excerpt text,
    content text NOT NULL,
    category text,
    image_url text,
    read_time text,
    published boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Reading
-- For the public blog page, everyone should be able to read published posts.
-- Users should also be able to read their own drafts.
CREATE POLICY "Public can read published blog_posts"
ON public.blog_posts
FOR SELECT
USING (published = true OR auth.uid() = author_id);

-- Author permissions
CREATE POLICY "Authors can insert their own blog_posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blog_posts"
ON public.blog_posts
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blog_posts"
ON public.blog_posts
FOR DELETE
USING (auth.uid() = author_id);

-- Handle updated_at
CREATE OR REPLACE FUNCTION set_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION set_blog_updated_at();
