/**
 * EstoqueView
 * 
 * View principal do módulo de estoque.
 * Integra EstoqueList e MovimentacaoHistory.
 * 
 * Requirements:
 * - 3.9: Visualização de estoque atual
 * - 3.11: Histórico de movimentações
 */

import { EstoqueList } from '../components/EstoqueList.js';
import { MovimentacaoHistory } from '../components/MovimentacaoHistory.js';

export class EstoqueView {
  /**
   * @param {HTMLElement} container - Container principal
   */
  constructor(container) {
    this.container = container;
    this.listContainer = null;
    this.historyContainer = null;
    this.list = null;
    this.history = null;
    
    this.render();
    this.initializeComponents();
  }

  /**
   * Renderiza a estrutura da view
   */
  render() {
    this.container.innerHTML = `
      <div class="estoque-view">
        <header class="view-header">
          <div class="header-content">
            <div class="header-text">
              <h1 class="view-title">Gestão de Estoque</h1>
              <p class="view-description">
                Acompanhe o estoque atual e o histórico de movimentações
              </p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary" id="btn-relatorios-estoque">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 2h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"/>
                </svg>
                Relatórios
              </button>
            </div>
          </div>
        </header>

        <div class="view-content">
          <section class="list-section">
            <div id="estoque-list-container"></div>
          </section>

          <section class="history-section">
            <div id="movimentacao-history-container"></div>
          </section>
        </div>

        <div class="loading-overlay" id="loading-overlay" style="display: none;">
          <div class="spinner"></div>
          <p class="loading-text">Carregando...</p>
        </div>

        <div class="toast" id="toast" style="display: none;">
          <span class="toast-message"></span>
        </div>
      </div>
    `;

    this.listContainer = this.container.querySelector('#estoque-list-container');
    this.historyContainer = this.container.querySelector('#movimentacao-history-container');
  }

  /**
   * Inicializa os componentes
   */
  initializeComponents() {
    // Criar componentes
    this.list = new EstoqueList(this.listContainer);
    this.history = new MovimentacaoHistory(this.historyContainer);

    // Conectar eventos da lista
    this.list.on('viewHistory', (insumoId) => {
      this.emit('selectEstoque', insumoId);
      this.scrollToHistory();
    });

    // Conectar botão de relatórios
    const btnRelatorios = this.container.querySelector('#btn-relatorios-estoque');
    if (btnRelatorios) {
      btnRelatorios.addEventListener('click', () => {
        this.emit('open-reports');
      });
    }
  }

  /**
   * Atualiza a lista de estoques
   * @param {Array} estoques - Array de estoques
   * @param {Array} insumos - Array de insumos
   */
  updateList(estoques, insumos) {
    if (this.list) {
      this.list.update(estoques, insumos);
    }
  }

  /**
   * Atualiza o histórico de movimentações
   * @param {Array} movimentacoes - Array de movimentações
   * @param {Array} insumos - Array de insumos
   */
  updateHistory(movimentacoes, insumos) {
    if (this.history) {
      this.history.update(movimentacoes, insumos);
    }
  }

  /**
   * Renderiza lista de estoques
   * @param {Array} estoques - Lista de estoques
   */
  renderEstoquesList(estoques) {
    // Placeholder: será implementado quando integrar com InsumosService
    // Por enquanto, apenas atualiza a lista
    this.updateList(estoques, []);
  }

  /**
   * Renderiza lista de movimentações
   * @param {Array} movimentacoes - Lista de movimentações
   */
  renderMovimentacoesList(movimentacoes) {
    // Placeholder: será implementado quando integrar com InsumosService
    // Por enquanto, apenas atualiza o histórico
    this.updateHistory(movimentacoes, []);
  }

  /**
   * Mostra detalhes de um estoque
   * @param {Object} estoque - Dados do estoque
   * @param {Array} movimentacoes - Movimentações do estoque
   */
  showEstoqueDetails(estoque, movimentacoes) {
    // Atualizar histórico com as movimentações do estoque
    this.updateHistory(movimentacoes, []);
    this.scrollToHistory();
  }

  /**
   * Mostra loading
   * @param {string} message - Mensagem de loading
   */
  showLoading(message = 'Carregando...') {
    const overlay = this.container.querySelector('#loading-overlay');
    const text = overlay?.querySelector('.loading-text');
    
    if (overlay) {
      overlay.style.display = 'flex';
    }
    
    if (text) {
      text.textContent = message;
    }
  }

  /**
   * Esconde loading
   */
  hideLoading() {
    const overlay = this.container.querySelector('#loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  /**
   * Mostra toast de feedback
   * @param {string} message - Mensagem
   * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
   */
  showToast(message, type = 'info') {
    const toast = this.container.querySelector('#toast');
    const messageSpan = toast?.querySelector('.toast-message');

    if (!toast || !messageSpan) return;

    // Remover classes anteriores
    toast.classList.remove('toast-success', 'toast-error', 'toast-info', 'toast-warning');
    
    // Adicionar classe do tipo
    toast.classList.add(`toast-${type}`);
    
    // Definir mensagem
    messageSpan.textContent = message;
    
    // Mostrar toast
    toast.style.display = 'block';

    // Esconder após 3 segundos
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  /**
   * Mostra mensagem de sucesso
   * @param {string} message - Mensagem
   */
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  /**
   * Mostra mensagem de erro
   * @param {string} message - Mensagem
   */
  showError(message) {
    this.showToast(message, 'error');
  }

  /**
   * Mostra mensagem de aviso
   * @param {string} message - Mensagem
   */
  showWarning(message) {
    this.showToast(message, 'warning');
  }

  /**
   * Mostra diálogo de confirmação
   * @param {string} message - Mensagem
   * @returns {Promise<boolean>}
   */
  async confirm(message) {
    const modal = window.getModal();
    return await modal.confirmDelete(
      'Confirmar exclusão',
      message
    );
  }

  /**
   * Rola a página até o histórico
   */
  scrollToHistory() {
    if (this.historyContainer && typeof this.historyContainer.scrollIntoView === 'function') {
      this.historyContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  /**
   * Emite um evento customizado
   * @param {string} eventName - Nome do evento
   * @param {*} data - Dados do evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(`estoque-view:${eventName}`, {
      detail: data,
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Registra listener para eventos da view
   * @param {string} eventName - Nome do evento
   * @param {Function} handler - Handler do evento
   */
  on(eventName, handler) {
    this.container.addEventListener(`estoque-view:${eventName}`, (e) => {
      handler(e.detail);
    });
  }

  /**
   * Remove listener de eventos da view
   * @param {string} eventName - Nome do evento
   * @param {Function} handler - Handler do evento
   */
  off(eventName, handler) {
    this.container.removeEventListener(`estoque-view:${eventName}`, handler);
  }

  /**
   * Destrói a view e seus componentes
   */
  destroy() {
    if (this.list) {
      this.list.destroy();
    }
    
    if (this.history) {
      this.history.destroy();
    }
    
    this.container.innerHTML = '';
  }
}
