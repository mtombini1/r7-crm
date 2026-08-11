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
