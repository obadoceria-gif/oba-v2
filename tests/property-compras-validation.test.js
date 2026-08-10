import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Compra } from '../src/modules/compras/models/Compra.js';

describe('Property Tests: Compra Validation', () => {
  // Geradores customizados
  const validInsumoArb = fc.record({
    insumoId: fc.string({ minLength: 1, maxLength: 50 }),
    quantidade: fc.integer({ min: 1, max: 1000 }),
    custoUnitario: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
    subtotal: fc.constant(0) // Será calculado
  }).map(item => ({
    ...item,
    subtotal: item.quantidade * item.custoUnitario
  }));

  const validCompraDataArb = fc.record({
    fornecedorId: fc.string({ minLength: 1, maxLength: 50 }),
    insumos: fc.array(validInsumoArb, { minLength: 1, maxLength: 10 }),
    formaPagamento: fc.constantFrom('dinheiro', 'pix', 'cartao_debito', 'cartao_credito'),
    observacoes: fc.option(fc.string({ maxLength: 500 }), { nil: '' }),
    status: fc.constantFrom('pendente', 'concluida', 'cancelada')
  }).map(data => ({
    ...data,
    valorTotal: data.insumos.reduce((sum, item) => sum + item.subtotal, 0),
    observacoes: data.observacoes || ''
  }));

  describe('Invariantes de Compra', () => {
    it('valorTotal deve sempre ser igual à soma dos subtotais', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          const somaSubtotais = compra.insumos.reduce((sum, item) => sum + item.subtotal, 0);
          
          expect(Math.abs(compra.valorTotal - somaSubtotais)).toBeLessThan(0.01);
        }),
        { numRuns: 100 }
      );
    });

    it('cada subtotal deve ser igual a quantidade * custoUnitario', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          
          compra.insumos.forEach(item => {
            const subtotalCalculado = item.quantidade * item.custoUnitario;
            expect(Math.abs(item.subtotal - subtotalCalculado)).toBeLessThan(0.01);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('valorTotal deve sempre ser positivo', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          
          expect(compra.valorTotal).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('deve ter pelo menos um insumo', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          
          expect(compra.insumos.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Validação de Campos Obrigatórios', () => {
    it('deve rejeitar compra sem fornecedorId', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const invalidData = { ...data };
          delete invalidData.fornecedorId;
          
          expect(() => new Compra(invalidData)).toThrow();
        }),
        { numRuns: 50 }
      );
    });

    it('deve rejeitar compra sem insumos', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const invalidData = { ...data, insumos: [] };
          
          expect(() => new Compra(invalidData)).toThrow();
        }),
        { numRuns: 50 }
      );
    });

    it('deve rejeitar compra sem formaPagamento', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const invalidData = { ...data };
          delete invalidData.formaPagamento;
          
          expect(() => new Compra(invalidData)).toThrow();
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Validação de Valores Numéricos', () => {
    it('deve rejeitar quantidade zero ou negativa', () => {
      fc.assert(
        fc.property(
          validCompraDataArb,
          fc.integer({ min: -100, max: 0 }),
          (data, quantidadeInvalida) => {
            const invalidData = {
              ...data,
              insumos: [{
                insumoId: 'test',
                quantidade: quantidadeInvalida,
                custoUnitario: 10,
                subtotal: quantidadeInvalida * 10
              }],
              valorTotal: quantidadeInvalida * 10
            };
            
            expect(() => new Compra(invalidData)).toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('deve rejeitar custoUnitario zero ou negativo', () => {
      fc.assert(
        fc.property(
          validCompraDataArb,
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true }),
          (data, custoInvalido) => {
            const invalidData = {
              ...data,
              insumos: [{
                insumoId: 'test',
                quantidade: 10,
                custoUnitario: custoInvalido,
                subtotal: 10 * custoInvalido
              }],
              valorTotal: 10 * custoInvalido
            };
            
            expect(() => new Compra(invalidData)).toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Serialização e Deserialização', () => {
    it('toJSON() e fromJSON() devem ser inversos', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra1 = new Compra(data);
          const json = compra1.toJSON();
          const compra2 = Compra.fromJSON(json);
          
          expect(compra2.id).toBe(compra1.id);
          expect(compra2.fornecedorId).toBe(compra1.fornecedorId);
          expect(compra2.insumos).toEqual(compra1.insumos);
          expect(compra2.formaPagamento).toBe(compra1.formaPagamento);
          expect(compra2.valorTotal).toBe(compra1.valorTotal);
          expect(compra2.status).toBe(compra1.status);
        }),
        { numRuns: 100 }
      );
    });

    it('múltiplas serializações devem produzir o mesmo resultado', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          const json1 = compra.toJSON();
          const json2 = compra.toJSON();
          
          expect(json1).toEqual(json2);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Cálculos Matemáticos', () => {
    it('calcularValorTotal deve ser comutativo', () => {
      fc.assert(
        fc.property(
          fc.array(validInsumoArb, { minLength: 2, maxLength: 5 }),
          (insumos) => {
            const total1 = Compra.calcularValorTotal(insumos);
            const insumosEmbaralhados = [...insumos].reverse();
            const total2 = Compra.calcularValorTotal(insumosEmbaralhados);
            
            expect(Math.abs(total1 - total2)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calcularSubtotal deve ser associativo', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
          (quantidade, custo) => {
            const subtotal1 = Compra.calcularSubtotal(quantidade, custo);
            const subtotal2 = quantidade * custo;
            
            expect(Math.abs(subtotal1 - subtotal2)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Geração de IDs', () => {
    it('IDs gerados devem ser únicos', () => {
      fc.assert(
        fc.property(
          fc.array(validCompraDataArb, { minLength: 10, maxLength: 50 }),
          (dataArray) => {
            const compras = dataArray.map(data => new Compra(data));
            const ids = compras.map(c => c.id);
            const idsUnicos = new Set(ids);
            
            expect(idsUnicos.size).toBe(ids.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('IDs devem começar com "compra_"', () => {
      fc.assert(
        fc.property(validCompraDataArb, (data) => {
          const compra = new Compra(data);
          
          expect(compra.id).toMatch(/^compra_/);
        }),
        { numRuns: 100 }
      );
    });
  });
});
