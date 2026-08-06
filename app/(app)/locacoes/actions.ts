"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { locacaoSchema } from "@/lib/validation/locacao";
import { hojeISO } from "@/lib/utils/format";

export async function criarLocacao(raw: unknown): Promise<{ error: string } | void> {
  const parsed = locacaoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("locacoes").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/locacoes");
  redirect("/locacoes");
}

export async function atualizarLocacao(
  id: string,
  raw: unknown,
): Promise<{ error: string } | void> {
  const parsed = locacaoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("locacoes").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/locacoes");
  revalidatePath(`/locacoes/${id}`);
  redirect(`/locacoes/${id}`);
}

export async function encerrarLocacao(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("locacoes")
    .update({ status: "encerrada", data_fim: hojeISO() })
    .eq("id", id);
  revalidatePath("/locacoes");
  redirect("/locacoes");
}

/** "Excluir" da lista: soft-delete (preserva histórico/arquivos; restaurável). */
export async function arquivarLocacao(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("locacoes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/locacoes");
  redirect("/locacoes?filtro=excluidas");
}

export async function desarquivarLocacao(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("locacoes").update({ deleted_at: null }).eq("id", id);
  revalidatePath("/locacoes");
  redirect("/locacoes");
}

/**
 * Reconhece um alerta de reajuste: registra o reconhecimento com o novo valor
 * e atualiza o valor do aluguel da locação. `reconhecido_por` é preenchido pelo
 * default `auth.uid()` no banco — não deve ser enviado.
 */
export async function reconhecerReajuste(
  locacaoId: string,
  dataAlvo: string,
  novoValor: number,
): Promise<{ error: string } | void> {
  if (!Number.isFinite(novoValor) || novoValor <= 0) {
    return { error: "Informe o novo valor do aluguel." };
  }

  const supabase = await createClient();

  const { error: recError } = await supabase.from("alertas_reconhecimentos").insert({
    locacao_id: locacaoId,
    tipo: "reajuste",
    data_alvo: dataAlvo,
    novo_valor: novoValor,
  });
  if (recError) return { error: recError.message };

  const { error: updError } = await supabase
    .from("locacoes")
    .update({ valor_aluguel: novoValor })
    .eq("id", locacaoId);
  if (updError) return { error: updError.message };

  revalidatePath("/locacoes");
  revalidatePath(`/locacoes/${locacaoId}`);
  revalidatePath("/dashboard");
}

/**
 * Reconhece um alerta de renovação ou de encerramento de desconto (sem novo
 * valor). `reconhecido_por` é preenchido pelo default `auth.uid()` no banco.
 */
export async function reconhecerAlerta(
  locacaoId: string,
  tipo: "renovacao" | "desconto",
  dataAlvo: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { error } = await supabase.from("alertas_reconhecimentos").insert({
    locacao_id: locacaoId,
    tipo,
    data_alvo: dataAlvo,
  });
  if (error) return { error: error.message };

  revalidatePath("/locacoes");
  revalidatePath(`/locacoes/${locacaoId}`);
  revalidatePath("/dashboard");
}
