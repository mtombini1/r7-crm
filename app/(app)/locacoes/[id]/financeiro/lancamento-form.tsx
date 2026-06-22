"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { lancarCompetencia } from "./actions";
import { calcularVencimento } from "@/lib/financeiro/competencias";
import type { Enums } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type Values = {
  tipo: Enums<"lancamento_tipo">;
  competenciaMes: string; // input month: yyyy-MM
  valor: string;
  data_vencimento: string;
  responsavel: Enums<"responsavel_pagamento">;
};

const TIPOS: { value: Enums<"lancamento_tipo">; label: string }[] = [
  { value: "aluguel", label: "Aluguel" },
  { value: "iptu", label: "IPTU" },
  { value: "condominio", label: "Condomínio" },
  { value: "ambiental", label: "Ambiental" },
];

export function LancamentoForm({
  locacaoId,
  diaVencimento,
}: {
  locacaoId: string;
  diaVencimento: number | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      tipo: "aluguel",
      competenciaMes: "",
      valor: "",
      data_vencimento: "",
      responsavel: "inquilino",
    },
  });

  const competenciaMes = watch("competenciaMes");

  function preencherVencimento() {
    if (diaVencimento == null || !competenciaMes) return;
    const competencia = `${competenciaMes}-01`;
    setValue("data_vencimento", calcularVencimento(competencia, diaVencimento));
  }

  async function onSubmit(v: Values) {
    setServerError(null);
    if (!v.competenciaMes) {
      setServerError("Informe a competência.");
      return;
    }
    const competencia = `${v.competenciaMes}-01`;
    const data_vencimento =
      v.data_vencimento ||
      (diaVencimento != null ? calcularVencimento(competencia, diaVencimento) : "");
    if (!data_vencimento) {
      setServerError("Informe o vencimento.");
      return;
    }
    const res = await lancarCompetencia(locacaoId, {
      tipo: v.tipo,
      competencia,
      valor: Number(v.valor),
      data_vencimento,
      responsavel: v.responsavel,
    });
    if (res?.error) {
      setServerError(res.error);
      return;
    }
    reset();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Select id="tipo" {...register("tipo")}>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="competenciaMes">Competência *</Label>
            <Input
              id="competenciaMes"
              type="month"
              {...register("competenciaMes", { required: true })}
              onBlur={preencherVencimento}
            />
            {errors.competenciaMes && (
              <p className="text-xs text-destructive">Competência é obrigatória.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              {...register("valor", { required: true })}
            />
            {errors.valor && <p className="text-xs text-destructive">Valor é obrigatório.</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_vencimento">Vencimento</Label>
            <Input id="data_vencimento" type="date" {...register("data_vencimento")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsavel">Responsável</Label>
            <Select id="responsavel" {...register("responsavel")}>
              <option value="inquilino">Inquilino</option>
              <option value="r7">R7</option>
            </Select>
          </div>

          {serverError && (
            <p className="text-sm text-destructive sm:col-span-2">{serverError}</p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lançando..." : "Lançar competência"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
