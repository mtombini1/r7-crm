import type { Enums } from "./types";

/** Bucket privado onde ficam os documentos das entidades. */
export const ARQUIVOS_BUCKET = "arquivos";

/** Tipos MIME permitidos para upload (PDF, imagens, Word e Excel). */
export const MIME_PERMITIDOS = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

/** Tamanho máximo permitido por arquivo: 25 MB. */
export const MAX_TAMANHO = 25 * 1024 * 1024;

/** Valida tipo MIME e tamanho de um arquivo antes do upload. */
export function validarArquivo(file: { type: string; size: number }): {
  ok: boolean;
  erro?: string;
} {
  if (!file.size) return { ok: false, erro: "Selecione um arquivo." };
  if (!MIME_PERMITIDOS.includes(file.type as (typeof MIME_PERMITIDOS)[number])) {
    return { ok: false, erro: "Tipo de arquivo não permitido." };
  }
  if (file.size > MAX_TAMANHO) {
    return { ok: false, erro: "Arquivo excede o limite de 25 MB." };
  }
  return { ok: true };
}

/**
 * Sanitiza um nome de arquivo para uso como "key" no Storage:
 * decompõe acentos (NFD), remove tudo que não é ASCII (as marcas de acento somem,
 * sobra a letra base) e troca espaços/símbolos por "_", mantendo só [a-zA-Z0-9._-].
 * (O Supabase Storage rejeita keys com acentos/espaços — ex.: "PROCURAÇÃO X5.doc".)
 */
export function sanitizeFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot) : "";

  const limpar = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[^\x00-\x7F]/g, "") // remove não-ASCII (marcas de acento, etc.)
      .replace(/[^a-zA-Z0-9._-]+/g, "_") // espaços/símbolos viram "_"
      .replace(/_+/g, "_")
      .replace(/^[_.-]+|[_.-]+$/g, "");

  const baseLimpa = limpar(base) || "arquivo";
  const extLimpa = limpar(ext).toLowerCase();
  return extLimpa ? `${baseLimpa}.${extLimpa}` : baseLimpa;
}

/** Monta o caminho de armazenamento no bucket: entityType/entityId/timestamp-nome. */
export function storagePath(
  entityType: Enums<"entidade_arquivo">,
  entityId: string,
  fileName: string,
): string {
  return `${entityType}/${entityId}/${Date.now()}-${sanitizeFileName(fileName)}`;
}
