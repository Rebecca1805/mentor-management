-- Criar tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  subscription_plan text DEFAULT 'free',
  subscription_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins veem todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Apenas admins podem atualizar status
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins podem inserir perfis
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Função para verificar se é mentora aprovada
CREATE OR REPLACE FUNCTION public.is_approved_mentora()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles r ON r.user_id = p.user_id
    WHERE p.user_id = auth.uid()
      AND r.role = 'mentora'
      AND p.status = 'ativa'
  )
$$;

-- Criar perfil automaticamente ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'pendente'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'mentora');
  
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- Políticas para alunas (admins veem tudo)
CREATE POLICY "Admins can view all alunas"
  ON public.alunas FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert all alunas"
  ON public.alunas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all alunas"
  ON public.alunas FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete all alunas"
  ON public.alunas FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Políticas para cursos
CREATE POLICY "Admins can view all cursos"
  ON public.cursos FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert all cursos"
  ON public.cursos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all cursos"
  ON public.cursos FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete all cursos"
  ON public.cursos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Políticas para vendas
CREATE POLICY "Admins can view all vendas"
  ON public.vendas FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert all vendas"
  ON public.vendas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all vendas"
  ON public.vendas FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete all vendas"
  ON public.vendas FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();