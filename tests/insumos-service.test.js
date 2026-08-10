/**
 * Testes para InsumosService
 * 
 * Valida:
 * - Criação de insumos com validação
 * - Atualização de insumos
 * - Remoção de insumos com verificação de referências
 * - Busca de insumos com filtros
 * - Emissão de eventos
 * - Tratamento de erros
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsumosService } from '../src/modules/insumos/services/InsumosService.js';
import { InsumosRepository } from '../src/modules/insumos/repositories/InsumosRepository.js';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import { StateManager } from '../src/core/state/StateManager.js';
import { EventBus } from '../src/core/events/EventBus.js';

describe('InsumosService', () => {
  let service;
  let repository;
  let eventBus;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Criar instâncias frescas
    storage = new LocalStorageAdapter();
    stateManager = new StateManager(storage);
    eventBus = new EventBus();
    repository = new InsumosRepository(storage, stateManager);
    service = new InsumosService(repository, eventBus);

    // Limpar storage
    await storage.clear('insumos');
    
    // Limpar event bus
    eventBus.clear();
  });

  describe('createInsumo', () => {
    it('deve criar insumo com dados válidos', async () => {
      const insumoData = {
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850,
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10
      };

      const result = await service.createInsumo(insumoData);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Insumo);
      expect(result.data.nome).toBe('Farinha de Trigo');
      expect(result.data.id).toBeDefined();
    });

    it('deve gerar ID automaticamente se não fornecido', async () => {
      const insumoData = {
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      };

      const result = await service.createInsumo(insumoData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.id).toMatch(/^insumo-/);
    });

    it('deve rejeitar insumo com nome vazio', async () => {
      const insumoData = {
        nome: '',
        unidade: 'kg',
        custoUnitario: 500
      };

      const result = await service.createInsumo(insumoData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar insumo com unidade inválida', async () => {
      const insumoData = {
        nome: 'Farinha',
        unidade: 'tonelada', // inválido
        custoUnitario: 500
      };

      const result = await service.createInsumo(insumoData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.unidade).toBeDefined();
    });

    it('deve rejeitar insumo com custo negativo', async () => {
      const insumoData = {
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: -100 // negativo
      };

      const result = await service.createInsumo(insumoData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.custoUnitario).toBeDefined();
    });

    it('deve emitir evento insumo:criado', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('insumo:criado', eventSpy);

      const insumoData = {
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      };

      await service.createInsumo(insumoData);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Farinha',
          unidade: 'kg',
          custoUnitario: 850
        }),
        'insumo:criado'
      );
    });
  });

  describe('updateInsumo', () => {
    it('deve atualizar insumo existente', async () => {
      // Criar insumo primeiro
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      const result = await service.updateInsumo(created.data.id, {
        nome: 'Farinha de Trigo Tipo 1',
        custoUnitario: 900
      });

      expect(result.success).toBe(true);
      expect(result.data.nome).toBe('Farinha de Trigo Tipo 1');
      expect(result.data.custoUnitario).toBe(900);
      expect(result.data.unidade).toBe('kg'); // Não alterado
    });

    it('deve rejeitar atualização de insumo inexistente', async () => {
      const result = await service.updateInsumo('nao-existe', {
        nome: 'Teste'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');
    });

    it('deve rejeitar atualização que torna insumo inválido', async () => {
      // Criar insumo primeiro
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      const result = await service.updateInsumo(created.data.id, {
        nome: '' // Nome vazio é inválido
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('deve emitir evento insumo:atualizado', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('insumo:atualizado', eventSpy);

      // Criar insumo primeiro
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await service.updateInsumo(created.data.id, {
        custoUnitario: 900
      });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          custoUnitario: 900
        }),
        'insumo:atualizado'
      );
    });
  });

  describe('deleteInsumo', () => {
    it('deve remover insumo existente', async () => {
      // Criar insumo primeiro
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      const result = await service.deleteInsumo(created.data.id);

      expect(result.success).toBe(true);
      expect(result.message).toContain('removido com sucesso');

      // Verificar que foi removido
      const found = await service.getInsumoById(created.data.id);
      expect(found).toBeNull();
    });

    it('deve rejeitar remoção de insumo inexistente', async () => {
      const result = await service.deleteInsumo('nao-existe');

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');
    });

    it('deve emitir evento insumo:removido', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('insumo:removido', eventSpy);

      // Criar insumo primeiro
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await service.deleteInsumo(created.data.id);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: created.data.id,
          nome: 'Farinha'
        }),
        'insumo:removido'
      );
    });
  });

  describe('getInsumoById', () => {
    it('deve buscar insumo por ID', async () => {
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      const found = await service.getInsumoById(created.data.id);

      expect(found).toBeInstanceOf(Insumo);
      expect(found.id).toBe(created.data.id);
      expect(found.nome).toBe('Farinha');
    });

    it('deve retornar null se insumo não existe', async () => {
      const found = await service.getInsumoById('nao-existe');
      expect(found).toBeNull();
    });
  });

  describe('getAllInsumos', () => {
    it('deve retornar lista vazia se não há insumos', async () => {
      const all = await service.getAllInsumos();
      expect(all).toEqual([]);
    });

    it('deve retornar todos os insumos', async () => {
      await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await service.createInsumo({
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const all = await service.getAllInsumos();
      expect(all).toHaveLength(2);
    });
  });

  describe('getInsumos (com filtros)', () => {
    beforeEach(async () => {
      // Criar alguns insumos para testar filtros
      await service.createInsumo({
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850,
        fornecedor: 'Fornecedor A'
      });

      await service.createInsumo({
        nome: 'Açúcar Refinado',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: 'Fornecedor B'
      });

      await service.createInsumo({
        nome: 'Leite',
        unidade: 'L',
        custoUnitario: 400,
        fornecedor: 'Fornecedor A'
      });
    });

    it('deve retornar todos se não há filtros', async () => {
      const result = await service.getInsumos({});
      expect(result).toHaveLength(3);
    });

    it('deve filtrar por nome', async () => {
      const result = await service.getInsumos({ nome: 'Farinha' });
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Farinha de Trigo');
    });

    it('deve filtrar por unidade', async () => {
      const result = await service.getInsumos({ unidade: 'kg' });
      expect(result).toHaveLength(2);
    });

    it('deve filtrar por fornecedor', async () => {
      const result = await service.getInsumos({ fornecedor: 'Fornecedor A' });
      expect(result).toHaveLength(2);
    });

    it('deve combinar múltiplos filtros', async () => {
      const result = await service.getInsumos({
        unidade: 'kg',
        fornecedor: 'Fornecedor A'
      });
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Farinha de Trigo');
    });
  });

  describe('Integration', () => {
    it('deve realizar fluxo completo: create → update → delete', async () => {
      // Create
      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });
      expect(created.success).toBe(true);

      // Update
      const updated = await service.updateInsumo(created.data.id, {
        custoUnitario: 900
      });
      expect(updated.success).toBe(true);
      expect(updated.data.custoUnitario).toBe(900);

      // Delete
      const deleted = await service.deleteInsumo(created.data.id);
      expect(deleted.success).toBe(true);

      // Verify deleted
      const found = await service.getInsumoById(created.data.id);
      expect(found).toBeNull();
    });

    it('deve emitir eventos em sequência', async () => {
      const events = [];
      
      eventBus.subscribe('insumo:criado', () => events.push('criado'));
      eventBus.subscribe('insumo:atualizado', () => events.push('atualizado'));
      eventBus.subscribe('insumo:removido', () => events.push('removido'));

      const created = await service.createInsumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await service.updateInsumo(created.data.id, { custoUnitario: 900 });
      await service.deleteInsumo(created.data.id);

      expect(events).toEqual(['criado', 'atualizado', 'removido']);
    });
  });
});
