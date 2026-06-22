"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";

type NovoLancamento = {
  tipo: Enums<"lancamento_tipo">;
  competencia: string;
  valor: number;
  data_vencimento: string;
  responsavel: Enums<"responsavel_pagamento">;
};

function revalidarFinanceiro(locacaoId: string) {
  revalidatePath(`/locacoes/${locacaoId}/financeiro`);
  revalidatePath(`/locacoes/${locacaoId}`);
}

/** Cria uma obrigação financeira (lançamento) para a competência informada. */
export async function lancarCompetencia(
  locacaoId: string,
  dados: NovoLancamento,
): Promise<{ error: string } | void> {
  if (!(dados.valor > 0)) return { error: "Valor inválido." };
  if (!dados.competencia) return { error: "Competência é obrigatória." };
  if (!dados.data_vencimento) return { error: "Vencimento é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("lancamentos_financeiros").insert({
    locacao_id: locacaoId,
    tipo: dados.tipo,
    competencia: dados.competencia,
    valor: dados.valor,
    data_vencimento: dados.data_vencimento,
    responsavel: dados.responsavel,
  });
  if (error) return { error: error.message };

  revalidarFinanceiro(locacaoId);
}

/** Marca um lançamento como pago inserindo um evento 'pago' no ledger. */
export async function marcarPago(
  lancamentoId: string,
  dados: { valor: number; data_evento: string },
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { data: lancamento } = await supabase
    .from("lancamentos_financeiros")
    .select("locacao_id")
    .eq("id", lancamentoId)
    .maybeSingle();

  const { error } = await supabase.from("lancamento_eventos").insert({
    lancamento_id: lancamentoId,
    tipo: "pago",
    valor: dados.valor,
    data_evento: dados.data_evento,
  });
  if (error) return { error: error.message };

  if (lancamento?.locacao_id) revalidarFinanceiro(lancamento.locacao_id);
}

/** Cancela um lançamento inserindo um evento 'cancelado' no ledger. */
export async function cancelarLancamento(
  lancamentoId: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { data: lancamento } = await supabase
    .from("lancamentos_financeiros")
    .select("locacao_id")
    .eq("id", lancamentoId)
    .maybeSingle();

  const { error } = await supabase.from("lancamento_eventos").insert({
    lancamento_id: lancamentoId,
    tipo: "cancelado",
  });
  if (error) return { error: error.message };

  if (lancamento?.locacao_id) revalidarFinanceiro(lancamento.locacao_id);
}
