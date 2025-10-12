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
  data_inativacao: string | null,
  data_ultima_compra?: string | null
): number {
  if (!data_primeira_compra) return 0;

  const parseDateFlexible = (value: string): Date | null => {
    if (!value) return null;
    if (value.includes('/')) {
      const [dd, mm, yyyy] = value.split('/');
      const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
      return isNaN(d.getTime()) ? null : d;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const primeiraCompra = parseDateFlexible(data_primeira_compra);
  if (!primeiraCompra) return 0;

  const isInativo = status === "Inativo" || status === "Inativa";
  const dataFinalRaw = isInativo && data_inativacao
    ? parseDateFlexible(data_inativacao)
    : (data_ultima_compra ? parseDateFlexible(data_ultima_compra) : new Date());
  const dataFinal = dataFinalRaw ?? new Date();

  const diffMs = dataFinal.getTime() - primeiraCompra.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formata uma data para o padrão brasileiro
 * @param date - String ISO ou objeto Date
 * @param formato - 'completo' (dd/mm/aaaa) ou 'mes-ano' (mm/aaaa)
 * @returns String formatada ou 'N/A' se inválida
 */
export function formatarDataBR(
  date: string | Date | null | undefined,
  formato: 'completo' | 'mes-ano' = 'completo'
): string {
  if (!date) return 'N/A';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    
    return formato === 'completo' 
      ? `${dia}/${mes}/${ano}`
      : `${mes}/${ano}`;
  } catch {
    return 'N/A';
  }
}
