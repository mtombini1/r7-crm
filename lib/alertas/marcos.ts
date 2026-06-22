import type { Enums } from "@/lib/supabase/types";

/** Marco de proximidade de um alerta contratual. */
export type Marco = "30" | "15" | "7" | "1" | "vencido";

/** Tipo de alerta contratual (espelha o enum `alerta_tipo` do banco). */
export type TipoContratual = Enums<"alerta_tipo">;

/** Severidade visual usada pelos Badges/realces de alerta. */
export type Severidade = "default" | "warning" | "destructive";

/** Rótulo pt-BR para o marco de proximidade do alerta. */
export function labelMarco(marco: Marco | string | null | undefined): string {
  switch (marco) {
    case "vencido":
      return "Vencido";
    case "1":
      return "Vence em 1 dia";
    case "7":
      return "Vence em 7 dias";
    case "15":
      return "Vence em 15 dias";
    case "30":
      return "Vence em 30 dias";
    default:
      return "—";
  }
}

/** Rótulo pt-BR para o tipo de alerta contratual. */
export function labelTipoContratual(tipo: TipoContratual | string | null | undefined): string {
  switch (tipo) {
    case "reajuste":
      return "Reajuste";
    case "renovacao":
      return "Renovação";
    case "desconto":
      return "Encerramento de desconto";
    default:
      return "—";
  }
}

/**
 * Severidade do alerta a partir do marco:
 * - `vencido` / `1` → destructive
 * - `7` / `15` → warning
 * - `30` → default
 */
export function severidadeMarco(marco: Marco | string | null | undefined): Severidade {
  switch (marco) {
    case "vencido":
    case "1":
      return "destructive";
    case "7":
    case "15":
      return "warning";
    case "30":
    default:
      return "default";
  }
}
