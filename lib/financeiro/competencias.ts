import { format, parseISO } from "date-fns";
import { hojeISO } from "@/lib/utils/format";
import type { Enums } from "@/lib/supabase/types";

/**
 * Formata uma competência (string ISO yyyy-MM-dd, normalmente o 1º dia do mês)
 * como "MM/yyyy".
 */
export function competenciaLabel(dateStr: string): string {
  return format(parseISO(dateStr), "MM/yyyy");
}

/**
 * Calcula a data de vencimento (yyyy-MM-dd) dentro do mês da competência,
 * usando o dia informado. O dia é fixado entre 1 e 28 (clamp) para evitar
 * meses curtos.
 */
export function calcularVencimento(competencia: string, diaVencimento: number): string {
  const base = parseISO(competencia);
  const dia = Math.min(28, Math.max(1, Math.trunc(diaVencimento)));
  return format(new Date(base.getFullYear(), base.getMonth(), dia), "yyyy-MM-dd");
}

/**
 * Indica se um lançamento está vencido: status 'pendente' e data de
 * vencimento menor ou igual a hoje (fuso America/Sao_Paulo).
 */
export function isVencido(
  dataVencimento: string,
  status: Enums<"lancamento_status">,
): boolean {
  if (status !== "pendente") return false;
  return dataVencimento <= hojeISO();
}
