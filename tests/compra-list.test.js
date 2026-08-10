/**
 * Testes para CompraList
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CompraList } from '../src/modules/compras/components/CompraList.js';
import { eventBus } from '../src/core/events/EventBus.js';

describe('CompraList', () => {
  let container;
  let list;
  const mockFornecedores = [
    { id: 'f1', nome: 'Fornecedor 1' },
    { id: 'f2', nome: 'Fornecedor 2' }
  ];
  const mockCompras = [
    {
      id: 'c1',
      data: '2026-02-15',
      fornecedorId: 'f1',
      insumos: [{ insumoId: 'i1', quantidade: 10 }],
      valorTotal: 100,
      formaPagamento: 'dinheiro',
      status: 'pendente'
    },
    {
      id: 'c2',
      data: '2026-02-16',
      fornecedorId: 'f2',
      insumos: [{ insumoId: 'i2', quantidade: 5 }],
      valorTotal: 200,
      formaPagamento: 'pix',
      status: 'recebida'
    }
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus.clear();
  });

  afterEach(() => {
    if (list) {
      list.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Inicialização', () => {
    it('deve criar lista com compras e fornecedores', () => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });

      expect(container.querySelector('.compra-list')).toBeTruthy();
      expect(container.querySelector('.list-filters')).toBeTruthy();
      expect(container.querySelector('.compras-table')).toBeTruthy();
    });

    it('deve lançar erro sem container', () => {
      expect(() => {
        new CompraList({ compras: [], fornecedores: [] });
      }).toThrow('Container é obrigatório');
    });

    it('deve renderizar todas as compras', () => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(2);
    });

    it('deve mostrar mensagem quando não há compras', () => {
      list = new CompraList({
        container,
        compras: [],
        fornecedores: mockFornecedores
      });

      expect(container.querySelector('.empty-message')).toBeTruthy();
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });
    });

    it('deve filtrar por fornecedor', () => {
      const filtroFornecedor = container.querySelector('#filtro-fornecedor');
      filtroFornecedor.value = 'f1';
      filtroFornecedor.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve filtrar por status', () => {
      const filtroStatus = container.querySelector('#filtro-status');
      filtroStatus.value = 'recebida';
      filtroStatus.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve filtrar por data início', () => {
      const filtroDataInicio = container.querySelector('#filtro-data-inicio');
      filtroDataInicio.value = '2026-02-16';
      filtroDataInicio.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve filtrar por data fim', () => {
      const filtroDataFim = container.querySelector('#filtro-data-fim');
      filtroDataFim.value = '2026-02-15';
      filtroDataFim.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve combinar múltiplos filtros', () => {
      const filtroFornecedor = container.querySelector('#filtro-fornecedor');
      const filtroStatus = container.querySelector('#filtro-status');

      filtroFornecedor.value = 'f1';
      filtroFornecedor.dispatchEvent(new Event('change'));
      
      filtroStatus.value = 'pendente';
      filtroStatus.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve limpar todos os filtros', () => {
      const filtroFornecedor = container.querySelector('#filtro-fornecedor');
      const limparBtn = container.querySelector('#limpar-filtros-btn');

      filtroFornecedor.value = 'f1';
      filtroFornecedor.dispatchEvent(new Event('change'));

      limparBtn.click();

      expect(filtroFornecedor.value).toBe('');
      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(2);
    });
  });

  describe('Ações', () => {
    beforeEach(() => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });
    });

    it('deve emitir evento ao visualizar compra', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const viewBtn = container.querySelector('.btn-view');
      
      viewBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('compra:view', { compraId: 'c1' });
    });

    it('deve emitir evento ao receber compra', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const receiveBtn = container.querySelector('.btn-receive');
      
      receiveBtn.click();

      expect(confirmSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('compra:receive', { compraId: 'c1' });
      
      confirmSpy.mockRestore();
    });

    it('deve não emitir evento se cancelar confirmação de recebimento', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const receiveBtn = container.querySelector('.btn-receive');
      
      receiveBtn.click();

      expect(confirmSpy).toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalledWith('compra:receive', expect.anything());
      
      confirmSpy.mockRestore();
    });

    it('deve emitir evento ao cancelar compra', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const cancelBtn = container.querySelector('.btn-cancel');
      
      cancelBtn.click();

      expect(confirmSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('compra:cancel', { compraId: 'c1' });
      
      confirmSpy.mockRestore();
    });

    it('deve mostrar apenas botão de visualizar para compras recebidas', () => {
      const rows = container.querySelectorAll('.compras-table tbody tr');
      const row2 = rows[1]; // Compra recebida

      expect(row2.querySelector('.btn-view')).toBeTruthy();
      expect(row2.querySelector('.btn-receive')).toBeFalsy();
      expect(row2.querySelector('.btn-cancel')).toBeFalsy();
    });
  });

  describe('Formatação', () => {
    beforeEach(() => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });
    });

    it('deve formatar forma de pagamento corretamente', () => {
      expect(list.formatFormaPagamento('dinheiro')).toBe('Dinheiro');
      expect(list.formatFormaPagamento('pix')).toBe('PIX');
      expect(list.formatFormaPagamento('cartao_credito')).toBe('Cartão de Crédito');
    });

    it('deve formatar status corretamente', () => {
      expect(list.formatStatus('pendente')).toBe('Pendente');
      expect(list.formatStatus('recebida')).toBe('Recebida');
      expect(list.formatStatus('cancelada')).toBe('Cancelada');
    });

    it('deve aplicar classe CSS correta ao status', () => {
      const rows = container.querySelectorAll('.compras-table tbody tr');
      
      expect(rows[0].querySelector('.status-pendente')).toBeTruthy();
      expect(rows[1].querySelector('.status-recebida')).toBeTruthy();
    });
  });

  describe('Atualização de dados', () => {
    beforeEach(() => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });
    });

    it('deve atualizar lista de compras', () => {
      const novasCompras = [
        {
          id: 'c3',
          data: '2026-02-17',
          fornecedorId: 'f1',
          insumos: [],
          valorTotal: 300,
          formaPagamento: 'boleto',
          status: 'pendente'
        }
      ];

      list.updateCompras(novasCompras);

      const rows = container.querySelectorAll('.compras-table tbody tr');
      expect(rows.length).toBe(1);
    });

    it('deve atualizar lista de fornecedores', () => {
      const novosFornecedores = [
        { id: 'f3', nome: 'Fornecedor 3' }
      ];

      list.updateFornecedores(novosFornecedores);

      const select = container.querySelector('#filtro-fornecedor');
      expect(select.options.length).toBe(2); // 1 placeholder + 1 fornecedor
    });

    it('deve manter filtro atual ao atualizar fornecedores', () => {
      const select = container.querySelector('#filtro-fornecedor');
      select.value = 'f1';

      list.updateFornecedores(mockFornecedores);

      expect(select.value).toBe('f1');
    });
  });

  describe('Destruição', () => {
    it('deve limpar container', () => {
      list = new CompraList({
        container,
        compras: mockCompras,
        fornecedores: mockFornecedores
      });

      list.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
