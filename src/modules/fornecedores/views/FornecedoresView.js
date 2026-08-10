/**
 * FornecedoresView
 * 
 * View principal do módulo de fornecedores.
 * Orquestra todos os componentes e gerencia estado da UI.
 */

import { FornecedorList } from '../components/FornecedorList.js';
import { FornecedorForm } from '../components/FornecedorForm.js';
import { FornecedorStats } from '../components/FornecedorStats.js';
import { getModal } from '../../../core/ui/Modal.js';
import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class FornecedoresView {
  /**
   * @param {HTMLElement} container - Container principal
   */
  constructor(container) {
    this.container = container;
    this.listeners = {};
    this.components = {
      stats: null,
      list: null,
      form: null
    };
    this.isInitialized = false; // Flag para evitar re-inicialização
    
    this.modal = getModal();
    this.toast = getToast();
    this.loading = getLoading();
    this.loadingId = null;

    this.render();
  }

  /**
   * Renderiza a view principal
   */
  render() {
    console.log('[FornecedoresView] Iniciando render...');
    
    if (!this.container) {
      console.error('[FornecedoresView] Container não encontrado');
      return;
    }

    console.log('[FornecedoresView] Renderizando HTML...');
    this.container.innerHTML = `
      <div class="fornecedores-view">
        <!-- Header -->
        <div class="fornecedores-header">
          <div class="fornecedores-title">
            <h2>📦 Fornecedores</h2>
            <p class="text-muted">Gerencie seus fornecedores de insumos</p>
          </div>
          <div class="fornecedores-actions">
            <button type="button" class="btn btn-primary btn-new-fornecedor">
              ➕ Novo Fornecedor
            </button>
          </div>
        </div>

        <!-- Estatísticas -->
        <div id="fornecedores-stats" class="fornecedores-stats-container"></div>

        <!-- Busca e Filtros -->
        <div class="fornecedores-filters">
          <div class="search-box">
            <input 
              type="text" 
              id="fornecedor-search" 
              class="form-control" 
              placeholder="🔍 Buscar por nome, email ou telefone..."
            >
          </div>
          <div class="filter-buttons">
            <button type="button" class="btn btn-filter active" data-filter="todos">
              Todos
            </button>
            <button type="button" class="btn btn-filter" data-filter="ativos">
              Ativos
            </button>
            <button type="button" class="btn btn-filter" data-filter="inativos">
              Inativos
            </button>
          </div>
        </div>

        <!-- Lista de Fornecedores -->
        <div id="fornecedores-list" class="fornecedores-list-container"></div>
      </div>
    `;

    console.log('[FornecedoresView] HTML renderizado, inicializando componentes...');
    this.initializeComponents();
    
    console.log('[FornecedoresView] Anexando event listeners...');
    this.attachEventListeners();
    
    console.log('[FornecedoresView] Render concluído');
  }

  /**
   * Inicializa os componentes
   */
  initializeComponents() {
    // Evitar re-inicialização
    if (this.isInitialized) {
      console.log('[FornecedoresView] Componentes já inicializados, pulando...');
      return;
    }

    try {
      console.log('[FornecedoresView] Inicializando componentes...');
      
      // Estatísticas
      const statsContainer = this.container.querySelector('#fornecedores-stats');
      if (statsContainer) {
        console.log('[FornecedoresView] Criando FornecedorStats...');
        this.components.stats = new FornecedorStats(statsContainer);
        this.components.stats.render();
        console.log('[FornecedoresView] FornecedorStats criado');
      } else {
        console.warn('[FornecedoresView] Container de stats não encontrado');
      }

      // Lista
      const listContainer = this.container.querySelector('#fornecedores-list');
      if (listContainer) {
        console.log('[FornecedoresView] Criando FornecedorList...');
        this.components.list = new FornecedorList(listContainer, []);
        
        // Conectar eventos da lista
        this.components.list.on('fornecedor:view', ({ id }) => {
          this.emit('fornecedor:select', { id });
        });

        this.components.list.on('fornecedor:edit', ({ id }) => {
          this.showEditForm(id);
        });

        this.components.list.on('fornecedor:delete', ({ id }) => {
          this.emit('fornecedor:delete', { id });
        });

        this.components.list.on('fornecedor:desativar', ({ id }) => {
          this.emit('fornecedor:desativar', { id });
        });

        this.components.list.on('fornecedor:ativar', ({ id }) => {
          this.emit('fornecedor:ativar', { id });
        });
        
        // NÃO renderizar aqui - deixar o controller chamar updateList() quando tiver dados
        // this.components.list.render(); ← REMOVIDO para evitar loop infinito
        console.log('[FornecedoresView] FornecedorList criado (render será chamado pelo controller)');
      } else {
        console.warn('[FornecedoresView] Container de lista não encontrado');
      }
      
      this.isInitialized = true; // Marcar como inicializado
      console.log('[FornecedoresView] Componentes inicializados com sucesso');
    } catch (error) {
      console.error('[FornecedoresView] Erro ao inicializar componentes:', error);
    }
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    // Botão novo fornecedor
    const btnNew = this.container.querySelector('.btn-new-fornecedor');
    if (btnNew) {
      btnNew.addEventListener('click', () => this.showCreateForm());
    }

    // Busca
    const searchInput = this.container.querySelector('#fornecedor-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.emit('fornecedor:search', { termo: e.target.value });
        }, 300);
      });
    }

    // Filtros
    const filterButtons = this.container.querySelectorAll('.btn-filter');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Atualizar botão ativo
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Emitir evento
        const filtro = e.target.dataset.filter;
        this.emit('fornecedor:filter', { filtro });
      });
    });
  }

  /**
   * Mostra formulário de criação
   */
  showCreateForm() {
  // Abrir o modal global primeiro
  this.modal.show('Novo Fornecedor', '');

  // Obter o body REAL do modal exibido
  const modalBody = this.modal.overlay.querySelector('.modal-body');

  if (!modalBody) {
    console.error('[FornecedoresView] Body do modal não encontrado');
    return;
  }

  // Criar o formulário diretamente no DOM real
  const form = new FornecedorForm(modalBody, null);

  form.on('fornecedor:create', (data) => {
    this.modal.close();
    this.emit('fornecedor:create', data);
  });

  form.on('fornecedor:cancel', () => {
    this.modal.close();
  });

  form.render();
}
  /**
   * Mostra formulário de edição
   * @param {string} id - ID do fornecedor
   */
  async showEditForm(id) {
    // Emitir evento para controller buscar fornecedor
    this.emit('fornecedor:requestEdit', { id });
  }

  /**
   * Mostra formulário de edição com dados do fornecedor
   * @param {Fornecedor} fornecedor
   */
  showEditFormWithData(fornecedor) {
  // Abrir primeiro o modal global
  this.modal.show('Editar Fornecedor', '');

  // Obter o body REAL do modal exibido
  const modalBody = this.modal.overlay.querySelector('.modal-body');

  if (!modalBody) {
    console.error('[FornecedoresView] Body do modal não encontrado');
    return;
  }

  // Criar o formulário diretamente no DOM real
  const form = new FornecedorForm(modalBody, fornecedor);

  form.on('fornecedor:update', ({ id, data }) => {
    this.modal.close();
    this.emit('fornecedor:update', { id, data });
  });

  form.on('fornecedor:cancel', () => {
    this.modal.close();
  });

  form.render();
}

  /**
   * Mostra detalhes do fornecedor
   * @param {Fornecedor} fornecedor
   * @param {Object} stats
   */
showDetails(fornecedor, stats) {
  const content = `
    <div class="fornecedor-details">
      <div class="fornecedor-details-header">
        <button
          type="button"
          class="btn-close btn-close-details"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>

      <div class="fornecedor-info">
        <h4>${this.escapeHtml(fornecedor.nome)}</h4>
        <p><strong>Status:</strong> ${fornecedor.ativo ? '✅ Ativo' : '🚫 Inativo'}</p>
        <p><strong>Telefone:</strong> ${this.escapeHtml(fornecedor.telefone || '-')}</p>
        <p><strong>Email:</strong> ${this.escapeHtml(fornecedor.email || '-')}</p>
        <p><strong>Endereço:</strong> ${this.escapeHtml(fornecedor.endereco || '-')}</p>
      </div>

      <div class="fornecedor-stats-detail">
        <h5>Estatísticas</h5>
        <p><strong>Total de Compras:</strong> ${stats.totalCompras || 0}</p>
        <p><strong>Total Gasto:</strong> R$ ${(stats.totalGasto || 0).toFixed(2)}</p>
        <p><strong>Última Compra:</strong> ${stats.ultimaCompra || 'Nenhuma'}</p>
      </div>
    </div>
  `;

  this.modal.show('Detalhes do Fornecedor', content);

  const btnClose = this.modal.overlay.querySelector('.btn-close-details');

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      this.modal.close();
    });
  }
}
  /**
   * Atualiza a lista de fornecedores
   * @param {Fornecedor[]} fornecedores
   */
  updateList(fornecedores) {
    if (this.components.list) {
      this.components.list.update(fornecedores);
    }
  }

  /**
   * Atualiza as estatísticas
   * @param {Object} stats
   */
  updateStats(stats) {
    if (this.components.stats) {
      this.components.stats.update(stats);
    }
  }

  /**
   * Mostra loading
   * @param {string} message
   */
showLoading(message) {
  // Guardar o identificador retornado pelo Loading
  this.loadingId = this.loading.show(message);
}

/**
 * Esconde loading
 */
hideLoading() {
  if (this.loadingId) {
    this.loading.hide(this.loadingId);
    this.loadingId = null;
  }
}
  /**
   * Mostra mensagem de sucesso
   * @param {string} message
   */
  showSuccess(message) {
    this.toast.success(message);
  }

  /**
   * Mostra mensagem de erro
   * @param {string} message
   */
  showError(message) {
    this.toast.error(message);
  }

  /**
   * Mostra diálogo de confirmação
   * @param {string} title
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  async confirm(title, message) {
    return await this.modal.confirm({
      title: title,
      message: message,
      type: 'warning'
    });
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Registra listener de evento
   * @param {string} eventName
   * @param {Function} handler
   */
  on(eventName, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  /**
   * Emite evento
   * @param {string} eventName
   * @param {*} data
   */
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(handler => handler(data));
    }
  }

  /**
   * Destrói a view
   */
  destroy() {
    // Destruir componentes
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    // Limpar container
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Limpar listeners
    this.listeners = {};

    console.log('[FornecedoresView] Destruída');
  }
}
