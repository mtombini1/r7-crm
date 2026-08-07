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
import { Textarea } from "@/components/ui/textarea";
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
  observacoes: string;
  tem_vaga: boolean;
  vaga_quantidade: string;
  vaga_matricula: string;
  vaga_inscricao_imobiliaria: string;
  vaga_dic: string;
};

export function ImovelForm({ imovel }: { imovel?: Tables<"imoveis"> }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
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
      observacoes: imovel?.observacoes ?? "",
      tem_vaga: imovel?.tem_vaga ?? false,
      vaga_quantidade: imovel?.vaga_quantidade?.toString() ?? "",
      vaga_matricula: imovel?.vaga_matricula ?? "",
      vaga_inscricao_imobiliaria: imovel?.vaga_inscricao_imobiliaria ?? "",
      vaga_dic: imovel?.vaga_dic ?? "",
    },
  });

  const temVaga = watch("tem_vaga");

  async function onSubmit(v: Values) {
    setServerError(null);
    const payload = {
      nome: v.nome,
      endereco: v.endereco,
      matricula: v.matricula,
      inscricao_imobiliaria: v.inscricao_imobiliaria,
      dic: v.dic,
      metragem_m2: v.metragem_m2 === "" ? null : Number(v.metragem_m2),
      doc_ambiental: v.doc_ambiental,
      doc_iptu: v.doc_iptu,
      doc_condominio: v.doc_condominio,
      observacoes: v.observacoes === "" ? null : v.observacoes,
      tem_vaga: v.tem_vaga,
      vaga_quantidade: !v.tem_vaga || v.vaga_quantidade === "" ? null : Number(v.vaga_quantidade),
      vaga_matricula: !v.tem_vaga || v.vaga_matricula === "" ? null : v.vaga_matricula,
      vaga_inscricao_imobiliaria:
        !v.tem_vaga || v.vaga_inscricao_imobiliaria === "" ? null : v.vaga_inscricao_imobiliaria,
      vaga_dic: !v.tem_vaga || v.vaga_dic === "" ? null : v.vaga_dic,
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

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <Checkbox {...register("tem_vaga")} /> Tem vaga de garagem?
          </label>
          {temVaga && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vaga_quantidade">Quantidade de vagas</Label>
                <Input id="vaga_quantidade" type="number" min="0" {...register("vaga_quantidade")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vaga_matricula">Matrícula da vaga</Label>
                <Input id="vaga_matricula" {...register("vaga_matricula")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vaga_inscricao_imobiliaria">Inscrição imobiliária da vaga</Label>
                <Input
                  id="vaga_inscricao_imobiliaria"
                  {...register("vaga_inscricao_imobiliaria")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vaga_dic">DIC da vaga</Label>
                <Input id="vaga_dic" {...register("vaga_dic")} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1.5 pt-6">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            rows={4}
            placeholder="Informações complementares sobre o imóvel..."
            {...register("observacoes")}
          />
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
