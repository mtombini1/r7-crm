# Relatório ANALYZE — 001-crm-gestao-imoveis (rev. 2)

> Gerado em 2026-06-21 pela auditoria `/speckit-analyze` (multi-agente, somente-leitura).
> **2 passadas executadas.** Esta é a síntese final após a remediação. Os artefatos estão na rev. 2.

## Histórico

- **1ª passada**: 17 achados (0 CRITICAL · 5 HIGH · 8 MEDIUM · 4 LOW). Todos remediados.
- **2ª passada** (após remediação): 14 achados (0 CRITICAL · 2 HIGH · 5 MEDIUM · 7 LOW). Todos remediados.

## O que foi corrigido na rev. 2

| Achado | Sev. | Correção aplicada |
|--------|------|-------------------|
| C1 | HIGH | Logs append-only com **ator não-forjável**: `default auth.uid()` + insert policy `with check (ator/reconhecido_por = auth.uid())`; `audit_log` só leitura (escrita via trigger `security definer`). |
| U1/U4 | HIGH/LOW | `data_vencimento` agora tem origem definida: `dia_vencimento` (config na locação) deriva o vencimento do aluguel; informado p/ IPTU/condomínio/ambiental. FR-016, entidade Lançamento, T032/T043/T044 atualizados. |
| C2 | MEDIUM | View SQL declarada **fonte única** da seleção de alertas; `lib/alertas/marcos.ts` só formata. Adicionado teste de integração semeado das views (T037). |
| I1 | MEDIUM | `profiles` classificada explicitamente (especial: 1:1 com auth.users, sem soft-delete, não auditada) no data-model e no SQL. |
| I2 | MEDIUM | Estado **`vencido`** adicionado ao vocabulário de marcos na spec (FR-020). |
| U2 | MEDIUM | Reconhecimento de **renovação/desconto** definido ("Ciente", sem novo valor) — FR-021, T039. |
| U3 | MEDIUM | **Allowlist de MIME types** enumerada na spec; limite de 25 MB fixado como constante (T046). |
| A1 | LOW | Cadência do popup definida: 1×/sessão por alerta pendente, deduplicado por (locação, tipo, data-alvo) — FR-020. |
| G1 | LOW | FR-025 esclarecido: persiste **reconhecimentos** (alertas são derivados em tempo real) + audit-log. |
| G2 | LOW | Teste e2e de **não-mistura de dados** entre locações do mesmo inquilino (T034, FR-011). |
| G3 | LOW | SC-005/SC-006 verificados como aceite manual no quickstart (T060). |
| A2 | LOW | SC-001 reescrito como capacidade verificável do sistema. |
| I3 | LOW | Este relatório regenerado (a versão rev.1 obsoleta foi substituída). |

## Métricas finais (pós-remediação)

```
Cobertura de requisitos ... 34/34 FR com tarefa; SC-005/SC-006 como aceite manual (T060)
Achados remediados ........ 1ª passada 17/17 · 2ª passada 14/14
Pendências bloqueantes .... 0 (nenhum CRITICAL/HIGH em aberto)
```

## Veredito

✅ **Pronto para `/speckit-implement`** — todas as inconsistências HIGH/MEDIUM foram resolvidas e os
artefatos (spec, plan, data-model, contracts, tasks) estão consistentes entre si na rev. 2.
