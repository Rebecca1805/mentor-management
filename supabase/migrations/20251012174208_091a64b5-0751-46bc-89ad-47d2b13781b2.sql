-- Remover o constraint antigo de status
ALTER TABLE alunas DROP CONSTRAINT IF EXISTS alunas_status_check;

-- Atualizar valores existentes de "Ativa/Inativa" para "Ativo/Inativo"
UPDATE alunas
SET status = CASE 
  WHEN status = 'Ativa' THEN 'Ativo'
  WHEN status = 'Inativa' THEN 'Inativo'
  ELSE status
END;

-- Adicionar novo constraint com valores corretos
ALTER TABLE alunas ADD CONSTRAINT alunas_status_check CHECK (status IN ('Ativo', 'Inativo'));

-- Adicionar status "concluido" ao tipo observacao_status
ALTER TYPE observacao_status ADD VALUE IF NOT EXISTS 'concluido';

-- Comentários explicativos
COMMENT ON COLUMN alunas.status IS 'Status: Ativo ou Inativo';
COMMENT ON TYPE observacao_status IS 'Status das observações: iniciado, em_andamento, cancelado, interrompido, concluido';