/**
 * FornecedoresRepository
 * 
 * Repositório para gerenciar persistência de fornecedores.
 * Responsável por CRUD de fornecedores e buscas por filtros.
 */

import { Fornecedor } from '../models/Fornecedor.js';

export class FornecedoresRepository {
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
    this.storeName = 'fornecedores';
  }

  /**
   * Salva um novo fornecedor
   * @param {Fornecedor} fornecedor - Fornecedor a salvar
   * @returns {Promise<Fornecedor>}
   */
  async save(fornecedor) {
    if (!(fornecedor instanceof Fornecedor)) {
      throw new Error('Fornecedor inválido');
    }

    // Verificar duplicata por nome
    const duplicado = await this.findByNome(fornecedor.nome);
    if (duplicado) {
      throw new Error(`Fornecedor com nome "${fornecedor.nome}" já existe`);
    }

    // Salvar no storage
    await this.storage.save(this.storeName, fornecedor.toJSON());

    // Atualizar state
    await this._updateState();

    return fornecedor;
  }

  /**
   * Busca fornecedor por ID
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Fornecedor|null>}
   */
  async getById(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    const data = await this.storage.get(this.storeName, id);
    
    if (!data) {
      return null;
    }

    return Fornecedor.fromJSON(data);
  }

  /**
   * Retorna todos os fornecedores
   * @returns {Promise<Fornecedor[]>}
   */
  async getAll() {
    const allData = await this.storage.getAll(this.storeName);
    return allData.map(data => Fornecedor.fromJSON(data));
  }

  /**
   * Retorna apenas fornecedores ativos
   * @returns {Promise<Fornecedor[]>}
   */
  async getAtivos() {
    const allFornecedores = await this.getAll();
    return allFornecedores.filter(f => f.ativo);
  }

  /**
   * Atualiza um fornecedor existente
   * @param {string} id - ID do fornecedor
   * @param {Fornecedor} fornecedor - Fornecedor atualizado
   * @returns {Promise<Fornecedor>}
   */
  async update(id, fornecedor) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    if (!(fornecedor instanceof Fornecedor)) {
      throw new Error('Fornecedor inválido');
    }

    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Fornecedor ${id} não encontrado`);
    }

    // Verificar duplicata por nome (exceto o próprio)
    if (fornecedor.nome !== existing.nome) {
      const duplicado = await this.findByNome(fornecedor.nome);
      if (duplicado && duplicado.id !== id) {
        throw new Error(`Fornecedor com nome "${fornecedor.nome}" já existe`);
      }
    }

    // Atualizar timestamp
    fornecedor.touch();

    // Atualizar no storage
    await this.storage.update(this.storeName, id, fornecedor.toJSON());

    // Atualizar state
    await this._updateState();

    return fornecedor;
  }

  /**
   * Remove um fornecedor
   * @param {string} id - ID do fornecedor
   * @returns {Promise<void>}
   */
  async delete(id) {
    if (!id) {
      throw new Error('id é obrigatório');
    }

    // Verificar se existe
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Fornecedor ${id} não encontrado`);
    }

    await this.storage.delete(this.storeName, id);

    // Atualizar state
    await this._updateState();
  }

  /**
   * Busca fornecedor por nome exato
   * @param {string} nome - Nome do fornecedor
   * @returns {Promise<Fornecedor|null>}
   */
  async findByNome(nome) {
    if (!nome) {
      return null;
    }

    const allFornecedores = await this.getAll();
    const found = allFornecedores.find(f => 
      f.nome.toLowerCase() === nome.toLowerCase()
    );

    return found || null;
  }

  /**
   * Busca fornecedores por nome parcial
   * @param {string} termo - Termo de busca
   * @returns {Promise<Fornecedor[]>}
   */
  async searchByNome(termo) {
    if (!termo) {
      return [];
    }

    const termoLower = termo.toLowerCase();
    const allFornecedores = await this.getAll();
    
    return allFornecedores.filter(f => 
      f.nome.toLowerCase().includes(termoLower)
    );
  }

  /**
   * Atualiza o state com todos os fornecedores
   * @private
   */
  async _updateState() {
    const allFornecedores = await this.getAll();
    
    // Converter para array de objetos simples
    const fornecedoresData = allFornecedores.map(f => f.toJSON());

    this.stateManager.setState('fornecedores', fornecedoresData);
  }
}
