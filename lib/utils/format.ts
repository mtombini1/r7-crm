import { formatInTimeZone } from "date-fns-tz";

export const TZ = "America/Sao_Paulo";

/** Formata valor em BRL (pt-BR). */
export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/** Formata uma data (string ISO ou Date) como dd/MM/yyyy no fuso de São Paulo. */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return formatInTimeZone(new Date(date), TZ, "dd/MM/yyyy");
}

/** Formata data e hora (dd/MM/yyyy 'às' HH:mm) no fuso de São Paulo. */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return formatInTimeZone(new Date(date), TZ, "dd/MM/yyyy 'às' HH:mm");
}

/** Data atual (yyyy-MM-dd) no fuso America/Sao_Paulo. */
export function hojeISO(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}
