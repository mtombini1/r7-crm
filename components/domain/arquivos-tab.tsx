"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Enums } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/domain/empty-state";
import { formatDate } from "@/lib/utils/format";
import { anexarArquivo, arquivarArquivo } from "@/app/(app)/arquivos/actions";

type ArquivoItem = {
  id: string;
  nome: string;
  url: string | null;
  criadoEm: string;
};

export function ArquivosTab({
  entityType,
  entityId,
  arquivos,
}: {
  entityType: Enums<"entidade_arquivo">;
  entityId: string;
  arquivos: ArquivoItem[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onUpload(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await anexarArquivo(entityType, entityId, formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  function onArquivar(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await arquivarArquivo(id, entityType, entityId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} action={onUpload} className="flex flex-col gap-2">
        <Input
          type="file"
          name="file"
          required
          className="cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Enviando..." : "Anexar"}
          </Button>
          <span className="text-xs text-muted-foreground">Máx. 25 MB</span>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>

      {arquivos.length === 0 ? (
        <EmptyState
          title="Nenhum arquivo"
          description="Anexe o primeiro documento usando o formulário acima."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {arquivos.map((arquivo) => (
            <li
              key={arquivo.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                {arquivo.url ? (
                  <a
                    href={arquivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-primary hover:underline"
                  >
                    {arquivo.nome}
                  </a>
                ) : (
                  <span className="truncate text-sm">{arquivo.nome}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDate(arquivo.criadoEm)}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => onArquivar(arquivo.id)}
              >
                Arquivar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
