-- Corrigir configuração do admin para o user_id correto
-- Remover configuração antiga do admin (user_id incorreto)
DELETE FROM user_roles WHERE user_id = 'd8805849-cf13-4daa-ac1f-fbf20ff44d5a';
DELETE FROM profiles WHERE user_id = 'd8805849-cf13-4daa-ac1f-fbf20ff44d5a';

-- Configurar o user_id correto como admin
-- Remover role de mentora
DELETE FROM user_roles 
WHERE user_id = 'ef127941-88bd-4b0d-9bdd-8c089bbd15f5' 
AND role = 'mentora';

-- Adicionar role de admin
INSERT INTO user_roles (user_id, role)
VALUES ('ef127941-88bd-4b0d-9bdd-8c089bbd15f5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Atualizar profile para status ativa
UPDATE profiles
SET 
  status = 'ativa',
  approved_at = NOW(),
  approved_by = 'ef127941-88bd-4b0d-9bdd-8c089bbd15f5'
WHERE user_id = 'ef127941-88bd-4b0d-9bdd-8c089bbd15f5';