# REGISTRO DE DECISOES - GESTAO OBA DOCERIA

Atualizado em: 2026-08-10

## D001 - Base oficial de desenvolvimento
Decisao: usar `C:\Users\pc_fa\OneDrive\OBA_DOCERIA\oba-v2` como base ativa.
Motivo: e a versao modular atualmente executada e contem o maior conjunto de codigo, testes e historico recuperado.

## D002 - Projeto_GPT_Plus
Decisao: manter como referencia, sem desenvolvimento ativo neste momento.
Motivo: evitar duas linhas de codigo concorrentes.

## D003 - Codigo antes de documentacao historica
Decisao: codigo executavel e testes atuais prevalecem sobre documentos antigos quando houver contradicao.
Motivo: a auditoria encontrou documentos de momentos distintos com estados incompativeis.

## D004 - Nao reconstruir antes de pesquisar
Decisao: antes de criar funcionalidade ou correcao, pesquisar codigo ativo, testes, Kiro, backups e historico relevante.
Motivo: evitar duplicacao e perda de solucoes que ja existem.

## D005 - Modais
Decisao: modais operacionais nao devem fechar por clique fora; devem ter acao explicita de fechamento. O comportamento por ESC tambem nao sera usado como fechamento automatico enquanto esta regra estiver vigente.
Motivo: reduzir fechamento acidental e tornar o fluxo previsivel.

## D006 - Git
Decisao: usar commits pequenos por checkpoint e nao executar `git add .` enquanto a raiz historica nao estiver classificada.
Motivo: evitar transformar artefatos antigos e temporarios em codigo oficial por acidente.

## D007 - Historico
Decisao: nao apagar ou mover material historico antes de classificar e preservar backup.
Motivo: esse material pode conter implementacoes, regras e diagnosticos uteis.

## D008 - Automacao
Decisao: preferir scripts reproduziveis para auditoria, documentacao, testes, build e tarefas repetitivas.
Motivo: reduzir trabalho manual e erros operacionais.

## D009 - Instrucoes de alteracao
Decisao: toda alteracao manual orientada deve indicar arquivo, intervalo de linhas, trecho a localizar e local exato de insercao/substituicao.
Motivo: eliminar ambiguidade operacional.

## D010 - Mudancas metodologicas
Decisao: toda mudanca relevante de metodologia, arquitetura ou fonte oficial deve ser registrada neste arquivo e no changelog de metodologia.
Motivo: manter continuidade entre sessoes, pessoas e ferramentas.
