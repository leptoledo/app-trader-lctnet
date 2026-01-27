-- Allow public access to shared trades
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'trades' AND policyname = 'Anon can view shared trades'
    ) THEN
        CREATE POLICY "Anon can view shared trades"
        ON public.trades FOR SELECT
        TO anon
        USING (is_shared = true AND share_token IS NOT NULL);
    END IF;
END $$;

-- RPC to increment view count for shared trades
CREATE OR REPLACE FUNCTION public.increment_shared_view(token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    trade_uuid uuid;
BEGIN
    SELECT id INTO trade_uuid
    FROM public.trades
    WHERE share_token = token
      AND is_shared = true
    LIMIT 1;

    IF trade_uuid IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO public.shared_trades_analytics (trade_id, views_count)
    VALUES (trade_uuid, 1)
    ON CONFLICT (trade_id)
    DO UPDATE SET views_count = shared_trades_analytics.views_count + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_shared_view(TEXT) TO anon, authenticated;
