-- Fase 1: Reestruturar modelo de cursos e histórico de compras

-- Adicionar campo data_compra em aluno_cursos
ALTER TABLE public.aluno_cursos 
ADD COLUMN IF NOT EXISTS data_compra DATE DEFAULT CURRENT_DATE;

-- Remover campos antigos da tabela alunas (modelo JSONB)
ALTER TABLE public.alunas 
DROP COLUMN IF EXISTS cursos_adquiridos,
DROP COLUMN IF EXISTS data_primeira_compra,
DROP COLUMN IF EXISTS data_ultima_compra;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_aluno_cursos_id_aluna ON public.aluno_cursos(id_aluna);
CREATE INDEX IF NOT EXISTS idx_aluno_cursos_data_compra ON public.aluno_cursos(data_compra);

-- Comentário explicativo
COMMENT ON COLUMN public.aluno_cursos.data_compra IS 'Data em que o aluno adquiriu este curso específico';