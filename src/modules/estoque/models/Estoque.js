/**
 * Estoque Model
 * 
 * Representa o estoque de um insumo no sistema.
 * Gerencia quantidade atual e custo médio ponderado.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import * as validators from '../../../core/validators/validators.js';

export class Estoque {
  constructor(data = {}) {
    this.insumoId = data.insumoId || '';
    this.quantidadeAtual = data.quantidadeAtual || 0;
    this.custoMedioPonderado = data.custoMedioPonderado || 0;
    this.criadoEm = data.criadoEm || new Date().toISOString();
    this.atualizadoEm = data.atualizadoEm || new Date().toISOString();
  }

  adicionarEntrada(quantidade, custoUnitario) {
    if (typeof quantidade !== 'number' || quantidade <= 0) {
      throw new Error('Quantidade deve ser um número positivo');
    }
    if (typeof custoUnitario !== 'number' || custoUnitario < 0) {
      throw new Error('Custo unitário deve ser um número não-negativo');
    }

    if (this.quantidadeAtual === 0) {
      this.custoMedioPonderado = custoUnitario;
      this.quantidadeAtual = quantidade;
    } else {
      const valorAtual = this.quantidadeAtual * this.custoMedioPonderado;
      const valorEntrada = quantidade * custoUnitario;
      const novaQuantidade = this.quantidadeAtual + quantidade;
      this.custoMedioPonderado = Math.round((valorAtual + valorEntrada) / novaQuantidade);
      this.quantidadeAtual = novaQuantidade;
    }
    this.atualizadoEm = new Date().toISOString();
  }

  removerSaida(quantidade) {
    if (typeof quantidade !== 'number' || quantidade <= 0) {
      throw new Error('Quantidade deve ser um número positivo');
    }
    if (quantidade > this.quantidadeAtual) {
      throw new Error(`Estoque insuficiente. Disponível: ${this.quantidadeAtual}, Solicitado: ${quantidade}`);
    }
    this.quantidadeAtual -= quantidade;
    this.atualizadoEm = new Date().toISOString();
  }

  isAbaixoMinimo(estoqueMinimo) {
    return this.quantidadeAtual < estoqueMinimo;
  }

  validate() {
    const rules = {
      insumoId: [validators.required()],
      quantidadeAtual: [validators.required(), validators.numeric(), validators.nonNegative('Quantidade atual deve ser um número não-negativo')],
      custoMedioPonderado: [validators.required(), validators.numeric(), validators.nonNegative('Custo médio ponderado deve ser um número não-negativo')]
    };
    const data = { insumoId: this.insumoId, quantidadeAtual: this.quantidadeAtual, custoMedioPonderado: this.custoMedioPonderado };
    const errors = {};
    let valid = true;
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const result = rule(data[field]);
        if (result !== true) {
          errors[field] = result;
          valid = false;
          break;
        }
      }
    }
    return { valid, errors };
  }

  toJSON() {
    return {
      insumoId: this.insumoId,
      quantidadeAtual: this.quantidadeAtual,
      custoMedioPonderado: this.custoMedioPonderado,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }

  static fromJSON(json) {
    return new Estoque(json);
  }
}
