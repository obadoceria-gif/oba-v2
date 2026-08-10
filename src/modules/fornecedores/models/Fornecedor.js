/**
 * Modelo de Fornecedor
 * Representa um fornecedor de insumos
 */

// Funções auxiliares de validação
const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

const validateEmail = (email) => {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone) return true; // Telefone é opcional
  // Aceita formatos: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, ou apenas números
  const phoneRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * @typedef {Object} FornecedorData
 * @property {string} [id] - ID único do fornecedor
 * @property {string} nome - Nome do fornecedor
 * @property {string} [telefone] - Telefone do fornecedor
 * @property {string} [email] - Email do fornecedor
 * @property {string} [endereco] - Endereço do fornecedor
 * @property {boolean} [ativo] - Se o fornecedor está ativo
 * @property {string} [criadoEm] - Data de criação (ISO)
 * @property {string} [atualizadoEm] - Data de atualização (ISO)
 */

export class Fornecedor {
  /**
   * Cria uma nova instância de Fornecedor
   * @param {FornecedorData} data - Dados do fornecedor
   */
  constructor(data) {
    this.id = data.id || this.generateId();
    this.nome = data.nome;
    this.telefone = data.telefone || '';
    this.email = data.email || '';
    this.endereco = data.endereco || '';
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.criadoEm = data.criadoEm || new Date().toISOString();
    this.atualizadoEm = data.atualizadoEm || new Date().toISOString();

    this.validate();
  }

  /**
   * Gera um ID único para o fornecedor
   * @returns {string} ID único
   */
  generateId() {
    return `fornecedor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida os dados do fornecedor
   * @throws {Error} Se os dados forem inválidos
   */
  validate() {
    const errors = [];

    // Validar nome
    if (!validateRequired(this.nome)) {
      errors.push('nome é obrigatório');
    }

    if (this.nome && typeof this.nome === 'string' && this.nome.trim().length < 2) {
      errors.push('nome deve ter pelo menos 2 caracteres');
    }

    // Validar email (se fornecido)
    if (this.email && !validateEmail(this.email)) {
      errors.push('email inválido');
    }

    // Validar telefone (se fornecido)
    if (this.telefone && !validatePhone(this.telefone)) {
      errors.push('telefone inválido');
    }

    // Validar ativo
    if (typeof this.ativo !== 'boolean') {
      errors.push('ativo deve ser um booleano');
    }

    if (errors.length > 0) {
      throw new Error(`Validação falhou: ${errors.join('; ')}`);
    }
  }

  /**
   * Atualiza a data de modificação
   */
  touch() {
    this.atualizadoEm = new Date().toISOString();
  }

  /**
   * Ativa o fornecedor
   */
  ativar() {
    this.ativo = true;
    this.touch();
  }

  /**
   * Desativa o fornecedor
   */
  desativar() {
    this.ativo = false;
    this.touch();
  }

  /**
   * Converte o fornecedor para objeto simples
   * @returns {FornecedorData} Objeto com os dados do fornecedor
   */
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      telefone: this.telefone,
      email: this.email,
      endereco: this.endereco,
      ativo: this.ativo,
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm
    };
  }

  /**
   * Cria uma instância de Fornecedor a partir de um objeto
   * @param {FornecedorData} data - Dados do fornecedor
   * @returns {Fornecedor} Nova instância de Fornecedor
   */
  static fromJSON(data) {
    return new Fornecedor(data);
  }
}
