-- 1. Recriar a trigger para SEMPRE inserir role 'mentora' por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Criar o perfil com status pendente
  INSERT INTO public.profiles (user_id, full_name, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'pendente'
  );
  
  -- SEMPRE inserir role 'mentora' por padrão para novos usuários
  -- (admin precisa ser atribuído manualmente)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'mentora')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$function$;

-- 2. Adicionar política RLS para admins verem todas as roles
CREATE POLICY "Admins can view all user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));