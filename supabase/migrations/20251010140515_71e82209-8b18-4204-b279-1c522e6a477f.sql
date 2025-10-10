-- Tabela de alunas (students)
CREATE TABLE public.alunas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  curso_atual TEXT,
  cursos_adquiridos TEXT[] DEFAULT '{}',
  cursos_concluidos INTEGER DEFAULT 0,
  data_primeira_compra DATE,
  data_ultima_compra DATE,
  tempo_base INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Inativa')),
  principais_dificuldades TEXT,
  observacoes_mentora TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos de ação
CREATE TABLE public.planos_acao (
  id SERIAL PRIMARY KEY,
  id_aluna INTEGER REFERENCES public.alunas(id) ON DELETE CASCADE NOT NULL,
  objetivo TEXT NOT NULL,
  resultado_esperado TEXT,
  etapas TEXT[] DEFAULT '{}',
  etapas_concluidas TEXT[] DEFAULT '{}',
  data_inicio DATE,
  data_fim_prevista DATE,
  data_fim_real DATE,
  resultados_obtidos TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE public.vendas (
  id SERIAL PRIMARY KEY,
  id_aluna INTEGER REFERENCES public.alunas(id) ON DELETE CASCADE NOT NULL,
  periodo TEXT NOT NULL,
  valor_vendido NUMERIC(10, 2) NOT NULL DEFAULT 0,
  produtos TEXT[] DEFAULT '{}',
  observacoes TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_alunas_user_id ON public.alunas(user_id);
CREATE INDEX idx_alunas_status ON public.alunas(status);
CREATE INDEX idx_planos_acao_user_id ON public.planos_acao(user_id);
CREATE INDEX idx_planos_acao_aluna ON public.planos_acao(id_aluna);
CREATE INDEX idx_vendas_user_id ON public.vendas(user_id);
CREATE INDEX idx_vendas_aluna ON public.vendas(id_aluna);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alunas_updated_at
  BEFORE UPDATE ON public.alunas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planos_acao_updated_at
  BEFORE UPDATE ON public.planos_acao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.alunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para alunas
CREATE POLICY "Users can view their own alunas"
  ON public.alunas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alunas"
  ON public.alunas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alunas"
  ON public.alunas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alunas"
  ON public.alunas FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para planos_acao
CREATE POLICY "Users can view their own planos_acao"
  ON public.planos_acao FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planos_acao"
  ON public.planos_acao FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planos_acao"
  ON public.planos_acao FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planos_acao"
  ON public.planos_acao FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para vendas
CREATE POLICY "Users can view their own vendas"
  ON public.vendas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vendas"
  ON public.vendas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendas"
  ON public.vendas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendas"
  ON public.vendas FOR DELETE
  USING (auth.uid() = user_id);