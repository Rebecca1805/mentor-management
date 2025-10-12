-- Garantir que os campos de plano existem na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Atualizar profiles existentes com status ativa para terem plano estratégico
UPDATE profiles 
SET subscription_plan = 'estrategico',
    subscription_expires_at = (CURRENT_TIMESTAMP + interval '1 year')
WHERE status = 'ativa' 
  AND (subscription_plan IS NULL OR subscription_plan = 'free');

-- Comentário para documentação
COMMENT ON COLUMN profiles.subscription_plan IS 'Plano de assinatura: estrategico, condutor, visionario';