-- Create MetaApi connected accounts table
CREATE TABLE IF NOT EXISTS public.mt_connected_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metaapi_account_id TEXT NOT NULL UNIQUE,
    login TEXT NOT NULL,
    server TEXT NOT NULL,
    broker TEXT,
    name TEXT,
    account_type TEXT DEFAULT 'DEMO', -- DEMO or REAL
    platform TEXT DEFAULT 'mt5', -- mt4 or mt5
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'DEPLOYING', -- DEPLOYING, DEPLOYED, DEPLOY_FAILED, UNDEPLOYING, UNDEPLOYED
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.mt_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MT accounts"
    ON public.mt_connected_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MT accounts"
    ON public.mt_connected_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MT accounts"
    ON public.mt_connected_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MT accounts"
    ON public.mt_connected_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Drop old api_tokens table if it exists (replacing with MetaApi)
DROP TABLE IF EXISTS public.api_tokens CASCADE;
