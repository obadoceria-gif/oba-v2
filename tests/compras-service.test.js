/**
 * Testes para ComprasService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComprasService } from '../src/modules/compras/services/ComprasService.js';
import { Compra } from '../src/modules/compras/models/Compra.js';
import { Fornecedor } from '../src/modules/compras/models/Fornecedor.js';
import { ComprasRepository } from '../src/modules/compras/repositories/ComprasRepository.js';
import { FornecedoresRepository } from '../src/modules/compras/repositories/FornecedoresRepository.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import StateManager from '../src/core/state/StateManager.js';
import { EventBus } from '../src/core/events/EventBus.js';

describe('ComprasService', () => {
  let service;
  let comprasRepository;
  let fornecedoresRepository;
  let estoqueService;
  let eventBus;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Limpar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Criar instâncias
    storage = new LocalStorageAdapter('test_compras_service');
    await storage.init();
    stateManager = new StateManager(storage);
    eventBus = new EventBus();

    comprasRepository = new ComprasRepository(storage, stateManager);
    fornecedoresRepository = new FornecedoresRepository(storage, stateManager);

    // Mock do EstoqueService
    estoqueService = {
      createMovimentacao: vi.fn().mockResolvedValue({
        estoque: { quantidadeAtual: 100 },
        movimentacao: { id: 'mov_123' }
      })
    };

    service = new ComprasService(
      comprasRepository,
      fornecedoresRepository,
      estoqueService,
      eventBus
    );

    // Limpar dados
    const allCompras = await comprasRepository.getAll();
    for (const compra of allCompras) {
      await comprasRepository.delete(compra.id);
    }

    const allFornecedores = await fornecedoresRepository.getAll();
    for (const fornecedor of allFornecedores) {
      await fornecedoresRepository.delete(fornecedor.id);
    }
  });

  describe('Construtor', () => {
    it('deve criar service com dependências', () => {
      expect(service).toBeDefined();
      expect(service.comprasRepository).toBe(comprasRepository);
      expect(service.fornecedoresRepository).toBe(fornecedoresRepository);
      expect(service.estoqueService).toBe(estoqueService);
      expect(service.eventBus).toBe(eventBus);
    });

    it('deve lançar erro se comprasRepository não for fornecido', () => {
      expect(() => new ComprasService(null, fornecedoresRepository, estoqueService, eventBus))
        .toThrow('ComprasRepository é obrigatório');
    });

    it('deve lançar erro se fornecedoresRepository não for fornecido', () => {
      expect(() => new ComprasService(comprasRepository, null, estoqueService, eventBus))
        .toThrow('FornecedoresRepository é obrigatório');
    });

    it('deve lançar erro se estoqueService não for fornecido', () => {
      expect(() => new ComprasService(comprasRepository, fornecedoresRepository, null, eventBus))
        .toThrow('EstoqueService é obrigatório');
    });

    it('deve lançar erro se eventBus não for fornecido', () => {
      expect(() => new ComprasService(comprasRepository, fornecedoresRepository, estoqueService, null))
        .toThrow('EventBus é obrigatório');
    });
  });

  describe('criarCompra', () => {
    let fornecedor;

    beforeEach(async () => {
      fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste',
        ativo: true
      });
      await fornecedoresRepository.save(fornecedor);
    });

    it('deve criar compra válida', async () => {
      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      };

      const compra = await service.criarCompra(data);

      expect(compra).toBeInstanceOf(Compra);
      expect(compra.fornecedorId).toBe(fornecedor.id);
      expect(compra.insumos).toHaveLength(1);
      expect(compra.insumos[0].subtotal).toBe(55.00);
      expect(compra.valorTotal).toBe(55.00);
      expect(compra.status).toBe('pendente');
    });

    it('deve calcular subtotais automaticamente', async () => {
      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          },
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00
          }
        ],
        formaPagamento: 'pix'
      };

      const compra = await service.criarCompra(data);

      expect(compra.insumos[0].subtotal).toBe(55.00);
      expect(compra.insumos[1].subtotal).toBe(50.00);
      expect(compra.valorTotal).toBe(105.00);
    });

    it('deve emitir evento compra:criada', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('compra:criada', eventSpy);

      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      };

      const compra = await service.criarCompra(data);

      expect(eventSpy).toHaveBeenCalledWith(
        {
          compraId: compra.id,
          fornecedorId: fornecedor.id,
          valorTotal: 55.00
        },
        'compra:criada'
      );
    });

    it('deve lançar erro se fornecedor não existir', async () => {
      const data = {
        fornecedorId: 'fornecedor_inexistente',
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      };

      await expect(service.criarCompra(data))
        .rejects.toThrow('Fornecedor fornecedor_inexistente não encontrado');
    });

    it('deve lançar erro se fornecedor estiver inativo', async () => {
      fornecedor.desativar();
      await fornecedoresRepository.update(fornecedor.id, fornecedor);

      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      };

      await expect(service.criarCompra(data))
        .rejects.toThrow('está inativo');
    });

    it('deve definir observacoes vazio se não fornecido', async () => {
      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      };

      const compra = await service.criarCompra(data);

      expect(compra.observacoes).toBe('');
    });

    it('deve aceitar observacoes', async () => {
      const data = {
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro',
        observacoes: 'Compra urgente'
      };

      const compra = await service.criarCompra(data);

      expect(compra.observacoes).toBe('Compra urgente');
    });
  });

  describe('confirmarCompra', () => {
    let fornecedor;
    let compra;

    beforeEach(async () => {
      fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste',
        ativo: true
      });
      await fornecedoresRepository.save(fornecedor);

      compra = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          },
          {
            insumoId: 'insumo_2',
            quantidade: 5,
            custoUnitario: 10.00
          }
        ],
        formaPagamento: 'dinheiro'
      });
    });

    it('deve confirmar compra pendente', async () => {
      const compraConfirmada = await service.confirmarCompra(compra.id);

      expect(compraConfirmada.status).toBe('concluida');
    });

    it('deve criar movimentações de estoque para cada insumo', async () => {
      await service.confirmarCompra(compra.id);

      expect(estoqueService.createMovimentacao).toHaveBeenCalledTimes(2);
      
      expect(estoqueService.createMovimentacao).toHaveBeenCalledWith({
        tipo: 'entrada',
        insumoId: 'insumo_1',
        quantidade: 10,
        custoUnitario: 5.50,
        origem: 'compra',
        origemId: compra.id,
        observacoes: expect.stringContaining('Compra #')
      });

      expect(estoqueService.createMovimentacao).toHaveBeenCalledWith({
        tipo: 'entrada',
        insumoId: 'insumo_2',
        quantidade: 5,
        custoUnitario: 10.00,
        origem: 'compra',
        origemId: compra.id,
        observacoes: expect.stringContaining('Compra #')
      });
    });

    it('deve emitir evento compra:confirmada', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('compra:confirmada', eventSpy);

      await service.confirmarCompra(compra.id);

      expect(eventSpy).toHaveBeenCalledWith(
        {
          compraId: compra.id,
          fornecedorId: fornecedor.id,
          insumos: [
            { insumoId: 'insumo_1', quantidade: 10 },
            { insumoId: 'insumo_2', quantidade: 5 }
          ]
        },
        'compra:confirmada'
      );
    });

    it('deve lançar erro se compra não existir', async () => {
      await expect(service.confirmarCompra('compra_inexistente'))
        .rejects.toThrow('Compra compra_inexistente não encontrada');
    });

    it('deve lançar erro se compra não estiver pendente', async () => {
      await service.confirmarCompra(compra.id);

      await expect(service.confirmarCompra(compra.id))
        .rejects.toThrow('não está pendente');
    });

    it('deve atualizar atualizadoEm', async () => {
      const atualizadoEmAntes = compra.atualizadoEm;

      await new Promise(resolve => setTimeout(resolve, 10));

      await service.confirmarCompra(compra.id);

      const compraAtualizada = await service.getCompraById(compra.id);
      expect(compraAtualizada.atualizadoEm).not.toBe(atualizadoEmAntes);
    });
  });

  describe('cancelarCompra', () => {
    let fornecedor;
    let compra;

    beforeEach(async () => {
      fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste',
        ativo: true
      });
      await fornecedoresRepository.save(fornecedor);

      compra = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [
          {
            insumoId: 'insumo_1',
            quantidade: 10,
            custoUnitario: 5.50
          }
        ],
        formaPagamento: 'dinheiro'
      });
    });

    it('deve cancelar compra pendente', async () => {
      const compraCancelada = await service.cancelarCompra(compra.id, 'Fornecedor não entregou');

      expect(compraCancelada.status).toBe('cancelada');
      expect(compraCancelada.observacoes).toContain('Cancelada: Fornecedor não entregou');
    });

    it('deve emitir evento compra:cancelada', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('compra:cancelada', eventSpy);

      await service.cancelarCompra(compra.id, 'Motivo teste');

      expect(eventSpy).toHaveBeenCalledWith(
        {
          compraId: compra.id,
          fornecedorId: fornecedor.id,
          motivo: 'Motivo teste'
        },
        'compra:cancelada'
      );
    });

    it('deve lançar erro se compra não existir', async () => {
      await expect(service.cancelarCompra('compra_inexistente', 'Motivo'))
        .rejects.toThrow('Compra compra_inexistente não encontrada');
    });

    it('deve lançar erro se compra já estiver cancelada', async () => {
      await service.cancelarCompra(compra.id, 'Motivo 1');

      await expect(service.cancelarCompra(compra.id, 'Motivo 2'))
        .rejects.toThrow('já está cancelada');
    });

    it('deve lançar erro se compra já estiver concluída', async () => {
      await service.confirmarCompra(compra.id);

      await expect(service.cancelarCompra(compra.id, 'Motivo'))
        .rejects.toThrow('já foi concluída e não pode ser cancelada');
    });

    it('deve adicionar motivo às observacoes existentes', async () => {
      compra.observacoes = 'Observação inicial';
      await comprasRepository.update(compra.id, compra);

      const compraCancelada = await service.cancelarCompra(compra.id, 'Motivo cancelamento');

      expect(compraCancelada.observacoes).toContain('Observação inicial');
      expect(compraCancelada.observacoes).toContain('Cancelada: Motivo cancelamento');
    });
  });

  describe('Métodos de busca', () => {
    let fornecedor1, fornecedor2;
    let compra1, compra2, compra3;

    beforeEach(async () => {
      fornecedor1 = new Fornecedor({ nome: 'Fornecedor 1', ativo: true });
      fornecedor2 = new Fornecedor({ nome: 'Fornecedor 2', ativo: true });
      await fornecedoresRepository.save(fornecedor1);
      await fornecedoresRepository.save(fornecedor2);

      compra1 = await service.criarCompra({
        fornecedorId: fornecedor1.id,
        insumos: [{ insumoId: 'i1', quantidade: 10, custoUnitario: 5.00 }],
        formaPagamento: 'dinheiro'
      });

      compra2 = await service.criarCompra({
        fornecedorId: fornecedor1.id,
        insumos: [{ insumoId: 'i2', quantidade: 5, custoUnitario: 10.00 }],
        formaPagamento: 'pix'
      });

      compra3 = await service.criarCompra({
        fornecedorId: fornecedor2.id,
        insumos: [{ insumoId: 'i3', quantidade: 3, custoUnitario: 20.00 }],
        formaPagamento: 'cartao_debito'
      });
    });

    it('getCompraById deve retornar compra por ID', async () => {
      const found = await service.getCompraById(compra1.id);

      expect(found).toBeInstanceOf(Compra);
      expect(found.id).toBe(compra1.id);
    });

    it('getCompraById deve retornar null se não existir', async () => {
      const found = await service.getCompraById('id_inexistente');

      expect(found).toBeNull();
    });

    it('getAllCompras deve retornar todas as compras', async () => {
      const compras = await service.getAllCompras();

      expect(compras).toHaveLength(3);
    });

    it('getComprasByFornecedor deve retornar compras do fornecedor', async () => {
      const compras = await service.getComprasByFornecedor(fornecedor1.id);

      expect(compras).toHaveLength(2);
      expect(compras.every(c => c.fornecedorId === fornecedor1.id)).toBe(true);
    });

    it('getComprasByStatus deve retornar compras por status', async () => {
      await service.confirmarCompra(compra1.id);

      const pendentes = await service.getComprasByStatus('pendente');
      const concluidas = await service.getComprasByStatus('concluida');

      expect(pendentes).toHaveLength(2);
      expect(concluidas).toHaveLength(1);
    });
  });

  describe('calcularTotalComprasFornecedor', () => {
    let fornecedor;

    beforeEach(async () => {
      fornecedor = new Fornecedor({ nome: 'Fornecedor Teste', ativo: true });
      await fornecedoresRepository.save(fornecedor);
    });

    it('deve calcular total de compras concluídas', async () => {
      const compra1 = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i1', quantidade: 10, custoUnitario: 5.00 }],
        formaPagamento: 'dinheiro'
      });

      const compra2 = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i2', quantidade: 5, custoUnitario: 10.00 }],
        formaPagamento: 'pix'
      });

      await service.confirmarCompra(compra1.id);
      await service.confirmarCompra(compra2.id);

      const dataInicio = new Date(Date.now() - 86400000).toISOString();
      const dataFim = new Date(Date.now() + 86400000).toISOString();

      const total = await service.calcularTotalComprasFornecedor(
        fornecedor.id,
        dataInicio,
        dataFim
      );

      expect(total).toBe(100.00);
    });

    it('deve ignorar compras pendentes', async () => {
      await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i1', quantidade: 10, custoUnitario: 5.00 }],
        formaPagamento: 'dinheiro'
      });

      const dataInicio = new Date(Date.now() - 86400000).toISOString();
      const dataFim = new Date(Date.now() + 86400000).toISOString();

      const total = await service.calcularTotalComprasFornecedor(
        fornecedor.id,
        dataInicio,
        dataFim
      );

      expect(total).toBe(0);
    });
  });

  describe('getEstatisticas', () => {
    let fornecedor;

    beforeEach(async () => {
      fornecedor = new Fornecedor({ nome: 'Fornecedor Teste', ativo: true });
      await fornecedoresRepository.save(fornecedor);
    });

    it('deve retornar estatísticas corretas', async () => {
      const compra1 = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i1', quantidade: 10, custoUnitario: 5.00 }],
        formaPagamento: 'dinheiro'
      });

      const compra2 = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i2', quantidade: 5, custoUnitario: 10.00 }],
        formaPagamento: 'pix'
      });

      const compra3 = await service.criarCompra({
        fornecedorId: fornecedor.id,
        insumos: [{ insumoId: 'i3', quantidade: 3, custoUnitario: 20.00 }],
        formaPagamento: 'cartao_debito'
      });

      await service.confirmarCompra(compra1.id);
      await service.cancelarCompra(compra3.id, 'Motivo');

      const stats = await service.getEstatisticas();

      expect(stats.total).toBe(3);
      expect(stats.pendentes).toBe(1);
      expect(stats.concluidas).toBe(1);
      expect(stats.canceladas).toBe(1);
      expect(stats.valorTotalConcluidas).toBe(50.00);
    });

    it('deve retornar zeros se não houver compras', async () => {
      const stats = await service.getEstatisticas();

      expect(stats.total).toBe(0);
      expect(stats.pendentes).toBe(0);
      expect(stats.concluidas).toBe(0);
      expect(stats.canceladas).toBe(0);
      expect(stats.valorTotalConcluidas).toBe(0);
    });
  });
});
