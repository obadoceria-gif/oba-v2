/**
 * InsumosController
 * 
 * Controlador para o módulo de insumos.
 * Gerencia a comunicação entre a camada de serviço e a camada de visualização.
 * 
 * Requirements:
 * - 1.6: Atualização de insumos
 * - 1.8: Busca de insumos com filtros
 */

import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class InsumosController {
  /**
   * @param {InsumosService} service - Serviço de insumos
   * @param {InsumosView} view - View de insumos
   */
  constructor(service, view) {
    if (!service) {
      throw new Error('InsumosService é obrigatório');
    }
    if (!view) {
      throw new Error('InsumosView é obrigatório');
    }

    this.service = service;
    this.view = view;
    this.toast = getToast();
    this.loading = getLoading();
    
    this._initializeEventHandlers();
  }

  /**
   * Inicializa os event handlers da view
   * @private
   */
  _initializeEventHandlers() {
    // Bind dos métodos para manter contexto correto
    this.handleCreateInsumo = this.handleCreateInsumo.bind(this);
    this.handleUpdateInsumo = this.handleUpdateInsumo.bind(this);
    this.handleDeleteInsumo = this.handleDeleteInsumo.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleLoadInsumos = this.handleLoadInsumos.bind(this);
    this.handleSelectInsumo = this.handleSelectInsumo.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);

    // Registrar handlers na view
    this.view.on('create', this.handleCreateInsumo);
    this.view.on('update', this.handleUpdateInsumo);
    this.view.on('delete', this.handleDeleteInsumo);
    this.view.on('filter', this.handleFilterChange);
    this.view.on('load', this.handleLoadInsumos);
    this.view.on('select', this.handleSelectInsumo);
    this.view.on('cancel', this.handleCancelEdit);
  }

  /**
   * Handler para criação de insumo
   * @param {Object} insumoData - Dados do insumo
   */
  async handleCreateInsumo(insumoData) {
    const loadingId = this.loading.show('Criando insumo...');
    
    try {
      console.log('[InsumosController] handleCreateInsumo chamado com:', insumoData);
      
      const result = await this.service.createInsumo(insumoData);
      console.log('[InsumosController] Resultado do service:', result);
      
      if (!result.success) {
        const errorMsg = result.errors 
          ? Object.values(result.errors).join(', ')
          : result.message || 'Erro ao criar insumo';
        this.toast.error(errorMsg);
        return result;
      }
      
      this.toast.success('Insumo criado com sucesso!');
      this.view.clearForm();
      
      // Recarregar lista
      console.log('[InsumosController] Recarregando lista...');
      await this.handleLoadInsumos();
      
      return result;
    } catch (error) {
      console.error('[InsumosController] Erro ao criar insumo:', error);
      this.toast.error(error.message || 'Erro ao criar insumo');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para atualização de insumo
   * @param {Object} updateData - Objeto com id e data
   */
  async handleUpdateInsumo(updateData) {
    const loadingId = this.loading.show('Atualizando insumo...');
    
    try {
      const { id, data } = updateData;
      
      const insumo = await this.service.updateInsumo(id, data);
      
      this.toast.success('Insumo atualizado com sucesso!');
      this.view.clearForm();
      
      // Recarregar lista
      await this.handleLoadInsumos();
      
      return insumo;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao atualizar insumo');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para remoção de insumo
   * @param {string} id - ID do insumo
   */
  async handleDeleteInsumo(id) {
    try {
      // Confirmar com usuário
      const confirmed = await this.view.confirm(
        'Tem certeza que deseja remover este insumo?'
      );
      
      if (!confirmed) {
        return;
      }

      const loadingId = this.loading.show('Removendo insumo...');
      
      try {
        await this.service.deleteInsumo(id);
        
        this.toast.success('Insumo removido com sucesso!');
        
        // Recarregar lista
        await this.handleLoadInsumos();
      } finally {
        this.loading.hide(loadingId);
      }
    } catch (error) {
      this.toast.error(error.message || 'Erro ao remover insumo');
      throw error;
    }
  }

  /**
   * Handler para mudança de filtros
   * @param {Object} filters - Filtros aplicados
   */
  async handleFilterChange(filters) {
    const loadingId = this.loading.show('Filtrando insumos...');
    
    try {
      const insumos = await this.service.getInsumos(filters);
      
      this.view.renderInsumosList(insumos);
    } catch (error) {
      this.toast.error(error.message || 'Erro ao filtrar insumos');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar todos os insumos
   */
  async handleLoadInsumos() {
    const loadingId = this.loading.show('Carregando insumos...');
    
    try {
      console.log('[InsumosController] handleLoadInsumos chamado');
      
      const insumos = await this.service.getAllInsumos();
      console.log('[InsumosController] Insumos carregados:', insumos.length, 'itens');
      console.log('[InsumosController] Dados:', insumos);
      
      this.view.renderInsumosList(insumos);
      console.log('[InsumosController] Lista renderizada');
      
      return insumos;
    } catch (error) {
      console.error('[InsumosController] Erro ao carregar insumos:', error);
      this.toast.error(error.message || 'Erro ao carregar insumos');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para seleção de insumo (para edição)
   * @param {string} id - ID do insumo
   */
  async handleSelectInsumo(id) {
    try {
      const insumo = await this.service.getInsumoById(id);
      
      if (!insumo) {
        this.toast.error('Insumo não encontrado');
        return;
      }
      
      this.view.populateForm(insumo);
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar insumo');
      throw error;
    }
  }

  /**
   * Handler para cancelar edição
   */
  handleCancelEdit() {
    this.view.clearForm();
  }

  /**
   * Inicializa o controller
   * Carrega dados iniciais
   */
  async initialize() {
    try {
      await this.handleLoadInsumos();
    } catch (error) {
      console.error('Erro ao inicializar InsumosController:', error);
      this.toast.error('Erro ao inicializar módulo de insumos');
    }
  }

  /**
   * Destrói o controller
   * Remove event handlers
   */
  destroy() {
    this.view.off('create', this.handleCreateInsumo);
    this.view.off('update', this.handleUpdateInsumo);
    this.view.off('delete', this.handleDeleteInsumo);
    this.view.off('filter', this.handleFilterChange);
    this.view.off('load', this.handleLoadInsumos);
    this.view.off('select', this.handleSelectInsumo);
    this.view.off('cancel', this.handleCancelEdit);
  }
}
