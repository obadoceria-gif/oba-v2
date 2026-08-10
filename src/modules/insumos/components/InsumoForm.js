/**
 * InsumoForm Component
 * 
 * Formulário para cadastro e edição de insumos.
 * 
 * Requirements:
 * - 1.1: Campos do formulário (nome, unidade, custo, fornecedor, estoque mínimo)
 * - 13.6: Validação inline com feedback visual
 */

export class InsumoForm {
  /**
   * @param {HTMLElement} container - Container onde o formulário será renderizado
   * @param {Object} options - Opções de configuração
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.formData = {};
    this.errors = {};
    this.isEditMode = false;
    this.editingId = null;
    
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza o formulário
   */
  render() {
    this.container.innerHTML = `
      <form id="insumo-form" class="insumo-form" novalidate>
        <h2 class="form-title">
          <span class="title-text">${this.isEditMode ? 'Editar' : 'Novo'} Insumo</span>
        </h2>

        <div class="form-group">
          <label for="nome" class="form-label">
            Nome <span class="required">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            class="form-input"
            placeholder="Ex: Farinha de Trigo"
            required
            minlength="2"
            maxlength="100"
          />
          <span class="form-error" id="nome-error"></span>
          <span class="form-hint">Mínimo 2 caracteres, máximo 100</span>
        </div>

        <div class="form-group">
          <label for="marca" class="form-label">
            Marca <span class="required">*</span>
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            class="form-input"
            placeholder="Ex: Dona Benta"
            required
            maxlength="100"
          />
          <span class="form-error" id="marca-error"></span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="unidade" class="form-label">
              Unidade <span class="required">*</span>
            </label>
            <select id="unidade" name="unidade" class="form-select" required>
              <option value="">Selecione...</option>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="L">Litro (L)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="un">Unidade (un)</option>
            </select>
            <span class="form-error" id="unidade-error"></span>
          </div>

          <div class="form-group">
            <label for="quantidadePorEmbalagem" class="form-label">
              Qtde por Embalagem <span class="required">*</span>
            </label>
            <input
              type="number"
              id="quantidadePorEmbalagem"
              name="quantidadePorEmbalagem"
              class="form-input"
              placeholder="Ex: 1, 5, 12"
              min="0.01"
              step="0.01"
              required
            />
            <span class="form-error" id="quantidadePorEmbalagem-error"></span>
            <span class="form-hint">Ex: 1kg, 500g, 12 unidades</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="custoUnitario" class="form-label">
              Custo Unitário (R$) <span class="required">*</span>
            </label>
            <input
              type="number"
              id="custoUnitario"
              name="custoUnitario"
              class="form-input"
              placeholder="0,00"
              min="0"
              step="0.01"
              required
            />
            <span class="form-error" id="custoUnitario-error"></span>
            <span class="form-hint">Em centavos (ex: 500 = R$ 5,00)</span>
          </div>

          <div class="form-group">
            <label for="estoqueMinimo" class="form-label">
              Estoque Mínimo
            </label>
            <input
              type="number"
              id="estoqueMinimo"
              name="estoqueMinimo"
              class="form-input"
              placeholder="0"
              min="0"
              step="1"
            />
            <span class="form-error" id="estoqueMinimo-error"></span>
            <span class="form-hint">Quantidade mínima para alerta</span>
          </div>
        </div>

        <div class="form-group">
          <label for="fornecedor" class="form-label">
            Fornecedor Padrão
          </label>
          <input
            type="text"
            id="fornecedor"
            name="fornecedor"
            class="form-input"
            placeholder="Ex: Distribuidora ABC"
            maxlength="100"
          />
          <span class="form-error" id="fornecedor-error"></span>
        </div>

        <div class="form-group">
          <label for="observacoes" class="form-label">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            class="form-textarea"
            placeholder="Informações adicionais sobre o insumo..."
            rows="3"
            maxlength="500"
          ></textarea>
          <span class="form-error" id="observacoes-error"></span>
          <span class="form-hint char-count">0/500 caracteres</span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" id="btn-submit">
            ${this.isEditMode ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    `;
  }

  /**
   * Anexa event listeners aos elementos do formulário
   */
  attachEventListeners() {
    const form = this.container.querySelector('#insumo-form');
    const btnCancel = this.container.querySelector('#btn-cancel');
    const observacoes = this.container.querySelector('#observacoes');

    // Submit do formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Botão cancelar
    btnCancel.addEventListener('click', () => {
      this.handleCancel();
    });

    // Validação inline em todos os campos
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input.name);
      });

      input.addEventListener('input', () => {
        // Limpar erro ao digitar
        this.clearFieldError(input.name);
      });
    });

    // Contador de caracteres para observações
    if (observacoes) {
      observacoes.addEventListener('input', () => {
        this.updateCharCount();
      });
    }
  }

  /**
   * Valida um campo específico
   * @param {string} fieldName - Nome do campo
   * @returns {boolean} - True se válido
   */
  validateField(fieldName) {
    const input = this.container.querySelector(`[name="${fieldName}"]`);
    if (!input) return true;

    const value = input.value.trim();
    let error = null;

    switch (fieldName) {
      case 'nome':
        if (!value) {
          error = 'Nome é obrigatório';
        } else if (value.length < 2) {
          error = 'Nome deve ter no mínimo 2 caracteres';
        } else if (value.length > 100) {
          error = 'Nome deve ter no máximo 100 caracteres';
        }
        break;

      case 'marca':
        if (!value) {
          error = 'Marca é obrigatória';
        } else if (value.length > 100) {
          error = 'Marca deve ter no máximo 100 caracteres';
        }
        break;

      case 'unidade':
        if (!value) {
          error = 'Unidade é obrigatória';
        } else if (!['kg', 'g', 'L', 'ml', 'un'].includes(value)) {
          error = 'Unidade inválida';
        }
        break;

      case 'quantidadePorEmbalagem':
        if (!value) {
          error = 'Quantidade por embalagem é obrigatória';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          error = 'Quantidade deve ser maior que zero';
        }
        break;

      case 'custoUnitario':
        if (!value) {
          error = 'Custo unitário é obrigatório';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          error = 'Custo deve ser um número não-negativo';
        }
        break;

      case 'estoqueMinimo':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = 'Estoque mínimo deve ser um número não-negativo';
        }
        break;
    }

    if (error) {
      this.showFieldError(fieldName, error);
      return false;
    } else {
      this.clearFieldError(fieldName);
      return true;
    }
  }

  /**
   * Mostra erro em um campo
   * @param {string} fieldName - Nome do campo
   * @param {string} message - Mensagem de erro
   */
  showFieldError(fieldName, message) {
    const input = this.container.querySelector(`[name="${fieldName}"]`);
    const errorSpan = this.container.querySelector(`#${fieldName}-error`);

    if (input) {
      input.classList.add('error');
      // Aplicar estilos inline como fallback garantido
      input.style.borderColor = '#e74c3c';
      input.style.backgroundColor = '#fff5f5';
      input.style.borderWidth = '2px';
    }

    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
      errorSpan.style.color = '#e74c3c';
      errorSpan.style.fontSize = '0.875rem';
      errorSpan.style.marginTop = '0.25rem';
      errorSpan.style.fontWeight = '500';
    }

    this.errors[fieldName] = message;
  }

  /**
   * Limpa erro de um campo
   * @param {string} fieldName - Nome do campo
   */
  clearFieldError(fieldName) {
    const input = this.container.querySelector(`[name="${fieldName}"]`);
    const errorSpan = this.container.querySelector(`#${fieldName}-error`);

    if (input) {
      input.classList.remove('error');
      // Remover estilos inline
      input.style.borderColor = '';
      input.style.backgroundColor = '';
      input.style.borderWidth = '';
    }

    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }

    delete this.errors[fieldName];
  }

  /**
   * Atualiza contador de caracteres
   */
  updateCharCount() {
    const observacoes = this.container.querySelector('#observacoes');
    const charCount = this.container.querySelector('.char-count');

    if (observacoes && charCount) {
      const count = observacoes.value.length;
      charCount.textContent = `${count}/500 caracteres`;

      if (count > 450) {
        charCount.classList.add('warning');
      } else {
        charCount.classList.remove('warning');
      }
    }
  }

  /**
   * Valida todo o formulário
   * @returns {boolean} - True se válido
   */
  validateForm() {
    const fields = ['nome', 'marca', 'unidade', 'quantidadePorEmbalagem', 'custoUnitario'];
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Coleta dados do formulário
   * @returns {Object} - Dados do formulário
   */
  getFormData() {
    const form = this.container.querySelector('#insumo-form');
    const formData = new FormData(form);

    return {
      nome: formData.get('nome')?.trim() || '',
      marca: formData.get('marca')?.trim() || '',
      unidade: formData.get('unidade') || '',
      quantidadePorEmbalagem: parseFloat(formData.get('quantidadePorEmbalagem')) || 0,
      custoUnitario: parseFloat(formData.get('custoUnitario')) || 0,
      fornecedor: formData.get('fornecedor')?.trim() || '',
      estoqueMinimo: parseInt(formData.get('estoqueMinimo')) || 0,
      observacoes: formData.get('observacoes')?.trim() || ''
    };
  }

  /**
   * Preenche o formulário com dados
   * @param {Object} data - Dados do insumo
   */
  populate(data) {
    this.isEditMode = true;
    this.editingId = data.id;

    // Re-renderizar com título de edição
    this.render();
    this.attachEventListeners();

    // Preencher campos
    const form = this.container.querySelector('#insumo-form');
    if (!form) return;

    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && data[key] !== undefined && data[key] !== null) {
        input.value = data[key];
      }
    });

    this.updateCharCount();
  }

  /**
   * Limpa o formulário
   */
  clear() {
    this.isEditMode = false;
    this.editingId = null;
    this.errors = {};

    const form = this.container.querySelector('#insumo-form');
    if (form) {
      form.reset();
    }

    // Limpar todos os erros
    const errorSpans = this.container.querySelectorAll('.form-error');
    errorSpans.forEach(span => {
      span.textContent = '';
      span.style.display = 'none';
    });

    // Limpar classes de erro
    const inputs = this.container.querySelectorAll('.error');
    inputs.forEach(input => {
      input.classList.remove('error');
    });

    this.updateCharCount();
    this.render();
    this.attachEventListeners();
  }

  /**
   * Handler para submit do formulário
   */
  handleSubmit() {
    console.log('🔍 handleSubmit chamado');
    
    const isValid = this.validateForm();
    console.log('✅ Validação:', isValid, 'Erros:', this.errors);
    
    if (!isValid) {
      console.log('❌ Formulário inválido, mostrando erros');
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(this.errors)[0];
      if (firstErrorField) {
        const input = this.container.querySelector(`[name="${firstErrorField}"]`);
        if (input) {
          input.focus();
          console.log('🎯 Focando no campo:', firstErrorField);
        }
      }
      return;
    }

    console.log('✅ Formulário válido, enviando dados');
    const data = this.getFormData();

    if (this.isEditMode && this.editingId) {
      this.emit('update', { id: this.editingId, data });
    } else {
      this.emit('create', data);
    }
  }

  /**
   * Handler para cancelar
   */
  handleCancel() {
    this.clear();
    this.emit('cancel');
  }

  /**
   * Emite um evento customizado
   * @param {string} eventName - Nome do evento
   * @param {*} data - Dados do evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(`insumo-form:${eventName}`, {
      detail: data,
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Registra listener para eventos do componente
   * @param {string} eventName - Nome do evento
   * @param {Function} handler - Handler do evento
   */
  on(eventName, handler) {
    this.container.addEventListener(`insumo-form:${eventName}`, (e) => {
      handler(e.detail);
    });
  }

  /**
   * Destrói o componente
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
