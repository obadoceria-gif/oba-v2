/**
 * Insumo Model
 * 
 * Representa um insumo (ingrediente/matéria-prima) no sistema.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import * as validators from '../../../core/validators/validators.js';

export class Insumo {
  /**
   * Cria uma nova instância de Insumo
   * @param {Object} data - Dados do insumo
   * @param {string} data.id - ID único do insumo
   * @param {string} data.nome - Nome do insumo
   * @param {string} data.unidade - Unidade de medida (kg, g, L, ml, un)
   * @param {number} data.custoUnitario - Custo unitário em centavos
   * @param {string} [data.marca] - Marca do insumo
   * @param {number} [data.quantidadePorEmbalagem] - Quantidade por embalagem
   * @param {string} [data.fornecedor] - Nome do fornecedor
   * @param {number} [data.estoqueMinimo] - Estoque mínimo em unidades
   * @param {string} [data.observacoes] - Observações adicionais
   */
  constructor(data = {}) {
    this.id = data.id || '';
    // Trim automático no nome para evitar espaços em branco
    this.nome = (data.nome || '').trim();
    this.unidade = data.unidade || '';
    this.custoUnitario = data.custoUnitario || 0;
    this.marca = (data.marca || '').trim();
    this.quantidadePorEmbalagem = data.quantidadePorEmbalagem || 0;
    this.fornecedor = (data.fornecedor || '').trim();
    this.estoqueMinimo = data.estoqueMinimo || 0;
    this.observacoes = (data.observacoes || '').trim();
    
    // Metadata
    this.criadoEm = data.criadoEm || new Date().toISOString();
    this.atualizadoEm = data.atualizadoEm || new Date().toISOString();
  }

  /**
   * Valida os dados do insumo
   * @returns {{valid: boolean, errors: Object}} Resultado da validação
   * 
   * Requirements: 1.2, 1.3, 1.4, 1.5
   */
  validate() {
    const rules = {
      id: [validators.required()],
      nome: [
        validators.required(),
        validators.minLength(2),
        validators.maxLength(100),
        validators.alphanumeric('Nome deve conter apenas letras, números, espaços, hífens e underscores')
      ],
      unidade: [
        validators.required(),
        validators.oneOf(['kg', 'g', 'L', 'ml', 'un'])
      ],
      custoUnitario: [
        validators.required(),
        validators.numeric(),
        validators.nonNegative('Custo unitário deve ser um número não-negativo')
      ],
      estoqueMinimo: [
        validators.numeric(),
        validators.nonNegative()
      ],
      quantidadePorEmbalagem: [
        validators.numeric(),
        validators.nonNegative()
      ]
    };

    const data = {
      id: this.id,
      nome: this.nome,
      unidade: this.unidade,
      custoUnitario: this.custoUnitario,
      marca: this.marca,
      quantidadePorEmbalagem: this.quantidadePorEmbalagem,
      estoqueMinimo: this.estoqueMinimo
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
          break; // Primeira erro por campo
        }
      }
    }

    return { valid, errors };
  }

  /**
   * Converte o insumo para objeto JSON
   * @returns {Object} Representação JSON do insumo
   * 
   * Requirements: 1.1
   */
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      unidade: this.unidade,
      custoUnitario: this.custoUnitario,
      marca: this.marca,
      quantidadePorEmbalagem: this.quantidadePorEmbalagem,
      fornecedor: this.fornecedor,
      estoqueMinimo: this.estoqueMinimo,
      observacoes: this.observacoes,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }

  /**
   * Cria uma instância de Insumo a partir de dados JSON
   * @param {Object} json - Dados JSON
   * @returns {Insumo} Nova instância de Insumo
   */
  static fromJSON(json) {
    return new Insumo(json);
  }

  /**
   * Atualiza os dados do insumo
   * @param {Object} data - Dados a serem atualizados
   */
  update(data) {
    if (data.nome !== undefined) this.nome = data.nome.trim();
    if (data.unidade !== undefined) this.unidade = data.unidade;
    if (data.custoUnitario !== undefined) this.custoUnitario = data.custoUnitario;
    if (data.marca !== undefined) this.marca = data.marca.trim();
    if (data.quantidadePorEmbalagem !== undefined) this.quantidadePorEmbalagem = data.quantidadePorEmbalagem;
    if (data.fornecedor !== undefined) this.fornecedor = data.fornecedor.trim();
    if (data.estoqueMinimo !== undefined) this.estoqueMinimo = data.estoqueMinimo;
    if (data.observacoes !== undefined) this.observacoes = data.observacoes.trim();
    
    this.atualizadoEm = new Date().toISOString();
  }
}
