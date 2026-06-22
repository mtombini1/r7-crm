import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils/format";
import { ArquivosTab } from "@/components/domain/arquivos-tab";
import { ARQUIVOS_BUCKET } from "@/lib/supabase/storage";
import { arquivarImovel } from "../actions";

export default async function ImovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: imovel } = await supabase
    .from("imoveis")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!imovel) notFound();

  const { data: locacao } = await supabase
    .from("locacoes")
    .select("id, inquilino_id, valor_aluguel")
    .eq("imovel_id", id)
    .eq("status", "ativa")
    .is("deleted_at", null)
    .maybeSingle();

  let inquilino: { id: string; nome: string } | null = null;
  if (locacao) {
    const { data } = await supabase
      .from("inquilinos")
      .select("id, nome")
      .eq("id", locacao.inquilino_id)
      .maybeSingle();
    inquilino = data;
  }

  const docs = [
    { label: "Ambiental", ok: imovel.doc_ambiental },
    { label: "IPTU", ok: imovel.doc_iptu },
    { label: "Condomínio", ok: imovel.doc_condominio },
  ];

  const { data: arquivosRows } = await supabase
    .from("arquivos")
    .select("id, nome, storage_path, created_at")
    .eq("entity_type", "imovel")
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

  async function arquivar() {
    "use server";
    await arquivarImovel(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={imovel.nome}
        description={imovel.endereco ?? undefined}
        action={
          <div className="flex gap-2">
            <Link
              href={`/imoveis/${id}/editar`}
              className={buttonVariants({ variant: "outline" })}
            >
              Editar
            </Link>
            <form action={arquivar}>
              <Button type="submit" variant="destructive">
                Arquivar
              </Button>
            </form>
          </div>
        }
      />

      <Badge variant={imovel.status === "ocupado" ? "success" : "muted"}>
        {imovel.status === "ocupado" ? "Ocupado" : "Vago"}
      </Badge>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados do imóvel</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">Matrícula</span>
            <span className="text-right">{imovel.matricula || "—"}</span>
            <span className="text-muted-foreground">Inscrição imob.</span>
            <span className="text-right">{imovel.inscricao_imobiliaria || "—"}</span>
            <span className="text-muted-foreground">DIC</span>
            <span className="text-right">{imovel.dic || "—"}</span>
            <span className="text-muted-foreground">Metragem</span>
            <span className="text-right">
              {imovel.metragem_m2 != null ? `${imovel.metragem_m2} m²` : "—"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inquilino atual</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {inquilino ? (
              <div className="flex items-center justify-between">
                <Link
                  href={`/inquilinos/${inquilino.id}`}
                  className="text-primary hover:underline"
                >
                  {inquilino.nome}
                </Link>
                <span className="text-muted-foreground">{formatBRL(locacao?.valor_aluguel)}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-muted-foreground">
                  Imóvel vago — responsável pelos pagamentos: R7.
                </p>
                <Link
                  href={`/imoveis/${id}/financeiro`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Financeiro do imóvel
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {docs.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <span>{d.label}</span>
                <Badge variant={d.ok ? "success" : "muted"}>{d.ok ? "OK" : "Pendente"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ArquivosTab entityType="imovel" entityId={id} arquivos={arquivos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
