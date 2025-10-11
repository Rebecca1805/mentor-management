-- Remover perfil duplicado de mentora para o admin
DELETE FROM public.profiles 
WHERE user_id = 'd8805849-cf13-4daa-ac1f-fbf20ff44d5a' 
AND status = 'pendente';

DELETE FROM public.user_roles 
WHERE user_id = 'd8805849-cf13-4daa-ac1f-fbf20ff44d5a' 
AND role = 'mentora';

-- Atualizar trigger para NÃO inserir role automaticamente
-- Role será definida manualmente ou durante signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Apenas criar o perfil, sem role automática
  INSERT INTO public.profiles (user_id, full_name, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'pendente'
  );
  
  -- Inserir role apenas se especificada nos metadados
  -- Caso contrário, admin precisa atribuir role manualmente
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (new.raw_user_meta_data->>'role')::app_role);
  END IF;
  
  RETURN new;
END;
$function$;