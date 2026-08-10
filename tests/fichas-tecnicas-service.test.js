/**
 * Testes para FichasTecnicasService
 * 
 * Valida:
 * - Criação de fichas técnicas com validação
 * - Atualização de fichas técnicas
 * - Remoção de fichas técnicas com verificação de referências
 * - Busca de fichas técnicas com filtros
 * - Cálculo de custos usando estoque atual
 * - Emissão de eventos
 * - Tratamento de erros
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FichasTecnicasService } from '../src/modules/fichas-tecnicas/services/FichasTecnicasService.js';
import { FichasTecnicasRepository } from '../src/modules/fichas-tecnicas/repositories/FichasTecnicasRepository.js';
import { FichaTecnica } from '../src/modules/fichas-tecnicas/models/FichaTecnica.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import { StateManager } from '../src/core/state/StateManager.js';
import { EventBus } from '../src/core/events/EventBus.js';

describe('FichasTecnicasService', () => {
  let service;
  let repository;
  let eventBus;
  let storage;
  let stateManager;
  let mockEstoqueRepository;

  beforeEach(async () => {
    // Criar instâncias frescas
    storage = new LocalStorageAdapter();
    stateManager = new StateManager(storage);
    eventBus = new EventBus();
    repository = new FichasTecnicasRepository(storage, stateManager);
    
    // Mock do EstoqueRepository
    mockEstoqueRepository = {
      getByInsumoId: vi.fn()
    };
    
    service = new FichasTecnicasService(repository, eventBus, mockEstoqueRepository);

    // Limpar storage
    await storage.clear('fichas');
    
    // Limpar event bus
    eventBus.clear();
  });

  describe('createFichaTecnica', () => {
    it('deve criar ficha técnica com dados válidos', async () => {
      const fichaData = {
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 1 },
          { insumoId: 'insumo-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades',
        modoPreparo: 'Misture e enrole'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(FichaTecnica);
      expect(result.data.nome).toBe('Brigadeiro');
      expect(result.data.id).toBeDefined();
    });

    it('deve gerar ID automaticamente se não fornecido', async () => {
      const fichaData = {
        nome: 'Beijinho',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.id).toMatch(/^ficha-/);
    });

    it('deve rejeitar ficha com nome vazio', async () => {
      const fichaData = {
        nome: '',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar ficha sem insumos', async () => {
      const fichaData = {
        nome: 'Brigadeiro',
        insumos: [],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.insumos).toBeDefined();
    });

    it('deve rejeitar ficha com rendimento zero', async () => {
      const fichaData = {
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 0,
        unidadeRendimento: 'unidades'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.rendimento).toBeDefined();
    });

    it('deve rejeitar ficha com rendimento negativo', async () => {
      const fichaData = {
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: -10,
        unidadeRendimento: 'unidades'
      };

      const result = await service.createFichaTecnica(fichaData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.rendimento).toBeDefined();
    });

    it('deve emitir evento ficha:criada', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('ficha:criada', eventSpy);

      const fichaData = {
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      };

      await service.createFichaTecnica(fichaData);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Brigadeiro',
          rendimento: 50
        }),
        'ficha:criada'
      );
    });
  });

  describe('updateFichaTecnica', () => {
    it('deve atualizar ficha técnica existente', async () => {
      // Criar ficha primeiro
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = await service.updateFichaTecnica(created.data.id, {
        nome: 'Brigadeiro Gourmet',
        rendimento: 60
      });

      expect(result.success).toBe(true);
      expect(result.data.nome).toBe('Brigadeiro Gourmet');
      expect(result.data.rendimento).toBe(60);
    });

    it('deve rejeitar atualização de ficha inexistente', async () => {
      const result = await service.updateFichaTecnica('nao-existe', {
        nome: 'Teste'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrada');
    });

    it('deve rejeitar atualização que torna ficha inválida', async () => {
      // Criar ficha primeiro
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = await service.updateFichaTecnica(created.data.id, {
        nome: '' // Nome vazio é inválido
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('deve emitir evento ficha:atualizada', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('ficha:atualizada', eventSpy);

      // Criar ficha primeiro
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.updateFichaTecnica(created.data.id, {
        rendimento: 60
      });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          rendimento: 60
        }),
        'ficha:atualizada'
      );
    });
  });

  describe('deleteFichaTecnica', () => {
    it('deve remover ficha técnica existente', async () => {
      // Criar ficha primeiro
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = await service.deleteFichaTecnica(created.data.id);

      expect(result.success).toBe(true);
      expect(result.message).toContain('removida com sucesso');

      // Verificar que foi removida
      const found = await service.getFichaTecnicaById(created.data.id);
      expect(found).toBeNull();
    });

    it('deve rejeitar remoção de ficha inexistente', async () => {
      const result = await service.deleteFichaTecnica('nao-existe');

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrada');
    });

    it('deve emitir evento ficha:removida', async () => {
      const eventSpy = vi.fn();
      eventBus.subscribe('ficha:removida', eventSpy);

      // Criar ficha primeiro
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.deleteFichaTecnica(created.data.id);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: created.data.id,
          nome: 'Brigadeiro'
        }),
        'ficha:removida'
      );
    });
  });

  describe('getFichaTecnicaById', () => {
    it('deve buscar ficha técnica por ID', async () => {
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const found = await service.getFichaTecnicaById(created.data.id);

      expect(found).toBeInstanceOf(FichaTecnica);
      expect(found.id).toBe(created.data.id);
      expect(found.nome).toBe('Brigadeiro');
    });

    it('deve retornar null se ficha não existe', async () => {
      const found = await service.getFichaTecnicaById('nao-existe');
      expect(found).toBeNull();
    });
  });

  describe('getAllFichasTecnicas', () => {
    it('deve retornar lista vazia se não há fichas', async () => {
      const all = await service.getAllFichasTecnicas();
      expect(all).toEqual([]);
    });

    it('deve retornar todas as fichas técnicas', async () => {
      await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.createFichaTecnica({
        nome: 'Beijinho',
        insumos: [{ insumoId: 'insumo-2', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const all = await service.getAllFichasTecnicas();
      expect(all).toHaveLength(2);
    });
  });

  describe('getFichasTecnicas (com filtros)', () => {
    beforeEach(async () => {
      // Criar algumas fichas para testar filtros
      await service.createFichaTecnica({
        nome: 'Brigadeiro Tradicional',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.createFichaTecnica({
        nome: 'Beijinho',
        insumos: [{ insumoId: 'insumo-2', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.createFichaTecnica({
        nome: 'Brigadeiro Gourmet',
        insumos: [{ insumoId: 'insumo-3', quantidade: 1 }],
        rendimento: 30,
        unidadeRendimento: 'unidades'
      });
    });

    it('deve retornar todas se não há filtros', async () => {
      const result = await service.getFichasTecnicas({});
      expect(result).toHaveLength(3);
    });

    it('deve filtrar por nome', async () => {
      const result = await service.getFichasTecnicas({ nome: 'Brigadeiro' });
      expect(result).toHaveLength(2);
    });

    it('deve filtrar por nome (case-insensitive)', async () => {
      const result = await service.getFichasTecnicas({ nome: 'brigadeiro' });
      expect(result).toHaveLength(2);
    });
  });

  describe('calculateCustos', () => {
    it('deve calcular custos usando estoque atual', async () => {
      // Criar ficha
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'insumo-1', quantidade: 1 },
          { insumoId: 'insumo-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      // Mock do estoque
      mockEstoqueRepository.getByInsumoId.mockImplementation((id) => {
        if (id === 'insumo-1') {
          return Promise.resolve({ custoMedioPonderado: 1000 }); // R$ 10,00
        }
        if (id === 'insumo-2') {
          return Promise.resolve({ custoMedioPonderado: 500 }); // R$ 5,00
        }
        return Promise.resolve(null);
      });

      const result = await service.calculateCustos(created.data.id);

      expect(result.success).toBe(true);
      expect(result.custoLote).toBe(1250); // 1*1000 + 0.5*500 = 1250 centavos
      expect(result.custoUnitario).toBe(25); // 1250/50 = 25 centavos por unidade
    });

    it('deve rejeitar se ficha não existe', async () => {
      const result = await service.calculateCustos('nao-existe');

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrada');
    });

    it('deve rejeitar se insumo não está no estoque', async () => {
      // Criar ficha
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      // Mock retorna null (insumo não encontrado)
      mockEstoqueRepository.getByInsumoId.mockResolvedValue(null);

      const result = await service.calculateCustos(created.data.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado no estoque');
    });

    it('deve rejeitar se EstoqueRepository não configurado', async () => {
      // Criar service sem EstoqueRepository
      const serviceWithoutEstoque = new FichasTecnicasService(repository, eventBus);

      const created = await serviceWithoutEstoque.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = await serviceWithoutEstoque.calculateCustos(created.data.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('não configurado');
    });
  });

  describe('Integration', () => {
    it('deve realizar fluxo completo: create → update → delete', async () => {
      // Create
      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });
      expect(created.success).toBe(true);

      // Update
      const updated = await service.updateFichaTecnica(created.data.id, {
        rendimento: 60
      });
      expect(updated.success).toBe(true);
      expect(updated.data.rendimento).toBe(60);

      // Delete
      const deleted = await service.deleteFichaTecnica(created.data.id);
      expect(deleted.success).toBe(true);

      // Verify deleted
      const found = await service.getFichaTecnicaById(created.data.id);
      expect(found).toBeNull();
    });

    it('deve emitir eventos em sequência', async () => {
      const events = [];
      
      eventBus.subscribe('ficha:criada', () => events.push('criada'));
      eventBus.subscribe('ficha:atualizada', () => events.push('atualizada'));
      eventBus.subscribe('ficha:removida', () => events.push('removida'));

      const created = await service.createFichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'insumo-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      await service.updateFichaTecnica(created.data.id, { rendimento: 60 });
      await service.deleteFichaTecnica(created.data.id);

      expect(events).toEqual(['criada', 'atualizada', 'removida']);
    });
  });
});
