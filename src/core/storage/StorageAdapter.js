/**
 * StorageAdapter - Interface abstrata para persistência de dados
 * 
 * Define a interface que todas as implementações de storage devem seguir.
 * Permite trocar a implementação (IndexedDB, localStorage, etc.) sem afetar o resto do sistema.
 * 
 * @interface
 */
class StorageAdapter {
  /**
   * Inicializa o storage
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error('Method init() must be implemented');
  }

  /**
   * Obtém um item por chave
   * @param {string} storeName - Nome do store
   * @param {string} key - Chave do item
   * @returns {Promise<Object|null>} Item encontrado ou null
   */
  async get(storeName, key) {
    throw new Error('Method get() must be implemented');
  }

  /**
   * Obtém todos os itens de um store
   * @param {string} storeName - Nome do store
   * @returns {Promise<Array>} Array de itens
   */
  async getAll(storeName) {
    throw new Error('Method getAll() must be implemented');
  }

  /**
   * Salva um item
   * @param {string} storeName - Nome do store
   * @param {Object} item - Item a ser salvo (deve ter propriedade 'id')
   * @returns {Promise<Object>} Item salvo
   */
  async save(storeName, item) {
    throw new Error('Method save() must be implemented');
  }

  /**
   * Atualiza um item existente
   * @param {string} storeName - Nome do store
   * @param {string} key - Chave do item
   * @param {Object} item - Dados atualizados
   * @returns {Promise<Object>} Item atualizado
   */
  async update(storeName, key, item) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Deleta um item
   * @param {string} storeName - Nome do store
   * @param {string} key - Chave do item
   * @returns {Promise<boolean>} true se deletado com sucesso
   */
  async delete(storeName, key) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Limpa todos os itens de um store
   * @param {string} storeName - Nome do store
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    throw new Error('Method clear() must be implemented');
  }

  /**
   * Exporta todos os dados
   * @returns {Promise<Object>} Objeto com todos os dados de todos os stores
   */
  async exportData() {
    throw new Error('Method exportData() must be implemented');
  }

  /**
   * Importa dados
   * @param {Object} data - Dados a serem importados
   * @returns {Promise<void>}
   */
  async importData(data) {
    throw new Error('Method importData() must be implemented');
  }
}

export default StorageAdapter;
