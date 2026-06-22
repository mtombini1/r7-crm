"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { criarImovel, atualizarImovel } from "./actions";
import type { Tables } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

type Values = {
  nome: string;
  endereco: string;
  matricula: string;
  inscricao_imobiliaria: string;
  dic: string;
  metragem_m2: string;
  doc_ambiental: boolean;
  doc_iptu: boolean;
  doc_condominio: boolean;
};

export function ImovelForm({ imovel }: { imovel?: Tables<"imoveis"> }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      nome: imovel?.nome ?? "",
      endereco: imovel?.endereco ?? "",
      matricula: imovel?.matricula ?? "",
      inscricao_imobiliaria: imovel?.inscricao_imobiliaria ?? "",
      dic: imovel?.dic ?? "",
      metragem_m2: imovel?.metragem_m2?.toString() ?? "",
      doc_ambiental: imovel?.doc_ambiental ?? false,
      doc_iptu: imovel?.doc_iptu ?? false,
      doc_condominio: imovel?.doc_condominio ?? false,
    },
  });

  async function onSubmit(v: Values) {
    setServerError(null);
    const payload = {
      ...v,
      metragem_m2: v.metragem_m2 === "" ? null : Number(v.metragem_m2),
    };
    const res = imovel ? await atualizarImovel(imovel.id, payload) : await criarImovel(payload);
    if (res?.error) setServerError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome", { required: true })} />
            {errors.nome && <p className="text-xs text-destructive">Nome é obrigatório.</p>}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" {...register("endereco")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input id="matricula" {...register("matricula")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inscricao_imobiliaria">Inscrição imobiliária</Label>
            <Input id="inscricao_imobiliaria" {...register("inscricao_imobiliaria")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dic">DIC</Label>
            <Input id="dic" {...register("dic")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metragem_m2">Metragem (m²)</Label>
            <Input id="metragem_m2" type="number" step="0.01" {...register("metragem_m2")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <p className="text-sm font-medium">Checklist de documentos</p>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox {...register("doc_ambiental")} /> Ambiental
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox {...register("doc_iptu")} /> IPTU
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox {...register("doc_condominio")} /> Condomínio
          </label>
        </CardContent>
      </Card>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
        <Link href="/imoveis" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
