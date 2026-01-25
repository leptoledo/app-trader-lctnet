-- Ajustar políticas de RLS para a Comunidade
-- Permitir que usuários vejam trades compartilhados por outros
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trades' AND policyname = 'Users can view shared trades'
    ) THEN
        CREATE POLICY "Users can view shared trades" 
        ON public.trades FOR SELECT 
        TO authenticated 
        USING (is_shared = true);
    END IF;
END $$;

-- Garantir que as colunas existam (repetindo por segurança caso a migração 003 tenha falhado ou não rodado)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'trades' AND COLUMN_NAME = 'is_shared') THEN
        ALTER TABLE trades ADD COLUMN is_shared BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'trades' AND COLUMN_NAME = 'shared_at') THEN
        ALTER TABLE trades ADD COLUMN shared_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'trades' AND COLUMN_NAME = 'share_token') THEN
        ALTER TABLE trades ADD COLUMN share_token TEXT UNIQUE;
    END IF;
END $$;
