-- Criar função RPC para agregar todas as estatísticas de mentor em uma única query
CREATE OR REPLACE FUNCTION get_mentor_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'alunosAtivos', (SELECT COUNT(*) FROM alunas WHERE user_id = p_user_id AND status = 'Ativo'),
    'alunosInativos', (SELECT COUNT(*) FROM alunas WHERE user_id = p_user_id AND status = 'Inativo'),
    'totalAlunos', (SELECT COUNT(*) FROM alunas WHERE user_id = p_user_id),
    'totalCursos', (SELECT COUNT(*) FROM cursos WHERE user_id = p_user_id),
    'vendasMes', (SELECT COALESCE(SUM(valor_vendido), 0) FROM vendas 
                  WHERE user_id = p_user_id 
                  AND periodo LIKE (to_char(CURRENT_DATE, 'YYYY-MM') || '%')),
    'vendasTotal', (SELECT COALESCE(SUM(valor_vendido), 0) FROM vendas WHERE user_id = p_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;