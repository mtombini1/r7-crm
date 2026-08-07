import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/domain/page-header";
import { EmptyState } from "@/components/domain/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { normalizarBusca, correspondeBusca } from "@/lib/utils/search";
import { desarquivarInquilino } from "./actions";

export default async function InquilinosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; arquivados?: string }>;
}) {
  const { q, arquivados } = await searchParams;
  const vendoArquivados = arquivados === "1";
  const supabase = await createClient();

  let query = supabase.from("inquilinos").select("*").order("nome");
  query = vendoArquivados ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data } = await query;

  const termo = normalizarBusca(q ?? "");
  const inquilinos = (data ?? []).filter((inq) =>
    correspondeBusca(termo, [
      inq.nome,
      inq.cpf_cnpj,
      inq.rg,
      inq.email,
      inq.telefone,
      inq.responsavel,
      inq.endereco,
      inq.fiador_nome,
      inq.fiador_email,
      inq.fiador_telefone,
      inq.tipo === "pj" ? "pj pessoa juridica" : "pf pessoa fisica",
    ]),
  );

  const aba = (ativo: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      ativo ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent",
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inquilinos"
        description="Cadastro e gestão dos inquilinos"
        action={
          !vendoArquivados && (
            <Link href="/inquilinos/novo" className={buttonVariants()}>
              Novo inquilino
            </Link>
          )
        }
      />

      <div className="flex items-center gap-1">
        <Link href="/inquilinos" className={aba(!vendoArquivados)}>
          Ativos
        </Link>
        <Link href="/inquilinos?arquivados=1" className={aba(vendoArquivados)}>
          Arquivados
        </Link>
      </div>

      <form className="flex items-center gap-2">
        {vendoArquivados && <input type="hidden" name="arquivados" value="1" />}
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, CPF/CNPJ, telefone, e-mail, fiador..."
          className="max-w-md"
        />
      </form>

      {!inquilinos.length ? (
        <EmptyState
          title={termo ? "Nenhum resultado" : vendoArquivados ? "Nenhum inquilino arquivado" : "Nenhum inquilino encontrado"}
          description={
            termo
              ? `Nada encontrado para "${q}". Tente outro termo.`
              : vendoArquivados
                ? "Inquilinos que você arquivar aparecem aqui e podem ser restaurados."
                : "Comece cadastrando o primeiro inquilino."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead className="text-right">{vendoArquivados ? "Ação" : "Telefone"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquilinos.map((inq) => (
              <TableRow key={inq.id}>
                <TableCell>
                  {vendoArquivados ? (
                    <span className="font-medium">{inq.nome}</span>
                  ) : (
                    <Link
                      href={`/inquilinos/${inq.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {inq.nome}
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={inq.tipo === "pj" ? "default" : "muted"}>
                    {inq.tipo === "pj" ? "PJ" : "PF"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{inq.cpf_cnpj}</TableCell>
                <TableCell className="text-right">
                  {vendoArquivados ? (
                    <form
                      action={async () => {
                        "use server";
                        await desarquivarInquilino(inq.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Restaurar
                      </Button>
                    </form>
                  ) : (
                    <span className="text-muted-foreground">{inq.telefone || "—"}</span>
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
