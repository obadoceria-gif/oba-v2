/**
 * InsumosView
 * 
 * View principal do módulo de insumos.
 * Integra InsumoForm e InsumoList.
 * 
 * Requirements:
 * - 1.8: Busca de insumos com filtros
 */

import { InsumoForm } from '../components/InsumoForm.js';
import { InsumoList } from '../components/InsumoList.js';

export class InsumosView {
  /**
   * @param {HTMLElement} container - Container principal
   */
  constructor(container) {
    this.container = container;
    this.formContainer = null;
    this.listContainer = null;
    this.form = null;
    this.list = null;
    
    this.render();
    this.initializeComponents();
  }

  /**
   * Renderiza a estrutura da view
   */
  render() {
    this.container.innerHTML = `
      <div class="insumos-view">
        <header class="view-header">
          <div class="header-content">
            <div class="header-text">
              <h1 class="view-title">Gestão de Insumos</h1>
              <p class="view-description">
                Cadastre e gerencie os insumos utilizados na produção
              </p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary" id="btn-relatorios-insumos">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 2h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"/>
                </svg>
                Relatórios
              </button>
            </div>
          </div>
        </header>

        <div class="view-content">
          <section class="form-section">
            <div id="insumo-form-container"></div>
          </section>

          <section class="list-section">
            <div id="insumo-list-container"></div>
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

    this.formContainer = this.container.querySelector('#insumo-form-container');
    this.listContainer = this.container.querySelector('#insumo-list-container');
  }

  /**
   * Inicializa os componentes
   */
  initializeComponents() {
    // Criar componentes
    this.form = new InsumoForm(this.formContainer);
    this.list = new InsumoList(this.listContainer);

    // Conectar eventos do formulário
    this.form.on('create', (data) => {
      this.emit('create', data);
    });

    this.form.on('update', (updateData) => {
      this.emit('update', updateData);
    });

    this.form.on('cancel', () => {
      this.emit('cancel');
    });

    // Conectar eventos da lista
    this.list.on('edit', (insumo) => {
      this.form.populate(insumo);
      this.scrollToForm();
    });

    this.list.on('delete', (id) => {
      this.emit('delete', id);
    });

    // Conectar botão de relatórios
    const btnRelatorios = this.container.querySelector('#btn-relatorios-insumos');
    if (btnRelatorios) {
      btnRelatorios.addEventListener('click', () => {
        this.emit('open-reports');
      });
    }
  }

  /**
   * Atualiza a lista de insumos
   * @param {Array} insumos - Array de insumos
   */
  updateList(insumos) {
    console.log('[InsumosView] updateList chamado com:', insumos.length, 'insumos');
    if (this.list) {
      this.list.update(insumos);
      console.log('[InsumosView] Lista atualizada');
    } else {
      console.warn('[InsumosView] Componente list não existe!');
    }
  }

  /**
   * Limpa o formulário
   */
  clearForm() {
    if (this.form) {
      this.form.clear();
    }
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
   * @param {string} type - Tipo: 'success', 'error', 'info'
   */
  showToast(message, type = 'info') {
    const toast = this.container.querySelector('#toast');
    const messageSpan = toast?.querySelector('.toast-message');

    if (!toast || !messageSpan) return;

    // Remover classes anteriores
    toast.classList.remove('toast-success', 'toast-error', 'toast-info');
    
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
   * Renderiza lista de insumos
   * @param {Array} insumos - Lista de insumos
   */
  renderInsumosList(insumos) {
    this.updateList(insumos);
  }

  /**
   * Preenche formulário com dados de um insumo
   * @param {Object} insumo - Dados do insumo
   */
  populateForm(insumo) {
    if (this.form) {
      this.form.populate(insumo);
    }
  }

  /**
   * Rola a página até o formulário
   */
  scrollToForm() {
    if (this.formContainer && typeof this.formContainer.scrollIntoView === 'function') {
      this.formContainer.scrollIntoView({ 
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
    const event = new CustomEvent(`insumos-view:${eventName}`, {
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
    this.container.addEventListener(`insumos-view:${eventName}`, (e) => {
      handler(e.detail);
    });
  }

  /**
   * Destrói a view e seus componentes
   */
  destroy() {
    if (this.form) {
      this.form.destroy();
    }
    
    if (this.list) {
      this.list.destroy();
    }
    
    this.container.innerHTML = '';
  }
}
