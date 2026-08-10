/**
 * Testes para CompraDetails
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CompraDetails } from '../src/modules/compras/components/CompraDetails.js';
import { eventBus } from '../src/core/events/EventBus.js';

describe('CompraDetails', () => {
  let container;
  let details;
  const mockFornecedor = { id: 'f1', nome: 'Fornecedor 1' };
  const mockInsumos = [
    { id: 'i1', nome: 'Insumo 1', custoUnitario: 10 },
    { id: 'i2', nome: 'Insumo 2', custoUnitario: 20 }
  ];
  const mockCompra = {
    id: 'c1',
    data: '2026-02-15',
    fornecedorId: 'f1',
    insumos: [
      { insumoId: 'i1', quantidade: 5, custoUnitario: 10 },
      { insumoId: 'i2', quantidade: 3, custoUnitario: 20 }
    ],
    valorTotal: 110,
    formaPagamento: 'dinheiro',
    status: 'pendente',
    observacoes: 'Teste de observação'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus.clear();
  });

  afterEach(() => {
    if (details) {
      details.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Inicialização', () => {
    it('deve criar modal com detalhes da compra', () => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.querySelector('.modal-overlay')).toBeTruthy();
      expect(container.querySelector('.modal-content')).toBeTruthy();
      expect(container.querySelector('.modal-header')).toBeTruthy();
    });

    it('deve lançar erro sem container', () => {
      expect(() => {
        new CompraDetails({
          compra: mockCompra,
          fornecedor: mockFornecedor,
          insumos: []
        });
      }).toThrow('Container é obrigatório');
    });

    it('deve mostrar mensagem de erro se compra não fornecida', () => {
      details = new CompraDetails({
        container,
        compra: null,
        fornecedor: mockFornecedor,
        insumos: []
      });

      expect(container.querySelector('.error-message')).toBeTruthy();
    });

    it('deve exibir informações gerais da compra', () => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.textContent).toContain('Fornecedor 1');
      expect(container.textContent).toContain('Dinheiro');
      expect(container.textContent).toContain('Pendente');
    });

    it('deve exibir lista de insumos', () => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      const rows = container.querySelectorAll('.details-table tbody tr');
      expect(rows.length).toBe(2);
    });

    it('deve exibir observações se existirem', () => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.textContent).toContain('Teste de observação');
    });

    it('deve não exibir observações se não existirem', () => {
      const compraSemObs = { ...mockCompra, observacoes: undefined };
      
      details = new CompraDetails({
        container,
        compra: compraSemObs,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.querySelector('.observacoes-text')).toBeFalsy();
    });
  });

  describe('Ações para compra pendente', () => {
    beforeEach(() => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });
    });

    it('deve mostrar botões de ação para compra pendente', () => {
      expect(container.querySelector('#receive-compra-btn')).toBeTruthy();
      expect(container.querySelector('#cancel-compra-btn')).toBeTruthy();
    });

    it('deve emitir evento ao receber compra', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      const receiveBtn = container.querySelector('#receive-compra-btn');
      receiveBtn.click();

      expect(confirmSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('compra:receive', { compraId: 'c1' });
      
      confirmSpy.mockRestore();
    });

    it('deve não emitir evento se cancelar confirmação', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      const receiveBtn = container.querySelector('#receive-compra-btn');
      receiveBtn.click();

      expect(emitSpy).not.toHaveBeenCalledWith('compra:receive', expect.anything());
      
      confirmSpy.mockRestore();
    });

    it('deve emitir evento ao cancelar compra com motivo', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Motivo do cancelamento');
      
      const cancelBtn = container.querySelector('#cancel-compra-btn');
      cancelBtn.click();

      expect(promptSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('compra:cancel', {
        compraId: 'c1',
        motivo: 'Motivo do cancelamento'
      });
      
      promptSpy.mockRestore();
    });

    it('deve não emitir evento se não informar motivo', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('');
      
      const cancelBtn = container.querySelector('#cancel-compra-btn');
      cancelBtn.click();

      expect(emitSpy).not.toHaveBeenCalledWith('compra:cancel', expect.anything());
      
      promptSpy.mockRestore();
    });
  });

  describe('Compra recebida', () => {
    it('deve não mostrar botões de ação', () => {
      const compraRecebida = {
        ...mockCompra,
        status: 'recebida',
        dataRecebimento: '2026-02-16'
      };

      details = new CompraDetails({
        container,
        compra: compraRecebida,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.querySelector('#receive-compra-btn')).toBeFalsy();
      expect(container.querySelector('#cancel-compra-btn')).toBeFalsy();
    });

    it('deve exibir data de recebimento', () => {
      const compraRecebida = {
        ...mockCompra,
        status: 'recebida',
        dataRecebimento: '2026-02-16'
      };

      details = new CompraDetails({
        container,
        compra: compraRecebida,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.textContent).toContain('Data de Recebimento');
    });
  });

  describe('Compra cancelada', () => {
    it('deve exibir motivo do cancelamento', () => {
      const compraCancelada = {
        ...mockCompra,
        status: 'cancelada',
        motivoCancelamento: 'Produto indisponível',
        dataCancelamento: '2026-02-16'
      };

      details = new CompraDetails({
        container,
        compra: compraCancelada,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      expect(container.textContent).toContain('Produto indisponível');
    });
  });

  describe('Fechamento do modal', () => {
    beforeEach(() => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });
    });

    it('deve fechar ao clicar no botão X', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const closeBtn = container.querySelector('#close-details-btn');
      
      closeBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('compra:details:close');
    });

    it('deve fechar ao clicar no botão Fechar', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const closeBtn = container.querySelector('#close-modal-btn');
      
      closeBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('compra:details:close');
    });

    it('deve fechar ao clicar no overlay', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const overlay = container.querySelector('.modal-overlay');
      
      // Simula clique diretamente no overlay
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: overlay, enumerable: true });
      overlay.dispatchEvent(event);

      expect(emitSpy).toHaveBeenCalledWith('compra:details:close');
    });
  });

  describe('Formatação', () => {
    beforeEach(() => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });
    });

    it('deve formatar forma de pagamento corretamente', () => {
      expect(details.formatFormaPagamento('dinheiro')).toBe('Dinheiro');
      expect(details.formatFormaPagamento('pix')).toBe('PIX');
      expect(details.formatFormaPagamento('cartao_credito')).toBe('Cartão de Crédito');
    });

    it('deve formatar status corretamente', () => {
      expect(details.formatStatus('pendente')).toBe('Pendente');
      expect(details.formatStatus('recebida')).toBe('Recebida');
      expect(details.formatStatus('cancelada')).toBe('Cancelada');
    });
  });

  describe('Destruição', () => {
    it('deve limpar container', () => {
      details = new CompraDetails({
        container,
        compra: mockCompra,
        fornecedor: mockFornecedor,
        insumos: mockInsumos
      });

      details.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
