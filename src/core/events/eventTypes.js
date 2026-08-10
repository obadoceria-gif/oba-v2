/**
 * Event Types - Constantes para todos os eventos do sistema
 * 
 * Organizado por módulo para facilitar manutenção
 * 
 * Requirements: 11.5
 */

// ============================================
// MÓDULO: COMPRAS
// ============================================

/**
 * Disparado quando uma nova compra é criada
 * Payload: { compraId, fornecedor, total, itens }
 */
export const COMPRA_CRIADA = 'COMPRA_CRIADA';

/**
 * Disparado quando uma compra tem status alterado para "recebido"
 * Payload: { compraId, fornecedor, itens: [{ insumoId, quantidade, custoUnitario }] }
 * 
 * Requirements: 2.7, 11.6
 */
export const COMPRA_RECEBIDA = 'COMPRA_RECEBIDA';

/**
 * Disparado quando uma compra é cancelada
 * Payload: { compraId, motivo }
 */
export const COMPRA_CANCELADA = 'COMPRA_CANCELADA';

/**
 * Disparado quando uma compra é atualizada
 * Payload: { compraId, changes }
 */
export const COMPRA_ATUALIZADA = 'COMPRA_ATUALIZADA';

// ============================================
// MÓDULO: PRODUÇÃO
// ============================================

/**
 * Disparado quando uma produção é confirmada
 * Payload: { producaoId, fichaTecnicaId, lotes, insumos: [{ insumoId, quantidade }] }
 * 
 * Requirements: 5.8, 11.7
 */
export const PRODUCAO_CONFIRMADA = 'PRODUCAO_CONFIRMADA';

/**
 * Disparado quando uma produção é criada (mas não confirmada)
 * Payload: { producaoId, fichaTecnicaId, lotes }
 */
export const PRODUCAO_CRIADA = 'PRODUCAO_CRIADA';

/**
 * Disparado quando uma produção é cancelada
 * Payload: { producaoId, motivo }
 */
export const PRODUCAO_CANCELADA = 'PRODUCAO_CANCELADA';

// ============================================
// MÓDULO: ESTOQUE
// ============================================

/**
 * Disparado quando estoque de um insumo fica abaixo do mínimo
 * Payload: { insumoId, nome, quantidadeAtual, estoqueMinimo }
 * 
 * Requirements: 11.8
 */
export const ESTOQUE_BAIXO = 'ESTOQUE_BAIXO';

/**
 * Disparado quando há entrada de estoque
 * Payload: { insumoId, quantidade, custoUnitario, origem }
 */
export const ESTOQUE_ENTRADA = 'ESTOQUE_ENTRADA';

/**
 * Disparado quando há saída de estoque
 * Payload: { insumoId, quantidade, destino }
 */
export const ESTOQUE_SAIDA = 'ESTOQUE_SAIDA';

/**
 * Disparado quando estoque é zerado
 * Payload: { insumoId, nome }
 */
export const ESTOQUE_ZERADO = 'ESTOQUE_ZERADO';

// ============================================
// MÓDULO: INSUMOS
// ============================================

/**
 * Disparado quando um novo insumo é criado
 * Payload: { insumoId, nome, categoria }
 */
export const INSUMO_CRIADO = 'INSUMO_CRIADO';

/**
 * Disparado quando um insumo é atualizado
 * Payload: { insumoId, changes }
 */
export const INSUMO_ATUALIZADO = 'INSUMO_ATUALIZADO';

/**
 * Disparado quando um insumo é excluído
 * Payload: { insumoId, nome }
 */
export const INSUMO_EXCLUIDO = 'INSUMO_EXCLUIDO';

// ============================================
// MÓDULO: FICHAS TÉCNICAS
// ============================================

/**
 * Disparado quando uma ficha técnica é criada
 * Payload: { fichaId, nome, custoLote }
 */
export const FICHA_CRIADA = 'FICHA_CRIADA';

/**
 * Disparado quando uma ficha técnica é atualizada
 * Payload: { fichaId, changes }
 */
export const FICHA_ATUALIZADA = 'FICHA_ATUALIZADA';

/**
 * Disparado quando uma ficha técnica é excluída
 * Payload: { fichaId, nome }
 */
export const FICHA_EXCLUIDA = 'FICHA_EXCLUIDA';

// ============================================
// MÓDULO: FLUXO DE CAIXA
// ============================================

/**
 * Disparado quando um lançamento é criado
 * Payload: { lancamentoId, tipo, valor, categoria }
 */
export const LANCAMENTO_CRIADO = 'LANCAMENTO_CRIADO';

/**
 * Disparado quando um lançamento é atualizado
 * Payload: { lancamentoId, changes }
 */
export const LANCAMENTO_ATUALIZADO = 'LANCAMENTO_ATUALIZADO';

/**
 * Disparado quando um lançamento é excluído
 * Payload: { lancamentoId }
 */
export const LANCAMENTO_EXCLUIDO = 'LANCAMENTO_EXCLUIDO';

/**
 * Disparado quando saldo fica negativo
 * Payload: { saldo, data }
 */
export const SALDO_NEGATIVO = 'SALDO_NEGATIVO';

// ============================================
// MÓDULO: CLIENTES
// ============================================

/**
 * Disparado quando um cliente é criado
 * Payload: { clienteId, nome, telefone }
 */
export const CLIENTE_CRIADO = 'CLIENTE_CRIADO';

/**
 * Disparado quando um cliente é atualizado
 * Payload: { clienteId, changes }
 */
export const CLIENTE_ATUALIZADO = 'CLIENTE_ATUALIZADO';

/**
 * Disparado quando um cliente é excluído
 * Payload: { clienteId, nome }
 */
export const CLIENTE_EXCLUIDO = 'CLIENTE_EXCLUIDO';

// ============================================
// SISTEMA
// ============================================

/**
 * Disparado quando dados são exportados
 * Payload: { timestamp, size }
 */
export const DADOS_EXPORTADOS = 'DADOS_EXPORTADOS';

/**
 * Disparado quando dados são importados
 * Payload: { timestamp, recordsImported }
 */
export const DADOS_IMPORTADOS = 'DADOS_IMPORTADOS';

/**
 * Disparado quando ocorre um erro crítico
 * Payload: { error, context }
 */
export const ERRO_CRITICO = 'ERRO_CRITICO';

/**
 * Disparado quando backup automático é realizado
 * Payload: { timestamp, size }
 */
export const BACKUP_REALIZADO = 'BACKUP_REALIZADO';

// ============================================
// EXPORTAR TODOS OS TIPOS
// ============================================

export const EVENT_TYPES = {
  // Compras
  COMPRA_CRIADA,
  COMPRA_RECEBIDA,
  COMPRA_CANCELADA,
  COMPRA_ATUALIZADA,
  
  // Produção
  PRODUCAO_CONFIRMADA,
  PRODUCAO_CRIADA,
  PRODUCAO_CANCELADA,
  
  // Estoque
  ESTOQUE_BAIXO,
  ESTOQUE_ENTRADA,
  ESTOQUE_SAIDA,
  ESTOQUE_ZERADO,
  
  // Insumos
  INSUMO_CRIADO,
  INSUMO_ATUALIZADO,
  INSUMO_EXCLUIDO,
  
  // Fichas Técnicas
  FICHA_CRIADA,
  FICHA_ATUALIZADA,
  FICHA_EXCLUIDA,
  
  // Fluxo de Caixa
  LANCAMENTO_CRIADO,
  LANCAMENTO_ATUALIZADO,
  LANCAMENTO_EXCLUIDO,
  SALDO_NEGATIVO,
  
  // Clientes
  CLIENTE_CRIADO,
  CLIENTE_ATUALIZADO,
  CLIENTE_EXCLUIDO,
  
  // Sistema
  DADOS_EXPORTADOS,
  DADOS_IMPORTADOS,
  ERRO_CRITICO,
  BACKUP_REALIZADO
};
