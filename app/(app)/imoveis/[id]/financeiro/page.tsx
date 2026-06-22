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
import { LancamentoImovelForm } from "./lancamento-imovel-form";
import { marcarPago } from "./actions";

const TIPO_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

export default async function FinanceiroImovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: imovel } = await supabase
    .from("imoveis")
    .select("id, nome")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!imovel) notFound();

  const { data: lancamentos } = await supabase
    .from("lancamentos_financeiros")
    .select("*")
    .eq("imovel_id", id)
    .order("competencia", { ascending: false });

  const linhas = lancamentos ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro do imóvel"
        description={imovel.nome}
        action={
          <Link href={`/imoveis/${id}`} className={buttonVariants({ variant: "outline" })}>
            Voltar
          </Link>
        }
      />

      <p className="text-sm text-muted-foreground">
        Imóvel vago — responsável pelos pagamentos: R7.
      </p>

      <LancamentoImovelForm imovelId={id} />

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
