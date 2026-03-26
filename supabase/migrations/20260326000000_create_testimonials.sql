CREATE TABLE public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nickname TEXT NOT NULL,
    avatar_url TEXT,
    message TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read approved testimonials
CREATE POLICY "Public can read approved testimonials" 
  ON public.testimonials FOR SELECT 
  USING (approved = true);

-- Policy 2: Authenticated users can insert their own testimonials
CREATE POLICY "Users can insert their own testimonials" 
  ON public.testimonials FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can read their own testimonials (even unapproved)
CREATE POLICY "Users can read their own testimonials"
  ON public.testimonials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a trigger to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
