/**
 * Testes para StateManager
 * 
 * Valida:
 * - Requirement 10.1: State manager centralizado
 * - Requirement 10.2: State slices
 * - Requirement 10.3: Notificação de mudanças
 * - Requirement 10.6: Fornecimento imediato de estado ao subscrever
 * - Requirement 10.7: Imutabilidade do estado
 * - Requirement 10.10: Persistência de estado
 * - Requirement 10.11: Restauração de estado
 * - Property 19: State Change Notification
 * - Property 20: Immediate State Provision on Subscribe
 * - Property 21: State Immutability
 * - Property 23: State Persistence Round-Trip
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateManager } from '../src/core/state/StateManager.js';
import { initialState, createInitialState } from '../src/core/state/stateSlices.js';

// Mock do StorageAdapter
class MockStorage {
  constructor() {
    this.data = new Map();
  }

  async init() {
    return true;
  }

  async save(storeName, item) {
    if (!this.data.has(storeName)) {
      this.data.set(storeName, new Map());
    }
    this.data.get(storeName).set(item.id, item);
  }

  async get(storeName, id) {
    if (!this.data.has(storeName)) {
      return null;
    }
    return this.data.get(storeName).get(id) || null;
  }

  async getAll(storeName) {
    if (!this.data.has(storeName)) {
      return [];
    }
    return Array.from(this.data.get(storeName).values());
  }

  async update(storeName, item) {
    return this.save(storeName, item);
  }

  async delete(storeName, id) {
    if (this.data.has(storeName)) {
      this.data.get(storeName).delete(id);
    }
  }

  async clear(storeName) {
    if (this.data.has(storeName)) {
      this.data.get(storeName).clear();
    }
  }
}

describe('StateManager', () => {
  let storage;
  let stateManager;

  beforeEach(() => {
    storage = new MockStorage();
    stateManager = new StateManager(storage, createInitialState());
    stateManager.setLogging(false); // Desabilitar logs nos testes
  });

  describe('Initialization', () => {
    it('should initialize with initial state', () => {
      const state = stateManager.getState();
      expect(state).toHaveProperty('insumos');
      expect(state).toHaveProperty('compras');
      expect(state).toHaveProperty('estoque');
      expect(Array.isArray(state.insumos)).toBe(true);
    });

    it('should freeze initial state for immutability', () => {
      const state = stateManager.getState();
      expect(Object.isFrozen(state)).toBe(true);
    });
  });

  describe('getState', () => {
    it('should return entire state when no slice specified', () => {
      const state = stateManager.getState();
      expect(state).toHaveProperty('insumos');
      expect(state).toHaveProperty('compras');
    });

    it('should return specific slice when slice name provided', () => {
      const insumos = stateManager.getState('insumos');
      expect(Array.isArray(insumos)).toBe(true);
    });
  });

  describe('setState', () => {
    it('should update entire state', () => {
      const newState = {
        insumos: [{ id: '1', nome: 'Farinha' }]
      };

      stateManager.setState(newState);
      const state = stateManager.getState();
      
      expect(state.insumos).toHaveLength(1);
      expect(state.insumos[0].nome).toBe('Farinha');
    });

    it('should update specific slice', () => {
      const insumo = { id: '1', nome: 'Farinha' };
      
      stateManager.setState('insumos', [insumo]);
      const insumos = stateManager.getState('insumos');
      
      expect(insumos).toHaveLength(1);
      expect(insumos[0].nome).toBe('Farinha');
    });

    it('should freeze new state after update', () => {
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      const state = stateManager.getState();
      
      expect(Object.isFrozen(state)).toBe(true);
      expect(Object.isFrozen(state.insumos)).toBe(true);
    });

    it('should not mutate previous state', () => {
      const initialInsumos = stateManager.getState('insumos');
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      expect(initialInsumos).toHaveLength(0);
      expect(stateManager.getState('insumos')).toHaveLength(1);
    });
  });

  describe('subscribe and unsubscribe', () => {
    it('should call callback immediately with current state', () => {
      const callback = vi.fn();
      
      stateManager.subscribe('insumos', callback);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([]);
    });

    it('should call callback when state changes', () => {
      const callback = vi.fn();
      
      stateManager.subscribe('insumos', callback);
      callback.mockClear(); // Limpar chamada inicial
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([{ id: '1', nome: 'Farinha' }]);
    });

    it('should not call callback for other slices', () => {
      const insumosCallback = vi.fn();
      const comprasCallback = vi.fn();
      
      stateManager.subscribe('insumos', insumosCallback);
      stateManager.subscribe('compras', comprasCallback);
      
      insumosCallback.mockClear();
      comprasCallback.mockClear();
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      expect(insumosCallback).toHaveBeenCalledTimes(1);
      expect(comprasCallback).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      
      const unsubscribe = stateManager.subscribe('insumos', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should stop calling callback after unsubscribe', () => {
      const callback = vi.fn();
      
      const unsubscribe = stateManager.subscribe('insumos', callback);
      callback.mockClear();
      
      unsubscribe();
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers for same slice', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      stateManager.subscribe('insumos', callback1);
      stateManager.subscribe('insumos', callback2);
      
      callback1.mockClear();
      callback2.mockClear();
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should throw error if callback is not a function', () => {
      expect(() => {
        stateManager.subscribe('insumos', 'not a function');
      }).toThrow('Callback deve ser uma função');
    });

    it('should isolate errors in one subscriber from others', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const errorCallback = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      const goodCallback = vi.fn();
      
      // Subscribe vai chamar os callbacks imediatamente, então o erro vai acontecer aqui
      // Mas não deve lançar erro para fora
      expect(() => {
        stateManager.subscribe('insumos', errorCallback);
      }).not.toThrow();
      
      stateManager.subscribe('insumos', goodCallback);
      
      errorCallback.mockClear();
      goodCallback.mockClear();
      
      // Não deve lançar erro
      expect(() => {
        stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      }).not.toThrow();
      
      // Ambos devem ter sido chamados
      expect(errorCallback).toHaveBeenCalled();
      expect(goodCallback).toHaveBeenCalled();
      
      // Deve ter logado o erro
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('persist and restore', () => {
    it('should persist state to storage', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoPadrao: 500
      };
      
      stateManager.setState('insumos', [insumo]);
      
      await stateManager.persist();
      
      const saved = await storage.get('insumos', 'insumo-1');
      expect(saved).toEqual(insumo);
    });

    it('should restore state from storage', async () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoPadrao: 500
      };
      
      await storage.save('insumos', insumo);
      
      await stateManager.restore();
      
      const insumos = stateManager.getState('insumos');
      expect(insumos).toHaveLength(1);
      expect(insumos[0]).toEqual(insumo);
    });

    it('should notify subscribers after restore', async () => {
      const callback = vi.fn();
      
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoPadrao: 500
      };
      
      await storage.save('insumos', insumo);
      
      stateManager.subscribe('insumos', callback);
      callback.mockClear();
      
      await stateManager.restore();
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([insumo]);
    });

    it('should handle persist errors gracefully', async () => {
      const errorStorage = {
        clear: vi.fn().mockResolvedValue(undefined),
        save: vi.fn().mockRejectedValue(new Error('Storage error'))
      };
      
      const manager = new StateManager(errorStorage, createInitialState());
      manager.setLogging(false);
      manager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      
      await expect(manager.persist()).rejects.toThrow('Storage error');
    });
  });

  describe('clear', () => {
    it('should clear all state', () => {
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      stateManager.setState('compras', [{ id: '1', fornecedor: 'Fornecedor A' }]);
      
      stateManager.clear();
      
      const state = stateManager.getState();
      expect(state.insumos).toHaveLength(0);
      expect(state.compras).toHaveLength(0);
    });

    it('should notify all subscribers after clear', () => {
      const insumosCallback = vi.fn();
      const comprasCallback = vi.fn();
      
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      stateManager.setState('compras', [{ id: '1', fornecedor: 'Fornecedor A' }]);
      
      stateManager.subscribe('insumos', insumosCallback);
      stateManager.subscribe('compras', comprasCallback);
      
      insumosCallback.mockClear();
      comprasCallback.mockClear();
      
      stateManager.clear();
      
      expect(insumosCallback).toHaveBeenCalledWith([]);
      expect(comprasCallback).toHaveBeenCalledWith([]);
    });
  });

  describe('Property 21: State Immutability', () => {
    it('should prevent direct mutation of state', () => {
      const state = stateManager.getState();
      
      expect(() => {
        state.insumos = [{ id: '1', nome: 'Farinha' }];
      }).toThrow();
    });

    it('should prevent mutation of nested objects', () => {
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      const insumos = stateManager.getState('insumos');
      
      expect(() => {
        insumos[0].nome = 'Açúcar';
      }).toThrow();
    });

    it('should prevent mutation of arrays', () => {
      stateManager.setState('insumos', [{ id: '1', nome: 'Farinha' }]);
      const insumos = stateManager.getState('insumos');
      
      expect(() => {
        insumos.push({ id: '2', nome: 'Açúcar' });
      }).toThrow();
    });
  });

  describe('Property 23: State Persistence Round-Trip', () => {
    it('should preserve all fields after persist and restore', async () => {
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

      stateManager.setState('insumos', [insumo]);
      await stateManager.persist();
      
      // Criar novo state manager para simular reload
      const newStateManager = new StateManager(storage, createInitialState());
      newStateManager.setLogging(false);
      await newStateManager.restore();
      
      const restored = newStateManager.getState('insumos');
      expect(restored).toHaveLength(1);
      expect(restored[0]).toEqual(insumo);
      expect(Object.keys(restored[0])).toEqual(Object.keys(insumo));
    });
  });
});
