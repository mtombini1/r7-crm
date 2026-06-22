"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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

function ContratualCard({ alerta }: { alerta: AlertaContratual }) {
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
          <Button
            type="button"
            variant="outline"
            onClick={confirmarCiente}
            disabled={isPending}
          >
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

export function AlertaModal({
  contratuais,
  financeiros,
}: {
  contratuais: AlertaContratual[];
  financeiros: AlertaFinanceiro[];
}) {
  // Some quando não há nenhum alerta pendente.
  if (contratuais.length === 0 && financeiros.length === 0) return null;

  const bloqueante = contratuais.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alerta-modal-titulo"
    >
      <div className="my-auto flex w-full max-w-lg flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="flex flex-col gap-1">
          <h2 id="alerta-modal-titulo" className="text-lg font-semibold">
            Alertas pendentes
          </h2>
          <p className="text-sm text-muted-foreground">
            {bloqueante
              ? "Resolva os alertas contratuais abaixo para continuar."
              : "Pendências financeiras informativas."}
          </p>
        </div>

        {contratuais.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contratuais
            </span>
            {contratuais.map((a) => (
              <ContratualCard key={`${a.locacaoId}-${a.tipo}-${a.dataAlvo}`} alerta={a} />
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
  );
}
