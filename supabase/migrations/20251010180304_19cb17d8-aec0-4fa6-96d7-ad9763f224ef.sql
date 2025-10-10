-- Create table for shared fichas
CREATE TABLE IF NOT EXISTS public.fichas_compartilhadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_aluna INTEGER NOT NULL REFERENCES public.alunas(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fichas_compartilhadas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own fichas_compartilhadas"
ON public.fichas_compartilhadas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fichas_compartilhadas"
ON public.fichas_compartilhadas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fichas_compartilhadas"
ON public.fichas_compartilhadas
FOR DELETE
USING (auth.uid() = user_id);

-- Public policy for viewing shared fichas (anyone with token can view if not expired)
CREATE POLICY "Anyone can view non-expired shared fichas"
ON public.fichas_compartilhadas
FOR SELECT
USING (expires_at > now());

-- Create index for better query performance
CREATE INDEX idx_fichas_compartilhadas_token ON public.fichas_compartilhadas(token);
CREATE INDEX idx_fichas_compartilhadas_expires ON public.fichas_compartilhadas(expires_at);

-- Add comment
COMMENT ON TABLE public.fichas_compartilhadas IS 'Links de compartilhamento de fichas de alunas com expiração';