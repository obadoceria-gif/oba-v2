import StorageAdapter from './StorageAdapter.js';

/**
 * LocalStorageAdapter - Implementação fallback usando localStorage
 * 
 * Usado quando IndexedDB não está disponível.
 * Armazena dados como JSON strings no localStorage.
 * 
 * Limitações:
 * - Limite de ~5-10MB dependendo do navegador
 * - Operações síncronas (podem bloquear UI em grandes volumes)
 * - Sem suporte a índices ou queries complexas
 * 
 * @extends StorageAdapter
 */
class LocalStorageAdapter extends StorageAdapter {
  constructor(prefix = 'oba_') {
    super();
    this.prefix = prefix;
    
    // Definição dos stores
    this.stores = [
      'insumos',
      'compras',
      'fornecedores',
      'estoque',
      'movimentacoes',
      'clientes',
      'pedidos',
      'fichas',
      'producoes'
    ];
  }

  /**
   * Inicializa o localStorage (sempre disponível)
   */
  async init() {
    // Verificar se localStorage está disponível
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      
      // Inicializar stores vazios se não existirem
      this.stores.forEach(storeName => {
        const key = this._getStoreKey(storeName);
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify([]));
        }
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('localStorage não está disponível'));
    }
  }

  /**
   * Obtém um item por chave
   */
  async get(storeName, key) {
    this._validateStore(storeName);
    
    const items = this._getStoreData(storeName);
    const item = items.find(i => i.id === key);
    
    return Promise.resolve(item || null);
  }

  /**
   * Obtém todos os itens de um store
   */
  async getAll(storeName) {
    this._validateStore(storeName);
    
    const items = this._getStoreData(storeName);
    
    return Promise.resolve(items);
  }

  /**
   * Salva um item
   */
  async save(storeName, item) {
    this._validateStore(storeName);
    
    if (!item.id) {
      return Promise.reject(new Error('Item deve ter propriedade "id"'));
    }

    try {
      const items = this._getStoreData(storeName);
      
      // Verificar se já existe
      const existingIndex = items.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        // Atualizar existente
        items[existingIndex] = item;
      } else {
        // Adicionar novo
        items.push(item);
      }
      
      this._setStoreData(storeName, items);
      
      return Promise.resolve(item);
    } catch (error) {
      return Promise.reject(new Error(`Erro ao salvar item: ${error.message}`));
    }
  }

  /**
   * Atualiza um item existente
   */
  async update(storeName, key, updates) {
    this._validateStore(storeName);
    
    const items = this._getStoreData(storeName);
    const existingIndex = items.findIndex(i => i.id === key);
    
    if (existingIndex < 0) {
      return Promise.reject(new Error(`Item com id "${key}" não encontrado`));
    }

    // Mesclar atualizações
    const updated = { ...items[existingIndex], ...updates, id: key };
    items[existingIndex] = updated;
    
    this._setStoreData(storeName, items);
    
    return Promise.resolve(updated);
  }

  /**
   * Deleta um item
   */
  async delete(storeName, key) {
    this._validateStore(storeName);
    
    try {
      const items = this._getStoreData(storeName);
      const filtered = items.filter(i => i.id !== key);
      
      this._setStoreData(storeName, filtered);
      
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(new Error(`Erro ao deletar item: ${error.message}`));
    }
  }

  /**
   * Limpa todos os itens de um store
   */
  async clear(storeName) {
    this._validateStore(storeName);
    
    try {
      this._setStoreData(storeName, []);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(`Erro ao limpar store: ${error.message}`));
    }
  }

  /**
   * Exporta todos os dados
   */
  async exportData() {
    const data = {};
    
    this.stores.forEach(storeName => {
      data[storeName] = this._getStoreData(storeName);
    });
    
    return Promise.resolve({
      version: 1,
      timestamp: new Date().toISOString(),
      data
    });
  }

  /**
   * Importa dados
   */
  async importData(exportedData) {
    if (!exportedData || !exportedData.data) {
      return Promise.reject(new Error('Dados de importação inválidos'));
    }

    const { data } = exportedData;

    // Validar estrutura
    for (const storeName of this.stores) {
      if (!Array.isArray(data[storeName])) {
        return Promise.reject(new Error(`Store "${storeName}" deve ser um array`));
      }
    }

    try {
      // Limpar stores existentes
      this.stores.forEach(storeName => {
        this._setStoreData(storeName, []);
      });

      // Importar dados
      this.stores.forEach(storeName => {
        this._setStoreData(storeName, data[storeName]);
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(`Erro ao importar dados: ${error.message}`));
    }
  }

  /**
   * Obtém a chave do store no localStorage
   * @private
   */
  _getStoreKey(storeName) {
    return `${this.prefix}${storeName}`;
  }

  /**
   * Obtém dados de um store
   * @private
   */
  _getStoreData(storeName) {
    const key = this._getStoreKey(storeName);
    const data = localStorage.getItem(key);
    
    if (!data) {
      return [];
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erro ao parsear dados do store ${storeName}:`, error);
      return [];
    }
  }

  /**
   * Define dados de um store
   * @private
   */
  _setStoreData(storeName, items) {
    const key = this._getStoreKey(storeName);
    
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      // Pode falhar se exceder quota
      if (error.name === 'QuotaExceededError') {
        throw new Error('Limite de armazenamento excedido. Considere exportar e limpar dados antigos.');
      }
      throw error;
    }
  }

  /**
   * Valida se o store existe
   * @private
   */
  _validateStore(storeName) {
    if (!this.stores.includes(storeName)) {
      throw new Error(`Store "${storeName}" não existe. Stores válidos: ${this.stores.join(', ')}`);
    }
  }
}

export default LocalStorageAdapter;
