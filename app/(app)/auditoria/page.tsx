import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
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
import { formatDate } from "@/lib/utils/format";

const acaoVariant = {
  insert: "success",
  update: "warning",
  delete: "destructive",
} as const;

const acaoLabel = { insert: "Criou", update: "Alterou", delete: "Removeu" } as const;

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, em, tabela, acao, registro_id")
    .order("em", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auditoria"
        description="Histórico de alterações (quem, quando, o quê) — últimos 100 eventos"
      />
      {!logs?.length ? (
        <EmptyState title="Nenhum evento registrado ainda" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead>Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground">{formatDate(log.em)}</TableCell>
                <TableCell>
                  <Badge variant={acaoVariant[log.acao]}>{acaoLabel[log.acao]}</Badge>
                </TableCell>
                <TableCell>{log.tabela}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.registro_id?.slice(0, 8) ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
