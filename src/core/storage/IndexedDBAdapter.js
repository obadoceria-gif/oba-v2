import StorageAdapter from './StorageAdapter.js';

/**
 * IndexedDBAdapter - Implementação principal de persistência usando IndexedDB
 * 
 * Gerencia 8 object stores:
 * - insumos
 * - compras
 * - fornecedores
 * - estoque
 * - movimentacoes
 * - clientes
 * - pedidos
 * - fichas
 * 
 * @extends StorageAdapter
 */
class IndexedDBAdapter extends StorageAdapter {
  constructor(dbName = 'OBADoceriaDB', version = 2) {
    super();
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    
    // Definição dos stores
    this.stores = [
      'insumos',
      'compras',
      'fornecedores',
      'estoque',
      'movimentacoes',
      'clientes',
      'pedidos',
      'fichas'
    ];
  }

  /**
   * Inicializa o IndexedDB e cria os object stores
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Erro ao abrir IndexedDB: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criar object stores se não existirem
        this.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  /**
   * Obtém um item por chave
   */
  async get(storeName, key) {
    this._validateStore(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao buscar item: ${request.error}`));
      };
    });
  }

  /**
   * Obtém todos os itens de um store
   */
  async getAll(storeName) {
    this._validateStore(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao buscar itens: ${request.error}`));
      };
    });
  }

  /**
   * Salva um item
   */
  async save(storeName, item) {
    this._validateStore(storeName);
    
    if (!item.id) {
      throw new Error('Item deve ter propriedade "id"');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao salvar item: ${request.error}`));
      };
    });
  }

  /**
   * Atualiza um item existente
   */
  async update(storeName, key, updates) {
    this._validateStore(storeName);
    
    // Buscar item existente
    const existing = await this.get(storeName, key);
    
    if (!existing) {
      throw new Error(`Item com id "${key}" não encontrado`);
    }

    // Mesclar atualizações
    const updated = { ...existing, ...updates, id: key };
    
    // Salvar
    return this.save(storeName, updated);
  }

  /**
   * Deleta um item
   */
  async delete(storeName, key) {
    this._validateStore(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error(`Erro ao deletar item: ${request.error}`));
      };
    });
  }

  /**
   * Limpa todos os itens de um store
   */
  async clear(storeName) {
    this._validateStore(storeName);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Erro ao limpar store: ${request.error}`));
      };
    });
  }

  /**
   * Exporta todos os dados
   */
  async exportData() {
    const data = {};
    
    for (const storeName of this.stores) {
      data[storeName] = await this.getAll(storeName);
    }
    
    return {
      version: this.version,
      timestamp: new Date().toISOString(),
      data
    };
  }

  /**
   * Importa dados
   */
  async importData(exportedData) {
    if (!exportedData || !exportedData.data) {
      throw new Error('Dados de importação inválidos');
    }

    const { data } = exportedData;

    // Validar estrutura
    for (const storeName of this.stores) {
      if (!Array.isArray(data[storeName])) {
        throw new Error(`Store "${storeName}" deve ser um array`);
      }
    }

    // Limpar stores existentes
    for (const storeName of this.stores) {
      await this.clear(storeName);
    }

    // Importar dados
    for (const storeName of this.stores) {
      const items = data[storeName];
      
      for (const item of items) {
        await this.save(storeName, item);
      }
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
    
    if (!this.db) {
      throw new Error('IndexedDB não foi inicializado. Chame init() primeiro.');
    }
  }
}

export default IndexedDBAdapter;
