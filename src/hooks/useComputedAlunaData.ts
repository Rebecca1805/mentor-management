import { Aluna } from "./useAlunas";
import { AlunoCurso } from "./useCursos";

export interface ComputedAlunaData {
  data_primeira_compra: string | null;
  data_ultima_compra: string | null;
  cursos_concluidos: number;
  total_cursos: number;
  progresso_percentual: number;
}

/**
 * Calcula dados computados de uma aluna baseados nos cursos vinculados
 */
export const computeAlunaData = (alunoCursos: AlunoCurso[]): ComputedAlunaData => {
  if (!alunoCursos || alunoCursos.length === 0) {
    return {
      data_primeira_compra: null,
      data_ultima_compra: null,
      cursos_concluidos: 0,
      total_cursos: 0,
      progresso_percentual: 0,
    };
  }

  // Ordenar por data de compra
  const cursosOrdenados = [...alunoCursos].sort((a, b) => {
    const dateA = new Date(a.data_compra || a.created_at);
    const dateB = new Date(b.data_compra || b.created_at);
    return dateA.getTime() - dateB.getTime();
  });

  const data_primeira_compra = cursosOrdenados[0]?.data_compra || cursosOrdenados[0]?.created_at || null;
  const data_ultima_compra = cursosOrdenados[cursosOrdenados.length - 1]?.data_compra || 
                             cursosOrdenados[cursosOrdenados.length - 1]?.created_at || null;

  const cursos_concluidos = alunoCursos.filter(c => c.status_evolucao === 'concluido').length;
  const total_cursos = alunoCursos.length;
  const progresso_percentual = total_cursos > 0 ? (cursos_concluidos / total_cursos) * 100 : 0;

  return {
    data_primeira_compra,
    data_ultima_compra,
    cursos_concluidos,
    total_cursos,
    progresso_percentual,
  };
};
