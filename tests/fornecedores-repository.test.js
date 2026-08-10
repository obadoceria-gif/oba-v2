/**
 * Testes para FornecedoresRepository
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FornecedoresRepository } from '../src/modules/compras/repositories/FornecedoresRepository.js';
import { Fornecedor } from '../src/modules/compras/models/Fornecedor.js';
import LocalStorageAdapter from '../src/core/storage/LocalStorageAdapter.js';
import StateManager from '../src/core/state/StateManager.js';

describe('FornecedoresRepository', () => {
  let repository;
  let storage;
  let stateManager;

  beforeEach(async () => {
    // Limpar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Criar instâncias
    storage = new LocalStorageAdapter('test_fornecedores');
    await storage.init();
    stateManager = new StateManager(storage);
    repository = new FornecedoresRepository(storage, stateManager);

    // Limpar dados
    const allFornecedores = await repository.getAll();
    for (const fornecedor of allFornecedores) {
      await repository.delete(fornecedor.id);
    }
  });

  describe('Construtor', () => {
    it('deve criar repository com storage e stateManager', () => {
      expect(repository).toBeDefined();
      expect(repository.storage).toBe(storage);
      expect(repository.stateManager).toBe(stateManager);
      expect(repository.storeName).toBe('fornecedores');
    });

    it('deve lançar erro se storage não for fornecido', () => {
      expect(() => new FornecedoresRepository(null, stateManager))
        .toThrow('Storage é obrigatório');
    });

    it('deve lançar erro se stateManager não for fornecido', () => {
      expect(() => new FornecedoresRepository(storage, null))
        .toThrow('StateManager é obrigatório');
    });
  });

  describe('save', () => {
    it('deve salvar fornecedor válido', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste',
        telefone: '(11) 98765-4321',
        email: 'teste@fornecedor.com'
      });

      const saved = await repository.save(fornecedor);

      expect(saved).toBeInstanceOf(Fornecedor);
      expect(saved.id).toBe(fornecedor.id);
      expect(saved.nome).toBe('Fornecedor Teste');
    });

    it('deve lançar erro se fornecedor não for instância de Fornecedor', async () => {
      await expect(repository.save({ nome: 'test' }))
        .rejects.toThrow('Fornecedor inválido');
    });

    it('deve lançar erro se fornecedor com mesmo nome já existir', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor Duplicado'
      });

      await repository.save(fornecedor1);

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor Duplicado'
      });

      await expect(repository.save(fornecedor2))
        .rejects.toThrow('Fornecedor com nome "Fornecedor Duplicado" já existe');
    });

    it('deve ignorar case ao verificar duplicatas', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await repository.save(fornecedor1);

      const fornecedor2 = new Fornecedor({
        nome: 'FORNECEDOR TESTE'
      });

      await expect(repository.save(fornecedor2))
        .rejects.toThrow('já existe');
    });

    it('deve atualizar state após salvar', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor State'
      });

      await repository.save(fornecedor);

      const state = stateManager.getState('fornecedores');
      expect(state).toHaveLength(1);
      expect(state[0].id).toBe(fornecedor.id);
    });
  });

  describe('getById', () => {
    it('deve buscar fornecedor por ID', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Busca'
      });

      await repository.save(fornecedor);

      const found = await repository.getById(fornecedor.id);

      expect(found).toBeInstanceOf(Fornecedor);
      expect(found.id).toBe(fornecedor.id);
      expect(found.nome).toBe('Fornecedor Busca');
    });

    it('deve retornar null se fornecedor não existir', async () => {
      const found = await repository.getById('id_inexistente');
      expect(found).toBeNull();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.getById(null))
        .rejects.toThrow('id é obrigatório');
    });
  });

  describe('getAll', () => {
    it('deve retornar array vazio se não houver fornecedores', async () => {
      const fornecedores = await repository.getAll();
      expect(fornecedores).toEqual([]);
    });

    it('deve retornar todos os fornecedores', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor 1'
      });

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor 2'
      });

      await repository.save(fornecedor1);
      await repository.save(fornecedor2);

      const fornecedores = await repository.getAll();

      expect(fornecedores).toHaveLength(2);
      expect(fornecedores[0]).toBeInstanceOf(Fornecedor);
      expect(fornecedores[1]).toBeInstanceOf(Fornecedor);
    });

    it('deve retornar fornecedores ativos e inativos', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor Ativo',
        ativo: true
      });

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor Inativo',
        ativo: false
      });

      await repository.save(fornecedor1);
      await repository.save(fornecedor2);

      const fornecedores = await repository.getAll();

      expect(fornecedores).toHaveLength(2);
    });
  });

  describe('getAtivos', () => {
    it('deve retornar apenas fornecedores ativos', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor Ativo 1',
        ativo: true
      });

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor Inativo',
        ativo: false
      });

      const fornecedor3 = new Fornecedor({
        nome: 'Fornecedor Ativo 2',
        ativo: true
      });

      await repository.save(fornecedor1);
      await repository.save(fornecedor2);
      await repository.save(fornecedor3);

      const ativos = await repository.getAtivos();

      expect(ativos).toHaveLength(2);
      expect(ativos.every(f => f.ativo)).toBe(true);
    });

    it('deve retornar array vazio se não houver fornecedores ativos', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Inativo',
        ativo: false
      });

      await repository.save(fornecedor);

      const ativos = await repository.getAtivos();

      expect(ativos).toEqual([]);
    });
  });

  describe('update', () => {
    it('deve atualizar fornecedor existente', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Original',
        telefone: '(11) 98765-4321'
      });

      await repository.save(fornecedor);

      // Atualizar telefone
      fornecedor.telefone = '(11) 91234-5678';

      const updated = await repository.update(fornecedor.id, fornecedor);

      expect(updated.telefone).toBe('(11) 91234-5678');

      // Verificar no storage
      const found = await repository.getById(fornecedor.id);
      expect(found.telefone).toBe('(11) 91234-5678');
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await expect(repository.update(null, fornecedor))
        .rejects.toThrow('id é obrigatório');
    });

    it('deve lançar erro se fornecedor não for instância de Fornecedor', async () => {
      await expect(repository.update('id_test', { nome: 'teste' }))
        .rejects.toThrow('Fornecedor inválido');
    });

    it('deve lançar erro se fornecedor não existir', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await expect(repository.update('id_inexistente', fornecedor))
        .rejects.toThrow('Fornecedor id_inexistente não encontrado');
    });

    it('deve permitir atualizar para mesmo nome', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste',
        telefone: '(11) 98765-4321'
      });

      await repository.save(fornecedor);

      // Atualizar apenas telefone, mantendo nome
      fornecedor.telefone = '(11) 91234-5678';

      const updated = await repository.update(fornecedor.id, fornecedor);

      expect(updated.nome).toBe('Fornecedor Teste');
      expect(updated.telefone).toBe('(11) 91234-5678');
    });

    it('deve lançar erro se tentar atualizar para nome já existente', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor 1'
      });

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor 2'
      });

      await repository.save(fornecedor1);
      await repository.save(fornecedor2);

      // Tentar atualizar fornecedor2 para nome de fornecedor1
      fornecedor2.nome = 'Fornecedor 1';

      await expect(repository.update(fornecedor2.id, fornecedor2))
        .rejects.toThrow('Fornecedor com nome "Fornecedor 1" já existe');
    });

    it('deve atualizar atualizadoEm', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await repository.save(fornecedor);

      const atualizadoEmAntes = fornecedor.atualizadoEm;

      // Aguardar 10ms para garantir diferença no timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      fornecedor.telefone = '(11) 98765-4321';
      await repository.update(fornecedor.id, fornecedor);

      const found = await repository.getById(fornecedor.id);
      expect(found.atualizadoEm).not.toBe(atualizadoEmAntes);
    });
  });

  describe('delete', () => {
    it('deve remover fornecedor existente', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Remover'
      });

      await repository.save(fornecedor);

      await repository.delete(fornecedor.id);

      const found = await repository.getById(fornecedor.id);
      expect(found).toBeNull();
    });

    it('deve lançar erro se ID não for fornecido', async () => {
      await expect(repository.delete(null))
        .rejects.toThrow('id é obrigatório');
    });

    it('deve lançar erro se fornecedor não existir', async () => {
      await expect(repository.delete('id_inexistente'))
        .rejects.toThrow('Fornecedor id_inexistente não encontrado');
    });

    it('deve atualizar state após remover', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor State'
      });

      await repository.save(fornecedor);
      await repository.delete(fornecedor.id);

      const state = stateManager.getState('fornecedores');
      expect(state).toHaveLength(0);
    });
  });

  describe('findByNome', () => {
    it('deve buscar fornecedor por nome exato', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Específico'
      });

      await repository.save(fornecedor);

      const found = await repository.findByNome('Fornecedor Específico');

      expect(found).toBeInstanceOf(Fornecedor);
      expect(found.nome).toBe('Fornecedor Específico');
    });

    it('deve ignorar case na busca', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await repository.save(fornecedor);

      const found = await repository.findByNome('FORNECEDOR TESTE');

      expect(found).toBeInstanceOf(Fornecedor);
      expect(found.nome).toBe('Fornecedor Teste');
    });

    it('deve retornar null se fornecedor não existir', async () => {
      const found = await repository.findByNome('Fornecedor Inexistente');
      expect(found).toBeNull();
    });

    it('deve retornar null se nome não for fornecido', async () => {
      const found = await repository.findByNome(null);
      expect(found).toBeNull();
    });
  });

  describe('searchByNome', () => {
    it('deve buscar fornecedores por nome parcial', async () => {
      const fornecedor1 = new Fornecedor({
        nome: 'Fornecedor ABC'
      });

      const fornecedor2 = new Fornecedor({
        nome: 'Fornecedor XYZ'
      });

      const fornecedor3 = new Fornecedor({
        nome: 'Outro Fornecedor ABC'
      });

      await repository.save(fornecedor1);
      await repository.save(fornecedor2);
      await repository.save(fornecedor3);

      const results = await repository.searchByNome('ABC');

      expect(results).toHaveLength(2);
      expect(results.every(f => f.nome.includes('ABC'))).toBe(true);
    });

    it('deve ignorar case na busca', async () => {
      const fornecedor = new Fornecedor({
        nome: 'Fornecedor Teste'
      });

      await repository.save(fornecedor);

      const results = await repository.searchByNome('teste');

      expect(results).toHaveLength(1);
      expect(results[0].nome).toBe('Fornecedor Teste');
    });

    it('deve retornar array vazio se não encontrar resultados', async () => {
      const results = await repository.searchByNome('Inexistente');
      expect(results).toEqual([]);
    });

    it('deve retornar array vazio se termo não for fornecido', async () => {
      const results = await repository.searchByNome(null);
      expect(results).toEqual([]);
    });
  });
});
