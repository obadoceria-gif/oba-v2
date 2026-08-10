/**
 * Producao Model
 * 
 * Representa uma produção de receita (ficha técnica).
 * Registra a produção e controla baixa automática de estoque.
 */

import { v4 as uuidv4 } from 'uuid';

export class Producao {
  /**
   * @param {Object} data - Dados da produção
   * @param {string} [data.id] - ID único
   * @param {string} data.fichaId - ID da ficha técnica
   * @param {number} data.quantidade - Quantidade produzida
   * @param {string} data.unidade - Unidade de medida
   * @param {Date|string} data.dataProducao - Data da produção
   * @param {string} [data.lote] - Número do lote
   * @param {string} [data.observacoes] - Observações
   * @param {string} [data.status] - Status (planejada, em_producao, concluida, cancelada)
   * @param {Array} [data.movimentacoes] - IDs das movimentações de estoque geradas
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.fichaId = data.fichaId;
    this.quantidade = data.quantidade;
    this.unidade = data.unidade;
    this.dataProducao = data.dataProducao instanceof Date 
      ? data.dataProducao 
      : new Date(data.dataProducao);
    this.lote = data.lote || this.gerarLote();
    this.observacoes = data.observacoes || '';
    this.status = data.status || 'planejada';
    this.movimentacoes = data.movimentacoes || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  /**
   * Gera número de lote automático
   * @returns {string} Número do lote
   */
  gerarLote() {
    const data = new Date();
    const ano = data.getFullYear().toString().slice(-2);
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const seq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `L${ano}${mes}${dia}-${seq}`;
  }

  /**
   * Valida os dados da produção
   * @returns {Object} { valid: boolean, errors: Object }
   */
  validate() {
    const errors = {};

    if (!this.fichaId || typeof this.fichaId !== 'string') {
      errors.fichaId = 'Ficha técnica é obrigatória';
    }

    if (!this.quantidade || typeof this.quantidade !== 'number' || this.quantidade <= 0) {
      errors.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (!this.unidade || typeof this.unidade !== 'string') {
      errors.unidade = 'Unidade é obrigatória';
    }

    if (!(this.dataProducao instanceof Date) || isNaN(this.dataProducao.getTime())) {
      errors.dataProducao = 'Data de produção inválida';
    }

    const statusValidos = ['planejada', 'em_producao', 'concluida', 'cancelada'];
    if (!statusValidos.includes(this.status)) {
      errors.status = 'Status inválido';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Converte para objeto simples (para serialização)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      fichaId: this.fichaId,
      quantidade: this.quantidade,
      unidade: this.unidade,
      dataProducao: this.dataProducao.toISOString(),
      lote: this.lote,
      observacoes: this.observacoes,
      status: this.status,
      movimentacoes: this.movimentacoes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Cria instância a partir de objeto simples
   * @param {Object} data - Dados serializados
   * @returns {Producao}
   */
  static fromJSON(data) {
    return new Producao(data);
  }
}
