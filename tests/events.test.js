/**
 * Testes para EventBus
 * 
 * Inclui:
 * - Testes unitários para funcionalidades básicas
 * - Property-based tests para garantir propriedades universais
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../src/core/events/EventBus.js';
import { EVENT_TYPES, COMPRA_RECEBIDA, ESTOQUE_BAIXO } from '../src/core/events/eventTypes.js';
import fc from 'fast-check';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    eventBus.setLogging(false); // Desabilitar logs durante testes
  });

  // ============================================
  // TESTES UNITÁRIOS - FUNCIONALIDADES BÁSICAS
  // ============================================

  describe('subscribe', () => {
    it('deve permitir inscrever um handler para um evento', () => {
      const handler = vi.fn();
      
      eventBus.subscribe('TEST_EVENT', handler);
      
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(1);
    });

    it('deve permitir múltiplos subscribers para o mesmo evento', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);
      eventBus.subscribe('TEST_EVENT', handler3);
      
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(3);
    });

    it('deve retornar função de unsubscribe', () => {
      const handler = vi.fn();
      
      const unsubscribe = eventBus.subscribe('TEST_EVENT', handler);
      
      expect(typeof unsubscribe).toBe('function');
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(1);
      
      unsubscribe();
      
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(0);
    });

    it('deve lançar erro se eventType não for string', () => {
      expect(() => eventBus.subscribe(123, vi.fn())).toThrow('Event type must be a non-empty string');
      expect(() => eventBus.subscribe(null, vi.fn())).toThrow('Event type must be a non-empty string');
      expect(() => eventBus.subscribe('', vi.fn())).toThrow('Event type must be a non-empty string');
    });

    it('deve lançar erro se handler não for função', () => {
      expect(() => eventBus.subscribe('TEST_EVENT', 'not a function')).toThrow('Handler must be a function');
      expect(() => eventBus.subscribe('TEST_EVENT', 123)).toThrow('Handler must be a function');
      expect(() => eventBus.subscribe('TEST_EVENT', null)).toThrow('Handler must be a function');
    });
  });

  describe('unsubscribe', () => {
    it('deve remover handler específico', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);
      
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(2);
      
      const removed = eventBus.unsubscribe('TEST_EVENT', handler1);
      
      expect(removed).toBe(true);
      expect(eventBus.getSubscriberCount('TEST_EVENT')).toBe(1);
    });

    it('deve retornar false se handler não encontrado', () => {
      const handler = vi.fn();
      
      const removed = eventBus.unsubscribe('TEST_EVENT', handler);
      
      expect(removed).toBe(false);
    });

    it('deve limpar evento se não houver mais handlers', () => {
      const handler = vi.fn();
      
      eventBus.subscribe('TEST_EVENT', handler);
      eventBus.unsubscribe('TEST_EVENT', handler);
      
      expect(eventBus.getEventTypes()).not.toContain('TEST_EVENT');
    });
  });

  describe('publish', () => {
    it('deve notificar todos os subscribers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);
      eventBus.subscribe('TEST_EVENT', handler3);
      
      await eventBus.publish('TEST_EVENT', { data: 'test' });
      
      expect(handler1).toHaveBeenCalledWith({ data: 'test' }, 'TEST_EVENT');
      expect(handler2).toHaveBeenCalledWith({ data: 'test' }, 'TEST_EVENT');
      expect(handler3).toHaveBeenCalledWith({ data: 'test' }, 'TEST_EVENT');
    });

    it('deve funcionar sem subscribers (não deve lançar erro)', async () => {
      await expect(eventBus.publish('TEST_EVENT', { data: 'test' })).resolves.toBeUndefined();
    });

    it('deve adicionar evento ao histórico', async () => {
      await eventBus.publish('TEST_EVENT', { data: 'test' });
      
      const history = eventBus.getHistory(1);
      
      expect(history).toHaveLength(1);
      expect(history[0].eventType).toBe('TEST_EVENT');
      expect(history[0].data).toEqual({ data: 'test' });
      expect(history[0].timestamp).toBeDefined();
    });

    it('deve lançar erro se eventType não for string', async () => {
      await expect(eventBus.publish(123, {})).rejects.toThrow('Event type must be a non-empty string');
      await expect(eventBus.publish(null, {})).rejects.toThrow('Event type must be a non-empty string');
      await expect(eventBus.publish('', {})).rejects.toThrow('Event type must be a non-empty string');
    });

    it('deve isolar erros entre handlers (Requirement 11.10)', async () => {
      const handler1 = vi.fn(() => { throw new Error('Handler 1 error'); });
      const handler2 = vi.fn();
      const handler3 = vi.fn(() => { throw new Error('Handler 3 error'); });
      
      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);
      eventBus.subscribe('TEST_EVENT', handler3);
      
      // Não deve lançar erro mesmo com handlers falhando
      await expect(eventBus.publish('TEST_EVENT', { data: 'test' })).resolves.toBeUndefined();
      
      // Handler 2 deve ter sido chamado mesmo com erros nos outros
      expect(handler2).toHaveBeenCalled();
    });

    it('deve suportar handlers assíncronos', async () => {
      const handler1 = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const handler2 = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
      });
      
      eventBus.subscribe('TEST_EVENT', handler1);
      eventBus.subscribe('TEST_EVENT', handler2);
      
      await eventBus.publish('TEST_EVENT', { data: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('deve remover todos os subscribers', () => {
      eventBus.subscribe('EVENT1', vi.fn());
      eventBus.subscribe('EVENT2', vi.fn());
      eventBus.subscribe('EVENT3', vi.fn());
      
      expect(eventBus.getEventTypes()).toHaveLength(3);
      
      eventBus.clear();
      
      expect(eventBus.getEventTypes()).toHaveLength(0);
    });

    it('deve limpar histórico de eventos', async () => {
      await eventBus.publish('TEST_EVENT', { data: 'test' });
      
      expect(eventBus.getHistory()).toHaveLength(1);
      
      eventBus.clear();
      
      expect(eventBus.getHistory()).toHaveLength(0);
    });
  });

  describe('getEventTypes', () => {
    it('deve retornar lista de eventos com subscribers', () => {
      eventBus.subscribe('EVENT1', vi.fn());
      eventBus.subscribe('EVENT2', vi.fn());
      eventBus.subscribe('EVENT3', vi.fn());
      
      const types = eventBus.getEventTypes();
      
      expect(types).toContain('EVENT1');
      expect(types).toContain('EVENT2');
      expect(types).toContain('EVENT3');
      expect(types).toHaveLength(3);
    });

    it('deve retornar array vazio se não houver subscribers', () => {
      expect(eventBus.getEventTypes()).toEqual([]);
    });
  });

  describe('getHistory', () => {
    it('deve retornar últimos N eventos', async () => {
      await eventBus.publish('EVENT1', { data: 1 });
      await eventBus.publish('EVENT2', { data: 2 });
      await eventBus.publish('EVENT3', { data: 3 });
      await eventBus.publish('EVENT4', { data: 4 });
      await eventBus.publish('EVENT5', { data: 5 });
      
      const history = eventBus.getHistory(3);
      
      expect(history).toHaveLength(3);
      expect(history[0].eventType).toBe('EVENT3');
      expect(history[1].eventType).toBe('EVENT4');
      expect(history[2].eventType).toBe('EVENT5');
    });

    it('deve limitar histórico a maxHistorySize', async () => {
      eventBus.maxHistorySize = 5;
      
      for (let i = 0; i < 10; i++) {
        await eventBus.publish('TEST_EVENT', { data: i });
      }
      
      const history = eventBus.getHistory(100);
      
      expect(history).toHaveLength(5);
      expect(history[0].data.data).toBe(5);
      expect(history[4].data.data).toBe(9);
    });
  });

  // ============================================
  // PROPERTY-BASED TESTS
  // ============================================

  describe('Property 24: Event Subscriber Notification', () => {
    it('todos os subscribers devem ser notificados quando evento é publicado', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // eventType
          fc.integer({ min: 1, max: 10 }), // número de subscribers
          fc.anything(), // data
          async (eventType, subscriberCount, data) => {
            const bus = new EventBus();
            bus.setLogging(false);
            
            const handlers = [];
            for (let i = 0; i < subscriberCount; i++) {
              const handler = vi.fn();
              handlers.push(handler);
              bus.subscribe(eventType, handler);
            }
            
            await bus.publish(eventType, data);
            
            // Todos os handlers devem ter sido chamados
            handlers.forEach(handler => {
              expect(handler).toHaveBeenCalledWith(data, eventType);
              expect(handler).toHaveBeenCalledTimes(1);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('subscribers não devem ser notificados de eventos de outros tipos', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // eventType1
          fc.string({ minLength: 1 }), // eventType2
          fc.anything(), // data
          async (eventType1, eventType2, data) => {
            fc.pre(eventType1 !== eventType2); // Garantir que são diferentes
            
            const bus = new EventBus();
            bus.setLogging(false);
            
            const handler1 = vi.fn();
            const handler2 = vi.fn();
            
            bus.subscribe(eventType1, handler1);
            bus.subscribe(eventType2, handler2);
            
            await bus.publish(eventType1, data);
            
            // Apenas handler1 deve ter sido chamado
            expect(handler1).toHaveBeenCalledWith(data, eventType1);
            expect(handler2).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 26: Event Handler Error Isolation', () => {
    it('erro em um handler não deve impedir notificação de outros handlers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // eventType
          fc.integer({ min: 2, max: 5 }), // número de handlers
          fc.integer({ min: 0, max: 4 }), // índice do handler que vai falhar
          fc.anything(), // data
          async (eventType, handlerCount, failingIndex, data) => {
            fc.pre(failingIndex < handlerCount);
            
            const bus = new EventBus();
            bus.setLogging(false);
            
            const handlers = [];
            for (let i = 0; i < handlerCount; i++) {
              const handler = i === failingIndex
                ? vi.fn(() => { throw new Error('Handler error'); })
                : vi.fn();
              handlers.push(handler);
              bus.subscribe(eventType, handler);
            }
            
            // Não deve lançar erro
            await expect(bus.publish(eventType, data)).resolves.toBeUndefined();
            
            // Todos os handlers devem ter sido chamados (incluindo o que falhou)
            handlers.forEach(handler => {
              expect(handler).toHaveBeenCalled();
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('múltiplos erros não devem impedir execução', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // eventType
          fc.integer({ min: 3, max: 6 }), // número de handlers
          fc.anything(), // data
          async (eventType, handlerCount, data) => {
            const bus = new EventBus();
            bus.setLogging(false);
            
            // Todos os handlers vão falhar
            const handlers = [];
            for (let i = 0; i < handlerCount; i++) {
              const handler = vi.fn(() => { throw new Error(`Handler ${i} error`); });
              handlers.push(handler);
              bus.subscribe(eventType, handler);
            }
            
            // Não deve lançar erro mesmo com todos falhando
            await expect(bus.publish(eventType, data)).resolves.toBeUndefined();
            
            // Todos devem ter sido chamados
            handlers.forEach(handler => {
              expect(handler).toHaveBeenCalled();
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property: Subscribe/Unsubscribe Idempotence', () => {
    it('unsubscribe deve ser idempotente', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }), // eventType
          async (eventType) => {
            const bus = new EventBus();
            const handler = vi.fn();
            
            bus.subscribe(eventType, handler);
            
            // Primeira remoção deve retornar true
            expect(bus.unsubscribe(eventType, handler)).toBe(true);
            
            // Segunda remoção deve retornar false (já foi removido)
            expect(bus.unsubscribe(eventType, handler)).toBe(false);
            
            // Terceira remoção também deve retornar false
            expect(bus.unsubscribe(eventType, handler)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property: Event History Integrity', () => {
    it('histórico deve conter todos os eventos publicados (até o limite)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }), // eventTypes
          async (eventTypes) => {
            const bus = new EventBus();
            bus.setLogging(false);
            bus.maxHistorySize = 100;
            
            // Publicar todos os eventos
            for (const eventType of eventTypes) {
              await bus.publish(eventType, { test: true });
            }
            
            const history = bus.getHistory(eventTypes.length);
            
            // Histórico deve ter o mesmo tamanho
            expect(history).toHaveLength(eventTypes.length);
            
            // Eventos devem estar na ordem correta
            history.forEach((entry, index) => {
              expect(entry.eventType).toBe(eventTypes[index]);
              expect(entry.data).toEqual({ test: true });
              expect(entry.timestamp).toBeDefined();
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  // ============================================
  // TESTES DE INTEGRAÇÃO COM EVENT TYPES
  // ============================================

  describe('Integration with eventTypes', () => {
    it('deve funcionar com constantes de EVENT_TYPES', async () => {
      const handler = vi.fn();
      
      eventBus.subscribe(COMPRA_RECEBIDA, handler);
      
      await eventBus.publish(COMPRA_RECEBIDA, {
        compraId: '123',
        fornecedor: 'Fornecedor A',
        itens: []
      });
      
      expect(handler).toHaveBeenCalled();
    });

    it('deve ter todos os tipos de eventos definidos', () => {
      expect(EVENT_TYPES).toBeDefined();
      expect(EVENT_TYPES.COMPRA_RECEBIDA).toBe('COMPRA_RECEBIDA');
      expect(EVENT_TYPES.PRODUCAO_CONFIRMADA).toBe('PRODUCAO_CONFIRMADA');
      expect(EVENT_TYPES.ESTOQUE_BAIXO).toBe('ESTOQUE_BAIXO');
    });
  });
});
