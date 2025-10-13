-- Atualizar função trigger para proteger contra duplicação de usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Criar ou atualizar o perfil com status pendente
  INSERT INTO public.profiles (user_id, full_name, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'pendente'
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  -- SEMPRE inserir role 'mentora' por padrão para novos usuários
  -- (admin precisa ser atribuído manualmente)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'mentora')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Garantir índice único em profiles.user_id (prevenção)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key 
ON public.profiles (user_id);