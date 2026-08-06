import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { arquivarLocacao, desarquivarLocacao } from "./actions";

type Filtro = "ativas" | "encerradas" | "excluidas";

export default async function LocacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro: raw } = await searchParams;
  const filtro: Filtro =
    raw === "encerradas" ? "encerradas" : raw === "excluidas" ? "excluidas" : "ativas";
  const excluidas = filtro === "excluidas";

  const supabase = await createClient();

  let query = supabase.from("locacoes").select("*").order("data_inicio", { ascending: false });
  if (filtro === "excluidas") query = query.not("deleted_at", "is", null);
  else if (filtro === "encerradas") query = query.eq("status", "encerrada").is("deleted_at", null);
  else query = query.eq("status", "ativa").is("deleted_at", null);
  const { data: locacoes } = await query;

  const imovelIds = [...new Set((locacoes ?? []).map((l) => l.imovel_id))];
  const inquilinoIds = [...new Set((locacoes ?? []).map((l) => l.inquilino_id))];

  const [{ data: imoveis }, { data: inquilinos }] = await Promise.all([
    imovelIds.length
      ? supabase.from("imoveis").select("id, nome").in("id", imovelIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    inquilinoIds.length
      ? supabase.from("inquilinos").select("id, nome").in("id", inquilinoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ]);

  const imovelById = new Map((imoveis ?? []).map((im) => [im.id, im.nome]));
  const inquilinoById = new Map((inquilinos ?? []).map((iq) => [iq.id, iq.nome]));

  const aba = (ativo: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      ativo ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent",
    );

  const vazio = {
    ativas: { t: "Nenhuma locação ativa", d: "Registre a primeira locação." },
    encerradas: { t: "Nenhuma locação encerrada", d: "Locações encerradas aparecem aqui." },
    excluidas: {
      t: "Nenhuma locação excluída",
      d: "Locações que você excluir aparecem aqui e podem ser restauradas.",
    },
  }[filtro];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Locações"
        description="Vínculos entre imóveis e inquilinos"
        action={
          !excluidas && (
            <Link href="/locacoes/novo" className={buttonVariants()}>
              Nova locação
            </Link>
          )
        }
      />

      <div className="flex items-center gap-1">
        <Link href="/locacoes" className={aba(filtro === "ativas")}>
          Ativas
        </Link>
        <Link href="/locacoes?filtro=encerradas" className={aba(filtro === "encerradas")}>
          Encerradas
        </Link>
        <Link href="/locacoes?filtro=excluidas" className={aba(filtro === "excluidas")}>
          Excluídas
        </Link>
      </div>

      {!locacoes?.length ? (
        <EmptyState title={vazio.t} description={vazio.d} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imóvel</TableHead>
              <TableHead>Inquilino</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reajuste</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locacoes.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>
                  {excluidas ? (
                    <span className="font-medium">{imovelById.get(loc.imovel_id) ?? "—"}</span>
                  ) : (
                    <Link
                      href={`/locacoes/${loc.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {imovelById.get(loc.imovel_id) ?? "—"}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {inquilinoById.get(loc.inquilino_id) ?? "—"}
                </TableCell>
                <TableCell>{formatBRL(loc.valor_aluguel)}</TableCell>
                <TableCell>
                  <Badge variant={loc.status === "ativa" ? "success" : "muted"}>
                    {loc.status === "ativa" ? "Ativa" : "Encerrada"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(loc.data_reajuste)}
                </TableCell>
                <TableCell className="text-right">
                  {excluidas ? (
                    <form
                      action={async () => {
                        "use server";
                        await desarquivarLocacao(loc.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Restaurar
                      </Button>
                    </form>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await arquivarLocacao(loc.id);
                      }}
                    >
                      <Button type="submit" variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
