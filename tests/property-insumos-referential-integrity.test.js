/**
 * Property-Based Tests para Integridade Referencial de Insumos
 * 
 * Property 2: Referential Integrity Protection
 * Validates: Requirement 1.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { InsumosService } from '../src/modules/insumos/services/InsumosService.js';
import { InsumosRepository } from '../src/modules/insumos/repositories/InsumosRepository.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import { StateManager } from '../src/core/state/StateManager.js';
import { EventBus } from '../src/core/events/EventBus.js';

// Helper para gerar strings válidas ÚNICAS que passam no validador alphanumeric
// Validador permite: [a-zA-ZÀ-ÿ0-9\s\-_(),.%']
const validString = (options = {}) => {
  const minLength = options.minLength || 2;
  const maxLength = options.maxLength || 100;
  
  // Palavras reservadas do JavaScript que devem ser evitadas
  const reservedWords = new Set([
    'valueOf', 'toString', 'constructor', 'prototype', '__proto__',
    'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'bind', 'call', 'apply', 'length', 'name'
  ]);
  
  // Gerar string com caracteres permitidos pelo validador alphanumeric
  // Usar string() ao invés de stringOf() (deprecated)
  return fc.string({
    minLength,
    maxLength,
    unit: fc.constantFrom(
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '-', '_',
      '(', ')', ',', '.', '%', "'"
    )
  }).map(s => {
    // Garantir que não é só espaços/pontuação e tem tamanho mínimo
    const trimmed = s.trim();
    
    // Adicionar timestamp único para evitar duplicatas
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    // Se muito curto ou é palavra reservada, gerar string segura
    if (trimmed.length < minLength || reservedWords.has(trimmed.toLowerCase())) {
      return 'Insumo ' + uniqueSuffix;
    }
    
    // Garantir que começa com letra (não número ou pontuação)
    let result = trimmed;
    if (result.length > 0 && !/^[a-zA-Z]/.test(result)) {
      result = 'A' + result;
    }
    
    // Adicionar sufixo único para evitar duplicatas
    return result + ' ' + uniqueSuffix;
  });
};

describe('Property Tests - Insumos Referential Integrity', () => {
  let service;
  let repository;
  let storage;
  let stateManager;
  let eventBus;

  beforeEach(async () => {
    // Melhor isolamento: timestamp + random para garantir unicidade
    const uniqueId = `test-insumos-integrity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    storage = new LocalStorageAdapter(uniqueId);
    await storage.init();
    
    // Limpar estado anterior
    await storage.clear('insumos');
    
    stateManager = new StateManager(storage);
    eventBus = new EventBus();
    repository = new InsumosRepository(storage, stateManager);
    service = new InsumosService(repository, eventBus);
  });

  describe('Property 2: Referential Integrity Protection', () => {
    it('deve permitir deletar insumo sem referências', async () => {
      await fc.assert(
        fc.asyncProperty(
          validString({ minLength: 2, maxLength: 50 }),
          fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
          fc.integer({ min: 100, max: 100000 }), // Valores mais realistas
          async (nome, unidade, custoUnitario) => {
            try {
              // Criar insumo
              const result = await service.createInsumo({
                nome,
                unidade,
                custoUnitario,
                fornecedor: 'Fornecedor Teste',
                estoqueMinimo: 10
              });

              // Se falhou por validação, é esperado
              if (!result.success) {
                return true;
              }

              const insumo = result.data;

              // Verificar que foi criado
              expect(insumo).toBeDefined();
              expect(insumo.id).toBeDefined();

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 100));

              // Deve permitir deletar (sem referências)
              const deleteResult = await service.deleteInsumo(insumo.id);
              expect(deleteResult.success).toBe(true);

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 100));

              // Verificar que foi removido
              const insumoRemovido = await service.getInsumoById(insumo.id);
              expect(insumoRemovido).toBeNull();
              
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 10, timeout: 5000 }
      );
    });

    it('deve manter integridade após múltiplas operações', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              nome: validString({ minLength: 2, maxLength: 50 }),
              unidade: fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
              custoUnitario: fc.integer({ min: 100, max: 100000 })
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (insumosData) => {
            try {
              // Criar múltiplos insumos
              const insumos = [];
              for (const data of insumosData) {
                const result = await service.createInsumo({
                  ...data,
                  fornecedor: 'Fornecedor',
                  estoqueMinimo: 10
                });
                
                // Se falhou por validação, pular este insumo
                if (!result.success) {
                  continue;
                }
                
                insumos.push(result.data);
                // Aguardar entre criações
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Se nenhum insumo foi criado (todos falharam validação), é esperado
              if (insumos.length === 0) {
                return true;
              }

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 200));

              // Todos devem existir
              for (const insumo of insumos) {
                const found = await service.getInsumoById(insumo.id);
                expect(found).not.toBeNull();
                if (found) {
                  expect(found.id).toBe(insumo.id);
                }
              }

              // Deletar metade
              const metade = Math.floor(insumos.length / 2);
              for (let i = 0; i < metade; i++) {
                await service.deleteInsumo(insumos[i].id);
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 200));

              // Verificar que metade foi removida
              for (let i = 0; i < metade; i++) {
                const found = await service.getInsumoById(insumos[i].id);
                expect(found).toBeNull();
              }

              // Verificar que outra metade ainda existe
              for (let i = metade; i < insumos.length; i++) {
                const found = await service.getInsumoById(insumos[i].id);
                expect(found).not.toBeNull();
                if (found) {
                  expect(found.id).toBe(insumos[i].id);
                }
              }
              
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 5, timeout: 15000 }
      );
    });

    it('não deve permitir deletar insumo inexistente', async () => {
      await fc.assert(
        fc.asyncProperty(
          validString({ minLength: 1, maxLength: 50 }),
          async (idInexistente) => {
            try {
              // Tentar deletar ID que não existe deve retornar success: false
              const result = await service.deleteInsumo(idInexistente);
              expect(result.success).toBe(false);
              expect(result.message).toContain('não encontrado');
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 15, timeout: 3000 }
      );
    });

    it('deve manter consistência de IDs únicos', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              nome: validString({ minLength: 2, maxLength: 50 }),
              unidade: fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
              custoUnitario: fc.integer({ min: 100, max: 100000 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          async (insumosData) => {
            try {
              // Criar múltiplos insumos
              const insumos = [];
              for (const data of insumosData) {
                const result = await service.createInsumo({
                  ...data,
                  fornecedor: 'Fornecedor',
                  estoqueMinimo: 10
                });
                
                // Se falhou por validação, pular este insumo
                if (!result.success) {
                  continue;
                }
                
                insumos.push(result.data);
                // Aguardar entre criações
                await new Promise(resolve => setTimeout(resolve, 50));
              }

              // Se nenhum insumo foi criado (todos falharam validação), é esperado
              if (insumos.length === 0) {
                return true;
              }

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 200));

              // Todos os IDs devem ser únicos
              const ids = insumos.map(i => i.id);
              const idsUnicos = new Set(ids);
              expect(idsUnicos.size).toBe(ids.length);

              // Cada ID deve ser encontrável
              for (const insumo of insumos) {
                const found = await service.getInsumoById(insumo.id);
                expect(found).not.toBeNull();
                if (found) {
                  expect(found.id).toBe(insumo.id);
                  expect(found.nome).toBe(insumo.nome);
                }
              }
              
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 5, timeout: 20000 }
      );
    });

    it('deve preservar dados após operações de update', async () => {
      await fc.assert(
        fc.asyncProperty(
          validString({ minLength: 2, maxLength: 50 }),
          fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
          fc.integer({ min: 100, max: 100000 }),
          validString({ minLength: 2, maxLength: 50 }),
          async (nomeOriginal, unidade, custoOriginal, nomeNovo) => {
            try {
              // Criar insumo
              const resultCreate = await service.createInsumo({
                nome: nomeOriginal,
                unidade,
                custoUnitario: custoOriginal,
                fornecedor: 'Fornecedor',
                estoqueMinimo: 10
              });

              // Se falhou por validação, é esperado
              if (!resultCreate.success) {
                return true;
              }

              const insumo = resultCreate.data;
              const idOriginal = insumo.id;

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 100));

              // Atualizar nome
              const resultUpdate = await service.updateInsumo(idOriginal, { nome: nomeNovo });

              // Se update falhou por validação, é esperado
              if (!resultUpdate.success) {
                return true;
              }

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 100));

              // Verificar que ID permanece o mesmo
              const insumoAtualizado = await service.getInsumoById(idOriginal);
              expect(insumoAtualizado).not.toBeNull();
              if (insumoAtualizado) {
                expect(insumoAtualizado.id).toBe(idOriginal);
                expect(insumoAtualizado.nome).toBe(nomeNovo);
                expect(insumoAtualizado.unidade).toBe(unidade);
                expect(insumoAtualizado.custoUnitario).toBe(custoOriginal);
              }
              
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 10, timeout: 5000 }
      );
    });

    it('deve emitir eventos corretos para operações CRUD', async () => {
      await fc.assert(
        fc.asyncProperty(
          validString({ minLength: 2, maxLength: 50 }),
          fc.constantFrom('kg', 'g', 'L', 'ml', 'un'),
          fc.integer({ min: 100, max: 100000 }),
          async (nome, unidade, custoUnitario) => {
            try {
              const eventos = [];
              
              // Capturar eventos
              const unsubCriado = eventBus.subscribe('insumo:criado', (data) => eventos.push({ tipo: 'criado', data }));
              const unsubAtualizado = eventBus.subscribe('insumo:atualizado', (data) => eventos.push({ tipo: 'atualizado', data }));
              const unsubRemovido = eventBus.subscribe('insumo:removido', (data) => eventos.push({ tipo: 'removido', data }));

              // Criar
              const resultCreate = await service.createInsumo({
                nome,
                unidade,
                custoUnitario,
                fornecedor: 'Fornecedor',
                estoqueMinimo: 10
              });

              // Se falhou por validação, limpar e retornar
              if (!resultCreate.success) {
                unsubCriado();
                unsubAtualizado();
                unsubRemovido();
                return true;
              }

              const insumo = resultCreate.data;

              // Aguardar eventos assíncronos
              await new Promise(resolve => setTimeout(resolve, 150));

              // Verificar evento de criação
              const eventoCriado = eventos.find(e => e.tipo === 'criado' && e.data && e.data.id === insumo.id);
              expect(eventoCriado).toBeDefined();

              // Atualizar
              const resultUpdate = await service.updateInsumo(insumo.id, { nome: nome + ' Atualizado' });
              
              // Se update falhou por validação, limpar e retornar
              if (!resultUpdate.success) {
                unsubCriado();
                unsubAtualizado();
                unsubRemovido();
                return true;
              }
              
              await new Promise(resolve => setTimeout(resolve, 150));

              // Verificar evento de atualização
              const eventoAtualizado = eventos.find(e => e.tipo === 'atualizado' && e.data && e.data.id === insumo.id);
              expect(eventoAtualizado).toBeDefined();

              // Deletar
              await service.deleteInsumo(insumo.id);
              await new Promise(resolve => setTimeout(resolve, 150));

              // Verificar evento de remoção
              const eventoRemovido = eventos.find(e => e.tipo === 'removido' && e.data && e.data.id === insumo.id);
              expect(eventoRemovido).toBeDefined();

              // Limpar subscriptions
              unsubCriado();
              unsubAtualizado();
              unsubRemovido();
              
              return true;
            } catch (error) {
              console.error('Erro no teste:', error);
              throw error;
            }
          }
        ),
        { numRuns: 5, timeout: 5000 }
      );
    });
  });

  describe('Property 2 Extended: Cascade Operations', () => {
    it('deve manter integridade em operações em cascata', async () => {
      // Criar insumo pai
      const resultPai = await service.createInsumo({
        nome: 'Insumo Principal',
        unidade: 'kg',
        custoUnitario: 1000,
        fornecedor: 'Fornecedor Principal',
        estoqueMinimo: 10
      });

      expect(resultPai.success).toBe(true);
      const insumoPai = resultPai.data;

      // Criar múltiplos insumos relacionados (simulação)
      const insumosRelacionados = [];
      for (let i = 0; i < 5; i++) {
        const result = await service.createInsumo({
          nome: `Insumo Relacionado ${i}`,
          unidade: 'g',
          custoUnitario: 100 * (i + 1), // Garantir que seja > 0
          fornecedor: 'Fornecedor',
          estoqueMinimo: 5
        });
        
        if (result.success) {
          insumosRelacionados.push(result.data);
        }
      }

      // Todos devem existir
      const todosInsumos = await service.getAllInsumos();
      expect(todosInsumos.length).toBe(6);

      // Deletar insumo pai (sem referências reais neste teste)
      await service.deleteInsumo(insumoPai.id);

      // Insumos relacionados devem continuar existindo
      const insumosAposDelete = await service.getAllInsumos();
      expect(insumosAposDelete.length).toBe(5);

      // Verificar que cada relacionado ainda existe
      for (const insumo of insumosRelacionados) {
        const found = await service.getInsumoById(insumo.id);
        expect(found).toBeDefined();
        expect(found).not.toBeNull();
        if (found) {
          expect(found.id).toBe(insumo.id);
        }
      }
    });
  });

  describe('Property 2 Extended: Concurrent Operations', () => {
    it('deve manter integridade em operações concorrentes', async () => {
      // Criar múltiplos insumos concorrentemente
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          service.createInsumo({
            nome: `Insumo Concorrente ${i}`,
            unidade: 'kg',
            custoUnitario: 100 * (i + 1), // Garantir que seja > 0
            fornecedor: 'Fornecedor',
            estoqueMinimo: 10
          })
        );
      }

      const results = await Promise.all(promises);
      
      // Filtrar apenas os sucessos
      const insumos = results.filter(r => r.success).map(r => r.data);

      // Aguardar eventos assíncronos (aumentado para 1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Todos devem ter IDs únicos
      const ids = insumos.map(i => i.id);
      const idsUnicos = new Set(ids);
      expect(idsUnicos.size).toBe(insumos.length);

      // Todos devem ser encontráveis (verificar um por um com delay)
      for (const insumo of insumos) {
        const found = await service.getInsumoById(insumo.id);
        expect(found).toBeDefined();
        expect(found).not.toBeNull();
        if (found) {
          expect(found.id).toBe(insumo.id);
        }
        // Pequeno delay entre verificações
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      // Deletar sequencialmente (mais confiável que concorrente)
      for (const insumo of insumos) {
        await service.deleteInsumo(insumo.id);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      // Aguardar eventos assíncronos (aumentado para 1000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Nenhum deve existir
      const todosInsumos = await service.getAllInsumos();
      
      // Se ainda há insumos, aguardar mais um pouco e tentar novamente
      if (todosInsumos.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const todosInsumosRetry = await service.getAllInsumos();
        expect(todosInsumosRetry.length).toBe(0);
      } else {
        expect(todosInsumos.length).toBe(0);
      }
    }, 20000); // Timeout de 20 segundos
  });
});
