/**
 * Property-Based Test: Data Persistence Round-Trip (Insumos)
 * 
 * Property 3: Data Persistence Round-Trip
 * 
 * For any insumo created or modified in the system, persisting it to storage 
 * and then retrieving it should produce an equivalent insumo with all fields preserved.
 * 
 * Validates: Requirements 1.10
 * Tarefa: 9.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';
import { InsumosRepository } from '../src/modules/insumos/repositories/InsumosRepository.js';
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
    return item;
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

// Generator para strings válidas que passam no validador alphanumeric
// Validador permite: [a-zA-ZÀ-ÿ0-9\s\-_(),.%']
const validStringArbitrary = (options = {}) => {
  const minLength = options.minLength || 0;
  const maxLength = options.maxLength || 100;
  
  // Palavras reservadas do JavaScript que devem ser evitadas
  const reservedWords = new Set([
    'valueOf', 'toString', 'constructor', 'prototype', '__proto__',
    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'bind', 'call', 'apply', 'length', 'name'
  ]);
  
  // Gerar string com caracteres permitidos pelo validador alphanumeric
  return fc.stringOf(
    fc.constantFrom(
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-', '_',
      '(', ')', ',', '.', '%', "'"
    ),
    { minLength: Math.max(minLength, 1), maxLength }
  ).map(s => {
    // Garantir que não é só espaços/pontuação e tem tamanho mínimo
    const trimmed = s.trim();
    
    // Se muito curto ou é palavra reservada, gerar string segura
    if (minLength > 0 && (trimmed.length < minLength || reservedWords.has(trimmed.toLowerCase()))) {
      return 'Insumo ' + Math.random().toString(36).substring(2, minLength + 5);
    }
    
    // Se vazio, retornar string mínima
    if (trimmed.length === 0) {
      return minLength > 0 ? 'A'.repeat(minLength) : 'A';
    }
    
    // Garantir que começa com letra (não número ou pontuação)
    if (!/^[a-zA-Z]/.test(trimmed)) {
      return 'A' + trimmed;
    }
    
    return trimmed;
  });
};

// Generator para insumos válidos
const insumoArbitrary = fc.record({
  id: fc.uuid(),
  nome: validStringArbitrary({ minLength: 2, maxLength: 100 }),
  unidade: fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
  custoUnitario: fc.integer({ min: 1, max: 1000000 }),
  fornecedor: validStringArbitrary({ minLength: 0, maxLength: 100 }),
  estoqueMinimo: fc.integer({ min: 0, max: 10000 }),
  observacoes: validStringArbitrary({ maxLength: 500 }),
  criadoEm: fc.date().map(d => d.toISOString()),
  atualizadoEm: fc.date().map(d => d.toISOString())
});

describe('Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip (Insumos)', () => {
  
  it('should preserve all insumo fields after save and retrieve', async () => {
    await fc.assert(
      fc.asyncProperty(
        insumoArbitrary,
        async (insumoData) => {
          // Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip
          
          const storage = new MockStorage();
          const stateManager = new StateManager(storage, createInitialState());
          stateManager.setLogging(false);
          
          const repository = new InsumosRepository(storage, stateManager);
          
          // Create insumo
          const insumo = new Insumo(insumoData);
          
          // Save to repository
          const saved = await repository.save(insumo);
          
          // Retrieve from repository
          const retrieved = await repository.getById(saved.id);
          
          // Verify all fields are preserved
          expect(retrieved).not.toBeNull();
          expect(retrieved.id).toBe(insumo.id);
          expect(retrieved.nome).toBe(insumo.nome);
          expect(retrieved.unidade).toBe(insumo.unidade);
          expect(retrieved.custoUnitario).toBe(insumo.custoUnitario);
          expect(retrieved.fornecedor).toBe(insumo.fornecedor);
          expect(retrieved.estoqueMinimo).toBe(insumo.estoqueMinimo);
          expect(retrieved.observacoes).toBe(insumo.observacoes);
          expect(retrieved.criadoEm).toBe(insumo.criadoEm);
          expect(retrieved.atualizadoEm).toBe(insumo.atualizadoEm);
          
          // Verify toJSON produces equivalent object
          expect(retrieved.toJSON()).toEqual(insumo.toJSON());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve insumo after update operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        insumoArbitrary,
        fc.record({
          nome: validStringArbitrary({ minLength: 2, maxLength: 100 }),
          custoUnitario: fc.integer({ min: 1, max: 1000000 }),
          estoqueMinimo: fc.integer({ min: 0, max: 10000 })
        }),
        async (originalData, updates) => {
          // Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip
          
          const storage = new MockStorage();
          const stateManager = new StateManager(storage, createInitialState());
          stateManager.setLogging(false);
          
          const repository = new InsumosRepository(storage, stateManager);
          
          // Create and save original insumo
          const original = new Insumo(originalData);
          await repository.save(original);
          
          // Update insumo
          const updated = await repository.update(original.id, updates);
          
          // Retrieve from repository
          const retrieved = await repository.getById(original.id);
          
          // Verify updated fields are preserved
          expect(retrieved).not.toBeNull();
          expect(retrieved.id).toBe(original.id);
          expect(retrieved.nome).toBe(updates.nome);
          expect(retrieved.custoUnitario).toBe(updates.custoUnitario);
          expect(retrieved.estoqueMinimo).toBe(updates.estoqueMinimo);
          
          // Verify atualizadoEm was updated
          expect(retrieved.atualizadoEm).not.toBe(original.atualizadoEm);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve multiple insumos in getAll operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(insumoArbitrary, { minLength: 1, maxLength: 20 }),
        async (insumosData) => {
          // Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip
          
          const storage = new MockStorage();
          const stateManager = new StateManager(storage, createInitialState());
          stateManager.setLogging(false);
          
          const repository = new InsumosRepository(storage, stateManager);
          
          // Save all insumos
          const savedInsumos = [];
          for (const data of insumosData) {
            const insumo = new Insumo(data);
            const saved = await repository.save(insumo);
            savedInsumos.push(saved);
          }
          
          // Retrieve all insumos
          const retrieved = await repository.getAll();
          
          // Verify count matches
          expect(retrieved).toHaveLength(savedInsumos.length);
          
          // Verify each insumo is preserved
          for (const original of savedInsumos) {
            const found = retrieved.find(i => i.id === original.id);
            expect(found).toBeDefined();
            expect(found.toJSON()).toEqual(original.toJSON());
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle delete operation correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        insumoArbitrary,
        async (insumoData) => {
          // Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip
          
          const storage = new MockStorage();
          const stateManager = new StateManager(storage, createInitialState());
          stateManager.setLogging(false);
          
          const repository = new InsumosRepository(storage, stateManager);
          
          // Create and save insumo
          const insumo = new Insumo(insumoData);
          await repository.save(insumo);
          
          // Verify it exists
          const beforeDelete = await repository.getById(insumo.id);
          expect(beforeDelete).not.toBeNull();
          
          // Delete insumo
          await repository.delete(insumo.id);
          
          // Verify it no longer exists
          const afterDelete = await repository.getById(insumo.id);
          expect(afterDelete).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve insumos with filter operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(insumoArbitrary, { minLength: 5, maxLength: 15 }),
        async (insumosData) => {
          // Feature: sistema-oba-v2-modular, Property 3: Data Persistence Round-Trip
          
          const storage = new MockStorage();
          const stateManager = new StateManager(storage, createInitialState());
          stateManager.setLogging(false);
          
          const repository = new InsumosRepository(storage, stateManager);
          
          // Save all insumos
          for (const data of insumosData) {
            const insumo = new Insumo(data);
            await repository.save(insumo);
          }
          
          // Pick a random insumo to filter by
          const targetInsumo = insumosData[0];
          
          // Filter by unidade
          const filtered = await repository.findByFilters({
            unidade: targetInsumo.unidade
          });
          
          // Verify all filtered insumos have correct unidade
          for (const insumo of filtered) {
            expect(insumo.unidade).toBe(targetInsumo.unidade);
          }
          
          // Verify filtered insumos are complete
          for (const insumo of filtered) {
            const original = insumosData.find(d => d.id === insumo.id);
            if (original) {
              expect(insumo.toJSON()).toEqual(new Insumo(original).toJSON());
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
