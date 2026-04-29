-- Create API Tokens table for MetaTrader integrations
CREATE TABLE public.api_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- RLS for api_tokens
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens"
    ON public.api_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokens"
    ON public.api_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
    ON public.api_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Add MetaTrader specific fields to trades table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'magic_number') THEN
        ALTER TABLE public.trades ADD COLUMN magic_number TEXT;
    END IF;
    
    -- Ensure ticket_id, swap, and commission exist just in case they were only added to types and not DB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'ticket_id') THEN
        ALTER TABLE public.trades ADD COLUMN ticket_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'swap') THEN
        ALTER TABLE public.trades ADD COLUMN swap NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'commission') THEN
        ALTER TABLE public.trades ADD COLUMN commission NUMERIC DEFAULT 0;
    END IF;
END $$;

-- Create an index on ticket_id for faster lookups when syncing from MT4/MT5
CREATE INDEX IF NOT EXISTS idx_trades_ticket_id ON public.trades(ticket_id);
