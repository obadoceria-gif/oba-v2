/**
 * EstoqueController
 * 
 * Controlador para o módulo de estoque.
 * Gerencia a comunicação entre a camada de serviço e a camada de visualização.
 * 
 * Requirements:
 * - 3.9: Visualização de estoque atual
 * - 3.11: Histórico de movimentações
 */

import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class EstoqueController {
  /**
   * @param {EstoqueService} service - Serviço de estoque
   * @param {EstoqueView} view - View de estoque
   */
  constructor(service, view) {
    if (!service) {
      throw new Error('EstoqueService é obrigatório');
    }
    if (!view) {
      throw new Error('EstoqueView é obrigatório');
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
    this.handleCreateMovimentacao = this.handleCreateMovimentacao.bind(this);
    this.handleCheckEstoqueBaixo = this.handleCheckEstoqueBaixo.bind(this);
    this.handleLoadEstoques = this.handleLoadEstoques.bind(this);
    this.handleLoadMovimentacoes = this.handleLoadMovimentacoes.bind(this);
    this.handleSelectEstoque = this.handleSelectEstoque.bind(this);

    // Registrar handlers na view
    this.view.on('createMovimentacao', this.handleCreateMovimentacao);
    this.view.on('checkEstoqueBaixo', this.handleCheckEstoqueBaixo);
    this.view.on('loadEstoques', this.handleLoadEstoques);
    this.view.on('loadMovimentacoes', this.handleLoadMovimentacoes);
    this.view.on('selectEstoque', this.handleSelectEstoque);
  }

  /**
   * Handler para criação de movimentação (entrada ou saída)
   * @param {Object} data - Dados da movimentação
   */
  async handleCreateMovimentacao(data) {
    const loadingId = this.loading.show('Criando movimentação...');
    
    try {
      const result = await this.service.createMovimentacao(data);
      
      this.toast.success(
        `Movimentação de ${data.tipo} criada com sucesso!`
      );
      
      // Recarregar estoques e movimentações
      await this.handleLoadEstoques();
      await this.handleLoadMovimentacoes({ insumoId: data.insumoId });
      
      return result;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao criar movimentação');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para verificar estoque baixo
   * @param {Object} data - Objeto com insumoId e estoqueMinimo
   */
  async handleCheckEstoqueBaixo(data) {
    try {
      const { insumoId, estoqueMinimo } = data;
      
      const isAbaixo = await this.service.checkEstoqueBaixo(
        insumoId,
        estoqueMinimo
      );
      
      if (isAbaixo) {
        this.toast.warning('Estoque abaixo do mínimo!');
      }
      
      return isAbaixo;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao verificar estoque');
      throw error;
    }
  }

  /**
   * Handler para carregar todos os estoques
   */
  async handleLoadEstoques() {
    const loadingId = this.loading.show('Carregando estoques...');
    
    try {
      const estoques = await this.service.getAllEstoques();
      
      this.view.renderEstoquesList(estoques);
      
      return estoques;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar estoques');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar movimentações com filtros
   * @param {Object} filters - Filtros (insumoId, tipo, dataInicio, dataFim)
   */
  async handleLoadMovimentacoes(filters = {}) {
    const loadingId = this.loading.show('Carregando movimentações...');
    
    try {
      const movimentacoes = await this.service.getMovimentacoes(filters);
      
      this.view.renderMovimentacoesList(movimentacoes);
      
      return movimentacoes;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar movimentações');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para selecionar estoque (para visualização de detalhes)
   * @param {string} insumoId - ID do insumo
   */
  async handleSelectEstoque(insumoId) {
    try {
      const estoque = await this.service.getEstoqueByInsumoId(insumoId);
      
      if (!estoque) {
        this.toast.error('Estoque não encontrado');
        return;
      }
      
      // Carregar movimentações do insumo
      const movimentacoes = await this.service.getMovimentacoesByInsumo(
        insumoId
      );
      
      this.view.showEstoqueDetails(estoque, movimentacoes);
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar estoque');
      throw error;
    }
  }

  /**
   * Inicializa o controller
   * Carrega dados iniciais
   */
  async initialize() {
    try {
      await this.handleLoadEstoques();
    } catch (error) {
      console.error('Erro ao inicializar EstoqueController:', error);
      this.toast.error('Erro ao inicializar módulo de estoque');
    }
  }

  /**
   * Destrói o controller
   * Remove event handlers
   */
  destroy() {
    this.view.off('createMovimentacao', this.handleCreateMovimentacao);
    this.view.off('checkEstoqueBaixo', this.handleCheckEstoqueBaixo);
    this.view.off('loadEstoques', this.handleLoadEstoques);
    this.view.off('loadMovimentacoes', this.handleLoadMovimentacoes);
    this.view.off('selectEstoque', this.handleSelectEstoque);
  }
}
