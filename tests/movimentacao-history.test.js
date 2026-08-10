/**
 * Testes para MovimentacaoHistory Component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MovimentacaoHistory } from '../src/modules/estoque/components/MovimentacaoHistory.js';
import { Movimentacao } from '../src/modules/estoque/models/Movimentacao.js';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';

describe('MovimentacaoHistory Component', () => {
  let container;
  let component;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    component = new MovimentacaoHistory(container);
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Renderização', () => {
    it('deve renderizar o componente', () => {
      expect(container.querySelector('.movimentacao-history')).toBeTruthy();
    });

    it('deve renderizar o título', () => {
      const title = container.querySelector('.history-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Histórico de Movimentações');
    });

    it('deve renderizar filtros', () => {
      expect(container.querySelector('#tipo-filter')).toBeTruthy();
      expect(container.querySelector('#data-inicio-filter')).toBeTruthy();
      expect(container.querySelector('#data-fim-filter')).toBeTruthy();
    });

    it('deve renderizar empty state quando não há movimentações', () => {
      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Nenhuma movimentação registrada');
    });
  });

  describe('Atualização de dados', () => {
    it('deve atualizar lista de movimentações', () => {
      const insumo = new Insumo({
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 500
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 50,
        custoUnitario: 500,
        origem: 'compra',
        observacoes: 'Compra inicial',
        criadoEm: '2026-02-16T10:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const table = container.querySelector('.movimentacao-table');
      expect(table).toBeTruthy();
      expect(table.textContent).toContain('Farinha de Trigo');
      expect(table.textContent).toContain('Entrada');
    });

    it('deve exibir quantidade e valores corretos', () => {
      const insumo = new Insumo({
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
        criadoEm: '2026-02-16T11:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const table = container.querySelector('.movimentacao-table');
      expect(table.textContent).toContain('25');
      expect(table.textContent).toContain('R$'$');
    });

    it('deve calcular e exibir total corretamente', () => {
      const insumo = new Insumo({
        nome: 'Leite',
        unidade: 'L',
        custoUnitario: 450
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 450,
        origem: 'compra',
        criadoEm: '2026-02-16T12:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const total = movimentacao.calculateTotal();
      expect(total).toBe(4500); // 10 × 450

      const table = container.querySelector('.movimentacao-table');
      expect(table.textContent).toContain('45,00');
    });
  });$');
    });

    it('deve calcular e exibir total corretamente', () => {
      const insumo = new Insumo({
        nome: 'Leite',
        unidade: 'L',
        custoUnitario: 450
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 450,
        origem: 'compra',
        criadoEm: '2026-02-16T12:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const total = movimentacao.calculateTotal();
      expect(total).toBe(4500); // 10 × 450

      const table = container.querySelector('.movimentacao-table');
      expect(table.textContent).toContain('45,00');
    });
  });

  describe('Tipos de movimentação', () => {
    it('deve exibir badge de entrada corretamente', () => {
      const insumo = new Insumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'entrada',
        quantidade: 50,
        custoUnitario: 500,
        origem: 'compra',
        criadoEm: '2026-02-16T13:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const badge = container.querySelector('.badge-success');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('Entrada');
    });

    it('deve exibir badge de saída corretamente', () => {
      const insumo = new Insumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      const movimentacao = new Movimentacao({
        insumoId: insumo.id,
        tipo: 'saida',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'producao',
        criadoEm: '2026-02-16T14:00:00Z'
      });

      component.update([movimentacao], [insumo]);

      const badge = container.querySelector('.badge-danger');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('Saída');
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
      const insumo = new Insumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      const movimentacoes = [
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'entrada',
          quantidade: 50,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: '2026-02-10T10:00:00Z'
        }),
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'saida',
          quantidade: 10,
          custoUnitario: 500,
          origem: 'producao',
          criadoEm: '2026-02-15T14:00:00Z'
        }),
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'entrada',
          quantidade: 30,
          custoUnitario: 520,
          origem: 'compra',
          criadoEm: '2026-02-20T09:00:00Z'
        })
      ];

      component.update(movimentacoes, [insumo]);
    });

    it('deve filtrar por tipo de movimentação', () => {
      const tipoFilter = container.querySelector('#tipo-filter');
      tipoFilter.value = 'entrada';
      tipoFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      expect(rows.length).toBe(2);
      
      rows.forEach(row => {
        expect(row.textContent).toContain('Entrada');
      });
    });

    it('deve filtrar por data início', () => {
      const dataInicioFilter = container.querySelector('#data-inicio-filter');
      dataInicioFilter.value = '2026-02-15';
      dataInicioFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      expect(rows.length).toBe(2); // 15/02 e 20/02
    });

    it('deve filtrar por data fim', () => {
      const dataFimFilter = container.querySelector('#data-fim-filter');
      dataFimFilter.value = '2026-02-15';
      dataFimFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      expect(rows.length).toBe(2); // 10/02 e 15/02
    });

    it('deve filtrar por período (data início e fim)', () => {
      const dataInicioFilter = container.querySelector('#data-inicio-filter');
      const dataFimFilter = container.querySelector('#data-fim-filter');
      
      dataInicioFilter.value = '2026-02-12';
      dataFimFilter.value = '2026-02-18';
      
      dataInicioFilter.dispatchEvent(new Event('change'));
      dataFimFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      expect(rows.length).toBe(1); // Apenas 15/02
    });

    it('deve limpar filtros', () => {
      // Aplicar filtros
      const tipoFilter = container.querySelector('#tipo-filter');
      tipoFilter.value = 'entrada';
      tipoFilter.dispatchEvent(new Event('change'));

      // Limpar filtros
      const btnClearFilters = container.querySelector('#btn-clear-filters');
      btnClearFilters.click();

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      expect(rows.length).toBe(3);
    });
  });

  describe('Ordenação', () => {
    it('deve ordenar movimentações por data (mais recente primeiro)', () => {
      const insumo = new Insumo({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      const movimentacoes = [
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'entrada',
          quantidade: 50,
          custoUnitario: 500,
          origem: 'compra',
          criadoEm: '2026-02-10T10:00:00Z'
        }),
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'saida',
          quantidade: 10,
          custoUnitario: 500,
          origem: 'producao',
          criadoEm: '2026-02-20T14:00:00Z'
        }),
        new Movimentacao({
          insumoId: insumo.id,
          tipo: 'entrada',
          quantidade: 30,
          custoUnitario: 520,
          origem: 'compra',
          criadoEm: '2026-02-15T09:00:00Z'
        })
      ];

      component.update(movimentacoes, [insumo]);

      const rows = container.querySelectorAll('.movimentacao-table tbody tr');
      
      // Primeira linha deve ser a mais recente (20/02)
      expect(rows[0].textContent).toContain('20/02');
      // Última linha deve ser a mais antiga (10/02)
      expect(rows[2].textContent).toContain('10/02');
    });
  });

  describe('Formatação', () => {
    it('deve formatar data corretamente', () => {
      const date = '2026-02-16T15:30:00Z';
      const formatted = component.formatDate(date);
      expect(formatted).toContain('16/02/2026');
      expect(formatted).toMatch(/\d{2}:\d{2}/); // Verifica formato de hora
    });

    it('deve formatar valores monetários corretamente', () => {
      expect(component.formatCurrency(500)).toContain('5,00');
      expect(component.formatCurrency(1250)).toContain('12,50');
      expect(component.formatCurrency(0)).toContain('0,00');
    });

    it('deve escapar HTML para prevenir XSS', () => {
      const maliciousText = '<script>alert("XSS")</script>';
      const escaped = component.escapeHtml(maliciousText);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });
  });

  describe('Destruição', () => {
    it('deve limpar o container ao destruir', () => {
      component.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
