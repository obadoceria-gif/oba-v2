/**
 * Currency Utilities
 * 
 * Utilities para formatação e parsing de valores monetários.
 * Valores são armazenados em centavos (integers) para evitar problemas de precisão.
 * 
 * Validates: Notes (monetary values in cents)
 */

/**
 * Formata valor em centavos para string em formato brasileiro (R$ X,XX)
 * @param {number} cents - Valor em centavos
 * @returns {string} Valor formatado (ex: "R$ 12,50")
 */
export function formatCurrency(cents) {
  if (typeof cents !== 'number' || isNaN(cents)) {
    throw new Error('Valor deve ser um número válido');
  }

  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
}

/**
 * Converte string de moeda para centavos
 * @param {string} value - String com valor (ex: "R$ 12,50", "12.50", "12,50")
 * @returns {number} Valor em centavos
 */
export function parseCurrency(value) {
  if (typeof value !== 'string') {
    throw new Error('Valor deve ser uma string');
  }

  // Remove símbolos de moeda, espaços e pontos de milhar
  let cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '');

  // Substitui vírgula por ponto para parsing
  cleaned = cleaned.replace(',', '.');

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new Error('Valor inválido para conversão');
  }

  // Converte para centavos e arredonda
  return Math.round(parsed * 100);
}

/**
 * Valida se um valor em centavos é válido
 * @param {number} cents - Valor em centavos
 * @returns {boolean} True se válido
 */
export function isValidCurrency(cents) {
  return typeof cents === 'number' && !isNaN(cents) && cents >= 0;
}

/**
 * Soma valores em centavos
 * @param {...number} values - Valores em centavos
 * @returns {number} Soma em centavos
 */
export function sumCurrency(...values) {
  return values.reduce((sum, value) => {
    if (!isValidCurrency(value)) {
      throw new Error('Todos os valores devem ser números válidos');
    }
    return sum + value;
  }, 0);
}

/**
 * Multiplica valor em centavos por quantidade
 * @param {number} cents - Valor unitário em centavos
 * @param {number} quantity - Quantidade
 * @returns {number} Total em centavos
 */
export function multiplyCurrency(cents, quantity) {
  if (!isValidCurrency(cents)) {
    throw new Error('Valor deve ser um número válido');
  }
  if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 0) {
    throw new Error('Quantidade deve ser um número válido');
  }

  return Math.round(cents * quantity);
}
