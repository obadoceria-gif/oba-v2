/**
 * Sistema de Notificações Toast
 * Exibe mensagens temporárias de feedback ao usuário
 */

export class Toast {
  constructor() {
    this.container = null;
    this.queue = [];
    this.isProcessing = false;
    this.init();
  }

  init() {
    // Criar container de toasts
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  }

  /**
   * Exibe toast de sucesso
   */
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  }

  /**
   * Exibe toast de erro
   */
  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  }

  /**
   * Exibe toast de aviso
   */
  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Exibe toast informativo
   */
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  }

  /**
   * Exibe toast genérico
   */
  show(message, type = 'info', duration = 3000) {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration
    };

    this.queue.push(toast);
    
    if (!this.isProcessing) {
      this.processQueue();
    }

    return toast.id;
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const toast = this.queue.shift();
    
    await this.displayToast(toast);
    
    // Processar próximo
    this.processQueue();
  }

  displayToast(toast) {
    return new Promise((resolve) => {
      const element = this.createToastElement(toast);
      this.container.appendChild(element);

      // Animar entrada
      requestAnimationFrame(() => {
        element.classList.add('toast-show');
      });

      // Remover após duração
      setTimeout(() => {
        element.classList.remove('toast-show');
        element.classList.add('toast-hide');

        // Remover do DOM após animação
        setTimeout(() => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          resolve();
        }, 300);
      }, toast.duration);
    });
  }

  createToastElement(toast) {
    const element = document.createElement('div');
    element.className = `toast toast-${toast.type}`;
    element.setAttribute('role', 'alert');

    const icon = this.getIcon(toast.type);
    
    element.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${this.escapeHtml(toast.message)}</div>
      <button class="toast-close" aria-label="Fechar">×</button>
    `;

    // Botão fechar
    const closeBtn = element.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      element.classList.remove('toast-show');
      element.classList.add('toast-hide');
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 300);
    });

    return element;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove todos os toasts
   */
  clear() {
    this.queue = [];
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Destrói o sistema de toasts
   */
  destroy() {
    this.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}

// Instância singleton
let toastInstance = null;

export function getToast() {
  if (!toastInstance) {
    toastInstance = new Toast();
  }
  return toastInstance;
}
