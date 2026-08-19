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
import { alugueisEmAtraso, diasDeAtraso } from "@/lib/aluguel/meses";

const TIPO_LABEL: Record<string, string> = {
  aluguel: "Aluguel",
  iptu: "IPTU",
  condominio: "Condomínio",
  ambiental: "Ambiental",
};

type Linha = {
  key: string;
  href: string | null;
  imovelId: string | null;
  inquilinoId: string | null;
  tipo: string | null;
  competencia: string | null;
  valor: number | null;
  dataVencimento: string | null;
  diasEmAtraso: number;
  encerrada: boolean;
};

export async function Pendencias() {
  const supabase = await createClient();
  const hoje = hojeISO();

  // 1) Aluguéis vencidos e não pagos de locações ATIVAS (check rápido mensal).
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
        href: `/locacoes/${l.id}`,
        imovelId: l.imovel_id,
        inquilinoId: l.inquilino_id,
        tipo: "aluguel",
        competencia: a.competencia,
        valor: l.valor_aluguel,
        dataVencimento: a.vencimento,
        diasEmAtraso: a.diasEmAtraso,
        encerrada: false,
      });
    }
  }

  // 2) Débitos de locações ENCERRADAS ainda não quitados — continuam cobrando.
  const { data: debitos } = await supabase
    .from("debitos_encerramento")
    .select("id, inquilino_id, imovel_id, competencia, valor, vencimento")
    .is("quitado_em", null);

  const linhasDebito: Linha[] = (debitos ?? []).map((d) => ({
    key: `deb-${d.id}`,
    href: `/inquilinos/${d.inquilino_id}`,
    imovelId: d.imovel_id,
    inquilinoId: d.inquilino_id,
    tipo: "aluguel",
    competencia: d.competencia,
    valor: d.valor,
    dataVencimento: d.vencimento,
    diasEmAtraso: d.vencimento ? diasDeAtraso(d.vencimento, hoje) : 0,
    encerrada: true,
  }));

  // 3) Outros vencimentos do Financeiro detalhado (IPTU, condomínio, ambiental).
  //    Aluguel já vem dos itens acima, então excluímos para não duplicar.
  const { data: alertas } = await supabase
    .from("vw_alertas_financeiros_pendentes")
    .select("*")
    .neq("tipo", "aluguel");

  const linhasFinanceiro: Linha[] = (alertas ?? []).map((l) => ({
    key: `fin-${l.lancamento_id ?? `${l.locacao_id}-${l.competencia}`}`,
    href: l.locacao_id ? `/locacoes/${l.locacao_id}` : null,
    imovelId: l.imovel_id ?? null,
    inquilinoId: null,
    tipo: l.tipo ?? null,
    competencia: l.competencia ?? null,
    valor: l.valor ?? null,
    dataVencimento: l.data_vencimento ?? null,
    diasEmAtraso: l.dias_em_atraso ?? 0,
    encerrada: false,
  }));

  const linhas = [...linhasAluguel, ...linhasDebito, ...linhasFinanceiro].sort(
    (a, b) => b.diasEmAtraso - a.diasEmAtraso,
  );

  const totalAberto = linhas.reduce((s, l) => s + (l.valor ?? 0), 0);

  // Resolve nomes de imóvel e inquilino via consultas separadas.
  const imovelIds = Array.from(
    new Set(linhas.map((l) => l.imovelId).filter((v): v is string => !!v)),
  );
  const inquilinoIds = Array.from(
    new Set(linhas.map((l) => l.inquilinoId).filter((v): v is string => !!v)),
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
  const nomePorInquilino = new Map((inquilinos ?? []).map((i) => [i.id, i.nome]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Vencimentos em atraso</CardTitle>
        {linhas.length > 0 && (
          <span className="text-sm font-medium text-destructive">
            {formatBRL(totalAberto)} · {linhas.length}{" "}
            {linhas.length === 1 ? "pendência" : "pendências"}
          </span>
        )}
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
                const nomeImovel = (l.imovelId && nomePorImovel.get(l.imovelId)) ?? "—";
                const inquilino = l.inquilinoId ? nomePorInquilino.get(l.inquilinoId) : null;
                return (
                  <TableRow key={l.key}>
                    <TableCell>
                      {l.href ? (
                        <Link href={l.href} className="text-primary hover:underline">
                          {nomeImovel}
                        </Link>
                      ) : (
                        nomeImovel
                      )}
                      {inquilino ? (
                        <span className="block text-xs text-muted-foreground">{inquilino}</span>
                      ) : null}
                      {l.encerrada ? (
                        <Badge variant="muted" className="mt-1">
                          Contrato encerrado
                        </Badge>
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
