-- 1. Habilitamos a extensão pgcrypto que nos permitirá usar funções nativas de criptografia.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabela de Chaves de API do Usuário (user_api_keys)
-- Note que o api_secret será gravado como bytea e encriptado com a chave do Master Password/Secret Key do painel Supabase.
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange varchar(50) NOT NULL, -- Ex: 'BINANCE'
  api_key text NOT NULL,
  api_secret text NOT NULL, -- Guardaremos formatado como texto gerado pelo PGP_SYM_ENCRYPT
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exchange)
);

-- 3. Tabela Padronizada de Transações/Trades (trades)
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange varchar(50) NOT NULL, -- Ex: 'BINANCE'
  symbol varchar(50) NOT NULL,   -- Ex: 'BTCUSDT'
  side varchar(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  fee numeric DEFAULT 0,
  order_id text NOT NULL,        -- Usaremos isso na Unicidade garantindo controle anti-duplicação
  executed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exchange, order_id)
);

-- Ativando RLS (Row Level Security) 
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Exemplo Básico de Políticas de RLS
CREATE POLICY "Users can only read own keys" ON public.user_api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own keys" ON public.user_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only read own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DICA PARA O BACKEND: 
-- Inserir / Salvar a Key via RPC Function ou Backend Action (com chave de server do .env):
-- INSERT INTO user_api_keys (user_id, exchange, api_key, api_secret) 
-- VALUES ('uuid_user_tal', 'BINANCE', 'chavepub', PGP_SYM_ENCRYPT('sua_secret_secreta', current_setting('app.encryption_key')));

-- Recuperar para a Sync via Backend:
-- SELECT api_key, PGP_SYM_DECRYPT(api_secret::bytea, current_setting('app.encryption_key')) as api_secret FROM user_api_keys WHERE user_id = 'xxx';
