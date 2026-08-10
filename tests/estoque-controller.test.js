/**
 * Testes para EstoqueController
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EstoqueController } from '../src/modules/estoque/controllers/EstoqueController.js';

describe('EstoqueController', () => {
  let controller;
  let mockService;
  let mockView;

  beforeEach(() => {
    // Mock do service
    mockService = {
      createMovimentacao: vi.fn(),
      checkEstoqueBaixo: vi.fn(),
      getEstoqueByInsumoId: vi.fn(),
      getAllEstoques: vi.fn(),
      getMovimentacoesByInsumo: vi.fn(),
      getMovimentacoes: vi.fn()
    };

    // Mock da view
    mockView = {
      on: vi.fn(),
      off: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      renderEstoquesList: vi.fn(),
      renderMovimentacoesList: vi.fn(),
      showEstoqueDetails: vi.fn()
    };

    controller = new EstoqueController(mockService, mockView);
  });

  describe('Constructor', () => {
    it('deve criar controller com service e view', () => {
      expect(controller.service).toBe(mockService);
      expect(controller.view).toBe(mockView);
    });

    it('deve lançar erro se service não for fornecido', () => {
      expect(() => new EstoqueController(null, mockView))
        .toThrow('EstoqueService é obrigatório');
    });

    it('deve lançar erro se view não for fornecida', () => {
      expect(() => new EstoqueController(mockService, null))
        .toThrow('EstoqueView é obrigatório');
    });

    it('deve registrar event handlers na view', () => {
      expect(mockView.on).toHaveBeenCalledWith('createMovimentacao', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('checkEstoqueBaixo', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadEstoques', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadMovimentacoes', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('selectEstoque', expect.any(Function));
    });
  });

  describe('handleCreateMovimentacao', () => {
    it('deve criar movimentação de entrada com sucesso', async () => {
      const data = {
        tipo: 'entrada',
        insumoId: 'insumo-1',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      };
      const result = { estoque: {}, movimentacao: {} };

      mockService.createMovimentacao.mockResolvedValue(result);
      mockService.getAllEstoques.mockResolvedValue([]);
      mockService.getMovimentacoes.mockResolvedValue([]);

      const response = await controller.handleCreateMovimentacao(data);

      expect(mockView.showLoading).toHaveBeenCalledWith('Criando movimentação...');
      expect(mockService.createMovimentacao).toHaveBeenCalledWith(data);
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showSuccess).toHaveBeenCalledWith('Movimentação de entrada criada com sucesso!');
      expect(mockService.getAllEstoques).toHaveBeenCalled();
      expect(mockService.getMovimentacoes).toHaveBeenCalledWith({ insumoId: 'insumo-1' });
      expect(response).toEqual(result);
    });

    it('deve criar movimentação de saída com sucesso', async () => {
      const data = {
        tipo: 'saida',
        insumoId: 'insumo-1',
        quantidade: 5,
        custoUnitario: 500,
        origem: 'producao'
      };
      const result = { estoque: {}, movimentacao: {} };

      mockService.createMovimentacao.mockResolvedValue(result);
      mockService.getAllEstoques.mockResolvedValue([]);
      mockService.getMovimentacoes.mockResolvedValue([]);

      await controller.handleCreateMovimentacao(data);

      expect(mockView.showSuccess).toHaveBeenCalledWith('Movimentação de saida criada com sucesso!');
    });

    it('deve mostrar erro se criação falhar', async () => {
      const error = new Error('Estoque insuficiente');
      mockService.createMovimentacao.mockRejectedValue(error);

      await expect(controller.handleCreateMovimentacao({}))
        .rejects.toThrow('Estoque insuficiente');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Estoque insuficiente');
    });
  });

  describe('handleCheckEstoqueBaixo', () => {
    it('deve verificar estoque baixo e mostrar aviso', async () => {
      const data = { insumoId: 'insumo-1', estoqueMinimo: 10 };
      mockService.checkEstoqueBaixo.mockResolvedValue(true);

      const result = await controller.handleCheckEstoqueBaixo(data);

      expect(mockService.checkEstoqueBaixo).toHaveBeenCalledWith('insumo-1', 10);
      expect(mockView.showWarning).toHaveBeenCalledWith('Estoque abaixo do mínimo!');
      expect(result).toBe(true);
    });

    it('não deve mostrar aviso se estoque não está baixo', async () => {
      const data = { insumoId: 'insumo-1', estoqueMinimo: 10 };
      mockService.checkEstoqueBaixo.mockResolvedValue(false);

      const result = await controller.handleCheckEstoqueBaixo(data);

      expect(mockView.showWarning).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('deve mostrar erro se verificação falhar', async () => {
      const error = new Error('Erro ao verificar');
      mockService.checkEstoqueBaixo.mockRejectedValue(error);

      await expect(controller.handleCheckEstoqueBaixo({}))
        .rejects.toThrow('Erro ao verificar');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao verificar');
    });
  });

  describe('handleLoadEstoques', () => {
    it('deve carregar todos os estoques', async () => {
      const estoques = [
        { insumoId: 'insumo-1', quantidadeAtual: 10 },
        { insumoId: 'insumo-2', quantidadeAtual: 20 }
      ];

      mockService.getAllEstoques.mockResolvedValue(estoques);

      const result = await controller.handleLoadEstoques();

      expect(mockView.showLoading).toHaveBeenCalledWith('Carregando estoques...');
      expect(mockService.getAllEstoques).toHaveBeenCalled();
      expect(mockView.renderEstoquesList).toHaveBeenCalledWith(estoques);
      expect(result).toEqual(estoques);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Erro ao carregar');
      mockService.getAllEstoques.mockRejectedValue(error);

      await expect(controller.handleLoadEstoques())
        .rejects.toThrow('Erro ao carregar');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar');
    });
  });

  describe('handleLoadMovimentacoes', () => {
    it('deve carregar movimentações sem filtros', async () => {
      const movimentacoes = [
        { id: '1', tipo: 'entrada' },
        { id: '2', tipo: 'saida' }
      ];

      mockService.getMovimentacoes.mockResolvedValue(movimentacoes);

      const result = await controller.handleLoadMovimentacoes();

      expect(mockView.showLoading).toHaveBeenCalledWith('Carregando movimentações...');
      expect(mockService.getMovimentacoes).toHaveBeenCalledWith({});
      expect(mockView.renderMovimentacoesList).toHaveBeenCalledWith(movimentacoes);
      expect(result).toEqual(movimentacoes);
    });

    it('deve carregar movimentações com filtros', async () => {
      const filters = { insumoId: 'insumo-1', tipo: 'entrada' };
      const movimentacoes = [{ id: '1', tipo: 'entrada' }];

      mockService.getMovimentacoes.mockResolvedValue(movimentacoes);

      await controller.handleLoadMovimentacoes(filters);

      expect(mockService.getMovimentacoes).toHaveBeenCalledWith(filters);
      expect(mockView.renderMovimentacoesList).toHaveBeenCalledWith(movimentacoes);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Erro ao carregar');
      mockService.getMovimentacoes.mockRejectedValue(error);

      await expect(controller.handleLoadMovimentacoes())
        .rejects.toThrow('Erro ao carregar');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar');
    });
  });

  describe('handleSelectEstoque', () => {
    it('deve selecionar estoque e mostrar detalhes', async () => {
      const estoque = { insumoId: 'insumo-1', quantidadeAtual: 10 };
      const movimentacoes = [
        { id: '1', tipo: 'entrada' },
        { id: '2', tipo: 'saida' }
      ];

      mockService.getEstoqueByInsumoId.mockResolvedValue(estoque);
      mockService.getMovimentacoesByInsumo.mockResolvedValue(movimentacoes);

      await controller.handleSelectEstoque('insumo-1');

      expect(mockService.getEstoqueByInsumoId).toHaveBeenCalledWith('insumo-1');
      expect(mockService.getMovimentacoesByInsumo).toHaveBeenCalledWith('insumo-1');
      expect(mockView.showEstoqueDetails).toHaveBeenCalledWith(estoque, movimentacoes);
    });

    it('deve mostrar erro se estoque não for encontrado', async () => {
      mockService.getEstoqueByInsumoId.mockResolvedValue(null);

      await controller.handleSelectEstoque('insumo-999');

      expect(mockView.showError).toHaveBeenCalledWith('Estoque não encontrado');
      expect(mockView.showEstoqueDetails).not.toHaveBeenCalled();
    });

    it('deve mostrar erro se busca falhar', async () => {
      const error = new Error('Erro ao buscar');
      mockService.getEstoqueByInsumoId.mockRejectedValue(error);

      await expect(controller.handleSelectEstoque('insumo-1'))
        .rejects.toThrow('Erro ao buscar');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao buscar');
    });
  });

  describe('initialize', () => {
    it('deve carregar estoques na inicialização', async () => {
      const estoques = [{ insumoId: 'insumo-1', quantidadeAtual: 10 }];
      mockService.getAllEstoques.mockResolvedValue(estoques);

      await controller.initialize();

      expect(mockService.getAllEstoques).toHaveBeenCalled();
      expect(mockView.renderEstoquesList).toHaveBeenCalledWith(estoques);
    });

    it('deve mostrar erro se inicialização falhar', async () => {
      const error = new Error('Erro ao inicializar');
      mockService.getAllEstoques.mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.initialize();

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Erro ao inicializar módulo de estoque');
      
      consoleSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('deve remover event handlers', () => {
      controller.destroy();

      expect(mockView.off).toHaveBeenCalledWith('createMovimentacao', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('checkEstoqueBaixo', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadEstoques', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadMovimentacoes', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('selectEstoque', expect.any(Function));
    });
  });

  describe('Integration Tests', () => {
    it('deve executar fluxo completo: criar entrada → verificar estoque → selecionar', async () => {
      const movimentacaoData = {
        tipo: 'entrada',
        insumoId: 'insumo-1',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      };
      const estoque = { insumoId: 'insumo-1', quantidadeAtual: 10 };
      const movimentacoes = [{ id: '1', tipo: 'entrada' }];

      // Criar movimentação
      mockService.createMovimentacao.mockResolvedValue({ estoque, movimentacao: {} });
      mockService.getAllEstoques.mockResolvedValue([estoque]);
      mockService.getMovimentacoes.mockResolvedValue(movimentacoes);
      await controller.handleCreateMovimentacao(movimentacaoData);

      // Verificar estoque baixo
      mockService.checkEstoqueBaixo.mockResolvedValue(false);
      await controller.handleCheckEstoqueBaixo({ insumoId: 'insumo-1', estoqueMinimo: 5 });

      // Selecionar estoque
      mockService.getEstoqueByInsumoId.mockResolvedValue(estoque);
      mockService.getMovimentacoesByInsumo.mockResolvedValue(movimentacoes);
      await controller.handleSelectEstoque('insumo-1');

      // Verificar chamadas
      expect(mockService.createMovimentacao).toHaveBeenCalled();
      expect(mockService.checkEstoqueBaixo).toHaveBeenCalled();
      expect(mockService.getEstoqueByInsumoId).toHaveBeenCalled();
      expect(mockService.getMovimentacoesByInsumo).toHaveBeenCalled();
      expect(mockView.showEstoqueDetails).toHaveBeenCalledWith(estoque, movimentacoes);
    });
  });
});
