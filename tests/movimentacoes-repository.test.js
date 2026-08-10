/**
 * Testes para MovimentacoesRepository
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MovimentacoesRepository } from '../src/modules/estoque/repositories/MovimentacoesRepository.js';
import { Movimentacao } from '../src/modules/estoque/models/Movimentacao.js';

describe('MovimentacoesRepository', () => {
  let repository;
  let mockStorage;
  let mockStateManager;

  beforeEach(() => {
    // Mock storage
    mockStorage = {
      save: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    // Mock state manager
    mockStateManager = {
      setState: vi.fn()
    };

    repository = new MovimentacoesRepository(mockStorage, mockStateManager);
  });

  describe('Constructor', () => {
    it('deve criar repository com storage e stateManager', () => {
      expect(repository.storage).toBe(mockStorage);
      expect(repository.stateManager).toBe(mockStateManager);
      expect(repository.storeName).toBe('movimentacoes');
    });

    it('deve lançar erro se storage não for fornecido', () => {
      expect(() => new MovimentacoesRepository(null, mockStateManager)).toThrow('Storage é obrigatório');
    });

    it('deve lançar erro se stateManager não for fornecido', () => {
      expect(() => new MovimentacoesRepository(mockStorage, null)).toThrow('StateManager é obrigatório');
    });
  });

  describe('save', () => {
    it('deve salvar movimentação no storage', async () => {
      const movimentacao = new Movimentacao({
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra',
        origemId: 'compra-1'
      });

      await repository.save(movimentacao);

      expect(mockStorage.save).toHaveBeenCalledWith(
        'movimentacoes',
        movimentacao.id,
        movimentacao.toJSON()
      );
    });

    it('deve atualizar state após salvar', async () => {
      const movimentacao = new Movimentacao({
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      mockStorage.getAll.mockResolvedValue([movimentacao.toJSON()]);

      await repository.save(movimentacao);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'movimentacoes',
        expect.arrayContaining([expect.any(Object)])
      );
    });

    it('deve lançar erro se movimentação for inválida', async () => {
      await expect(repository.save({})).rejects.toThrow('Movimentacao inválida');
    });
  });

  describe('getById', () => {
    it('deve retornar movimentação por ID', async () => {
      const movimentacaoData = {
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra',
        criadoEm: new Date().toISOString()
      };

      mockStorage.get.mockResolvedValue(movimentacaoData);

      const movimentacao = await repository.getById('mov-1');

      expect(movimentacao).toBeInstanceOf(Movimentacao);
      expect(movimentacao.id).toBe('mov-1');
      expect(mockStorage.get).toHaveBeenCalledWith('movimentacoes', 'mov-1');
    });

    it('deve retornar null se movimentação não existir', async () => {
      mockStorage.get.mockResolvedValue(null);

      const movimentacao = await repository.getById('mov-inexistente');

      expect(movimentacao).toBeNull();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.getById()).rejects.toThrow('id é obrigatório');
    });
  });

  describe('getByInsumoId', () => {
    it('deve retornar movimentações de um insumo específico', async () => {
      const movimentacoesData = [
        {
          id: 'mov-1',
          insumoId: 'insumo-1',
          tipo: 'entrada',
          quantidade: 10,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: new Date().toISOString()
        },
        {
          id: 'mov-2',
          insumoId: 'insumo-1',
          tipo: 'saida',
          quantidade: 5,
          custoUnitario: 500,
          origem: 'producao',
          criadoEm: new Date().toISOString()
        },
        {
          id: 'mov-3',
          insumoId: 'insumo-2',
          tipo: 'entrada',
          quantidade: 20,
          custoUnitario: 300,
          origem: 'compra',
          criadoEm: new Date().toISOString()
        }
      ];

      mockStorage.getAll.mockResolvedValue(movimentacoesData);

      const movimentacoes = await repository.getByInsumoId('insumo-1');

      expect(movimentacoes).toHaveLength(2);
      expect(movimentacoes[0].insumoId).toBe('insumo-1');
      expect(movimentacoes[1].insumoId).toBe('insumo-1');
    });

    it('deve retornar array vazio se não houver movimentações do insumo', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      const movimentacoes = await repository.getByInsumoId('insumo-1');

      expect(movimentacoes).toEqual([]);
    });

    it('deve lançar erro se insumoId não for fornecido', async () => {
      await expect(repository.getByInsumoId()).rejects.toThrow('insumoId é obrigatório');
    });
  });

  describe('getAll', () => {
    it('deve retornar todas as movimentações', async () => {
      const movimentacoesData = [
        {
          id: 'mov-1',
          insumoId: 'insumo-1',
          tipo: 'entrada',
          quantidade: 10,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: new Date().toISOString()
        },
        {
          id: 'mov-2',
          insumoId: 'insumo-2',
          tipo: 'saida',
          quantidade: 5,
          custoUnitario: 300,
          origem: 'producao',
          criadoEm: new Date().toISOString()
        }
      ];

      mockStorage.getAll.mockResolvedValue(movimentacoesData);

      const movimentacoes = await repository.getAll();

      expect(movimentacoes).toHaveLength(2);
      expect(movimentacoes[0]).toBeInstanceOf(Movimentacao);
      expect(movimentacoes[1]).toBeInstanceOf(Movimentacao);
    });

    it('deve retornar array vazio se não houver movimentações', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      const movimentacoes = await repository.getAll();

      expect(movimentacoes).toEqual([]);
    });
  });

  describe('findByFilters', () => {
    beforeEach(() => {
      const movimentacoesData = [
        {
          id: 'mov-1',
          insumoId: 'insumo-1',
          tipo: 'entrada',
          quantidade: 10,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: new Date().toISOString()
        },
        {
          id: 'mov-2',
          insumoId: 'insumo-1',
          tipo: 'saida',
          quantidade: 5,
          custoUnitario: 500,
          origem: 'producao',
          criadoEm: new Date().toISOString()
        },
        {
          id: 'mov-3',
          insumoId: 'insumo-2',
          tipo: 'entrada',
          quantidade: 20,
          custoUnitario: 300,
          origem: 'compra',
          criadoEm: new Date().toISOString()
        }
      ];

      mockStorage.getAll.mockResolvedValue(movimentacoesData);
    });

    it('deve filtrar por insumoId', async () => {
      const movimentacoes = await repository.findByFilters({ insumoId: 'insumo-1' });

      expect(movimentacoes).toHaveLength(2);
      expect(movimentacoes.every(m => m.insumoId === 'insumo-1')).toBe(true);
    });

    it('deve filtrar por tipo', async () => {
      const movimentacoes = await repository.findByFilters({ tipo: 'entrada' });

      expect(movimentacoes).toHaveLength(2);
      expect(movimentacoes.every(m => m.tipo === 'entrada')).toBe(true);
    });

    it('deve filtrar por origem', async () => {
      const movimentacoes = await repository.findByFilters({ origem: 'compra' });

      expect(movimentacoes).toHaveLength(2);
      expect(movimentacoes.every(m => m.origem === 'compra')).toBe(true);
    });

    it('deve combinar múltiplos filtros', async () => {
      const movimentacoes = await repository.findByFilters({
        insumoId: 'insumo-1',
        tipo: 'entrada'
      });

      expect(movimentacoes).toHaveLength(1);
      expect(movimentacoes[0].insumoId).toBe('insumo-1');
      expect(movimentacoes[0].tipo).toBe('entrada');
    });

    it('deve retornar todas se não houver filtros', async () => {
      const movimentacoes = await repository.findByFilters({});

      expect(movimentacoes).toHaveLength(3);
    });
  });

  describe('delete', () => {
    it('deve remover movimentação', async () => {
      await repository.delete('mov-1');

      expect(mockStorage.delete).toHaveBeenCalledWith('movimentacoes', 'mov-1');
    });

    it('deve atualizar state após delete', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      await repository.delete('mov-1');

      expect(mockStateManager.setState).toHaveBeenCalled();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.delete()).rejects.toThrow('id é obrigatório');
    });
  });

  describe('Integration', () => {
    it('deve salvar e buscar movimentações', async () => {
      const movimentacao = new Movimentacao({
        id: 'mov-1', // Adicionar ID explícito
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      // Salvar
      mockStorage.getAll.mockResolvedValue([movimentacao.toJSON()]);
      await repository.save(movimentacao);

      // Buscar por ID
      mockStorage.get.mockResolvedValue(movimentacao.toJSON());
      const encontrada = await repository.getById(movimentacao.id);
      expect(encontrada.quantidade).toBe(10);

      // Buscar por insumo
      const porInsumo = await repository.getByInsumoId('insumo-1');
      expect(porInsumo).toHaveLength(1);
    });
  });
});
