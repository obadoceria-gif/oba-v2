/**
 * Testes para EstoqueList Component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EstoqueList } from '../src/modules/estoque/components/EstoqueList.js';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';

describe('EstoqueList Component', () => {
  let container;
  let component;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    component = new EstoqueList(container);
  });

  afterEach(() => {
    if (component) {
      component.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Renderização', () => {
    it('deve renderizar o componente', () => {
      expect(container.querySelector('.estoque-list')).toBeTruthy();
    });

    it('deve renderizar o título', () => {
      const title = container.querySelector('.list-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Estoque Atual');
    });

    it('deve renderizar filtros', () => {
      expect(container.querySelector('#search-input')).toBeTruthy();
      expect(container.querySelector('#categoria-filter')).toBeTruthy();
      expect(container.querySelector('#abaixo-minimo-filter')).toBeTruthy();
    });

    it('deve renderizar empty state quando não há estoques', () => {
      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('Nenhum estoque registrado');
    });
  });

  describe('Atualização de dados', () => {
    it('deve atualizar lista de estoques', () => {
      const insumo = new Insumo({
        id: 'insumo-farinha-update-test',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 50,
        custoMedioPonderado: 500
      });

      component.update([estoque], [insumo]);

      const table = container.querySelector('.estoque-table');
      expect(table).toBeTruthy();
      expect(table.textContent).toContain('Farinha de Trigo');
    });

    it('deve exibir quantidade correta', () => {
      const insumo = new Insumo({
        id: 'insumo-acucar-update-test',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 300,
        estoqueMinimo: 5
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 25,
        custoMedioPonderado: 300
      });

      component.update([estoque], [insumo]);

      const table = container.querySelector('.estoque-table');
      expect(table.textContent).toContain('25');
    });

    it('deve exibir custo médio ponderado formatado', () => {
      const insumo = new Insumo({
        id: 'insumo-leite-update-test',
        nome: 'Leite',
        unidade: 'L',
        custoUnitario: 450,
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 20,
        custoMedioPonderado: 450
      });

      component.update([estoque], [insumo]);

      const table = container.querySelector('.estoque-table');
      expect(table.textContent).toContain('R$');
      expect(table.textContent).toContain('4,50');
    });
  });

  describe('Filtros', () => {
    let testInsumos;
    let testEstoques;

    beforeEach(() => {
      // Criar insumos com IDs únicos
      testInsumos = [
        new Insumo({
          id: 'insumo-farinha-test',
          nome: 'Farinha de Trigo',
          unidade: 'kg',
          custoUnitario: 500,
          estoqueMinimo: 10
        }),
        new Insumo({
          id: 'insumo-acucar-test',
          nome: 'Açúcar',
          unidade: 'kg',
          custoUnitario: 300,
          estoqueMinimo: 5
        }),
        new Insumo({
          id: 'insumo-leite-test',
          nome: 'Leite',
          unidade: 'L',
          custoUnitario: 450,
          estoqueMinimo: 10
        })
      ];

      // Criar estoques DEPOIS dos insumos, usando os IDs corretos
      testEstoques = [
        new Estoque({
          insumoId: testInsumos[0].id,
          quantidadeAtual: 50,
          custoMedioPonderado: 500
        }),
        new Estoque({
          insumoId: testInsumos[1].id,
          quantidadeAtual: 3,
          custoMedioPonderado: 300
        }), // Abaixo do mínimo
        new Estoque({
          insumoId: testInsumos[2].id,
          quantidadeAtual: 20,
          custoMedioPonderado: 450
        })
      ];

      component.update(testEstoques, testInsumos);
    });

    it('deve filtrar por busca de nome', () => {
      const searchInput = container.querySelector('#search-input');
      searchInput.value = 'Farinha';
      searchInput.dispatchEvent(new Event('input'));

      const rows = container.querySelectorAll('.estoque-table tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Farinha de Trigo');
    });

    it('deve filtrar por categoria (unidade)', () => {
      const categoriaFilter = container.querySelector('#categoria-filter');
      categoriaFilter.value = 'L';
      categoriaFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.estoque-table tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Leite');
    });

    it('deve filtrar apenas abaixo do mínimo', () => {
      const abaixoMinimoFilter = container.querySelector('#abaixo-minimo-filter');
      abaixoMinimoFilter.checked = true;
      abaixoMinimoFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('.estoque-table tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Açúcar');
    });

    it('deve limpar filtros', () => {
      // Aplicar filtros
      const searchInput = container.querySelector('#search-input');
      searchInput.value = 'Farinha';
      searchInput.dispatchEvent(new Event('input'));

      // Limpar filtros
      const btnClearFilters = container.querySelector('#btn-clear-filters');
      btnClearFilters.click();

      const rows = container.querySelectorAll('.estoque-table tbody tr');
      expect(rows.length).toBe(3);
    });
  });

  describe('Destaque de estoque baixo', () => {
    it('deve destacar insumo abaixo do mínimo', () => {
      const insumo = new Insumo({
        id: 'insumo-acucar-baixo-test',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 300,
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 5,
        custoMedioPonderado: 300
      }); // Abaixo do mínimo

      component.update([estoque], [insumo]);

      const row = container.querySelector('.estoque-table tbody tr');
      expect(row.classList.contains('row-warning')).toBe(true);
      expect(row.textContent).toContain('Estoque Baixo');
    });

    it('não deve destacar insumo acima do mínimo', () => {
      const insumo = new Insumo({
        id: 'insumo-farinha-alto-test',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500,
        estoqueMinimo: 10
      });

      const estoque = new Estoque({
        insumoId: insumo.id,
        quantidadeAtual: 50,
        custoMedioPonderado: 500
      }); // Acima do mínimo

      component.update([estoque], [insumo]);

      const row = container.querySelector('.estoque-table tbody tr');
      expect(row.classList.contains('row-warning')).toBe(false);
      expect(row.textContent).not.toContain('Estoque Baixo');
    });
  });

  describe('Eventos', () => {
    it('deve emitir evento viewHistory ao clicar em ver histórico', () => {
      return new Promise((resolve) => {
        const insumo = new Insumo({
          id: 'insumo-farinha-evento-test',
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

        component.update([estoque], [insumo]);

        component.on('viewHistory', (insumoId) => {
          expect(insumoId).toBe(insumo.id);
          resolve();
        });

        const btnHistory = container.querySelector('.btn-history');
        btnHistory.click();
      });
    });
  });

  describe('Formatação', () => {
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
