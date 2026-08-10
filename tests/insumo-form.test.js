/**
 * Testes para InsumoForm Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InsumoForm } from '../src/modules/insumos/components/InsumoForm.js';

describe('InsumoForm', () => {
  let container;
  let form;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (form) {
      form.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Constructor e Renderização', () => {
    it('deve renderizar o formulário corretamente', () => {
      form = new InsumoForm(container);

      expect(container.querySelector('#insumo-form')).toBeTruthy();
      expect(container.querySelector('#nome')).toBeTruthy();
      expect(container.querySelector('#unidade')).toBeTruthy();
      expect(container.querySelector('#custoUnitario')).toBeTruthy();
      expect(container.querySelector('#fornecedor')).toBeTruthy();
      expect(container.querySelector('#estoqueMinimo')).toBeTruthy();
      expect(container.querySelector('#observacoes')).toBeTruthy();
    });

    it('deve renderizar com título "Novo Insumo" por padrão', () => {
      form = new InsumoForm(container);

      const title = container.querySelector('.title-text');
      expect(title.textContent).toBe('Novo Insumo');
    });

    it('deve renderizar botões de ação', () => {
      form = new InsumoForm(container);

      expect(container.querySelector('#btn-submit')).toBeTruthy();
      expect(container.querySelector('#btn-cancel')).toBeTruthy();
    });
  });

  describe('Validação de Campos', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve validar campo nome obrigatório', () => {
      const nomeInput = container.querySelector('#nome');
      nomeInput.value = '';
      nomeInput.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#nome-error');
      expect(error.textContent).toBe('Nome é obrigatório');
    });

    it('deve validar tamanho mínimo do nome', () => {
      const nomeInput = container.querySelector('#nome');
      nomeInput.value = 'A';
      nomeInput.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#nome-error');
      expect(error.textContent).toBe('Nome deve ter no mínimo 2 caracteres');
    });

    it('deve validar tamanho máximo do nome', () => {
      const nomeInput = container.querySelector('#nome');
      nomeInput.value = 'A'.repeat(101);
      nomeInput.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#nome-error');
      expect(error.textContent).toBe('Nome deve ter no máximo 100 caracteres');
    });

    it('deve validar unidade obrigatória', () => {
      const unidadeSelect = container.querySelector('#unidade');
      unidadeSelect.value = '';
      unidadeSelect.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#unidade-error');
      expect(error.textContent).toBe('Unidade é obrigatória');
    });

    it('deve validar custo unitário obrigatório', () => {
      const custoInput = container.querySelector('#custoUnitario');
      custoInput.value = '';
      custoInput.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#custoUnitario-error');
      expect(error.textContent).toBe('Custo unitário é obrigatório');
    });

    it('deve validar custo unitário não-negativo', () => {
      const custoInput = container.querySelector('#custoUnitario');
      custoInput.value = '-10';
      custoInput.dispatchEvent(new Event('blur'));

      const error = container.querySelector('#custoUnitario-error');
      expect(error.textContent).toBe('Custo deve ser um número não-negativo');
    });

    it('deve limpar erro ao digitar', () => {
      const nomeInput = container.querySelector('#nome');
      
      // Gerar erro
      nomeInput.value = '';
      nomeInput.dispatchEvent(new Event('blur'));
      
      let error = container.querySelector('#nome-error');
      expect(error.textContent).toBe('Nome é obrigatório');
      
      // Digitar
      nomeInput.value = 'Farinha';
      nomeInput.dispatchEvent(new Event('input'));
      
      error = container.querySelector('#nome-error');
      expect(error.textContent).toBe('');
    });
  });

  describe('Coleta de Dados', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve coletar dados do formulário corretamente', () => {
      container.querySelector('#nome').value = 'Farinha de Trigo';
      container.querySelector('#unidade').value = 'kg';
      container.querySelector('#custoUnitario').value = '500';
      container.querySelector('#fornecedor').value = 'Distribuidora ABC';
      container.querySelector('#estoqueMinimo').value = '10';
      container.querySelector('#observacoes').value = 'Tipo 1';

      const data = form.getFormData();

      expect(data.nome).toBe('Farinha de Trigo');
      expect(data.unidade).toBe('kg');
      expect(data.custoUnitario).toBe(500);
      expect(data.fornecedor).toBe('Distribuidora ABC');
      expect(data.estoqueMinimo).toBe(10);
      expect(data.observacoes).toBe('Tipo 1');
    });

    it('deve converter valores numéricos corretamente', () => {
      container.querySelector('#nome').value = 'Açúcar';
      container.querySelector('#unidade').value = 'kg';
      container.querySelector('#custoUnitario').value = '350.50';
      container.querySelector('#estoqueMinimo').value = '5';

      const data = form.getFormData();

      expect(data.custoUnitario).toBe(350.5);
      expect(data.estoqueMinimo).toBe(5);
    });

    it('deve usar valores padrão para campos vazios', () => {
      container.querySelector('#nome').value = 'Leite';
      container.querySelector('#unidade').value = 'L';
      container.querySelector('#custoUnitario').value = '400';

      const data = form.getFormData();

      expect(data.fornecedor).toBe('');
      expect(data.estoqueMinimo).toBe(0);
      expect(data.observacoes).toBe('');
    });
  });

  describe('Modo de Edição', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve preencher formulário com dados existentes', () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: 'Distribuidora ABC',
        estoqueMinimo: 10,
        observacoes: 'Tipo 1'
      };

      form.populate(insumo);

      expect(container.querySelector('#nome').value).toBe('Farinha de Trigo');
      expect(container.querySelector('#unidade').value).toBe('kg');
      expect(container.querySelector('#custoUnitario').value).toBe('500');
      expect(container.querySelector('#fornecedor').value).toBe('Distribuidora ABC');
      expect(container.querySelector('#estoqueMinimo').value).toBe('10');
      expect(container.querySelector('#observacoes').value).toBe('Tipo 1');
    });

    it('deve mudar título para "Editar Insumo"', () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };

      form.populate(insumo);

      const title = container.querySelector('.title-text');
      expect(title.textContent).toBe('Editar Insumo');
    });

    it('deve mudar texto do botão para "Atualizar"', () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };

      form.populate(insumo);

      const btnSubmit = container.querySelector('#btn-submit');
      expect(btnSubmit.textContent.trim()).toBe('Atualizar');
    });
  });

  describe('Eventos', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve emitir evento "create" ao submeter formulário novo', () => {
      const handler = vi.fn();
      form.on('create', handler);

      container.querySelector('#nome').value = 'Farinha';
      container.querySelector('#unidade').value = 'kg';
      container.querySelector('#custoUnitario').value = '500';

      const formElement = container.querySelector('#insumo-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(handler).toHaveBeenCalledWith({
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: '',
        estoqueMinimo: 0,
        observacoes: ''
      });
    });

    it('deve emitir evento "update" ao submeter formulário em modo edição', () => {
      const handler = vi.fn();
      form.on('update', handler);

      form.populate({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      container.querySelector('#nome').value = 'Farinha Atualizada';
      
      const formElement = container.querySelector('#insumo-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].id).toBe('insumo-1');
      expect(handler.mock.calls[0][0].data.nome).toBe('Farinha Atualizada');
    });

    it('deve emitir evento "cancel" ao clicar em cancelar', () => {
      const handler = vi.fn();
      form.on('cancel', handler);

      const btnCancel = container.querySelector('#btn-cancel');
      btnCancel.click();

      expect(handler).toHaveBeenCalled();
    });

    it('não deve submeter formulário com dados inválidos', () => {
      const handler = vi.fn();
      form.on('create', handler);

      // Deixar campos obrigatórios vazios
      const formElement = container.querySelector('#insumo-form');
      formElement.dispatchEvent(new Event('submit'));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Limpeza', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve limpar todos os campos', () => {
      container.querySelector('#nome').value = 'Farinha';
      container.querySelector('#unidade').value = 'kg';
      container.querySelector('#custoUnitario').value = '500';

      form.clear();

      expect(container.querySelector('#nome').value).toBe('');
      expect(container.querySelector('#unidade').value).toBe('');
      expect(container.querySelector('#custoUnitario').value).toBe('');
    });

    it('deve sair do modo de edição', () => {
      form.populate({
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      });

      form.clear();

      const title = container.querySelector('.title-text');
      expect(title.textContent).toBe('Novo Insumo');
    });
  });

  describe('Contador de Caracteres', () => {
    beforeEach(() => {
      form = new InsumoForm(container);
    });

    it('deve atualizar contador de caracteres', () => {
      const observacoes = container.querySelector('#observacoes');
      const charCount = container.querySelector('.char-count');

      observacoes.value = 'Teste';
      observacoes.dispatchEvent(new Event('input'));

      expect(charCount.textContent).toBe('5/500 caracteres');
    });

    it('deve adicionar classe warning quando próximo do limite', () => {
      const observacoes = container.querySelector('#observacoes');
      const charCount = container.querySelector('.char-count');

      observacoes.value = 'A'.repeat(460);
      observacoes.dispatchEvent(new Event('input'));

      expect(charCount.classList.contains('warning')).toBe(true);
    });
  });
});
