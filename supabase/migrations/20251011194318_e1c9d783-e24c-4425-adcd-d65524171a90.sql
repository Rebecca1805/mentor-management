-- Limpar dados de teste (mantém estrutura das tabelas)
TRUNCATE TABLE public.vendas CASCADE;
TRUNCATE TABLE public.observacoes_mentora CASCADE;
TRUNCATE TABLE public.planos_acao CASCADE;
TRUNCATE TABLE public.aluno_cursos CASCADE;
TRUNCATE TABLE public.alunas CASCADE;
TRUNCATE TABLE public.cursos CASCADE;
TRUNCATE TABLE public.curso_versoes CASCADE;
TRUNCATE TABLE public.fichas_compartilhadas CASCADE;

-- Inserir role de admin para o usuário existente
INSERT INTO public.user_roles (user_id, role)
VALUES ('d8805849-cf13-4daa-ac1f-fbf20ff44d5a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar perfil ativo para o usuário (bypass do status pendente)
INSERT INTO public.profiles (user_id, full_name, status, approved_at, approved_by)
VALUES (
  'd8805849-cf13-4daa-ac1f-fbf20ff44d5a',
  'REBECCA OLIVEIRA E SILVA',
  'ativa',
  NOW(),
  'd8805849-cf13-4daa-ac1f-fbf20ff44d5a'
)
ON CONFLICT (user_id) DO UPDATE SET
  status = 'ativa',
  approved_at = NOW(),
  approved_by = 'd8805849-cf13-4daa-ac1f-fbf20ff44d5a';