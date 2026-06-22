import { z } from "zod";

export const imovelSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  endereco: z.string().trim().optional(),
  matricula: z.string().trim().optional(),
  inscricao_imobiliaria: z.string().trim().optional(),
  dic: z.string().trim().optional(),
  metragem_m2: z.coerce.number().nonnegative("Metragem inválida").nullable().optional(),
  doc_ambiental: z.boolean().optional().default(false),
  doc_iptu: z.boolean().optional().default(false),
  doc_condominio: z.boolean().optional().default(false),
});

export type ImovelData = z.infer<typeof imovelSchema>;
