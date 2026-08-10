/**
 * Date Utilities
 * 
 * Utilities para formatação e parsing de datas.
 * Datas são armazenadas em formato ISO 8601 (YYYY-MM-DD).
 * 
 * Validates: Notes (dates in ISO 8601)
 */

/**
 * Formata data ISO para formato brasileiro (DD/MM/YYYY)
 * @param {string} isoString - Data em formato ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
export function formatDate(isoString) {
  if (typeof isoString !== 'string') {
    throw new Error('Data deve ser uma string');
  }

  // Extrai apenas a parte da data (YYYY-MM-DD)
  const datePart = isoString.split('T')[0];
  const [year, month, day] = datePart.split('-');

  if (!year || !month || !day) {
    throw new Error('Data inválida. Use formato ISO 8601 (YYYY-MM-DD)');
  }

  return `${day}/${month}/${year}`;
}

/**
 * Converte string de data brasileira para ISO 8601
 * @param {string} dateString - Data em formato DD/MM/YYYY
 * @returns {string} Data em formato ISO 8601 (YYYY-MM-DD)
 */
export function parseDate(dateString) {
  if (typeof dateString !== 'string') {
    throw new Error('Data deve ser uma string');
  }

  const parts = dateString.split('/');
  
  if (parts.length !== 3) {
    throw new Error('Data inválida. Use formato DD/MM/YYYY');
  }

  const [day, month, year] = parts;

  // Valida componentes
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    throw new Error('Data contém valores não numéricos');
  }

  if (monthNum < 1 || monthNum > 12) {
    throw new Error('Mês inválido');
  }

  if (dayNum < 1 || dayNum > 31) {
    throw new Error('Dia inválido');
  }

  // Formata com zero padding
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay}`;
}

/**
 * Valida se uma string está em formato ISO 8601 válido
 * @param {string} dateString - String de data
 * @returns {boolean} True se válida
 */
export function isValidDate(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }

  // Regex para ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  
  if (!isoRegex.test(dateString)) {
    return false;
  }

  // Tenta criar Date object para validar
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Retorna data atual em formato ISO 8601 (YYYY-MM-DD)
 * @returns {string} Data atual
 */
export function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Retorna timestamp atual em formato ISO 8601 completo
 * @returns {string} Timestamp atual (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Compara duas datas ISO
 * @param {string} date1 - Primeira data
 * @param {string} date2 - Segunda data
 * @returns {number} -1 se date1 < date2, 0 se iguais, 1 se date1 > date2
 */
export function compareDates(date1, date2) {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    throw new Error('Datas inválidas para comparação');
  }

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * Adiciona dias a uma data
 * @param {string} isoDate - Data em formato ISO
 * @param {number} days - Número de dias a adicionar
 * @returns {string} Nova data em formato ISO
 */
export function addDays(isoDate, days) {
  if (!isValidDate(isoDate)) {
    throw new Error('Data inválida');
  }
  if (typeof days !== 'number' || isNaN(days)) {
    throw new Error('Número de dias deve ser um número válido');
  }

  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  
  return date.toISOString().split('T')[0];
}
