-- TABELA DE ASSINATURAS (Vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, gold
  status TEXT DEFAULT 'active', -- active, canceled, past_due, trial
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas sua própria assinatura
CREATE POLICY "Users can view own subscription" 
ON subscriptions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Função para verificar plano do usuário
CREATE OR REPLACE FUNCTION get_user_plan(uid UUID)
RETURNS TEXT AS $$
  SELECT plan FROM subscriptions WHERE user_id = uid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger para criar entrada 'free' automaticamente após registro (opcional, dependendo da lógica do app)
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Descomente abaixo se o Supabase Auth ainda não tiver esse trigger
-- CREATE TRIGGER on_auth_user_created_subscription
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user_subscription();
