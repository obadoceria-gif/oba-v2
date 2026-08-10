/**
 * FornecedoresController
 * 
 * Controlador para gerenciar interações entre Service e View de fornecedores.
 */

export class FornecedoresController {
  /**
   * @param {FornecedoresService} service - Serviço de fornecedores
   * @param {FornecedoresView} view - View de fornecedores
   */
  constructor(service, view) {
    if (!service) {
      throw new Error('Service é obrigatório');
    }
    if (!view) {
      throw new Error('View é obrigatório');
    }

    this.service = service;
    this.view = view;
    this.currentFilter = 'todos'; // todos, ativos, inativos
  }

  /**
   * Inicializa o controller
   */
  async initialize() {
    try {
      console.log('[FornecedoresController] Inicializando...');

      // Conectar eventos da view
      this.attachViewListeners();

      // Carregar dados iniciais
      await this.handleLoadFornecedores();
      await this.handleLoadEstatisticas();

      console.log('[FornecedoresController] Inicializado com sucesso');
    } catch (error) {
      console.error('[FornecedoresController] Erro ao inicializar:', error);
      this.view.showError('Erro ao carregar fornecedores');
    }
  }

  /**
   * Conecta listeners de eventos da view
   */
  attachViewListeners() {
    // Eventos de CRUD
    this.view.on('fornecedor:create', (data) => this.handleCreateFornecedor(data));
    this.view.on('fornecedor:update', ({ id, data }) => this.handleUpdateFornecedor(id, data));
    this.view.on('fornecedor:delete', ({ id }) => this.handleDeleteFornecedor(id));
    this.view.on('fornecedor:desativar', ({ id }) => this.handleDesativarFornecedor(id));
    this.view.on('fornecedor:ativar', ({ id }) => this.handleAtivarFornecedor(id));
    
    // Eventos de navegação
    this.view.on('fornecedor:select', ({ id }) => this.handleSelectFornecedor(id));
    this.view.on('fornecedor:search', ({ termo }) => this.handleSearchFornecedores(termo));
    this.view.on('fornecedor:filter', ({ filtro }) => this.handleFilterChange(filtro));
    
    // Eventos de refresh
    this.view.on('fornecedor:refresh', () => this.handleLoadFornecedores());
  }

  /**
   * Handler para criar fornecedor
   * @param {Object} data - Dados do fornecedor
   */
  async handleCreateFornecedor(data) {
    try {
      this.view.showLoading('Criando fornecedor...');

      const fornecedor = await this.service.createFornecedor(data);

      this.view.hideLoading();
      this.view.showSuccess('Fornecedor criado com sucesso!');

      // Recarregar lista
      await this.handleLoadFornecedores();
      await this.handleLoadEstatisticas();

    } catch (error) {
      this.view.hideLoading();
      console.error('[FornecedoresController] Erro ao criar fornecedor:', error);
      this.view.showError(error.message || 'Erro ao criar fornecedor');
    }
  }

  /**
   * Handler para atualizar fornecedor
   * @param {string} id - ID do fornecedor
   * @param {Object} data - Dados atualizados
   */
  async handleUpdateFornecedor(id, data) {
    try {
      this.view.showLoading('Atualizando fornecedor...');

      const fornecedor = await this.service.updateFornecedor(id, data);

      this.view.hideLoading();
      this.view.showSuccess('Fornecedor atualizado com sucesso!');

      // Recarregar lista
      await this.handleLoadFornecedores();

    } catch (error) {
      this.view.hideLoading();
      console.error('[FornecedoresController] Erro ao atualizar fornecedor:', error);
      this.view.showError(error.message || 'Erro ao atualizar fornecedor');
    }
  }

  /**
   * Handler para excluir fornecedor
   * @param {string} id - ID do fornecedor
   */
  async handleDeleteFornecedor(id) {
    try {
      // Confirmar exclusão
      const confirmed = await this.view.confirm(
        'Tem certeza que deseja excluir este fornecedor?',
        'Esta ação não pode ser desfeita.'
      );

      if (!confirmed) {
        return;
      }

      this.view.showLoading('Excluindo fornecedor...');

      await this.service.deleteFornecedor(id);

      this.view.hideLoading();
      this.view.showSuccess('Fornecedor excluído com sucesso!');

      // Recarregar lista
      await this.handleLoadFornecedores();
      await this.handleLoadEstatisticas();

    } catch (error) {
      this.view.hideLoading();
      console.error('[FornecedoresController] Erro ao excluir fornecedor:', error);
      this.view.showError(error.message || 'Erro ao excluir fornecedor');
    }
  }

  /**
   * Handler para desativar fornecedor
   * @param {string} id - ID do fornecedor
   */
  async handleDesativarFornecedor(id) {
    try {
      this.view.showLoading('Desativando fornecedor...');

      await this.service.desativarFornecedor(id);

      this.view.hideLoading();
      this.view.showSuccess('Fornecedor desativado com sucesso!');

      // Recarregar lista
      await this.handleLoadFornecedores();
      await this.handleLoadEstatisticas();

    } catch (error) {
      this.view.hideLoading();
      console.error('[FornecedoresController] Erro ao desativar fornecedor:', error);
      this.view.showError(error.message || 'Erro ao desativar fornecedor');
    }
  }

  /**
   * Handler para ativar fornecedor
   * @param {string} id - ID do fornecedor
   */
  async handleAtivarFornecedor(id) {
    try {
      this.view.showLoading('Ativando fornecedor...');

      await this.service.ativarFornecedor(id);

      this.view.hideLoading();
      this.view.showSuccess('Fornecedor ativado com sucesso!');

      // Recarregar lista
      await this.handleLoadFornecedores();
      await this.handleLoadEstatisticas();

    } catch (error) {
      this.view.hideLoading();
      console.error('[FornecedoresController] Erro ao ativar fornecedor:', error);
      this.view.showError(error.message || 'Erro ao ativar fornecedor');
    }
  }

  /**
   * Handler para carregar fornecedores
   */
  async handleLoadFornecedores() {
    try {
      let fornecedores;

      // Aplicar filtro atual
      switch (this.currentFilter) {
        case 'ativos':
          fornecedores = await this.service.getFornecedoresAtivos();
          break;
        case 'inativos':
          fornecedores = await this.service.getFornecedoresInativos();
          break;
        default:
          fornecedores = await this.service.getAllFornecedores();
      }

      this.view.updateList(fornecedores);

    } catch (error) {
      console.error('[FornecedoresController] Erro ao carregar fornecedores:', error);
      this.view.showError('Erro ao carregar fornecedores');
    }
  }

  /**
   * Handler para buscar fornecedores
   * @param {string} termo - Termo de busca
   */
  async handleSearchFornecedores(termo) {
    try {
      const fornecedores = await this.service.searchFornecedores(termo);
      this.view.updateList(fornecedores);

    } catch (error) {
      console.error('[FornecedoresController] Erro ao buscar fornecedores:', error);
      this.view.showError('Erro ao buscar fornecedores');
    }
  }

  /**
   * Handler para mudança de filtro
   * @param {string} filtro - Filtro selecionado (todos, ativos, inativos)
   */
  async handleFilterChange(filtro) {
    try {
      this.currentFilter = filtro;
      await this.handleLoadFornecedores();

    } catch (error) {
      console.error('[FornecedoresController] Erro ao aplicar filtro:', error);
      this.view.showError('Erro ao aplicar filtro');
    }
  }

  /**
   * Handler para selecionar fornecedor (ver detalhes)
   * @param {string} id - ID do fornecedor
   */
  async handleSelectFornecedor(id) {
    try {
      const fornecedor = await this.service.getFornecedorById(id);
      if (!fornecedor) {
        this.view.showError('Fornecedor não encontrado');
        return;
      }

      const stats = await this.service.getEstatisticasFornecedor(id);
      this.view.showDetails(fornecedor, stats);

    } catch (error) {
      console.error('[FornecedoresController] Erro ao carregar detalhes:', error);
      this.view.showError('Erro ao carregar detalhes do fornecedor');
    }
  }

  /**
   * Handler para carregar estatísticas
   */
  async handleLoadEstatisticas() {
    try {
      const stats = await this.service.getEstatisticas();
      this.view.updateStats(stats);

    } catch (error) {
      console.error('[FornecedoresController] Erro ao carregar estatísticas:', error);
      // Não mostrar erro ao usuário, apenas logar
    }
  }

  /**
   * Destrói o controller
   */
  destroy() {
    // Limpar listeners se necessário
    console.log('[FornecedoresController] Destruído');
  }
}
