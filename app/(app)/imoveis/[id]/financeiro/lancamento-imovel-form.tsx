"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { lancarCompetenciaImovel } from "./actions";
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
};

const TIPOS: { value: Enums<"lancamento_tipo">; label: string }[] = [
  { value: "aluguel", label: "Aluguel" },
  { value: "iptu", label: "IPTU" },
  { value: "condominio", label: "Condomínio" },
  { value: "ambiental", label: "Ambiental" },
];

export function LancamentoImovelForm({ imovelId }: { imovelId: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      tipo: "iptu",
      competenciaMes: "",
      valor: "",
      data_vencimento: "",
    },
  });

  async function onSubmit(v: Values) {
    setServerError(null);
    if (!v.competenciaMes) {
      setServerError("Informe a competência.");
      return;
    }
    if (!v.data_vencimento) {
      setServerError("Informe o vencimento.");
      return;
    }
    const competencia = `${v.competenciaMes}-01`;
    const res = await lancarCompetenciaImovel(imovelId, {
      tipo: v.tipo,
      competencia,
      valor: Number(v.valor),
      data_vencimento: v.data_vencimento,
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
            <Label htmlFor="data_vencimento">Vencimento *</Label>
            <Input
              id="data_vencimento"
              type="date"
              {...register("data_vencimento", { required: true })}
            />
            {errors.data_vencimento && (
              <p className="text-xs text-destructive">Vencimento é obrigatório.</p>
            )}
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
