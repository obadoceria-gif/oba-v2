# PLANO DE FINALIZAÇÃO - OBA DOCERIA

Atualizado em: 2026-08-11

## Objetivo
Levar o `oba-v2` da situação atual até uma versão única, utilizável, testada e publicada automaticamente pelo GitHub/Cloudflare, reaproveitando ao máximo o sistema já construído.

## Gate 1 - Fechar Fornecedores
### Fazer
- executar testes automatizados específicos;
- revisar alterações aplicadas em Modal/Form/Model/Service/View/Controller;
- confirmar create/read/update/delete, busca, filtro, ativação/desativação e navegação;
- commitar checkpoint.

### Não fazer agora
- redesenho amplo;
- recursos novos;
- refinamentos cosméticos que não bloqueiam operação.

### Saída
Fornecedores classificado como PRONTO para regressão.

## Gate 2 - Auditoria dos módulos ativos
### Fazer em lote
Para Dashboard, Insumos, Compras, Estoque, Fichas Técnicas e Produção:
- mapear camadas e imports;
- mapear testes existentes;
- executar testes direcionados;
- localizar TODOs, erros conhecidos, duplicações e código órfão;
- validar CRUD e persistência;
- classificar P0/P1/P2.

### Saída
Backlog técnico fechado, sem suposições.

## Gate 3 - Integrações críticas
### Fluxos
1. Compra -> Estoque.
2. Estoque -> Ficha Técnica/custos.
3. Ficha Técnica -> Produção.
4. Produção -> movimentação/baixa de Estoque.

### Testes mínimos
- happy path;
- dados inválidos;
- estoque insuficiente;
- reload/persistência;
- navegação repetida entre módulos.

### Saída
Núcleo operacional da doceria consistente.

## Gate 4 - Recuperação de funcionalidades faltantes
### Fontes, nesta ordem
1. produção/captura publicada;
2. `oba_doceria`/V90/Vxx;
3. `Projeto_GPT_Plus`;
4. Kiro/backups relevantes.

### Domínios candidatos
- Clientes;
- Encomendas/Pedidos;
- Vendas;
- Financeiro;
- Cartões;
- Relatórios completos;
- Backup/restauração completos.

### Método por domínio
1. descrever comportamento existente;
2. extrair modelo de dados e regras;
3. mapear dependências;
4. adaptar à arquitetura do `oba-v2`;
5. testar isoladamente;
6. integrar ao App;
7. testar fluxo completo;
8. commit.

### Saída
Paridade funcional mínima com a versão que já atendia a operação real.

## Gate 5 - Consolidação de UI/UX
### Fazer
- usar produção/histórico como referência visual;
- unificar cabeçalhos, cards, tabelas, formulários, modais e feedbacks;
- garantir responsividade;
- remover aparência provisória onde houver regressão clara.

### Regra
Não reconstruir visual que já esteja bom na referência. Adaptar o que já existe.

### Saída
Interface consistente, moderna e reconhecível como evolução do sistema anterior.

## Gate 6 - Saneamento
### Fazer
- remover/arquivar `.bak` e `*_CORRIGIDO` absorvidos;
- separar histórico da fonte oficial;
- validar imports e listeners;
- eliminar duplicações relevantes;
- atualizar documentação e testes.

### Saída
Repositório limpo e reproduzível.

## Gate 7 - GitHub e deploy contínuo
### Fazer
- escolher/criar repositório oficial do `oba-v2`;
- configurar `origin`;
- push da linha consolidada;
- conectar Cloudflare Pages;
- definir build `npm run build`;
- definir diretório `dist`;
- validar deploy automático;
- garantir rollback via Git/tag.

### Saída
Qualquer máquina pode clonar, alterar, testar, fazer push e atualizar a nuvem de forma controlada.

## Gate 8 - Release final
### Checklist
- suíte automatizada verde;
- build verde;
- preview aprovado;
- backup de dados;
- deploy;
- smoke test;
- tag de release;
- documentação final.

## Cadência recomendada
Trabalhar por checkpoints curtos de 1 a 3 objetivos funcionais, não por grandes refatorações.

Cada checkpoint deve terminar em:
`teste -> documentação -> diff -> commit`.

## Métrica de progresso
Não medir progresso por quantidade de código escrito. Medir por:
- fluxos operacionais aprovados;
- módulos classificados PRONTO;
- gaps históricos recuperados;
- testes verdes;
- deploy reproduzível.
