/**
 * ComprasView - View principal do módulo de compras
 * Orquestra todos os componentes e gerencia o estado da view
 */

import { eventBus } from '../../../core/events/EventBus.js';
import { ComprasController } from '../controllers/ComprasController.js';
import { CompraForm } from '../components/CompraForm.js';
import { CompraList } from '../components/CompraList.js';
import { CompraDetails } from '../components/CompraDetails.js';
import { FornecedorInlineForm } from '../../fornecedores/components/FornecedorInlineForm.js';

export class ComprasView {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Container principal
   * @param {ComprasController} options.controller - Controller de compras
   */
  constructor({ container, controller }) {
    if (!container) {
      throw new Error('Container é obrigatório');
    }
    if (!controller) {
      throw new Error('Controller é obrigatório');
    }

    this.container = container;
    this.controller = controller;
    this.eventBus = eventBus;
    
    // Estado da view
    this.currentView = 'list'; // 'list' | 'form'
    this.components = {
      form: null,
      list: null,
      details: null
    };

    this.init();
  }

  /**
   * Inicializa a view
   */
  async init() {
    try {
      // Carrega dados iniciais
      await this.loadData();

      // Renderiza estrutura
      this.render();

      // Anexa event listeners
      this.attachEventListeners();

      // Renderiza view inicial
      this.showList();
    } catch (error) {
      console.error('Erro ao inicializar ComprasView:', error);
      this.showError('Erro ao carregar módulo de compras');
    }
  }

  /**
   * Carrega dados iniciais
   */
  async loadData() {
    // Dados já estão no controller via StateManager
    // Apenas garantimos que estão carregados
    const state = this.controller.getState();
    if (!state.compras || !state.fornecedores) {
      throw new Error('Dados não carregados no controller');
    }
  }

  /**
   * Renderiza estrutura principal
   */
  render() {
    this.container.innerHTML = `
      <div class="compras-view">
        <div class="compras-header">
          <h1>Gestão de Compras</h1>
          <button type="button" id="toggle-view-btn" class="btn-primary">
            Nova Compra
          </button>
        </div>
        <div id="compras-content" class="compras-content"></div>
        <div id="compras-modal" class="compras-modal"></div>
      </div>
    `;
  }

  /**
   * Anexa event listeners globais
   */
  attachEventListeners() {
    // Botão de toggle entre lista e formulário
    const toggleBtn = this.container.querySelector('#toggle-view-btn');
    toggleBtn?.addEventListener('click', () => this.toggleView());

    // Eventos do EventBus
    this.eventBus.on('compra:create', this.handleCreateCompra.bind(this));
    this.eventBus.on('compra:cancel', this.handleCancelForm.bind(this));
    this.eventBus.on('compra:view', this.handleViewCompra.bind(this));
    this.eventBus.on('compra:receive', this.handleReceiveCompra.bind(this));
    this.eventBus.on('compra:details:close', this.handleCloseDetails.bind(this));
    this.eventBus.on('fornecedor:create', this.handleCreateFornecedor.bind(this));
    this.eventBus.on('insumo:create', this.handleCreateInsumo.bind(this));
    this.eventBus.on('error', this.handleError.bind(this));
    this.eventBus.on('success', this.handleSuccess.bind(this));

    // Eventos do StateManager
    this.eventBus.on('state:compras:updated', this.handleComprasUpdated.bind(this));
    this.eventBus.on('state:fornecedores:updated', this.handleFornecedoresUpdated.bind(this));
    this.eventBus.on('state:insumos:updated', this.handleInsumosUpdated.bind(this));
  }

  /**
   * Alterna entre lista e formulário
   */
  toggleView() {
    if (this.currentView === 'list') {
      this.showForm();
    } else {
      this.showList();
    }
  }

  /**
   * Mostra a lista de compras
   */
  showList() {
    this.currentView = 'list';
    
    // Atualiza botão
    const toggleBtn = this.container.querySelector('#toggle-view-btn');
    if (toggleBtn) {
      toggleBtn.textContent = 'Nova Compra';
    }

    // Destrói formulário se existir
    if (this.components.form) {
      this.components.form.destroy();
      this.components.form = null;
    }

    // Cria/atualiza lista
    const contentContainer = this.container.querySelector('#compras-content');
    const state = this.controller.getState();

    if (!this.components.list) {
      this.components.list = new CompraList({
        container: contentContainer,
        compras: state.compras,
        fornecedores: state.fornecedores
      });
    } else {
      this.components.list.updateCompras(state.compras);
      this.components.list.updateFornecedores(state.fornecedores);
    }
  }

  /**
   * Mostra o formulário de nova compra
   */
  showForm() {
    this.currentView = 'form';

    // Atualiza botão
    const toggleBtn = this.container.querySelector('#toggle-view-btn');
    if (toggleBtn) {
      toggleBtn.textContent = 'Voltar para Lista';
    }

    // Destrói lista se existir
    if (this.components.list) {
      this.components.list.destroy();
      this.components.list = null;
    }

    // Cria formulário
    const contentContainer = this.container.querySelector('#compras-content');
    const state = this.controller.getState();

    this.components.form = new CompraForm({
      container: contentContainer,
      fornecedores: state.fornecedores,
      insumos: state.insumos
    });
  }

  /**
   * Manipula criação de compra
   */
  async handleCreateCompra(data) {
    try {
      await this.controller.createCompra(data);
      this.showSuccess('Compra criada com sucesso!');
      this.showList();
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      this.showError(error.message || 'Erro ao criar compra');
    }
  }

  /**
   * Manipula criação de fornecedor inline
   */
  async handleCreateFornecedor(fornecedorData) {
    try {
      await this.controller.handleCreateFornecedor(fornecedorData);
      this.showSuccess(`Fornecedor "${fornecedorData.nome}" cadastrado com sucesso!`);
      
      // Atualiza dropdown do formulário se estiver aberto
      if (this.components.form) {
        const state = this.controller.getState();
        this.components.form.updateFornecedores(state.fornecedores);
        
        // Seleciona o fornecedor recém-criado
        const fornecedorSelect = this.components.form.container.querySelector('#fornecedor-select');
        if (fornecedorSelect && state.fornecedores.length > 0) {
          const novoFornecedor = state.fornecedores[state.fornecedores.length - 1];
          fornecedorSelect.value = novoFornecedor.id;
        }
      }
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      this.showError(error.message || 'Erro ao criar fornecedor');
    }
  }

  /**
   * Manipula criação de insumo inline
   */
  async handleCreateInsumo(insumoData) {
    try {
      await this.controller.handleCreateInsumo(insumoData);
      this.showSuccess(`Insumo "${insumoData.nome}" cadastrado com sucesso!`);
      
      // Atualiza dropdown do formulário se estiver aberto
      if (this.components.form) {
        const state = this.controller.getState();
        this.components.form.updateInsumos(state.insumos);
        
        // Seleciona o insumo recém-criado
        const insumoSelect = this.components.form.container.querySelector('#insumo-select');
        if (insumoSelect && state.insumos.length > 0) {
          const novoInsumo = state.insumos[state.insumos.length - 1];
          insumoSelect.value = novoInsumo.id;
        }
      }
    } catch (error) {
      console.error('Erro ao criar insumo:', error);
      this.showError(error.message || 'Erro ao criar insumo');
    }
  }

  /**
   * Manipula cancelamento do formulário
   */
  handleCancelForm() {
    this.showList();
  }

  /**
   * Manipula visualização de detalhes
   */
  handleViewCompra({ compraId }) {
    const state = this.controller.getState();
    const compra = state.compras.find(c => c.id === compraId);
    
    if (!compra) {
      this.showError('Compra não encontrada');
      return;
    }

    const fornecedor = state.fornecedores.find(f => f.id === compra.fornecedorId);
    const modalContainer = this.container.querySelector('#compras-modal');

    // Destrói modal anterior se existir
    if (this.components.details) {
      this.components.details.destroy();
    }

    // Cria novo modal
    this.components.details = new CompraDetails({
      container: modalContainer,
      compra,
      fornecedor,
      insumos: state.insumos
    });
  }

  /**
   * Manipula recebimento de compra
   */
  async handleReceiveCompra({ compraId }) {
    try {
      await this.controller.receiveCompra(compraId);
      this.showSuccess('Compra marcada como recebida!');
      
      // Fecha modal se estiver aberto
      if (this.components.details) {
        this.components.details.destroy();
        this.components.details = null;
      }
    } catch (error) {
      console.error('Erro ao receber compra:', error);
      this.showError(error.message || 'Erro ao receber compra');
    }
  }

  /**
   * Manipula cancelamento de compra
   */
  async handleCancelCompra({ compraId, motivo }) {
    try {
      await this.controller.cancelCompra(compraId, motivo);
      this.showSuccess('Compra cancelada!');
      
      // Fecha modal se estiver aberto
      if (this.components.details) {
        this.components.details.destroy();
        this.components.details = null;
      }
    } catch (error) {
      console.error('Erro ao cancelar compra:', error);
      this.showError(error.message || 'Erro ao cancelar compra');
    }
  }

  /**
   * Manipula fechamento do modal de detalhes
   */
  handleCloseDetails() {
    if (this.components.details) {
      this.components.details.destroy();
      this.components.details = null;
    }
  }

  /**
   * Manipula atualização de compras no estado
   */
  handleComprasUpdated({ compras }) {
    if (this.components.list) {
      this.components.list.updateCompras(compras);
    }
  }

  /**
   * Manipula atualização de fornecedores no estado
   */
  handleFornecedoresUpdated({ fornecedores }) {
    if (this.components.list) {
      this.components.list.updateFornecedores(fornecedores);
    }
    if (this.components.form) {
      this.components.form.updateFornecedores(fornecedores);
    }
  }

  /**
   * Manipula atualização de insumos no estado
   */
  handleInsumosUpdated({ insumos }) {
    if (this.components.form) {
      this.components.form.updateInsumos(insumos);
    }
  }

  /**
   * Manipula erros
   * FIX: Usar Toast diretamente ao invés de re-emitir evento
   */
  handleError({ message }) {
    // Importar Toast dinamicamente para evitar circular dependency
    import('../../../core/ui/Toast.js').then(({ getToast }) => {
      const toast = getToast();
      toast.error(message);
    });
  }

  /**
   * Manipula sucessos
   * FIX: Usar Toast diretamente ao invés de re-emitir evento
   */
  handleSuccess({ message }) {
    // Importar Toast dinamicamente para evitar circular dependency
    import('../../../core/ui/Toast.js').then(({ getToast }) => {
      const toast = getToast();
      toast.success(message);
    });
  }

  /**
   * Renderiza lista de compras
   */
  renderComprasList(compras) {
    console.log(`[ComprasView] renderComprasList chamado com ${compras.length} compras`);
    if (this.components.list) {
      this.components.list.updateCompras(compras);
    }
  }

  /**
   * Renderiza estatísticas
   */
  renderEstatisticas(stats) {
    console.log('[ComprasView] renderEstatisticas chamado', stats);
    // Implementar quando houver componente de estatísticas
  }

  /**
   * Mostra detalhes de uma compra
   */
  showCompraDetails(compra) {
    console.log('[ComprasView] showCompraDetails chamado', compra);
    // Já implementado em handleViewCompra
    this.handleViewCompra({ compraId: compra.id });
  }

  /**
   * Mostra indicador de loading
   */
  showLoading(message = 'Carregando...') {
    // Implementação simples - em produção usar spinner/overlay
    console.log(`[ComprasView] Loading: ${message}`);
  }

  /**
   * Esconde indicador de loading
   */
  hideLoading() {
    // Implementação simples - em produção remover spinner/overlay
    console.log('[ComprasView] Loading concluído');
  }

  /**
   * Mostra mensagem de erro
   * FIX: Usar Toast diretamente ao invés de re-emitir evento (evita loop)
   */
  showError(message) {
    // Importar Toast dinamicamente para evitar circular dependency
    import('../../../core/ui/Toast.js').then(({ getToast }) => {
      const toast = getToast();
      toast.error(message);
    });
  }

  /**
   * Mostra mensagem de sucesso
   * FIX: Usar Toast diretamente ao invés de re-emitir evento (evita loop)
   */
  showSuccess(message) {
    // Importar Toast dinamicamente para evitar circular dependency
    import('../../../core/ui/Toast.js').then(({ getToast }) => {
      const toast = getToast();
      toast.success(message);
    });
  }

  /**
   * Destrói a view
   */
  destroy() {
    // Remove event listeners
    this.eventBus.off('compra:create', this.handleCreateCompra);
    this.eventBus.off('compra:cancel', this.handleCancelForm);
    this.eventBus.off('compra:view', this.handleViewCompra);
    this.eventBus.off('compra:receive', this.handleReceiveCompra);
    this.eventBus.off('compra:details:close', this.handleCloseDetails);
    this.eventBus.off('fornecedor:create', this.handleCreateFornecedor);
    this.eventBus.off('insumo:create', this.handleCreateInsumo);
    this.eventBus.off('error', this.handleError);
    this.eventBus.off('success', this.handleSuccess);
    this.eventBus.off('state:compras:updated', this.handleComprasUpdated);
    this.eventBus.off('state:fornecedores:updated', this.handleFornecedoresUpdated);
    this.eventBus.off('state:insumos:updated', this.handleInsumosUpdated);

    // Destrói componentes
    if (this.components.form && typeof this.components.form.destroy === 'function') {
      this.components.form.destroy();
    }
    if (this.components.list && typeof this.components.list.destroy === 'function') {
      this.components.list.destroy();
    }
    if (this.components.details && typeof this.components.details.destroy === 'function') {
      this.components.details.destroy();
    }

    // Limpa container
    this.container.innerHTML = '';
  }
}
