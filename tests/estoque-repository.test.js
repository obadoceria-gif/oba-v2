/**
 * Testes para EstoqueRepository
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EstoqueRepository } from '../src/modules/estoque/repositories/EstoqueRepository.js';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';

describe('EstoqueRepository', () => {
  let repository;
  let mockStorage;
  let mockStateManager;

  beforeEach(() => {
    // Mock storage
    mockStorage = {
      save: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      getAll: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined)
    };

    // Mock state manager
    mockStateManager = {
      setState: vi.fn()
    };

    repository = new EstoqueRepository(mockStorage, mockStateManager);
  });

  describe('Constructor', () => {
    it('deve criar repository com storage e stateManager', () => {
      expect(repository.storage).toBe(mockStorage);
      expect(repository.stateManager).toBe(mockStateManager);
      expect(repository.storeName).toBe('estoque');
    });

    it('deve lançar erro se storage não for fornecido', () => {
      expect(() => new EstoqueRepository(null, mockStateManager)).toThrow('Storage é obrigatório');
    });

    it('deve lançar erro se stateManager não for fornecido', () => {
      expect(() => new EstoqueRepository(mockStorage, null)).toThrow('StateManager é obrigatório');
    });
  });

  describe('save', () => {
    it('deve salvar estoque no storage', async () => {
      const estoque = new Estoque({ insumoId: 'insumo-1', quantidadeAtual: 10, custoMedioPonderado: 500 });

      await repository.save(estoque);

      expect(mockStorage.save).toHaveBeenCalledWith(
        'estoque',
        'insumo-1',
        estoque.toJSON()
      );
    });

    it('deve atualizar state após salvar', async () => {
      const estoque = new Estoque({ insumoId: 'insumo-1', quantidadeAtual: 10, custoMedioPonderado: 500 });
      mockStorage.getAll.mockResolvedValue([estoque.toJSON()]);

      await repository.save(estoque);

      expect(mockStateManager.setState).toHaveBeenCalledWith(
        'estoque',
        expect.objectContaining({
          'insumo-1': expect.any(Object)
        })
      );
    });

    it('deve lançar erro se estoque for inválido', async () => {
      await expect(repository.save({})).rejects.toThrow('Estoque inválido');
    });
  });

  describe('getByInsumoId', () => {
    it('deve retornar estoque por insumoId', async () => {
      const estoqueData = {
        insumoId: 'insumo-1',
        quantidadeAtual: 10,
        custoMedioPonderado: 500,
        atualizadoEm: new Date().toISOString()
      };

      mockStorage.get.mockResolvedValue(estoqueData);

      const estoque = await repository.getByInsumoId('insumo-1');

      expect(estoque).toBeInstanceOf(Estoque);
      expect(estoque.insumoId).toBe('insumo-1');
      expect(estoque.quantidadeAtual).toBe(10);
      expect(mockStorage.get).toHaveBeenCalledWith('estoque', 'insumo-1');
    });

    it('deve retornar null se estoque não existir', async () => {
      mockStorage.get.mockResolvedValue(null);

      const estoque = await repository.getByInsumoId('insumo-inexistente');

      expect(estoque).toBeNull();
    });

    it('deve lançar erro se insumoId não for fornecido', async () => {
      await expect(repository.getByInsumoId()).rejects.toThrow('insumoId é obrigatório');
    });
  });

  describe('getAll', () => {
    it('deve retornar todos os estoques', async () => {
      const estoquesData = [
        {
          insumoId: 'insumo-1',
          quantidadeAtual: 10,
          custoMedioPonderado: 500,
          atualizadoEm: new Date().toISOString()
        },
        {
          insumoId: 'insumo-2',
          quantidadeAtual: 20,
          custoMedioPonderado: 300,
          atualizadoEm: new Date().toISOString()
        }
      ];

      mockStorage.getAll.mockResolvedValue(estoquesData);

      const estoques = await repository.getAll();

      expect(estoques).toHaveLength(2);
      expect(estoques[0]).toBeInstanceOf(Estoque);
      expect(estoques[1]).toBeInstanceOf(Estoque);
      expect(mockStorage.getAll).toHaveBeenCalledWith('estoque');
    });

    it('deve retornar array vazio se não houver estoques', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      const estoques = await repository.getAll();

      expect(estoques).toEqual([]);
    });
  });

  describe('update', () => {
    it('deve atualizar estoque existente', async () => {
      const estoqueExistente = new Estoque('insumo-1', 10, 500);
      const estoqueAtualizado = new Estoque('insumo-1', 15, 550);

      mockStorage.get.mockResolvedValue(estoqueExistente.toJSON());

      await repository.update('insumo-1', estoqueAtualizado);

      expect(mockStorage.update).toHaveBeenCalledWith(
        'estoque',
        'insumo-1',
        estoqueAtualizado.toJSON()
      );
    });

    it('deve atualizar state após update', async () => {
      const estoqueExistente = new Estoque('insumo-1', 10, 500);
      const estoqueAtualizado = new Estoque('insumo-1', 15, 550);

      mockStorage.get.mockResolvedValue(estoqueExistente.toJSON());
      mockStorage.getAll.mockResolvedValue([estoqueAtualizado.toJSON()]);

      await repository.update('insumo-1', estoqueAtualizado);

      expect(mockStateManager.setState).toHaveBeenCalled();
    });

    it('deve lançar erro se estoque não existir', async () => {
      const estoque = new Estoque('insumo-1', 10, 500);
      mockStorage.get.mockResolvedValue(null);

      await expect(repository.update('insumo-1', estoque)).rejects.toThrow(
        'Estoque para insumo insumo-1 não encontrado'
      );
    });

    it('deve lançar erro se insumoId não for fornecido', async () => {
      const estoque = new Estoque('insumo-1', 10, 500);

      await expect(repository.update(null, estoque)).rejects.toThrow('insumoId é obrigatório');
    });

    it('deve lançar erro se estoque for inválido', async () => {
      mockStorage.get.mockResolvedValue({ insumoId: 'insumo-1' });

      await expect(repository.update('insumo-1', {})).rejects.toThrow('Estoque inválido');
    });
  });

  describe('delete', () => {
    it('deve remover estoque', async () => {
      await repository.delete('insumo-1');

      expect(mockStorage.delete).toHaveBeenCalledWith('estoque', 'insumo-1');
    });

    it('deve atualizar state após delete', async () => {
      mockStorage.getAll.mockResolvedValue([]);

      await repository.delete('insumo-1');

      expect(mockStateManager.setState).toHaveBeenCalled();
    });

    it('deve lançar erro se insumoId não for fornecido', async () => {
      await expect(repository.delete()).rejects.toThrow('insumoId é obrigatório');
    });
  });

  describe('Integration', () => {
    it('deve salvar, buscar e atualizar estoque', async () => {
      const estoque = new Estoque({ insumoId: 'insumo-1', quantidadeAtual: 10, custoMedioPonderado: 500 });

      // Salvar
      mockStorage.getAll.mockResolvedValue([estoque.toJSON()]);
      await repository.save(estoque);

      // Buscar
      mockStorage.get.mockResolvedValue(estoque.toJSON());
      const encontrado = await repository.getByInsumoId('insumo-1');
      expect(encontrado.quantidadeAtual).toBe(10);

      // Atualizar
      encontrado.adicionarEntrada(5, 600);
      await repository.update('insumo-1', encontrado);

      expect(mockStorage.update).toHaveBeenCalled();
    });
  });
});
