/**
 * MovimentacoesRepository
 * 
 * Repositório para gerenciar persistência de movimentações de estoque.
 * 
 * Requirements:
 * - 3.11: Histórico de movimentações
 */

import { Movimentacao } from '../models/Movimentacao.js';

export class MovimentacoesRepository {
  /**
   * @param {StorageAdapter} storage - Adaptador de storage
   * @param {StateManager} stateManager - Gerenciador de estado
   */
  constructor(storage, stateManager) {
    if (!storage) {
      throw new Error('Storage é obrigatório');
    }
    if (!stateManager) {
      throw new Error('StateManager é obrigatório');
    }

    this.storage = storage;
    this.stateManager = stateManager;
    this.storeName = 'movimentacoes';
  }

  /**
   * Salva uma nova movimentação
   * @param {Movimentacao} movimentacao - Movimentação a salvar
   * @returns {Promise<Movimentacao>}
   */
  async save(movimentacao) {
    if (!(movimentacao instanceof Movimentacao)) {
      throw new Error('Movimentacao inválida');
    }

    // Salvar no storage
    await this.storage.save(this.storeName, movimentacao.id, movimentacao.toJSON());

    // Atualizar state
    await this._updateState();

    return movimentacao;
  }

  /**
   * Busca movimentação por ID
   * @param {string} id - ID da movimentação
   * @returns {Promise<Movimentacao|null>}
   */
  async getById(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    const data = await this.storage.get(this.storeName, id);
    
    if (!data) {
      return null;
    }

    return Movimentacao.fromJSON(data);
  }

  /**
   * Busca movimentações por ID do insumo
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<Movimentacao[]>}
   */
  async getByInsumoId(insumoId) {
    if (!insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    const allMovimentacoes = await this.getAll();
    
    return allMovimentacoes.filter(mov => mov.insumoId === insumoId);
  }

  /**
   * Retorna todas as movimentações
   * @returns {Promise<Movimentacao[]>}
   */
  async getAll() {
    const allData = await this.storage.getAll(this.storeName);
    return allData.map(data => Movimentacao.fromJSON(data));
  }

  /**
   * Busca movimentações com filtros
   * @param {Object} filters - Filtros
   * @param {string} filters.insumoId - Filtrar por insumo
   * @param {string} filters.tipo - Filtrar por tipo (entrada/saida)
   * @param {string} filters.origem - Filtrar por origem
   * @returns {Promise<Movimentacao[]>}
   */
  async findByFilters(filters = {}) {
    let movimentacoes = await this.getAll();

    if (filters.insumoId) {
      movimentacoes = movimentacoes.filter(mov => mov.insumoId === filters.insumoId);
    }

    if (filters.tipo) {
      movimentacoes = movimentacoes.filter(mov => mov.tipo === filters.tipo);
    }

    if (filters.origem) {
      movimentacoes = movimentacoes.filter(mov => mov.origem === filters.origem);
    }

    return movimentacoes;
  }

  /**
   * Remove uma movimentação
   * @param {string} id - ID da movimentação
   * @returns {Promise<void>}
   */
  async delete(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    await this.storage.delete(this.storeName, id);

    // Atualizar state
    await this._updateState();
  }

  /**
   * Atualiza o state com todas as movimentações
   * @private
   */
  async _updateState() {
    const allMovimentacoes = await this.getAll();
    
    // Converter para array de objetos JSON
    const movimentacoesArray = allMovimentacoes.map(mov => mov.toJSON());

    this.stateManager.setState('movimentacoes', movimentacoesArray);
  }
}
