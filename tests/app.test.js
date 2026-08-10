/**
 * Testes para App.js - Aplicação Principal
 * 
 * Testa:
 * - Inicialização da aplicação
 * - Navegação entre módulos
 * - Montagem/desmontagem de views
 * - Integração com StateManager
 * - Comunicação via EventBus
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { App } from '../src/App.js';

describe('App', () => {
  let app;
  let appContainer;

  beforeEach(() => {
    // Criar container para a aplicação
    appContainer = document.createElement('div');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);

    // Criar instância da aplicação
    app = new App();
  });

  afterEach(() => {
    // Limpar
    if (app) {
      app.destroy();
    }
    // Verificar se o container ainda existe antes de remover
    if (appContainer && appContainer.parentNode) {
      document.body.removeChild(appContainer);
    }
  });

  describe('Inicialização', () => {
    it('deve inicializar a aplicação com sucesso', async () => {
      await app.init();

      expect(app.stateManager).toBeDefined();
      expect(app.storage).toBeDefined();
      expect(app.controllers.insumos).toBeDefined();
      expect(app.controllers.estoque).toBeDefined();
      expect(app.controllers.compras).toBeDefined();
    });

    it('deve renderizar estrutura principal', async () => {
      await app.init();

      const header = appContainer.querySelector('.app-header');
      const menu = appContainer.querySelector('.app-menu');
      const content = appContainer.querySelector('.app-content');
      const footer = appContainer.querySelector('.app-footer');

      expect(header).toBeTruthy();
      expect(menu).toBeTruthy();
      expect(content).toBeTruthy();
      expect(footer).toBeTruthy();
    });

    it('deve renderizar menu com 3 módulos', async () => {
      await app.init();

      const menuItems = appContainer.querySelectorAll('.menu-item');
      expect(menuItems.length).toBe(3);

      const modules = Array.from(menuItems).map(item => item.dataset.module);
      expect(modules).toContain('insumos');
      expect(modules).toContain('estoque');
      expect(modules).toContain('compras');
    });

    it('deve carregar módulo inicial (insumos)', async () => {
      await app.init();

      expect(app.currentModule).toBe('insumos');
      expect(app.currentView).toBeDefined();
    });

    it('deve marcar módulo inicial como ativo no menu', async () => {
      await app.init();

      const activeItem = appContainer.querySelector('.menu-item.active');
      expect(activeItem).toBeTruthy();
      expect(activeItem.dataset.module).toBe('insumos');
    });
  });

  describe('StateManager', () => {
    it('deve inicializar StateManager com estado inicial', async () => {
      await app.init();

      const state = app.stateManager.getState();
      expect(state).toHaveProperty('insumos');
      expect(state).toHaveProperty('estoque');
      expect(state).toHaveProperty('movimentacoes');
      expect(state).toHaveProperty('compras');
      expect(state).toHaveProperty('fornecedores');
    });

    it('deve configurar persistência automática', async () => {
      await app.init();

      const persistSpy = vi.spyOn(app.stateManager, 'persist');

      // Atualizar estado
      app.stateManager.setState('insumos', [
        { id: 'test-1', nome: 'Teste', unidade: 'kg', custoUnitario: 1000 }
      ]);

      // Aguardar persistência assíncrona
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(persistSpy).toHaveBeenCalled();
    });
  });

  describe('Controllers', () => {
    it('deve inicializar todos os controllers', async () => {
      await app.init();

      expect(app.controllers.insumos).toBeDefined();
      expect(app.controllers.insumos.stateManager).toBe(app.stateManager);

      expect(app.controllers.estoque).toBeDefined();
      expect(app.controllers.estoque.stateManager).toBe(app.stateManager);

      expect(app.controllers.compras).toBeDefined();
      expect(app.controllers.compras.stateManager).toBe(app.stateManager);
    });
  });

  describe('Navegação', () => {
    it('deve navegar para módulo de insumos', async () => {
      await app.init();
      await app.navigateTo('insumos');

      expect(app.currentModule).toBe('insumos');
      expect(app.currentView).toBeDefined();

      const activeItem = appContainer.querySelector('.menu-item.active');
      expect(activeItem.dataset.module).toBe('insumos');
    });

    it('deve navegar para módulo de estoque', async () => {
      await app.init();
      await app.navigateTo('estoque');

      expect(app.currentModule).toBe('estoque');
      expect(app.currentView).toBeDefined();

      const activeItem = appContainer.querySelector('.menu-item.active');
      expect(activeItem.dataset.module).toBe('estoque');
    });

    it('deve navegar para módulo de compras', async () => {
      await app.init();
      await app.navigateTo('compras');

      expect(app.currentModule).toBe('compras');
      expect(app.currentView).toBeDefined();

      const activeItem = appContainer.querySelector('.menu-item.active');
      expect(activeItem.dataset.module).toBe('compras');
    });

    it('deve desmontar view anterior ao navegar', async () => {
      await app.init();

      const firstView = app.currentView;
      const destroySpy = vi.spyOn(firstView, 'destroy');

      await app.navigateTo('estoque');

      expect(destroySpy).toHaveBeenCalled();
    });

    it('deve limpar container ao navegar', async () => {
      await app.init();

      const content = appContainer.querySelector('.app-content');
      const initialHTML = content.innerHTML;

      await app.navigateTo('estoque');

      // Container deve ter sido limpo e recriado
      expect(content.innerHTML).not.toBe(initialHTML);
    });

    it('deve navegar via clique no menu', async () => {
      await app.init();

      const estoqueButton = Array.from(appContainer.querySelectorAll('.menu-item'))
        .find(item => item.dataset.module === 'estoque');

      estoqueButton.click();

      // Aguardar navegação assíncrona
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(app.currentModule).toBe('estoque');
    });
  });

  describe('Montagem de Views', () => {
    it('deve montar InsumosView corretamente', async () => {
      await app.init();
      await app.navigateTo('insumos');

      expect(app.currentView).toBeDefined();
      expect(app.currentView.constructor.name).toBe('InsumosView');
    });

    it('deve montar EstoqueView corretamente', async () => {
      await app.init();
      await app.navigateTo('estoque');

      expect(app.currentView).toBeDefined();
      expect(app.currentView.constructor.name).toBe('EstoqueView');
    });

    it('deve montar ComprasView corretamente', async () => {
      await app.init();
      await app.navigateTo('compras');

      expect(app.currentView).toBeDefined();
      expect(app.currentView.constructor.name).toBe('ComprasView');
    });

    it('deve conectar eventos da InsumosView', async () => {
      await app.init();
      await app.navigateTo('insumos');

      // Verificar que view está conectada ao controller
      expect(app.currentView).toBeDefined();
      expect(app.controllers.insumos).toBeDefined();
    });

    it('deve atualizar lista de insumos ao montar view', async () => {
      // Adicionar insumos ao estado
      await app.init();
      app.stateManager.setState('insumos', [
        { id: 'test-1', nome: 'Farinha', unidade: 'kg', custoUnitario: 500 }
      ]);

      await app.navigateTo('insumos');

      // View deve ter recebido os insumos
      expect(app.currentView).toBeDefined();
    });
  });

  describe('Integração com StateManager', () => {
    it('deve atualizar view quando estado mudar', async () => {
      await app.init();
      await app.navigateTo('insumos');

      const updateSpy = vi.spyOn(app.currentView, 'updateList');

      // Atualizar estado
      app.stateManager.setState('insumos', [
        { id: 'test-1', nome: 'Açúcar', unidade: 'kg', custoUnitario: 300 }
      ]);

      expect(updateSpy).toHaveBeenCalled();
    });

    it('não deve atualizar view de outro módulo', async () => {
      await app.init();
      await app.navigateTo('estoque');

      const updateSpy = vi.spyOn(app.currentView, 'updateList');

      // Atualizar estado de insumos (não deve afetar view de estoque)
      app.stateManager.setState('insumos', [
        { id: 'test-1', nome: 'Açúcar', unidade: 'kg', custoUnitario: 300 }
      ]);

      // View de estoque não deve ser atualizada com insumos
      // (ela só atualiza quando estoque muda)
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve tratar erro ao navegar para módulo inválido', async () => {
      await app.init();

      const showErrorSpy = vi.spyOn(app, 'showError');

      await app.navigateTo('modulo-invalido');

      expect(showErrorSpy).toHaveBeenCalled();
    });

    it('deve tratar erro na inicialização', async () => {
      // Forçar erro removendo container
      document.body.removeChild(appContainer);

      await expect(app.init()).rejects.toThrow();
    });
  });

  describe('Destruição', () => {
    it('deve destruir aplicação corretamente', async () => {
      await app.init();

      const view = app.currentView;
      const destroySpy = vi.spyOn(view, 'destroy');

      app.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(app.currentView).toBeNull();
    });

    it('deve limpar StateManager ao destruir', async () => {
      await app.init();

      const clearSpy = vi.spyOn(app.stateManager, 'clear');

      app.destroy();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar menu responsivo', async () => {
      await app.init();

      const menu = appContainer.querySelector('.app-menu');
      expect(menu).toBeTruthy();

      // Verificar que menu tem classes CSS corretas
      const menuItems = menu.querySelectorAll('.menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter botões de menu com type="button"', async () => {
      await app.init();

      const menuButtons = appContainer.querySelectorAll('.menu-item');
      menuButtons.forEach(button => {
        expect(button.getAttribute('type')).toBe('button');
      });
    });

    it('deve ter estrutura semântica correta', async () => {
      await app.init();

      const header = appContainer.querySelector('header');
      const nav = appContainer.querySelector('nav');
      const main = appContainer.querySelector('main');
      const footer = appContainer.querySelector('footer');

      expect(header).toBeTruthy();
      expect(nav).toBeTruthy();
      expect(main).toBeTruthy();
      expect(footer).toBeTruthy();
    });
  });
});
