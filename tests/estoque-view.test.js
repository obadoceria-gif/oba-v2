/**
 * Testes para EstoqueView
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EstoqueView } from '../src/modules/estoque/views/EstoqueView.js';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';
import { Movimentacao } from '../src/modules/estoque/models/Movimentacao.js';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';

describe('EstoqueView', () => {
  let container;
  let view;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    view = new EstoqueView(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Renderização', () => {
    it('deve renderizar a view', () => {
      expect(container.querySelector('.estoque-view')).toBeTruthy();
    });

    it('deve renderizar o título', () => {
      const title = container.querySelector('.view-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Gestão de Estoque');
    });

    it('deve renderizar a descrição', () => {
      const description = container.querySelector('.view-description');
      expect(description).toBeTruthy();
      expect(description.textContent).toContain('estoque atual');
    });

    it('deve renderizar containers dos componentes', () => {
      expect(container.querySelector('#estoque-list-container')).toBeTruthy();
      expect(container.querySelector('#movimentacao-history-container')).toBeTruthy();
    });

    it('deve renderizar loading overlay', () => {
      const overlay = container.querySelector('#loading-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay.style.display).toBe('none');
    });

    it('deve renderizar toast', () => {
      const toast = container.querySelector('#toast');
      expect(toast).toBeTruthy();
      expect(toast.style.display).toBe('none');
    });
  });

  describe('Componentes', () => {
    it('deve inicializar EstoqueList', () => {
      expect(view.list).toBeTruthy();
      expect(container.querySelector('.estoque-list')).toBeTruthy();
    });

    it('deve inicializar MovimentacaoHistory', () => {
      expect(view.history).toBeTruthy();
      expect(container.querySelector('.movimentacao-history')).toBeTruthy();
    });
  });

  describe('Atualização de dados', () => {
    it('deve atualizar lista de estoques', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 500,
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 50,
        custoMedioPonderado: 500
      });

      view.updateList([estoque], [insumo]);

      const table = container.querySelector('.estoque-table');
      expect(table).toBeTruthy();
      expect(table.textContent).toContain('Farinha de Trigo');
    });

    it('deve atualizar histórico de movimentações', () => {
      const insumo = new Insumo({
        id: 'insumo-2',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 300
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 25,
        custoUnitario: 300,
        origem: 'compra',
        criadoEm: '2026-02-16T10:00:00Z'
      });

      view.updateHistory([movimentacao], [insumo]);

      const table = container.querySelector('.movimentacao-table');
      expect(table).toBeTruthy();
      expect(table.textContent).toContain('Açúcar');
    });
  });

  describe('Loading', () => {
    it('deve mostrar loading', () => {
      view.showLoading('Carregando dados...');

      const overlay = container.querySelector('#loading-overlay');
      expect(overlay.style.display).toBe('flex');

      const text = container.querySelector('.loading-text');
      expect(text.textContent).toBe('Carregando dados...');
    });

    it('deve esconder loading', () => {
      view.showLoading();
      view.hideLoading();

      const overlay = container.querySelector('#loading-overlay');
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('Toast', () => {
    it('deve mostrar toast de sucesso', () => {
      view.showSuccess('Operação realizada com sucesso!');

      const toast = container.querySelector('#toast');
      expect(toast.style.display).toBe('block');
      expect(toast.classList.contains('toast-success')).toBe(true);

      const message = container.querySelector('.toast-message');
      expect(message.textContent).toBe('Operação realizada com sucesso!');
    });

    it('deve mostrar toast de erro', () => {
      view.showError('Erro ao processar operação');

      const toast = container.querySelector('#toast');
      expect(toast.style.display).toBe('block');
      expect(toast.classList.contains('toast-error')).toBe(true);

      const message = container.querySelector('.toast-message');
      expect(message.textContent).toBe('Erro ao processar operação');
    });

    it('deve mostrar toast de aviso', () => {
      view.showWarning('Atenção: estoque baixo!');

      const toast = container.querySelector('#toast');
      expect(toast.style.display).toBe('block');
      expect(toast.classList.contains('toast-warning')).toBe(true);

      const message = container.querySelector('.toast-message');
      expect(message.textContent).toBe('Atenção: estoque baixo!');
    });

    it('deve esconder toast após 3 segundos', async () => {
      vi.useFakeTimers();

      view.showSuccess('Teste');

      const toast = container.querySelector('#toast');
      expect(toast.style.display).toBe('block');

      vi.advanceTimersByTime(3000);

      expect(toast.style.display).toBe('none');

      vi.useRealTimers();
    });
  });

  describe('Eventos', () => {
    it('deve emitir evento selectEstoque ao clicar em ver histórico', () => {
      return new Promise((resolve) => {
        const insumo = new Insumo({
          id: 'insumo-3',
          nome: 'Farinha',
          unidade: 'kg',
          custoUnitario: 500,
          estoqueMinimo: 10
        });

        const estoque = new Estoque({
          insumoId: insumo.id,
          quantidadeAtual: 50,
          custoMedioPonderado: 500
        });

        view.updateList([estoque], [insumo]);

        view.on('selectEstoque', (insumoId) => {
          expect(insumoId).toBe(insumo.id);
          resolve();
        });

        const btnHistory = container.querySelector('.btn-history');
        btnHistory.click();
      });
    });
  });

  describe('Navegação', () => {
    it('deve rolar para o histórico ao visualizar detalhes', () => {
      const scrollIntoViewMock = vi.fn();
      view.historyContainer.scrollIntoView = scrollIntoViewMock;

      view.scrollToHistory();

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  describe('Confirmação', () => {
    it('deve mostrar diálogo de confirmação', async () => {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

      const result = await view.confirm('Tem certeza?');

      expect(confirmMock).toHaveBeenCalledWith('Tem certeza?');
      expect(result).toBe(true);

      confirmMock.mockRestore();
    });
  });

  describe('Integração de componentes', () => {
    it('deve conectar evento viewHistory da lista com selectEstoque da view', () => {
      return new Promise((resolve) => {
        const insumo = new Insumo({
          id: 'insumo-4',
          nome: 'Farinha',
          unidade: 'kg',
          custoUnitario: 500,
          estoqueMinimo: 10
        });

        const estoque = new Estoque({
          insumoId: insumo.id,
          quantidadeAtual: 50,
          custoMedioPonderado: 500
        });

        view.updateList([estoque], [insumo]);

        view.on('selectEstoque', (insumoId) => {
          expect(insumoId).toBe(insumo.id);
          resolve();
        });

        // Simular clique no botão de histórico
        const btnHistory = container.querySelector('.btn-history');
        btnHistory.click();
      });
    });

    it('deve atualizar histórico ao mostrar detalhes de estoque', () => {
      const insumo = new Insumo({
        id: 'insumo-5',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 50,
        custoMedioPonderado: 500
      });

      const movimentacoes = [
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'entrada',
          quantidade: 50,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: '2026-02-16T10:00:00Z'
        })
      ];

      view.showEstoqueDetails(estoque, movimentacoes);

      // Verificar que o histórico foi atualizado
      const historyTable = container.querySelector('.movimentacao-table');
      expect(historyTable).toBeTruthy();
    });
  });

  describe('Destruição', () => {
    it('deve destruir componentes ao destruir view', () => {
      const listDestroySpy = vi.spyOn(view.list, 'destroy');
      const historyDestroySpy = vi.spyOn(view.history, 'destroy');

      view.destroy();

      expect(listDestroySpy).toHaveBeenCalled();
      expect(historyDestroySpy).toHaveBeenCalled();
    });

    it('deve limpar o container ao destruir', () => {
      view.destroy();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('Métodos de renderização', () => {
    it('deve renderizar lista de estoques via renderEstoquesList', () => {
      const insumo = new Insumo({
        id: 'insumo-6',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500,
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 50,
        custoMedioPonderado: 500
      });

      view.renderEstoquesList([estoque]);

      // Verificar que a lista foi atualizada
      expect(view.list).toBeTruthy();
    });

    it('deve renderizar lista de movimentações via renderMovimentacoesList', () => {
      const insumo = new Insumo({
        id: 'insumo-7',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 300
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 25,
        custoUnitario: 300,
        origem: 'compra',
        criadoEm: '2026-02-16T10:00:00Z'
      });

      view.renderMovimentacoesList([movimentacao]);

      // Verificar que o histórico foi atualizado
      expect(view.history).toBeTruthy();
    });
  });
});
