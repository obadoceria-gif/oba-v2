/**
 * Property-Based Test: State Immutability
 * 
 * Feature: sistema-oba-v2-modular
 * Property 21: State Immutability
 * 
 * Validates: Requirements 10.7
 * 
 * For any state object retrieved from the state manager, modifying it should not 
 * affect the state stored in the manager. The original state should remain unchanged.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { StateManager } from '../src/core/state/StateManager.js';
import { createInitialState } from '../src/core/state/stateSlices.js';

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

describe('Property 21: State Immutability', () => {
  let storage;
  let stateManager;

  beforeEach(() => {
    storage = new MockStorage();
    stateManager = new StateManager(storage, createInitialState());
    stateManager.setLogging(false);
  });

  // Generator para insumos
  const insumoArbitrary = fc.record({
    id: fc.uuid(),
    nome: fc.string({ minLength: 1, maxLength: 50 }),
    unidade: fc.constantFrom('kg', 'g', 'L', 'mL', 'unidade', 'pacote', 'caixa'),
    custoPadrao: fc.integer({ min: 1, max: 1000000 }),
    fornecedorPadrao: fc.string({ minLength: 1, maxLength: 50 }),
    categoria: fc.string({ minLength: 1, maxLength: 30 }),
    estoqueMinimo: fc.integer({ min: 0, max: 1000 })
  });

  // Generator para compras
  const compraArbitrary = fc.record({
    id: fc.uuid(),
    fornecedor: fc.string({ minLength: 1, maxLength: 50 }),
    data: fc.date().map(d => d.toISOString()),
    status: fc.constantFrom('rascunho', 'pendente', 'aprovado', 'recebido', 'cancelado'),
    observacoes: fc.string({ maxLength: 200 })
  });

  // Generator para estoque
  const estoqueArbitrary = fc.record({
    insumoId: fc.uuid(),
    quantidadeAtual: fc.integer({ min: 0, max: 10000 }),
    custoMedioPonderado: fc.integer({ min: 0, max: 1000000 })
  });

  it('should prevent mutation of root state object for any state', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(compraArbitrary, { minLength: 0, maxLength: 10 }),
        (insumos, compras) => {
          // Arrange: Set state with generated data
          stateManager.setState('insumos', insumos);
          stateManager.setState('compras', compras);

          // Act: Get state
          const state = stateManager.getState();

          // Assert: State should be frozen
          expect(Object.isFrozen(state)).toBe(true);

          // Attempt to mutate should throw
          expect(() => {
            state.insumos = [];
          }).toThrow();

          expect(() => {
            state.compras = [];
          }).toThrow();

          expect(() => {
            state.newProperty = 'test';
          }).toThrow();

          // Original state should remain unchanged
          const stateAfter = stateManager.getState();
          expect(stateAfter.insumos).toEqual(insumos);
          expect(stateAfter.compras).toEqual(compras);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent mutation of array slices for any data', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 10 }),
        (insumos) => {
          // Arrange: Set state with generated insumos
          stateManager.setState('insumos', insumos);

          // Act: Get insumos slice
          const insumosSlice = stateManager.getState('insumos');

          // Assert: Array should be frozen
          expect(Object.isFrozen(insumosSlice)).toBe(true);

          // Attempt to mutate array should throw
          expect(() => {
            insumosSlice.push({ id: 'new', nome: 'New' });
          }).toThrow();

          expect(() => {
            insumosSlice.pop();
          }).toThrow();

          expect(() => {
            insumosSlice.shift();
          }).toThrow();

          expect(() => {
            insumosSlice.unshift({ id: 'new', nome: 'New' });
          }).toThrow();

          expect(() => {
            insumosSlice.splice(0, 1);
          }).toThrow();

          // Note: sort() and reverse() on frozen arrays don't throw in strict mode,
          // but they also don't modify the array. We verify immutability by checking
          // the array remains unchanged instead.

          // Original state should remain unchanged
          const insumosAfter = stateManager.getState('insumos');
          expect(insumosAfter).toEqual(insumos);
          expect(insumosAfter.length).toBe(insumos.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent mutation of nested objects for any data', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 10 }),
        (insumos) => {
          // Arrange: Set state with generated insumos
          stateManager.setState('insumos', insumos);

          // Act: Get insumos and try to mutate nested objects
          const insumosSlice = stateManager.getState('insumos');

          // Assert: Each object should be frozen
          insumosSlice.forEach((insumo, index) => {
            expect(Object.isFrozen(insumo)).toBe(true);

            // Attempt to mutate properties should throw
            expect(() => {
              insumo.nome = 'Modified';
            }).toThrow();

            expect(() => {
              insumo.custoPadrao = 999999;
            }).toThrow();

            expect(() => {
              insumo.newProperty = 'test';
            }).toThrow();

            expect(() => {
              delete insumo.nome;
            }).toThrow();

            // Original object should remain unchanged
            const insumosAfter = stateManager.getState('insumos');
            expect(insumosAfter[index]).toEqual(insumos[index]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent mutation through array index assignment for any data', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (insumos, indexToModify) => {
          // Arrange: Set state with generated insumos
          stateManager.setState('insumos', insumos);

          // Act: Get insumos and try to replace an element
          const insumosSlice = stateManager.getState('insumos');
          const validIndex = indexToModify % insumosSlice.length;

          // Assert: Attempt to replace element should throw
          expect(() => {
            insumosSlice[validIndex] = { id: 'replaced', nome: 'Replaced' };
          }).toThrow();

          // Original state should remain unchanged
          const insumosAfter = stateManager.getState('insumos');
          expect(insumosAfter).toEqual(insumos);
          expect(insumosAfter[validIndex]).toEqual(insumos[validIndex]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain immutability across multiple state updates', () => {
    fc.assert(
      fc.property(
        fc.array(fc.array(insumoArbitrary, { minLength: 0, maxLength: 5 }), { minLength: 2, maxLength: 5 }),
        (insumosSequence) => {
          // Arrange & Act: Apply multiple state updates
          const retrievedStates = [];

          for (const insumos of insumosSequence) {
            stateManager.setState('insumos', insumos);
            retrievedStates.push(stateManager.getState('insumos'));
          }

          // Assert: All retrieved states should be frozen
          retrievedStates.forEach((state, index) => {
            expect(Object.isFrozen(state)).toBe(true);

            // Attempt to mutate should throw
            expect(() => {
              state.push({ id: 'new', nome: 'New' });
            }).toThrow();

            // Each state should match the corresponding input
            expect(state).toEqual(insumosSequence[index]);
          });

          // Final state should match last update
          const finalState = stateManager.getState('insumos');
          expect(finalState).toEqual(insumosSequence[insumosSequence.length - 1]);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should prevent mutation of different slice types', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(compraArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(estoqueArbitrary, { minLength: 1, maxLength: 5 }),
        (insumos, compras, estoques) => {
          // Arrange: Set multiple slices
          stateManager.setState('insumos', insumos);
          stateManager.setState('compras', compras);
          stateManager.setState('estoque', estoques);

          // Act: Get all slices
          const insumosSlice = stateManager.getState('insumos');
          const comprasSlice = stateManager.getState('compras');
          const estoqueSlice = stateManager.getState('estoque');

          // Assert: All slices should be frozen
          expect(Object.isFrozen(insumosSlice)).toBe(true);
          expect(Object.isFrozen(comprasSlice)).toBe(true);
          expect(Object.isFrozen(estoqueSlice)).toBe(true);

          // Attempt to mutate any slice should throw
          expect(() => {
            insumosSlice.push({ id: 'new', nome: 'New' });
          }).toThrow();

          expect(() => {
            comprasSlice[0].fornecedor = 'Modified';
          }).toThrow();

          expect(() => {
            estoqueSlice[0].quantidadeAtual = 999999;
          }).toThrow();

          // All original states should remain unchanged
          expect(stateManager.getState('insumos')).toEqual(insumos);
          expect(stateManager.getState('compras')).toEqual(compras);
          expect(stateManager.getState('estoque')).toEqual(estoques);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should ensure immutability after clear operation', () => {
    fc.assert(
      fc.property(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 10 }),
        (insumos) => {
          // Arrange: Set state with data
          stateManager.setState('insumos', insumos);

          // Act: Clear state
          stateManager.clear();
          const clearedState = stateManager.getState('insumos');

          // Assert: Cleared state should be frozen
          expect(Object.isFrozen(clearedState)).toBe(true);

          // Attempt to mutate cleared state should throw
          expect(() => {
            clearedState.push({ id: 'new', nome: 'New' });
          }).toThrow();

          // State should remain empty
          expect(stateManager.getState('insumos')).toEqual([]);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain immutability with deeply nested structures', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            fornecedor: fc.string({ minLength: 1, maxLength: 50 }),
            itens: fc.array(
              fc.record({
                insumoId: fc.uuid(),
                quantidade: fc.integer({ min: 1, max: 1000 }),
                valorUnitario: fc.integer({ min: 1, max: 100000 })
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (compras) => {
          // Arrange: Set state with nested structure
          stateManager.setState('compras', compras);

          // Act: Get compras
          const comprasSlice = stateManager.getState('compras');

          // Assert: Root array should be frozen
          expect(Object.isFrozen(comprasSlice)).toBe(true);

          // Each compra should be frozen
          comprasSlice.forEach((compra, compraIndex) => {
            expect(Object.isFrozen(compra)).toBe(true);

            // Nested itens array should be frozen
            expect(Object.isFrozen(compra.itens)).toBe(true);

            // Each item should be frozen
            compra.itens.forEach((item, itemIndex) => {
              expect(Object.isFrozen(item)).toBe(true);

              // Attempt to mutate nested item should throw
              expect(() => {
                item.quantidade = 999999;
              }).toThrow();

              // Original nested item should remain unchanged
              const comprasAfter = stateManager.getState('compras');
              expect(comprasAfter[compraIndex].itens[itemIndex]).toEqual(
                compras[compraIndex].itens[itemIndex]
              );
            });
          });
        }
      ),
      { numRuns: 50 }
    );
  });
});
