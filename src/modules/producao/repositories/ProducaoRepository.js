/**
 * ProducaoRepository
 * 
 * Gerencia persistência de produções no storage.
 */

import { Producao } from '../models/Producao.js';

export class ProducaoRepository {
  /**
   * @param {StorageAdapter} storage - Adaptador de storage
   * @param {StateManager} stateManager - Gerenciador de estado
   */
  constructor(storage, stateManager) {
    this.storage = storage;
    this.stateManager = stateManager;
    this.storeName = 'producoes';
  }

  /**
   * Salva produção
   * @param {Producao} producao - Produção a salvar
   * @returns {Promise<Producao>}
   */
  async save(producao) {
    if (!(producao instanceof Producao)) {
      throw new Error('Deve ser uma instância de Producao');
    }

    const validation = producao.validate();
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${JSON.stringify(validation.errors)}`);
    }

    producao.updatedAt = new Date();

    // Atualizar no state manager
    const producoes = this.stateManager.getState('producoes') || [];
    const index = producoes.findIndex(p => p.id === producao.id);
    
    if (index >= 0) {
      producoes[index] = producao.toJSON();
    } else {
      producoes.push(producao.toJSON());
    }

    this.stateManager.setState('producoes', producoes);

    return producao;
  }

  /**
   * Busca produção por ID
   * @param {string} id - ID da produção
   * @returns {Promise<Producao|null>}
   */
  async findById(id) {
    const producoes = this.stateManager.getState('producoes') || [];
    const data = producoes.find(p => p.id === id);
    return data ? Producao.fromJSON(data) : null;
  }

  /**
   * Busca todas as produções
   * @returns {Promise<Array<Producao>>}
   */
  async findAll() {
    const producoes = this.stateManager.getState('producoes') || [];
    return producoes.map(data => Producao.fromJSON(data));
  }

  /**
   * Busca produções por ficha técnica
   * @param {string} fichaId - ID da ficha técnica
   * @returns {Promise<Array<Producao>>}
   */
  async findByFicha(fichaId) {
    const producoes = this.stateManager.getState('producoes') || [];
    return producoes
      .filter(p => p.fichaId === fichaId)
      .map(data => Producao.fromJSON(data));
  }

  /**
   * Busca produções por status
   * @param {string} status - Status da produção
   * @returns {Promise<Array<Producao>>}
   */
  async findByStatus(status) {
    const producoes = this.stateManager.getState('producoes') || [];
    return producoes
      .filter(p => p.status === status)
      .map(data => Producao.fromJSON(data));
  }

  /**
   * Busca produções por período
   * @param {Date} dataInicio - Data inicial
   * @param {Date} dataFim - Data final
   * @returns {Promise<Array<Producao>>}
   */
  async findByPeriodo(dataInicio, dataFim) {
    const producoes = this.stateManager.getState('producoes') || [];
    return producoes
      .filter(p => {
        const data = new Date(p.dataProducao);
        return data >= dataInicio && data <= dataFim;
      })
      .map(data => Producao.fromJSON(data));
  }

  /**
   * Remove produção
   * @param {string} id - ID da produção
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const producoes = this.stateManager.getState('producoes') || [];
    const filtered = producoes.filter(p => p.id !== id);
    
    if (filtered.length === producoes.length) {
      return false; // Não encontrado
    }

    this.stateManager.setState('producoes', filtered);
    return true;
  }
}
