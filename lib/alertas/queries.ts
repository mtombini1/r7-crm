import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";
import type { Marco } from "@/lib/alertas/marcos";

/** Alerta contratual (reajuste/renovação/desconto) com nomes resolvidos. */
export type AlertaContratual = {
  locacaoId: string;
  tipo: Enums<"alerta_tipo">;
  dataAlvo: string;
  diasRestantes: number | null;
  marco: Marco | string | null;
  imovelNome: string | null;
  inquilinoNome: string | null;
  valorAtual: number | null;
};

/** Alerta financeiro (pendência informativa) com nomes resolvidos. */
export type AlertaFinanceiro = {
  lancamentoId: string;
  locacaoId: string | null;
  imovelId: string | null;
  tipo: Enums<"lancamento_tipo">;
  competencia: string | null;
  valor: number | null;
  dataVencimento: string | null;
  responsavel: Enums<"responsavel_pagamento"> | null;
  diasEmAtraso: number | null;
  imovelNome: string | null;
  inquilinoNome: string | null;
};

export type AlertasPendentes = {
  contratuais: AlertaContratual[];
  financeiros: AlertaFinanceiro[];
};

/** Coleta valores não nulos e únicos de um array. */
function uniq<T>(values: (T | null | undefined)[]): T[] {
  return Array.from(new Set(values.filter((v): v is T => v != null)));
}

/**
 * Busca alertas contratuais e financeiros pendentes, resolvendo nomes de
 * imóvel/inquilino via queries `.in()` separadas (sem selects embutidos).
 */
export async function getAlertasPendentes(): Promise<AlertasPendentes> {
  const supabase = await createClient();

  const [{ data: contratuaisRaw }, { data: financeirosRaw }] = await Promise.all([
    supabase.from("vw_alertas_contratuais_pendentes").select("*"),
    supabase.from("vw_alertas_financeiros_pendentes").select("*"),
  ]);

  const contratuaisRows = contratuaisRaw ?? [];
  const financeirosRows = financeirosRaw ?? [];

  // Locações envolvidas (contratuais sempre têm; financeiros podem ter).
  const locacaoIds = uniq<string>([
    ...contratuaisRows.map((r) => r.locacao_id),
    ...financeirosRows.map((r) => r.locacao_id),
  ]);

  // Imóveis vindos diretamente de lançamentos financeiros (ex.: IPTU sem locação).
  const imovelIdsDiretos = uniq<string>(financeirosRows.map((r) => r.imovel_id));

  // Carrega as locações para mapear imóvel/inquilino e valor de aluguel.
  const locacoes = locacaoIds.length
    ? (
        await supabase
          .from("locacoes")
          .select("id, imovel_id, inquilino_id, valor_aluguel")
          .in("id", locacaoIds)
      ).data ?? []
    : [];

  const locacaoById = new Map(locacoes.map((l) => [l.id, l]));

  const imovelIds = uniq<string>([
    ...locacoes.map((l) => l.imovel_id),
    ...imovelIdsDiretos,
  ]);
  const inquilinoIds = uniq<string>(locacoes.map((l) => l.inquilino_id));

  const [{ data: imoveisData }, { data: inquilinosData }] = await Promise.all([
    imovelIds.length
      ? supabase.from("imoveis").select("id, nome").in("id", imovelIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    inquilinoIds.length
      ? supabase.from("inquilinos").select("id, nome").in("id", inquilinoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ]);

  const imovelNomeById = new Map((imoveisData ?? []).map((i) => [i.id, i.nome]));
  const inquilinoNomeById = new Map((inquilinosData ?? []).map((i) => [i.id, i.nome]));

  const contratuais: AlertaContratual[] = contratuaisRows
    .filter((r): r is typeof r & { locacao_id: string; tipo: Enums<"alerta_tipo">; data_alvo: string } =>
      r.locacao_id != null && r.tipo != null && r.data_alvo != null,
    )
    .map((r) => {
      const loc = locacaoById.get(r.locacao_id);
      return {
        locacaoId: r.locacao_id,
        tipo: r.tipo,
        dataAlvo: r.data_alvo,
        diasRestantes: r.dias_restantes,
        marco: r.marco,
        imovelNome: loc ? imovelNomeById.get(loc.imovel_id) ?? null : null,
        inquilinoNome: loc ? inquilinoNomeById.get(loc.inquilino_id) ?? null : null,
        valorAtual: loc?.valor_aluguel ?? null,
      };
    });

  const financeiros: AlertaFinanceiro[] = financeirosRows
    .filter((r): r is typeof r & { lancamento_id: string; tipo: Enums<"lancamento_tipo"> } =>
      r.lancamento_id != null && r.tipo != null,
    )
    .map((r) => {
      const loc = r.locacao_id ? locacaoById.get(r.locacao_id) : undefined;
      const imovelId = loc?.imovel_id ?? r.imovel_id ?? null;
      return {
        lancamentoId: r.lancamento_id,
        locacaoId: r.locacao_id,
        imovelId,
        tipo: r.tipo,
        competencia: r.competencia,
        valor: r.valor,
        dataVencimento: r.data_vencimento,
        responsavel: r.responsavel,
        diasEmAtraso: r.dias_em_atraso,
        imovelNome: imovelId ? imovelNomeById.get(imovelId) ?? null : null,
        inquilinoNome: loc ? inquilinoNomeById.get(loc.inquilino_id) ?? null : null,
      };
    });

  return { contratuais, financeiros };
}
