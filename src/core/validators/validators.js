/**
 * Validators reutilizáveis para validação de dados
 * Todos retornam true se válido, ou string com mensagem de erro em português
 */

/**
 * Valida campo obrigatório
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const required = (message = 'Campo obrigatório') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return message;
    }
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }
    return true;
  };
};

/**
 * Valida se é número
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const numeric = (message = 'Deve ser um número') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio (use required() para obrigar)
    }
    if (typeof value === 'number' && !isNaN(value)) {
      return true;
    }
    if (typeof value === 'string') {
      const num = Number(value);
      if (!isNaN(num)) {
        return true;
      }
    }
    return message;
  };
};

/**
 * Valida se é número positivo
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const positive = (message = 'Deve ser um número positivo') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num) || num <= 0) {
      return message;
    }
    return true;
  };
};

/**
 * Valida se é número não-negativo (>= 0)
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const nonNegative = (message = 'Não pode ser negativo') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num) || num < 0) {
      return message;
    }
    return true;
  };
};

/**
 * Valida formato de data (YYYY-MM-DD ou ISO 8601)
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const date = (message = 'Data inválida') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    
    // Valida formato YYYY-MM-DD ou ISO 8601
    const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (!isoRegex.test(value)) {
      return message;
    }
    
    // Tenta criar Date e valida se é válida
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
      return message;
    }
    
    // Valida se a data é real (ex: 2024-02-30 é inválida)
    const [year, month, day] = value.split('T')[0].split('-').map(Number);
    if (dateObj.getUTCFullYear() !== year || 
        dateObj.getUTCMonth() + 1 !== month || 
        dateObj.getUTCDate() !== day) {
      return message;
    }
    
    return true;
  };
};

/**
 * Valida formato de email
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const email = (message = 'Email inválido') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    
    // Regex simples para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    
    return true;
  };
};

/**
 * Valida formato de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const phone = (message = 'Telefone inválido. Use (XX) XXXXX-XXXX') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    
    // Remove caracteres não numéricos para validar quantidade
    const cleaned = value.replace(/\D/g, '');
    
    // Valida: 10 dígitos total (DDD + 8) ou 11 dígitos total (DDD + 9)
    if (cleaned.length !== 10 && cleaned.length !== 11) {
      return message;
    }
    
    // Valida formato básico: (XX) seguido de dígitos e opcionalmente hífen
    const basicRegex = /^\(\d{2}\)\s?[\d-]+$/;
    if (!basicRegex.test(value)) {
      return message;
    }
    
    // Extrai primeiro dígito após o DDD
    const firstDigitAfterDDD = cleaned.charAt(2);
    
    // Se começa com 9, deve ter 11 dígitos (celular)
    if (firstDigitAfterDDD === '9' && cleaned.length !== 11) {
      return message;
    }
    
    // Se tem hífen, valida formato específico
    if (value.includes('-')) {
      // 11 dígitos total: (XX) XXXXX-XXXX ou (XX)XXXXX-XXXX (DDD + 5 + 4)
      if (cleaned.length === 11) {
        const cellRegex = /^\(\d{2}\)\s?\d{5}-\d{4}$/;
        if (!cellRegex.test(value)) {
          return message;
        }
      }
      // 10 dígitos total: (XX) XXXX-XXXX ou (XX)XXXX-XXXX (DDD + 4 + 4)
      else if (cleaned.length === 10) {
        const landlineRegex = /^\(\d{2}\)\s?\d{4}-\d{4}$/;
        if (!landlineRegex.test(value)) {
          return message;
        }
      }
    } else {
      // Sem hífen: valida que tem exatamente 8 ou 9 dígitos após o DDD
      if (cleaned.length === 11) {
        // (XX)XXXXXXXXX ou (XX) XXXXXXXXX (DDD + 9 dígitos)
        const cellNoHyphenRegex = /^\(\d{2}\)\s?\d{9}$/;
        if (!cellNoHyphenRegex.test(value)) {
          return message;
        }
      } else if (cleaned.length === 10) {
        // (XX)XXXXXXXX ou (XX) XXXXXXXX (DDD + 8 dígitos)
        const landlineNoHyphenRegex = /^\(\d{2}\)\s?\d{8}$/;
        if (!landlineNoHyphenRegex.test(value)) {
          return message;
        }
      }
    }
    
    return true;
  };
};

/**
 * Valida tamanho mínimo de string
 * @param {number} min - Tamanho mínimo
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const minLength = (min, message) => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    if (typeof value === 'string' && value.length < min) {
      return message || `Deve ter no mínimo ${min} caracteres`;
    }
    return true;
  };
};

/**
 * Valida tamanho máximo de string
 * @param {number} max - Tamanho máximo
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const maxLength = (max, message) => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    if (typeof value === 'string' && value.length > max) {
      return message || `Deve ter no máximo ${max} caracteres`;
    }
    return true;
  };
};

/**
 * Valida se valor está em lista de opções
 * @param {Array} options - Lista de valores válidos
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const oneOf = (options, message) => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    if (!options.includes(value)) {
      return message || `Deve ser um dos valores: ${options.join(', ')}`;
    }
    return true;
  };
};

/**
 * Valida valor mínimo
 * @param {number} min - Valor mínimo
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const min = (minValue, message) => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num) || num < minValue) {
      return message || `Deve ser no mínimo ${minValue}`;
    }
    return true;
  };
};

/**
 * Valida valor máximo
 * @param {number} max - Valor máximo
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const max = (maxValue, message) => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num) || num > maxValue) {
      return message || `Deve ser no máximo ${maxValue}`;
    }
    return true;
  };
};

/**
 * Valida padrão regex
 * @param {RegExp} pattern - Padrão regex
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const pattern = (regex, message = 'Formato inválido') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    if (typeof value !== 'string') {
      return message;
    }
    if (!regex.test(value)) {
      return message;
    }
    return true;
  };
};

/**
 * Valida string alfanumérica (letras, números, espaços, hífens e underscores)
 * @param {string} message - Mensagem customizada (opcional)
 * @returns {Function} Validator
 */
export const alphanumeric = (message = 'Deve conter apenas letras, números, espaços e pontuação básica') => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Permite vazio
    }
    if (typeof value !== 'string') {
      return message;
    }
    // Permite letras (incluindo acentuadas), números, espaços, hífens, underscores, 
    // parênteses, vírgulas, pontos, apóstrofos e porcentagem (comum em nomes de insumos)
    const alphanumericRegex = /^[a-zA-ZÀ-ÿ0-9\s\-_(),.%']+$/;
    if (!alphanumericRegex.test(value)) {
      return message;
    }
    return true;
  };
};

export default {
  required,
  numeric,
  positive,
  nonNegative,
  date,
  email,
  phone,
  minLength,
  maxLength,
  oneOf,
  min,
  max,
  pattern,
  alphanumeric
};
