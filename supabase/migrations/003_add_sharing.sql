-- Adicionar campos de compartilhamento à tabela trades
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Criar índice para busca rápida de trades compartilhados
CREATE INDEX IF NOT EXISTS idx_trades_shared ON trades(is_shared, shared_at) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_trades_share_token ON trades(share_token) WHERE share_token IS NOT NULL;

-- Tabela de analytics de compartilhamento
CREATE TABLE IF NOT EXISTS shared_trades_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(trade_id)
);

-- Tabela de likes (para rastrear quem curtiu)
CREATE TABLE IF NOT EXISTS trade_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(trade_id, user_id)
);

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shared_trades_analytics_updated_at
  BEFORE UPDATE ON shared_trades_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
