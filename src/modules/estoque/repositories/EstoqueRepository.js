/**
 * EstoqueRepository
 * 
 * Repositório para gerenciar persistência de estoques.
 * 
 * Requirements:
 * - 3.12: Persistência de estoques com Storage Layer
 */

import { Estoque } from '../models/Estoque.js';

export class EstoqueRepository {
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
    this.storeName = 'estoque';
  }

  /**
   * Salva um novo estoque
   * @param {Estoque} estoque - Estoque a salvar
   * @returns {Promise<Estoque>}
   */
  async save(estoque) {
    if (!(estoque instanceof Estoque)) {
      throw new Error('Estoque inválido');
    }

    // Salvar no storage
    await this.storage.save(this.storeName, estoque.insumoId, estoque.toJSON());

    // Atualizar state
    await this._updateState();

    return estoque;
  }

  /**
   * Busca estoque por ID do insumo
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<Estoque|null>}
   */
  async getByInsumoId(insumoId) {
    if (!insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    const data = await this.storage.get(this.storeName, insumoId);
    
    if (!data) {
      return null;
    }

    return Estoque.fromJSON(data);
  }

  /**
   * Retorna todos os estoques
   * @returns {Promise<Estoque[]>}
   */
  async getAll() {
    const allData = await this.storage.getAll(this.storeName);
    return allData.map(data => Estoque.fromJSON(data));
  }

  /**
   * Atualiza um estoque existente
   * @param {string} insumoId - ID do insumo
   * @param {Estoque} estoque - Estoque atualizado
   * @returns {Promise<Estoque>}
   */
  async update(insumoId, estoque) {
    if (!insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    if (!(estoque instanceof Estoque)) {
      throw new Error('Estoque inválido');
    }

    // Verificar se existe
    const existing = await this.getByInsumoId(insumoId);
    if (!existing) {
      throw new Error(`Estoque para insumo ${insumoId} não encontrado`);
    }

    // Atualizar no storage
    await this.storage.update(this.storeName, insumoId, estoque.toJSON());

    // Atualizar state
    await this._updateState();

    return estoque;
  }

  /**
   * Remove um estoque
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<void>}
   */
  async delete(insumoId) {
    if (!insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    await this.storage.delete(this.storeName, insumoId);

    // Atualizar state
    await this._updateState();
  }

  /**
   * Atualiza o state com todos os estoques
   * @private
   */
  async _updateState() {
    const allEstoques = await this.getAll();
    
    // Converter para objeto indexado por insumoId
    const estoquesData = {};
    allEstoques.forEach(estoque => {
      estoquesData[estoque.insumoId] = estoque.toJSON();
    });

    this.stateManager.setState('estoque', estoquesData);
  }
}
