/**
 * ValidationEngine - Motor de validação centralizado
 * 
 * Aceita regras de validação e dados, retorna resultado com erros em português.
 * 
 * @example
 * const rules = {
 *   nome: [validators.required(), validators.minLength(3)],
 *   preco: [validators.required(), validators.numeric(), validators.positive()]
 * };
 * 
 * const result = ValidationEngine.validate(data, rules);
 * if (!result.valid) {
 *   console.log(result.errors); // { nome: ['Campo obrigatório'], preco: ['Deve ser positivo'] }
 * }
 */
class ValidationEngine {
  /**
   * Valida dados contra regras definidas
   * @param {Object} data - Dados a validar
   * @param {Object} rules - Regras de validação { campo: [validator1, validator2, ...] }
   * @returns {{ valid: boolean, errors: Object }} Resultado da validação
   */
  static validate(data, rules) {
    const errors = {};
    let valid = true;

    for (const [field, validators] of Object.entries(rules)) {
      const fieldErrors = [];
      const value = data[field];

      for (const validator of validators) {
        const result = validator(value, data);
        
        if (result !== true) {
          fieldErrors.push(result);
          valid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return { valid, errors };
  }

  /**
   * Valida um único campo
   * @param {*} value - Valor a validar
   * @param {Array} validators - Array de validators
   * @param {Object} data - Dados completos (opcional, para validações contextuais)
   * @returns {{ valid: boolean, errors: Array }} Resultado da validação
   */
  static validateField(value, validators, data = {}) {
    const errors = [];
    let valid = true;

    for (const validator of validators) {
      const result = validator(value, data);
      
      if (result !== true) {
        errors.push(result);
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Combina múltiplos validators em um único
   * @param {...Function} validators - Validators a combinar
   * @returns {Function} Validator combinado
   */
  static combine(...validators) {
    return (value, data) => {
      for (const validator of validators) {
        const result = validator(value, data);
        if (result !== true) {
          return result;
        }
      }
      return true;
    };
  }
}

export default ValidationEngine;
