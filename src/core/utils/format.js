/**
 * Format Utilities
 * 
 * Utilities para formatação de strings, telefones e geração de IDs.
 * 
 * Validates: Notes (phone format)
 */

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone (apenas números ou com formatação)
 * @returns {string} Telefone formatado (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhone(phone) {
  if (typeof phone !== 'string') {
    throw new Error('Telefone deve ser uma string');
  }

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');

  // Valida tamanho
  if (cleaned.length < 10 || cleaned.length > 11) {
    throw new Error('Telefone deve ter 10 ou 11 dígitos');
  }

  // Formata
  if (cleaned.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else {
    // Fixo: (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
}

/**
 * Remove formatação de telefone
 * @param {string} phone - Telefone formatado
 * @returns {string} Apenas números
 */
export function unformatPhone(phone) {
  if (typeof phone !== 'string') {
    throw new Error('Telefone deve ser uma string');
  }

  return phone.replace(/\D/g, '');
}

/**
 * Gera ID único usando timestamp e random
 * @returns {string} ID único
 */
export function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Gera UUID v4 simples
 * @returns {string} UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} text - Texto
 * @returns {string} Texto capitalizado
 */
export function capitalize(text) {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Trunca texto com reticências
 * @param {string} text - Texto
 * @param {number} maxLength - Tamanho máximo
 * @returns {string} Texto truncado
 */
export function truncate(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Remove acentos de string
 * @param {string} text - Texto
 * @returns {string} Texto sem acentos
 */
export function removeAccents(text) {
  if (typeof text !== 'string') {
    return '';
  }

  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Formata CPF
 * @param {string} cpf - CPF (apenas números ou com formatação)
 * @returns {string} CPF formatado (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf) {
  if (typeof cpf !== 'string') {
    throw new Error('CPF deve ser uma string');
  }

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ (apenas números ou com formatação)
 * @returns {string} CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj) {
  if (typeof cnpj !== 'string') {
    throw new Error('CNPJ deve ser uma string');
  }

  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

/**
 * Sanitiza string para uso em IDs HTML
 * @param {string} text - Texto
 * @returns {string} String sanitizada
 */
export function sanitizeForId(text) {
  if (typeof text !== 'string') {
    return '';
  }

  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
