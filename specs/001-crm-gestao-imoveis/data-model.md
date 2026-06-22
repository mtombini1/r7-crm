# Modelo de Dados — CRM R7 (rev. 2, pós-analyze)

Derivado das entidades do [spec.md](spec.md). DDL completo em [contracts/database.sql](contracts/database.sql).

**Política por tabela** (corrige M2/M3 — soft-delete não é uniforme):
- **Mutáveis com soft-delete + auditoria**: `imoveis`, `inquilinos`, `locacoes`, `arquivos` →
  `created_at`/`updated_at` (trigger), `created_by`/`updated_by` (trigger), `deleted_at`.
- **Obrigação financeira** (`lancamentos_financeiros`): a linha é criada uma vez; `status`/`data_pagamento`
  são **cache** mantido por trigger a partir do **ledger imutável**. Sem `deleted_at` (cancelamento é um evento).
- **Logs imutáveis (append-only)**: `lancamento_eventos`, `alertas_reconhecimentos` — só INSERT/SELECT,
  com **ator não-forjável** (`default auth.uid()` + `with check (ator/reconhecido_por = auth.uid())`).
  `audit_log` é **só SELECT** para clientes; a escrita vem do trigger `write_audit` (security definer).
- **Especial**: `profiles` — 1:1 com `auth.users`; CRUD pelo próprio usuário; sem soft-delete; não auditada
  (não contém histórico de negócio).

## Enums
- `imovel_status`: `ocupado` | `vago`
- `inquilino_tipo`: `pf` | `pj`
- `locacao_status`: `ativa` | `encerrada`
- `lancamento_tipo`: `aluguel` | `iptu` | `condominio` | `ambiental`
- `lancamento_status`: `pendente` | `pago` | `cancelado`
- `responsavel_pagamento`: `inquilino` | `r7`
- `entidade_arquivo`: `imovel` | `inquilino` | `locacao`
- `alerta_tipo`: `reajuste` | `renovacao` | `desconto` (alertas **contratuais**; financeiro é tratado por view própria)
- `lancamento_evento_tipo`: `criado` | `pago` | `corrigido` | `cancelado`
- `audit_acao`: `insert` | `update` | `delete`

## Tabelas

### `imoveis`
nome, endereco, matricula, inscricao_imobiliaria, dic, metragem_m2, `status` (ocupado/vago — **derivado por trigger** das locações), checklist (`doc_ambiental`/`doc_iptu`/`doc_condominio`). Auditoria + soft-delete.

### `inquilinos`
tipo (pf/pj), nome, cpf_cnpj (**validação de dígito verificador na app; sem unicidade** — duplicados permitidos), rg, data_nascimento, endereco, email, telefone, responsavel, fiador (opcional). Auditoria + soft-delete.

### `locacoes`
imovel_id, inquilino_id, valor_aluguel, **data_inicio**, **data_fim** (nullable; preenchida ao encerrar — corrige M5/`vigência`), data_renovacao, data_reajuste, data_troca_desconto, indice_correcao, **dia_vencimento** (dia padrão do aluguel, 1-28), status (ativa/encerrada). Auditoria + soft-delete.

### `lancamentos_financeiros`
Obrigação mensal. locacao_id **ou** imovel_id (vago), tipo, competencia (1º dia do mês), valor, **data_vencimento (NOT NULL)** — derivada de `competencia` + `dia_vencimento` da locação para aluguel, ou informada no formulário para IPTU/condomínio/ambiental —, status/data_pagamento (**cache** dos eventos), responsavel (inquilino/r7). Único por (escopo, tipo, competencia). Auditado.

### `lancamento_eventos` — LEDGER IMUTÁVEL
lancamento_id, tipo (criado/pago/corrigido/cancelado), valor, data_evento, observacao, ator. **Append-only**: pagamento/correção/cancelamento são eventos; o histórico nunca é sobrescrito (Princípio I).

### `arquivos`
entity_type (imovel/inquilino/locacao) + entity_id, nome, storage_path (`{entity_type}/{entity_id}/{arquivo}`), mime_type, tamanho. Separação garantida pelo par (entity_type, entity_id). Auditoria + soft-delete.

### `alertas_reconhecimentos` — append-only (contratuais)
locacao_id, tipo, data_alvo, reconhecido_em, reconhecido_por, novo_valor (**obrigatório p/ reajuste**). Único por (locacao_id, tipo, data_alvo): um reconhecimento encerra aquele alerta.

### `audit_log` — append-only
tabela, registro_id, acao, ator, dados_antes (jsonb), dados_depois (jsonb), em. Preenchido por trigger em todas as tabelas mutáveis (corrige H2 — "quem/quando/o quê").

### `profiles`
1:1 com auth.users: nome, email.

## Views (com `security_invoker = on` → respeitam a RLS — corrige H3)
- `vw_alertas_contratuais_pendentes`: por locação ativa, alertas de reajuste/renovacao/desconto com a
  **janela aberta** (`data_alvo - hoje <= 30`, incluindo já vencidos → **catch-up**, corrige H4/H5) e ainda
  **não reconhecidos**. Expõe `dias_restantes` e `marco` (30/15/7/1/vencido). O alerta persiste até o
  reconhecimento (reajuste só encerra com `novo_valor`).
- `vw_alertas_financeiros_pendentes`: lançamentos `pendente` com `data_vencimento <= hoje` (vencidos)
  → popup (FR-024). Encerram automaticamente quando o lançamento é pago/cancelado (não exigem reconhecimento).

## Transições de estado
- **Imóvel**: `vago` ⇄ `ocupado` — **trigger** `sincronizar_status_imovel` (fonte única, corrige M7).
- **Locação**: `ativa` → `encerrada` (preenche `data_fim`; preserva histórico/arquivos).
- **Lançamento**: `pendente` → `pago`/`cancelado` via **evento** no ledger (cache atualizado por trigger).
- **Responsável**: vacância → `r7`; locação ativa → `inquilino`.

## RLS (resumo)
Todas as tabelas: RLS habilitada. Mutáveis: CRUD para `authenticated`. Logs imutáveis
(`audit_log`, `lancamento_eventos`, `alertas_reconhecimentos`): apenas INSERT + SELECT. Storage bucket
`arquivos`: políticas explícitas de SELECT/INSERT/UPDATE/DELETE para `authenticated` (corrige L2).
