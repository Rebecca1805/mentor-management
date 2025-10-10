-- Add data_cadastro column to alunas table
ALTER TABLE public.alunas 
ADD COLUMN IF NOT EXISTS data_cadastro date DEFAULT CURRENT_DATE;

-- Update existing rows to have data_cadastro if null
UPDATE public.alunas 
SET data_cadastro = COALESCE(data_primeira_compra, CURRENT_DATE)
WHERE data_cadastro IS NULL;

-- Make data_cadastro not null after populating
ALTER TABLE public.alunas 
ALTER COLUMN data_cadastro SET NOT NULL;

-- Create enum for curso status
DO $$ BEGIN
  CREATE TYPE public.curso_status AS ENUM ('nao_iniciado', 'em_andamento', 'pausado', 'concluido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for plano status
DO $$ BEGIN
  CREATE TYPE public.plano_status AS ENUM ('iniciado', 'em_andamento', 'cancelado', 'interrompido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop old cursos_adquiridos column and recreate as JSONB
-- First, backup the data
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alunas' AND column_name = 'cursos_adquiridos' 
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.alunas RENAME COLUMN cursos_adquiridos TO cursos_adquiridos_old;
    
    -- Add new JSONB column for courses with status
    ALTER TABLE public.alunas ADD COLUMN cursos_adquiridos jsonb DEFAULT '[]'::jsonb;
    
    -- Migrate old data to new format
    UPDATE public.alunas 
    SET cursos_adquiridos = (
      SELECT jsonb_agg(
        jsonb_build_object(
          'nome', curso,
          'status', 'nao_iniciado'
        )
      )
      FROM unnest(cursos_adquiridos_old) AS curso
    )
    WHERE cursos_adquiridos_old IS NOT NULL AND array_length(cursos_adquiridos_old, 1) > 0;
    
    -- Drop old column
    ALTER TABLE public.alunas DROP COLUMN cursos_adquiridos_old;
  END IF;
END $$;

-- Change principais_dificuldades to array if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'alunas' AND column_name = 'principais_dificuldades' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE public.alunas 
    ALTER COLUMN principais_dificuldades TYPE text[] 
    USING CASE 
      WHEN principais_dificuldades IS NULL OR principais_dificuldades = '' THEN '{}'::text[]
      ELSE string_to_array(principais_dificuldades, E'\n')
    END;
  END IF;
  
  ALTER TABLE public.alunas 
  ALTER COLUMN principais_dificuldades SET DEFAULT '{}'::text[];
END $$;

-- Add observacoes_mentora_tabela as JSONB for inline table
ALTER TABLE public.alunas 
ADD COLUMN IF NOT EXISTS observacoes_mentora_tabela jsonb DEFAULT '[]'::jsonb;

-- Comment on new columns
COMMENT ON COLUMN public.alunas.data_cadastro IS 'Data de cadastro da aluna no sistema';
COMMENT ON COLUMN public.alunas.cursos_adquiridos IS 'Array JSON de objetos com nome e status de cada curso';
COMMENT ON COLUMN public.alunas.principais_dificuldades IS 'Array de strings com as principais dificuldades (tags)';
COMMENT ON COLUMN public.alunas.observacoes_mentora_tabela IS 'Array JSON de objetos com plano_acao, prazo_execucao, status, observacoes';

-- Create function to calculate tempo_base automatically (FIXED)
CREATE OR REPLACE FUNCTION public.calculate_tempo_base(p_data_cadastro date)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT (CURRENT_DATE - p_data_cadastro)::integer;
$$;

-- Update tempo_base for existing records
UPDATE public.alunas
SET tempo_base = public.calculate_tempo_base(data_cadastro);

-- Drop cursos_concluidos column as it will be calculated from cursos_adquiridos
ALTER TABLE public.alunas 
DROP COLUMN IF EXISTS cursos_concluidos;