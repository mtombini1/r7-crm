# Feature Specification: CRM de Gestão de Imóveis e Locações — R7 Participações

**Feature Branch**: `001-crm-gestao-imoveis`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: CRM dedicado para a R7 Participações centralizar o controle de ~80 imóveis (PR/SC), seus inquilinos, contratos de locação, obrigações financeiras (aluguel, IPTU, condomínio, ambiental), documentos e datas críticas (reajuste, renovação, encerramento de desconto), substituindo o controle atual em planilhas Excel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e painel de imóveis (Priority: P1)

Um funcionário cadastra um imóvel com seus dados oficiais e acompanha, em um painel,
as informações do imóvel, a situação dos documentos obrigatórios e as abas de inquilino e arquivos.

**Why this priority**: É a base de tudo — sem imóveis cadastrados não há o que gerir. Já entrega
valor sozinha ao centralizar as informações de imóveis hoje espalhadas em planilhas.

**Independent Test**: Cadastrar um imóvel completo e abrir seu painel; verificar que todos os campos
e a checklist de documentos aparecem corretamente, mesmo sem inquilino vinculado.

**Acceptance Scenarios**:

1. **Given** nenhum imóvel cadastrado, **When** o funcionário preenche Nome, endereço, matrícula,
   inscrição imobiliária, DIC e metragem (m²) e salva, **Then** o imóvel aparece na lista e seu painel
   exibe todos os dados.
2. **Given** um imóvel cadastrado, **When** o funcionário abre o painel, **Then** vê uma checklist de
   documentos (Ambiental, IPTU, Condomínio) com caixas marcáveis indicando o que já existe.
3. **Given** um imóvel sem inquilino, **When** o funcionário abre o painel, **Then** o status aparece
   como "Vago" e as abas de inquilino e de arquivos estão acessíveis.

---

### User Story 2 - Cadastro de inquilinos (Priority: P1)

Um funcionário cadastra um inquilino (pessoa física ou jurídica) com seus dados pessoais,
de contato, responsável e fiador.

**Why this priority**: É a outra metade do dado-base; necessário para criar locações.

**Independent Test**: Cadastrar um inquilino completo e localizá-lo na lista de inquilinos com todos
os dados salvos corretamente.

**Acceptance Scenarios**:

1. **Given** a tela de cadastro de inquilino, **When** o funcionário informa Nome, CPF/CNPJ, RG,
   data de nascimento, endereço pessoal, e-mail, telefone, responsável, fiador e e-mail/telefone do
   fiador, **Then** o inquilino é salvo e listado.
2. **Given** um CPF/CNPJ inválido, **When** o funcionário tenta salvar, **Then** o sistema bloqueia e
   indica o erro.

---

### User Story 3 - Vínculo Imóvel ↔ Inquilino (Locação) (Priority: P1)

Ao cadastrar uma locação, o funcionário escolhe um inquilino e vê a lista de imóveis disponíveis para
vincular, registrando os dados financeiros e contratuais daquela contratação.

**Why this priority**: É o coração do negócio — relaciona as duas entidades e habilita controle
financeiro e alertas. Com US1+US2+US3 já existe um MVP utilizável.

**Independent Test**: Criar uma locação ligando um inquilino a um imóvel disponível e confirmar que a
locação aparece tanto no painel do imóvel quanto no do inquilino, com valores e datas.

**Acceptance Scenarios**:

1. **Given** imóveis e inquilinos cadastrados, **When** o funcionário cria uma locação, **Then** o
   sistema apresenta os imóveis disponíveis para vincular ao inquilino.
2. **Given** uma locação em criação, **When** o funcionário informa valor do aluguel, data de
   renovação, data de reajuste, troca de desconto e índice de correção, **Then** a locação é salva e
   vinculada ao imóvel e ao inquilino.
3. **Given** um inquilino com mais de um contrato (no mesmo ou em imóveis diferentes), **When** se
   cria uma nova locação, **Then** cada locação permanece separada, sem misturar dados ou arquivos.

---

### User Story 4 - Alertas de datas críticas (Priority: P2)

O sistema avisa, por popup no app, sobre datas de reajuste, renovação e encerramento de desconto, a
30, 15, 7 e 1 dia antes; no reajuste, exige que o funcionário informe o novo valor ao reconhecer.

**Why this priority**: É o principal diferencial do produto (não deixar passar datas). Depende de
locações existirem (US3), por isso vem logo em seguida.

**Independent Test**: Cadastrar uma locação com data de reajuste próxima e verificar que o popup
aparece nos marcos corretos e que não é possível fechá-lo sem informar o novo valor.

**Acceptance Scenarios**:

1. **Given** uma locação com data de reajuste em 30/15/7/1 dia, **When** o funcionário usa o sistema,
   **Then** um popup de alerta é exibido em cada um desses marcos.
2. **Given** um popup de alerta de reajuste, **When** o funcionário o reconhece, **Then** o sistema
   exige a inserção do novo valor do aluguel antes de permitir fechar o alerta.
3. **Given** datas de renovação contratual ou de encerramento de desconto próximas, **When** chega o
   marco, **Then** o sistema exibe o alerta correspondente.

---

### User Story 5 - Controle financeiro mês a mês (Priority: P2)

O funcionário registra e acompanha, mês a mês, os pagamentos de aluguel, IPTU, condomínio e ambiental,
marcando cada competência como paga ou pendente, com histórico completo.

**Why this priority**: Substitui o controle financeiro do Excel e habilita a visão de inadimplência;
depende das locações (US3).

**Independent Test**: Lançar competências mensais para uma locação, marcar algumas como pagas e
confirmar que o histórico e as pendências ficam visíveis.

**Acceptance Scenarios**:

1. **Given** uma locação ativa, **When** o funcionário registra a competência do mês para aluguel,
   IPTU, condomínio ou ambiental, **Then** ela aparece com status pendente e valor.
2. **Given** uma competência pendente, **When** o funcionário a marca como paga (data/valor), **Then**
   o histórico é atualizado sem apagar registros anteriores.
3. **Given** competências vencidas e não pagas, **When** o funcionário consulta, **Then** elas
   aparecem destacadas como pendências.

---

### User Story 6 - Gestão de documentos por entidade (Priority: P2)

Cada imóvel, inquilino e locação tem sua própria aba de arquivos. O imóvel guarda o histórico
completo de todos os contratos; a locação guarda apenas os arquivos daquela contratação.

**Why this priority**: Requisito explícito de organização e não-mistura de históricos; depende das
entidades existirem.

**Independent Test**: Anexar arquivos a um imóvel, a um inquilino e a uma locação, e confirmar que
cada aba mostra apenas os arquivos da sua entidade.

**Acceptance Scenarios**:

1. **Given** um imóvel, **When** o funcionário anexa um contrato, **Then** ele aparece na aba de
   arquivos do imóvel (histórico completo do imóvel).
2. **Given** uma locação específica, **When** o funcionário anexa o contrato daquela contratação,
   **Then** ele aparece apenas na aba de arquivos daquela locação, não nas locações de outros
   contratos do mesmo inquilino.
3. **Given** uma locação encerrada, **When** uma nova locação é criada para o mesmo inquilino ou
   imóvel, **Then** os arquivos da locação anterior permanecem preservados e separados.

---

### User Story 7 - Imóvel vago com responsabilidade da R7 (Priority: P3)

Quando um imóvel não tem inquilino, ele fica como "Vago" e a própria R7 assume a responsabilidade
pelos pagamentos (IPTU, condomínio, ambiental) até a entrada de um novo inquilino.

**Why this priority**: Cobre o caso de vacância levantado pela R7; importante, mas posterior ao núcleo.

**Independent Test**: Deixar um imóvel sem locação ativa e confirmar que ele aparece como "Vago" e que
seus pagamentos seguem sendo controlados sob a responsabilidade da R7.

**Acceptance Scenarios**:

1. **Given** um imóvel sem locação ativa, **When** o funcionário o consulta, **Then** o status é
   "Vago" e a R7 consta como responsável pelos pagamentos.
2. **Given** um imóvel vago, **When** uma nova locação é criada, **Then** a responsabilidade pelos
   pagamentos passa ao inquilino a partir do início da locação, preservando o histórico do período de
   vacância.

---

### Edge Cases

- Inquilino com múltiplos contratos simultâneos em imóveis diferentes — dados e arquivos não podem se
  misturar.
- Inquilino que encerra um contrato e inicia outro — histórico anterior deve ser preservado.
- Imóvel que alterna entre ocupado e vago ao longo do tempo — histórico de cada período preservado.
- Alerta de reajuste ignorado/adiado — não pode "sumir"; deve reaparecer até o novo valor ser informado.
- Competência financeira lançada em duplicidade para o mesmo mês — sistema deve evitar duplicação.
- Inquilino sem fiador (quando não exigido) — fiador deve ser opcional.
- Cadastro de pessoa jurídica (CNPJ) vs. física (CPF) — validação adequada a cada caso.
- Tentativa de exclusão de registro com histórico — deve arquivar (soft-delete), não apagar.

## Requirements *(mandatory)*

### Functional Requirements

**Imóveis**
- **FR-001**: O sistema MUST permitir cadastrar um imóvel com Nome, endereço, matrícula do imóvel,
  inscrição imobiliária, DIC e metragem (m²).
- **FR-002**: Cada imóvel MUST ter uma checklist de documentos (Ambiental, IPTU, Condomínio) com
  marcação por caixas indicando presença/ausência.
- **FR-003**: O sistema MUST exibir um painel por imóvel com seus dados e abas de inquilino atual e de
  arquivos.
- **FR-004**: O sistema MUST exibir o status do imóvel (Ocupado / Vago).

**Inquilinos**
- **FR-005**: O sistema MUST permitir cadastrar um inquilino com Nome, CPF/CNPJ, RG, data de
  nascimento, endereço pessoal, e-mail, telefone, responsável, fiador e e-mail/telefone do fiador.
- **FR-006**: O sistema MUST validar CPF/CNPJ por **dígito verificador** (não apenas máscara) no
  cadastro do inquilino. Não há restrição de unicidade nesta versão (CPF/CNPJ duplicado é permitido).
- **FR-007**: O sistema MUST tratar o fiador como opcional.

**Locação (Relação Imóvel ↔ Inquilino)**
- **FR-008**: O sistema MUST permitir criar uma locação vinculando um inquilino a um imóvel.
- **FR-009**: Ao criar a locação, o sistema MUST apresentar os imóveis disponíveis para vínculo.
- **FR-010**: A locação MUST registrar valor do aluguel, data de renovação, data de reajuste, troca de
  desconto e índice de correção.
- **FR-011**: O sistema MUST suportar que um inquilino tenha múltiplas locações (mesmo ou diferentes
  imóveis; simultâneas ou sequenciais) sem misturar dados.
- **FR-012**: O sistema MUST preservar o histórico de todas as locações de um imóvel ao longo do tempo.

**Documentos / Arquivos**
- **FR-013**: O sistema MUST permitir anexar arquivos separadamente a imóvel, inquilino e locação, em
  abas distintas.
- **FR-014**: O imóvel MUST manter o histórico completo de contratos; a locação MUST exibir apenas os
  arquivos daquela contratação.
- **FR-015**: O sistema MUST preservar arquivos ao encerrar ou substituir uma locação (nunca perder
  histórico).

**Financeiro (mês a mês)**
- **FR-016**: O sistema MUST permitir lançar competências mensais de aluguel, IPTU, condomínio e
  ambiental por locação (ou por imóvel, quando vago). Cada competência registra uma **data de
  vencimento** — derivada de `dia_vencimento` da locação (aluguel) ou informada no lançamento (IPTU,
  condomínio, ambiental).
- **FR-017**: O sistema MUST permitir marcar cada competência como paga ou pendente, com data e valor.
- **FR-018**: O sistema MUST manter o histórico financeiro de forma não destrutiva (append-only).
- **FR-019**: O sistema MUST destacar competências vencidas/pendentes (inadimplência).

**Alertas e datas**
- **FR-020**: O sistema MUST exibir alertas em popup a 30, 15, 7 e 1 dia antes da data de reajuste,
  além do estado **vencido** (após a data, em catch-up). O popup é exibido uma vez por sessão por
  alerta pendente, até ser reconhecido (deduplicado por locação + tipo + data-alvo).
- **FR-021**: O sistema MUST aplicar o mesmo mecanismo para renovação contratual e encerramento de
  desconto. O reconhecimento desses dois é feito ao marcar **"Ciente"** (sem exigir novo valor);
  reconhecido, o popup não reaparece.
- **FR-022**: Ao reconhecer um alerta de reajuste, o sistema MUST exigir a inserção do novo valor do
  aluguel antes de permitir fechar o alerta.
- **FR-023**: O alerta de reajuste MUST reaparecer a cada acesso (catch-up) enquanto o novo valor não
  for informado, inclusive após a data-alvo — não pode ser perdido.
- **FR-024**: O sistema MUST alertar (popup) sobre lançamentos financeiros vencidos e ainda pendentes;
  o alerta encerra automaticamente quando o lançamento é pago (também visível no dashboard).
- **FR-025**: O sistema MUST registrar o histórico dos **reconhecimentos** de alertas (quem/quando, e o
  novo valor no caso de reajuste). Os alertas são derivados das datas em tempo real (não persistidos um
  a um); toda ação relevante fica também no audit-log.

**Imóvel vago**
- **FR-026**: O sistema MUST marcar como "Vago" todo imóvel sem locação ativa.
- **FR-027**: Durante a vacância, o sistema MUST atribuir à R7 a responsabilidade pelos pagamentos do
  imóvel, mantendo o controle financeiro.

**Usuários e segurança**
- **FR-028**: O sistema MUST exigir autenticação para qualquer acesso.
- **FR-029**: Todos os usuários autenticados MUST ter acesso total às funcionalidades (sem níveis de
  permissão nesta versão).
- **FR-030**: O sistema MUST proteger os dados pessoais (LGPD), restringindo o acesso a usuários
  autenticados.

**Gerais**
- **FR-031**: O sistema MUST permitir buscar e filtrar imóveis e inquilinos.
- **FR-032**: O sistema MUST oferecer uma visão geral (dashboard) com próximas datas e pendências
  financeiras.
- **FR-033**: O sistema MUST usar exclusão lógica (soft-delete/arquivamento) para registros com
  histórico, nunca exclusão destrutiva.
- **FR-034**: O sistema MUST manter trilha de auditoria (quem, quando, o quê — antes/depois) das
  alterações em imóveis, inquilinos, locações, arquivos e lançamentos; o histórico financeiro é
  registrado em ledger imutável (append-only).

### Key Entities *(include if feature involves data)*

- **Imóvel**: bem gerido pela R7. Atributos: nome, endereço, matrícula, inscrição imobiliária, DIC,
  metragem, status (Ocupado/Vago), checklist de documentos (Ambiental/IPTU/Condomínio). Relaciona-se a
  locações (histórico) e a arquivos próprios.
- **Inquilino**: pessoa física ou jurídica. Atributos: nome, CPF/CNPJ, RG, nascimento, endereço,
  e-mail, telefone, responsável, fiador (+contatos). Relaciona-se a locações e a arquivos próprios.
- **Locação (Relação)**: contrato que liga um inquilino a um imóvel por um período. Atributos: valor do
  aluguel, data de início, data de fim (vigência, preenchida ao encerrar), data de renovação, data de
  reajuste, troca de desconto, índice de correção. Possui seus próprios arquivos e lançamentos financeiros.
- **Lançamento financeiro / Competência**: obrigação mensal (aluguel, IPTU, condomínio, ambiental)
  associada a uma locação ou a um imóvel vago. Atributos: tipo, mês de competência, valor, **data de
  vencimento**, status (pendente/pago/cancelado), data de pagamento.
- **Arquivo/Documento**: arquivo anexado a um Imóvel, Inquilino ou Locação. Atributos: nome, tipo,
  entidade de vínculo, data.
- **Alerta/Evento de data**: evento gerado a partir de datas da locação (reajuste, renovação,
  encerramento de desconto) ou de vencimentos financeiros. Atributos: tipo, data-alvo, marcos
  (30/15/7/1), status de reconhecimento.
- **Usuário**: pessoa autenticada que opera o sistema (acesso total nesta versão).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O sistema suporta o cadastro e a gestão de todos os ~80 imóveis e seus inquilinos em um
  único lugar (capacidade verificável), substituindo as planilhas Excel.
- **SC-002**: Para 100% das locações com data cadastrada, o alerta da data crítica é exibido no
  primeiro acesso a partir do marco (30/15/7/1 dia) e permanece (catch-up) até ser reconhecido —
  nenhum marco é perdido por ninguém ter acessado no dia exato.
- **SC-003**: 100% dos alertas de reajuste reconhecidos resultam em um novo valor informado — é
  impossível fechar o alerta sem atualizar o valor.
- **SC-004**: Zero mistura de documentos: para um inquilino com múltiplos contratos, cada locação
  exibe somente seus próprios arquivos.
- **SC-005**: Um funcionário consegue cadastrar um imóvel completo em menos de 3 minutos e criar uma
  locação (vínculo) em menos de 2 minutos.
- **SC-006**: O status de pagamento de qualquer competência é consultável em até 3 cliques a partir do
  painel do imóvel ou da locação.
- **SC-007**: Zero imóveis sem responsável de pagamento — todo imóvel vago tem a R7 como responsável.

## Assumptions

- Os alertas, nesta versão, são apenas por popup no app; e-mail/WhatsApp ficam para fase futura.
- A verificação automática de IPTU (via API/automação de prefeituras) está fora do MVP; o controle é
  manual/checklist, com a arquitetura preparada para receber a automação depois.
- A carga inicial de dados é por cadastro manual; um importador das planilhas Excel é melhoria futura.
- No reajuste, o cálculo do novo valor é feito pelo funcionário (o sistema apenas avisa e exige a
  atualização do valor ao reconhecer o alerta); cálculo automático pelo índice é melhoria futura.
- Todos os usuários autenticados têm acesso total (sem níveis de permissão nesta versão).
- O sistema é uma aplicação web; idioma pt-BR, fuso America/Sao_Paulo, moeda BRL.
- O índice de correção é um dado informativo registrado na locação (não há integração externa de
  índices nesta versão).
- Vencimentos financeiros vencidos/pendentes são exibidos como popup (alerta de primeira classe) e
  também no dashboard; o alerta encerra ao pagar.
- A validação de CPF/CNPJ verifica o dígito verificador, sem impedir duplicidade nesta versão.
- Upload de arquivos: MIME types aceitos = `application/pdf`, `image/png`, `image/jpeg`, `image/webp`,
  `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
  `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  tamanho máximo fixo de 25 MB por arquivo (constante de configuração).
- Toda alteração relevante é auditada (quem/quando/o quê); o financeiro usa ledger imutável.
