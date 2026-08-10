import { describe, it, expect } from 'vitest';
import { Movimentacao } from '../src/modules/estoque/models/Movimentacao.js';

describe('Movimentacao Model', () => {
  describe('Constructor', () => {
    it('deve criar movimentação com todos os campos', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra',
        origemId: 'compra-1',
        observacoes: 'Primeira compra'
      });

      expect(mov.id).toBe('mov-1');
      expect(mov.insumoId).toBe('insumo-1');
      expect(mov.tipo).toBe('entrada');
      expect(mov.quantidade).toBe(10);
      expect(mov.custoUnitario).toBe(500);
      expect(mov.origem).toBe('compra');
      expect(mov.origemId).toBe('compra-1');
      expect(mov.observacoes).toBe('Primeira compra');
      expect(mov.criadoEm).toBeDefined();
    });

    it('deve criar movimentação com valores opcionais padrão', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'saida',
        quantidade: 5,
        custoUnitario: 500,
        origem: 'producao'
      });

      expect(mov.origemId).toBeNull();
      expect(mov.observacoes).toBe('');
    });
  });

  describe('calculateTotal', () => {
    it('deve calcular total corretamente', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      expect(mov.calculateTotal()).toBe(5000); // 10 * 500
    });

    it('deve calcular total com valores decimais', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 2.5,
        custoUnitario: 333,
        origem: 'compra'
      });

      expect(mov.calculateTotal()).toBe(832.5); // 2.5 * 333
    });

    it('deve retornar zero quando quantidade é zero', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 0,
        custoUnitario: 500,
        origem: 'ajuste'
      });

      expect(mov.calculateTotal()).toBe(0);
    });
  });

  describe('validate', () => {
    it('deve validar movimentação válida', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      const result = mov.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve rejeitar insumoId vazio', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: '',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      const result = mov.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumoId).toBe('ID do insumo é obrigatório');
    });

    it('deve rejeitar tipo inválido', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'invalido',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra'
      });

      const result = mov.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.tipo).toBe('Tipo deve ser "entrada" ou "saida"');
    });

    it('deve rejeitar quantidade inválida', () => {
      const mov1 = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 0,
        custoUnitario: 500,
        origem: 'compra'
      });

      const mov2 = new Movimentacao({
        id: 'mov-2',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: -10,
        custoUnitario: 500,
        origem: 'compra'
      });

      expect(mov1.validate().errors.quantidade).toBe('Quantidade deve ser um número positivo');
      expect(mov2.validate().errors.quantidade).toBe('Quantidade deve ser um número positivo');
    });

    it('deve rejeitar custo unitário inválido', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: -500,
        origem: 'compra'
      });

      const result = mov.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.custoUnitario).toBe('Custo unitário deve ser um número não-negativo');
    });

    it('deve rejeitar origem vazia', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: ''
      });

      const result = mov.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.origem).toBe('Origem é obrigatória');
    });

    it('deve retornar múltiplos erros', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: '',
        tipo: 'invalido',
        quantidade: -10,
        custoUnitario: -500,
        origem: ''
      });

      const result = mov.validate();

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(5);
    });
  });

  describe('toJSON e fromJSON', () => {
    it('deve serializar para JSON', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra',
        origemId: 'compra-1',
        observacoes: 'Teste'
      });

      const json = mov.toJSON();

      expect(json).toEqual({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 10,
        custoUnitario: 500,
        origem: 'compra',
        origemId: 'compra-1',
        observacoes: 'Teste',
        criadoEm: mov.criadoEm
      });
    });

    it('deve deserializar de JSON', () => {
      const json = {
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'saida',
        quantidade: 5,
        custoUnitario: 500,
        origem: 'producao',
        origemId: 'prod-1',
        observacoes: 'Produção de bolo',
        criadoEm: '2026-02-15T10:00:00.000Z'
      };

      const mov = Movimentacao.fromJSON(json);

      expect(mov.id).toBe('mov-1');
      expect(mov.tipo).toBe('saida');
      expect(mov.quantidade).toBe(5);
    });
  });

  describe('Integration - Diferentes tipos de movimentação', () => {
    it('deve criar movimentação de entrada por compra', () => {
      const mov = new Movimentacao({
        id: 'mov-1',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 50,
        custoUnitario: 1000,
        origem: 'compra',
        origemId: 'compra-123',
        observacoes: 'Compra do fornecedor ABC'
      });

      expect(mov.validate().valid).toBe(true);
      expect(mov.calculateTotal()).toBe(50000);
    });

    it('deve criar movimentação de saída por produção', () => {
      const mov = new Movimentacao({
        id: 'mov-2',
        insumoId: 'insumo-1',
        tipo: 'saida',
        quantidade: 20,
        custoUnitario: 1000,
        origem: 'producao',
        origemId: 'prod-456',
        observacoes: 'Produção de 10 bolos'
      });

      expect(mov.validate().valid).toBe(true);
      expect(mov.calculateTotal()).toBe(20000);
    });

    it('deve criar movimentação de ajuste manual', () => {
      const mov = new Movimentacao({
        id: 'mov-3',
        insumoId: 'insumo-1',
        tipo: 'entrada',
        quantidade: 5,
        custoUnitario: 0,
        origem: 'ajuste',
        observacoes: 'Ajuste de inventário'
      });

      expect(mov.validate().valid).toBe(true);
      expect(mov.calculateTotal()).toBe(0);
    });
  });
});
