-- Create enum for observacao status (using DO block for idempotency)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'observacao_status') THEN
    CREATE TYPE public.observacao_status AS ENUM ('iniciado', 'em_andamento', 'cancelado', 'interrompido');
  END IF;
END $$;

-- Create observacoes_mentora table
CREATE TABLE IF NOT EXISTS public.observacoes_mentora (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_aluna INTEGER NOT NULL REFERENCES public.alunas(id) ON DELETE CASCADE,
  plano_acao TEXT NOT NULL,
  prazo_execucao DATE,
  status public.observacao_status NOT NULL DEFAULT 'iniciado',
  observacoes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.observacoes_mentora ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own observacoes_mentora"
ON public.observacoes_mentora
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own observacoes_mentora"
ON public.observacoes_mentora
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own observacoes_mentora"
ON public.observacoes_mentora
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observacoes_mentora"
ON public.observacoes_mentora
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_observacoes_mentora_updated_at
BEFORE UPDATE ON public.observacoes_mentora
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from alunas.observacoes_mentora_tabela to new table
DO $$
DECLARE
  aluna_record RECORD;
  obs JSONB;
BEGIN
  FOR aluna_record IN SELECT id, user_id, observacoes_mentora_tabela FROM public.alunas WHERE observacoes_mentora_tabela IS NOT NULL
  LOOP
    FOR obs IN SELECT * FROM jsonb_array_elements(aluna_record.observacoes_mentora_tabela)
    LOOP
      INSERT INTO public.observacoes_mentora (id_aluna, plano_acao, prazo_execucao, status, observacoes, user_id)
      VALUES (
        aluna_record.id,
        obs->>'plano_acao',
        NULLIF(obs->>'prazo_execucao', '')::date,
        COALESCE((obs->>'status')::public.observacao_status, 'iniciado'),
        obs->>'observacoes',
        aluna_record.user_id
      );
    END LOOP;
  END LOOP;
END $$;

-- Create index for better query performance
CREATE INDEX idx_observacoes_mentora_id_aluna ON public.observacoes_mentora(id_aluna);
CREATE INDEX idx_observacoes_mentora_prazo_status ON public.observacoes_mentora(prazo_execucao, status);

-- Add comment
COMMENT ON TABLE public.observacoes_mentora IS 'Tabela de observações da mentora com planos de ação por aluna';