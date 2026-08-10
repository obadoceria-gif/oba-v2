/**
 * FichaTecnica Model
 * 
 * Representa uma ficha técnica (receita) no sistema.
 * Contém lista de insumos necessários e métodos para calcular custos.
 * 
 * Requirements: 4.1, 4.6, 4.7
 */

import * as validators from '../../../core/validators/validators.js';

export class FichaTecnica {
  /**
   * Cria uma nova instância de FichaTecnica
   * @param {Object} data - Dados da ficha técnica
   * @param {string} data.id - ID único da ficha técnica
   * @param {string} data.nome - Nome da receita
   * @param {Array<Object>} data.insumos - Lista de insumos necessários
   * @param {number} data.rendimento - Quantidade produzida por lote
   * @param {string} data.unidadeRendimento - Unidade do rendimento (kg, unidades, etc)
   * @param {string} data.modoPreparo - Instruções de preparo
   */
  constructor(data = {}) {
    this.id = data.id || '';
    this.nome = data.nome || '';
    this.insumos = data.insumos || []; // [{insumoId, quantidade}]
    this.rendimento = data.rendimento || 0;
    this.unidadeRendimento = data.unidadeRendimento || '';
    this.modoPreparo = data.modoPreparo || '';
    
    // Metadata
    this.criadoEm = data.criadoEm || new Date().toISOString();
    this.atualizadoEm = data.atualizadoEm || new Date().toISOString();
  }

  /**
   * Calcula o custo total de um lote usando os custos atuais do estoque
   * @param {Map<string, Object>} estoqueMap - Map de insumoId -> {custoMedioPonderado}
   * @returns {number} Custo total do lote em centavos
   * 
   * Requirements: 4.6
   */
  calculateCustoLote(estoqueMap) {
    if (!estoqueMap || !(estoqueMap instanceof Map)) {
      throw new Error('estoqueMap deve ser um Map válido');
    }

    let custoTotal = 0;

    for (const item of this.insumos) {
      const estoque = estoqueMap.get(item.insumoId);
      
      if (!estoque) {
        throw new Error(`Insumo ${item.insumoId} não encontrado no estoque`);
      }

      const custoItem = item.quantidade * estoque.custoMedioPonderado;
      custoTotal += custoItem;
    }

    return Math.round(custoTotal);
  }

  /**
   * Calcula o custo unitário (por unidade de rendimento)
   * @param {Map<string, Object>} estoqueMap - Map de insumoId -> {custoMedioPonderado}
   * @returns {number} Custo unitário em centavos
   * 
   * Requirements: 4.7
   */
  calculateCustoUnitario(estoqueMap) {
    if (this.rendimento <= 0) {
      throw new Error('Rendimento deve ser maior que zero para calcular custo unitário');
    }

    const custoLote = this.calculateCustoLote(estoqueMap);
    return Math.round(custoLote / this.rendimento);
  }

  /**
   * Valida os dados da ficha técnica
   * @returns {{valid: boolean, errors: Object}} Resultado da validação
   * 
   * Requirements: 4.2, 4.3, 4.4, 4.5
   */
  validate() {
    const rules = {
      nome: [validators.required()],
      rendimento: [
        validators.required(),
        validators.numeric(),
        validators.positive('Rendimento deve ser um número positivo')
      ],
      unidadeRendimento: [validators.required()],
      insumos: [
        validators.required(),
        (value) => {
          if (!Array.isArray(value)) {
            return 'Insumos deve ser uma lista';
          }
          if (value.length === 0) {
            return 'Ficha técnica deve ter pelo menos um insumo';
          }
          return true;
        }
      ]
    };

    const data = {
      nome: this.nome,
      rendimento: this.rendimento,
      unidadeRendimento: this.unidadeRendimento,
      insumos: this.insumos
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

    // Validar cada insumo individualmente
    if (Array.isArray(this.insumos)) {
      const insumoErrors = [];
      
      for (let i = 0; i < this.insumos.length; i++) {
        const insumo = this.insumos[i];
        const insumoError = {};
        
        if (!insumo.insumoId) {
          insumoError.insumoId = 'ID do insumo é obrigatório';
        }
        
        if (typeof insumo.quantidade !== 'number' || insumo.quantidade <= 0) {
          insumoError.quantidade = 'Quantidade deve ser um número positivo';
        }
        
        if (Object.keys(insumoError).length > 0) {
          insumoErrors[i] = insumoError;
          valid = false;
        }
      }
      
      if (insumoErrors.length > 0) {
        errors.insumos = insumoErrors;
      }
    }

    return { valid, errors };
  }

  /**
   * Converte a ficha técnica para objeto JSON
   * @returns {Object} Representação JSON da ficha técnica
   * 
   * Requirements: 4.13
   */
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      insumos: this.insumos.map(i => ({
        insumoId: i.insumoId,
        quantidade: i.quantidade
      })),
      rendimento: this.rendimento,
      unidadeRendimento: this.unidadeRendimento,
      modoPreparo: this.modoPreparo,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }

  /**
   * Cria uma instância de FichaTecnica a partir de dados JSON
   * @param {Object} json - Dados JSON
   * @returns {FichaTecnica} Nova instância de FichaTecnica
   */
  static fromJSON(json) {
    return new FichaTecnica(json);
  }
}
