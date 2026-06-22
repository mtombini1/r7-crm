"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inquilinoSchema } from "@/lib/validation/inquilino";

export async function criarInquilino(raw: unknown): Promise<{ error: string } | void> {
  const parsed = inquilinoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("inquilinos").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/inquilinos");
  redirect("/inquilinos");
}

export async function atualizarInquilino(
  id: string,
  raw: unknown,
): Promise<{ error: string } | void> {
  const parsed = inquilinoSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.from("inquilinos").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/inquilinos");
  revalidatePath(`/inquilinos/${id}`);
  redirect(`/inquilinos/${id}`);
}

export async function arquivarInquilino(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("inquilinos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/inquilinos");
  redirect("/inquilinos");
}
