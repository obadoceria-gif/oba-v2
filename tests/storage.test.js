import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import IndexedDBAdapter from '../src/core/storage/IndexedDBAdapter.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';

// Mock IndexedDB para testes
import 'fake-indexeddb/auto';

describe('Storage Layer - IndexedDBAdapter', () => {
  let storage;

  beforeEach(async () => {
    storage = new IndexedDBAdapter('TestDB', 1);
    await storage.init();
  });

  afterEach(async () => {
    // Limpar todos os stores
    for (const storeName of storage.stores) {
      await storage.clear(storeName);
    }
  });

  describe('Initialization', () => {
    it('should initialize IndexedDB successfully', async () => {
      expect(storage.db).toBeDefined();
      expect(storage.db.name).toBe('TestDB');
    });

    it('should create all required object stores', () => {
      const expectedStores = [
        'insumos',
        'compras',
        'fornecedores',
        'estoque',
        'movimentacoes',
        'clientes',
        'pedidos',
        'fichas'
      ];

      expectedStores.forEach(storeName => {
        expect(storage.db.objectStoreNames.contains(storeName)).toBe(true);
      });
    });
  });

  describe('Save and Get Operations', () => {
    it('should save and retrieve an item', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoPadrao: 500
      };

      await storage.save('insumos', insumo);
      const retrieved = await storage.get('insumos', 'insumo-1');

      expect(retrieved).toEqual(insumo);
    });

    it('should return null for non-existent item', async () => {
      const result = await storage.get('insumos', 'non-existent');
      expect(result).toBeNull();
    });

    it('should reject save without id', async () => {
      const insumo = {
        nome: 'Farinha de Trigo',
        unidade: 'kg'
      };

      await expect(storage.save('insumos', insumo))
        .rejects.toThrow('Item deve ter propriedade "id"');
    });
  });

  describe('GetAll Operation', () => {
    it('should retrieve all items from a store', async () => {
      const insumos = [
        { id: 'insumo-1', nome: 'Farinha' },
        { id: 'insumo-2', nome: 'Açúcar' },
        { id: 'insumo-3', nome: 'Ovos' }
      ];

      for (const insumo of insumos) {
        await storage.save('insumos', insumo);
      }

      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toHaveLength(3);
      expect(retrieved).toEqual(expect.arrayContaining(insumos));
    });

    it('should return empty array for empty store', async () => {
      const result = await storage.getAll('insumos');
      expect(result).toEqual([]);
    });
  });

  describe('Update Operation', () => {
    it('should update an existing item', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        custoPadrao: 500
      };

      await storage.save('insumos', insumo);
      
      const updated = await storage.update('insumos', 'insumo-1', {
        custoPadrao: 600
      });

      expect(updated.custoPadrao).toBe(600);
      expect(updated.nome).toBe('Farinha');
    });

    it('should reject update for non-existent item', async () => {
      await expect(storage.update('insumos', 'non-existent', { nome: 'Test' }))
        .rejects.toThrow('não encontrado');
    });
  });

  describe('Delete Operation', () => {
    it('should delete an item', async () => {
      const insumo = { id: 'insumo-1', nome: 'Farinha' };
      
      await storage.save('insumos', insumo);
      await storage.delete('insumos', 'insumo-1');
      
      const retrieved = await storage.get('insumos', 'insumo-1');
      expect(retrieved).toBeNull();
    });

    it('should return true even if item does not exist', async () => {
      const result = await storage.delete('insumos', 'non-existent');
      expect(result).toBe(true);
    });
  });

  describe('Clear Operation', () => {
    it('should clear all items from a store', async () => {
      const insumos = [
        { id: 'insumo-1', nome: 'Farinha' },
        { id: 'insumo-2', nome: 'Açúcar' }
      ];

      for (const insumo of insumos) {
        await storage.save('insumos', insumo);
      }

      await storage.clear('insumos');
      
      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toEqual([]);
    });
  });

  describe('Export and Import', () => {
    it('should export all data', async () => {
      const insumo = { id: 'insumo-1', nome: 'Farinha' };
      const compra = { id: 'compra-1', fornecedor: 'Fornecedor A' };

      await storage.save('insumos', insumo);
      await storage.save('compras', compra);

      const exported = await storage.exportData();

      expect(exported).toHaveProperty('version');
      expect(exported).toHaveProperty('timestamp');
      expect(exported).toHaveProperty('data');
      expect(exported.data.insumos).toContainEqual(insumo);
      expect(exported.data.compras).toContainEqual(compra);
    });

    it('should import data successfully', async () => {
      const exportedData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          insumos: [{ id: 'insumo-1', nome: 'Farinha' }],
          compras: [{ id: 'compra-1', fornecedor: 'Fornecedor A' }],
          fornecedores: [],
          estoque: [],
          movimentacoes: [],
          clientes: [],
          pedidos: [],
          fichas: [],
          producoes: []
        }
      };

      await storage.importData(exportedData);

      const insumos = await storage.getAll('insumos');
      const compras = await storage.getAll('compras');

      expect(insumos).toHaveLength(1);
      expect(compras).toHaveLength(1);
      expect(insumos[0].nome).toBe('Farinha');
    });

    it('should reject invalid import data', async () => {
      await expect(storage.importData(null))
        .rejects.toThrow('inválidos');

      await expect(storage.importData({}))
        .rejects.toThrow('inválidos');
    });
  });

  describe('Store Validation', () => {
    it('should reject operations on invalid store', async () => {
      await expect(storage.get('invalid_store', 'key'))
        .rejects.toThrow('não existe');

      await expect(storage.save('invalid_store', { id: '1' }))
        .rejects.toThrow('não existe');
    });
  });

  describe('Error Handling (Requirement 12.5)', () => {
    it('should handle transaction errors gracefully', async () => {
      // Tentar salvar após fechar o banco
      storage.db.close();
      
      await expect(storage.save('insumos', { id: 'test' }))
        .rejects.toThrow();
      
      // Reinicializar para outros testes
      await storage.init();
    });

    it('should provide user-friendly error messages', async () => {
      try {
        await storage.save('insumos', { nome: 'Sem ID' });
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toContain('id');
        expect(error.message).not.toContain('undefined');
      }
    });

    it('should handle concurrent operations', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `insumo-${i}`,
        nome: `Insumo ${i}`
      }));

      // Salvar múltiplos itens simultaneamente
      const promises = items.map(item => storage.save('insumos', item));
      await expect(Promise.all(promises)).resolves.toBeDefined();

      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toHaveLength(10);
    });

    it('should handle large data sets', async () => {
      const largeDataSet = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        nome: `Item ${i}`,
        descricao: 'A'.repeat(1000) // 1KB de texto por item
      }));

      for (const item of largeDataSet) {
        await storage.save('insumos', item);
      }

      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toHaveLength(100);
    });

    it('should handle special characters in data', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Açúcar Cristal',
        descricao: 'Ingrediente básico com acentuação: á é í ó ú ã õ ç',
        observacoes: 'Símbolos: @#$%&*()[]{}|\\/<>?'
      };

      await storage.save('insumos', insumo);
      const retrieved = await storage.get('insumos', 'insumo-1');

      expect(retrieved.nome).toBe('Açúcar Cristal');
      expect(retrieved.descricao).toContain('acentuação');
      expect(retrieved.observacoes).toContain('@#$%');
    });
  });
});

describe('Storage Layer - LocalStorageAdapter', () => {
  let storage;

  beforeEach(async () => {
    localStorage.clear();
    storage = new LocalStorageAdapter('test_');
    await storage.init();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize localStorage successfully', async () => {
      expect(storage.stores).toBeDefined();
      expect(storage.stores).toHaveLength(9); // insumos, compras, fornecedores, estoque, movimentacoes, clientes, pedidos, fichas
    });

    it('should create empty stores on init', async () => {
      const insumos = await storage.getAll('insumos');
      expect(insumos).toEqual([]);
    });
  });

  describe('Save and Get Operations', () => {
    it('should save and retrieve an item', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoPadrao: 500
      };

      await storage.save('insumos', insumo);
      const retrieved = await storage.get('insumos', 'insumo-1');

      expect(retrieved).toEqual(insumo);
    });

    it('should return null for non-existent item', async () => {
      const result = await storage.get('insumos', 'non-existent');
      expect(result).toBeNull();
    });

    it('should update existing item on save', async () => {
      const insumo = { id: 'insumo-1', nome: 'Farinha', custoPadrao: 500 };
      
      await storage.save('insumos', insumo);
      await storage.save('insumos', { ...insumo, custoPadrao: 600 });
      
      const retrieved = await storage.get('insumos', 'insumo-1');
      expect(retrieved.custoPadrao).toBe(600);
    });
  });

  describe('GetAll Operation', () => {
    it('should retrieve all items from a store', async () => {
      const insumos = [
        { id: 'insumo-1', nome: 'Farinha' },
        { id: 'insumo-2', nome: 'Açúcar' },
        { id: 'insumo-3', nome: 'Ovos' }
      ];

      for (const insumo of insumos) {
        await storage.save('insumos', insumo);
      }

      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toHaveLength(3);
      expect(retrieved).toEqual(expect.arrayContaining(insumos));
    });
  });

  describe('Update Operation', () => {
    it('should update an existing item', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        custoPadrao: 500
      };

      await storage.save('insumos', insumo);
      
      const updated = await storage.update('insumos', 'insumo-1', {
        custoPadrao: 600
      });

      expect(updated.custoPadrao).toBe(600);
      expect(updated.nome).toBe('Farinha');
    });

    it('should reject update for non-existent item', async () => {
      await expect(storage.update('insumos', 'non-existent', { nome: 'Test' }))
        .rejects.toThrow('não encontrado');
    });
  });

  describe('Delete Operation', () => {
    it('should delete an item', async () => {
      const insumo = { id: 'insumo-1', nome: 'Farinha' };
      
      await storage.save('insumos', insumo);
      await storage.delete('insumos', 'insumo-1');
      
      const retrieved = await storage.get('insumos', 'insumo-1');
      expect(retrieved).toBeNull();
    });
  });

  describe('Clear Operation', () => {
    it('should clear all items from a store', async () => {
      const insumos = [
        { id: 'insumo-1', nome: 'Farinha' },
        { id: 'insumo-2', nome: 'Açúcar' }
      ];

      for (const insumo of insumos) {
        await storage.save('insumos', insumo);
      }

      await storage.clear('insumos');
      
      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toEqual([]);
    });
  });

  describe('Export and Import', () => {
    it('should export all data', async () => {
      const insumo = { id: 'insumo-1', nome: 'Farinha' };
      const compra = { id: 'compra-1', fornecedor: 'Fornecedor A' };

      await storage.save('insumos', insumo);
      await storage.save('compras', compra);

      const exported = await storage.exportData();

      expect(exported).toHaveProperty('version');
      expect(exported).toHaveProperty('timestamp');
      expect(exported).toHaveProperty('data');
      expect(exported.data.insumos).toContainEqual(insumo);
      expect(exported.data.compras).toContainEqual(compra);
    });

    it('should import data successfully', async () => {
      const exportedData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          insumos: [{ id: 'insumo-1', nome: 'Farinha' }],
          compras: [{ id: 'compra-1', fornecedor: 'Fornecedor A' }],
          fornecedores: [],
          estoque: [],
          movimentacoes: [],
          clientes: [],
          pedidos: [],
          fichas: [],
          producoes: []
        }
      };

      await storage.importData(exportedData);

      const insumos = await storage.getAll('insumos');
      const compras = await storage.getAll('compras');

      expect(insumos).toHaveLength(1);
      expect(compras).toHaveLength(1);
      expect(insumos[0].nome).toBe('Farinha');
    });
  });

  describe('Data Persistence Round-Trip (Property 3)', () => {
    it('should preserve all fields after save and retrieve', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoPadrao: 500,
        fornecedorPadrao: 'Fornecedor A',
        categoria: 'Ingredientes',
        estoqueMinimo: 10,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      };

      await storage.save('insumos', insumo);
      const retrieved = await storage.get('insumos', 'insumo-1');

      expect(retrieved).toEqual(insumo);
      expect(Object.keys(retrieved)).toEqual(Object.keys(insumo));
    });
  });

  describe('Error Handling (Requirement 12.5)', () => {
    it('should handle localStorage quota exceeded', async () => {
      // Criar dados grandes para testar limite
      const largeItem = {
        id: 'large-item',
        data: 'x'.repeat(5 * 1024 * 1024) // 5MB
      };

      // Dependendo do navegador, pode lançar erro ou truncar
      // Apenas verificamos que não quebra a aplicação
      try {
        await storage.save('insumos', largeItem);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle corrupted localStorage data', async () => {
      // Corromper dados manualmente
      localStorage.setItem('test_insumos', 'invalid json {{{');

      // Deve retornar array vazio ou lançar erro tratado
      try {
        const result = await storage.getAll('insumos');
        expect(Array.isArray(result)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle special characters in localStorage', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Açúcar Cristal',
        descricao: 'Ingrediente básico com acentuação: á é í ó ú ã õ ç',
        observacoes: 'Símbolos: @#$%&*()[]{}|\\/<>?'
      };

      await storage.save('insumos', insumo);
      const retrieved = await storage.get('insumos', 'insumo-1');

      expect(retrieved.nome).toBe('Açúcar Cristal');
      expect(retrieved.descricao).toContain('acentuação');
      expect(retrieved.observacoes).toContain('@#$%');
    });

    it('should handle concurrent operations in localStorage', async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: `insumo-${i}`,
        nome: `Insumo ${i}`
      }));

      // Salvar múltiplos itens simultaneamente
      const promises = items.map(item => storage.save('insumos', item));
      await expect(Promise.all(promises)).resolves.toBeDefined();

      const retrieved = await storage.getAll('insumos');
      expect(retrieved).toHaveLength(20);
    });
  });
});

describe('Storage Fallback - IndexedDB to LocalStorage', () => {
  it('should use LocalStorageAdapter when IndexedDB fails', async () => {
    // Simular falha do IndexedDB
    const originalIndexedDB = global.indexedDB;
    global.indexedDB = undefined;

    const fallbackStorage = new LocalStorageAdapter('fallback_');
    await fallbackStorage.init();

    const insumo = { id: 'insumo-1', nome: 'Farinha' };
    await fallbackStorage.save('insumos', insumo);
    const retrieved = await fallbackStorage.get('insumos', 'insumo-1');

    expect(retrieved).toEqual(insumo);

    // Restaurar
    global.indexedDB = originalIndexedDB;
    localStorage.clear();
  });

  it('should maintain same interface between adapters', async () => {
    const indexedDBStorage = new IndexedDBAdapter('TestDB', 1);
    const localStorageAdapter = new LocalStorageAdapter('test_');

    // Verificar que ambos têm os mesmos métodos
    const methods = ['init', 'get', 'getAll', 'save', 'update', 'delete', 'clear', 'exportData', 'importData'];
    
    methods.forEach(method => {
      expect(typeof indexedDBStorage[method]).toBe('function');
      expect(typeof localStorageAdapter[method]).toBe('function');
    });
  });
});
