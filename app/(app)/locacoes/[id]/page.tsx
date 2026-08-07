import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { ArquivosTab } from "@/components/domain/arquivos-tab";
import { ARQUIVOS_BUCKET } from "@/lib/supabase/storage";
import { encerrarLocacao } from "../actions";

export default async function LocacaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: locacao } = await supabase
    .from("locacoes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!locacao) notFound();

  const [{ data: imovel }, { data: inquilino }] = await Promise.all([
    supabase.from("imoveis").select("id, nome").eq("id", locacao.imovel_id).maybeSingle(),
    supabase
      .from("inquilinos")
      .select("id, nome")
      .eq("id", locacao.inquilino_id)
      .maybeSingle(),
  ]);

  const { data: arquivosRows } = await supabase
    .from("arquivos")
    .select("id, nome, storage_path, created_at")
    .eq("entity_type", "locacao")
    .eq("entity_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const arquivos = await Promise.all(
    (arquivosRows ?? []).map(async (a) => {
      const { data: signed } = await supabase.storage
        .from(ARQUIVOS_BUCKET)
        .createSignedUrl(a.storage_path, 3600);
      return { id: a.id, nome: a.nome, url: signed?.signedUrl ?? null, criadoEm: a.created_at };
    }),
  );

  async function encerrar() {
    "use server";
    await encerrarLocacao(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={imovel?.nome ?? "Locação"}
        description={inquilino?.nome ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/locacoes/${id}/financeiro`} className={buttonVariants()}>
              Financeiro
            </Link>
            <Link
              href={`/locacoes/${id}/editar`}
              className={buttonVariants({ variant: "outline" })}
            >
              Editar
            </Link>
            {locacao.status === "ativa" && (
              <form action={encerrar}>
                <Button type="submit" variant="destructive">
                  Encerrar
                </Button>
              </form>
            )}
          </div>
        }
      />

      <Badge variant={locacao.status === "ativa" ? "success" : "muted"}>
        {locacao.status === "ativa" ? "Ativa" : "Encerrada"}
      </Badge>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Partes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Imóvel</span>
            <span className="text-right">
              {imovel ? (
                <Link href={`/imoveis/${imovel.id}`} className="text-primary hover:underline">
                  {imovel.nome}
                </Link>
              ) : (
                "—"
              )}
            </span>
            <span className="text-muted-foreground">Inquilino</span>
            <span className="text-right">
              {inquilino ? (
                <Link
                  href={`/inquilinos/${inquilino.id}`}
                  className="text-primary hover:underline"
                >
                  {inquilino.nome}
                </Link>
              ) : (
                "—"
              )}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Aluguel</span>
            <span className="text-right">{formatBRL(locacao.valor_aluguel)}</span>
            <span className="text-muted-foreground">Dia de vencimento</span>
            <span className="text-right">{locacao.dia_vencimento ?? "—"}</span>
            <span className="text-muted-foreground">Índice de correção</span>
            <span className="text-right">{locacao.indice_correcao || "—"}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Início</span>
            <span className="text-right">{formatDate(locacao.data_inicio)}</span>
            <span className="text-muted-foreground">Fim</span>
            <span className="text-right">{formatDate(locacao.data_fim)}</span>
            <span className="text-muted-foreground">Renovação</span>
            <span className="text-right">{formatDate(locacao.data_renovacao)}</span>
            <span className="text-muted-foreground">Reajuste</span>
            <span className="text-right">{formatDate(locacao.data_reajuste)}</span>
            <span className="text-muted-foreground">Troca de desconto</span>
            <span className="text-right">{formatDate(locacao.data_troca_desconto)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ArquivosTab entityType="locacao" entityId={id} arquivos={arquivos} />
          </CardContent>
        </Card>
      </div>

      {locacao.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{locacao.observacoes}</CardContent>
        </Card>
      )}
    </div>
  );
}
