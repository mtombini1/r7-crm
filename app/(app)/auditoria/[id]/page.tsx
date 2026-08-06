import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/format";
import { ENTIDADE, ACAO } from "../page";

// Campos técnicos que não interessam ao usuário na visão de mudanças.
const OCULTAR = new Set([
  "id",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "imovel_id",
  "inquilino_id",
  "locacao_id",
  "entity_id",
  "entity_type",
  "storage_path",
]);

const CAMPO_LABEL: Record<string, string> = {
  nome: "Nome",
  endereco: "Endereço",
  matricula: "Matrícula",
  inscricao_imobiliaria: "Inscrição imobiliária",
  dic: "DIC",
  metragem_m2: "Metragem (m²)",
  status: "Status",
  doc_ambiental: "Doc. Ambiental",
  doc_iptu: "Doc. IPTU",
  doc_condominio: "Doc. Condomínio",
  deleted_at: "Arquivado em",
  tipo: "Tipo",
  cpf_cnpj: "CPF/CNPJ",
  rg: "RG",
  data_nascimento: "Data de nascimento",
  email: "E-mail",
  telefone: "Telefone",
  responsavel: "Responsável",
  fiador_nome: "Fiador",
  fiador_email: "E-mail do fiador",
  fiador_telefone: "Telefone do fiador",
  valor_aluguel: "Valor do aluguel",
  data_inicio: "Início",
  data_fim: "Fim (vigência)",
  data_renovacao: "Renovação",
  data_reajuste: "Reajuste",
  data_troca_desconto: "Troca de desconto",
  indice_correcao: "Índice de correção",
  dia_vencimento: "Dia de vencimento",
  competencia: "Competência",
  valor: "Valor",
  data_vencimento: "Vencimento",
  data_pagamento: "Pagamento",
  nome_arquivo: "Arquivo",
  mime_type: "Tipo do arquivo",
  novo_valor: "Novo valor",
  data_alvo: "Data-alvo",
};

function labelCampo(k: string): string {
  return CAMPO_LABEL[k] ?? k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function fmtValor(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  return String(v);
}

export default async function AuditoriaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("audit_log")
    .select("id, em, tabela, acao, ator, dados_antes, dados_depois")
    .eq("id", id)
    .maybeSingle();
  if (!log) notFound();

  let quem = "Sistema";
  if (log.ator) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("email, nome")
      .eq("id", log.ator)
      .maybeSingle();
    quem = perfil?.email ?? perfil?.nome ?? "Usuário removido";
  }

  const ent = ENTIDADE[log.tabela] ?? { artigo: "um", nome: log.tabela };
  const ac = ACAO[log.acao] ?? { label: log.acao, variant: "muted" as const };

  const antes = (log.dados_antes ?? {}) as unknown as Record<string, unknown>;
  const depois = (log.dados_depois ?? {}) as unknown as Record<string, unknown>;

  const mudancas: { campo: string; antes: unknown; depois: unknown }[] = [];
  if (log.acao === "update") {
    const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
    for (const k of chaves) {
      if (OCULTAR.has(k)) continue;
      if (JSON.stringify(antes[k]) !== JSON.stringify(depois[k])) {
        mudancas.push({ campo: k, antes: antes[k], depois: depois[k] });
      }
    }
  } else {
    const fonte = log.acao === "insert" ? depois : antes;
    for (const k of Object.keys(fonte)) {
      if (OCULTAR.has(k)) continue;
      if (fonte[k] === null || fonte[k] === "") continue;
      mudancas.push({ campo: k, antes: antes[k], depois: depois[k] });
    }
  }

  const isUpdate = log.acao === "update";
  const tituloTabela =
    isUpdate ? "O que mudou" : log.acao === "insert" ? "Valores cadastrados" : "Valores removidos";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detalhe da auditoria"
        description={`${ac.label} ${ent.artigo} ${ent.nome}`}
        action={
          <Link href="/auditoria" className={buttonVariants({ variant: "outline" })}>
            Voltar
          </Link>
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Quem fez</p>
            <p className="font-medium">{quem}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quando</p>
            <p className="font-medium">{formatDateTime(log.em)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ação</p>
            <Badge variant={ac.variant}>{ac.label}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Onde</p>
            <p className="font-medium capitalize">{ent.nome}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tituloTabela}</CardTitle>
        </CardHeader>
        <CardContent>
          {!mudancas.length ? (
            <p className="text-sm text-muted-foreground">Sem alterações de campos para exibir.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  {isUpdate && <TableHead>Antes</TableHead>}
                  <TableHead>{isUpdate ? "Depois" : "Valor"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mudancas.map((m) => (
                  <TableRow key={m.campo}>
                    <TableCell className="font-medium">{labelCampo(m.campo)}</TableCell>
                    {isUpdate && (
                      <TableCell className="text-muted-foreground">{fmtValor(m.antes)}</TableCell>
                    )}
                    <TableCell>
                      {fmtValor(log.acao === "delete" ? m.antes : m.depois)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
