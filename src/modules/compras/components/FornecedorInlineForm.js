/**
 * FornecedorInlineForm - Modal inline para cadastro rápido de fornecedor
 */

import { eventBus } from '../../../core/events/EventBus.js';

export class FornecedorInlineForm {
  /**
   * @param {Object} options
   * @param {Function} options.onSave - Callback ao salvar fornecedor
   * @param {Function} options.onCancel - Callback ao cancelar
   */
  constructor({ onSave, onCancel }) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.eventBus = eventBus;
    this.modal = null;
  }

  /**
   * Abre o modal
   */
  open() {
    this.render();
    this.attachEventListeners();
    
    // Foca no primeiro campo
    setTimeout(() => {
      const nomeInput = this.modal.querySelector('#fornecedor-nome-input');
      nomeInput?.focus();
    }, 100);
  }

  /**
   * Renderiza o modal
   */
  render() {
    // Remove modal existente se houver
    this.close();

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'fornecedor-inline-modal';

    overlay.innerHTML = `
      <div class="modal-content modal-inline">
        <div class="modal-header">
          <h3>Cadastrar Novo Fornecedor</h3>
          <button type="button" class="modal-close" id="close-modal-btn">✕</button>
        </div>

        <form id="fornecedor-inline-form" class="modal-body">
          <div class="form-group">
            <label for="fornecedor-nome-input">Nome *</label>
            <input 
              type="text" 
              id="fornecedor-nome-input" 
              class="form-control"
              placeholder="Nome do fornecedor"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="fornecedor-cnpj-input">CNPJ *</label>
            <input 
              type="text" 
              id="fornecedor-cnpj-input" 
              class="form-control"
              placeholder="00.000.000/0000-00"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="fornecedor-telefone-input">Telefone</label>
            <input 
              type="tel" 
              id="fornecedor-telefone-input" 
              class="form-control"
              placeholder="(00) 00000-0000"
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="fornecedor-email-input">Email</label>
            <input 
              type="email" 
              id="fornecedor-email-input" 
              class="form-control"
              placeholder="email@exemplo.com"
              autocomplete="off"
            />
          </div>

          <div class="modal-footer">
            <button type="button" id="cancel-fornecedor-btn" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar Fornecedor
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modal = overlay;

    // Força reflow para garantir que a animação funcione
    overlay.offsetHeight;
    
    // Adiciona classe para animação
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    if (!this.modal) return;

    const form = this.modal.querySelector('#fornecedor-inline-form');
    const closeBtn = this.modal.querySelector('#close-modal-btn');
    const cancelBtn = this.modal.querySelector('#cancel-fornecedor-btn');
    const overlay = this.modal;

    // Submit do formulário
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Botão fechar
    closeBtn?.addEventListener('click', () => this.handleClose());

    // Botão cancelar
    cancelBtn?.addEventListener('click', () => this.handleClose());

    // Clique fora do modal
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.handleClose();
      }
    });

    // ESC para fechar
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.handleClose();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    // Máscaras
    this.applyMasks();
  }

  /**
   * Aplica máscaras nos campos
   */
  applyMasks() {
    const cnpjInput = this.modal.querySelector('#fornecedor-cnpj-input');
    const telefoneInput = this.modal.querySelector('#fornecedor-telefone-input');

    // Máscara CNPJ
    cnpjInput?.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 14) value = value.slice(0, 14);
      
      if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
      } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
      }
      
      e.target.value = value;
    });

    // Máscara Telefone
    telefoneInput?.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      }
      
      e.target.value = value;
    });
  }

  /**
   * Manipula submissão do formulário
   */
  handleSubmit(e) {
    e.preventDefault();

    const nomeInput = this.modal.querySelector('#fornecedor-nome-input');
    const cnpjInput = this.modal.querySelector('#fornecedor-cnpj-input');
    const telefoneInput = this.modal.querySelector('#fornecedor-telefone-input');
    const emailInput = this.modal.querySelector('#fornecedor-email-input');

    const nome = nomeInput.value.trim();
    const cnpj = cnpjInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const email = emailInput.value.trim();

    // Validações
    if (!nome) {
      this.eventBus.emit('error', { message: 'Nome é obrigatório' });
      nomeInput.focus();
      return;
    }

    if (!cnpj) {
      this.eventBus.emit('error', { message: 'CNPJ é obrigatório' });
      cnpjInput.focus();
      return;
    }

    // Valida CNPJ (mínimo de dígitos)
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      this.eventBus.emit('error', { message: 'CNPJ inválido (deve ter 14 dígitos)' });
      cnpjInput.focus();
      return;
    }

    // Valida email se preenchido
    if (email && !this.isValidEmail(email)) {
      this.eventBus.emit('error', { message: 'Email inválido' });
      emailInput.focus();
      return;
    }

    // Prepara dados
    const fornecedorData = {
      nome,
      cnpj,
      telefone: telefone || undefined,
      email: email || undefined
    };

    // Callback de salvamento
    if (this.onSave) {
      this.onSave(fornecedorData);
    }

    // Fecha modal
    this.close();
  }

  /**
   * Valida email
   */
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Manipula fechamento
   */
  handleClose() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.close();
  }

  /**
   * Fecha o modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      
      setTimeout(() => {
        this.modal.remove();
        this.modal = null;
      }, 300);
    }

    // Remove listener do ESC
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}
