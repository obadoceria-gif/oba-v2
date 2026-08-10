/**
 * Modelo de Compra
 * Representa uma compra de insumos de um fornecedor
 */

// Funções auxiliares de validação
const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

const validatePositiveNumber = (value) => {
  return typeof value === 'number' && value > 0 && !isNaN(value);
};

const validateEnum = (value, options) => {
  return options.includes(value);
};

const validateArray = (value) => {
  return Array.isArray(value);
};

/**
 * @typedef {Object} ItemCompra
 * @property {string} insumoId - ID do insumo
 * @property {number} quantidade - Quantidade comprada
 * @property {number} custoUnitario - Custo unitário do insumo
 * @property {number} subtotal - Subtotal do item (quantidade * custoUnitario)
 */

/**
 * @typedef {Object} CompraData
 * @property {string} [id] - ID único da compra
 * @property {string} fornecedorId - ID do fornecedor
 * @property {ItemCompra[]} insumos - Lista de insumos comprados
 * @property {string} formaPagamento - Forma de pagamento
 * @property {number} valorTotal - Valor total da compra
 * @property {string} [observacoes] - Observações sobre a compra
 * @property {string} [status] - Status da compra
 * @property {string} [criadoEm] - Data de criação (ISO)
 * @property {string} [atualizadoEm] - Data de atualização (ISO)
 */

export class Compra {
  /**
   * Cria uma nova instância de Compra
   * @param {CompraData} data - Dados da compra
   */
  constructor(data) {
    this.id = data.id || this.generateId();
    this.fornecedorId = data.fornecedorId;
    this.insumos = data.insumos || [];
    this.formaPagamento = data.formaPagamento;
    this.valorTotal = data.valorTotal;
    this.observacoes = data.observacoes || '';
    this.status = data.status || 'pendente';
    this.criadoEm = data.criadoEm || new Date().toISOString();
    this.atualizadoEm = data.atualizadoEm || new Date().toISOString();

    this.validate();
  }

  /**
   * Gera um ID único para a compra
   * @returns {string} ID único
   */
  generateId() {
    return `compra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida os dados da compra
   * @throws {Error} Se os dados forem inválidos
   */
  validate() {
    const errors = [];

    // Validar fornecedorId
    if (!validateRequired(this.fornecedorId)) {
      errors.push('fornecedorId é obrigatório');
    }

    // Validar insumos
    if (!validateArray(this.insumos) || this.insumos.length === 0) {
      errors.push('insumos deve ser um array não vazio');
    } else {
      // Validar cada item de insumo
      this.insumos.forEach((item, index) => {
        if (!validateRequired(item.insumoId)) {
          errors.push(`insumos[${index}].insumoId é obrigatório`);
        }
        if (!validatePositiveNumber(item.quantidade)) {
          errors.push(`insumos[${index}].quantidade deve ser um número positivo`);
        }
        if (!validatePositiveNumber(item.custoUnitario)) {
          errors.push(`insumos[${index}].custoUnitario deve ser um número positivo`);
        }
        if (!validatePositiveNumber(item.subtotal)) {
          errors.push(`insumos[${index}].subtotal deve ser um número positivo`);
        }
        
        // Validar cálculo do subtotal
        const subtotalCalculado = item.quantidade * item.custoUnitario;
        if (Math.abs(item.subtotal - subtotalCalculado) > 0.01) {
          errors.push(`insumos[${index}].subtotal não corresponde ao cálculo (quantidade * custoUnitario)`);
        }
      });
    }

    // Validar formaPagamento
    const formasPagamentoValidas = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito'];
    if (!validateEnum(this.formaPagamento, formasPagamentoValidas)) {
      errors.push(`formaPagamento deve ser um dos seguintes: ${formasPagamentoValidas.join(', ')}`);
    }

    // Validar valorTotal
    if (!validatePositiveNumber(this.valorTotal)) {
      errors.push('valorTotal deve ser um número positivo');
    }

    // Validar que valorTotal corresponde à soma dos subtotais
    if (this.insumos.length > 0) {
      const somaSubtotais = this.insumos.reduce((sum, item) => sum + item.subtotal, 0);
      if (Math.abs(this.valorTotal - somaSubtotais) > 0.01) {
        errors.push('valorTotal não corresponde à soma dos subtotais dos insumos');
      }
    }

    // Validar status
    const statusValidos = ['pendente', 'concluida', 'cancelada'];
    if (!validateEnum(this.status, statusValidos)) {
      errors.push(`status deve ser um dos seguintes: ${statusValidos.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validação falhou: ${errors.join('; ')}`);
    }
  }

  /**
   * Atualiza a data de modificação
   */
  touch() {
    this.atualizadoEm = new Date().toISOString();
  }

  /**
   * Converte a compra para objeto simples
   * @returns {CompraData} Objeto com os dados da compra
   */
  toJSON() {
    return {
      id: this.id,
      fornecedorId: this.fornecedorId,
      insumos: this.insumos,
      formaPagamento: this.formaPagamento,
      valorTotal: this.valorTotal,
      observacoes: this.observacoes,
      status: this.status,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }

  /**
   * Cria uma instância de Compra a partir de um objeto
   * @param {CompraData} data - Dados da compra
   * @returns {Compra} Nova instância de Compra
   */
  static fromJSON(data) {
    return new Compra(data);
  }

  /**
   * Calcula o valor total a partir dos insumos
   * @param {ItemCompra[]} insumos - Lista de insumos
   * @returns {number} Valor total calculado
   */
  static calcularValorTotal(insumos) {
    return insumos.reduce((sum, item) => sum + item.subtotal, 0);
  }

  /**
   * Calcula o subtotal de um item
   * @param {number} quantidade - Quantidade do item
   * @param {number} custoUnitario - Custo unitário do item
   * @returns {number} Subtotal calculado
   */
  static calcularSubtotal(quantidade, custoUnitario) {
    return quantidade * custoUnitario;
  }
}
