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
import { desarquivarImovel } from "./actions";

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; arquivados?: string }>;
}) {
  const { q, arquivados } = await searchParams;
  const vendoArquivados = arquivados === "1";
  const supabase = await createClient();

  let query = supabase.from("imoveis").select("*").order("nome");
  query = vendoArquivados ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  const { data } = await query;

  const termo = normalizarBusca(q ?? "");
  const imoveis = (data ?? []).filter((im) =>
    correspondeBusca(termo, [
      im.nome,
      im.endereco,
      im.matricula,
      im.inscricao_imobiliaria,
      im.dic,
      im.metragem_m2,
      im.status === "ocupado" ? "ocupado" : "vago",
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
        title="Imóveis"
        description="Cadastro e gestão dos imóveis"
        action={
          !vendoArquivados && (
            <Link href="/imoveis/novo" className={buttonVariants()}>
              Novo imóvel
            </Link>
          )
        }
      />

      <div className="flex items-center gap-1">
        <Link href="/imoveis" className={aba(!vendoArquivados)}>
          Ativos
        </Link>
        <Link href="/imoveis?arquivados=1" className={aba(vendoArquivados)}>
          Arquivados
        </Link>
      </div>

      <form className="flex items-center gap-2">
        {vendoArquivados && <input type="hidden" name="arquivados" value="1" />}
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome, endereço, matrícula, inscrição, DIC..."
          className="max-w-md"
        />
      </form>

      {!imoveis.length ? (
        <EmptyState
          title={termo ? "Nenhum resultado" : vendoArquivados ? "Nenhum imóvel arquivado" : "Nenhum imóvel encontrado"}
          description={
            termo
              ? `Nada encontrado para "${q}". Tente outro termo.`
              : vendoArquivados
                ? "Imóveis que você arquivar aparecem aqui e podem ser restaurados."
                : "Comece cadastrando o primeiro imóvel."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Inscrição imob.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{vendoArquivados ? "Ação" : "Docs"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imoveis.map((im) => {
              const docs = [im.doc_ambiental, im.doc_iptu, im.doc_condominio].filter(Boolean).length;
              return (
                <TableRow key={im.id}>
                  <TableCell>
                    {vendoArquivados ? (
                      <span className="font-medium">{im.nome}</span>
                    ) : (
                      <Link
                        href={`/imoveis/${im.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {im.nome}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{im.endereco || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{im.matricula || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {im.inscricao_imobiliaria || "—"}
                  </TableCell>
                  <TableCell>
                    {vendoArquivados ? (
                      <Badge variant="muted">Arquivado</Badge>
                    ) : (
                      <Badge variant={im.status === "ocupado" ? "success" : "muted"}>
                        {im.status === "ocupado" ? "Ocupado" : "Vago"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {vendoArquivados ? (
                      <form
                        action={async () => {
                          "use server";
                          await desarquivarImovel(im.id);
                        }}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          Restaurar
                        </Button>
                      </form>
                    ) : (
                      <span className="text-muted-foreground">{docs}/3</span>
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
