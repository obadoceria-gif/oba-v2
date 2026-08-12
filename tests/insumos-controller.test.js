/**
 * Testes para InsumosController
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsumosController } from '../src/modules/insumos/controllers/InsumosController.js';

describe('InsumosController', () => {
  let controller;
  let mockService;
  let mockView;
  let mockToast;
  let mockLoading;

  beforeEach(() => {
    // Mock do service
    mockService = {
      createInsumo: vi.fn(),
      updateInsumo: vi.fn(),
      deleteInsumo: vi.fn(),
      getInsumoById: vi.fn(),
      getAllInsumos: vi.fn(),
      getInsumos: vi.fn()
    };

    // Mock da view
    mockView = {
      on: vi.fn(),
      off: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      clearForm: vi.fn(),
      renderInsumosList: vi.fn(),
      populateForm: vi.fn(),
      confirm: vi.fn()
    };

    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    };

    mockLoading = {
      show: vi.fn(() => 'loading-test'),
      hide: vi.fn()
    };

    controller = new InsumosController(mockService, mockView);
    controller.toast = mockToast;
    controller.loading = mockLoading;
  });

  describe('Constructor', () => {
    it('deve criar controller com service e view', () => {
      expect(controller.service).toBe(mockService);
      expect(controller.view).toBe(mockView);
    });

    it('deve lançar erro se service não for fornecido', () => {
      expect(() => new InsumosController(null, mockView))
        .toThrow('InsumosService é obrigatório');
    });

    it('deve lançar erro se view não for fornecida', () => {
      expect(() => new InsumosController(mockService, null))
        .toThrow('InsumosView é obrigatório');
    });

    it('deve registrar event handlers na view', () => {
      expect(mockView.on).toHaveBeenCalledWith('create', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('update', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('delete', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('filter', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('load', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('select', expect.any(Function));
      expect(mockView.on).toHaveBeenCalledWith('cancel', expect.any(Function));
    });
  });

  describe('handleCreateInsumo', () => {
    it('deve criar insumo com sucesso', async () => {
      const insumoData = {
        nome: 'Farinha',
        unidade: 'kg',
        custoUnitario: 500
      };
      const insumo = { id: '1', ...insumoData };

      // Service retorna { success: true, data: insumo }
      mockService.createInsumo.mockResolvedValue({ success: true, data: insumo });
      mockService.getAllInsumos.mockResolvedValue([insumo]);

      const result = await controller.handleCreateInsumo(insumoData);

      expect(controller.loading.show).toHaveBeenCalledWith('Criando insumo...');
      expect(mockService.createInsumo).toHaveBeenCalledWith(insumoData);
      expect(controller.loading.hide).toHaveBeenCalled();
      expect(controller.toast.success).toHaveBeenCalledWith('Insumo criado com sucesso!');
      expect(mockView.clearForm).toHaveBeenCalled();
      expect(mockService.getAllInsumos).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: insumo });
    });

    it('deve mostrar erro se criação falhar', async () => {
      const error = new Error('Erro de validação');
      mockService.createInsumo.mockRejectedValue(error);

      await expect(controller.handleCreateInsumo({}))
        .rejects.toThrow('Erro de validação');

      expect(controller.loading.hide).toHaveBeenCalled();
      expect(controller.toast.error).toHaveBeenCalledWith('Erro de validação');
    });
  });

  describe('handleUpdateInsumo', () => {
    it('deve atualizar insumo com sucesso', async () => {
      const updateData = {
        id: '1',
        data: { nome: 'Farinha Atualizada' }
      };
      const insumo = { id: '1', nome: 'Farinha Atualizada' };

      mockService.updateInsumo.mockResolvedValue({ success: true, data: insumo });
      mockService.getAllInsumos.mockResolvedValue([insumo]);

      const result = await controller.handleUpdateInsumo(updateData);

      expect(controller.loading.show).toHaveBeenCalledWith('Atualizando insumo...');
      expect(mockService.updateInsumo).toHaveBeenCalledWith('1', { nome: 'Farinha Atualizada' });
      expect(controller.loading.hide).toHaveBeenCalled();
      expect(controller.toast.success).toHaveBeenCalledWith('Insumo atualizado com sucesso!');
      expect(mockView.clearForm).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: insumo });
    });

    it('deve mostrar erro se atualização falhar', async () => {
      const error = new Error('Insumo não encontrado');
      mockService.updateInsumo.mockRejectedValue(error);

      await expect(controller.handleUpdateInsumo('1', {}))
        .rejects.toThrow('Insumo não encontrado');

      expect(controller.toast.error).toHaveBeenCalledWith('Insumo não encontrado');
    });
  });

  describe('handleDeleteInsumo', () => {
    it('deve remover insumo com sucesso após confirmação', async () => {
      const id = '1';
      mockView.confirm.mockResolvedValue(true);
      mockService.deleteInsumo.mockResolvedValue(undefined);
      mockService.getAllInsumos.mockResolvedValue([]);

      await controller.handleDeleteInsumo(id);

      expect(mockView.confirm).toHaveBeenCalledWith(
        'Tem certeza que deseja remover este insumo?'
      );
      expect(controller.loading.show).toHaveBeenCalledWith('Removendo insumo...');
      expect(mockService.deleteInsumo).toHaveBeenCalledWith(id);
      expect(controller.toast.success).toHaveBeenCalledWith('Insumo removido com sucesso!');
    });

    it('não deve remover se usuário cancelar', async () => {
      mockView.confirm.mockResolvedValue(false);

      await controller.handleDeleteInsumo('1');

      expect(mockService.deleteInsumo).not.toHaveBeenCalled();
      expect(controller.toast.success).not.toHaveBeenCalled();
    });

    it('deve mostrar erro se remoção falhar', async () => {
      const error = new Error('Insumo possui referências');
      mockView.confirm.mockResolvedValue(true);
      mockService.deleteInsumo.mockRejectedValue(error);

      await expect(controller.handleDeleteInsumo('1'))
        .rejects.toThrow('Insumo possui referências');

      expect(controller.toast.error).toHaveBeenCalledWith('Insumo possui referências');
    });
  });

  describe('handleFilterChange', () => {
    it('deve filtrar insumos com sucesso', async () => {
      const filters = { nome: 'Farinha' };
      const insumos = [{ id: '1', nome: 'Farinha' }];

      mockService.getInsumos.mockResolvedValue(insumos);

      await controller.handleFilterChange(filters);

      expect(controller.loading.show).toHaveBeenCalledWith('Filtrando insumos...');
      expect(mockService.getInsumos).toHaveBeenCalledWith(filters);
      expect(mockView.renderInsumosList).toHaveBeenCalledWith(insumos);
    });

    it('deve mostrar erro se filtro falhar', async () => {
      const error = new Error('Erro ao filtrar');
      mockService.getInsumos.mockRejectedValue(error);

      await expect(controller.handleFilterChange({}))
        .rejects.toThrow('Erro ao filtrar');

      expect(controller.toast.error).toHaveBeenCalledWith('Erro ao filtrar');
    });
  });

  describe('handleLoadInsumos', () => {
    it('deve carregar todos os insumos', async () => {
      const insumos = [
        { id: '1', nome: 'Farinha' },
        { id: '2', nome: 'Açúcar' }
      ];

      mockService.getAllInsumos.mockResolvedValue(insumos);

      const result = await controller.handleLoadInsumos();

      expect(controller.loading.show).toHaveBeenCalledWith('Carregando insumos...');
      expect(mockService.getAllInsumos).toHaveBeenCalled();
      expect(mockView.renderInsumosList).toHaveBeenCalledWith(insumos);
      expect(result).toEqual(insumos);
    });

    it('deve mostrar erro se carregamento falhar', async () => {
      const error = new Error('Erro ao carregar');
      mockService.getAllInsumos.mockRejectedValue(error);

      await expect(controller.handleLoadInsumos())
        .rejects.toThrow('Erro ao carregar');

      expect(controller.toast.error).toHaveBeenCalledWith('Erro ao carregar');
    });
  });

  describe('handleSelectInsumo', () => {
    it('deve selecionar insumo para edição', async () => {
      const insumo = { id: '1', nome: 'Farinha' };
      mockService.getInsumoById.mockResolvedValue(insumo);

      await controller.handleSelectInsumo('1');

      expect(mockService.getInsumoById).toHaveBeenCalledWith('1');
      expect(mockView.populateForm).toHaveBeenCalledWith(insumo);
    });

    it('deve mostrar erro se insumo não for encontrado', async () => {
      mockService.getInsumoById.mockResolvedValue(null);

      await controller.handleSelectInsumo('999');

      expect(controller.toast.error).toHaveBeenCalledWith('Insumo não encontrado');
      expect(mockView.populateForm).not.toHaveBeenCalled();
    });

    it('deve mostrar erro se busca falhar', async () => {
      const error = new Error('Erro ao buscar');
      mockService.getInsumoById.mockRejectedValue(error);

      await expect(controller.handleSelectInsumo('1'))
        .rejects.toThrow('Erro ao buscar');

      expect(controller.toast.error).toHaveBeenCalledWith('Erro ao buscar');
    });
  });

  describe('handleCancelEdit', () => {
    it('deve limpar formulário', () => {
      controller.handleCancelEdit();

      expect(mockView.clearForm).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('deve carregar insumos na inicialização', async () => {
      const insumos = [{ id: '1', nome: 'Farinha' }];
      mockService.getAllInsumos.mockResolvedValue(insumos);

      await controller.initialize();

      expect(mockService.getAllInsumos).toHaveBeenCalled();
      expect(mockView.renderInsumosList).toHaveBeenCalledWith(insumos);
    });

    it('deve mostrar erro se inicialização falhar', async () => {
      const error = new Error('Erro ao inicializar');
      mockService.getAllInsumos.mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await controller.initialize();

      expect(consoleSpy).toHaveBeenCalled();
      expect(controller.toast.error).toHaveBeenCalledWith('Erro ao inicializar módulo de insumos');
      
      consoleSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('deve remover event handlers', () => {
      controller.destroy();

      expect(mockView.off).toHaveBeenCalledWith('create', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('update', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('delete', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('filter', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('load', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('select', expect.any(Function));
      expect(mockView.off).toHaveBeenCalledWith('cancel', expect.any(Function));
    });
  });

  describe('Integration Tests', () => {
    it('deve executar fluxo completo: criar â†’ listar â†’ editar â†’ remover', async () => {
      const insumoData = { nome: 'Farinha', unidade: 'kg', custoUnitario: 500 };
      const insumo = { id: '1', ...insumoData };
      const insumoAtualizado = { ...insumo, nome: 'Farinha Premium' };

      // Criar - service retorna { success: true, data: insumo }
      mockService.createInsumo.mockResolvedValue({ success: true, data: insumo });
      mockService.getAllInsumos.mockResolvedValue([insumo]);
      await controller.handleCreateInsumo(insumoData);

      // Selecionar para editar
      mockService.getInsumoById.mockResolvedValue(insumo);
      await controller.handleSelectInsumo('1');

      // Atualizar - service retorna { success: true, data: insumoAtualizado }
      mockService.updateInsumo.mockResolvedValue({ success: true, data: insumoAtualizado });
      mockService.getAllInsumos.mockResolvedValue([insumoAtualizado]);
      await controller.handleUpdateInsumo({ id: '1', data: { nome: 'Farinha Premium' } });

      // Remover
      mockView.confirm.mockResolvedValue(true);
      mockService.deleteInsumo.mockResolvedValue(undefined);
      mockService.getAllInsumos.mockResolvedValue([]);
      await controller.handleDeleteInsumo('1');

      // Verificar chamadas
      expect(mockService.createInsumo).toHaveBeenCalled();
      expect(mockService.getInsumoById).toHaveBeenCalled();
      expect(mockService.updateInsumo).toHaveBeenCalled();
      expect(mockService.deleteInsumo).toHaveBeenCalled();
      expect(mockService.getAllInsumos).toHaveBeenCalledTimes(3);
    });
  });
});



