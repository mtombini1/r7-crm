"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";
import {
  ARQUIVOS_BUCKET,
  storagePath,
  validarArquivo,
} from "@/lib/supabase/storage";

const PATH_POR_TIPO: Record<Enums<"entidade_arquivo">, string> = {
  imovel: "imoveis",
  inquilino: "inquilinos",
  locacao: "locacoes",
};

function revalidarEntidade(entityType: Enums<"entidade_arquivo">, entityId: string) {
  revalidatePath(`/${PATH_POR_TIPO[entityType]}/${entityId}`);
}

/** Anexa um arquivo a uma entidade: valida, faz upload no bucket e registra a linha. */
export async function anexarArquivo(
  entityType: Enums<"entidade_arquivo">,
  entityId: string,
  formData: FormData,
): Promise<{ error: string } | void> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecione um arquivo." };

  const valido = validarArquivo({ type: file.type, size: file.size });
  if (!valido.ok) return { error: valido.erro ?? "Arquivo inválido." };

  const supabase = await createClient();
  const path = storagePath(entityType, entityId, file.name);

  const { error: uploadError } = await supabase.storage
    .from(ARQUIVOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("arquivos").insert({
    entity_type: entityType,
    entity_id: entityId,
    nome: file.name,
    storage_path: path,
    mime_type: file.type,
    tamanho: file.size,
  });
  if (insertError) return { error: insertError.message };

  revalidarEntidade(entityType, entityId);
}

/** Arquiva (soft-delete) um arquivo anexado a uma entidade. */
export async function arquivarArquivo(
  id: string,
  entityType: Enums<"entidade_arquivo">,
  entityId: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("arquivos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidarEntidade(entityType, entityId);
}
