"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { PainelAlertas } from "./alerta-modal";
import { buscarAlertasPendentes } from "@/app/(app)/alertas-actions";
import type { AlertaContratual, AlertaFinanceiro } from "@/lib/alertas/queries";

type Dados = { contratuais: AlertaContratual[]; financeiros: AlertaFinanceiro[] };

/**
 * Sino de notificações (canto superior direito). Clicar abre o painel de alertas.
 * `inicial` vem do layout só na 1ª vez da sessão (abre automaticamente); nas
 * demais navegações vem null e os alertas são buscados sob demanda ao clicar.
 */
export function CentralAlertas({ inicial }: { inicial: Dados | null }) {
  const [dados, setDados] = useState<Dados | null>(inicial);
  const [aberto, setAberto] = useState(
    inicial != null && inicial.contratuais.length + inicial.financeiros.length > 0,
  );
  const [carregando, setCarregando] = useState(false);
  const [montado, setMontado] = useState(false);

  // Marca a sessão como "alertas checados" → o layout deixa de buscá-los a cada
  // navegação (mais rápido). O logout limpa o cookie para reaparecer no próximo acesso.
  useEffect(() => {
    setMontado(true);
    document.cookie = "alertas_checados=1; path=/; SameSite=Lax";
  }, []);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setDados(await buscarAlertasPendentes());
    } finally {
      setCarregando(false);
    }
  }, []);

  async function aoClicar() {
    if (aberto) {
      setAberto(false);
      return;
    }
    await recarregar(); // sempre busca o estado atual ao abrir
    setAberto(true);
  }

  const total = (dados?.contratuais.length ?? 0) + (dados?.financeiros.length ?? 0);

  return (
    <>
      <button
        type="button"
        onClick={aoClicar}
        disabled={carregando}
        aria-label="Alertas e pendências"
        title="Alertas e pendências"
        className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        <Bell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>
      {/* Portal para o body: evita que o header (com backdrop-blur) vire o
          contêiner de referência do position:fixed e quebre o posicionamento. */}
      {montado &&
        aberto &&
        dados &&
        createPortal(
          <PainelAlertas
            contratuais={dados.contratuais}
            financeiros={dados.financeiros}
            onFechar={() => setAberto(false)}
            onAcao={recarregar}
          />,
          document.body,
        )}
    </>
  );
}
