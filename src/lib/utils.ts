import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula o tempo de base (em dias) de um aluno baseado no status e datas
 * @param data_primeira_compra - Data da primeira compra do aluno
 * @param status - Status atual do aluno ("Ativa" ou "Inativa")
 * @param data_inativacao - Data de inativação do aluno (se aplicável)
 * @returns Número de dias na base
 */
export function calcularTempoBase(
  data_primeira_compra: string | null,
  status: string,
  data_inativacao: string | null
): number {
  if (!data_primeira_compra) return 0;
  
  const primeiraCompra = new Date(data_primeira_compra);
  const dataFinal = status === "Inativa" && data_inativacao
    ? new Date(data_inativacao)
    : new Date();
  
  const diff = Math.floor((dataFinal.getTime() - primeiraCompra.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
