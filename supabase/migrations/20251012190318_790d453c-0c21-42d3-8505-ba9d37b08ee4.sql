-- Remove admin access to alunas table
DROP POLICY IF EXISTS "Admins can view all alunas" ON public.alunas;
DROP POLICY IF EXISTS "Admins can insert all alunas" ON public.alunas;
DROP POLICY IF EXISTS "Admins can update all alunas" ON public.alunas;
DROP POLICY IF EXISTS "Admins can delete all alunas" ON public.alunas;

-- Remove admin access to vendas table
DROP POLICY IF EXISTS "Admins can view all vendas" ON public.vendas;
DROP POLICY IF EXISTS "Admins can insert all vendas" ON public.vendas;
DROP POLICY IF EXISTS "Admins can update all vendas" ON public.vendas;
DROP POLICY IF EXISTS "Admins can delete all vendas" ON public.vendas;