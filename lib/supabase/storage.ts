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

/** Monta o caminho de armazenamento no bucket: entityType/entityId/timestamp-nome. */
export function storagePath(
  entityType: Enums<"entidade_arquivo">,
  entityId: string,
  fileName: string,
): string {
  return `${entityType}/${entityId}/${Date.now()}-${fileName}`;
}
