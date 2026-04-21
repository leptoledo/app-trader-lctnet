-- Create table for landing page configurations
CREATE TABLE IF NOT EXISTS public.landing_page_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id TEXT NOT NULL UNIQUE,
    published_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    draft_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_landing_page_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_landing_page_configs_updated_at_trigger
BEFORE UPDATE ON public.landing_page_configs
FOR EACH ROW
EXECUTE FUNCTION update_landing_page_configs_updated_at();

-- Enable Row Level Security
ALTER TABLE public.landing_page_configs ENABLE ROW LEVEL SECURITY;

-- Select Policy: Public can read all configurations
CREATE POLICY "Public can select landing page configs"
ON public.landing_page_configs FOR SELECT
TO public
USING (true);

-- Insert/Update/Delete Policies: Only 'admin' users can modify
CREATE POLICY "Admins can insert landing page configs"
ON public.landing_page_configs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update landing page configs"
ON public.landing_page_configs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete landing page configs"
ON public.landing_page_configs FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ===========================================
-- STORAGE: landing_assets
-- ===========================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landing_assets', 'landing_assets', true)
ON CONFLICT (id) DO NOTHING;



-- Storage Policies
CREATE POLICY "Public can read landing assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'landing_assets');

CREATE POLICY "Admins can upload landing assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'landing_assets' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update landing assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'landing_assets' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete landing assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'landing_assets' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
