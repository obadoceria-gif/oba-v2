/**
 * ComprasRepository
 * 
 * Repositório para gerenciar persistência de compras.
 * Responsável por CRUD de compras e buscas por filtros.
 */

import { Compra } from '../models/Compra.js';

export class ComprasRepository {
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
    this.storeName = 'compras';
  }

  /**
   * Salva uma nova compra
   * @param {Compra} compra - Compra a salvar
   * @returns {Promise<Compra>}
   */
  async save(compra) {
    if (!(compra instanceof Compra)) {
      throw new Error('Compra inválida');
    }

    // Salvar no storage
    await this.storage.save(this.storeName, compra.toJSON());

    // Atualizar state
    await this._updateState();

    return compra;
  }

  /**
   * Busca compra por ID
   * @param {string} id - ID da compra
   * @returns {Promise<Compra|null>}
   */
  async getById(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    const data = await this.storage.get(this.storeName, id);
    
    if (!data) {
      return null;
    }

    return Compra.fromJSON(data);
  }

  /**
   * Retorna todas as compras
   * @returns {Promise<Compra[]>}
   */
  async getAll() {
    const allData = await this.storage.getAll(this.storeName);
    return allData.map(data => Compra.fromJSON(data));
  }

  /**
   * Atualiza uma compra existente
   * @param {string} id - ID da compra
   * @param {Compra} compra - Compra atualizada
   * @returns {Promise<Compra>}
   */
  async update(id, compra) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    if (!(compra instanceof Compra)) {
      throw new Error('Compra inválida');
    }

    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Compra ${id} não encontrada`);
    }

    // Atualizar timestamp
    compra.touch();

    // Atualizar no storage
    await this.storage.update(this.storeName, id, compra.toJSON());

    // Atualizar state
    await this._updateState();

    return compra;
  }

  /**
   * Remove uma compra
   * @param {string} id - ID da compra
   * @returns {Promise<void>}
   */
  async delete(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Compra ${id} não encontrada`);
    }

    await this.storage.delete(this.storeName, id);

    // Atualizar state
    await this._updateState();
  }

  /**
   * Busca compras por fornecedor
   * @param {string} fornecedorId - ID do fornecedor
   * @returns {Promise<Compra[]>}
   */
  async getByFornecedor(fornecedorId) {
    if (!fornecedorId) {
      throw new Error('fornecedorId é obrigatório');
    }

    const allCompras = await this.getAll();
    return allCompras.filter(compra => compra.fornecedorId === fornecedorId);
  }

  /**
   * Busca compras por período
   * @param {string} dataInicio - Data inicial (ISO)
   * @param {string} dataFim - Data final (ISO)
   * @returns {Promise<Compra[]>}
   */
  async getByData(dataInicio, dataFim) {
    if (!dataInicio || !dataFim) {
      throw new Error('dataInicio e dataFim são obrigatórios');
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new Error('Datas inválidas');
    }

    if (inicio > fim) {
      throw new Error('dataInicio deve ser anterior a dataFim');
    }

    const allCompras = await this.getAll();
    return allCompras.filter(compra => {
      const dataCompra = new Date(compra.criadoEm);
      return dataCompra >= inicio && dataCompra <= fim;
    });
  }

  /**
   * Busca compras por status
   * @param {string} status - Status da compra
   * @returns {Promise<Compra[]>}
   */
  async getByStatus(status) {
    if (!status) {
      throw new Error('status é obrigatório');
    }

    const statusValidos = ['pendente', 'concluida', 'cancelada'];
    if (!statusValidos.includes(status)) {
      throw new Error(`status deve ser um dos seguintes: ${statusValidos.join(', ')}`);
    }

    const allCompras = await this.getAll();
    return allCompras.filter(compra => compra.status === status);
  }

  /**
   * Atualiza o state com todas as compras
   * @private
   */
  async _updateState() {
    const allCompras = await this.getAll();
    
    // Converter para array de objetos simples
    const comprasData = allCompras.map(compra => compra.toJSON());

    this.stateManager.setState('compras', comprasData);
  }
}
