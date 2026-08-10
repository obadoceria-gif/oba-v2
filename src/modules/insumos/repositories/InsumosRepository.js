/**
 * InsumosRepository
 * 
 * Gerencia a persistência de insumos usando Storage Layer e State Management.
 * 
 * Requirements: 1.10
 */

import { Insumo } from '../models/Insumo.js';

export class InsumosRepository {
  /**
   * Cria uma nova instância de InsumosRepository
   * @param {StorageAdapter} storage - Adaptador de storage (IndexedDB ou localStorage)
   * @param {StateManager} stateManager - Gerenciador de estado global
   */
  constructor(storage, stateManager) {
    this.storage = storage;
    this.stateManager = stateManager;
    this.storeName = 'insumos';
  }

  /**
   * Salva um novo insumo
   * @param {Insumo} insumo - Insumo a ser salvo
   * @returns {Promise<Insumo>} Insumo salvo
   * 
   * Requirements: 1.10
   */
  async save(insumo) {
    if (!(insumo instanceof Insumo)) {
      throw new Error('Objeto deve ser uma instância de Insumo');
    }

    const validation = insumo.validate();
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${JSON.stringify(validation.errors)}`);
    }

    // Salvar no storage
    await this.storage.save(this.storeName, insumo.toJSON());

    // Atualizar state: buscar DIRETAMENTE do storage para incluir o novo insumo
    const allInsumosFromStorage = await this.storage.getAll(this.storeName);
    const allInsumos = allInsumosFromStorage.map(data => Insumo.fromJSON(data));
    this.stateManager.setState('insumos', allInsumos);

    return insumo;
  }

  /**
   * Busca um insumo por ID
   * @param {string} id - ID do insumo
   * @returns {Promise<Insumo|null>} Insumo encontrado ou null
   * 
   * Requirements: 1.10
   */
  async getById(id) {
    // Buscar do StateManager primeiro
    const stateData = this.stateManager.getState('insumos');
    
    if (stateData && Array.isArray(stateData)) {
      const found = stateData.find(item => item.id === id);
      if (found) {
        return Insumo.fromJSON(found);
      }
    }
    
    // Fallback para storage se não encontrar no state
    const data = await this.storage.get(this.storeName, id);
    
    if (!data) {
      return null;
    }

    return Insumo.fromJSON(data);
  }

  /**
   * Busca todos os insumos
   * @returns {Promise<Insumo[]>} Lista de insumos
   * 
   * Requirements: 1.10
   */
  async getAll() {
    // Buscar do StateManager (fonte da verdade em memória)
    const stateData = this.stateManager.getState('insumos');
    
    // Se não houver dados no state, buscar do storage
    if (!stateData || stateData.length === 0) {
      const dataList = await this.storage.getAll(this.storeName);
      return dataList.map(data => Insumo.fromJSON(data));
    }
    
    // Converter dados do state para instâncias de Insumo
    return stateData.map(data => Insumo.fromJSON(data));
  }

  /**
   * Atualiza um insumo existente
   * @param {string} id - ID do insumo
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Promise<Insumo>} Insumo atualizado
   * 
   * Requirements: 1.10
   */
  async update(id, updates) {
    // Buscar insumo existente
    const insumo = await this.getById(id);
    
    if (!insumo) {
      throw new Error(`Insumo com ID ${id} não encontrado`);
    }

    // Atualizar dados
    insumo.update(updates);

    // Validar
    const validation = insumo.validate();
    if (!validation.valid) {
      const error = new Error('Validação falhou');
      error.errors = validation.errors;
      throw error;
    }

    // Salvar no storage
    await this.storage.save(this.storeName, insumo.toJSON());

    // Atualizar state: buscar DIRETAMENTE do storage para garantir sincronização
    const allInsumosFromStorage = await this.storage.getAll(this.storeName);
    const allInsumos = allInsumosFromStorage.map(data => Insumo.fromJSON(data));
    this.stateManager.setState('insumos', allInsumos);

    return insumo;
  }

  /**
   * Remove um insumo
   * @param {string} id - ID do insumo
   * @returns {Promise<boolean>} true se removido com sucesso
   * 
   * Requirements: 1.10
   */
  async delete(id) {
    // Verificar se existe
    const insumo = await this.getById(id);
    
    if (!insumo) {
      throw new Error(`Insumo com ID ${id} não encontrado`);
    }

    // Remover do storage
    await this.storage.delete(this.storeName, id);

    // Atualizar state: buscar DIRETAMENTE do storage após remoção
    const allInsumosFromStorage = await this.storage.getAll(this.storeName);
    const allInsumos = allInsumosFromStorage.map(data => Insumo.fromJSON(data));
    this.stateManager.setState('insumos', allInsumos);

    return true;
  }

  /**
   * Busca insumos por filtros
   * @param {Object} filters - Filtros a serem aplicados
   * @param {string} [filters.nome] - Filtrar por nome (busca parcial)
   * @param {string} [filters.unidade] - Filtrar por unidade
   * @param {string} [filters.fornecedor] - Filtrar por fornecedor
   * @returns {Promise<Insumo[]>} Lista de insumos filtrados
   */
  async findByFilters(filters = {}) {
    const allInsumos = await this.getAll();

    return allInsumos.filter(insumo => {
      // Filtro por nome (case-insensitive, busca parcial)
      if (filters.nome) {
        const nomeMatch = insumo.nome
          .toLowerCase()
          .includes(filters.nome.toLowerCase());
        if (!nomeMatch) return false;
      }

      // Filtro por unidade (exato)
      if (filters.unidade) {
        if (insumo.unidade !== filters.unidade) return false;
      }

      // Filtro por fornecedor (case-insensitive, busca parcial)
      if (filters.fornecedor) {
        const fornecedorMatch = insumo.fornecedor
          .toLowerCase()
          .includes(filters.fornecedor.toLowerCase());
        if (!fornecedorMatch) return false;
      }

      return true;
    });
  }
}
