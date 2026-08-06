import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format";

type Variante = "success" | "warning" | "destructive" | "muted";

export const ENTIDADE: Record<string, { artigo: string; nome: string }> = {
  imoveis: { artigo: "um", nome: "imóvel" },
  inquilinos: { artigo: "um", nome: "inquilino" },
  locacoes: { artigo: "uma", nome: "locação" },
  lancamentos_financeiros: { artigo: "um", nome: "lançamento financeiro" },
  arquivos: { artigo: "um", nome: "documento" },
  alertas_reconhecimentos: { artigo: "um", nome: "alerta" },
  profiles: { artigo: "um", nome: "perfil" },
};

export const ACAO: Record<string, { label: string; variant: Variante }> = {
  insert: { label: "Criou", variant: "success" },
  update: { label: "Atualizou", variant: "warning" },
  delete: { label: "Removeu", variant: "destructive" },
};

export default async function AuditoriaPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, em, tabela, acao")
    .order("em", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auditoria"
        description="Histórico de tudo que mudou no sistema. Clique em um evento para ver quem fez e o que mudou."
      />

      {!logs?.length ? (
        <EmptyState
          title="Nenhuma atividade ainda"
          description="As alterações em imóveis, inquilinos, locações e documentos aparecerão aqui."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {logs.map((log) => {
            const ent = ENTIDADE[log.tabela] ?? { artigo: "um", nome: log.tabela };
            const ac = ACAO[log.acao] ?? { label: log.acao, variant: "muted" as Variante };
            return (
              <li key={log.id}>
                <Link
                  href={`/auditoria/${log.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={ac.variant}>{ac.label}</Badge>
                    <span className="text-sm">
                      {ent.artigo} <span className="font-medium">{ent.nome}</span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <time className="text-xs text-muted-foreground">{formatDateTime(log.em)}</time>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
