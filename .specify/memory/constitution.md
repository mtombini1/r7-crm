<!--
SYNC IMPACT REPORT
Version change: (template) → 1.0.0
Ratification: initial adoption (MAJOR — first ratified constitution)
Modified principles: all placeholders replaced with concrete R7 CRM principles
Added sections:
  - Core Principles (5): Integridade & Rastreabilidade; Segurança por Padrão (RLS/LGPD);
    Confiabilidade de Datas & Alertas; Experiência Limpa e Profissional; Simplicidade & Entrega Incremental
  - Restrições Técnicas (Stack)
  - Fluxo de Desenvolvimento (Spec-Driven)
  - Governance
Removed sections: none
Templates reviewed for alignment:
  - .specify/templates/plan-template.md (Constitution Check) ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible (spec stays tech-agnostic)
  - .specify/templates/tasks-template.md ✅ compatible
Deferred TODOs: none
-->

# Constituição do CRM — R7 Participações

CRM para centralizar a gestão de ~80 imóveis (PR/SC), seus inquilinos, contratos (locações),
obrigações financeiras e documentos, substituindo o controle atual em planilhas Excel.

## Core Principles

### I. Integridade e Rastreabilidade dos Dados (NÃO-NEGOCIÁVEL)
O histórico nunca pode se perder. Arquivos e contratos são separados por entidade —
**Imóvel**, **Inquilino** e **Relação (locação)** — para que um inquilino com múltiplos contratos
(simultâneos ou sequenciais, no mesmo imóvel ou em imóveis diferentes) jamais misture documentos.
Registros financeiros e contratuais são **append-only / soft-delete**: nada é apagado de forma
destrutiva; alterações preservam o histórico anterior. Toda mudança relevante deve ser auditável
(quem, quando, o quê). *Rationale:* a dor central da R7 é descentralização e perda de histórico;
o sistema só tem valor se for a fonte única e confiável da verdade.

### II. Segurança por Padrão (RLS + LGPD + Segredos)
**RLS habilitada em toda tabela** do Supabase, sem exceção — nenhum dado acessível sem usuário
autenticado. Nenhum segredo (chaves, tokens, `.env`) entra no repositório: o `.gitignore` deve ser
seguro por construção e os segredos vivem em variáveis de ambiente (Vercel/Supabase). Dados pessoais
(CPF/CNPJ, RG, nascimento, contatos de inquilino e fiador) são tratados sob a **LGPD**: coletar só o
necessário, acesso restrito a usuários autenticados. *Rationale:* o sistema guarda dados pessoais e
financeiros sensíveis; vazamento é risco jurídico e reputacional inaceitável.

### III. Confiabilidade de Datas e Alertas
A lógica de datas é crítica e deve ser **correta e testada**. Alertas de reajuste disparam a
**30, 15, 7 e 1 dia antes**; o mesmo mecanismo cobre renovação contratual, encerramento de desconto
e vencimentos financeiros. Todo cálculo de data usa o fuso **America/Sao_Paulo** e valores
monetários em **BRL**. Nenhum prazo pode ser silenciosamente perdido. *Rationale:* o motivo de
existir do produto é não deixar passar datas — uma falha aqui quebra a confiança no sistema inteiro.

### IV. Experiência Limpa e Profissional (inspirada no iPhone)
Interface em **modo claro (branco com detalhes em cinza)**, leve, limpa e profissional, priorizando
clareza e facilidade de uso para usuários não técnicos. Consistência visual via um design system
único; estados de vazio, carregamento e erro sempre tratados; acessibilidade básica respeitada.
*Rationale:* a adoção depende de funcionários trocarem o Excel por algo que pareça mais simples,
não mais complicado.

### V. Simplicidade e Entrega Incremental (YAGNI / MVP primeiro)
Construir primeiro o núcleo (cadastros, relação, documentos, controle financeiro mês a mês, alertas)
e só depois extras. Funcionalidades de alto custo/risco — como **verificação automática de IPTU via
API** — ficam como fase futura, com a arquitetura preparada para recebê-las, mas fora do MVP.
Dimensionar para a escala real (~80 imóveis), sem over-engineering. *Rationale:* entregar valor cedo
e evitar que o projeto trave em complexidade desnecessária.

## Restrições Técnicas (Stack)

- **Código:** GitHub, com `.gitignore` seguro (sem segredos, `.env`, builds, `node_modules`).
- **Banco de dados:** Supabase (PostgreSQL) com **RLS ativada por padrão**; arquivos em Supabase Storage.
- **Hospedagem:** Vercel.
- **Localização:** pt-BR, fuso America/Sao_Paulo, moeda BRL.
- A escolha concreta de framework de frontend e bibliotecas é decidida na fase de **plano**
  (`/speckit-plan`), respeitando estes princípios. A especificação permanece agnóstica de tecnologia.

## Fluxo de Desenvolvimento (Spec-Driven)

- Desenvolvimento conduzido por **spec-kit**: constituição → especificação → clarify → plano →
  tarefas → analyze → implementação.
- Todos os artefatos (`specs/`, esta constituição, plano, tarefas) ficam versionados no Git.
- A fase de plano executa o **Constitution Check**: qualquer violação destes princípios deve ser
  corrigida no spec/plano/tarefas — nunca diluída ou ignorada.
- Mudanças de schema do banco são feitas por **migrações versionadas** no Supabase.

## Governance

Esta constituição prevalece sobre outras práticas do projeto. Emendas exigem: registro da mudança,
justificativa e atualização da versão por **semver** (MAJOR = remoção/redefinição incompatível de
princípio; MINOR = novo princípio/seção; PATCH = ajustes de redação). Toda revisão de plano e de
implementação deve verificar conformidade com os princípios — em especial RLS/LGPD (II) e
integridade de histórico (I), que são bloqueantes.

**Version**: 1.0.0 | **Ratified**: 2026-06-21 | **Last Amended**: 2026-06-21
