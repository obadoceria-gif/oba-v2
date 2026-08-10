/**
 * FichasTecnicasRepository
 * 
 * Gerencia persistência de fichas técnicas no storage.
 * 
 * Requirements: 4.13
 */

import { FichaTecnica } from '../models/FichaTecnica.js';

export class FichasTecnicasRepository {
  /**
   * @param {StorageAdapter} storage - Adaptador de storage
   * @param {StateManager} stateManager - Gerenciador de estado
   */
  constructor(storage, stateManager) {
    this.storage = storage;
    this.stateManager = stateManager;
    this.storeName = 'fichas'; // Usando 'fichas' que está registrado no storage
  }

  /**
   * Salva uma ficha técnica no storage
   * @param {FichaTecnica} ficha - Ficha técnica a salvar
   * @returns {Promise<FichaTecnica>} Ficha técnica salva
   */
  async save(ficha) {
    if (!(ficha instanceof FichaTecnica)) {
      throw new Error('Objeto deve ser uma instância de FichaTecnica');
    }

    const validation = ficha.validate();
    if (!validation.valid) {
      throw new Error('Ficha técnica inválida');
    }

    // Salvar no storage (passa apenas o JSON, o storage extrai o ID)
    await this.storage.save(this.storeName, ficha.toJSON());
    
    // Atualizar state: buscar DIRETAMENTE do storage para incluir a nova ficha
    const allFichasFromStorage = await this.storage.getAll(this.storeName);
    const allFichas = allFichasFromStorage.map(data => FichaTecnica.fromJSON(data));
    this.stateManager.setState('fichas', allFichas);

    return ficha;
  }

  /**
   * Busca uma ficha técnica por ID
   * @param {string} id - ID da ficha técnica
   * @returns {Promise<FichaTecnica|null>} Ficha técnica encontrada ou null
   */
  async getById(id) {
    const data = await this.storage.get(this.storeName, id);
    return data ? FichaTecnica.fromJSON(data) : null;
  }

  /**
   * Busca todas as fichas técnicas
   * @returns {Promise<Array<FichaTecnica>>} Lista de fichas técnicas
   */
  async getAll() {
    const allData = await this.storage.getAll(this.storeName);
    return allData.map(data => FichaTecnica.fromJSON(data));
  }

  /**
   * Atualiza uma ficha técnica existente
   * @param {string} id - ID da ficha técnica
   * @param {Object} updates - Dados a atualizar
   * @returns {Promise<FichaTecnica>} Ficha técnica atualizada
   */
  async update(id, updates) {
    const fichaExistente = await this.getById(id);
    
    if (!fichaExistente) {
      throw new Error(`Ficha técnica ${id} não encontrada`);
    }

    // Criar nova instância com dados atualizados
    const fichaAtualizada = new FichaTecnica({
      ...fichaExistente.toJSON(),
      ...updates,
      id, // Manter ID original
      atualizadoEm: new Date().toISOString()
    });

    // Validar antes de salvar
    const validation = fichaAtualizada.validate();
    if (!validation.valid) {
      const error = new Error('Ficha técnica inválida');
      error.errors = validation.errors;
      throw error;
    }

    return await this.save(fichaAtualizada);
  }

  /**
   * Remove uma ficha técnica
   * @param {string} id - ID da ficha técnica
   * @returns {Promise<boolean>} True se removida com sucesso
   */
  async delete(id) {
    const ficha = await this.getById(id);
    
    if (!ficha) {
      throw new Error(`Ficha técnica ${id} não encontrada`);
    }

    await this.storage.delete(this.storeName, id);
    
    // Atualizar state
    const todasFichas = await this.getAll();
    this.stateManager.setState('fichas', todasFichas);

    return true;
  }
}
