/**
 * State Slices - Definição da estrutura inicial do estado da aplicação
 * 
 * Cada slice representa um módulo funcional do sistema.
 * A estrutura é definida aqui para garantir consistência.
 * 
 * Requirement: 10.2
 */

/**
 * Estado inicial da aplicação
 * Cada slice é um array vazio que será populado com dados
 */
export const initialState = {
  // Módulo Insumos
  insumos: [],
  // Estrutura de cada insumo:
  // {
  //   id: string,
  //   nome: string,
  //   unidade: string ('kg', 'g', 'L', 'ml', 'un'),
  //   custoPadrao: number (em centavos),
  //   fornecedorPadrao: string,
  //   categoria: string,
  //   estoqueMinimo: number,
  //   createdAt: string (ISO 8601),
  //   updatedAt: string (ISO 8601)
  // }

  // Módulo Compras
  compras: [],
  // Estrutura de cada compra:
  // {
  //   id: string,
  //   fornecedor: string,
  //   data: string (ISO 8601),
  //   status: string ('pendente', 'recebido', 'cancelado'),
  //   itens: [
  //     {
  //       insumoId: string,
  //       quantidade: number,
  //       custoUnitario: number (em centavos)
  //     }
  //   ],
  //   total: number (em centavos),
  //   observacoes: string,
  //   createdAt: string (ISO 8601),
  //   updatedAt: string (ISO 8601)
  // }

  // Módulo Estoque
  estoque: [],
  // Estrutura de cada registro de estoque:
  // {
  //   id: string,
  //   insumoId: string,
  //   quantidadeAtual: number,
  //   custoMedioPonderado: number (em centavos),
  //   updatedAt: string (ISO 8601)
  // }

  // Histórico de movimentações de estoque
  movimentacoes: [],
  // Estrutura de cada movimentação:
  // {
  //   id: string,
  //   insumoId: string,
  //   tipo: string ('entrada', 'saida'),
  //   quantidade: number,
  //   custoUnitario: number (em centavos),
  //   origem: string ('compra', 'producao', 'ajuste'),
  //   origemId: string (ID da compra/produção),
  //   data: string (ISO 8601),
  //   observacoes: string
  // }

  // Módulo Fichas Técnicas
  fichas: [],
  // Estrutura de cada ficha técnica:
  // {
  //   id: string,
  //   nome: string,
  //   categoria: string,
  //   rendimento: {
  //     quantidade: number,
  //     unidade: string
  //   },
  //   insumos: [
  //     {
  //       insumoId: string,
  //       quantidade: number
  //     }
  //   ],
  //   modoPreparo: string,
  //   tempoPreparo: number (em minutos),
  //   observacoes: string,
  //   createdAt: string (ISO 8601),
  //   updatedAt: string (ISO 8601)
  // }

  // Módulo Produção
  producoes: [],
  // Estrutura de cada produção:
  // {
  //   id: string,
  //   fichaTecnicaId: string,
  //   lotes: number,
  //   data: string (ISO 8601),
  //   status: string ('planejada', 'confirmada', 'cancelada'),
  //   quantidadeProduzida: number,
  //   custoTotal: number (em centavos),
  //   observacoes: string,
  //   createdAt: string (ISO 8601),
  //   updatedAt: string (ISO 8601)
  // }

  // Módulo Fluxo de Caixa
  lancamentos: [],
  // Estrutura de cada lançamento:
  // {
  //   id: string,
  //   tipo: string ('receita', 'despesa'),
  //   categoria: string,
  //   descricao: string,
  //   valor: number (em centavos),
  //   data: string (ISO 8601),
  //   formaPagamento: string,
  //   origem: string ('compra', 'venda', 'manual'),
  //   origemId: string,
  //   observacoes: string,
  //   createdAt: string (ISO 8601)
  // }

  // Módulo Clientes
  clientes: []
  // Estrutura de cada cliente:
  // {
  //   id: string,
  //   nome: string,
  //   telefone: string,
  //   email: string,
  //   endereco: {
  //     rua: string,
  //     numero: string,
  //     complemento: string,
  //     bairro: string,
  //     cidade: string,
  //     estado: string,
  //     cep: string
  //   },
  //   observacoes: string,
  //   createdAt: string (ISO 8601),
  //   updatedAt: string (ISO 8601)
  // }
};

/**
 * Nomes das fatias de estado
 * Útil para validação e iteração
 */
export const SLICE_NAMES = [
  'insumos',
  'compras',
  'fornecedores',
  'estoque',
  'movimentacoes',
  'fichas',
  'clientes',
  'pedidos'
];

/**
 * Cria uma cópia limpa do estado inicial
 * @returns {Object} Estado inicial
 */
export function createInitialState() {
  return {
    insumos: [],
    compras: [],
    fornecedores: [],
    estoque: [],
    movimentacoes: [],
    fichas: [],
    clientes: [],
    pedidos: []
  };
}
