import { useAluna } from "./useAlunas";
import { useAlunoCursos } from "./useCursos";
import { computeAlunaData, ComputedAlunaData } from "./useComputedAlunaData";

/**
 * Hook que combina dados da aluna com seus cursos e retorna dados computados
 */
export const useAlunaWithCursos = (idAluna: number) => {
  const { data: aluna, isLoading: isLoadingAluna } = useAluna(idAluna);
  const { data: alunoCursos = [], isLoading: isLoadingCursos } = useAlunoCursos(idAluna);
  
  const computedData: ComputedAlunaData = computeAlunaData(alunoCursos);
  
  return {
    aluna,
    alunoCursos,
    computedData,
    isLoading: isLoadingAluna || isLoadingCursos,
  };
};

/**
 * Hook que combina múltiplas alunas com seus cursos
 */
export const useAlunasWithCursos = () => {
  // Este hook seria mais complexo pois precisaria buscar cursos para múltiplas alunas
  // Por enquanto, mantemos simples e retornamos apenas as alunas
  // Os componentes individuais podem usar useAlunaWithCursos conforme necessário
};
