import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LocacoesPage() {
  const supabase = await createClient();

  const { data: locacoes } = await supabase
    .from("locacoes")
    .select("*")
    .is("deleted_at", null)
    .order("data_inicio", { ascending: false });

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Locações"
        description="Vínculos entre imóveis e inquilinos"
        action={
          <Link href="/locacoes/novo" className={buttonVariants()}>
            Nova locação
          </Link>
        }
      />

      {!locacoes?.length ? (
        <EmptyState
          title="Nenhuma locação encontrada"
          description="Comece registrando a primeira locação."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imóvel</TableHead>
              <TableHead>Inquilino</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Reajuste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locacoes.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>
                  <Link
                    href={`/locacoes/${loc.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {imovelById.get(loc.imovel_id) ?? "—"}
                  </Link>
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
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(loc.data_reajuste)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
