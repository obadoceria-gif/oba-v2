# ROADMAP - GESTAO OBA DOCERIA

Atualizado em: 2026-08-10

## Fase 0 - Baseline e controle
Status: EM ANDAMENTO

- [x] Identificar `oba-v2` como base de trabalho.
- [x] Criar snapshot externo.
- [x] Inventariar `src/`.
- [x] Auditar arquivos nao rastreados.
- [x] Auditar documentacao estrategica.
- [x] Inicializar Git local.
- [ ] Criar documentacao canonica.
- [ ] Definir selecao do primeiro commit.
- [ ] Criar primeiro commit e tag de baseline.

## Fase 1 - Estabilizacao funcional
Status: EM ANDAMENTO

### Fornecedores
- [x] Corrigir fechamento indevido de modal.
- [x] Corrigir mascara de CNPJ ao apagar.
- [x] Corrigir loading preso na criacao.
- [x] Corrigir fechamento da tela de detalhes.
- [ ] Finalizar Editar Fornecedor.
- [ ] Testar criar, visualizar, editar, ativar/desativar e excluir.
- [ ] Testar filtros, busca, CNPJ duplicado e validacoes.
- [ ] Executar regressao de navegacao.

### Demais modulos
- [ ] Auditar Insumos.
- [ ] Auditar Compras.
- [ ] Auditar Estoque.
- [ ] Auditar Fichas Tecnicas.
- [ ] Auditar Producao.
- [ ] Auditar Dashboard.

## Fase 2 - Integracoes criticas
- [ ] Compra -> entrada automatica no estoque.
- [ ] Recalculo de saldo e custo medio.
- [ ] Estoque -> baixa por producao.
- [ ] Rejeicao de producao com estoque insuficiente.
- [ ] Testes integrados desses fluxos.

## Fase 3 - Comparacao e recuperacao
- [ ] Comparar oba-v2 com a versao publicada no Cloudflare.
- [ ] Comparar oba-v2 com Projeto_GPT_Plus.
- [ ] Catalogar funcionalidades ausentes.
- [ ] Recuperar somente o que for validado como necessario.

## Fase 4 - Expansao
Prioridades serao definidas pelas necessidades operacionais reais da doceria.
Possiveis dominios: clientes, pedidos/encomendas, vendas, financeiro, cartoes, relatorios e backup aprimorado.

## Fase 5 - Release
- [ ] Testes automatizados aprovados.
- [ ] Fluxos criticos aprovados manualmente.
- [ ] `npm run build` aprovado.
- [ ] Preview da build aprovado.
- [ ] Backup antes do deploy.
- [ ] Deploy.
- [ ] Smoke test em producao.
- [ ] Tag da versao publicada.
