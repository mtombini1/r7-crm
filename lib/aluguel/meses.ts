import { formatInTimeZone } from "date-fns-tz";
import {
  addMonths,
  parseISO,
  isAfter,
  format,
  lastDayOfMonth,
  differenceInCalendarDays,
} from "date-fns";

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

/** Data de vencimento (yyyy-MM-dd) do aluguel de uma competência, dado o dia de
 *  vencimento. Sem dia definido, usa o último dia do mês; o dia é limitado ao
 *  tamanho do mês (ex.: dia 31 em fevereiro vira o último dia). */
export function vencimentoDaCompetencia(competencia: string, diaVencimento: number | null): string {
  const base = parseISO(competencia);
  const ultimoDia = lastDayOfMonth(base).getDate();
  const dia = diaVencimento == null ? ultimoDia : Math.min(Math.max(diaVencimento, 1), ultimoDia);
  return format(new Date(base.getFullYear(), base.getMonth(), dia), "yyyy-MM-dd");
}

/** Dias de atraso entre um vencimento (yyyy-MM-dd) e hoje (yyyy-MM-dd). Nunca negativo. */
export function diasDeAtraso(vencimento: string, hoje: string): number {
  return Math.max(0, differenceInCalendarDays(parseISO(hoje), parseISO(vencimento)));
}

export type AluguelAtraso = {
  competencia: string;
  vencimento: string;
  diasEmAtraso: number;
};

/** Competências de uma locação já vencidas (vencimento <= hoje) e sem pagamento.
 *  Inclui o mês atual quando o dia de vencimento já passou. */
export function alugueisEmAtraso(
  desde: string,
  diaVencimento: number | null,
  pagos: Set<string>,
  hoje: string,
): AluguelAtraso[] {
  const out: AluguelAtraso[] = [];
  for (const competencia of mesesNoIntervalo(desde, competenciaAtual())) {
    if (pagos.has(competencia)) continue;
    const vencimento = vencimentoDaCompetencia(competencia, diaVencimento);
    if (vencimento <= hoje) {
      out.push({ competencia, vencimento, diasEmAtraso: diasDeAtraso(vencimento, hoje) });
    }
  }
  return out;
}
