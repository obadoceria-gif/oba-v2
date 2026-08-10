/**
 * Movimentacao Model
 * 
 * Representa uma movimentação de estoque (entrada ou saída).
 * Registra todas as alterações no estoque com rastreabilidade completa.
 * 
 * Requirements: 3.8
 */

import * as validators from '../../../core/validators/validators.js';

export class Movimentacao {
  /**
   * Cria uma nova instância de Movimentacao
   * @param {Object} data - Dados da movimentação
   * @param {string} data.id - ID único da movimentação
   * @param {string} data.insumoId - ID do insumo
   * @param {string} data.tipo - Tipo da movimentação ('entrada' ou 'saida')
   * @param {number} data.quantidade - Quantidade movimentada
   * @param {number} data.custoUnitario - Custo unitário em centavos
   * @param {string} data.data - Data da movimentação (ISO 8601)
   * @param {string} data.origem - Origem da movimentação ('compra', 'producao', 'ajuste')
   * @param {string} [data.origemId] - ID da origem (compra-id, producao-id, etc)
   * @param {string} [data.observacoes] - Observações adicionais
   */
  constructor(data = {}) {
    this.id = data.id || '';
    this.insumoId = data.insumoId || '';
    this.tipo = data.tipo || '';
    this.quantidade = data.quantidade || 0;
    this.custoUnitario = data.custoUnitario || 0;
    this.data = data.data || new Date().toISOString();
    this.origem = data.origem || '';
    this.origemId = data.origemId || null;
    this.observacoes = data.observacoes || '';
    
    // Metadata
    this.criadoEm = data.criadoEm || new Date().toISOString();
  }

  /**
   * Calcula o valor total da movimentação
   * @returns {number} Total em centavos (quantidade * custoUnitario)
   * 
   * Requirements: 3.8
   */
  calculateTotal() {
    return this.quantidade * this.custoUnitario;
  }

  /**
   * Valida os dados da movimentação
   * @returns {{valid: boolean, errors: Object}} Resultado da validação
   * 
   * Requirements: 3.8
   */
  validate() {
    const rules = {
      id: [validators.required()],
      insumoId: [
        validators.required('ID do insumo é obrigatório')
      ],
      tipo: [
        validators.required(),
        validators.oneOf(['entrada', 'saida'], 'Tipo deve ser "entrada" ou "saida"')
      ],
      quantidade: [
        validators.required(),
        validators.numeric(),
        validators.positive('Quantidade deve ser um número positivo')
      ],
      custoUnitario: [
        validators.required(),
        validators.numeric(),
        validators.nonNegative('Custo unitário deve ser um número não-negativo')
      ],
      data: [
        validators.required(),
        validators.date()
      ],
      origem: [
        validators.required('Origem é obrigatória'),
        validators.oneOf(['compra', 'producao', 'ajuste'])
      ]
    };

    const data = {
      id: this.id,
      insumoId: this.insumoId,
      tipo: this.tipo,
      quantidade: this.quantidade,
      custoUnitario: this.custoUnitario,
      data: this.data,
      origem: this.origem
    };

    // Validar usando as regras
    const errors = {};
    let valid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const result = rule(data[field]);
        if (result !== true) {
          errors[field] = result;
          valid = false;
          break; // Primeiro erro por campo
        }
      }
    }

    return { valid, errors };
  }

  /**
   * Converte a movimentação para objeto JSON
   * @returns {Object} Representação JSON da movimentação
   * 
   * Requirements: 3.8
   */
  toJSON() {
    return {
      id: this.id,
      insumoId: this.insumoId,
      tipo: this.tipo,
      quantidade: this.quantidade,
      custoUnitario: this.custoUnitario,
      origem: this.origem,
      origemId: this.origemId,
      observacoes: this.observacoes,
      criadoEm: this.criadoEm
    };
  }

  /**
   * Cria uma instância de Movimentacao a partir de dados JSON
   * @param {Object} json - Dados JSON
   * @returns {Movimentacao} Nova instância de Movimentacao
   */
  static fromJSON(json) {
    return new Movimentacao(json);
  }
}
