"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { labelMarco, labelTipoContratual, severidadeMarco } from "@/lib/alertas/marcos";
import type { AlertaContratual, AlertaFinanceiro } from "@/lib/alertas/queries";
import { reconhecerReajuste, reconhecerAlerta } from "@/app/(app)/locacoes/actions";

const tipoFinanceiroLabel: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

function ContratualCard({
  alerta,
  onAcao,
}: {
  alerta: AlertaContratual;
  onAcao?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [novoValor, setNovoValor] = useState("");
  const [error, setError] = useState<string | null>(null);

  function confirmarReajuste() {
    setError(null);
    const valor = Number(novoValor.replace(",", "."));
    if (!Number.isFinite(valor) || valor <= 0) {
      setError("Informe o novo valor do aluguel.");
      return;
    }
    startTransition(async () => {
      const res = await reconhecerReajuste(alerta.locacaoId, alerta.dataAlvo, valor);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onAcao?.();
    });
  }

  function confirmarCiente() {
    setError(null);
    const tipo = alerta.tipo;
    if (tipo !== "renovacao" && tipo !== "desconto") return;
    startTransition(async () => {
      const res = await reconhecerAlerta(alerta.locacaoId, tipo, alerta.dataAlvo);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onAcao?.();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{labelTipoContratual(alerta.tipo)}</span>
          <span className="text-sm text-muted-foreground">
            {alerta.imovelNome ?? "Imóvel"}
            {alerta.inquilinoNome ? ` · ${alerta.inquilinoNome}` : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            Data-alvo: {formatDate(alerta.dataAlvo)}
          </span>
        </div>
        <Badge variant={severidadeMarco(alerta.marco)}>{labelMarco(alerta.marco)}</Badge>
      </div>

      {alerta.tipo === "reajuste" ? (
        <div className="flex flex-col gap-2">
          {alerta.valorAtual != null && (
            <span className="text-xs text-muted-foreground">
              Valor atual: {formatBRL(alerta.valorAtual)}
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`novo-valor-${alerta.locacaoId}`}>Novo valor do aluguel *</Label>
            <Input
              id={`novo-valor-${alerta.locacaoId}`}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={novoValor}
              onChange={(e) => setNovoValor(e.target.value)}
              placeholder="0,00"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="button" onClick={confirmarReajuste} disabled={isPending}>
            {isPending ? "Confirmando..." : "Confirmar reajuste"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="button" variant="outline" onClick={confirmarCiente} disabled={isPending}>
            {isPending ? "Salvando..." : "Ciente"}
          </Button>
        </div>
      )}
    </div>
  );
}

function FinanceiroItem({ alerta }: { alerta: AlertaFinanceiro }) {
  const atrasado = (alerta.diasEmAtraso ?? 0) > 0;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">
          {tipoFinanceiroLabel[alerta.tipo] ?? alerta.tipo} · {formatBRL(alerta.valor)}
        </span>
        <span className="text-sm text-muted-foreground">
          {alerta.imovelNome ?? "Imóvel"}
          {alerta.inquilinoNome ? ` · ${alerta.inquilinoNome}` : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          Vencimento: {formatDate(alerta.dataVencimento)}
          {alerta.responsavel ? ` · ${alerta.responsavel === "r7" ? "R7" : "Inquilino"}` : ""}
        </span>
      </div>
      <div className="flex flex-col items-end gap-2">
        {atrasado && (
          <Badge variant="destructive">
            {alerta.diasEmAtraso} {alerta.diasEmAtraso === 1 ? "dia" : "dias"} em atraso
          </Badge>
        )}
        {alerta.locacaoId && (
          <Link
            href={`/locacoes/${alerta.locacaoId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Ver locação
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Painel (modal) de alertas pendentes. Usado tanto na abertura automática (1x por
 * sessão) quanto ao clicar no sino. `onFechar` fecha; `onAcao` é chamado após
 * reconhecer um alerta, para o pai recarregar a lista.
 */
export function PainelAlertas({
  contratuais,
  financeiros,
  onFechar,
  onAcao,
}: {
  contratuais: AlertaContratual[];
  financeiros: AlertaFinanceiro[];
  onFechar: () => void;
  onAcao?: () => void;
}) {
  const vazio = contratuais.length === 0 && financeiros.length === 0;

  const total = contratuais.length + financeiros.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alerta-modal-titulo"
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg">
        {/* Cabeçalho fixo */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-6 pb-4">
          <div className="flex flex-col gap-1">
            <h2 id="alerta-modal-titulo" className="text-lg font-semibold">
              Alertas pendentes {total > 0 && `(${total})`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {vazio
                ? "Tudo em dia por aqui."
                : "Resolva os alertas abaixo, ou feche para ver depois."}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            title="Fechar"
            className="-mr-1.5 -mt-1.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          {vazio && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma pendência no momento. 🎉
            </p>
          )}

          {contratuais.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contratuais
              </span>
              {contratuais.map((a) => (
                <ContratualCard
                  key={`${a.locacaoId}-${a.tipo}-${a.dataAlvo}`}
                  alerta={a}
                  onAcao={onAcao}
                />
              ))}
            </div>
          )}

          {financeiros.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Financeiros
              </span>
              {financeiros.map((a) => (
                <FinanceiroItem key={a.lancamentoId} alerta={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
