/**
 * InsumosService
 * 
 * Camada de serviço para o módulo de insumos.
 * Contém lógica de negócio, validações e integração com EventBus.
 * 
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

import { Insumo } from '../models/Insumo.js';

export class InsumosService {
  /**
   * Cria uma nova instância de InsumosService
   * @param {InsumosRepository} repository - Repository de insumos
   * @param {EventBus} eventBus - Sistema de eventos
   */
  constructor(repository, eventBus) {
    this.repository = repository;
    this.eventBus = eventBus;
  }

  /**
   * Cria um novo insumo
   * @param {Object} insumoData - Dados do insumo
   * @returns {Promise<{success: boolean, data?: Insumo, errors?: Object}>}
   * 
   * Requirements: 1.2, 1.3, 1.4, 1.5
   */
  async createInsumo(insumoData) {
    try {
      // Gerar ID se não fornecido
      if (!insumoData.id) {
        insumoData.id = this._generateId();
      }

      // Criar instância do model
      const insumo = new Insumo(insumoData);

      // Validar dados
      const validation = insumo.validate();
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Salvar via repository
      const saved = await this.repository.save(insumo);

      // Emitir evento
      await this.eventBus.publish('insumo:criado', saved.toJSON());

      return {
        success: true,
        data: saved
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Atualiza um insumo existente
   * @param {string} id - ID do insumo
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Promise<{success: boolean, data?: Insumo, message?: string, errors?: Object}>}
   * 
   * Requirements: 1.6
   */
  async updateInsumo(id, updates) {
    try {
      // Buscar insumo existente
      const existing = await this.repository.getById(id);
      
      if (!existing) {
        return {
          success: false,
          message: `Insumo com ID ${id} não encontrado`
        };
      }

      // Atualizar via repository (já valida internamente)
      const updated = await this.repository.update(id, updates);

      // Emitir evento
      await this.eventBus.publish('insumo:atualizado', updated.toJSON());

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      // Se erro tem errors, é erro de validação
      if (error.errors) {
        return {
          success: false,
          errors: error.errors
        };
      }
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Remove um insumo
   * @param {string} id - ID do insumo
   * @returns {Promise<{success: boolean, message: string}>}
   * 
   * Requirements: 1.7
   */
  async deleteInsumo(id) {
    try {
      // Verificar se insumo existe
      const insumo = await this.repository.getById(id);
      
      if (!insumo) {
        return {
          success: false,
          message: `Insumo com ID ${id} não encontrado`
        };
      }

      // Verificar referências (fichas técnicas, compras)
      const hasReferences = await this._checkReferences(id);
      
      if (hasReferences.hasReferences) {
        return {
          success: false,
          message: `Não é possível excluir o insumo "${insumo.nome}" pois ele está sendo usado em: ${hasReferences.references.join(', ')}`
        };
      }

      // Remover via repository
      await this.repository.delete(id);

      // Emitir evento
      await this.eventBus.publish('insumo:removido', { id, nome: insumo.nome });

      return {
        success: true,
        message: `Insumo "${insumo.nome}" removido com sucesso`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Busca um insumo por ID
   * @param {string} id - ID do insumo
   * @returns {Promise<Insumo|null>}
   */
  async getInsumoById(id) {
    return await this.repository.getById(id);
  }

  /**
   * Busca todos os insumos
   * @returns {Promise<Insumo[]>}
   * 
   * Requirements: 1.8
   */
  async getAllInsumos() {
    return await this.repository.getAll();
  }

  /**
   * Busca insumos com filtros
   * @param {Object} filters - Filtros a serem aplicados
   * @param {string} [filters.nome] - Filtrar por nome
   * @param {string} [filters.unidade] - Filtrar por unidade
   * @param {string} [filters.fornecedor] - Filtrar por fornecedor
   * @returns {Promise<Insumo[]>}
   * 
   * Requirements: 1.8
   */
  async getInsumos(filters = {}) {
    if (Object.keys(filters).length === 0) {
      return await this.getAllInsumos();
    }
    
    return await this.repository.findByFilters(filters);
  }

  /**
   * Verifica se um insumo tem referências em outros módulos
   * @private
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<{hasReferences: boolean, references: string[]}>}
   * 
   * Requirements: 1.7
   */
  async _checkReferences(insumoId) {
    // TODO: Implementar verificação quando módulos de fichas técnicas e compras estiverem prontos
    // Por enquanto, retorna sem referências
    
    const references = [];
    
    // Futuramente:
    // - Verificar se insumo está em alguma ficha técnica
    // - Verificar se insumo está em alguma compra
    // - Verificar se insumo tem movimentações de estoque
    
    return {
      hasReferences: references.length > 0,
      references
    };
  }

  /**
   * Gera um ID único para insumo
   * @private
   * @returns {string}
   */
  _generateId() {
    return `insumo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
