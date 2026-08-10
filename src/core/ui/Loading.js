/**
 * Sistema de Loading/Spinner
 * Exibe indicadores de carregamento
 */

export class Loading {
  constructor() {
    this.overlay = null;
    this.activeLoaders = new Set();
    this.init();
  }

  init() {
    // Criar overlay global
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Carregando...</div>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  /**
   * Exibe loading global
   */
  show(text = 'Carregando...') {
    const id = Date.now() + Math.random();
    this.activeLoaders.add(id);

    const textElement = this.overlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = text;
    }

    this.overlay.classList.add('loading-active');
    return id;
  }

  /**
   * Oculta loading global
   */
  hide(id) {
    if (id) {
      this.activeLoaders.delete(id);
    }

    // Só oculta se não houver mais loaders ativos
    if (this.activeLoaders.size === 0) {
      this.overlay.classList.remove('loading-active');
    }
  }

  /**
   * Oculta todos os loadings
   */
  hideAll() {
    this.activeLoaders.clear();
    this.overlay.classList.remove('loading-active');
  }

  /**
   * Cria spinner inline para elemento específico
   */
  createInlineSpinner(size = 'medium') {
    const spinner = document.createElement('div');
    spinner.className = `inline-spinner inline-spinner-${size}`;
    spinner.innerHTML = '<div class="spinner"></div>';
    return spinner;
  }

  /**
   * Adiciona loading a um botão
   */
  buttonLoading(button, loading = true) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      
      const spinner = this.createInlineSpinner('small');
      button.textContent = '';
      button.appendChild(spinner);
      button.classList.add('button-loading');
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || 'Salvar';
      button.classList.remove('button-loading');
      delete button.dataset.originalText;
    }
  }

  /**
   * Adiciona loading a um container
   */
  containerLoading(container, loading = true, text = 'Carregando...') {
    if (loading) {
      const loadingEl = document.createElement('div');
      loadingEl.className = 'container-loading';
      loadingEl.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <div class="loading-text">${text}</div>
        </div>
      `;
      container.appendChild(loadingEl);
      container.classList.add('has-loading');
    } else {
      const loadingEl = container.querySelector('.container-loading');
      if (loadingEl) {
        loadingEl.remove();
      }
      container.classList.remove('has-loading');
    }
  }

  /**
   * Destrói o sistema de loading
   */
  destroy() {
    this.hideAll();
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
  }
}

// Instância singleton
let loadingInstance = null;

export function getLoading() {
  if (!loadingInstance) {
    loadingInstance = new Loading();
  }
  return loadingInstance;
}
