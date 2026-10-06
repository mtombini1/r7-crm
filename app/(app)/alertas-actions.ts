"use server";

import { getAlertasPendentes } from "@/lib/alertas/queries";

/** Busca os alertas pendentes sob demanda (usado pelo sino de notificações). */
export async function buscarAlertasPendentes() {
  return getAlertasPendentes();
}
