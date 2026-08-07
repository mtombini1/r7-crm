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
  observacoes: z.string().trim().nullable().optional(),
  tem_vaga: z.boolean().optional().default(false),
  vaga_quantidade: z.coerce.number().int().nonnegative("Quantidade inválida").nullable().optional(),
  vaga_matricula: z.string().trim().nullable().optional(),
  vaga_inscricao_imobiliaria: z.string().trim().nullable().optional(),
  vaga_dic: z.string().trim().nullable().optional(),
});

export type ImovelData = z.infer<typeof imovelSchema>;
