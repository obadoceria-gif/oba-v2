/**
 * Testes para InsumosRepository
 * 
 * Valida:
 * - CRUD completo (save, getById, getAll, update, delete)
 * - Integração com Storage Layer
 * - Atualização de State após operações
 * - Validação de dados
 * - Filtros de busca
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InsumosRepository } from '../src/modules/insumos/repositories/InsumosRepository.js';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import { StateManager } from '../src/core/state/StateManager.js';

describe('InsumosRepository', () => {
  let repository;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Criar instâncias frescas para cada teste
    storage = new LocalStorageAdapter();
    stateManager = new StateManager(storage);
    repository = new InsumosRepository(storage, stateManager);

    // Limpar storage
    await storage.clear('insumos');
  });

  describe('save', () => {
    it('deve salvar um novo insumo', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850
      });

      const saved = await repository.save(insumo);

      expect(saved).toBeInstanceOf(Insumo);
      expect(saved.id).toBe('insumo-1');
      expect(saved.nome).toBe('Farinha de Trigo');
    });

    it('deve atualizar state após salvar', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      await repository.save(insumo);

      const state = stateManager.getState('insumos');
      expect(state).toHaveLength(1);
      expect(state[0].nome).toBe('Açúcar');
    });

    it('deve rejeitar insumo inválido', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        // nome faltando (obrigatório)
        unidade: 'kg',
        custoUnitario: 500
      });

      await expect(repository.save(insumo)).rejects.toThrow('Validação falhou');
    });

    it('deve rejeitar objeto que não é Insumo', async () => {
      const notInsumo = {
        id: 'insumo-1',
        nome: 'Teste'
      };

      await expect(repository.save(notInsumo)).rejects.toThrow('instância de Insumo');
    });
  });

  describe('getById', () => {
    it('deve buscar insumo por ID', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850
      });

      await repository.save(insumo);
      const found = await repository.getById('insumo-1');

      expect(found).toBeInstanceOf(Insumo);
      expect(found.id).toBe('insumo-1');
      expect(found.nome).toBe('Farinha de Trigo');
    });

    it('deve retornar null se insumo não existe', async () => {
      const found = await repository.getById('nao-existe');
      expect(found).toBeNull();
    });
  });

  describe('getAll', () => {
    it('deve retornar lista vazia se não há insumos', async () => {
      const all = await repository.getAll();
      expect(all).toEqual([]);
    });

    it('deve retornar todos os insumos', async () => {
      const insumo1 = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      const insumo2 = new Insumo({
        id: 'insumo-2',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      await repository.save(insumo1);
      await repository.save(insumo2);

      const all = await repository.getAll();
      expect(all).toHaveLength(2);
      expect(all[0]).toBeInstanceOf(Insumo);
      expect(all[1]).toBeInstanceOf(Insumo);
    });
  });

  describe('update', () => {
    it('deve atualizar insumo existente', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await repository.save(insumo);

      const updated = await repository.update('insumo-1', {
        nome: 'Farinha de Trigo Tipo 1',
        custoUnitario: 900
      });

      expect(updated.nome).toBe('Farinha de Trigo Tipo 1');
      expect(updated.custoUnitario).toBe(900);
      expect(updated.unidade).toBe('kg'); // Não alterado
    });

    it('deve atualizar state após update', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      await repository.save(insumo);
      await repository.update('insumo-1', { custoUnitario: 600 });

      const state = stateManager.getState('insumos');
      expect(state[0].custoUnitario).toBe(600);
    });

    it('deve rejeitar update de insumo inexistente', async () => {
      await expect(
        repository.update('nao-existe', { nome: 'Teste' })
      ).rejects.toThrow('não encontrado');
    });

    it('deve rejeitar update que torna insumo inválido', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await repository.save(insumo);

      await expect(
        repository.update('insumo-1', { nome: '' }) // Nome vazio é inválido
      ).rejects.toThrow('Validação falhou');
    });
  });

  describe('delete', () => {
    it('deve remover insumo existente', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });

      await repository.save(insumo);
      const result = await repository.delete('insumo-1');

      expect(result).toBe(true);

      const found = await repository.getById('insumo-1');
      expect(found).toBeNull();
    });

    it('deve atualizar state após delete', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      await repository.save(insumo);
      await repository.delete('insumo-1');

      const state = stateManager.getState('insumos');
      expect(state).toHaveLength(0);
    });

    it('deve rejeitar delete de insumo inexistente', async () => {
      await expect(
        repository.delete('nao-existe')
      ).rejects.toThrow('não encontrado');
    });
  });

  describe('findByFilters', () => {
    beforeEach(async () => {
      // Criar alguns insumos para testar filtros
      await repository.save(new Insumo({
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850,
        fornecedor: 'Fornecedor A'
      }));

      await repository.save(new Insumo({
        id: 'insumo-2',
        nome: 'Açúcar Refinado',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: 'Fornecedor B'
      }));

      await repository.save(new Insumo({
        id: 'insumo-3',
        nome: 'Leite',
        unidade: 'L',
        custoUnitario: 400,
        fornecedor: 'Fornecedor A'
      }));
    });

    it('deve retornar todos se não há filtros', async () => {
      const result = await repository.findByFilters({});
      expect(result).toHaveLength(3);
    });

    it('deve filtrar por nome (busca parcial)', async () => {
      const result = await repository.findByFilters({ nome: 'Farinha' });
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Farinha de Trigo');
    });

    it('deve filtrar por nome (case-insensitive)', async () => {
      const result = await repository.findByFilters({ nome: 'açúcar' });
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Açúcar Refinado');
    });

    it('deve filtrar por unidade', async () => {
      const result = await repository.findByFilters({ unidade: 'kg' });
      expect(result).toHaveLength(2);
    });

    it('deve filtrar por fornecedor', async () => {
      const result = await repository.findByFilters({ fornecedor: 'Fornecedor A' });
      expect(result).toHaveLength(2);
    });

    it('deve combinar múltiplos filtros', async () => {
      const result = await repository.findByFilters({
        unidade: 'kg',
        fornecedor: 'Fornecedor A'
      });
      expect(result).toHaveLength(1);
      expect(result[0].nome).toBe('Farinha de Trigo');
    });

    it('deve retornar vazio se nenhum insumo corresponde', async () => {
      const result = await repository.findByFilters({ nome: 'Inexistente' });
      expect(result).toHaveLength(0);
    });
  });

  describe('Integration', () => {
    it('deve realizar fluxo completo: save -> getById -> update -> delete', async () => {
      // Save
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 850
      });
      await repository.save(insumo);

      // GetById
      const found = await repository.getById('insumo-1');
      expect(found.nome).toBe('Farinha');

      // Update
      await repository.update('insumo-1', { custoUnitario: 900 });
      const updated = await repository.getById('insumo-1');
      expect(updated.custoUnitario).toBe(900);

      // Delete
      await repository.delete('insumo-1');
      const deleted = await repository.getById('insumo-1');
      expect(deleted).toBeNull();
    });

    it('deve manter consistência entre storage e state', async () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      // Save
      await repository.save(insumo);
      let state = stateManager.getState('insumos');
      let stored = await repository.getAll();
      expect(state).toHaveLength(stored.length);

      // Update
      await repository.update('insumo-1', { custoUnitario: 600 });
      state = stateManager.getState('insumos');
      stored = await repository.getAll();
      expect(state[0].custoUnitario).toBe(stored[0].custoUnitario);

      // Delete
      await repository.delete('insumo-1');
      state = stateManager.getState('insumos');
      stored = await repository.getAll();
      expect(state).toHaveLength(stored.length);
      expect(state).toHaveLength(0);
    });
  });
});
