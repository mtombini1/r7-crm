"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { imovelSchema } from "@/lib/validation/imovel";

export async function criarImovel(raw: unknown): Promise<{ error: string } | void> {
  const parsed = imovelSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("imoveis").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/imoveis");
  redirect("/imoveis");
}

export async function atualizarImovel(
  id: string,
  raw: unknown,
): Promise<{ error: string } | void> {
  const parsed = imovelSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("imoveis").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/imoveis");
  revalidatePath(`/imoveis/${id}`);
  redirect(`/imoveis/${id}`);
}

export async function arquivarImovel(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("imoveis").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/imoveis");
  // Vai para a aba de arquivados para o usuário ver onde o imóvel foi parar (e poder restaurar).
  redirect("/imoveis?arquivados=1");
}

export async function desarquivarImovel(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("imoveis").update({ deleted_at: null }).eq("id", id);
  revalidatePath("/imoveis");
  redirect("/imoveis");
}
