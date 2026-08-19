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
import { formatBRL, formatDate, hojeISO } from "@/lib/utils/format";
import { competenciaLabel } from "@/lib/financeiro/competencias";
import { alugueisEmAtraso } from "@/lib/aluguel/meses";

const TIPO_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

type Linha = {
  key: string;
  locacaoId: string | null;
  imovelId: string | null;
  tipo: string | null;
  competencia: string | null;
  valor: number | null;
  dataVencimento: string | null;
  diasEmAtraso: number;
};

export async function Pendencias() {
  const supabase = await createClient();
  const hoje = hojeISO();

  // 1) Aluguéis vencidos e não pagos (check rápido mensal) — fonte principal do aluguel.
  const { data: locacoes } = await supabase
    .from("locacoes")
    .select("id, imovel_id, inquilino_id, valor_aluguel, dia_vencimento, controle_aluguel_desde")
    .eq("status", "ativa")
    .is("deleted_at", null);

  const locacaoIds = (locacoes ?? []).map((l) => l.id);
  const { data: pagamentos } = locacaoIds.length
    ? await supabase
        .from("aluguel_pagamentos")
        .select("locacao_id, competencia")
        .in("locacao_id", locacaoIds)
    : { data: [] as { locacao_id: string; competencia: string }[] };

  const pagosPorLoc = new Map<string, Set<string>>();
  for (const p of pagamentos ?? []) {
    const set = pagosPorLoc.get(p.locacao_id) ?? new Set<string>();
    set.add(p.competencia);
    pagosPorLoc.set(p.locacao_id, set);
  }

  const linhasAluguel: Linha[] = [];
  for (const l of locacoes ?? []) {
    const pagos = pagosPorLoc.get(l.id) ?? new Set<string>();
    const desde = l.controle_aluguel_desde ?? hoje;
    for (const a of alugueisEmAtraso(desde, l.dia_vencimento, pagos, hoje)) {
      linhasAluguel.push({
        key: `al-${l.id}-${a.competencia}`,
        locacaoId: l.id,
        imovelId: l.imovel_id,
        tipo: "aluguel",
        competencia: a.competencia,
        valor: l.valor_aluguel,
        dataVencimento: a.vencimento,
        diasEmAtraso: a.diasEmAtraso,
      });
    }
  }

  // 2) Outros vencimentos do Financeiro detalhado (IPTU, condomínio, ambiental).
  //    Aluguel já vem do check acima, então excluímos para não duplicar.
  const { data: alertas } = await supabase
    .from("vw_alertas_financeiros_pendentes")
    .select("*")
    .neq("tipo", "aluguel");

  const linhasFinanceiro: Linha[] = (alertas ?? []).map((l) => ({
    key: `fin-${l.lancamento_id ?? `${l.locacao_id}-${l.competencia}`}`,
    locacaoId: l.locacao_id ?? null,
    imovelId: l.imovel_id ?? null,
    tipo: l.tipo ?? null,
    competencia: l.competencia ?? null,
    valor: l.valor ?? null,
    dataVencimento: l.data_vencimento ?? null,
    diasEmAtraso: l.dias_em_atraso ?? 0,
  }));

  const linhas = [...linhasAluguel, ...linhasFinanceiro].sort(
    (a, b) => b.diasEmAtraso - a.diasEmAtraso,
  );

  // Resolve nomes de imóvel e inquilino (por locação) via consultas separadas.
  const imovelIds = Array.from(
    new Set(linhas.map((l) => l.imovelId).filter((v): v is string => !!v)),
  );
  const inquilinoIds = Array.from(
    new Set((locacoes ?? []).map((l) => l.inquilino_id).filter((v): v is string => !!v)),
  );
  const [{ data: imoveis }, { data: inquilinos }] = await Promise.all([
    imovelIds.length
      ? supabase.from("imoveis").select("id, nome").in("id", imovelIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
    inquilinoIds.length
      ? supabase.from("inquilinos").select("id, nome").in("id", inquilinoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ]);
  const nomePorImovel = new Map((imoveis ?? []).map((i) => [i.id, i.nome]));
  const nomeInqPorLocacao = new Map(
    (locacoes ?? []).map((l) => [
      l.id,
      (inquilinos ?? []).find((i) => i.id === l.inquilino_id)?.nome ?? null,
    ]),
  );

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
              {linhas.map((l) => {
                const inquilino = l.locacaoId ? nomeInqPorLocacao.get(l.locacaoId) : null;
                const nomeImovel = (l.imovelId && nomePorImovel.get(l.imovelId)) ?? "—";
                return (
                  <TableRow key={l.key}>
                    <TableCell>
                      {l.locacaoId ? (
                        <Link
                          href={`/locacoes/${l.locacaoId}`}
                          className="text-primary hover:underline"
                        >
                          {nomeImovel}
                        </Link>
                      ) : (
                        nomeImovel
                      )}
                      {inquilino ? (
                        <span className="block text-xs text-muted-foreground">{inquilino}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{(l.tipo && TIPO_LABEL[l.tipo]) ?? l.tipo ?? "—"}</TableCell>
                    <TableCell>
                      {l.competencia ? competenciaLabel(l.competencia) : "—"}
                    </TableCell>
                    <TableCell>{formatBRL(l.valor)}</TableCell>
                    <TableCell>{formatDate(l.dataVencimento)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{l.diasEmAtraso} dias</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
