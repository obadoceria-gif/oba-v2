/**
 * Testes para FichasTecnicasRepository
 * 
 * Valida:
 * - CRUD completo (save, getById, getAll, update, delete)
 * - Integração com Storage Layer
 * - Atualização de State após operações
 * - Validação de dados
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FichasTecnicasRepository } from '../src/modules/fichas-tecnicas/repositories/FichasTecnicasRepository.js';
import { FichaTecnica } from '../src/modules/fichas-tecnicas/models/FichaTecnica.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import { StateManager } from '../src/core/state/StateManager.js';

describe('FichasTecnicasRepository', () => {
  let repository;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Criar instâncias frescas para cada teste
    storage = new LocalStorageAdapter();
    stateManager = new StateManager(storage);
    repository = new FichasTecnicasRepository(storage, stateManager);

    // Limpar storage
    await storage.clear('fichas');
  });

  describe('save', () => {
    it('deve salvar uma nova ficha técnica', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Bolo de Chocolate',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 1.5 },
          { insumoId: 'insumo-2', quantidade: 0.5 }
        ],
        rendimento: 10,
        unidadeRendimento: 'fatias',
        modoPreparo: 'Misture tudo e asse'
      });

      const saved = await repository.save(ficha);

      expect(saved).toBeInstanceOf(FichaTecnica);
      expect(saved.id).toBe('ficha-1');
      expect(saved.nome).toBe('Bolo de Chocolate');
    });

    it('deve atualizar state após salvar', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha);

      const state = stateManager.getState('fichas');
      expect(state).toHaveLength(1);
      expect(state[0].nome).toBe('Brigadeiro');
    });

    it('deve rejeitar ficha técnica inválida', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        // nome faltando (obrigatório)
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 10,
        unidadeRendimento: 'unidades'
      });

      await expect(repository.save(ficha)).rejects.toThrow('inválida');
    });

    it('deve rejeitar objeto que não é FichaTecnica', async () => {
      const notFicha = {
        id: 'ficha-1',
        nome: 'Teste'
      };

      await expect(repository.save(notFicha)).rejects.toThrow('instância de FichaTecnica');
    });
  });

  describe('getById', () => {
    it('deve buscar ficha técnica por ID', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Bolo de Cenoura',
        insumos: [{ insumoId: 'insumo-1', quantidade: 2 }],
        rendimento: 12,
        unidadeRendimento: 'fatias'
      });

      await repository.save(ficha);
      const found = await repository.getById('ficha-1');

      expect(found).toBeInstanceOf(FichaTecnica);
      expect(found.id).toBe('ficha-1');
      expect(found.nome).toBe('Bolo de Cenoura');
    });

    it('deve retornar null se ficha não existe', async () => {
      const found = await repository.getById('nao-existe');
      expect(found).toBeNull();
    });
  });

  describe('getAll', () => {
    it('deve retornar lista vazia se não há fichas', async () => {
      const all = await repository.getAll();
      expect(all).toEqual([]);
    });

    it('deve retornar todas as fichas técnicas', async () => {
      const ficha1 = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const ficha2 = new FichaTecnica({
        id: 'ficha-2',
        nome: 'Beijinho',
        insumos: [{ insumoId: 'insumo-2', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha1);
      await repository.save(ficha2);

      const all = await repository.getAll();
      expect(all).toHaveLength(2);
      expect(all[0]).toBeInstanceOf(FichaTecnica);
      expect(all[1]).toBeInstanceOf(FichaTecnica);
    });
  });

  describe('update', () => {
    it('deve atualizar ficha técnica existente', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Bolo Simples',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 10,
        unidadeRendimento: 'fatias'
      });

      await repository.save(ficha);

      const updated = await repository.update('ficha-1', {
        nome: 'Bolo de Chocolate',
        rendimento: 12
      });

      expect(updated.nome).toBe('Bolo de Chocolate');
      expect(updated.rendimento).toBe(12);
      expect(updated.insumos).toHaveLength(1); // Não alterado
    });

    it('deve atualizar state após update', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha);
      await repository.update('ficha-1', { rendimento: 60 });

      const state = stateManager.getState('fichas');
      expect(state[0].rendimento).toBe(60);
    });

    it('deve rejeitar update de ficha inexistente', async () => {
      await expect(
        repository.update('nao-existe', { nome: 'Teste' })
      ).rejects.toThrow('não encontrada');
    });

    it('deve rejeitar update que torna ficha inválida', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha);

      await expect(
        repository.update('ficha-1', { nome: '' }) // Nome vazio é inválido
      ).rejects.toThrow('inválida');
    });
  });

  describe('delete', () => {
    it('deve remover ficha técnica existente', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha);
      const result = await repository.delete('ficha-1');

      expect(result).toBe(true);

      const found = await repository.getById('ficha-1');
      expect(found).toBeNull();
    });

    it('deve atualizar state após delete', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await repository.save(ficha);
      await repository.delete('ficha-1');

      const state = stateManager.getState('fichas');
      expect(state).toHaveLength(0);
    });

    it('deve rejeitar delete de ficha inexistente', async () => {
      await expect(
        repository.delete('nao-existe')
      ).rejects.toThrow('não encontrada');
    });
  });

  describe('Integration', () => {
    it('deve realizar fluxo completo: save -> getById -> update -> delete', async () => {
      // Save
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });
      await repository.save(ficha);

      // GetById
      const found = await repository.getById('ficha-1');
      expect(found.nome).toBe('Brigadeiro');

      // Update
      await repository.update('ficha-1', { rendimento: 60 });
      const updated = await repository.getById('ficha-1');
      expect(updated.rendimento).toBe(60);

      // Delete
      await repository.delete('ficha-1');
      const deleted = await repository.getById('ficha-1');
      expect(deleted).toBeNull();
    });

    it('deve manter consistência entre storage e state', async () => {
      const ficha = new FichaTecnica({
        id: 'ficha-1',
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      // Save
      await repository.save(ficha);
      let state = stateManager.getState('fichas');
      let stored = await repository.getAll();
      expect(state).toHaveLength(stored.length);

      // Update
      await repository.update('ficha-1', { rendimento: 60 });
      state = stateManager.getState('fichas');
      stored = await repository.getAll();
      expect(state[0].rendimento).toBe(stored[0].rendimento);

      // Delete
      await repository.delete('ficha-1');
      state = stateManager.getState('fichas');
      stored = await repository.getAll();
      expect(state).toHaveLength(stored.length);
      expect(state).toHaveLength(0);
    });
  });
});
