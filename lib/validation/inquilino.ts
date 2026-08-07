import { z } from "zod";
import { validarCpfCnpj } from "./cpf-cnpj";

export const inquilinoSchema = z
  .object({
    tipo: z.enum(["pf", "pj"]),
    nome: z.string().trim().min(1, "Nome é obrigatório"),
    cpf_cnpj: z.string().trim().min(1, "CPF/CNPJ é obrigatório"),
    rg: z.string().trim().nullable().optional(),
    data_nascimento: z.string().trim().nullable().optional(),
    endereco: z.string().trim().nullable().optional(),
    email: z.string().trim().nullable().optional(),
    telefone: z.string().trim().nullable().optional(),
    responsavel: z.string().trim().nullable().optional(),
    fiador_nome: z.string().trim().nullable().optional(),
    fiador_email: z.string().trim().nullable().optional(),
    fiador_telefone: z.string().trim().nullable().optional(),
    observacoes: z.string().trim().nullable().optional(),
  })
  .refine((d) => validarCpfCnpj(d.cpf_cnpj, d.tipo), {
    message: "CPF/CNPJ inválido",
    path: ["cpf_cnpj"],
  });

export type InquilinoData = z.infer<typeof inquilinoSchema>;
