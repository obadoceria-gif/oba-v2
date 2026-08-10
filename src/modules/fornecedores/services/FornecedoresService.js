/**
 * FornecedoresService
 * 
 * Serviço para gerenciar lógica de negócio de fornecedores.
 * Responsável por CRUD, validações e estatísticas.
 */

import { Fornecedor } from '../models/Fornecedor.js';

export class FornecedoresService {
  /**
   * @param {FornecedoresRepository} repository - Repositório de fornecedores
   * @param {EventBus} eventBus - Event bus para comunicação
   */
  constructor(repository, eventBus) {
    if (!repository) {
      throw new Error('Repository é obrigatório');
    }
    if (!eventBus) {
      throw new Error('EventBus é obrigatório');
    }

    this.repository = repository;
    this.eventBus = eventBus;
  }

  /**
   * Cria um novo fornecedor
   * @param {Object} data - Dados do fornecedor
   * @returns {Promise<Fornecedor>}
   */
  async createFornecedor(data) {
    try {
      // Verificar se CNPJ já existe
      const cnpjExists = await this.checkCNPJExists(data.cnpj);
      if (cnpjExists) {
        throw new Error('CNPJ já cadastrado para outro fornecedor');
      }

      // Criar instância do modelo (valida automaticamente)
      const fornecedor = new Fornecedor(data);

      // Salvar no repositório
      const saved = await this.repository.save(fornecedor);

      // Emitir evento de sucesso
      this.eventBus.emit('fornecedor:created', { fornecedor: saved });

      return saved;
    } catch (error) {
      console.error('[FornecedoresService] Erro ao criar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Verifica se um CNPJ já está cadastrado
   * @param {string} cnpj - CNPJ a verificar
   * @param {string} [excludeId] - ID do fornecedor a excluir da verificação (para edição)
   * @returns {Promise<boolean>}
   */
  async checkCNPJExists(cnpj, excludeId = null) {
    try {
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      const all = await this.repository.getAll();
      
      return all.some(f => {
        const fCnpj = f.cnpj.replace(/\D/g, '');
        return fCnpj === cnpjNumbers && f.id !== excludeId;
      });
    } catch (error) {
      console.error('[FornecedoresService] Erro ao verificar CNPJ:', error);
      return false;
    }
  }

  /**
   * Busca fornecedor por ID
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Fornecedor|null>}
   */
  async getFornecedorById(id) {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      console.error('[FornecedoresService] Erro ao buscar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Retorna todos os fornecedores
   * @returns {Promise<Fornecedor[]>}
   */
  async getAllFornecedores() {
    try {
      return await this.repository.getAll();
    } catch (error) {
      console.error('[FornecedoresService] Erro ao listar fornecedores:', error);
      throw error;
    }
  }

  /**
   * Retorna apenas fornecedores ativos
   * @returns {Promise<Fornecedor[]>}
   */
  async getFornecedoresAtivos() {
    try {
      return await this.repository.getAtivos();
    } catch (error) {
      console.error('[FornecedoresService] Erro ao listar fornecedores ativos:', error);
      throw error;
    }
  }

  /**
   * Retorna apenas fornecedores inativos
   * @returns {Promise<Fornecedor[]>}
   */
  async getFornecedoresInativos() {
    try {
      const all = await this.repository.getAll();
      return all.filter(f => !f.ativo);
    } catch (error) {
      console.error('[FornecedoresService] Erro ao listar fornecedores inativos:', error);
      throw error;
    }
  }

  /**
   * Atualiza um fornecedor existente
   * @param {string} id - ID do fornecedor
   * @param {Object} data - Dados atualizados
   * @returns {Promise<Fornecedor>}
   */
  async updateFornecedor(id, data) {
    try {
      // Buscar fornecedor existente
      const existing = await this.repository.getById(id);
      if (!existing) {
        throw new Error(`Fornecedor ${id} não encontrado`);
      }

      // Criar nova instância com dados atualizados
      const updated = new Fornecedor({
        ...existing.toJSON(),
        ...data,
        id: existing.id, // Manter ID original
        criadoEm: existing.criadoEm // Manter data de criação
      });

      // Salvar no repositório
      const saved = await this.repository.update(id, updated);

      // Emitir evento de sucesso
      this.eventBus.emit('fornecedor:updated', { fornecedor: saved });

      return saved;
    } catch (error) {
      console.error('[FornecedoresService] Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Remove um fornecedor (hard delete)
   * @param {string} id - ID do fornecedor
   * @returns {Promise<void>}
   */
  async deleteFornecedor(id) {
    try {
      // Verificar se pode excluir
      const canDelete = await this.canDelete(id);
      if (!canDelete) {
        throw new Error('Não é possível excluir fornecedor com compras associadas. Desative-o ao invés disso.');
      }

      await this.repository.delete(id);

      // Emitir evento de sucesso
      this.eventBus.emit('fornecedor:deleted', { fornecedorId: id });
    } catch (error) {
      console.error('[FornecedoresService] Erro ao excluir fornecedor:', error);
      throw error;
    }
  }

  /**
   * Desativa um fornecedor (soft delete)
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Fornecedor>}
   */
  async desativarFornecedor(id) {
    try {
      const fornecedor = await this.repository.getById(id);
      if (!fornecedor) {
        throw new Error(`Fornecedor ${id} não encontrado`);
      }

      fornecedor.desativar();
      const saved = await this.repository.update(id, fornecedor);

      // Emitir evento de sucesso
      this.eventBus.emit('fornecedor:deactivated', { fornecedor: saved });

      return saved;
    } catch (error) {
      console.error('[FornecedoresService] Erro ao desativar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Ativa um fornecedor
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Fornecedor>}
   */
  async ativarFornecedor(id) {
    try {
      const fornecedor = await this.repository.getById(id);
      if (!fornecedor) {
        throw new Error(`Fornecedor ${id} não encontrado`);
      }

      fornecedor.ativar();
      const saved = await this.repository.update(id, fornecedor);

      // Emitir evento de sucesso
      this.eventBus.emit('fornecedor:activated', { fornecedor: saved });

      return saved;
    } catch (error) {
      console.error('[FornecedoresService] Erro ao ativar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Busca fornecedores por termo
   * @param {string} termo - Termo de busca
   * @returns {Promise<Fornecedor[]>}
   */
  async searchFornecedores(termo) {
    try {
      if (!termo || termo.trim() === '') {
        return await this.getAllFornecedores();
      }

      const termoLower = termo.toLowerCase();
      const all = await this.repository.getAll();

      return all.filter(f => 
        f.nome.toLowerCase().includes(termoLower) ||
        (f.email && f.email.toLowerCase().includes(termoLower)) ||
        (f.telefone && f.telefone.includes(termo))
      );
    } catch (error) {
      console.error('[FornecedoresService] Erro ao buscar fornecedores:', error);
      throw error;
    }
  }

  /**
   * Verifica se um fornecedor pode ser excluído
   * @param {string} id - ID do fornecedor
   * @returns {Promise<boolean>}
   */
  async canDelete(id) {
    // TODO: Verificar se tem compras associadas
    // Por enquanto, sempre permite excluir
    return true;
  }

  /**
   * Retorna estatísticas gerais de fornecedores
   * @returns {Promise<Object>}
   */
  async getEstatisticas() {
    try {
      const all = await this.repository.getAll();
      const ativos = all.filter(f => f.ativo);
      const inativos = all.filter(f => !f.ativo);

      return {
        total: all.length,
        ativos: ativos.length,
        inativos: inativos.length
      };
    } catch (error) {
      console.error('[FornecedoresService] Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  /**
   * Retorna estatísticas de um fornecedor específico
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Object>}
   */
  async getEstatisticasFornecedor(id) {
    try {
      // TODO: Buscar compras do fornecedor e calcular estatísticas
      // Por enquanto, retorna estatísticas vazias
      return {
        totalCompras: 0,
        totalGasto: 0,
        ultimaCompra: null
      };
    } catch (error) {
      console.error('[FornecedoresService] Erro ao calcular estatísticas do fornecedor:', error);
      throw error;
    }
  }
}
