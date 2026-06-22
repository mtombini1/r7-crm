export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      alertas_reconhecimentos: {
        Row: {
          data_alvo: string;
          id: string;
          locacao_id: string;
          novo_valor: number | null;
          reconhecido_em: string;
          reconhecido_por: string | null;
          tipo: Database["public"]["Enums"]["alerta_tipo"];
        };
        Insert: {
          data_alvo: string;
          id?: string;
          locacao_id: string;
          novo_valor?: number | null;
          reconhecido_em?: string;
          reconhecido_por?: string | null;
          tipo: Database["public"]["Enums"]["alerta_tipo"];
        };
        Update: {
          data_alvo?: string;
          id?: string;
          locacao_id?: string;
          novo_valor?: number | null;
          reconhecido_em?: string;
          reconhecido_por?: string | null;
          tipo?: Database["public"]["Enums"]["alerta_tipo"];
        };
        Relationships: [];
      };
      arquivos: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: Database["public"]["Enums"]["entidade_arquivo"];
          id: string;
          mime_type: string | null;
          nome: string;
          storage_path: string;
          tamanho: number | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          entity_id: string;
          entity_type: Database["public"]["Enums"]["entidade_arquivo"];
          nome: string;
          storage_path: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          mime_type?: string | null;
          tamanho?: number | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["arquivos"]["Insert"]>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          acao: Database["public"]["Enums"]["audit_acao"];
          ator: string | null;
          dados_antes: Json | null;
          dados_depois: Json | null;
          em: string;
          id: string;
          registro_id: string | null;
          tabela: string;
        };
        Insert: {
          acao: Database["public"]["Enums"]["audit_acao"];
          tabela: string;
          ator?: string | null;
          dados_antes?: Json | null;
          dados_depois?: Json | null;
          em?: string;
          id?: string;
          registro_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
      imoveis: {
        Row: {
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          dic: string | null;
          doc_ambiental: boolean;
          doc_condominio: boolean;
          doc_iptu: boolean;
          endereco: string | null;
          id: string;
          inscricao_imobiliaria: string | null;
          matricula: string | null;
          metragem_m2: number | null;
          nome: string;
          status: Database["public"]["Enums"]["imovel_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          nome: string;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          dic?: string | null;
          doc_ambiental?: boolean;
          doc_condominio?: boolean;
          doc_iptu?: boolean;
          endereco?: string | null;
          id?: string;
          inscricao_imobiliaria?: string | null;
          matricula?: string | null;
          metragem_m2?: number | null;
          status?: Database["public"]["Enums"]["imovel_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["imoveis"]["Insert"]>;
        Relationships: [];
      };
      inquilinos: {
        Row: {
          cpf_cnpj: string;
          created_at: string;
          created_by: string | null;
          data_nascimento: string | null;
          deleted_at: string | null;
          email: string | null;
          endereco: string | null;
          fiador_email: string | null;
          fiador_nome: string | null;
          fiador_telefone: string | null;
          id: string;
          nome: string;
          responsavel: string | null;
          rg: string | null;
          telefone: string | null;
          tipo: Database["public"]["Enums"]["inquilino_tipo"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          cpf_cnpj: string;
          nome: string;
          tipo: Database["public"]["Enums"]["inquilino_tipo"];
          created_at?: string;
          created_by?: string | null;
          data_nascimento?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          endereco?: string | null;
          fiador_email?: string | null;
          fiador_nome?: string | null;
          fiador_telefone?: string | null;
          id?: string;
          responsavel?: string | null;
          rg?: string | null;
          telefone?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["inquilinos"]["Insert"]>;
        Relationships: [];
      };
      lancamento_eventos: {
        Row: {
          ator: string | null;
          created_at: string;
          data_evento: string;
          id: string;
          lancamento_id: string;
          observacao: string | null;
          tipo: Database["public"]["Enums"]["lancamento_evento_tipo"];
          valor: number | null;
        };
        Insert: {
          lancamento_id: string;
          tipo: Database["public"]["Enums"]["lancamento_evento_tipo"];
          ator?: string | null;
          created_at?: string;
          data_evento?: string;
          id?: string;
          observacao?: string | null;
          valor?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["lancamento_eventos"]["Insert"]>;
        Relationships: [];
      };
      lancamentos_financeiros: {
        Row: {
          competencia: string;
          created_at: string;
          created_by: string | null;
          data_pagamento: string | null;
          data_vencimento: string;
          id: string;
          imovel_id: string | null;
          locacao_id: string | null;
          responsavel: Database["public"]["Enums"]["responsavel_pagamento"];
          status: Database["public"]["Enums"]["lancamento_status"];
          tipo: Database["public"]["Enums"]["lancamento_tipo"];
          updated_at: string;
          valor: number;
        };
        Insert: {
          competencia: string;
          data_vencimento: string;
          responsavel: Database["public"]["Enums"]["responsavel_pagamento"];
          tipo: Database["public"]["Enums"]["lancamento_tipo"];
          valor: number;
          created_at?: string;
          created_by?: string | null;
          data_pagamento?: string | null;
          id?: string;
          imovel_id?: string | null;
          locacao_id?: string | null;
          status?: Database["public"]["Enums"]["lancamento_status"];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lancamentos_financeiros"]["Insert"]>;
        Relationships: [];
      };
      locacoes: {
        Row: {
          created_at: string;
          created_by: string | null;
          data_fim: string | null;
          data_inicio: string;
          data_reajuste: string | null;
          data_renovacao: string | null;
          data_troca_desconto: string | null;
          deleted_at: string | null;
          dia_vencimento: number | null;
          id: string;
          imovel_id: string;
          indice_correcao: string | null;
          inquilino_id: string;
          status: Database["public"]["Enums"]["locacao_status"];
          updated_at: string;
          updated_by: string | null;
          valor_aluguel: number;
        };
        Insert: {
          data_inicio: string;
          imovel_id: string;
          inquilino_id: string;
          valor_aluguel: number;
          created_at?: string;
          created_by?: string | null;
          data_fim?: string | null;
          data_reajuste?: string | null;
          data_renovacao?: string | null;
          data_troca_desconto?: string | null;
          deleted_at?: string | null;
          dia_vencimento?: number | null;
          id?: string;
          indice_correcao?: string | null;
          status?: Database["public"]["Enums"]["locacao_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["locacoes"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          nome: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          email?: string | null;
          nome?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      vw_alertas_contratuais_pendentes: {
        Row: {
          data_alvo: string | null;
          dias_restantes: number | null;
          locacao_id: string | null;
          marco: string | null;
          tipo: Database["public"]["Enums"]["alerta_tipo"] | null;
        };
        Relationships: [];
      };
      vw_alertas_financeiros_pendentes: {
        Row: {
          competencia: string | null;
          data_vencimento: string | null;
          dias_em_atraso: number | null;
          imovel_id: string | null;
          lancamento_id: string | null;
          locacao_id: string | null;
          responsavel: Database["public"]["Enums"]["responsavel_pagamento"] | null;
          tipo: Database["public"]["Enums"]["lancamento_tipo"] | null;
          valor: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      alerta_tipo: "reajuste" | "renovacao" | "desconto";
      audit_acao: "insert" | "update" | "delete";
      entidade_arquivo: "imovel" | "inquilino" | "locacao";
      imovel_status: "ocupado" | "vago";
      inquilino_tipo: "pf" | "pj";
      lancamento_evento_tipo: "criado" | "pago" | "corrigido" | "cancelado";
      lancamento_status: "pendente" | "pago" | "cancelado";
      lancamento_tipo: "aluguel" | "iptu" | "condominio" | "ambiental";
      locacao_status: "ativa" | "encerrada";
      responsavel_pagamento: "inquilino" | "r7";
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
export type Views<T extends keyof PublicSchema["Views"]> =
  PublicSchema["Views"][T]["Row"];
