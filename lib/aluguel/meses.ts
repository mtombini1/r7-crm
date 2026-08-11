import { formatInTimeZone } from "date-fns-tz";
import { addMonths, parseISO, isAfter, format } from "date-fns";

const TZ = "America/Sao_Paulo";

/** Primeiro dia do mês atual (yyyy-MM-01) no fuso de São Paulo. */
export function competenciaAtual(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-01");
}

/** Competência do mês anterior a `comp` (yyyy-MM-01). */
export function competenciaAnterior(comp: string): string {
  return format(addMonths(parseISO(comp), -1), "yyyy-MM-dd");
}

/** Lista de competências (yyyy-MM-01) de `desde` até `ate`, inclusive. Vazio se desde > ate. */
export function mesesNoIntervalo(desde: string, ate: string): string[] {
  const fim = parseISO(ate);
  let atual = parseISO(desde);
  const out: string[] = [];
  let guard = 0;
  while (!isAfter(atual, fim) && guard < 600) {
    out.push(format(atual, "yyyy-MM-dd"));
    atual = addMonths(atual, 1);
    guard += 1;
  }
  return out;
}

/** Rótulo MM/yyyy de uma competência (yyyy-MM-dd). */
export function competenciaLabel(iso: string): string {
  return format(parseISO(iso), "MM/yyyy");
}
