# ROADMAP - GESTÃO OBA DOCERIA

Atualizado em: 2026-08-11

## Fase 0 - Baseline e governança
Status: CONCLUÍDA

- [x] Definir `oba-v2` como base oficial.
- [x] Criar snapshot externo.
- [x] Inventariar código.
- [x] Auditar documentação e histórico.
- [x] Inicializar Git local.
- [x] Criar documentação canônica.
- [x] Criar primeiro commit de baseline.
- [x] Criar tag `baseline-oba-v2-20260810`.
- [x] Criar branch `fix/estabilizacao-fornecedores`.

## Fase 1 - Fechar Fornecedores
Status: QUASE CONCLUÍDA

- [x] Corrigir congelamento/navegação.
- [x] Corrigir fechamento de modal por clique fora.
- [x] Corrigir X/Cancelar.
- [x] Corrigir máscara de CNPJ.
- [x] Corrigir persistência do CNPJ no model.
- [x] Corrigir proteção para registros sem CNPJ.
- [x] Corrigir loading preso.
- [x] Corrigir edição.
- [x] Corrigir exclusão/modal de confirmação.
- [x] Teste manual principal reportado como funcional.
- [ ] Rodar testes automatizados direcionados de Fornecedores.
- [ ] Revisar `git diff`.
- [ ] Commitar checkpoint de Fornecedores.
- [ ] Opcional P2: melhorar tela de detalhes sem bloquear avanço.

## Fase 2 - Auditoria funcional dos módulos ativos
Status: PRÓXIMA

Auditar automaticamente e depois testar somente gaps encontrados:
- [ ] Dashboard.
- [ ] Insumos.
- [ ] Compras.
- [ ] Estoque.
- [ ] Fichas Técnicas.
- [ ] Produção.

Fornecedores entra apenas em regressão, não em nova reconstrução.

Saída obrigatória desta fase:
- tabela PRONTO / PARCIAL / BLOQUEADO;
- lista P0/P1/P2;
- testes existentes por módulo;
- código órfão/duplicado relevante;
- dependências entre módulos.

## Fase 3 - Integrações críticas
Status: PENDENTE

- [ ] Compra aprovada gera/atualiza movimentação de estoque corretamente.
- [ ] Custo/saldo após compra é consistente.
- [ ] Ficha Técnica usa insumos/custos corretos.
- [ ] Produção valida estoque disponível.
- [ ] Produção gera baixas/movimentações corretas.
- [ ] Navegação entre os módulos não acumula listeners/modais/overlays.
- [ ] Persistência sobrevive a reload.

## Fase 4 - Recuperação funcional orientada por referências
Status: PENDENTE

Validar e recuperar, conforme prioridade operacional:
- [ ] Clientes.
- [ ] Encomendas/Pedidos.
- [ ] Vendas.
- [ ] Financeiro.
- [ ] Cartões como domínio/fluxo completo, se necessário.
- [ ] Relatórios completos.
- [ ] Backup/restauração completos.

Regra: pesquisar primeiro produção, `oba_doceria`/V90/Vxx e `Projeto_GPT_Plus`; criar do zero somente quando não houver base aproveitável.

## Fase 5 - Consolidação visual
Status: PENDENTE

- [ ] Usar a versão publicada/histórica como referência de identidade visual.
- [ ] Uniformizar componentes, formulários, modais e tabelas.
- [ ] Melhorar responsividade.
- [ ] Remover aparência provisória/inconsistente.
- [ ] Não redesenhar módulos estáveis sem benefício operacional claro.

## Fase 6 - Saneamento técnico
Status: PENDENTE

- [ ] Classificar/remover da árvore ativa `.bak` e `*_CORRIGIDO` já absorvidos.
- [ ] Separar material histórico da fonte oficial.
- [ ] Validar imports órfãos.
- [ ] Validar listeners e ciclo destroy/mount.
- [ ] Reduzir duplicações entre módulos.
- [ ] Atualizar testes que não representam mais o comportamento oficial.

## Fase 7 - GitHub e Cloudflare
Status: PENDENTE

- [ ] Definir repositório GitHub oficial do `oba-v2`.
- [ ] Configurar `origin`.
- [ ] Publicar branch principal consolidada.
- [ ] Configurar Cloudflare Pages conectado ao GitHub.
- [ ] Definir comando de build e diretório de saída.
- [ ] Validar deploy automático em ambiente controlado.
- [ ] Confirmar domínio `oba-doceria.pages.dev` apontando para a base correta.

## Fase 8 - Release
Status: PENDENTE

- [ ] `npm test` aprovado.
- [ ] testes dos fluxos críticos aprovados.
- [ ] `npm run build` aprovado.
- [ ] preview da build aprovado.
- [ ] backup de dados antes do deploy.
- [ ] deploy.
- [ ] smoke test em produção.
- [ ] rollback documentado/testável.
- [ ] tag da versão publicada.
- [ ] documentação final atualizada.

## Ordem operacional imediata
1. Fechar commit de Fornecedores.
2. Auditar os 6 módulos ativos restantes em lote.
3. Corrigir P0/P1 em lote, priorizando integração.
4. Validar fluxos críticos.
5. Recuperar módulos ausentes por prioridade.
6. Consolidar visual.
7. Conectar GitHub/Cloudflare.
8. Release.
