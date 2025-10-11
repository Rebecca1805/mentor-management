-- Add data_inativacao column to alunas table
ALTER TABLE public.alunas 
ADD COLUMN IF NOT EXISTS data_inativacao timestamp with time zone;