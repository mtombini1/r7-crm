"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { criarLocacao, atualizarLocacao } from "./actions";
import type { Tables } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type Values = {
  imovel_id: string;
  inquilino_id: string;
  valor_aluguel: string;
  data_inicio: string;
  data_renovacao: string;
  data_reajuste: string;
  data_troca_desconto: string;
  indice_correcao: string;
  dia_vencimento: string;
};

export function LocacaoForm({
  locacao,
  imoveis,
  inquilinos,
}: {
  locacao?: Tables<"locacoes">;
  imoveis: { id: string; nome: string }[];
  inquilinos: { id: string; nome: string }[];
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      imovel_id: locacao?.imovel_id ?? "",
      inquilino_id: locacao?.inquilino_id ?? "",
      valor_aluguel: locacao?.valor_aluguel?.toString() ?? "",
      data_inicio: locacao?.data_inicio ?? "",
      data_renovacao: locacao?.data_renovacao ?? "",
      data_reajuste: locacao?.data_reajuste ?? "",
      data_troca_desconto: locacao?.data_troca_desconto ?? "",
      indice_correcao: locacao?.indice_correcao ?? "",
      dia_vencimento: locacao?.dia_vencimento?.toString() ?? "",
    },
  });

  async function onSubmit(v: Values) {
    setServerError(null);
    const payload = {
      imovel_id: v.imovel_id,
      inquilino_id: v.inquilino_id,
      valor_aluguel: v.valor_aluguel === "" ? null : Number(v.valor_aluguel),
      data_inicio: v.data_inicio,
      data_renovacao: v.data_renovacao === "" ? null : v.data_renovacao,
      data_reajuste: v.data_reajuste === "" ? null : v.data_reajuste,
      data_troca_desconto: v.data_troca_desconto === "" ? null : v.data_troca_desconto,
      indice_correcao: v.indice_correcao === "" ? null : v.indice_correcao,
      dia_vencimento: v.dia_vencimento === "" ? null : Number(v.dia_vencimento),
    };
    const res = locacao
      ? await atualizarLocacao(locacao.id, payload)
      : await criarLocacao(payload);
    if (res?.error) setServerError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imovel_id">Imóvel *</Label>
            <Select id="imovel_id" {...register("imovel_id", { required: true })}>
              <option value="">Selecione…</option>
              {imoveis.map((im) => (
                <option key={im.id} value={im.id}>
                  {im.nome}
                </option>
              ))}
            </Select>
            {errors.imovel_id && (
              <p className="text-xs text-destructive">Imóvel é obrigatório.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inquilino_id">Inquilino *</Label>
            <Select id="inquilino_id" {...register("inquilino_id", { required: true })}>
              <option value="">Selecione…</option>
              {inquilinos.map((iq) => (
                <option key={iq.id} value={iq.id}>
                  {iq.nome}
                </option>
              ))}
            </Select>
            {errors.inquilino_id && (
              <p className="text-xs text-destructive">Inquilino é obrigatório.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valor_aluguel">Valor do aluguel *</Label>
            <Input
              id="valor_aluguel"
              type="number"
              step="0.01"
              {...register("valor_aluguel", { required: true })}
            />
            {errors.valor_aluguel && (
              <p className="text-xs text-destructive">Valor do aluguel é obrigatório.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dia_vencimento">Dia de vencimento (1-28)</Label>
            <Input
              id="dia_vencimento"
              type="number"
              min="1"
              max="28"
              {...register("dia_vencimento")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_inicio">Data de início *</Label>
            <Input
              id="data_inicio"
              type="date"
              {...register("data_inicio", { required: true })}
            />
            {errors.data_inicio && (
              <p className="text-xs text-destructive">Data de início é obrigatória.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_renovacao">Data de renovação</Label>
            <Input id="data_renovacao" type="date" {...register("data_renovacao")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_reajuste">Data de reajuste</Label>
            <Input id="data_reajuste" type="date" {...register("data_reajuste")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_troca_desconto">Data de troca de desconto</Label>
            <Input
              id="data_troca_desconto"
              type="date"
              {...register("data_troca_desconto")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="indice_correcao">Índice de correção</Label>
            <Input id="indice_correcao" {...register("indice_correcao")} />
          </div>
        </CardContent>
      </Card>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
        <Link href="/locacoes" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
