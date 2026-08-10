/**
 * FormValidator
 * 
 * Sistema de validação de formulários em tempo real
 * Fornece feedback visual e mensagens de erro inline
 */

export class FormValidator {
  constructor() {
    this.validators = new Map();
    this.errors = new Map();
  }

  /**
   * Registra validadores para um campo
   * @param {string} fieldName - Nome do campo
   * @param {Array} rules - Array de regras de validação
   */
  addField(fieldName, rules) {
    this.validators.set(fieldName, rules);
  }

  /**
   * Valida um campo específico
   * @param {string} fieldName - Nome do campo
   * @param {any} value - Valor do campo
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateField(fieldName, value) {
    const rules = this.validators.get(fieldName);
    if (!rules) {
      return { valid: true, errors: [] };
    }

    const errors = [];

    for (const rule of rules) {
      const result = rule.validate(value);
      if (!result.valid) {
        errors.push(result.message);
      }
    }

    if (errors.length > 0) {
      this.errors.set(fieldName, errors);
    } else {
      this.errors.delete(fieldName);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida todos os campos
   * @param {Object} data - Objeto com valores dos campos
   * @returns {Object} { valid: boolean, errors: Object }
   */
  validateAll(data) {
    const allErrors = {};
    let isValid = true;

    for (const [fieldName, rules] of this.validators.entries()) {
      const value = data[fieldName];
      const result = this.validateField(fieldName, value);

      if (!result.valid) {
        isValid = false;
        allErrors[fieldName] = result.errors;
      }
    }

    return {
      valid: isValid,
      errors: allErrors
    };
  }

  /**
   * Limpa erros de um campo
   * @param {string} fieldName - Nome do campo
   */
  clearFieldErrors(fieldName) {
    this.errors.delete(fieldName);
  }

  /**
   * Limpa todos os erros
   */
  clearAllErrors() {
    this.errors.clear();
  }

  /**
   * Obtém erros de um campo
   * @param {string} fieldName - Nome do campo
   * @returns {Array} Array de mensagens de erro
   */
  getFieldErrors(fieldName) {
    return this.errors.get(fieldName) || [];
  }

  /**
   * Verifica se um campo tem erros
   * @param {string} fieldName - Nome do campo
   * @returns {boolean}
   */
  hasFieldErrors(fieldName) {
    return this.errors.has(fieldName);
  }

  /**
   * Verifica se há algum erro
   * @returns {boolean}
   */
  hasErrors() {
    return this.errors.size > 0;
  }
}

/**
 * Regras de validação pré-definidas
 */
export const ValidationRules = {
  /**
   * Campo obrigatório
   */
  required(message = 'Este campo é obrigatório') {
    return {
      validate: (value) => {
        const valid = value !== null && value !== undefined && value !== '';
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Tamanho mínimo
   */
  minLength(min, message = `Mínimo de ${min} caracteres`) {
    return {
      validate: (value) => {
        if (!value) return { valid: true, message: '' };
        const valid = value.length >= min;
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Tamanho máximo
   */
  maxLength(max, message = `Máximo de ${max} caracteres`) {
    return {
      validate: (value) => {
        if (!value) return { valid: true, message: '' };
        const valid = value.length <= max;
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Valor mínimo (números)
   */
  min(min, message = `Valor mínimo: ${min}`) {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true, message: '' };
        }
        const num = Number(value);
        const valid = !isNaN(num) && num >= min;
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Valor máximo (números)
   */
  max(max, message = `Valor máximo: ${max}`) {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true, message: '' };
        }
        const num = Number(value);
        const valid = !isNaN(num) && num <= max;
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Email válido
   */
  email(message = 'Email inválido') {
    return {
      validate: (value) => {
        if (!value) return { valid: true, message: '' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const valid = emailRegex.test(value);
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Número válido
   */
  number(message = 'Deve ser um número válido') {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true, message: '' };
        }
        const valid = !isNaN(Number(value));
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Número positivo
   */
  positive(message = 'Deve ser um número positivo') {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true, message: '' };
        }
        const num = Number(value);
        const valid = !isNaN(num) && num > 0;
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Padrão customizado (regex)
   */
  pattern(regex, message = 'Formato inválido') {
    return {
      validate: (value) => {
        if (!value) return { valid: true, message: '' };
        const valid = regex.test(value);
        return { valid, message: valid ? '' : message };
      }
    };
  },

  /**
   * Validação customizada
   */
  custom(fn, message = 'Valor inválido') {
    return {
      validate: (value) => {
        const valid = fn(value);
        return { valid, message: valid ? '' : message };
      }
    };
  }
};

/**
 * Helper para aplicar validação em tempo real em um formulário
 */
export class FormValidationHelper {
  constructor(formElement, validator) {
    this.form = formElement;
    this.validator = validator;
    this.setupListeners();
  }

  /**
   * Configura listeners para validação em tempo real
   */
  setupListeners() {
    const inputs = this.form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      if (!fieldName) return;

      // Validar ao sair do campo (blur)
      input.addEventListener('blur', () => {
        this.validateAndShowErrors(fieldName, input.value, input);
      });

      // Limpar erros ao digitar (input)
      input.addEventListener('input', () => {
        if (this.validator.hasFieldErrors(fieldName)) {
          this.validateAndShowErrors(fieldName, input.value, input);
        }
      });
    });
  }

  /**
   * Valida campo e mostra erros
   */
  validateAndShowErrors(fieldName, value, inputElement) {
    const result = this.validator.validateField(fieldName, value);

    // Remover erros anteriores
    this.clearFieldErrors(inputElement);

    if (!result.valid) {
      // Adicionar classe de erro
      inputElement.classList.add('input-error');

      // Mostrar mensagens de erro
      this.showFieldErrors(inputElement, result.errors);
    } else {
      // Remover classe de erro
      inputElement.classList.remove('input-error');
    }
  }

  /**
   * Mostra erros de um campo
   */
  showFieldErrors(inputElement, errors) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'field-errors';

    errors.forEach(error => {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'field-error-message';
      errorMsg.textContent = error;
      errorContainer.appendChild(errorMsg);
    });

    // Inserir após o input
    inputElement.parentNode.insertBefore(
      errorContainer,
      inputElement.nextSibling
    );
  }

  /**
   * Limpa erros visuais de um campo
   */
  clearFieldErrors(inputElement) {
    inputElement.classList.remove('input-error');

    // Remover mensagens de erro
    const errorContainer = inputElement.parentNode.querySelector('.field-errors');
    if (errorContainer) {
      errorContainer.remove();
    }
  }

  /**
   * Limpa todos os erros visuais
   */
  clearAllErrors() {
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => this.clearFieldErrors(input));
  }

  /**
   * Valida formulário completo
   */
  validateForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    const result = this.validator.validateAll(data);

    // Mostrar erros em todos os campos
    if (!result.valid) {
      for (const [fieldName, errors] of Object.entries(result.errors)) {
        const input = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (input) {
          this.clearFieldErrors(input);
          input.classList.add('input-error');
          this.showFieldErrors(input, errors);
        }
      }
    }

    return result;
  }
}

/**
 * Função helper para criar validador facilmente
 */
export function createFormValidator(config) {
  const validator = new FormValidator();

  for (const [fieldName, rules] of Object.entries(config)) {
    validator.addField(fieldName, rules);
  }

  return validator;
}
