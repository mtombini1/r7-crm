import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDate, hojeISO } from "@/lib/utils/format";
import { competenciaLabel, isVencido } from "@/lib/financeiro/competencias";
import { LancamentoForm } from "./lancamento-form";
import { marcarPago } from "./actions";

const TIPO_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

export default async function FinanceiroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: locacao } = await supabase
    .from("locacoes")
    .select("id, dia_vencimento, valor_aluguel, imovel_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!locacao) notFound();

  const [{ data: imovel }, { data: lancamentos }] = await Promise.all([
    supabase.from("imoveis").select("id, nome").eq("id", locacao.imovel_id).maybeSingle(),
    supabase
      .from("lancamentos_financeiros")
      .select("*")
      .eq("locacao_id", id)
      .order("competencia", { ascending: false }),
  ]);

  const linhas = lancamentos ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description={imovel?.nome ?? undefined}
        action={
          <Link href={`/locacoes/${id}`} className={buttonVariants({ variant: "outline" })}>
            Voltar
          </Link>
        }
      />

      <LancamentoForm locacaoId={id} diaVencimento={locacao.dia_vencimento} />

      {linhas.length === 0 ? (
        <EmptyState
          title="Sem lançamentos"
          description="Lance a primeira competência usando o formulário acima."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((l) => {
              const vencido = isVencido(l.data_vencimento, l.status);
              return (
                <TableRow key={l.id} className={vencido ? "bg-destructive/5" : undefined}>
                  <TableCell>{TIPO_LABEL[l.tipo] ?? l.tipo}</TableCell>
                  <TableCell>{competenciaLabel(l.competencia)}</TableCell>
                  <TableCell>{formatBRL(l.valor)}</TableCell>
                  <TableCell>{formatDate(l.data_vencimento)}</TableCell>
                  <TableCell>
                    {l.status === "pago" ? (
                      <Badge variant="success">Pago</Badge>
                    ) : l.status === "cancelado" ? (
                      <Badge variant="muted">Cancelado</Badge>
                    ) : vencido ? (
                      <Badge variant="destructive">Vencido</Badge>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status === "pendente" && (
                      <form
                        action={async () => {
                          "use server";
                          await marcarPago(l.id, {
                            valor: l.valor,
                            data_evento: hojeISO(),
                          });
                        }}
                      >
                        <Button type="submit" size="sm" variant="outline">
                          Marcar pago
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
