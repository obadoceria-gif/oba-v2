/**
 * Testes Unitários: FichaTecnica Model
 * 
 * Valida: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { describe, it, expect } from 'vitest';
import { FichaTecnica } from '../src/modules/fichas-tecnicas/models/FichaTecnica.js';

describe('FichaTecnica Model', () => {
  describe('Constructor', () => {
    it('deve criar ficha técnica com dados válidos', () => {
      const data = {
        id: 'ft-1',
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 },
          { insumoId: 'ins-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades',
        modoPreparo: 'Misturar tudo e cozinhar'
      };

      const ficha = new FichaTecnica(data);

      expect(ficha.id).toBe('ft-1');
      expect(ficha.nome).toBe('Brigadeiro');
      expect(ficha.insumos).toHaveLength(2);
      expect(ficha.rendimento).toBe(50);
      expect(ficha.unidadeRendimento).toBe('unidades');
      expect(ficha.modoPreparo).toBe('Misturar tudo e cozinhar');
      expect(ficha.criadoEm).toBeDefined();
      expect(ficha.atualizadoEm).toBeDefined();
    });

    it('deve criar ficha técnica com valores padrão', () => {
      const ficha = new FichaTecnica();

      expect(ficha.id).toBe('');
      expect(ficha.nome).toBe('');
      expect(ficha.insumos).toEqual([]);
      expect(ficha.rendimento).toBe(0);
      expect(ficha.unidadeRendimento).toBe('');
      expect(ficha.modoPreparo).toBe('');
    });
  });

  describe('Validation', () => {
    it('deve validar ficha técnica completa', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 },
          { insumoId: 'ins-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve rejeitar ficha técnica sem nome', () => {
      const ficha = new FichaTecnica({
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.nome).toBeDefined();
    });

    it('deve rejeitar ficha técnica sem insumos', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumos).toBeDefined();
    });

    it('deve rejeitar ficha técnica com lista de insumos vazia', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumos).toBeDefined();
    });

    it('deve rejeitar ficha técnica sem rendimento', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.rendimento).toBeDefined();
    });

    it('deve rejeitar ficha técnica com rendimento negativo', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: -10,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.rendimento).toBeDefined();
    });

    it('deve rejeitar ficha técnica com rendimento zero', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 0,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.rendimento).toBeDefined();
    });

    it('deve rejeitar ficha técnica sem unidade de rendimento', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 50
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.unidadeRendimento).toBeDefined();
    });

    it('deve rejeitar insumo sem ID', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumos).toBeDefined();
      expect(result.errors.insumos[0].insumoId).toBeDefined();
    });

    it('deve rejeitar insumo com quantidade zero', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 0 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumos).toBeDefined();
      expect(result.errors.insumos[0].quantidade).toBeDefined();
    });

    it('deve rejeitar insumo com quantidade negativa', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: -1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const result = ficha.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.insumos).toBeDefined();
      expect(result.errors.insumos[0].quantidade).toBeDefined();
    });
  });

  describe('Cost Calculation', () => {
    it('deve calcular custo do lote corretamente', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 },    // 1kg * 1000 = 1000
          { insumoId: 'ins-2', quantidade: 0.5 }   // 0.5kg * 500 = 250
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map([
        ['ins-1', { custoMedioPonderado: 1000 }], // R$ 10,00/kg
        ['ins-2', { custoMedioPonderado: 500 }]   // R$ 5,00/kg
      ]);

      const custoLote = ficha.calculateCustoLote(estoqueMap);

      expect(custoLote).toBe(1250); // R$ 12,50
    });

    it('deve calcular custo unitário corretamente', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 },
          { insumoId: 'ins-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map([
        ['ins-1', { custoMedioPonderado: 1000 }],
        ['ins-2', { custoMedioPonderado: 500 }]
      ]);

      const custoUnitario = ficha.calculateCustoUnitario(estoqueMap);

      expect(custoUnitario).toBe(25); // R$ 0,25 por unidade (1250 / 50)
    });

    it('deve arredondar custo do lote para o centavo mais próximo', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map([
        ['ins-1', { custoMedioPonderado: 1234.56 }]
      ]);

      const custoLote = ficha.calculateCustoLote(estoqueMap);

      expect(custoLote).toBe(1235); // Arredondado
    });

    it('deve arredondar custo unitário para o centavo mais próximo', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 }
        ],
        rendimento: 3,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map([
        ['ins-1', { custoMedioPonderado: 1000 }]
      ]);

      const custoUnitario = ficha.calculateCustoUnitario(estoqueMap);

      expect(custoUnitario).toBe(333); // 1000 / 3 = 333.33... arredondado
    });

    it('deve lançar erro se estoqueMap não for fornecido', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      expect(() => ficha.calculateCustoLote(null)).toThrow('estoqueMap deve ser um Map válido');
    });

    it('deve lançar erro se insumo não estiver no estoque', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 50,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map();

      expect(() => ficha.calculateCustoLote(estoqueMap)).toThrow('Insumo ins-1 não encontrado no estoque');
    });

    it('deve lançar erro ao calcular custo unitário com rendimento zero', () => {
      const ficha = new FichaTecnica({
        nome: 'Brigadeiro',
        insumos: [{ insumoId: 'ins-1', quantidade: 1 }],
        rendimento: 0,
        unidadeRendimento: 'unidades'
      });

      const estoqueMap = new Map([
        ['ins-1', { custoMedioPonderado: 1000 }]
      ]);

      expect(() => ficha.calculateCustoUnitario(estoqueMap)).toThrow('Rendimento deve ser maior que zero');
    });
  });

  describe('Serialization', () => {
    it('deve converter para JSON corretamente', () => {
      const ficha = new FichaTecnica({
        id: 'ft-1',
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 },
          { insumoId: 'ins-2', quantidade: 0.5 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades',
        modoPreparo: 'Misturar tudo'
      });

      const json = ficha.toJSON();

      expect(json.id).toBe('ft-1');
      expect(json.nome).toBe('Brigadeiro');
      expect(json.insumos).toHaveLength(2);
      expect(json.rendimento).toBe(50);
      expect(json.unidadeRendimento).toBe('unidades');
      expect(json.modoPreparo).toBe('Misturar tudo');
      expect(json.criadoEm).toBeDefined();
      expect(json.atualizadoEm).toBeDefined();
    });

    it('deve criar instância a partir de JSON', () => {
      const json = {
        id: 'ft-1',
        nome: 'Brigadeiro',
        insumos: [
          { insumoId: 'ins-1', quantidade: 1 }
        ],
        rendimento: 50,
        unidadeRendimento: 'unidades',
        modoPreparo: 'Misturar tudo'
      };

      const ficha = FichaTecnica.fromJSON(json);

      expect(ficha).toBeInstanceOf(FichaTecnica);
      expect(ficha.id).toBe('ft-1');
      expect(ficha.nome).toBe('Brigadeiro');
      expect(ficha.insumos).toHaveLength(1);
    });
  });
});
