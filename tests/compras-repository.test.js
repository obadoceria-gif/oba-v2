/**
 * Testes para ComprasRepository
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComprasRepository } from '../src/modules/compras/repositories/ComprasRepository.js';
import { Compra } from '../src/modules/compras/models/Compra.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import StateManager from '../src/core/state/StateManager.js';

describe('ComprasRepository', () => {
  let repository;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Limpar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Criar instâncias
    storage = new LocalStorageAdapter('test_compras');
    stateManager = new StateManager(storage);
    repository = new ComprasRepository(storage, stateManager);

    // Limpar dados
    const allCompras = await repository.getAll();
    for (const compra of allCompras) {
      await repository.delete(compra.id);
    }
  });

  describe('Construtor', () => {
    it('deve criar repository com storage e stateManager', () => {
      expect(repository).toBeDefined();
      expect(repository.storage).toBe(storage);
      expect(repository.stateManager).toBe(stateManager);
      expect(repository.storeName).toBe('compras');
    });

    it('deve lançar erro se storage não for fornecido', () => {
      expect(() => new ComprasRepository(null, stateManager))
        .toThrow('Storage é obrigatório');
    });

    it('deve lançar erro se stateManager não for fornecido', () => {
      expect(() => new ComprasRepository(storage, null))
        .toThrow('StateManager é obrigatório');
    });
  });

  describe('save', () => {
    it('deve salvar compra válida', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      const saved = await repository.save(compra);

      expect(saved).toBeInstanceOf(Compra);
      expect(saved.id).toBe(compra.id);
      expect(saved.fornecedorId).toBe('fornecedor_1');
    });

    it('deve lançar erro se compra não for instância de Compra', async () => {
      await expect(repository.save({ fornecedorId: 'test' }))
        .rejects.toThrow('Compra inválida');
    });

    it('deve atualizar state após salvar', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'pix',
        valorTotal: 55.00
      });

      await repository.save(compra);

      const state = stateManager.getState('compras');
      expect(state).toHaveLength(1);
      expect(state[0].id).toBe(compra.id);
    });
  });

  describe('getById', () => {
    it('deve buscar compra por ID', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await repository.save(compra);

      const found = await repository.getById(compra.id);

      expect(found).toBeInstanceOf(Compra);
      expect(found.id).toBe(compra.id);
      expect(found.fornecedorId).toBe('fornecedor_1');
    });

    it('deve retornar null se compra não existir', async () => {
      const found = await repository.getById('id_inexistente');
      expect(found).toBeNull();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.getById(null))
        .rejects.toThrow('id é obrigatório');
    });
  });

  describe('getAll', () => {
    it('deve retornar array vazio se não houver compras', async () => {
      const compras = await repository.getAll();
      expect(compras).toEqual([]);
    });

    it('deve retornar todas as compras', async () => {
      const compra1 = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      const compra2 = new Compra({
        fornecedorId: 'fornecedor_2',
        insumos: [
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00,
            subtotal: 50.00
          }
        ],
        formaPagamento: 'pix',
        valorTotal: 50.00
      });

      await repository.save(compra1);
      await repository.save(compra2);

      const compras = await repository.getAll();

      expect(compras).toHaveLength(2);
      expect(compras[0]).toBeInstanceOf(Compra);
      expect(compras[1]).toBeInstanceOf(Compra);
    });
  });

  describe('update', () => {
    it('deve atualizar compra existente', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00,
        status: 'pendente'
      });

      await repository.save(compra);

      // Atualizar status
      compra.status = 'concluida';

      const updated = await repository.update(compra.id, compra);

      expect(updated.status).toBe('concluida');

      // Verificar no storage
      const found = await repository.getById(compra.id);
      expect(found.status).toBe('concluida');
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await expect(repository.update(null, compra))
        .rejects.toThrow('id é obrigatório');
    });

    it('deve lançar erro se compra não for instância de Compra', async () => {
      await expect(repository.update('id_test', { status: 'concluida' }))
        .rejects.toThrow('Compra inválida');
    });

    it('deve lançar erro se compra não existir', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await expect(repository.update('id_inexistente', compra))
        .rejects.toThrow('Compra id_inexistente não encontrada');
    });

    it('deve atualizar atualizadoEm', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await repository.save(compra);

      const atualizadoEmAntes = compra.atualizadoEm;

      // Aguardar 10ms para garantir diferença no timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      compra.status = 'concluida';
      await repository.update(compra.id, compra);

      const found = await repository.getById(compra.id);
      expect(found.atualizadoEm).not.toBe(atualizadoEmAntes);
    });
  });

  describe('delete', () => {
    it('deve remover compra existente', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await repository.save(compra);

      await repository.delete(compra.id);

      const found = await repository.getById(compra.id);
      expect(found).toBeNull();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.delete(null))
        .rejects.toThrow('id é obrigatório');
    });

    it('deve lançar erro se compra não existir', async () => {
      await expect(repository.delete('id_inexistente'))
        .rejects.toThrow('Compra id_inexistente não encontrada');
    });

    it('deve atualizar state após remover', async () => {
      const compra = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      await repository.save(compra);
      await repository.delete(compra.id);

      const state = stateManager.getState('compras');
      expect(state).toHaveLength(0);
    });
  });

  describe('getByFornecedor', () => {
    it('deve buscar compras por fornecedor', async () => {
      const compra1 = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00
      });

      const compra2 = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00,
            subtotal: 50.00
          }
        ],
        formaPagamento: 'pix',
        valorTotal: 50.00
      });

      const compra3 = new Compra({
        fornecedorId: 'fornecedor_2',
        insumos: [
          {
            insumoId: 'insumo_3',
            quantidade: 3,
            custoUnitario: 20.00,
            subtotal: 60.00
          }
        ],
        formaPagamento: 'cartao_debito',
        valorTotal: 60.00
      });

      await repository.save(compra1);
      await repository.save(compra2);
      await repository.save(compra3);

      const compras = await repository.getByFornecedor('fornecedor_1');

      expect(compras).toHaveLength(2);
      expect(compras[0].fornecedorId).toBe('fornecedor_1');
      expect(compras[1].fornecedorId).toBe('fornecedor_1');
    });

    it('deve retornar array vazio se fornecedor não tiver compras', async () => {
      const compras = await repository.getByFornecedor('fornecedor_inexistente');
      expect(compras).toEqual([]);
    });

    it('deve lançar erro se fornecedorId não for fornecido', async () => {
      await expect(repository.getByFornecedor(null))
        .rejects.toThrow('fornecedorId é obrigatório');
    });
  });

  describe('getByData', () => {
    it('deve buscar compras por período', async () => {
      const dataBase = new Date('2026-02-17T10:00:00Z');

      const compra1 = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00,
        criadoEm: new Date(dataBase.getTime()).toISOString()
      });

      const compra2 = new Compra({
        fornecedorId: 'fornecedor_2',
        insumos: [
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00,
            subtotal: 50.00
          }
        ],
        formaPagamento: 'pix',
        valorTotal: 50.00,
        criadoEm: new Date(dataBase.getTime() + 86400000).toISOString() // +1 dia
      });

      const compra3 = new Compra({
        fornecedorId: 'fornecedor_3',
        insumos: [
          {
            insumoId: 'insumo_3',
            quantidade: 3,
            custoUnitario: 20.00,
            subtotal: 60.00
          }
        ],
        formaPagamento: 'cartao_debito',
        valorTotal: 60.00,
        criadoEm: new Date(dataBase.getTime() + 172800000).toISOString() // +2 dias
      });

      await repository.save(compra1);
      await repository.save(compra2);
      await repository.save(compra3);

      const dataInicio = dataBase.toISOString();
      const dataFim = new Date(dataBase.getTime() + 86400000).toISOString();

      const compras = await repository.getByData(dataInicio, dataFim);

      expect(compras).toHaveLength(2);
    });

    it('deve lançar erro se dataInicio não for fornecida', async () => {
      await expect(repository.getByData(null, '2026-02-17'))
        .rejects.toThrow('dataInicio e dataFim são obrigatórios');
    });

    it('deve lançar erro se dataFim não for fornecida', async () => {
      await expect(repository.getByData('2026-02-17', null))
        .rejects.toThrow('dataInicio e dataFim são obrigatórios');
    });

    it('deve lançar erro se datas forem inválidas', async () => {
      await expect(repository.getByData('data_invalida', '2026-02-17'))
        .rejects.toThrow('Datas inválidas');
    });

    it('deve lançar erro se dataInicio for posterior a dataFim', async () => {
      await expect(repository.getByData('2026-02-20', '2026-02-17'))
        .rejects.toThrow('dataInicio deve ser anterior a dataFim');
    });
  });

  describe('getByStatus', () => {
    it('deve buscar compras por status', async () => {
      const compra1 = new Compra({
        fornecedorId: 'fornecedor_1',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50,
            subtotal: 55.00
          }
        ],
        formaPagamento: 'dinheiro',
        valorTotal: 55.00,
        status: 'pendente'
      });

      const compra2 = new Compra({
        fornecedorId: 'fornecedor_2',
        insumos: [
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00,
            subtotal: 50.00
          }
        ],
        formaPagamento: 'pix',
        valorTotal: 50.00,
        status: 'concluida'
      });

      const compra3 = new Compra({
        fornecedorId: 'fornecedor_3',
        insumos: [
          {
            insumoId: 'insumo_3',
            quantidade: 3,
            custoUnitario: 20.00,
            subtotal: 60.00
          }
        ],
        formaPagamento: 'cartao_debito',
        valorTotal: 60.00,
        status: 'pendente'
      });

      await repository.save(compra1);
      await repository.save(compra2);
      await repository.save(compra3);

      const comprasPendentes = await repository.getByStatus('pendente');

      expect(comprasPendentes).toHaveLength(2);
      expect(comprasPendentes[0].status).toBe('pendente');
      expect(comprasPendentes[1].status).toBe('pendente');
    });

    it('deve retornar array vazio se não houver compras com o status', async () => {
      const compras = await repository.getByStatus('cancelada');
      expect(compras).toEqual([]);
    });

    it('deve lançar erro se status não for fornecido', async () => {
      await expect(repository.getByStatus(null))
        .rejects.toThrow('status é obrigatório');
    });

    it('deve lançar erro se status for inválido', async () => {
      await expect(repository.getByStatus('status_invalido'))
        .rejects.toThrow('status deve ser um dos seguintes: pendente, concluida, cancelada');
    });
  });
});
