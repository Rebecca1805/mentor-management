-- CORREÇÃO 1: Adicionar política DELETE para profiles
-- Permite que administradores deletem perfis de mentoras
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_admin());

-- CORREÇÃO 2: Remover política pública perigosa de fichas_compartilhadas
-- Esta política expõe todos os tokens ativos publicamente
DROP POLICY IF EXISTS "Anyone can view non-expired shared fichas" ON public.fichas_compartilhadas;

-- CORREÇÃO 3: Criar função segura para validação de tokens de compartilhamento
-- Esta função valida tokens individuais sem expor a lista completa
CREATE OR REPLACE FUNCTION public.validate_shared_ficha_token(p_token TEXT)
RETURNS TABLE (
  id_aluna INTEGER,
  expires_at TIMESTAMPTZ,
  user_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_aluna, expires_at, user_id
  FROM fichas_compartilhadas
  WHERE token = p_token
    AND expires_at > now()
  LIMIT 1;
$$;

-- Permitir execução da função para usuários autenticados e anônimos
GRANT EXECUTE ON FUNCTION public.validate_shared_ficha_token(TEXT) TO authenticated, anon;