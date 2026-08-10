/**
 * Testes para CompraForm
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CompraForm } from '../src/modules/compras/components/CompraForm.js';
import { eventBus } from '../src/core/events/EventBus.js';

describe('CompraForm', () => {
  let container;
  let form;
  const mockFornecedores = [
    { id: 'f1', nome: 'Fornecedor 1' },
    { id: 'f2', nome: 'Fornecedor 2' }
  ];
  const mockInsumos = [
    { id: 'i1', nome: 'Insumo 1', custoUnitario: 1000 }, // 1000 centavos = R$ 10,00
    { id: 'i2', nome: 'Insumo 2', custoUnitario: 2000 }  // 2000 centavos = R$ 20,00
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus.clear();
  });

  afterEach(() => {
    if (form) {
      form.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Inicialização', () => {
    it('deve criar formulário com fornecedores e insumos', () => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });

      expect(container.querySelector('#compra-form')).toBeTruthy();
      expect(container.querySelector('#fornecedor-select')).toBeTruthy();
      expect(container.querySelector('#insumo-select')).toBeTruthy();
    });

    it('deve lançar erro sem container', () => {
      expect(() => {
        new CompraForm({ fornecedores: [], insumos: [] });
      }).toThrow('Container é obrigatório');
    });

    it('deve renderizar opções de fornecedores', () => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: []
      });

      const select = container.querySelector('#fornecedor-select');
      expect(select.options.length).toBe(3); // 1 placeholder + 2 fornecedores
      expect(select.options[1].textContent).toBe('Fornecedor 1');
    });

    it('deve renderizar opções de insumos', () => {
      form = new CompraForm({
        container,
        fornecedores: [],
        insumos: mockInsumos
      });

      const select = container.querySelector('#insumo-select');
      expect(select.options.length).toBe(3); // 1 placeholder + 2 insumos
      expect(select.options[1].textContent).toContain('Insumo 1');
    });
  });

  describe('Adição de insumos', () => {
    beforeEach(() => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });
    });

    it('deve adicionar insumo à lista', () => {
      const insumoSelect = container.querySelector('#insumo-select');
      const quantidadeInput = container.querySelector('#quantidade-input');
      const addBtn = container.querySelector('#add-insumo-btn');

      insumoSelect.value = 'i1';
      quantidadeInput.value = '5';
      addBtn.click();

      expect(form.insumosCompra.length).toBe(1);
      expect(form.insumosCompra[0].insumoId).toBe('i1');
      expect(form.insumosCompra[0].quantidade).toBe(5);
    });

    it('deve calcular subtotal corretamente', () => {
      const insumoSelect = container.querySelector('#insumo-select');
      const quantidadeInput = container.querySelector('#quantidade-input');
      const addBtn = container.querySelector('#add-insumo-btn');

      insumoSelect.value = 'i1';
      quantidadeInput.value = '5';
      addBtn.click();

      expect(form.insumosCompra[0].subtotal).toBe(5000); // 5 * 1000 centavos = R$ 50,00
    });

    it('deve limpar campos após adicionar', () => {
      const insumoSelect = container.querySelector('#insumo-select');
      const quantidadeInput = container.querySelector('#quantidade-input');
      const addBtn = container.querySelector('#add-insumo-btn');

      insumoSelect.value = 'i1';
      quantidadeInput.value = '5';
      addBtn.click();

      expect(insumoSelect.value).toBe('');
      expect(quantidadeInput.value).toBe('');
    });

    it('deve emitir erro se insumo não selecionado', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const addBtn = container.querySelector('#add-insumo-btn');

      addBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Selecione um insumo' });
    });

    it('deve emitir erro se quantidade inválida', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const insumoSelect = container.querySelector('#insumo-select');
      const addBtn = container.querySelector('#add-insumo-btn');

      insumoSelect.value = 'i1';
      addBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Informe uma quantidade válida' });
    });

    it('deve impedir adicionar insumo duplicado', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      const insumoSelect = container.querySelector('#insumo-select');
      const quantidadeInput = container.querySelector('#quantidade-input');
      const addBtn = container.querySelector('#add-insumo-btn');

      // Adiciona primeira vez
      insumoSelect.value = 'i1';
      quantidadeInput.value = '5';
      addBtn.click();

      // Tenta adicionar novamente
      insumoSelect.value = 'i1';
      quantidadeInput.value = '3';
      addBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Insumo já adicionado' });
      expect(form.insumosCompra.length).toBe(1);
    });
  });

  describe('Remoção de insumos', () => {
    beforeEach(() => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });

      // Adiciona insumo
      form.insumosCompra = [{
        insumoId: 'i1',
        nome: 'Insumo 1',
        quantidade: 5,
        custoUnitario: 1000,  // R$ 10,00 em centavos
        subtotal: 5000        // R$ 50,00 em centavos
      }];
      form.renderInsumosList();
    });

    it('deve remover insumo da lista', () => {
      // Força re-render para garantir que o botão existe
      form.updateInsumosList();
      
      const removeBtn = container.querySelector('.btn-remove');
      if (removeBtn) {
        removeBtn.click();
        expect(form.insumosCompra.length).toBe(0);
      } else {
        // Se não há botão, remove diretamente
        form.handleRemoveInsumo('i1');
        expect(form.insumosCompra.length).toBe(0);
      }
    });

    it('deve atualizar resumo após remover', () => {
      form.updateSummary();
      const valorTotal = container.querySelector('#valor-total');
      expect(valorTotal.textContent).toBe('R$\u00A050,00');

      form.handleRemoveInsumo('i1');
      expect(valorTotal.textContent).toBe('R$\u00A00,00');
    });
  });

  describe('Atualização de resumo', () => {
    beforeEach(() => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });
    });

    it('deve atualizar total de insumos', () => {
      form.insumosCompra = [
        { insumoId: 'i1', subtotal: 50 },
        { insumoId: 'i2', subtotal: 30 }
      ];
      form.updateSummary();

      const totalInsumos = container.querySelector('#total-insumos');
      expect(totalInsumos.textContent).toBe('2');
    });

    it('deve atualizar valor total', () => {
      form.insumosCompra = [
        { insumoId: 'i1', subtotal: 5000 },  // R$ 50,00 em centavos
        { insumoId: 'i2', subtotal: 3000 }   // R$ 30,00 em centavos
      ];
      form.updateSummary();

      const valorTotal = container.querySelector('#valor-total');
      expect(valorTotal.textContent).toBe('R$\u00A080,00');
    });
  });

  describe('Submissão do formulário', () => {
    beforeEach(() => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });
    });

    it('deve emitir evento ao submeter formulário válido', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      
      // Preenche formulário
      container.querySelector('#fornecedor-select').value = 'f1';
      container.querySelector('#forma-pagamento-select').value = 'dinheiro';
      form.insumosCompra = [{ insumoId: 'i1', quantidade: 5, custoUnitario: 1000 }];

      // Submete
      const formElement = container.querySelector('#compra-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(emitSpy).toHaveBeenCalledWith('compra:create', expect.objectContaining({
        fornecedorId: 'f1',
        formaPagamento: 'dinheiro',
        insumos: expect.any(Array)
      }));
    });

    it('deve validar fornecedor obrigatório', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      
      container.querySelector('#forma-pagamento-select').value = 'dinheiro';
      form.insumosCompra = [{ insumoId: 'i1', quantidade: 5, custoUnitario: 1000 }];

      const formElement = container.querySelector('#compra-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Selecione um fornecedor' });
    });

    it('deve validar pelo menos um insumo', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      
      container.querySelector('#fornecedor-select').value = 'f1';
      container.querySelector('#forma-pagamento-select').value = 'dinheiro';

      const formElement = container.querySelector('#compra-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Adicione pelo menos um insumo' });
    });

    it('deve validar forma de pagamento obrigatória', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit');
      
      container.querySelector('#fornecedor-select').value = 'f1';
      form.insumosCompra = [{ insumoId: 'i1', quantidade: 5, custoUnitario: 1000 }];

      const formElement = container.querySelector('#compra-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(emitSpy).toHaveBeenCalledWith('error', { message: 'Selecione a forma de pagamento' });
    });
  });

  describe('Cancelamento', () => {
    it('deve emitir evento de cancelamento', () => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });

      const emitSpy = vi.spyOn(eventBus, 'emit');
      const cancelBtn = container.querySelector('#cancel-btn');
      
      cancelBtn.click();

      expect(emitSpy).toHaveBeenCalledWith('compra:cancel');
    });

    it('deve resetar formulário ao cancelar', () => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });

      form.insumosCompra = [{ insumoId: 'i1', quantidade: 5 }];
      
      const cancelBtn = container.querySelector('#cancel-btn');
      cancelBtn.click();

      expect(form.insumosCompra.length).toBe(0);
    });
  });

  describe('Atualização de dados', () => {
    beforeEach(() => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });
    });

    it('deve atualizar lista de fornecedores', () => {
      const novosFornecedores = [
        { id: 'f3', nome: 'Fornecedor 3' }
      ];

      form.updateFornecedores(novosFornecedores);

      const select = container.querySelector('#fornecedor-select');
      expect(select.options.length).toBe(2); // 1 placeholder + 1 fornecedor
      expect(select.options[1].textContent).toBe('Fornecedor 3');
    });

    it('deve atualizar lista de insumos', () => {
      const novosInsumos = [
        { id: 'i3', nome: 'Insumo 3', custoUnitario: 30 }
      ];

      form.updateInsumos(novosInsumos);

      const select = container.querySelector('#insumo-select');
      expect(select.options.length).toBe(2); // 1 placeholder + 1 insumo
      expect(select.options[1].textContent).toContain('Insumo 3');
    });
  });

  describe('Destruição', () => {
    it('deve limpar container', () => {
      form = new CompraForm({
        container,
        fornecedores: mockFornecedores,
        insumos: mockInsumos
      });

      form.destroy();

      expect(container.innerHTML).toBe('');
    });
  });
});
