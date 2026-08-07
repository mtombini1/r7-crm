/** Normaliza texto para busca: remove acentos (NFD → descarta não-ASCII) e deixa minúsculo. */
export function normalizarBusca(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Retorna true se o termo (já normalizado) aparece em qualquer um dos campos.
 * Junta os campos num único texto e checa `includes` — busca "contém", sem acento.
 */
export function correspondeBusca(
  termoNormalizado: string,
  campos: Array<string | number | null | undefined>,
): boolean {
  if (!termoNormalizado) return true;
  const texto = normalizarBusca(campos.map((c) => (c == null ? "" : String(c))).join(" "));
  return texto.includes(termoNormalizado);
}
