/**
 * Testes para ComprasController
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComprasController } from '../src/modules/compras/controllers/ComprasController.js';

describe('ComprasController', () => {
  let controller;
  let mockService;
  let mockView;

  beforeEach(() => {
    // Mock do service
    mockService = {
      criarCompra: vi.fn(),
      confirmarCompra: vi.fn(),
      cancelarCompra: vi.fn(),
      getCompraById: vi.fn(),
      getAllCompras: vi.fn(),
      getComprasByFornecedor: vi.fn(),
      getComprasByStatus: vi.fn(),
      getEstatisticas: vi.fn()
    };

    // Mock da view
    mockView = {
      on: vi.fn(),
      off: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      renderComprasList: vi.fn(),
      showCompraDetails: vi.fn(),
      renderEstatisticas: vi.fn()
    };

    controller = new ComprasController(mockService, mockView);
  });

  describe('Constructor', () => {
    it('deve criar controller com service e view', () => {
      expect(controller.comprasService).toBe(mockService);
      expect(controller.view).toBe(mockView);
    });

    it('deve lançar erro se service não for fornecido', () => {
      expect(() => new ComprasController(null, mockView))
        .toThrow('ComprasService é obrigatório');
    });

    it('deve lançar erro se view não for fornecida', () => {
      expect(() => new ComprasController(mockService, null))
        .toThrow('ComprasView é obrigatório');
    });

    it('deve registrar event handlers na view', () => {
      expect(mockView.on).toHaveBeenCalledWith('createCompra', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('confirmarCompra', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('cancelarCompra', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadCompras', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadComprasByFornecedor', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadComprasByStatus', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('selectCompra', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('loadEstatisticas', expect.any(Function));
    });
  });

  describe('handleCreateCompra', () => {
    it('deve criar compra com sucesso', async () => {
      const data = {
        fornecedorId: 'fornecedor-1',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 10, custoUnitario: 500 }
        ],
        formaPagamento: 'pix',
        observacoes: 'Compra teste'
      };
      const compra = {
        id: 'compra-1234567890',
        ...data,
        valorTotal: 5000,
        status: 'pendente'
      };

      mockService.criarCompra.mockResolvedValue(compra);
      mockService.getAllCompras.mockResolvedValue([compra]);

      const result = await controller.handleCreateCompra(data);

      expect(mockView.showLoading).toHaveBeenCalledWith('Criando compra...');
      expect(mockService.criarCompra).toHaveBeenCalledWith(data);
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showSuccess).toHaveBeenCalledWith('Compra #compra-1 criada com sucesso!');
      expect(mockService.getAllCompras).toHaveBeenCalled();
      expect(result).toEqual(compra);
    });

    it('deve mostrar erro se criação falhar', async () => {
      const error = new Error('Fornecedor não encontrado');
      mockService.criarCompra.mockRejectedValue(error);

      await expect(controller.handleCreateCompra({}))
        .rejects.toThrow('Fornecedor não encontrado');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Fornecedor não encontrado');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.criarCompra.mockRejectedValue(new Error());

      await expect(controller.handleCreateCompra({}))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao criar compra');
    });
  });

  describe('handleConfirmarCompra', () => {
    it('deve confirmar compra com sucesso', async () => {
      const compra = {
        id: 'compra-1234567890',
        fornecedorId: 'fornecedor-1',
        status: 'concluida',
        valorTotal: 5000
      };

      mockService.confirmarCompra.mockResolvedValue(compra);
      mockService.getAllCompras.mockResolvedValue([compra]);
      mockService.getEstatisticas.mockResolvedValue({
        total: 1,
        pendentes: 0,
        concluidas: 1,
        canceladas: 0,
        valorTotalConcluidas: 5000
      });

      const result = await controller.handleConfirmarCompra('compra-1234567890');

      expect(mockView.showLoading).toHaveBeenCalledWith('Confirmando compra...');
      expect(mockService.confirmarCompra).toHaveBeenCalledWith('compra-1234567890');
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showSuccess).toHaveBeenCalledWith(
        'Compra #compra-1 confirmada! Estoque atualizado.'
      );
      expect(mockService.getAllCompras).toHaveBeenCalled();
      expect(mockService.getEstatisticas).toHaveBeenCalled();
      expect(result).toEqual(compra);
    });

    it('deve mostrar erro se confirmação falhar', async () => {
      const error = new Error('Compra não está pendente');
      mockService.confirmarCompra.mockRejectedValue(error);

      await expect(controller.handleConfirmarCompra('compra-1'))
        .rejects.toThrow('Compra não está pendente');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Compra não está pendente');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.confirmarCompra.mockRejectedValue(new Error());

      await expect(controller.handleConfirmarCompra('compra-1'))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao confirmar compra');
    });
  });

  describe('handleCancelarCompra', () => {
    it('deve cancelar compra com sucesso', async () => {
      const data = {
        compraId: 'compra-1234567890',
        motivo: 'Fornecedor não entregou'
      };
      const compra = {
        id: 'compra-1234567890',
        status: 'cancelada',
        observacoes: 'Cancelada: Fornecedor não entregou'
      };

      mockService.cancelarCompra.mockResolvedValue(compra);
      mockService.getAllCompras.mockResolvedValue([compra]);

      const result = await controller.handleCancelarCompra(data);

      expect(mockView.showLoading).toHaveBeenCalledWith('Cancelando compra...');
      expect(mockService.cancelarCompra).toHaveBeenCalledWith('compra-1234567890', 'Fornecedor não entregou');
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showSuccess).toHaveBeenCalledWith('Compra #compra-1 cancelada.');
      expect(mockService.getAllCompras).toHaveBeenCalled();
      expect(result).toEqual(compra);
    });

    it('deve mostrar erro se cancelamento falhar', async () => {
      const error = new Error('Compra já foi concluída');
      mockService.cancelarCompra.mockRejectedValue(error);

      await expect(controller.handleCancelarCompra({ compraId: 'compra-1', motivo: 'teste' }))
        .rejects.toThrow('Compra já foi concluída');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Compra já foi concluída');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.cancelarCompra.mockRejectedValue(new Error());

      await expect(controller.handleCancelarCompra({ compraId: 'compra-1', motivo: 'teste' }))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao cancelar compra');
    });
  });

  describe('handleLoadCompras', () => {
    it('deve carregar todas as compras', async () => {
      const compras = [
        { id: 'compra-1', fornecedorId: 'fornecedor-1', valorTotal: 5000 },
        { id: 'compra-2', fornecedorId: 'fornecedor-2', valorTotal: 3000 }
      ];

      mockService.getAllCompras.mockResolvedValue(compras);

      const result = await controller.handleLoadCompras();

      expect(mockView.showLoading).toHaveBeenCalledWith('Carregando compras...');
      expect(mockService.getAllCompras).toHaveBeenCalled();
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
      expect(result).toEqual(compras);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Erro ao buscar compras');
      mockService.getAllCompras.mockRejectedValue(error);

      await expect(controller.handleLoadCompras())
        .rejects.toThrow('Erro ao buscar compras');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Erro ao buscar compras');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.getAllCompras.mockRejectedValue(new Error());

      await expect(controller.handleLoadCompras())
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar compras');
    });
  });

  describe('handleLoadComprasByFornecedor', () => {
    it('deve carregar compras por fornecedor', async () => {
      const compras = [
        { id: 'compra-1', fornecedorId: 'fornecedor-1', valorTotal: 5000 },
        { id: 'compra-2', fornecedorId: 'fornecedor-1', valorTotal: 3000 }
      ];

      mockService.getComprasByFornecedor.mockResolvedValue(compras);

      const result = await controller.handleLoadComprasByFornecedor('fornecedor-1');

      expect(mockView.showLoading).toHaveBeenCalledWith('Carregando compras do fornecedor...');
      expect(mockService.getComprasByFornecedor).toHaveBeenCalledWith('fornecedor-1');
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
      expect(result).toEqual(compras);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Fornecedor não encontrado');
      mockService.getComprasByFornecedor.mockRejectedValue(error);

      await expect(controller.handleLoadComprasByFornecedor('fornecedor-999'))
        .rejects.toThrow('Fornecedor não encontrado');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Fornecedor não encontrado');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.getComprasByFornecedor.mockRejectedValue(new Error());

      await expect(controller.handleLoadComprasByFornecedor('fornecedor-1'))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar compras');
    });
  });

  describe('handleLoadComprasByStatus', () => {
    it('deve carregar compras por status pendente', async () => {
      const compras = [
        { id: 'compra-1', status: 'pendente', valorTotal: 5000 }
      ];

      mockService.getComprasByStatus.mockResolvedValue(compras);

      const result = await controller.handleLoadComprasByStatus('pendente');

      expect(mockView.showLoading).toHaveBeenCalledWith('Carregando compras...');
      expect(mockService.getComprasByStatus).toHaveBeenCalledWith('pendente');
      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
      expect(result).toEqual(compras);
    });

    it('deve carregar compras por status concluida', async () => {
      const compras = [
        { id: 'compra-1', status: 'concluida', valorTotal: 5000 }
      ];

      mockService.getComprasByStatus.mockResolvedValue(compras);

      await controller.handleLoadComprasByStatus('concluida');

      expect(mockService.getComprasByStatus).toHaveBeenCalledWith('concluida');
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
    });

    it('deve carregar compras por status cancelada', async () => {
      const compras = [
        { id: 'compra-1', status: 'cancelada', valorTotal: 5000 }
      ];

      mockService.getComprasByStatus.mockResolvedValue(compras);

      await controller.handleLoadComprasByStatus('cancelada');

      expect(mockService.getComprasByStatus).toHaveBeenCalledWith('cancelada');
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Status inválido');
      mockService.getComprasByStatus.mockRejectedValue(error);

      await expect(controller.handleLoadComprasByStatus('invalido'))
        .rejects.toThrow('Status inválido');

      expect(mockView.hideLoading).toHaveBeenCalled();
      expect(mockView.showError).toHaveBeenCalledWith('Status inválido');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.getComprasByStatus.mockRejectedValue(new Error());

      await expect(controller.handleLoadComprasByStatus('pendente'))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar compras');
    });
  });

  describe('handleSelectCompra', () => {
    it('deve selecionar compra e mostrar detalhes', async () => {
      const compra = {
        id: 'compra-1',
        fornecedorId: 'fornecedor-1',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 10, custoUnitario: 500 }
        ],
        valorTotal: 5000,
        status: 'pendente'
      };

      mockService.getCompraById.mockResolvedValue(compra);

      await controller.handleSelectCompra('compra-1');

      expect(mockService.getCompraById).toHaveBeenCalledWith('compra-1');
      expect(mockView.showCompraDetails).toHaveBeenCalledWith(compra);
    });

    it('deve mostrar erro se compra não for encontrada', async () => {
      mockService.getCompraById.mockResolvedValue(null);

      await controller.handleSelectCompra('compra-999');

      expect(mockView.showError).toHaveBeenCalledWith('Compra não encontrada');
      expect(mockView.showCompraDetails).not.toHaveBeenCalled();
    });

    it('deve mostrar erro se busca falhar', async () => {
      const error = new Error('Erro ao buscar compra');
      mockService.getCompraById.mockRejectedValue(error);

      await expect(controller.handleSelectCompra('compra-1'))
        .rejects.toThrow('Erro ao buscar compra');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao buscar compra');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.getCompraById.mockRejectedValue(new Error());

      await expect(controller.handleSelectCompra('compra-1'))
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar compra');
    });
  });

  describe('handleLoadEstatisticas', () => {
    it('deve carregar estatísticas', async () => {
      const stats = {
        total: 10,
        pendentes: 3,
        concluidas: 5,
        canceladas: 2,
        valorTotalConcluidas: 25000
      };

      mockService.getEstatisticas.mockResolvedValue(stats);

      const result = await controller.handleLoadEstatisticas();

      expect(mockService.getEstatisticas).toHaveBeenCalled();
      expect(mockView.renderEstatisticas).toHaveBeenCalledWith(stats);
      expect(result).toEqual(stats);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Erro ao calcular estatísticas');
      mockService.getEstatisticas.mockRejectedValue(error);

      await expect(controller.handleLoadEstatisticas())
        .rejects.toThrow('Erro ao calcular estatísticas');

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao calcular estatísticas');
    });

    it('deve mostrar erro genérico se erro não tiver mensagem', async () => {
      mockService.getEstatisticas.mockRejectedValue(new Error());

      await expect(controller.handleLoadEstatisticas())
        .rejects.toThrow();

      expect(mockView.showError).toHaveBeenCalledWith('Erro ao carregar estatísticas');
    });
  });

  describe('initialize', () => {
    it('deve carregar compras e estatísticas na inicialização', async () => {
      const compras = [
        { id: 'compra-1', valorTotal: 5000 }
      ];
      const stats = {
        total: 1,
        pendentes: 1,
        concluidas: 0,
        canceladas: 0,
        valorTotalConcluidas: 0
      };

      mockService.getAllCompras.mockResolvedValue(compras);
      mockService.getEstatisticas.mockResolvedValue(stats);

      await controller.initialize();

      expect(mockService.getAllCompras).toHaveBeenCalled();
      expect(mockService.getEstatisticas).toHaveBeenCalled();
      expect(mockView.renderComprasList).toHaveBeenCalledWith(compras);
      expect(mockView.renderEstatisticas).toHaveBeenCalledWith(stats);
    });

    it('deve mostrar erro se inicialização falhar', async () => {
      const error = new Error('Erro ao inicializar');
      mockService.getAllCompras.mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.initialize();

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao inicializar ComprasController:', error);
      expect(mockView.showError).toHaveBeenCalledWith('Erro ao inicializar módulo de compras');
      
      consoleSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('deve remover event handlers', () => {
      controller.destroy();

      expect(mockView.off).toHaveBeenCalledWith('createCompra', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('confirmarCompra', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('cancelarCompra', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadCompras', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadComprasByFornecedor', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadComprasByStatus', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('selectCompra', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('loadEstatisticas', expect.any(Function));
    });
  });

  describe('Integration Tests', () => {
    it('deve executar fluxo completo: criar → confirmar → carregar estatísticas', async () => {
      const compraData = {
        fornecedorId: 'fornecedor-1',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 10, custoUnitario: 500 }
        ],
        formaPagamento: 'pix'
      };
      const compra = {
        id: 'compra-1234567890',
        ...compraData,
        valorTotal: 5000,
        status: 'pendente'
      };
      const compraConfirmada = { ...compra, status: 'concluida' };
      const stats = {
        total: 1,
        pendentes: 0,
        concluidas: 1,
        canceladas: 0,
        valorTotalConcluidas: 5000
      };

      // Criar compra
      mockService.criarCompra.mockResolvedValue(compra);
      mockService.getAllCompras.mockResolvedValue([compra]);
      await controller.handleCreateCompra(compraData);

      // Confirmar compra
      mockService.confirmarCompra.mockResolvedValue(compraConfirmada);
      mockService.getAllCompras.mockResolvedValue([compraConfirmada]);
      mockService.getEstatisticas.mockResolvedValue(stats);
      await controller.handleConfirmarCompra(compra.id);

      // Verificar chamadas
      expect(mockService.criarCompra).toHaveBeenCalled();
      expect(mockService.confirmarCompra).toHaveBeenCalled();
      expect(mockService.getEstatisticas).toHaveBeenCalled();
      expect(mockView.renderEstatisticas).toHaveBeenCalledWith(stats);
    });

    it('deve executar fluxo: criar → cancelar → carregar por status', async () => {
      const compraData = {
        fornecedorId: 'fornecedor-1',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 10, custoUnitario: 500 }
        ],
        formaPagamento: 'pix'
      };
      const compra = {
        id: 'compra-1234567890',
        ...compraData,
        valorTotal: 5000,
        status: 'pendente'
      };
      const compraCancelada = { ...compra, status: 'cancelada' };

      // Criar compra
      mockService.criarCompra.mockResolvedValue(compra);
      mockService.getAllCompras.mockResolvedValue([compra]);
      await controller.handleCreateCompra(compraData);

      // Cancelar compra
      mockService.cancelarCompra.mockResolvedValue(compraCancelada);
      mockService.getAllCompras.mockResolvedValue([compraCancelada]);
      await controller.handleCancelarCompra({ compraId: compra.id, motivo: 'Teste' });

      // Carregar canceladas
      mockService.getComprasByStatus.mockResolvedValue([compraCancelada]);
      await controller.handleLoadComprasByStatus('cancelada');

      // Verificar chamadas
      expect(mockService.criarCompra).toHaveBeenCalled();
      expect(mockService.cancelarCompra).toHaveBeenCalled();
      expect(mockService.getComprasByStatus).toHaveBeenCalledWith('cancelada');
      expect(mockView.renderComprasList).toHaveBeenCalledWith([compraCancelada]);
    });

    it('deve executar fluxo: carregar por fornecedor → selecionar compra', async () => {
      const compras = [
        { id: 'compra-1', fornecedorId: 'fornecedor-1', valorTotal: 5000 },
        { id: 'compra-2', fornecedorId: 'fornecedor-1', valorTotal: 3000 }
      ];
      const compraDetalhada = {
        ...compras[0],
        insumos: [
          { insumoId: 'insumo-1', quantidade: 10, custoUnitario: 500 }
        ]
      };

      // Carregar por fornecedor
      mockService.getComprasByFornecedor.mockResolvedValue(compras);
      await controller.handleLoadComprasByFornecedor('fornecedor-1');

      // Selecionar compra
      mockService.getCompraById.mockResolvedValue(compraDetalhada);
      await controller.handleSelectCompra('compra-1');

      // Verificar chamadas
      expect(mockService.getComprasByFornecedor).toHaveBeenCalledWith('fornecedor-1');
      expect(mockService.getCompraById).toHaveBeenCalledWith('compra-1');
      expect(mockView.showCompraDetails).toHaveBeenCalledWith(compraDetalhada);
    });
  });
});
