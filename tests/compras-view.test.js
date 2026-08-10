/**
 * Testes para ComprasView
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComprasView } from '../src/modules/compras/views/ComprasView.js';
import { ComprasController } from '../src/modules/compras/controllers/ComprasController.js';
import { eventBus } from '../src/core/events/EventBus.js';

describe('ComprasView', () => {
  let container;
  let controller;
  let view;

  beforeEach(() => {
    // Cria container
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock do controller
    controller = {
      getState: vi.fn(() => ({
        compras: [],
        fornecedores: [],
        insumos: []
      })),
      createCompra: vi.fn(),
      receiveCompra: vi.fn(),
      cancelCompra: vi.fn()
    };

    // Limpa event bus
    eventBus.clear();
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Inicialização', () => {
    it('deve criar view com container e controller', async () => {
      view = new ComprasView({ container, controller });
      await view.init();

      expect(container.querySelector('.compras-view')).toBeTruthy();
      expect(container.querySelector('.compras-header')).toBeTruthy();
      expect(container.querySelector('#compras-content')).toBeTruthy();
    });

    it('deve lançar erro sem container', () => {
      expect(() => {
        new ComprasView({ controller });
      }).toThrow('Container é obrigatório');
    });

    it('deve lançar erro sem controller', () => {
      expect(() => {
        new ComprasView({ container });
      }).toThrow('Controller é obrigatório');
    });

    it('deve iniciar na view de lista', async () => {
      view = new ComprasView({ container, controller });
      await view.init();

      expect(view.currentView).toBe('list');
      expect(container.querySelector('#toggle-view-btn').textContent).toBe('Nova Compra');
    });
  });

  describe('Navegação entre views', () => {
    beforeEach(async () => {
      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve alternar para formulário ao clicar no botão', () => {
      const toggleBtn = container.querySelector('#toggle-view-btn');
      toggleBtn.click();

      expect(view.currentView).toBe('form');
      expect(toggleBtn.textContent).toBe('Voltar para Lista');
    });

    it('deve voltar para lista ao clicar novamente', () => {
      const toggleBtn = container.querySelector('#toggle-view-btn');
      
      // Vai para form
      toggleBtn.click();
      expect(view.currentView).toBe('form');

      // Volta para lista
      toggleBtn.click();
      expect(view.currentView).toBe('list');
      expect(toggleBtn.textContent).toBe('Nova Compra');
    });

    it('deve destruir componente anterior ao alternar', () => {
      const toggleBtn = container.querySelector('#toggle-view-btn');
      
      // Vai para form
      toggleBtn.click();
      expect(view.components.list).toBeNull();
      expect(view.components.form).toBeTruthy();

      // Volta para lista
      toggleBtn.click();
      expect(view.components.form).toBeNull();
      expect(view.components.list).toBeTruthy();
    });
  });

  describe('Criação de compra', () => {
    beforeEach(async () => {
      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve criar compra via controller', async () => {
      const compraData = {
        fornecedorId: 'f1',
        insumos: [{ insumoId: 'i1', quantidade: 10, custoUnitario: 5 }],
        formaPagamento: 'dinheiro'
      };

      controller.createCompra.mockResolvedValue({ id: 'c1', ...compraData });

      await view.handleCreateCompra(compraData);

      expect(controller.createCompra).toHaveBeenCalledWith(compraData);
      expect(view.currentView).toBe('list');
    });

    it('deve mostrar erro ao falhar criação', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      controller.createCompra.mockRejectedValue(new Error('Erro ao criar'));

      await view.handleCreateCompra({});

      expect(alertSpy).toHaveBeenCalledWith('Erro: Erro ao criar');
      alertSpy.mockRestore();
    });

    it('deve voltar para lista ao cancelar formulário', () => {
      // Vai para form
      view.showForm();
      expect(view.currentView).toBe('form');

      // Cancela
      view.handleCancelForm();
      expect(view.currentView).toBe('list');
    });
  });

  describe('Visualização de detalhes', () => {
    beforeEach(async () => {
      controller.getState.mockReturnValue({
        compras: [
          {
            id: 'c1',
            data: '2026-02-15',  // Adiciona campo data como string ISO
            fornecedorId: 'f1',
            insumos: [],
            valorTotal: 100,
            formaPagamento: 'dinheiro',
            status: 'pendente'
          }
        ],
        fornecedores: [{ id: 'f1', nome: 'Fornecedor 1' }],
        insumos: []
      });

      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve abrir modal de detalhes', () => {
      view.handleViewCompra({ compraId: 'c1' });

      expect(view.components.details).toBeTruthy();
      expect(container.querySelector('.modal-overlay')).toBeTruthy();
    });

    it('deve mostrar erro se compra não encontrada', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      view.handleViewCompra({ compraId: 'inexistente' });

      expect(alertSpy).toHaveBeenCalledWith('Erro: Compra não encontrada');
      expect(view.components.details).toBeNull();
      alertSpy.mockRestore();
    });

    it('deve fechar modal ao emitir evento', () => {
      view.handleViewCompra({ compraId: 'c1' });
      expect(view.components.details).toBeTruthy();

      view.handleCloseDetails();
      expect(view.components.details).toBeNull();
    });
  });

  describe('Recebimento de compra', () => {
    beforeEach(async () => {
      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve receber compra via controller', async () => {
      controller.receiveCompra.mockResolvedValue();

      await view.handleReceiveCompra({ compraId: 'c1' });

      expect(controller.receiveCompra).toHaveBeenCalledWith('c1');
    });

    it('deve fechar modal após receber', async () => {
      controller.receiveCompra.mockResolvedValue();
      view.components.details = { destroy: vi.fn() };

      await view.handleReceiveCompra({ compraId: 'c1' });

      expect(view.components.details).toBeNull();
    });

    it('deve mostrar erro ao falhar recebimento', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      controller.receiveCompra.mockRejectedValue(new Error('Erro ao receber'));

      await view.handleReceiveCompra({ compraId: 'c1' });

      expect(alertSpy).toHaveBeenCalledWith('Erro: Erro ao receber');
      alertSpy.mockRestore();
    });
  });

  describe('Cancelamento de compra', () => {
    beforeEach(async () => {
      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve cancelar compra via controller', async () => {
      controller.cancelCompra.mockResolvedValue();

      await view.handleCancelCompra({ compraId: 'c1', motivo: 'Teste' });

      expect(controller.cancelCompra).toHaveBeenCalledWith('c1', 'Teste');
    });

    it('deve fechar modal após cancelar', async () => {
      controller.cancelCompra.mockResolvedValue();
      view.components.details = { destroy: vi.fn() };

      await view.handleCancelCompra({ compraId: 'c1', motivo: 'Teste' });

      expect(view.components.details).toBeNull();
    });
  });

  describe('Atualização de estado', () => {
    beforeEach(async () => {
      view = new ComprasView({ container, controller });
      await view.init();
    });

    it('deve atualizar lista quando compras mudam', () => {
      view.components.list = { updateCompras: vi.fn() };
      const novasCompras = [{ id: 'c1' }];

      view.handleComprasUpdated({ compras: novasCompras });

      expect(view.components.list.updateCompras).toHaveBeenCalledWith(novasCompras);
    });

    it('deve atualizar lista e form quando fornecedores mudam', () => {
      view.components.list = { updateFornecedores: vi.fn() };
      view.components.form = { updateFornecedores: vi.fn() };
      const novosFornecedores = [{ id: 'f1' }];

      view.handleFornecedoresUpdated({ fornecedores: novosFornecedores });

      expect(view.components.list.updateFornecedores).toHaveBeenCalledWith(novosFornecedores);
      expect(view.components.form.updateFornecedores).toHaveBeenCalledWith(novosFornecedores);
    });
  });

  describe('Destruição', () => {
    it('deve limpar todos os componentes', async () => {
      view = new ComprasView({ container, controller });
      await view.init();

      view.components.form = { destroy: vi.fn() };
      view.components.list = { destroy: vi.fn() };
      view.components.details = { destroy: vi.fn() };

      view.destroy();

      expect(view.components.form.destroy).toHaveBeenCalled();
      expect(view.components.list.destroy).toHaveBeenCalled();
      expect(view.components.details.destroy).toHaveBeenCalled();
      expect(container.innerHTML).toBe('');
    });

    it('deve remover event listeners', async () => {
      view = new ComprasView({ container, controller });
      await view.init();

      const offSpy = vi.spyOn(view.eventBus, 'off');

      view.destroy();

      expect(offSpy).toHaveBeenCalled();
    });
  });
});
