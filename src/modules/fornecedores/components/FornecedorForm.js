/**
 * FornecedorForm
 * 
 * Componente de formulário para criar/editar fornecedor.
 */

export class FornecedorForm {
  /**
   * @param {HTMLElement} container - Container do componente
   * @param {Fornecedor|null} fornecedor - Fornecedor para editar (null = criar novo)
   */
  constructor(container, fornecedor = null) {
    this.container = container;
    this.fornecedor = fornecedor;
    this.listeners = {};
    this.isEditMode = !!fornecedor;
  }

  /**
   * Renderiza o formulário
   */
  render() {
    if (!this.container) {
      console.error('[FornecedorForm] Container não encontrado');
      return;
    }

    const title = this.isEditMode ? 'Editar Fornecedor' : 'Novo Fornecedor';
    const submitText = this.isEditMode ? 'Salvar Alterações' : 'Criar Fornecedor';

    this.container.innerHTML = `
      <div class="fornecedor-form-container">
        <div class="fornecedor-form-header">
          <h3>${title}</h3>
          <button type="button" class="btn-close" aria-label="Fechar">×</button>
        </div>
        
        <form id="fornecedor-form" class="fornecedor-form">
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="fornecedor-nome">Nome *</label>
              <input 
                type="text" 
                class="form-control" 
                id="fornecedor-nome" 
                name="nome"
                placeholder="Nome do fornecedor"
                required
                value="${this.escapeHtml(this.fornecedor?.nome || '')}"
              >
              <div class="invalid-feedback">Nome é obrigatório (mínimo 2 caracteres)</div>
            </div>
            
            <div class="form-group col-md-6">
              <label for="fornecedor-cnpj">CNPJ *</label>
              <input 
                type="text" 
                class="form-control" 
                id="fornecedor-cnpj" 
                name="cnpj"
                placeholder="00.000.000/0000-00"
                required
                value="${this.escapeHtml(this.fornecedor?.cnpj || '')}"
                ${this.isEditMode && this.fornecedor?.cnpj ? 'readonly' : ''}
              >
              <div class="invalid-feedback">CNPJ é obrigatório e deve ser válido</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="fornecedor-status">Status</label>
              <select 
                class="form-control" 
                id="fornecedor-status" 
                name="ativo"
              >
                <option value="true" ${!this.fornecedor || this.fornecedor.ativo ? 'selected' : ''}>Ativo</option>
                <option value="false" ${this.fornecedor && !this.fornecedor.ativo ? 'selected' : ''}>Inativo</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="fornecedor-telefone">Telefone</label>
              <input 
                type="tel" 
                class="form-control" 
                id="fornecedor-telefone" 
                name="telefone"
                placeholder="(00) 00000-0000"
                value="${this.escapeHtml(this.fornecedor?.telefone || '')}"
              >
              <div class="invalid-feedback">Telefone inválido</div>
            </div>
            
            <div class="form-group col-md-6">
              <label for="fornecedor-email">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="fornecedor-email" 
                name="email"
                placeholder="email@exemplo.com"
                value="${this.escapeHtml(this.fornecedor?.email || '')}"
              >
              <div class="invalid-feedback">Email inválido</div>
            </div>
          </div>

          <div class="form-group">
            <label for="fornecedor-endereco">Endereço</label>
            <textarea 
              class="form-control" 
              id="fornecedor-endereco" 
              name="endereco"
              rows="2"
              placeholder="Endereço completo (opcional)"
            >${this.escapeHtml(this.fornecedor?.endereco || '')}</textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-submit">${submitText}</button>
          </div>
        </form>
      </div>
    `;

    this.applyMasks();
    this.attachEventListeners();
  }

  /**
   * Aplica máscaras nos campos
   */
applyMasks() {
  const telefoneInput = this.container.querySelector('#fornecedor-telefone');
  const cnpjInput = this.container.querySelector('#fornecedor-cnpj');

  // Máscara progressiva de telefone
  // Não cria separadores "presos" quando o usuário está apagando.
  if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
      const digits = e.target.value
        .replace(/\D/g, '')
        .slice(0, 11);

      let formatted = digits;

      if (digits.length > 2 && digits.length <= 6) {
        formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      } else if (digits.length > 6 && digits.length <= 10) {
        formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      } else if (digits.length === 11) {
        formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 2) {
        formatted = `(${digits}`;
      } else if (digits.length === 1) {
        formatted = `(${digits}`;
      }

      e.target.value = formatted;
    });
  }

  // Máscara progressiva de CNPJ
  // Os separadores só aparecem quando já existe um dígito depois deles.
  if (cnpjInput && (!this.isEditMode || !this.fornecedor?.cnpj)) {
    cnpjInput.addEventListener('input', (e) => {
      const digits = e.target.value
        .replace(/\D/g, '')
        .slice(0, 14);

      let formatted = digits;

      if (digits.length > 2 && digits.length <= 5) {
        formatted =
          `${digits.slice(0, 2)}.${digits.slice(2)}`;

      } else if (digits.length > 5 && digits.length <= 8) {
        formatted =
          `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;

      } else if (digits.length > 8 && digits.length <= 12) {
        formatted =
          `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;

      } else if (digits.length > 12) {
        formatted =
          `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
      }

      e.target.value = formatted;
    });
  }
}  attachEventListeners() {
    const form = this.container.querySelector('#fornecedor-form');
    const btnClose = this.container.querySelector('.btn-close');
    const btnCancel = this.container.querySelector('.btn-cancel');

    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => this.handleCancel());
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => this.handleCancel());
    }

    // Validação em tempo real
    const inputs = this.container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });
  }

  /**
   * Handler de submit do formulário
   * @param {Event} e
   */
  handleSubmit(e) {
    e.preventDefault();

    // Validar formulário
    if (!this.validateForm()) {
      return;
    }

    // Obter dados do formulário
    const data = this.getFormData();

    // Emitir evento
    if (this.isEditMode) {
      this.emit('fornecedor:update', { id: this.fornecedor.id, data });
    } else {
      this.emit('fornecedor:create', data);
    }
  }

  /**
   * Handler de cancelamento
   */
  handleCancel() {
    this.emit('fornecedor:cancel');
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} field
   * @returns {boolean}
   */
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    // Remover classe de erro anterior
    field.classList.remove('is-invalid');

    switch (field.name) {
      case 'nome':
        isValid = value.length >= 2;
        break;
      
      case 'cnpj':
        if (value) {
          const numbers = value.replace(/\D/g, '');
          isValid = numbers.length === 14 && this.validateCNPJ(numbers);
        } else {
          isValid = false; // CNPJ é obrigatório
        }
        break;
        
      case 'email':
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(value);
        }
        break;
        
      case 'telefone':
        if (value) {
          const numbers = value.replace(/\D/g, '');
          isValid = numbers.length === 10 || numbers.length === 11;
        }
        break;
    }

    if (!isValid) {
      field.classList.add('is-invalid');
    }

    return isValid;
  }

  /**
   * Valida CNPJ
   * @param {string} cnpj - CNPJ apenas números
   * @returns {boolean}
   */
  validateCNPJ(cnpj) {
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs invalidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
  }

  /**
   * Valida o formulário completo
   * @returns {boolean}
   */
  validateForm() {
    const form = this.container.querySelector('#fornecedor-form');
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Obtém dados do formulário
   * @returns {Object}
   */
  getFormData() {
    const form = this.container.querySelector('#fornecedor-form');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      if (key === 'ativo') {
        data[key] = value === 'true';
      } else {
        data[key] = value.trim();
      }
    }

    return data;
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
   * Destrói o componente
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.listeners = {};
  }
}
