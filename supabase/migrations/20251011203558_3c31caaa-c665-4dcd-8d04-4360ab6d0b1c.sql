-- Configurar re.rebs.1805@gmail.com como ADMIN
-- User ID: 25dc8b38-a6ea-4ab6-97fd-a8949bfe58e6

-- Remover role mentora
DELETE FROM public.user_roles 
WHERE user_id = '25dc8b38-a6ea-4ab6-97fd-a8949bfe58e6' 
AND role = 'mentora';

-- Adicionar role admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('25dc8b38-a6ea-4ab6-97fd-a8949bfe58e6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ativar o perfil
UPDATE public.profiles
SET 
  status = 'ativa',
  approved_at = NOW(),
  approved_by = '25dc8b38-a6ea-4ab6-97fd-a8949bfe58e6'
WHERE user_id = '25dc8b38-a6ea-4ab6-97fd-a8949bfe58e6';