# PLANO MESTRE - GESTÃO OBA DOCERIA

Atualizado em: 2026-08-11  
Base oficial de desenvolvimento: `C:\Users\pc_fa\OneDrive\OBA_DOCERIA\oba-v2`

## 1. Objetivo final
Concluir e publicar uma única versão oficial do sistema de gestão OBA Doceria, preservando o que já funciona, recuperando funcionalidades já construídas em versões anteriores e evitando reconstruções desnecessárias.

O resultado final deverá ter:
- uma única base de código modular e manutenível;
- GitHub como fonte oficial do código;
- Cloudflare Pages como ambiente de produção;
- deploy automático a cada atualização aprovada da branch de produção;
- possibilidade de clonar e continuar o desenvolvimento em qualquer computador;
- testes automatizados para fluxos críticos;
- documentação canônica curta, atualizada e suficiente para retomar o projeto sem reconstruir contexto;
- preservação do histórico antigo apenas como referência/recuperação.

## 2. Fonte da verdade
A ordem oficial de confiança é:
1. Código executável atual do `oba-v2` realmente importado por `src/App.js`.
2. Testes automatizados que reproduzam o comportamento atual.
3. Documentação canônica em `docs/projeto/`.
4. Versão publicada/captura de produção como referência funcional e visual.
5. Repositório histórico `oba_doceria` e versões Vxx como fonte de recuperação de funcionalidades.
6. `Projeto_GPT_Plus`, Kiro, backups, diagnósticos e outros materiais históricos como referências auxiliares.

Nenhum documento histórico ou presença de palavra em arquivo prova que uma função está ativa. Para ser considerada implementada, a funcionalidade deve estar conectada ao aplicativo e passar por teste funcional.

## 3. Bases e papéis
### 3.1 Base oficial de desenvolvimento
`oba-v2`

Razões:
- arquitetura modular;
- Vite para desenvolvimento/build;
- Vitest e fast-check para testes;
- Core reutilizável de estado, eventos, storage, validação, filtros, relatórios e UI;
- módulos separados por domínio;
- melhor base para manutenção futura.

### 3.2 Referência funcional histórica
`C:\Users\pc_fa\OneDrive\OBA_DOCERIA\oba_doceria`

O repositório histórico contém dezenas de versões monolíticas, incluindo V90 registrada no Git como versão funcional. Ele não volta a ser a base principal; será usado para recuperar regras, telas e fluxos que já existiam.

### 3.3 Projeto_GPT_Plus
Mantido como referência e fonte eventual de recuperação. Não haverá desenvolvimento paralelo nele.

### 3.4 Produção Cloudflare
A versão publicada/capturada será usada como referência visual e funcional. Antes do release final, a origem exata do deploy e a configuração GitHub -> Cloudflare serão consolidadas.

## 4. Princípio central de execução
Antes de implementar qualquer funcionalidade:
1. verificar se já existe no `oba-v2` e se está conectada ao `App.js`;
2. verificar testes existentes;
3. pesquisar a produção, V90/Vxx, `Projeto_GPT_Plus` e histórico relevante;
4. reaproveitar/adaptar código e regras existentes quando seguro;
5. criar do zero somente o que realmente não existir ou não puder ser recuperado.

## 5. Método de trabalho acelerado
Cada ciclo deve ser curto e reproduzível:
1. definir um resultado funcional pequeno e verificável;
2. auditar automaticamente os arquivos envolvidos;
3. criar backup/checkpoint Git;
4. aplicar alterações por script quando envolver vários arquivos;
5. executar testes automatizados direcionados;
6. executar teste manual somente do fluxo visual/operacional necessário;
7. executar regressão mínima dos módulos relacionados;
8. atualizar automaticamente `ESTADO_ATUAL.md`, `ROADMAP.md` e decisões quando necessário;
9. revisar `git diff`;
10. fazer commit pequeno e descritivo;
11. avançar para o próximo item sem refinamentos cosméticos não prioritários.

## 6. Política de automação
Automatizar sempre que for seguro:
- auditoria de arquivos e imports;
- comparação entre bases;
- aplicação de alterações em múltiplos arquivos;
- backups antes de patches;
- testes;
- build;
- geração de relatórios;
- atualização repetitiva da documentação;
- verificação de Git;
- deploy.

ZIP completo deixa de ser o mecanismo padrão. Preferir patches/scripts pequenos ou pacotes incrementais contendo apenas os arquivos necessários.

## 7. Escopo funcional ativo confirmado
`src/App.js` importa e navega atualmente pelos seguintes módulos:
- Dashboard;
- Insumos;
- Estoque;
- Compras;
- Fornecedores;
- Fichas Técnicas;
- Produção.

Existem slices/estruturas centrais com nomes como `clientes` e `pedidos`, mas isso não os transforma em módulos navegáveis concluídos.

## 8. Funcionalidades a validar/recuperar
A comparação com produção e histórico indica que devemos validar ou recuperar, sem presumir conclusão:
- Clientes;
- Encomendas/Pedidos;
- Vendas;
- Financeiro;
- Cartões;
- Relatórios completos;
- Backup operacional completo.

Financeiro foi o gap mais claro na primeira matriz textual: presente no histórico/produção e sem evidência correspondente no `oba-v2`.

## 9. Fluxos críticos de negócio
A conclusão do projeto exige validar ponta a ponta:
- Fornecedor -> Compra;
- Compra -> entrada/atualização de Estoque;
- Estoque -> Ficha Técnica/custo;
- Ficha Técnica -> Produção;
- Produção -> baixa/movimentação de Estoque;
- Cliente -> Encomenda/Pedido -> Venda/recebimento, quando recuperados;
- Compras/Vendas -> Financeiro, quando recuperado;
- Backup -> restauração confiável de dados.

## 10. Critério de prioridade
P0 - bloqueia uso, integridade de dados, navegação, persistência ou fluxo crítico.  
P1 - funcionalidade necessária para operação real e já existente em referência histórica/produção.  
P2 - melhoria visual, conforto, polimento e recursos não bloqueantes.

Melhorias cosméticas não devem atrasar P0/P1.

## 11. Política de alterações
Quando a alteração for manual, a instrução deve informar caminho do arquivo, intervalo de linhas, trecho de referência e local exato de inserção/substituição.

Quando possível, substituir o trabalho manual por script com:
- verificação da base correta;
- backup;
- patch;
- validação;
- relatório do que mudou;
- nenhum commit automático antes de testes.

## 12. Política de Git
- baseline protegida: commit `0f0181a`;
- tag: `baseline-oba-v2-20260810`;
- branch de trabalho atual: `fix/estabilizacao-fornecedores`;
- commits pequenos por checkpoint funcional;
- não usar `git add .` enquanto material histórico não classificado puder entrar por acidente;
- depois da consolidação, configurar remote oficial do `oba-v2` no GitHub;
- produção deverá ser alimentada por deploy automático a partir do repositório oficial.

## 13. Regra de preservação
Nenhum material histórico será apagado antes de:
1. existir backup;
2. ser classificado;
3. ser verificado quanto a valor de recuperação;
4. a funcionalidade equivalente estar preservada na base oficial.

## 14. Caminho até o resultado final
1. Fechar checkpoint de Fornecedores.
2. Auditar funcionalmente os 7 módulos ativos.
3. Corrigir P0/P1 desses módulos.
4. Validar integrações críticas entre eles.
5. Mapear módulos/fluxos ausentes contra produção e histórico.
6. Recuperar/adaptar funcionalidades faltantes por prioridade operacional.
7. Consolidar UI/UX usando a produção existente como referência, sem redesenhar do zero.
8. Executar suíte completa, build e preview.
9. Conectar `oba-v2` ao GitHub oficial.
10. Configurar Cloudflare Pages para deploy automático.
11. Fazer release controlado com backup e rollback.
12. Executar smoke test em produção.
13. Criar tag de release e atualizar documentação final.
