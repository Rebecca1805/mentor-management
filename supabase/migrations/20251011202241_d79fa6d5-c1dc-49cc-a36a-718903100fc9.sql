-- Adicionar foreign key entre profiles e auth.users
-- Isso permite que o Supabase PostgREST faça JOIN com user_roles
ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Criar índices para melhorar performance das queries com JOIN
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);