-- Remove as políticas RLS de admin da tabela cursos para garantir isolamento por mentor
DROP POLICY IF EXISTS "Admins can view all cursos" ON public.cursos;
DROP POLICY IF EXISTS "Admins can insert all cursos" ON public.cursos;
DROP POLICY IF EXISTS "Admins can update all cursos" ON public.cursos;
DROP POLICY IF EXISTS "Admins can delete all cursos" ON public.cursos;