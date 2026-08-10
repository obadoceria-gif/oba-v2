import { describe, it, expect, beforeEach } from 'vitest';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';

describe('Estoque Model', () => {
  describe('Constructor', () => {
    it('deve criar estoque com valores padrão', () => {
      const estoque = new Estoque({ insumoId: 'insumo-1' });

      expect(estoque.insumoId).toBe('insumo-1');
      expect(estoque.quantidadeAtual).toBe(0);
      expect(estoque.custoMedioPonderado).toBe(0);
      expect(estoque.criadoEm).toBeDefined();
      expect(estoque.atualizadoEm).toBeDefined();
    });

    it('deve criar estoque com valores fornecidos', () => {
      const estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 100,
        custoMedioPonderado: 500
      });

      expect(estoque.quantidadeAtual).toBe(100);
      expect(estoque.custoMedioPonderado).toBe(500);
    });
  });

  describe('adicionarEntrada', () => {
    let estoque;

    beforeEach(() => {
      estoque = new Estoque({ insumoId: 'insumo-1' });
    });

    it('deve adicionar entrada ao estoque vazio', () => {
      estoque.adicionarEntrada(10, 500); // 10 unidades a R$ 5,00

      expect(estoque.quantidadeAtual).toBe(10);
      expect(estoque.custoMedioPonderado).toBe(500);
    });

    it('deve calcular custo médio ponderado corretamente', () => {
      // Primeira entrada: 10 unidades a R$ 5,00
      estoque.adicionarEntrada(10, 500);
      expect(estoque.quantidadeAtual).toBe(10);
      expect(estoque.custoMedioPonderado).toBe(500);

      // Segunda entrada: 20 unidades a R$ 8,00
      estoque.adicionarEntrada(20, 800);
      
      // CMP = (10 * 500 + 20 * 800) / 30 = 21000 / 30 = 700
      expect(estoque.quantidadeAtual).toBe(30);
      expect(estoque.custoMedioPonderado).toBe(700);
    });

    it('deve arredondar custo médio ponderado', () => {
      estoque.adicionarEntrada(10, 333); // R$ 3,33
      estoque.adicionarEntrada(10, 667); // R$ 6,67
      
      // CMP = (10 * 333 + 10 * 667) / 20 = 10000 / 20 = 500
      expect(estoque.custoMedioPonderado).toBe(500);
    });

    it('deve atualizar timestamp atualizadoEm', () => {
      const antes = estoque.atualizadoEm;
      
      // Pequeno delay para garantir timestamp diferente
      setTimeout(() => {
        estoque.adicionarEntrada(10, 500);
        expect(estoque.atualizadoEm).not.toBe(antes);
      }, 10);
    });

    it('deve rejeitar quantidade inválida', () => {
      expect(() => estoque.adicionarEntrada(0, 500)).toThrow('Quantidade deve ser um número positivo');
      expect(() => estoque.adicionarEntrada(-10, 500)).toThrow('Quantidade deve ser um número positivo');
      expect(() => estoque.adicionarEntrada('10', 500)).toThrow('Quantidade deve ser um número positivo');
    });

    it('deve rejeitar custo unitário inválido', () => {
      expect(() => estoque.adicionarEntrada(10, -500)).toThrow('Custo unitário deve ser um número não-negativo');
      expect(() => estoque.adicionarEntrada(10, '500')).toThrow('Custo unitário deve ser um número não-negativo');
    });

    it('deve aceitar custo unitário zero', () => {
      expect(() => estoque.adicionarEntrada(10, 0)).not.toThrow();
      expect(estoque.custoMedioPonderado).toBe(0);
    });
  });

  describe('removerSaida', () => {
    let estoque;

    beforeEach(() => {
      estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 100,
        custoMedioPonderado: 500
      });
    });

    it('deve remover saída do estoque', () => {
      estoque.removerSaida(30);

      expect(estoque.quantidadeAtual).toBe(70);
      expect(estoque.custoMedioPonderado).toBe(500); // CMP não muda
    });

    it('deve permitir remover todo o estoque', () => {
      estoque.removerSaida(100);

      expect(estoque.quantidadeAtual).toBe(0);
    });

    it('deve atualizar timestamp atualizadoEm', () => {
      const antes = estoque.atualizadoEm;
      
      setTimeout(() => {
        estoque.removerSaida(10);
        expect(estoque.atualizadoEm).not.toBe(antes);
      }, 10);
    });

    it('deve rejeitar quantidade inválida', () => {
      expect(() => estoque.removerSaida(0)).toThrow('Quantidade deve ser um número positivo');
      expect(() => estoque.removerSaida(-10)).toThrow('Quantidade deve ser um número positivo');
      expect(() => estoque.removerSaida('10')).toThrow('Quantidade deve ser um número positivo');
    });

    it('deve rejeitar saída com estoque insuficiente', () => {
      expect(() => estoque.removerSaida(101)).toThrow('Estoque insuficiente');
      expect(() => estoque.removerSaida(200)).toThrow('Estoque insuficiente');
    });

    it('deve incluir quantidades na mensagem de erro', () => {
      try {
        estoque.removerSaida(150);
        expect.fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error.message).toContain('Disponível: 100');
        expect(error.message).toContain('Solicitado: 150');
      }
    });
  });

  describe('isAbaixoMinimo', () => {
    it('deve retornar true quando abaixo do mínimo', () => {
      const estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 5
      });

      expect(estoque.isAbaixoMinimo(10)).toBe(true);
    });

    it('deve retornar false quando igual ao mínimo', () => {
      const estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 10
      });

      expect(estoque.isAbaixoMinimo(10)).toBe(false);
    });

    it('deve retornar false quando acima do mínimo', () => {
      const estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 15
      });

      expect(estoque.isAbaixoMinimo(10)).toBe(false);
    });
  });

  describe('toJSON e fromJSON', () => {
    it('deve serializar para JSON', () => {
      const estoque = new Estoque({
        insumoId: 'insumo-1',
        quantidadeAtual: 100,
        custoMedioPonderado: 500
      });

      const json = estoque.toJSON();

      expect(json).toEqual({
        insumoId: 'insumo-1',
        quantidadeAtual: 100,
        custoMedioPonderado: 500,
        criadoEm: estoque.criadoEm,
        atualizadoEm: estoque.atualizadoEm
      });
    });

    it('deve deserializar de JSON', () => {
      const json = {
        insumoId: 'insumo-1',
        quantidadeAtual: 100,
        custoMedioPonderado: 500,
        criadoEm: '2026-02-15T10:00:00.000Z',
        atualizadoEm: '2026-02-15T10:00:00.000Z'
      };

      const estoque = Estoque.fromJSON(json);

      expect(estoque.insumoId).toBe('insumo-1');
      expect(estoque.quantidadeAtual).toBe(100);
      expect(estoque.custoMedioPonderado).toBe(500);
    });
  });

  describe('Integration - Fluxo completo', () => {
    it('deve gerenciar estoque com múltiplas operações', () => {
      const estoque = new Estoque({ insumoId: 'insumo-1' });

      // Entrada 1: 50 unidades a R$ 10,00
      estoque.adicionarEntrada(50, 1000);
      expect(estoque.quantidadeAtual).toBe(50);
      expect(estoque.custoMedioPonderado).toBe(1000);

      // Saída: 20 unidades
      estoque.removerSaida(20);
      expect(estoque.quantidadeAtual).toBe(30);
      expect(estoque.custoMedioPonderado).toBe(1000); // CMP não muda

      // Entrada 2: 30 unidades a R$ 12,00
      estoque.adicionarEntrada(30, 1200);
      // CMP = (30 * 1000 + 30 * 1200) / 60 = 66000 / 60 = 1100
      expect(estoque.quantidadeAtual).toBe(60);
      expect(estoque.custoMedioPonderado).toBe(1100);

      // Verificar se está abaixo do mínimo
      expect(estoque.isAbaixoMinimo(100)).toBe(true);
      expect(estoque.isAbaixoMinimo(50)).toBe(false);
    });
  });
});
