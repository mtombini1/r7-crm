import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/domain/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { competenciaLabel } from "@/lib/financeiro/competencias";

const TIPO_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

export async function Pendencias() {
  const supabase = await createClient();

  const { data: alertas } = await supabase
    .from("vw_alertas_financeiros_pendentes")
    .select("*")
    .order("dias_em_atraso", { ascending: false });

  const linhas = alertas ?? [];

  // Resolve nomes de imóvel via consulta separada (sem selects embutidos).
  const imovelIds = Array.from(
    new Set(linhas.map((l) => l.imovel_id).filter((v): v is string => !!v)),
  );
  const { data: imoveis } = imovelIds.length
    ? await supabase.from("imoveis").select("id, nome").in("id", imovelIds)
    : { data: [] as { id: string; nome: string }[] };
  const nomePorImovel = new Map((imoveis ?? []).map((i) => [i.id, i.nome]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vencimentos em atraso</CardTitle>
      </CardHeader>
      <CardContent>
        {linhas.length === 0 ? (
          <EmptyState title="Nenhum vencimento em atraso" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imóvel</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Atraso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => (
                <TableRow key={l.lancamento_id ?? `${l.locacao_id}-${l.competencia}`}>
                  <TableCell>
                    {l.locacao_id ? (
                      <Link
                        href={`/locacoes/${l.locacao_id}/financeiro`}
                        className="text-primary hover:underline"
                      >
                        {(l.imovel_id && nomePorImovel.get(l.imovel_id)) ?? "—"}
                      </Link>
                    ) : (
                      ((l.imovel_id && nomePorImovel.get(l.imovel_id)) ?? "—")
                    )}
                  </TableCell>
                  <TableCell>{(l.tipo && TIPO_LABEL[l.tipo]) ?? l.tipo ?? "—"}</TableCell>
                  <TableCell>
                    {l.competencia ? competenciaLabel(l.competencia) : "—"}
                  </TableCell>
                  <TableCell>{formatBRL(l.valor)}</TableCell>
                  <TableCell>{formatDate(l.data_vencimento)}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{l.dias_em_atraso ?? 0} dias</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
