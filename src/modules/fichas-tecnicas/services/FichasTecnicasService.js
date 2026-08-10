/**
 * FichasTecnicasService
 * 
 * Camada de serviço para o módulo de fichas técnicas.
 * Contém lógica de negócio, validações e integração com EventBus.
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 4.10, 4.11
 */

import { FichaTecnica } from '../models/FichaTecnica.js';

export class FichasTecnicasService {
  /**
   * Cria uma nova instância de FichasTecnicasService
   * @param {FichasTecnicasRepository} repository - Repository de fichas técnicas
   * @param {EventBus} eventBus - Sistema de eventos
   * @param {EstoqueRepository} estoqueRepository - Repository de estoque (para cálculo de custos)
   */
  constructor(repository, eventBus, estoqueRepository = null) {
    this.repository = repository;
    this.eventBus = eventBus;
    this.estoqueRepository = estoqueRepository;
  }

  /**
   * Cria uma nova ficha técnica
   * @param {Object} fichaData - Dados da ficha técnica
   * @returns {Promise<{success: boolean, data?: FichaTecnica, errors?: Object}>}
   * 
   * Requirements: 4.2, 4.3, 4.4, 4.5
   */
  async createFichaTecnica(fichaData) {
    try {
      // Gerar ID se não fornecido
      if (!fichaData.id) {
        fichaData.id = this._generateId();
      }

      // Criar instância do model
      const ficha = new FichaTecnica(fichaData);

      // Validar dados
      const validation = ficha.validate();
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Salvar via repository
      const saved = await this.repository.save(ficha);

      // Emitir evento
      await this.eventBus.publish('ficha:criada', saved.toJSON());

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
   * Atualiza uma ficha técnica existente
   * @param {string} id - ID da ficha técnica
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Promise<{success: boolean, data?: FichaTecnica, message?: string, errors?: Object}>}
   * 
   * Requirements: 4.6
   */
  async updateFichaTecnica(id, updates) {
    try {
      // Buscar ficha existente
      const existing = await this.repository.getById(id);
      
      if (!existing) {
        return {
          success: false,
          message: `Ficha técnica com ID ${id} não encontrada`
        };
      }

      // Atualizar via repository (já valida internamente)
      const updated = await this.repository.update(id, updates);

      // Emitir evento
      await this.eventBus.publish('ficha:atualizada', updated.toJSON());

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
   * Remove uma ficha técnica
   * @param {string} id - ID da ficha técnica
   * @returns {Promise<{success: boolean, message: string}>}
   * 
   * Requirements: 4.10
   */
  async deleteFichaTecnica(id) {
    try {
      // Verificar se ficha existe
      const ficha = await this.repository.getById(id);
      
      if (!ficha) {
        return {
          success: false,
          message: `Ficha técnica com ID ${id} não encontrada`
        };
      }

      // Verificar referências (produções)
      const hasReferences = await this._checkReferences(id);
      
      if (hasReferences.hasReferences) {
        return {
          success: false,
          message: `Não é possível excluir a ficha técnica "${ficha.nome}" pois ela está sendo usada em: ${hasReferences.references.join(', ')}`
        };
      }

      // Remover via repository
      await this.repository.delete(id);

      // Emitir evento
      await this.eventBus.publish('ficha:removida', { id, nome: ficha.nome });

      return {
        success: true,
        message: `Ficha técnica "${ficha.nome}" removida com sucesso`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Busca uma ficha técnica por ID
   * @param {string} id - ID da ficha técnica
   * @returns {Promise<FichaTecnica|null>}
   */
  async getFichaTecnicaById(id) {
    return await this.repository.getById(id);
  }

  /**
   * Busca todas as fichas técnicas
   * @returns {Promise<FichaTecnica[]>}
   * 
   * Requirements: 4.11
   */
  async getAllFichasTecnicas() {
    return await this.repository.getAll();
  }

  /**
   * Busca fichas técnicas com filtros
   * @param {Object} filters - Filtros a serem aplicados
   * @param {string} [filters.nome] - Filtrar por nome
   * @returns {Promise<FichaTecnica[]>}
   * 
   * Requirements: 4.11
   */
  async getFichasTecnicas(filters = {}) {
    const todasFichas = await this.getAllFichasTecnicas();
    
    if (Object.keys(filters).length === 0) {
      return todasFichas;
    }

    // Aplicar filtros
    return todasFichas.filter(ficha => {
      if (filters.nome) {
        const nomeMatch = ficha.nome.toLowerCase().includes(filters.nome.toLowerCase());
        if (!nomeMatch) return false;
      }
      
      return true;
    });
  }

  /**
   * Calcula os custos de uma ficha técnica usando preços atuais do estoque
   * @param {string} id - ID da ficha técnica
   * @returns {Promise<{success: boolean, custoLote?: number, custoUnitario?: number, message?: string}>}
   * 
   * Requirements: 4.6, 4.7, 4.9
   */
  async calculateCustos(id) {
    try {
      const ficha = await this.repository.getById(id);
      
      if (!ficha) {
        return {
          success: false,
          message: `Ficha técnica com ID ${id} não encontrada`
        };
      }

      if (!this.estoqueRepository) {
        return {
          success: false,
          message: 'EstoqueRepository não configurado'
        };
      }

      // Buscar custos atuais do estoque
      const estoqueMap = new Map();
      
      for (const item of ficha.insumos) {
        const estoque = await this.estoqueRepository.getByInsumoId(item.insumoId);
        
        if (!estoque) {
          return {
            success: false,
            message: `Insumo ${item.insumoId} não encontrado no estoque`
          };
        }
        
        estoqueMap.set(item.insumoId, estoque);
      }

      // Calcular custos
      const custoLote = ficha.calculateCustoLote(estoqueMap);
      const custoUnitario = ficha.calculateCustoUnitario(estoqueMap);

      return {
        success: true,
        custoLote,
        custoUnitario
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Verifica se uma ficha técnica tem referências em outros módulos
   * @private
   * @param {string} fichaId - ID da ficha técnica
   * @returns {Promise<{hasReferences: boolean, references: string[]}>}
   * 
   * Requirements: 4.10
   */
  async _checkReferences(fichaId) {
    // TODO: Implementar verificação quando módulo de produção estiver pronto
    // Por enquanto, retorna sem referências
    
    const references = [];
    
    // Futuramente:
    // - Verificar se ficha está em alguma produção
    
    return {
      hasReferences: references.length > 0,
      references
    };
  }

  /**
   * Gera um ID único para ficha técnica
   * @private
   * @returns {string}
   */
  _generateId() {
    return `ficha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
