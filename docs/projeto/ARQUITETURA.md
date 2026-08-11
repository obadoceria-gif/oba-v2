# ARQUITETURA OFICIAL - GESTÃO OBA DOCERIA

Atualizado em: 2026-08-11

## 1. Stack
- JavaScript ES Modules.
- Vite.
- Vitest.
- fast-check.
- UUID.
- IndexedDB/localStorage por adaptadores do Core.

## 2. Pontos de entrada
- `src/main.js`: inicialização da aplicação.
- `src/App.js`: composição, controllers, menu, navegação e montagem das views.
- `src/core/`: infraestrutura compartilhada.
- `src/modules/`: domínios funcionais.

## 3. Padrão predominante por módulo
`View -> Controller -> Service -> Repository/Model -> Storage`

Nem todo módulo utiliza todas as camadas da mesma forma, mas essa é a arquitetura alvo a preservar.

## 4. Core confirmado
- `core/events/`: EventBus e tipos de eventos;
- `core/state/`: StateManager e slices;
- `core/storage/`: adapters de IndexedDB/localStorage;
- `core/ui/`: Modal, Loading, Toast e CSS compartilhado;
- `core/validators/`: validação;
- `core/utils/`: formatação de moeda, data e valores;
- `core/filters/`: busca/filtros;
- `core/reports/`: geração/templates de relatórios.

## 5. Módulos ativos conectados ao App
A inspeção dos imports e `switch` de navegação de `src/App.js` confirma:
- Dashboard;
- Insumos;
- Estoque;
- Compras;
- Fornecedores;
- Fichas Técnicas;
- Produção.

Esses são os únicos módulos considerados ativos até nova integração explícita.

## 6. Estado sem módulo navegável
O estado central contém estruturas como `clientes` e `pedidos`. Isso representa preparação/legado de integração, não prova de módulo concluído.

Qualquer novo domínio só será classificado como ativo quando houver, no mínimo:
- rota/menu ou entrada equivalente;
- view montável;
- controller/serviço necessário;
- persistência coerente;
- fluxo funcional testável.

## 7. Referências externas à arquitetura ativa
### Produção/histórico
Usar para recuperar comportamento, UX, regras e fluxos já implementados.

### `oba_doceria`
Sistema monolítico histórico. Não migrar o HTML inteiro para a base modular. Extrair somente regras, estruturas de dados, validações, textos e padrões de interação úteis.

### `Projeto_GPT_Plus`
Outra tentativa de modularização. Pode fornecer trechos mais fáceis de adaptar que o HTML monolítico, mas não volta a ser base ativa.

## 8. Regra para recuperação de funcionalidade
1. identificar comportamento da referência;
2. localizar dados e regras envolvidos;
3. mapear para o domínio modular correto;
4. implementar/adaptar sem quebrar contratos existentes;
5. criar/atualizar testes;
6. integrar ao `App.js` somente quando o fluxo estiver consistente.

## 9. Integrações críticas
Arquitetura deve suportar e testar:
- Compras -> Estoque;
- Estoque -> Fichas Técnicas;
- Fichas Técnicas -> Produção;
- Produção -> Estoque;
- futuros Clientes/Pedidos/Vendas -> Financeiro;
- Backup -> restauração de todas as coleções necessárias.

## 10. Código alternativo e órfão
Arquivos `.bak`, `*_CORRIGIDO.*`, standalones e diagnósticos não são código oficial por padrão.

Regra:
- descobrir o arquivo realmente importado;
- comparar versão alternativa;
- recuperar somente diferenças úteis;
- remover da árvore oficial apenas após backup e commit seguro.

Exemplos atualmente observados:
- `src/core/ui/Modal.js.bak`;
- `src/modules/fornecedores/views/FornecedoresView.js.bak`;
- `src/modules/fornecedores/views/FornecedoresView_CORRIGIDO.js`.

## 11. Arquitetura de entrega alvo
`GitHub (fonte oficial) -> Cloudflare Pages (deploy automático) -> produção`

Desenvolvimento local deixa de ser fonte única. Qualquer máquina poderá clonar o repositório e continuar o trabalho.
