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
import { arquivarInquilino } from "../actions";

export default async function InquilinoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: inquilino } = await supabase
    .from("inquilinos")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!inquilino) notFound();

  const { data: locacoes } = await supabase
    .from("locacoes")
    .select("id, imovel_id, valor_aluguel, status")
    .eq("inquilino_id", id)
    .is("deleted_at", null)
    .order("data_inicio", { ascending: false });

  const imovelIds = [...new Set((locacoes ?? []).map((l) => l.imovel_id))];
  let imoveisById = new Map<string, string>();
  if (imovelIds.length) {
    const { data: imoveis } = await supabase
      .from("imoveis")
      .select("id, nome")
      .in("id", imovelIds);
    imoveisById = new Map((imoveis ?? []).map((im) => [im.id, im.nome]));
  }

  const temFiador =
    inquilino.fiador_nome || inquilino.fiador_email || inquilino.fiador_telefone;

  const { data: arquivosRows } = await supabase
    .from("arquivos")
    .select("id, nome, storage_path, created_at")
    .eq("entity_type", "inquilino")
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
    await arquivarInquilino(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={inquilino.nome}
        description={inquilino.cpf_cnpj}
        action={
          <div className="flex gap-2">
            <Link
              href={`/inquilinos/${id}/editar`}
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

      <Badge variant={inquilino.tipo === "pj" ? "default" : "muted"}>
        {inquilino.tipo === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}
      </Badge>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-muted-foreground">CPF/CNPJ</span>
            <span className="text-right">{inquilino.cpf_cnpj}</span>
            <span className="text-muted-foreground">RG</span>
            <span className="text-right">{inquilino.rg || "—"}</span>
            <span className="text-muted-foreground">Nascimento</span>
            <span className="text-right">{inquilino.data_nascimento || "—"}</span>
            <span className="text-muted-foreground">E-mail</span>
            <span className="text-right">{inquilino.email || "—"}</span>
            <span className="text-muted-foreground">Telefone</span>
            <span className="text-right">{inquilino.telefone || "—"}</span>
            <span className="text-muted-foreground">Endereço</span>
            <span className="text-right">{inquilino.endereco || "—"}</span>
            <span className="text-muted-foreground">Responsável</span>
            <span className="text-right">{inquilino.responsavel || "—"}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fiador</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {temFiador ? (
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Nome</span>
                <span className="text-right">{inquilino.fiador_nome || "—"}</span>
                <span className="text-muted-foreground">E-mail</span>
                <span className="text-right">{inquilino.fiador_email || "—"}</span>
                <span className="text-muted-foreground">Telefone</span>
                <span className="text-right">{inquilino.fiador_telefone || "—"}</span>
              </div>
            ) : (
              <p className="text-muted-foreground">Sem fiador.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {locacoes?.length ? (
              locacoes.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/imoveis/${l.imovel_id}`}
                    className="text-primary hover:underline"
                  >
                    {imoveisById.get(l.imovel_id) ?? "Imóvel"}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatBRL(l.valor_aluguel)}</span>
                    <Badge variant={l.status === "ativa" ? "success" : "muted"}>
                      {l.status === "ativa" ? "Ativa" : "Encerrada"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhuma locação registrada.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ArquivosTab entityType="inquilino" entityId={id} arquivos={arquivos} />
          </CardContent>
        </Card>
      </div>

      {inquilino.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{inquilino.observacoes}</CardContent>
        </Card>
      )}
    </div>
  );
}
