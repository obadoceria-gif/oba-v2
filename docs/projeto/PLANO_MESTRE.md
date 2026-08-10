# PLANO MESTRE - GESTAO OBA DOCERIA

Atualizado em: 2026-08-10
Base oficial: C:\Users\pc_fa\OneDrive\OBA_DOCERIA\oba-v2

## 1. Objetivo
Consolidar o OBA Doceria V2 como sistema oficial de gestao, preservando o que ja funciona, corrigindo defeitos de forma incremental e evitando reconstrucoes desnecessarias.

## 2. Regra de fonte da verdade
A ordem de confianca do projeto sera:
1. Codigo executavel atual em `src/` e configuracoes realmente usadas.
2. Testes automatizados que reproduzem o comportamento atual.
3. Documentacao canonica em `docs/projeto/`.
4. Documentacao historica da raiz, Kiro, backups e diagnosticos antigos.

Documentos historicos sao evidencia e referencia; nao substituem o codigo atual.

## 3. Base de desenvolvimento
O desenvolvimento ativo ocorre em `oba-v2`.
`Projeto_GPT_Plus` permanece como referencia para comparacao e recuperacao de funcionalidades.
A versao publicada no Cloudflare permanece como referencia funcional/visual ate a consolidacao final.

## 4. Metodo de trabalho
Toda mudanca segue:
1. Reproduzir ou definir o comportamento desejado.
2. Procurar implementacoes existentes antes de criar codigo novo.
3. Analisar impacto nos modulos relacionados.
4. Fazer a menor alteracao segura.
5. Testar o fluxo alterado.
6. Executar regressao dos fluxos relacionados.
7. Registrar a decisao ou mudanca relevante.
8. Fazer commit Git pequeno e descritivo.

## 5. Automacao
Automatizar auditorias, inventarios, testes, build, documentacao repetitiva e verificacoes sempre que for seguro.
Evitar tarefas manuais que possam ser executadas por script de forma reproduzivel.

## 6. Fases
### Fase 0 - Baseline e governanca
- Baseline externa e snapshot.
- Git local.
- Documentacao canonica.
- Classificacao do material historico.

### Fase 1 - Estabilizacao dos modulos existentes
- Fornecedores.
- Compras.
- Estoque.
- Fichas Tecnicas.
- Producao.
- Insumos.
- Dashboard.

### Fase 2 - Fluxos integrados de negocio
- Compra -> entrada no estoque.
- Estoque -> producao.
- Validacao de consistencia entre modulos.

### Fase 3 - Recuperacao e complementacao funcional
- Comparar oba-v2, versao publicada e Projeto_GPT_Plus.
- Recuperar apenas funcionalidades comprovadamente uteis e ausentes.
- Implementar modulos faltantes conforme prioridade operacional.

### Fase 4 - Qualidade e producao
- Suite de testes.
- Build reproduzivel.
- Validacao manual de fluxos criticos.
- Deploy controlado.
- Plano de rollback.

## 7. Regra para alteracoes de codigo
Toda instrucao de alteracao deve informar caminho completo do arquivo, intervalo de linhas, trecho a localizar e local exato de insercao ou substituicao.

## 8. Regra de preservacao
Nenhum backup, diagnostico, arquivo historico ou versao alternativa sera apagado ou movido antes de ser classificado e de existir uma copia de seguranca.
