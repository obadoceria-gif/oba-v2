# ARQUITETURA OFICIAL - GESTAO OBA DOCERIA

Atualizado em: 2026-08-10

## 1. Stack confirmada
- JavaScript ES Modules.
- Vite.
- Vitest.
- fast-check para property-based tests.
- IndexedDB e localStorage como mecanismos de persistencia existentes no Core.
- UUID como dependencia.

## 2. Estrutura principal
`src/App.js` orquestra a aplicacao.
`src/main.js` e o ponto de entrada.
`src/core/` concentra infraestrutura compartilhada.
`src/modules/` concentra dominios funcionais.

## 3. Camadas
O padrao predominante dos modulos e:
View -> Controller -> Service -> Model/Repository -> Storage

Componentes de UI reutilizaveis ficam em `components/`.
Estilos especificos ficam em `styles/`.

## 4. Core confirmado
- `core/events/`: EventBus e tipos de eventos.
- `core/state/`: StateManager e slices.
- `core/storage/`: IndexedDBAdapter, LocalStorageAdapter e StorageAdapter.
- `core/ui/`: Loading, Modal, Toast e CSS compartilhado.
- `core/validators/`: validadores e motor de validacao.
- `core/utils/`: moeda, data e formatacao.
- `core/filters/`: busca e filtros.
- `core/reports/`: infraestrutura de relatorios.

## 5. Modulos presentes no codigo atual
- Dashboard.
- Insumos.
- Compras.
- Estoque.
- Fichas Tecnicas.
- Fornecedores.
- Producao.

Modulos citados apenas em documentos antigos nao serao considerados implementados ate aparecerem no codigo atual ou serem recuperados de outra fonte verificada.

## 6. Fluxo de dados esperado
Acao do usuario -> View -> Controller -> Service -> Repository -> Storage.
EventBus e StateManager podem participar da sincronizacao entre partes da aplicacao.

## 7. Regra de evolucao
Nao remover camadas ou reestruturar a arquitetura apenas para corrigir um bug local.
Simplificacoes arquiteturais exigem decisao registrada, teste de impacto e plano de migracao.

## 8. Arquivos alternativos
Arquivos `.bak`, `*_CORRIGIDO.*`, diagnosticos e standalones nao sao considerados codigo ativo por padrao.
O arquivo ativo e o importado pela aplicacao executada; a confirmacao deve ser feita por imports, rotas e comportamento em runtime.
