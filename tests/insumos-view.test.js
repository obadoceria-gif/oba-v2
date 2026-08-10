/**
 * Testes para InsumosView
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InsumosView } from '../src/modules/insumos/views/InsumosView.js';

describe('InsumosView', () => {
  let container;
  let view;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    document.body.removeChild(container);
  });

  describe('Constructor e Renderização', () => {
    it('deve renderizar a view corretamente', () => {
      view = new InsumosView(container);

      expect(container.querySelector('.insumos-view')).toBeTruthy();
      expect(container.querySelector('.view-header')).toBeTruthy();
      expect(container.querySelector('.view-content')).toBeTruthy();
    });

    it('deve renderizar título e descrição', () => {
      view = new InsumosView(container);

      const title = container.querySelector('.view-title');
      const description = container.querySelector('.view-description');

      expect(title.textContent).toBe('Gestão de Insumos');
      expect(description.textContent).toContain('Cadastre e gerencie');
    });

    it('deve renderizar containers para form e list', () => {
      view = new InsumosView(container);

      expect(container.querySelector('#insumo-form-container')).toBeTruthy();
      expect(container.querySelector('#insumo-list-container')).toBeTruthy();
    });

    it('deve renderizar loading overlay', () => {
      view = new InsumosView(container);

      const overlay = container.querySelector('#loading-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay.style.display).toBe('none');
    });

    it('deve renderizar toast', () => {
      view = new InsumosView(container);

      const toast = container.querySelector('#toast');
      expect(toast).toBeTruthy();
      expect(toast.style.display).toBe('none');
    });
  });

  describe('Inicialização de Componentes', () => {
    it('deve inicializar InsumoForm', () => {
      view = new InsumosView(container);

      expect(view.form).toBeTruthy();
      expect(container.querySelector('#insumo-form')).toBeTruthy();
    });

    it('deve inicializar InsumoList', () => {
      view = new InsumosView(container);

      expect(view.list).toBeTruthy();
      expect(container.querySelector('.insumo-list')).toBeTruthy();
    });
  });

  describe('Eventos do Formulário', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve propagar evento "create-insumo" do formulário', () => {
      const handler = vi.fn();
      view.on('create', handler);

      const formData = {
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };

      // Simular evento do formulário
      view.form.emit('create', formData);

      expect(handler).toHaveBeenCalledWith(formData);
    });

    it('deve propagar evento "update-insumo" do formulário', () => {
      const handler = vi.fn();
      view.on('update', handler);

      const updateData = {
        id: 'insumo-1',
        data: { nome: 'Farinha Atualizada' }
      };

      // Simular evento do formulário
      view.form.emit('update', updateData);

      expect(handler).toHaveBeenCalledWith(updateData);
    });

    it('deve propagar evento "cancel-form" do formulário', () => {
      const handler = vi.fn();
      view.on('cancel', handler);

      // Simular evento do formulário
      view.form.emit('cancel');

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Eventos da Lista', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve preencher formulário ao editar item da lista', () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };

      const populateSpy = vi.spyOn(view.form, 'populate');

      // Simular evento da lista
      view.list.emit('edit', insumo);

      expect(populateSpy).toHaveBeenCalledWith(insumo);
    });

    it('deve propagar evento "delete-insumo" da lista', () => {
      const handler = vi.fn();
      view.on('delete', handler);

      const deleteData = 'insumo-1'; // Apenas o ID

      // Simular evento da lista
      view.list.emit('delete', deleteData);

      expect(handler).toHaveBeenCalledWith(deleteData);
    });
  });

  describe('Atualização de Lista', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve atualizar lista de insumos', () => {
      const insumos = [
        { id: 'insumo-1', nome: 'Farinha', unidade: 'kg', custoUnitario: 500 },
        { id: 'insumo-2', nome: 'Açúcar', unidade: 'kg', custoUnitario: 350 }
      ];

      const updateSpy = vi.spyOn(view.list, 'update');

      view.updateList(insumos);

      expect(updateSpy).toHaveBeenCalledWith(insumos);
    });
  });

  describe('Limpeza de Formulário', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve limpar formulário', () => {
      const clearSpy = vi.spyOn(view.form, 'clear');

      view.clearForm();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('Loading', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve mostrar loading overlay', () => {
      view.showLoading('Salvando...');

      const overlay = container.querySelector('#loading-overlay');
      expect(overlay.style.display).toBe('flex');
    });

    it('deve atualizar mensagem de loading', () => {
      view.showLoading('Carregando dados...');

      const text = container.querySelector('.loading-text');
      expect(text.textContent).toBe('Carregando dados...');
    });

    it('deve esconder loading overlay', () => {
      view.showLoading();
      view.hideLoading();

      const overlay = container.querySelector('#loading-overlay');
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('Toast', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve mostrar toast de sucesso', () => {
      view.showToast('Insumo cadastrado!', 'success');

      const toast = container.querySelector('#toast');
      const message = container.querySelector('.toast-message');

      expect(toast.style.display).toBe('block');
      expect(toast.classList.contains('toast-success')).toBe(true);
      expect(message.textContent).toBe('Insumo cadastrado!');
    });

    it('deve mostrar toast de erro', () => {
      view.showToast('Erro ao salvar', 'error');

      const toast = container.querySelector('#toast');
      expect(toast.classList.contains('toast-error')).toBe(true);
    });

    it('deve mostrar toast de info', () => {
      view.showToast('Informação', 'info');

      const toast = container.querySelector('#toast');
      expect(toast.classList.contains('toast-info')).toBe(true);
    });

    it('deve esconder toast após 3 segundos', async () => {
      vi.useFakeTimers();

      view.showToast('Mensagem', 'info');

      const toast = container.querySelector('#toast');
      expect(toast.style.display).toBe('block');

      // Avançar 3 segundos
      vi.advanceTimersByTime(3000);

      expect(toast.style.display).toBe('none');

      vi.useRealTimers();
    });
  });

  describe('Scroll', () => {
    beforeEach(() => {
      view = new InsumosView(container);
      // Mock scrollIntoView para JSDOM
      view.formContainer.scrollIntoView = vi.fn();
    });

    it('deve rolar até o formulário', () => {
      view.scrollToForm();

      expect(view.formContainer.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  describe('Destruição', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve destruir componentes ao destruir view', () => {
      const formDestroySpy = vi.spyOn(view.form, 'destroy');
      const listDestroySpy = vi.spyOn(view.list, 'destroy');

      view.destroy();

      expect(formDestroySpy).toHaveBeenCalled();
      expect(listDestroySpy).toHaveBeenCalled();
    });

    it('deve limpar container ao destruir', () => {
      view.destroy();

      expect(container.innerHTML).toBe('');
    });
  });

  describe('Integração Form-List', () => {
    beforeEach(() => {
      view = new InsumosView(container);
    });

    it('deve editar insumo da lista no formulário', () => {
      const insumo = {
        id: 'insumo-1',
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };

      // Simular clique em editar na lista
      view.list.emit('edit', insumo);

      // Verificar que formulário foi preenchido
      const nomeInput = container.querySelector('#nome');
      expect(nomeInput.value).toBe('Farinha');
    });
  });
});
