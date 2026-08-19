"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Marca o aluguel de uma competência (mês) como pago. Idempotente. */
export async function marcarAluguelPago(
  locacaoId: string,
  competencia: string,
  valor: number | null,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("aluguel_pagamentos")
    .upsert(
      { locacao_id: locacaoId, competencia, valor },
      { onConflict: "locacao_id,competencia", ignoreDuplicates: true },
    );
  revalidatePath("/locacoes");
  revalidatePath(`/locacoes/${locacaoId}`);
}

/** Desfaz a marcação de pago (remove o registro daquela competência). */
export async function desmarcarAluguelPago(
  locacaoId: string,
  competencia: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("aluguel_pagamentos")
    .delete()
    .eq("locacao_id", locacaoId)
    .eq("competencia", competencia);
  revalidatePath("/locacoes");
  revalidatePath(`/locacoes/${locacaoId}`);
}

/** Marca um débito de encerramento como quitado (mantém o histórico). */
export async function quitarDebito(debitoId: string, inquilinoId: string): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  await supabase
    .from("debitos_encerramento")
    .update({ quitado_em: new Date().toISOString(), quitado_por: userData.user?.id ?? null })
    .eq("id", debitoId);
  revalidatePath("/dashboard");
  revalidatePath(`/inquilinos/${inquilinoId}`);
}

/** Reabre um débito quitado (desfaz a quitação). */
export async function reabrirDebito(debitoId: string, inquilinoId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("debitos_encerramento")
    .update({ quitado_em: null, quitado_por: null })
    .eq("id", debitoId);
  revalidatePath("/dashboard");
  revalidatePath(`/inquilinos/${inquilinoId}`);
}
