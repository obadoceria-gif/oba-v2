# BACKLOG DE FINALIZAÇÃO - OBA DOCERIA

Atualizado em: 2026-08-11

## Legenda
- P0: bloqueia uso/integridade.
- P1: necessário para operação real.
- P2: polimento/melhoria não bloqueante.
- A VALIDAR: existe evidência, mas não confirmação funcional.

## Núcleo ativo
| Área | Situação | Prioridade | Próxima ação |
|---|---|---:|---|
| Fornecedores | fluxo principal validado manualmente | P0 -> fechamento | testes + diff + commit |
| Dashboard | ativo | A VALIDAR | auditoria/teste em lote |
| Insumos | ativo | A VALIDAR | auditoria/teste em lote |
| Compras | ativo | A VALIDAR | foco em integração com estoque |
| Estoque | ativo | A VALIDAR | foco em saldo/custo/movimentação |
| Fichas Técnicas | ativo | A VALIDAR | foco em custo e insumos |
| Produção | ativo | A VALIDAR | foco em baixa de estoque |

## Recuperação funcional
| Área | Evidência externa | Situação no App atual | Prioridade inicial |
|---|---|---|---:|
| Clientes | produção/histórico | não conectado como módulo ativo | P1 |
| Encomendas/Pedidos | produção/histórico | não conectado como módulo ativo | P1 |
| Vendas | produção/histórico | sem módulo ativo confirmado | P1 |
| Financeiro | produção + histórico | gap claro | P1 |
| Cartões | produção/histórico | referências em Compras; módulo próprio não confirmado | P1/P2 |
| Relatórios | infraestrutura existe | abrangência funcional a validar | P1/P2 |
| Backup | referências existem | fluxo completo a validar | P1 |

## Integrações P0/P1
- Compra -> Estoque.
- Produção -> Estoque.
- Persistência após reload.
- Navegação repetida sem travamentos/listeners duplicados.
- Integridade referencial de insumos usados por compras/fichas/produção.

## Dívida técnica P1/P2
- arquivos `.bak` e `*_CORRIGIDO` dentro da fonte;
- documentação antiga conflitante na raiz histórica;
- ausência de remote Git oficial no `oba-v2`;
- pipeline Cloudflare ainda não consolidado com esta base;
- padronização visual pendente após fechamento funcional.

## Regra de execução do backlog
1. P0 primeiro.
2. P1 que recupera operação já existente depois.
3. P2 somente quando não atrasar entrega.
4. Nunca iniciar item sem pesquisar implementação existente.
