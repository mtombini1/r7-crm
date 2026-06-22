"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { criarInquilino, atualizarInquilino } from "./actions";
import type { Tables } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

type Values = {
  tipo: "pf" | "pj";
  nome: string;
  cpf_cnpj: string;
  rg: string;
  data_nascimento: string;
  endereco: string;
  email: string;
  telefone: string;
  responsavel: string;
  fiador_nome: string;
  fiador_email: string;
  fiador_telefone: string;
};

export function InquilinoForm({ inquilino }: { inquilino?: Tables<"inquilinos"> }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      tipo: inquilino?.tipo ?? "pf",
      nome: inquilino?.nome ?? "",
      cpf_cnpj: inquilino?.cpf_cnpj ?? "",
      rg: inquilino?.rg ?? "",
      data_nascimento: inquilino?.data_nascimento ?? "",
      endereco: inquilino?.endereco ?? "",
      email: inquilino?.email ?? "",
      telefone: inquilino?.telefone ?? "",
      responsavel: inquilino?.responsavel ?? "",
      fiador_nome: inquilino?.fiador_nome ?? "",
      fiador_email: inquilino?.fiador_email ?? "",
      fiador_telefone: inquilino?.fiador_telefone ?? "",
    },
  });

  async function onSubmit(v: Values) {
    setServerError(null);
    const payload = {
      tipo: v.tipo,
      nome: v.nome,
      cpf_cnpj: v.cpf_cnpj,
      rg: v.rg === "" ? null : v.rg,
      data_nascimento: v.data_nascimento === "" ? null : v.data_nascimento,
      endereco: v.endereco === "" ? null : v.endereco,
      email: v.email === "" ? null : v.email,
      telefone: v.telefone === "" ? null : v.telefone,
      responsavel: v.responsavel === "" ? null : v.responsavel,
      fiador_nome: v.fiador_nome === "" ? null : v.fiador_nome,
      fiador_email: v.fiador_email === "" ? null : v.fiador_email,
      fiador_telefone: v.fiador_telefone === "" ? null : v.fiador_telefone,
    };
    const res = inquilino
      ? await atualizarInquilino(inquilino.id, payload)
      : await criarInquilino(payload);
    if (res?.error) setServerError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select id="tipo" {...register("tipo", { required: true })}>
              <option value="pf">Pessoa Física</option>
              <option value="pj">Pessoa Jurídica</option>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
            <Input id="cpf_cnpj" {...register("cpf_cnpj", { required: true })} />
            {errors.cpf_cnpj && (
              <p className="text-xs text-destructive">CPF/CNPJ é obrigatório.</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome / Razão social *</Label>
            <Input id="nome" {...register("nome", { required: true })} />
            {errors.nome && <p className="text-xs text-destructive">Nome é obrigatório.</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rg">RG</Label>
            <Input id="rg" {...register("rg")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data_nascimento">Data de nascimento</Label>
            <Input id="data_nascimento" type="date" {...register("data_nascimento")} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" {...register("endereco")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input id="responsavel" {...register("responsavel")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <p className="text-sm font-medium sm:col-span-2">Fiador (opcional)</p>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="fiador_nome">Nome do fiador</Label>
            <Input id="fiador_nome" {...register("fiador_nome")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fiador_email">E-mail do fiador</Label>
            <Input id="fiador_email" type="email" {...register("fiador_email")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fiador_telefone">Telefone do fiador</Label>
            <Input id="fiador_telefone" {...register("fiador_telefone")} />
          </div>
        </CardContent>
      </Card>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
        <Link href="/inquilinos" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
