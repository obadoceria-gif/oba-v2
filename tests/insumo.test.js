/**
 * Testes para Insumo Model
 * 
 * Valida:
 * - Criação de insumos
 * - Validação de campos obrigatórios
 * - Serialização toJSON
 * - Atualização de dados
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Insumo } from '../src/modules/insumos/models/Insumo.js';

describe('Insumo Model', () => {
  describe('Constructor', () => {
    it('deve criar insumo com dados válidos', () => {
      const data = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850, // R$ 8,50
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10,
        observacoes: 'Tipo 1'
      };

      const insumo = new Insumo(data);

      expect(insumo.id).toBe('insumo-1');
      expect(insumo.nome).toBe('Farinha de Trigo');
      expect(insumo.unidade).toBe('kg');
      expect(insumo.custoUnitario).toBe(850);
      expect(insumo.fornecedor).toBe('Fornecedor A');
      expect(insumo.estoqueMinimo).toBe(10);
      expect(insumo.observacoes).toBe('Tipo 1');
      expect(insumo.criadoEm).toBeDefined();
      expect(insumo.atualizadoEm).toBeDefined();
    });

    it('deve criar insumo com valores padrão quando dados não fornecidos', () => {
      const insumo = new Insumo();

      expect(insumo.id).toBe('');
      expect(insumo.nome).toBe('');
      expect(insumo.unidade).toBe('');
      expect(insumo.custoUnitario).toBe(0);
      expect(insumo.fornecedor).toBe('');
      expect(insumo.estoqueMinimo).toBe(0);
      expect(insumo.observacoes).toBe('');
      expect(insumo.criadoEm).toBeDefined();
      expect(insumo.atualizadoEm).toBeDefined();
    });

    it('deve preservar timestamps fornecidos', () => {
      const criadoEm = '2026-01-01T00:00:00.000Z';
      const atualizadoEm = '2026-01-02T00:00:00.000Z';

      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500,
        criadoEm,
        atualizadoEm
      });

      expect(insumo.criadoEm).toBe(criadoEm);
      expect(insumo.atualizadoEm).toBe(atualizadoEm);
    });
  });

  describe('validate', () => {
    it('deve validar insumo com dados corretos', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve rejeitar insumo sem ID', () => {
      const insumo = new Insumo({
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.id).toBeDefined();
    });

    it('deve rejeitar insumo sem nome', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        unidade: 'kg',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar nome muito curto (< 2 caracteres)', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'A',
        unidade: 'kg',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar nome muito longo (> 100 caracteres)', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'A'.repeat(101),
        unidade: 'kg',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar insumo sem unidade', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.unidade).toBeDefined();
    });

    it('deve rejeitar unidade inválida', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'litros', // Deve ser 'L'
        custoUnitario: 500
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.unidade).toBeDefined();
    });

    it('deve aceitar todas as unidades válidas', () => {
      const unidadesValidas = ['kg', 'g', 'L', 'ml', 'un'];

      unidadesValidas.forEach(unidade => {
        const insumo = new Insumo({
          id: 'insumo-1',
          nome: 'Teste',
          unidade,
          custoUnitario: 500
        });

        const result = insumo.validate();
        expect(result.valid).toBe(true);
      });
    });

    it('deve rejeitar custo unitário negativo', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: -100
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.custoUnitario).toBeDefined();
    });

    it('deve aceitar custo unitário zero', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 0
      });

      const result = insumo.validate();

      expect(result.valid).toBe(true);
    });

    it('deve rejeitar estoque mínimo negativo', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500,
        estoqueMinimo: -5
      });

      const result = insumo.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.estoqueMinimo).toBeDefined();
    });

    it('deve aceitar estoque mínimo zero', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500,
        estoqueMinimo: 0
      });

      const result = insumo.validate();

      expect(result.valid).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('deve serializar insumo para JSON', () => {
      const data = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        marca: '',
        unidade: 'kg',
        quantidadePorEmbalagem: 0,
        custoUnitario: 850,
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10,
        observacoes: 'Tipo 1',
        criadoEm: '2026-01-01T00:00:00.000Z',
        atualizadoEm: '2026-01-02T00:00:00.000Z'
      };

      const insumo = new Insumo(data);
      const json = insumo.toJSON();

      expect(json).toEqual(data);
    });

    it('deve incluir todos os campos no JSON', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const json = insumo.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('nome');
      expect(json).toHaveProperty('unidade');
      expect(json).toHaveProperty('custoUnitario');
      expect(json).toHaveProperty('fornecedor');
      expect(json).toHaveProperty('estoqueMinimo');
      expect(json).toHaveProperty('observacoes');
      expect(json).toHaveProperty('criadoEm');
      expect(json).toHaveProperty('atualizadoEm');
    });
  });

  describe('fromJSON', () => {
    it('deve criar insumo a partir de JSON', () => {
      const json = {
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850,
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10,
        observacoes: 'Tipo 1',
        criadoEm: '2026-01-01T00:00:00.000Z',
        atualizadoEm: '2026-01-02T00:00:00.000Z'
      };

      const insumo = Insumo.fromJSON(json);

      expect(insumo).toBeInstanceOf(Insumo);
      expect(insumo.id).toBe(json.id);
      expect(insumo.nome).toBe(json.nome);
      expect(insumo.unidade).toBe(json.unidade);
      expect(insumo.custoUnitario).toBe(json.custoUnitario);
      expect(insumo.fornecedor).toBe(json.fornecedor);
      expect(insumo.estoqueMinimo).toBe(json.estoqueMinimo);
      expect(insumo.observacoes).toBe(json.observacoes);
      expect(insumo.criadoEm).toBe(json.criadoEm);
      expect(insumo.atualizadoEm).toBe(json.atualizadoEm);
    });
  });

  describe('update', () => {
    it('deve atualizar campos do insumo', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const atualizadoEmAntes = insumo.atualizadoEm;

      // Aguardar 1ms para garantir timestamp diferente
      setTimeout(() => {
        insumo.update({
          nome: 'Açúcar Refinado',
          custoUnitario: 600,
          fornecedor: 'Fornecedor B'
        });

        expect(insumo.nome).toBe('Açúcar Refinado');
        expect(insumo.custoUnitario).toBe(600);
        expect(insumo.fornecedor).toBe('Fornecedor B');
        expect(insumo.unidade).toBe('kg'); // Não alterado
        expect(insumo.atualizadoEm).not.toBe(atualizadoEmAntes);
      }, 1);
    });

    it('deve atualizar apenas campos fornecidos', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500,
        fornecedor: 'Fornecedor A'
      });

      insumo.update({
        custoUnitario: 600
      });

      expect(insumo.nome).toBe('Açúcar'); // Não alterado
      expect(insumo.custoUnitario).toBe(600); // Alterado
      expect(insumo.fornecedor).toBe('Fornecedor A'); // Não alterado
    });

    it('deve atualizar timestamp atualizadoEm', () => {
      const insumo = new Insumo({
        id: 'insumo-1',
        nome: 'Açúcar',
        unidade: 'kg',
        custoUnitario: 500
      });

      const atualizadoEmAntes = insumo.atualizadoEm;

      // Aguardar para garantir timestamp diferente
      setTimeout(() => {
        insumo.update({ custoUnitario: 600 });
        expect(insumo.atualizadoEm).not.toBe(atualizadoEmAntes);
      }, 1);
    });
  });

  describe('Integration', () => {
    it('deve criar, validar, serializar e deserializar insumo', () => {
      // Criar
      const insumo1 = new Insumo({
        id: 'insumo-1',
        nome: 'Farinha de Trigo',
        unidade: 'kg',
        custoUnitario: 850,
        fornecedor: 'Fornecedor A',
        estoqueMinimo: 10
      });

      // Validar
      const validation = insumo1.validate();
      expect(validation.valid).toBe(true);

      // Serializar
      const json = insumo1.toJSON();
      expect(json.nome).toBe('Farinha de Trigo');

      // Deserializar
      const insumo2 = Insumo.fromJSON(json);
      expect(insumo2).toBeInstanceOf(Insumo);
      expect(insumo2.nome).toBe(insumo1.nome);
      expect(insumo2.custoUnitario).toBe(insumo1.custoUnitario);
    });
  });
});
