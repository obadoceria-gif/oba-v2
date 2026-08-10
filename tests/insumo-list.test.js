/**
 * Testes para InsumoList Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InsumoList } from '../src/modules/insumos/components/InsumoList.js';

describe('InsumoList', () => {
  let container;
  let list;

  const mockInsumos = [
    {
      id: 'insumo-1',
      nome: 'Farinha de Trigo',
      unidade: 'kg',
      custoUnitario: 500,
      fornecedor: 'Distribuidora ABC',
      estoqueMinimo: 10
    },
    {
      id: 'insumo-2',
      nome: 'Açúcar',
      unidade: 'kg',
      custoUnitario: 350,
      fornecedor: 'Distribuidora XYZ',
      estoqueMinimo: 5
    },
    {
      id: 'insumo-3',
      nome: 'Leite',
      unidade: 'L',
      custoUnitario: 400,
      fornecedor: 'Laticínios Bom Leite',
      estoqueMinimo: 20
    }
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (list) {
      list.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Constructor e Renderização', () => {
    it('deve renderizar a lista corretamente', () => {
      list = new InsumoList(container);

      expect(container.querySelector('.insumo-list')).toBeTruthy();
      expect(container.querySelector('.list-header')).toBeTruthy();
      expect(container.querySelector('.list-filters')).toBeTruthy();
      expect(container.querySelector('.list-content')).toBeTruthy();
    });

    it('deve renderizar filtros', () => {
      list = new InsumoList(container);

      expect(container.querySelector('#search-input')).toBeTruthy();
      expect(container.querySelector('#unidade-filter')).toBeTruthy();
      expect(container.querySelector('#fornecedor-filter')).toBeTruthy();
      expect(container.querySelector('#btn-clear-filters')).toBeTruthy();
    });

    it('deve mostrar mensagem quando lista vazia', () => {
      list = new InsumoList(container);

      const emptyMessage = container.querySelector('.empty-message');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('Nenhum insumo cadastrado');
    });
  });

  describe('Atualização de Dados', () => {
    beforeEach(() => {
      list = new InsumoList(container);
    });

    it('deve atualizar lista com insumos', () => {
      list.update(mockInsumos);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
    });

    it('deve renderizar dados dos insumos corretamente', () => {
      list.update(mockInsumos);

      const firstRow = container.querySelector('tbody tr:first-child');
      expect(firstRow.textContent).toContain('Farinha de Trigo');
      expect(firstRow.textContent).toContain('kg');
      expect(firstRow.textContent).toContain('R$');
      expect(firstRow.textContent).toContain('Distribuidora ABC');
    });

    it('deve atualizar contador de itens', () => {
      list.update(mockInsumos);

      const count = container.querySelector('.list-count');
      expect(count.textContent).toBe('3 itens');
    });

    it('deve usar singular quando apenas 1 item', () => {
      list.update([mockInsumos[0]]);

      const count = container.querySelector('.list-count');
      expect(count.textContent).toBe('1 item');
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
      list = new InsumoList(container);
      list.update(mockInsumos);
    });

    it('deve filtrar por nome (busca)', () => {
      const searchInput = container.querySelector('#search-input');
      searchInput.value = 'Farinha';
      searchInput.dispatchEvent(new Event('input'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Farinha de Trigo');
    });

    it('deve filtrar por unidade', () => {
      const unidadeFilter = container.querySelector('#unidade-filter');
      unidadeFilter.value = 'L';
      unidadeFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Leite');
    });

    it('deve filtrar por fornecedor', () => {
      const fornecedorFilter = container.querySelector('#fornecedor-filter');
      fornecedorFilter.value = 'ABC';
      fornecedorFilter.dispatchEvent(new Event('input'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Farinha de Trigo');
    });

    it('deve aplicar múltiplos filtros simultaneamente', () => {
      const searchInput = container.querySelector('#search-input');
      const unidadeFilter = container.querySelector('#unidade-filter');

      searchInput.value = 'a';
      searchInput.dispatchEvent(new Event('input'));
      
      unidadeFilter.value = 'kg';
      unidadeFilter.dispatchEvent(new Event('change'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2); // Farinha e Açúcar
    });

    it('deve limpar todos os filtros', () => {
      const searchInput = container.querySelector('#search-input');
      const unidadeFilter = container.querySelector('#unidade-filter');
      const btnClear = container.querySelector('#btn-clear-filters');

      // Aplicar filtros
      searchInput.value = 'Farinha';
      searchInput.dispatchEvent(new Event('input'));
      unidadeFilter.value = 'kg';
      unidadeFilter.dispatchEvent(new Event('change'));

      // Limpar
      btnClear.click();

      // Re-obter elementos após re-render
      const newSearchInput = container.querySelector('#search-input');
      const newUnidadeFilter = container.querySelector('#unidade-filter');
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
      expect(newSearchInput.value).toBe('');
      expect(newUnidadeFilter.value).toBe('');
    });

    it('deve mostrar mensagem quando filtro não retorna resultados', () => {
      const searchInput = container.querySelector('#search-input');
      searchInput.value = 'Produto Inexistente';
      searchInput.dispatchEvent(new Event('input'));

      const emptyMessage = container.querySelector('.empty-message');
      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent).toContain('Nenhum insumo encontrado');
    });
  });

  describe('Ações', () => {
    beforeEach(() => {
      list = new InsumoList(container);
      list.update(mockInsumos);
    });

    it('deve renderizar botões de ação', () => {
      const editButtons = container.querySelectorAll('.btn-edit');
      const deleteButtons = container.querySelectorAll('.btn-delete');

      expect(editButtons.length).toBe(3);
      expect(deleteButtons.length).toBe(3);
    });

    it('deve emitir evento "edit" ao clicar em editar', () => {
      const handler = vi.fn();
      list.on('edit', handler);

      const editButton = container.querySelector('.btn-edit');
      editButton.click();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].id).toBe('insumo-1');
      expect(handler.mock.calls[0][0].nome).toBe('Farinha de Trigo');
    });

    it('deve emitir evento "delete" ao clicar em excluir', () => {
      const handler = vi.fn();
      list.on('delete', handler);

      const deleteButton = container.querySelector('.btn-delete');
      deleteButton.click();

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0]).toBe('insumo-1'); // Apenas o ID
    });
  });

  describe('Formatação', () => {
    beforeEach(() => {
      list = new InsumoList(container);
    });

    it('deve formatar valores monetários corretamente', () => {
      const formatted = list.formatCurrency(500);
      expect(formatted).toContain('5,00');
      expect(formatted).toContain('R$');
    });

    it('deve formatar valores com centavos', () => {
      const formatted = list.formatCurrency(1250);
      expect(formatted).toContain('12,50');
      expect(formatted).toContain('R$');
    });

    it('deve escapar HTML para prevenir XSS', () => {
      const escaped = list.escapeHtml('<script>alert("xss")</script>');
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });
  });

  describe('Busca Case-Insensitive', () => {
    beforeEach(() => {
      list = new InsumoList(container);
      list.update(mockInsumos);
    });

    it('deve buscar ignorando maiúsculas/minúsculas', () => {
      const searchInput = container.querySelector('#search-input');
      
      searchInput.value = 'FARINHA';
      searchInput.dispatchEvent(new Event('input'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Farinha de Trigo');
    });

    it('deve filtrar fornecedor ignorando maiúsculas/minúsculas', () => {
      const fornecedorFilter = container.querySelector('#fornecedor-filter');
      
      fornecedorFilter.value = 'abc';
      fornecedorFilter.dispatchEvent(new Event('input'));

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Distribuidora ABC');
    });
  });

  describe('Acessibilidade', () => {
    beforeEach(() => {
      list = new InsumoList(container);
      list.update(mockInsumos);
    });

    it('deve ter aria-label nos botões de ação', () => {
      const editButton = container.querySelector('.btn-edit');
      const deleteButton = container.querySelector('.btn-delete');

      expect(editButton.getAttribute('aria-label')).toContain('Editar');
      expect(deleteButton.getAttribute('aria-label')).toContain('Excluir');
    });

    it('deve ter title nos botões de ação', () => {
      const editButton = container.querySelector('.btn-edit');
      const deleteButton = container.querySelector('.btn-delete');

      expect(editButton.getAttribute('title')).toBe('Editar');
      expect(deleteButton.getAttribute('title')).toBe('Excluir');
    });
  });
});
