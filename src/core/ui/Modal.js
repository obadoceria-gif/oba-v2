/**
 * Sistema de Modal de Confirmação
 * Substitui window.confirm() com modal customizado
 */

export class Modal {
  constructor() {
    this.overlay = null;
    this.currentResolve = null;
    this.initialized = false;
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.initialized) return;
    
    // Criar overlay do modal
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-icon"></div>
          <h3 class="modal-title"></h3>
        </div>
        <div class="modal-body">
          <p class="modal-message"></p>
        </div>
        <div class="modal-footer">
          <button type="button" class="modal-btn modal-btn-cancel">Cancelar</button>
          <button type="button" class="modal-btn modal-btn-confirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    // Event listeners
    this.setupEventListeners();
    
    this.initialized = true;
  }

setupEventListeners() {
  // Botão cancelar
  const cancelBtn = this.overlay.querySelector('.modal-btn-cancel');
  cancelBtn.addEventListener('click', () => this.close(false));

  // Botão confirmar
  const confirmBtn = this.overlay.querySelector('.modal-btn-confirm');
  confirmBtn.addEventListener('click', () => this.close(true));

  // Não fechar ao clicar fora do modal.
  // Isso evita perda acidental de dados em formulários.

  // Não fechar com ESC.
  // O fechamento deve ocorrer por ação explícita do usuário.

  // Enter confirma somente modais de confirmação.
  // Em formulários customizados, Enter não fecha o modal global.
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Enter' &&
      this.overlay.classList.contains('modal-active') &&
      this.currentResolve
    ) {
      e.preventDefault();
      this.close(true);
    }
  });
}

  /**
   * Exibe modal de confirmação
   * @param {Object} options - Opções do modal
   * @param {string} options.title - Título do modal
   * @param {string} options.message - Mensagem do modal
   * @param {string} options.type - Tipo: 'danger', 'warning', 'info', 'success'
   * @param {string} options.confirmText - Texto do botão confirmar
   * @param {string} options.cancelText - Texto do botão cancelar
   * @returns {Promise<boolean>} - True se confirmado, false se cancelado
   */
  confirm(options = {}) {
    // Garantir que modal está inicializado
    if (!this.initialized) {
      this.init();
    }
    
    const {
      title = 'Confirmar ação',
      message = 'Tem certeza que deseja continuar?',
      type = 'warning',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar'
    } = options;

    return new Promise((resolve) => {
      this.currentResolve = resolve;

      // Atualizar conteúdo
      const titleEl = this.overlay.querySelector('.modal-title');
      const messageEl = this.overlay.querySelector('.modal-message');
      const iconEl = this.overlay.querySelector('.modal-icon');
      const confirmBtn = this.overlay.querySelector('.modal-btn-confirm');
      const cancelBtn = this.overlay.querySelector('.modal-btn-cancel');

      // Verificar se elementos existem
      if (!titleEl || !messageEl || !iconEl || !confirmBtn || !cancelBtn) {
        console.error('[Modal] Elementos do modal não encontrados');
        resolve(false);
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      confirmBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;

      // Atualizar ícone e estilo baseado no tipo
      iconEl.textContent = this.getIcon(type);
      iconEl.className = `modal-icon modal-icon-${type}`;
      confirmBtn.className = `modal-btn modal-btn-confirm modal-btn-${type}`;

      // Mostrar modal
      this.overlay.classList.add('modal-active');

      // Focar no botão cancelar por padrão (mais seguro)
      cancelBtn.focus();
    });
  }

  /**
   * Atalho para modal de exclusão
   */
  confirmDelete(itemName = 'este item') {
    return this.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir ${itemName}?\n\nEsta ação não pode ser desfeita.`,
      type: 'danger',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });
  }

  /**
   * Atalho para modal de aviso
   */
  confirmWarning(message, title = 'Atenção') {
    return this.confirm({
      title,
      message,
      type: 'warning',
      confirmText: 'Continuar',
      cancelText: 'Cancelar'
    });
  }

  /**
   * Atalho para modal de informação
   */
  confirmInfo(message, title = 'Informação') {
    return this.confirm({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      cancelText: 'Cancelar'
    });
  }

  /**
   * Modal de alerta (apenas OK, sem cancelar)
   */
  alert(options = {}) {
    // Garantir que modal está inicializado
    if (!this.initialized) {
      this.init();
    }
    
    const {
      title = 'Aviso',
      message = '',
      type = 'info'
    } = options;

    return new Promise((resolve) => {
      this.currentResolve = resolve;

      // Atualizar conteúdo
      const titleEl = this.overlay.querySelector('.modal-title');
      const messageEl = this.overlay.querySelector('.modal-message');
      const iconEl = this.overlay.querySelector('.modal-icon');
      const confirmBtn = this.overlay.querySelector('.modal-btn-confirm');
      const cancelBtn = this.overlay.querySelector('.modal-btn-cancel');

      // Verificar se elementos existem
      if (!titleEl || !messageEl || !iconEl || !confirmBtn || !cancelBtn) {
        console.error('[Modal] Elementos do modal não encontrados');
        resolve(true);
        return;
      }

      titleEl.textContent = title;
      messageEl.textContent = message;
      confirmBtn.textContent = 'OK';

      // Esconder botão cancelar
      cancelBtn.style.display = 'none';

      // Atualizar ícone e estilo
      iconEl.textContent = this.getIcon(type);
      iconEl.className = `modal-icon modal-icon-${type}`;
      confirmBtn.className = `modal-btn modal-btn-confirm modal-btn-${type}`;

      // Mostrar modal
      this.overlay.classList.add('modal-active');

      // Focar no botão OK
      confirmBtn.focus();
    });
  }

  /**
   * Mostra modal com conteúdo customizado
   * @param {string} title - Título do modal
   * @param {string} content - Conteúdo HTML do modal
   */
  show(title, content) {
    // Atualizar título
    const titleEl = this.overlay.querySelector('.modal-title');
    titleEl.textContent = title;

    // Substituir body do modal com conteúdo customizado
    const bodyEl = this.overlay.querySelector('.modal-body');
    bodyEl.innerHTML = content;

    // Esconder footer (botões de confirmação não são necessários para conteúdo customizado)
    const footerEl = this.overlay.querySelector('.modal-footer');
    footerEl.style.display = 'none';

    // Esconder ícone
    const iconEl = this.overlay.querySelector('.modal-icon');
    iconEl.style.display = 'none';

    // Mostrar modal
    this.overlay.classList.add('modal-active');
  }

  /**
   * Fecha o modal
   */
  close(result) {
    this.overlay.classList.remove('modal-active');

    // Restaurar o conteúdo padrão do body. Modal.show() substitui o body
    // por conteúdo customizado; sem esta restauração, confirm()/alert()
    // deixam de encontrar .modal-message em uma abertura posterior.
    const bodyEl = this.overlay.querySelector('.modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = '<p class="modal-message"></p>';
    }

    // Restaurar footer e ícone
    const footerEl = this.overlay.querySelector('.modal-footer');
    footerEl.style.display = '';
    
    const iconEl = this.overlay.querySelector('.modal-icon');
    iconEl.style.display = '';

    // Mostrar botão cancelar novamente (caso tenha sido escondido no alert)
    const cancelBtn = this.overlay.querySelector('.modal-btn-cancel');
    cancelBtn.style.display = '';

    if (this.currentResolve) {
      this.currentResolve(result);
      this.currentResolve = null;
    }
  }

  /**
   * Retorna ícone baseado no tipo
   */
  getIcon(type) {
    const icons = {
      danger: '⚠️',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✓'
    };
    return icons[type] || icons.info;
  }

  /**
   * Destrói o modal
   */
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.currentResolve = null;
  }
}

// Instância singleton
let modalInstance = null;

export function getModal() {
  if (!modalInstance) {
    modalInstance = new Modal();
  }
  return modalInstance;
}
