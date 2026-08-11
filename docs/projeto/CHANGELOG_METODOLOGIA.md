# CHANGELOG DE METODOLOGIA - GESTÃO OBA DOCERIA

## 2026-08-11 - Estratégia de recuperação e finalização acelerada
- Mantido `oba-v2` como única base ativa de desenvolvimento.
- `oba_doceria`/V90/Vxx passou a ser referência funcional histórica prioritária.
- `Projeto_GPT_Plus` passou a ser referência auxiliar, sem desenvolvimento paralelo.
- A versão publicada/capturada passou a ser referência visual/funcional para evitar regressão de UX.
- Abandonada a estratégia de reconstruir módulos sem antes procurar implementações existentes.
- Definido que presença textual em código não significa funcionalidade concluída.
- Confirmados como módulos ativos no `App.js`: Dashboard, Insumos, Estoque, Compras, Fornecedores, Fichas Técnicas e Produção.
- Funcionalidades como Clientes, Pedidos/Encomendas, Vendas, Financeiro, Cartões, Relatórios completos e Backup completo passam por validação/recuperação antes de nova implementação.
- Financeiro foi identificado como gap claro na primeira matriz comparativa.
- Priorização passou a P0/P1/P2, evitando que polimento visual P2 bloqueie operação real.
- ZIP completo deixou de ser mecanismo padrão para pequenas alterações; patches e scripts incrementais são preferidos.
- Definido alvo de entrega: `oba-v2 -> GitHub -> Cloudflare Pages -> produção`.
- Criado plano de finalização por gates, com critérios explícitos de saída.

## 2026-08-10 - Consolidação da governança
- `oba-v2` definido como base oficial de desenvolvimento.
- `Projeto_GPT_Plus` mantido como referência.
- Criada baseline externa antes de novas mudanças.
- Git local inicializado.
- Inventário do código ativo realizado.
- Classificação dos arquivos históricos iniciada.
- Documentação estratégica antiga auditada.
- Adotada a regra: código executável atual e testes são a principal fonte técnica da verdade.
- Adotada a regra: não recriar funcionalidade sem pesquisar implementações existentes.
- Adotada a regra: automatizar tarefas repetitivas sempre que seguro.
- Adotada a regra: alterações manuais devem informar arquivo e intervalo de linhas.
- Adotada documentação canônica em `docs/projeto/`.

## Como atualizar este arquivo
Adicionar uma seção datada sempre que houver mudança relevante em:
- base oficial;
- estratégia de desenvolvimento;
- arquitetura;
- política de testes;
- Git/deploy;
- documentação;
- critérios de priorização;
- automação.
