-- Public display name for shared trades
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS public_name TEXT;
