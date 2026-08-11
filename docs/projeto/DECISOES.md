# REGISTRO DE DECISÕES - GESTÃO OBA DOCERIA

Atualizado em: 2026-08-11

## D001 - Base oficial de desenvolvimento
Decisão: usar `C:\Users\pc_fa\OneDrive\OBA_DOCERIA\oba-v2` como única base ativa.
Motivo: arquitetura modular, testes, build e melhor capacidade de manutenção.

## D002 - Projeto_GPT_Plus
Decisão: manter apenas como referência/recuperação.
Motivo: evitar linhas concorrentes de desenvolvimento.

## D003 - Código executável prevalece
Decisão: código realmente importado/executado e testes atuais prevalecem sobre documentação histórica contraditória.

## D004 - Não reconstruir antes de pesquisar
Decisão: toda funcionalidade deve ser procurada nas bases atuais e históricas antes de nova implementação.

## D005 - Modais
Decisão: modais operacionais não fecham por clique fora. Devem oferecer ação explícita de fechamento.

## D006 - Git
Decisão: commits pequenos por checkpoint funcional. Evitar `git add .` indiscriminado enquanto houver material histórico misturado.

## D007 - Histórico
Decisão: preservar material antigo até classificar e garantir que funcionalidades úteis foram recuperadas.

## D008 - Automação
Decisão: preferir scripts reproduzíveis para alterações multiarquivo, auditorias, backups, testes, build e documentação repetitiva.

## D009 - Alterações manuais
Decisão: quando inevitáveis, informar arquivo, intervalo de linhas, trecho de referência e local exato.

## D010 - Mudanças metodológicas
Decisão: registrar mudanças relevantes neste arquivo e em `CHANGELOG_METODOLOGIA.md`.

## D011 - Mudança para estratégia de recuperação
Decisão: parar de reconstruir funcionalidades já existentes e usar produção/histórico como referência funcional.
Motivo: a comparação revelou grande volume de funcionalidades já construídas em `oba_doceria`/Vxx e na versão publicada.

## D012 - Papel do `oba_doceria`
Decisão: o sistema monolítico histórico não volta a ser a base de desenvolvimento.
Motivo: apesar de funcional e rico em recursos, é menos adequado para manutenção futura. Será uma biblioteca de comportamento, regras e UX a recuperar.

## D013 - Validação de presença funcional
Decisão: menções em arquivos, slices de estado ou templates não bastam para classificar um módulo como pronto.
Critério: funcionalidade precisa estar conectada à aplicação e ser testável ponta a ponta.

## D014 - Prioridade sobre estética
Decisão: melhorias visuais P2 não bloqueiam correções P0/P1, integrações ou recuperação funcional.
Exemplo atual: enriquecimento da tela de detalhes de Fornecedor ficará para polimento se o fluxo principal estiver estável.

## D015 - Entrega incremental sem ZIP completo
Decisão: ZIP completo deixa de ser padrão para pequenas mudanças.
Preferência: scripts/patches incrementais com backup e validação, ou pacotes contendo somente arquivos afetados.
Motivo: reduzir espera de compactação, upload, processamento e aplicação manual.

## D016 - Alvo de infraestrutura
Decisão: GitHub será a fonte oficial remota e Cloudflare Pages fará deploy automático da versão aprovada.
Objetivo: permitir continuidade em qualquer computador e eliminar dependência de uma única pasta local.

## D017 - Ordem de finalização
Decisão: fechar Fornecedores, auditar módulos ativos em lote, corrigir integrações críticas, recuperar módulos ausentes e somente depois executar polimento amplo.
Motivo: reduzir retrabalho e acelerar chegada à produção utilizável.
