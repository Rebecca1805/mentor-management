-- Criar tabela de cursos
CREATE TABLE public.cursos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de versões de curso
CREATE TABLE public.curso_versoes (
  id SERIAL PRIMARY KEY,
  id_curso INTEGER NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  versao TEXT NOT NULL,
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_vigencia CHECK (data_fim_vigencia IS NULL OR data_fim_vigencia >= data_inicio_vigencia)
);

-- Criar tabela de relação aluno-curso
CREATE TABLE public.aluno_cursos (
  id SERIAL PRIMARY KEY,
  id_aluna INTEGER NOT NULL REFERENCES public.alunas(id) ON DELETE CASCADE,
  id_curso INTEGER NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  id_versao INTEGER REFERENCES public.curso_versoes(id) ON DELETE SET NULL,
  status_evolucao TEXT NOT NULL DEFAULT 'nao_iniciado' CHECK (status_evolucao IN ('nao_iniciado', 'em_andamento', 'pausado', 'concluido')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_aluna, id_curso)
);

-- Habilitar RLS
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_cursos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cursos
CREATE POLICY "Users can view their own cursos"
  ON public.cursos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cursos"
  ON public.cursos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cursos"
  ON public.cursos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cursos"
  ON public.cursos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para curso_versoes
CREATE POLICY "Users can view their own curso_versoes"
  ON public.curso_versoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own curso_versoes"
  ON public.curso_versoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own curso_versoes"
  ON public.curso_versoes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own curso_versoes"
  ON public.curso_versoes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para aluno_cursos
CREATE POLICY "Users can view their own aluno_cursos"
  ON public.aluno_cursos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aluno_cursos"
  ON public.aluno_cursos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aluno_cursos"
  ON public.aluno_cursos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aluno_cursos"
  ON public.aluno_cursos FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_curso_versoes_updated_at
  BEFORE UPDATE ON public.curso_versoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aluno_cursos_updated_at
  BEFORE UPDATE ON public.aluno_cursos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();