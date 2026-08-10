/**
 * App.js - Aplicação Principal
 * 
 * Orquestra todos os módulos da aplicação:
 * - Insumos
 * - Estoque
 * - Compras
 * 
 * Responsabilidades:
 * - Inicializar StateManager
 * - Configurar EventBus
 * - Gerenciar navegação entre módulos
 * - Montar/desmontar views dinamicamente
 */

import { StateManager } from './core/state/StateManager.js';
import LocalStorageAdapter from './core/storage/LocalStorageAdapter.js';
import { eventBus } from './core/events/EventBus.js';
import { getToast } from './core/ui/Toast.js';
import { getLoading } from './core/ui/Loading.js';
import { getModal } from './core/ui/Modal.js';

// Insumos
import { InsumosView } from './modules/insumos/views/InsumosView.js';
import { InsumosController } from './modules/insumos/controllers/InsumosController.js';
import { InsumosService } from './modules/insumos/services/InsumosService.js';
import { InsumosRepository } from './modules/insumos/repositories/InsumosRepository.js';

// Estoque
import { EstoqueView } from './modules/estoque/views/EstoqueView.js';
import { EstoqueController } from './modules/estoque/controllers/EstoqueController.js';
import { EstoqueService } from './modules/estoque/services/EstoqueService.js';
import { EstoqueRepository } from './modules/estoque/repositories/EstoqueRepository.js';
import { MovimentacoesRepository } from './modules/estoque/repositories/MovimentacoesRepository.js';

// Compras
import { ComprasView } from './modules/compras/views/ComprasView.js';
import { ComprasController } from './modules/compras/controllers/ComprasController.js';
import { ComprasService } from './modules/compras/services/ComprasService.js';
import { ComprasRepository } from './modules/compras/repositories/ComprasRepository.js';

// Fornecedores
import { FornecedoresView } from './modules/fornecedores/views/FornecedoresView.js';
import { FornecedoresController } from './modules/fornecedores/controllers/FornecedoresController.js';
import { FornecedoresService } from './modules/fornecedores/services/FornecedoresService.js';
import { FornecedoresRepository } from './modules/fornecedores/repositories/FornecedoresRepository.js';

// Fichas Técnicas
import { FichasTecnicasView } from './modules/fichas-tecnicas/views/FichasTecnicasView.js';
import { FichasTecnicasController } from './modules/fichas-tecnicas/controllers/FichasTecnicasController.js';
import { FichasTecnicasService } from './modules/fichas-tecnicas/services/FichasTecnicasService.js';
import { FichasTecnicasRepository } from './modules/fichas-tecnicas/repositories/FichasTecnicasRepository.js';

// Produção
import { ProducaoView } from './modules/producao/views/ProducaoView.js';
import { ProducaoController } from './modules/producao/controllers/ProducaoController.js';
import { ProducaoService } from './modules/producao/services/ProducaoService.js';
import { ProducaoRepository } from './modules/producao/repositories/ProducaoRepository.js';

// Dashboard
import { DashboardView } from './modules/dashboard/views/DashboardView.js';
import { DashboardController } from './modules/dashboard/controllers/DashboardController.js';

export class App {
  constructor() {
    // Estado da aplicação
    this.stateManager = null;
    this.storage = null;
    
    // Controllers
    this.controllers = {
      dashboard: null,
      insumos: null,
      estoque: null,
      compras: null,
      fornecedores: null,
      fichasTecnicas: null,
      producao: null
    };
    
    // Views
    this.currentView = null;
    this.currentModule = null;
    
    // Containers
    this.menuContainer = null;
    this.contentContainer = null;
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    try {
      console.log('[App] Inicializando aplicação...');
      
      // 0. Expor Toast e Loading globalmente
      window.getToast = getToast;
      window.getLoading = getLoading;
      window.getModal = getModal;
      console.log('[App] Toast, Loading e Modal expostos globalmente');
      
      // 1. Renderizar estrutura da aplicação PRIMEIRO
      this.render();
      
      // 2. Inicializar storage e state manager
      await this.initializeState();
      
      // 3. Conectar EventBus ao Toast (CRÍTICO para notificações)
      this.setupEventBusToast();
      
      // 4. Inicializar controllers
      this.initializeControllers();
      
      // 5. Configurar navegação
      this.setupNavigation();
      
      // 6. Configurar navegação global
      this.setupGlobalNavigation();
      
      // 7. Carregar módulo inicial (Dashboard)
      await this.navigateTo('dashboard');
      
      console.log('[App] Aplicação inicializada com sucesso!');
    } catch (error) {
      console.error('[App] Erro ao inicializar aplicação:', error);
      this.showError('Erro ao inicializar aplicação. Por favor, recarregue a página.');
      throw error; // Re-lançar erro para testes
    }
  }

  /**
   * Conecta eventos do EventBus ao sistema de Toast
   * CRÍTICO: Sem isso, eventos 'error' e 'success' não mostram notificações
   */
  setupEventBusToast() {
    const toast = getToast();
    
    // Conectar evento de sucesso
    eventBus.on('success', ({ message }) => {
      console.log('[App] EventBus success:', message);
      toast.success(message);
    });
    
    // Conectar evento de erro
    eventBus.on('error', ({ message }) => {
      console.log('[App] EventBus error:', message);
      toast.error(message);
    });
    
    // Conectar evento de aviso
    eventBus.on('warning', ({ message }) => {
      console.log('[App] EventBus warning:', message);
      toast.warning(message);
    });
    
    // Conectar evento de info
    eventBus.on('info', ({ message }) => {
      console.log('[App] EventBus info:', message);
      toast.info(message);
    });
    
    console.log('[App] EventBus conectado ao Toast');
  }

  /**
   * Inicializa storage e state manager
   */
  async initializeState() {
    // Criar storage adapter
    this.storage = new LocalStorageAdapter();
    
    // Criar state manager com estado inicial
    // IMPORTANTE: Deve incluir TODOS os stores definidos no LocalStorageAdapter
    const initialState = {
      insumos: [],
      estoque: [],
      movimentacoes: [],
      compras: [],
      fornecedores: [],
      clientes: [],
      pedidos: [],
      fichas: [],
      producoes: []
    };
    
    this.stateManager = new StateManager(this.storage, initialState);
    
    // Tentar restaurar estado do storage
    try {
      await this.stateManager.restore();
      console.log('[App] Estado restaurado do storage');
    } catch (error) {
      console.warn('[App] Não foi possível restaurar estado:', error);
      // Continuar com estado inicial vazio
    }
    
    // Configurar persistência automática
    this.setupAutoPersist();
  }

  /**
   * Configura persistência automática do estado
   */
  setupAutoPersist() {
    // Persistir estado quando houver mudanças
    // IMPORTANTE: Deve incluir TODOS os stores definidos no LocalStorageAdapter
    const slices = ['insumos', 'estoque', 'movimentacoes', 'compras', 'fornecedores', 'clientes', 'pedidos', 'fichas', 'producoes'];
    
    slices.forEach(slice => {
      this.stateManager.subscribe(slice, async () => {
        try {
          await this.stateManager.persist();
        } catch (error) {
          console.error(`[App] Erro ao persistir estado da fatia "${slice}":`, error);
        }
      });
    });
  }

  /**
   * Inicializa controllers dos módulos
   */
  initializeControllers() {
    console.log('[App] Inicializando controllers...');
    
    // Insumos
    const insumosRepository = new InsumosRepository(this.storage, this.stateManager);
    const insumosService = new InsumosService(insumosRepository, eventBus);
    this.controllers.insumos = { 
      service: insumosService, 
      repository: insumosRepository,
      stateManager: this.stateManager 
    };
    
    // Estoque
    const estoqueRepository = new EstoqueRepository(this.storage, this.stateManager);
    const movimentacoesRepository = new MovimentacoesRepository(this.storage, this.stateManager);
    const estoqueService = new EstoqueService(
      estoqueRepository,
      movimentacoesRepository,
      insumosRepository,
      eventBus
    );
    this.controllers.estoque = { 
      service: estoqueService, 
      repository: estoqueRepository,
      stateManager: this.stateManager 
    };
    
    // Compras
    const comprasRepository = new ComprasRepository(this.storage, this.stateManager);
    const fornecedoresRepository = new FornecedoresRepository(this.storage, this.stateManager);
    const comprasService = new ComprasService(
      comprasRepository,
      fornecedoresRepository,
      insumosRepository,
      estoqueService,
      eventBus
    );
    this.controllers.compras = { 
      service: comprasService, 
      repository: comprasRepository,
      stateManager: this.stateManager 
    };
    
    // Fornecedores
    const fornecedoresService = new FornecedoresService(fornecedoresRepository, eventBus);
    this.controllers.fornecedores = {
      service: fornecedoresService,
      repository: fornecedoresRepository,
      stateManager: this.stateManager
    };
    
    // Fichas Técnicas
    const fichasTecnicasRepository = new FichasTecnicasRepository(this.storage, this.stateManager);
    const fichasTecnicasService = new FichasTecnicasService(
      fichasTecnicasRepository,
      eventBus,
      estoqueRepository
    );
    this.controllers.fichasTecnicas = { 
      service: fichasTecnicasService, 
      repository: fichasTecnicasRepository,
      stateManager: this.stateManager 
    };
    
    // Produção
    const producaoRepository = new ProducaoRepository(this.storage, this.stateManager);
    const producaoService = new ProducaoService(
      producaoRepository,
      eventBus,
      fichasTecnicasRepository,
      estoqueService
    );
    this.controllers.producao = { 
      service: producaoService, 
      repository: producaoRepository,
      stateManager: this.stateManager 
    };
    
    console.log('[App] Controllers inicializados');
  }

  /**
   * Renderiza estrutura principal da aplicação
   */
  render() {
    const appContainer = document.getElementById('app');
    
    if (!appContainer) {
      throw new Error('Container #app não encontrado');
    }
    
    appContainer.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="app-logo">
            <h1>🍰 OBA Doceria</h1>
            <p class="app-subtitle">Sistema de Gestão</p>
          </div>
          <nav id="app-menu" class="app-menu"></nav>
        </header>
        
        <main id="app-content" class="app-content"></main>
        
        <footer class="app-footer">
          <p>&copy; 2026 OBA Doceria - Sistema de Gestão v2.0</p>
        </footer>
      </div>
    `;
    
    // Usar querySelector no appContainer para garantir que encontramos os elementos
    this.menuContainer = appContainer.querySelector('#app-menu');
    this.contentContainer = appContainer.querySelector('#app-content');
    
    if (!this.menuContainer || !this.contentContainer) {
      throw new Error('Containers de menu ou conteúdo não encontrados');
    }
    
    // Renderizar menu
    this.renderMenu();
  }

  /**
   * Renderiza menu de navegação
   */
  renderMenu() {
    if (!this.menuContainer) {
      return;
    }
    
    const modules = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'insumos', label: 'Insumos', icon: '📦' },
      { id: 'estoque', label: 'Estoque', icon: '📊' },
      { id: 'compras', label: 'Compras', icon: '🛒' },
      { id: 'fornecedores', label: 'Fornecedores', icon: '🏢' },
      { id: 'fichas', label: 'Fichas Técnicas', icon: '📋' },
      { id: 'producao', label: 'Produção', icon: '🏭' }
    ];
    
    this.menuContainer.innerHTML = modules.map(module => `
      <button 
        type="button"
        class="menu-item ${this.currentModule === module.id ? 'active' : ''}" 
        data-module="${module.id}"
      >
        <span class="menu-icon">${module.icon}</span>
        <span class="menu-label">${module.label}</span>
      </button>
    `).join('');
  }

  /**
   * Configura navegação entre módulos
   */
  setupNavigation() {
    if (!this.menuContainer) {
      return;
    }
    
    this.menuContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.menu-item');
      if (button) {
        const module = button.dataset.module;
        this.navigateTo(module);
      }
    });
  }

  /**
   * Configura navegação global (para cards do dashboard)
   */
  setupGlobalNavigation() {
    window.addEventListener('navigate', (e) => {
      const { module } = e.detail;
      if (module) {
        this.navigateTo(module);
      }
    });
  }

  /**
   * Navega para um módulo específico
   * @param {string} moduleName - Nome do módulo ('insumos', 'estoque', 'compras')
   */
  async navigateTo(moduleName) {
    try {
      console.log(`[App] Navegando para módulo: ${moduleName}`);
      
      // Atualizar módulo atual PRIMEIRO (antes de renderMenu)
      this.currentModule = moduleName;
      
      // Desmontar view atual
      if (this.currentView && typeof this.currentView.destroy === 'function') {
        this.currentView.destroy();
        this.currentView = null;
      }
      
      // Limpar container (verificar se existe)
      if (this.contentContainer) {
        this.contentContainer.innerHTML = '';
      }
      
      // Atualizar menu
      this.renderMenu();
      
      // Montar nova view
      await this.mountView(moduleName);
      
    } catch (error) {
      console.error(`[App] Erro ao navegar para ${moduleName}:`, error);
      this.showError(`Erro ao carregar módulo ${moduleName}`);
      // Não re-lançar erro - já foi tratado e mostrado ao usuário
    }
  }

  /**
   * Monta a view de um módulo
   * @param {string} moduleName - Nome do módulo
   */
  async mountView(moduleName) {
    switch (moduleName) {
      case 'dashboard':
        await this.mountDashboardView();
        break;
        
      case 'insumos':
        await this.mountInsumosView();
        break;
        
      case 'estoque':
        await this.mountEstoqueView();
        break;
        
      case 'compras':
        await this.mountComprasView();
        break;
        
      case 'fornecedores':
        await this.mountFornecedoresView();
        break;
        
      case 'fichas':
        await this.mountFichasTecnicasView();
        break;
        
      case 'producao':
        await this.mountProducaoView();
        break;
        
      default:
        throw new Error(`Módulo desconhecido: ${moduleName}`);
    }
  }

  /**
   * Monta view do Dashboard
   */
  async mountDashboardView() {
    console.log('[App] Montando view do Dashboard...');
    
    // Criar view
    const view = new DashboardView(this.contentContainer);
    
    // Criar controller com stateManager e view
    const controller = new DashboardController(this.stateManager, view);
    
    // Inicializar controller (carrega dados e renderiza)
    await controller.initialize();
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.dashboard = { controller, view };
    
    console.log('[App] View do Dashboard montada com sucesso');
  }

  /**
   * Monta view de Insumos
   */
  async mountInsumosView() {
    console.log('[App] Montando view de Insumos...');
    
    // Criar view
    const view = new InsumosView(this.contentContainer);
    
    // Criar controller com service e view
    const controller = new InsumosController(
      this.controllers.insumos.service,
      view
    );
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Conectar subscriber do StateManager à view
    // Quando o estado de insumos mudar, atualizar a lista na view
    this.stateManager.subscribe('insumos', (insumos) => {
      if (view && typeof view.updateList === 'function') {
        view.updateList(insumos);
      }
    });
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.insumos.controller = controller;
    
    console.log('[App] View de Insumos montada com sucesso');
  }

  /**
   * Monta view de Estoque
   */
  async mountEstoqueView() {
    console.log('[App] Montando view de Estoque...');
    
    // Criar view
    const view = new EstoqueView(this.contentContainer);
    
    // Criar controller com service e view
    const controller = new EstoqueController(
      this.controllers.estoque.service,
      view
    );
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.estoque.controller = controller;
    
    console.log('[App] View de Estoque montada com sucesso');
  }

  /**
   * Monta view de Compras
   */
  async mountComprasView() {
    console.log('[App] Montando view de Compras...');
    
    // Criar um controller temporário para a view
    // (ComprasView precisa de um controller no construtor)
    const tempController = {
      handleCreateCompra: () => {},
      handleConfirmarCompra: () => {},
      handleCancelarCompra: () => {},
      handleLoadCompras: () => {},
      handleLoadComprasByFornecedor: () => {},
      handleLoadComprasByStatus: () => {},
      handleSelectCompra: () => {},
      getState: () => ({
        compras: this.stateManager.getState('compras') || [],
        fornecedores: this.stateManager.getState('fornecedores') || [],
        insumos: this.stateManager.getState('insumos') || []
      }),
      // Adicionar método on() para event handling
      on: () => {}
    };
    
    // Criar view com container e controller temporário
    const view = new ComprasView({
      container: this.contentContainer,
      controller: tempController
    });
    
    // Armazenar referência IMEDIATAMENTE (antes de aguardar init)
    this.currentView = view;
    
    // Aguardar inicialização da view (ela chama init() no construtor)
    // Dar tempo para o init() assíncrono completar
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Criar controller real com service e view
    const controller = new ComprasController(
      this.controllers.compras.service,
      view
    );
    
    // Substituir controller temporário pelo real na view
    view.controller = controller;
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Armazenar referência do controller
    this.controllers.compras.controller = controller;
    
    console.log('[App] View de Compras montada com sucesso');
  }

  /**
   * Monta view de Fornecedores
   */
  async mountFornecedoresView() {
    console.log('[App] Montando view de Fornecedores...');
    
    // Criar view
    const view = new FornecedoresView(this.contentContainer);
    
    // Criar controller com service e view
    const controller = new FornecedoresController(
      this.controllers.fornecedores.service,
      view
    );
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.fornecedores.controller = controller;
    
    console.log('[App] View de Fornecedores montada com sucesso');
  }

  /**
   * Monta view de Fichas Técnicas
   */
  async mountFichasTecnicasView() {
    console.log('[App] Montando view de Fichas Técnicas...');
    
    // Criar view
    const view = new FichasTecnicasView(this.contentContainer);
    
    // Atualizar lista de insumos na view (necessário para o formulário)
    const insumos = this.stateManager.getState('insumos') || [];
    view.updateInsumos(insumos);
    
    // Criar controller com service e view
    const controller = new FichasTecnicasController(
      this.controllers.fichasTecnicas.service,
      view
    );
    
    // Conectar eventos do EventBus ao controller
    eventBus.on('ficha:create', async ({ data }) => {
      await controller.handleCreateFicha(data);
    });
    
    eventBus.on('ficha:update', async ({ fichaId, data }) => {
      await controller.handleUpdateFicha(fichaId, data);
    });
    
    eventBus.on('ficha:delete', async ({ fichaId }) => {
      await controller.handleDeleteFicha(fichaId);
    });
    
    eventBus.on('ficha:calculate', async ({ fichaId }) => {
      await controller.handleCalculateCustos(fichaId);
    });
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Conectar subscriber do StateManager à view
    this.stateManager.subscribe('fichas', (fichas) => {
      if (view && typeof view.renderFichasList === 'function') {
        view.renderFichasList(fichas);
      }
    });
    
    // Atualizar insumos quando mudarem
    this.stateManager.subscribe('insumos', (insumos) => {
      if (view && typeof view.updateInsumos === 'function') {
        view.updateInsumos(insumos);
      }
    });
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.fichasTecnicas.controller = controller;
    
    console.log('[App] View de Fichas Técnicas montada com sucesso');
  }

  /**
   * Monta view de Produção
   */
  async mountProducaoView() {
    console.log('[App] Montando view de Produção...');
    
    // Criar view
    const view = new ProducaoView(this.contentContainer);
    
    // Atualizar lista de fichas técnicas na view (necessário para o formulário)
    const fichas = this.stateManager.getState('fichas') || [];
    view.updateFichas(fichas);
    
    // Criar controller com service e view
    const controller = new ProducaoController(
      this.controllers.producao.service,
      view
    );
    
    // Conectar eventos do EventBus ao controller
    eventBus.on('producao:create', async ({ data }) => {
      await controller.handleCreateProducao(data);
    });
    
    eventBus.on('producao:iniciar', async ({ producaoId }) => {
      await controller.handleIniciarProducao(producaoId);
    });
    
    eventBus.on('producao:concluir', async ({ producaoId }) => {
      await controller.handleConcluirProducao(producaoId);
    });
    
    eventBus.on('producao:cancelar', async ({ producaoId }) => {
      await controller.handleCancelarProducao(producaoId);
    });
    
    eventBus.on('producao:cancel', () => {
      const producoes = this.stateManager.getState('producoes') || [];
      view.renderProducoesList(producoes);
    });
    
    // Inicializar controller (carrega dados iniciais)
    await controller.initialize();
    
    // Conectar subscriber do StateManager à view
    this.stateManager.subscribe('producoes', (producoes) => {
      if (view && typeof view.renderProducoesList === 'function') {
        view.renderProducoesList(producoes);
      }
    });
    
    // Atualizar fichas quando mudarem
    this.stateManager.subscribe('fichas', (fichas) => {
      if (view && typeof view.updateFichas === 'function') {
        view.updateFichas(fichas);
      }
    });
    
    // Armazenar referências
    this.currentView = view;
    this.controllers.producao.controller = controller;
    
    console.log('[App] View de Produção montada com sucesso');
  }

  /**
   * Mostra mensagem de erro
   * @param {string} message - Mensagem de erro
   */
  showError(message) {
    // Implementação simples com alert
    // Em produção, usar um sistema de notificações mais sofisticado
    if (typeof window !== 'undefined' && window.alert) {
      alert(`Erro: ${message}`);
    } else {
      console.error(`Erro: ${message}`);
    }
  }

  /**
   * Mostra diálogo de confirmação
   * @param {string} message - Mensagem de confirmação
   * @returns {Promise<boolean>} - True se confirmado
   */
  async confirm(message) {
    if (typeof window !== 'undefined' && window.getModal) {
      const modal = window.getModal();
      return await modal.confirm('Confirmação', message);
    }
    // Em ambiente de teste, retornar true por padrão
    return true;
  }

  /**
   * Destrói a aplicação
   */
  destroy() {
    // Desmontar view atual
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
      this.currentView = null; // Importante: setar para null
    }
    
    // Limpar event bus
    eventBus.clear();
    
    // Limpar state manager
    if (this.stateManager) {
      this.stateManager.clear();
    }
    
    console.log('[App] Aplicação destruída');
  }
}
