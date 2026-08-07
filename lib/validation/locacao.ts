import { z } from "zod";

export const locacaoSchema = z.object({
  imovel_id: z.string().uuid("Imóvel é obrigatório"),
  inquilino_id: z.string().uuid("Inquilino é obrigatório"),
  valor_aluguel: z.coerce.number().positive("Valor do aluguel inválido"),
  data_inicio: z.string().trim().min(1, "Data de início é obrigatória"),
  data_renovacao: z.string().trim().nullable().optional(),
  data_reajuste: z.string().trim().nullable().optional(),
  data_troca_desconto: z.string().trim().nullable().optional(),
  indice_correcao: z.string().trim().nullable().optional(),
  dia_vencimento: z.coerce
    .number()
    .int()
    .min(1, "Dia de vencimento entre 1 e 28")
    .max(28, "Dia de vencimento entre 1 e 28")
    .nullable()
    .optional(),
  observacoes: z.string().trim().nullable().optional(),
});

export type LocacaoData = z.infer<typeof locacaoSchema>;
