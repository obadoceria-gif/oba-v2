/**
 * Property-Based Tests: FichaTecnica Cost Calculation
 * 
 * Property 9: Ficha Técnica Cost Calculation
 * Validates: Requirements 4.6, 4.7
 * 
 * Propriedade: O custo unitário deve sempre ser igual ao custo do lote dividido pelo rendimento
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { FichaTecnica } from '../src/modules/fichas-tecnicas/models/FichaTecnica.js';

describe('Property Tests: FichaTecnica Cost Calculation', () => {
  describe('Property 9: Custo unitário = custo lote / rendimento', () => {
    it('deve manter a relação custo unitário = custo lote / rendimento', () => {
      fc.assert(
        fc.property(
          // Gerar dados aleatórios
          fc.string({ minLength: 1, maxLength: 50 }), // nome
          fc.integer({ min: 1, max: 10 }), // número de insumos
          fc.integer({ min: 1, max: 1000 }), // rendimento
          fc.string({ minLength: 1, maxLength: 20 }), // unidade
          (nome, numInsumos, rendimento, unidade) => {
            // Gerar insumos aleatórios
            const insumos = [];
            const estoqueMap = new Map();
            
            for (let i = 0; i < numInsumos; i++) {
              const insumoId = `ins-${i}`;
              const quantidade = Math.random() * 10 + 0.1; // 0.1 a 10.1
              const custoMedio = Math.floor(Math.random() * 10000) + 1; // 1 a 10000 centavos
              
              insumos.push({ insumoId, quantidade });
              estoqueMap.set(insumoId, { custoMedioPonderado: custoMedio });
            }
            
            // Criar ficha técnica
            const ficha = new FichaTecnica({
              nome,
              insumos,
              rendimento,
              unidadeRendimento: unidade
            });
            
            // Calcular custos
            const custoLote = ficha.calculateCustoLote(estoqueMap);
            const custoUnitario = ficha.calculateCustoUnitario(estoqueMap);
            
            // Verificar propriedade: custoUnitario ≈ custoLote / rendimento
            // Permitir diferença de 1 centavo devido a arredondamento
            const custoUnitarioEsperado = Math.round(custoLote / rendimento);
            const diferenca = Math.abs(custoUnitario - custoUnitarioEsperado);
            
            expect(diferenca).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deve calcular custo lote como soma dos custos dos insumos', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // número de insumos
          (numInsumos) => {
            const insumos = [];
            const estoqueMap = new Map();
            let custoEsperado = 0;
            
            for (let i = 0; i < numInsumos; i++) {
              const insumoId = `ins-${i}`;
              const quantidade = Math.random() * 10 + 0.1;
              const custoMedio = Math.floor(Math.random() * 10000) + 1;
              
              insumos.push({ insumoId, quantidade });
              estoqueMap.set(insumoId, { custoMedioPonderado: custoMedio });
              
              custoEsperado += quantidade * custoMedio;
            }
            
            const ficha = new FichaTecnica({
              nome: 'Teste',
              insumos,
              rendimento: 10,
              unidadeRendimento: 'un'
            });
            
            const custoLote = ficha.calculateCustoLote(estoqueMap);
            
            // Permitir diferença de 1 centavo devido a arredondamento
            const diferenca = Math.abs(custoLote - Math.round(custoEsperado));
            expect(diferenca).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deve sempre retornar custos não-negativos', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 1000 }),
          (numInsumos, rendimento) => {
            const insumos = [];
            const estoqueMap = new Map();
            
            for (let i = 0; i < numInsumos; i++) {
              const insumoId = `ins-${i}`;
              const quantidade = Math.random() * 10 + 0.1;
              const custoMedio = Math.floor(Math.random() * 10000);
              
              insumos.push({ insumoId, quantidade });
              estoqueMap.set(insumoId, { custoMedioPonderado: custoMedio });
            }
            
            const ficha = new FichaTecnica({
              nome: 'Teste',
              insumos,
              rendimento,
              unidadeRendimento: 'un'
            });
            
            const custoLote = ficha.calculateCustoLote(estoqueMap);
            const custoUnitario = ficha.calculateCustoUnitario(estoqueMap);
            
            expect(custoLote).toBeGreaterThanOrEqual(0);
            expect(custoUnitario).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deve aumentar custo lote proporcionalmente ao aumento de quantidade', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(1), max: Math.fround(10), noNaN: true }),
          fc.integer({ min: 500, max: 10000 }),
          fc.float({ min: Math.fround(1.5), max: Math.fround(3), noNaN: true }),
          (quantidadeBase, custoMedio, fator) => {
            // Filtrar valores inválidos
            fc.pre(!isNaN(quantidadeBase) && !isNaN(fator));
            fc.pre(isFinite(quantidadeBase) && isFinite(fator));
            
            const insumoId = 'ins-1';
            
            const ficha1 = new FichaTecnica({
              nome: 'Teste',
              insumos: [{ insumoId, quantidade: quantidadeBase }],
              rendimento: 10,
              unidadeRendimento: 'un'
            });
            
            const ficha2 = new FichaTecnica({
              nome: 'Teste',
              insumos: [{ insumoId, quantidade: quantidadeBase * fator }],
              rendimento: 10,
              unidadeRendimento: 'un'
            });
            
            const estoqueMap = new Map([
              [insumoId, { custoMedioPonderado: custoMedio }]
            ]);
            
            const custo1 = ficha1.calculateCustoLote(estoqueMap);
            const custo2 = ficha2.calculateCustoLote(estoqueMap);
            
            // Verificar que custo2 > custo1
            expect(custo2).toBeGreaterThan(custo1);
            
            // Verificar proporcionalidade com tolerância de 2%
            const razaoReal = custo2 / custo1;
            const erroRelativo = Math.abs(razaoReal - fator) / fator;
            
            expect(erroRelativo).toBeLessThan(0.02);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deve diminuir custo unitário proporcionalmente ao aumento de rendimento', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          fc.integer({ min: 2, max: 5 }), // fator de multiplicação
          (rendimentoBase, fator) => {
            const insumoId = 'ins-1';
            const quantidade = 1;
            const custoMedio = 1000;
            
            // Ficha com rendimento base
            const ficha1 = new FichaTecnica({
              nome: 'Teste',
              insumos: [{ insumoId, quantidade }],
              rendimento: rendimentoBase,
              unidadeRendimento: 'un'
            });
            
            // Ficha com rendimento multiplicado
            const ficha2 = new FichaTecnica({
              nome: 'Teste',
              insumos: [{ insumoId, quantidade }],
              rendimento: rendimentoBase * fator,
              unidadeRendimento: 'un'
            });
            
            const estoqueMap = new Map([
              [insumoId, { custoMedioPonderado: custoMedio }]
            ]);
            
            const custoUnit1 = ficha1.calculateCustoUnitario(estoqueMap);
            const custoUnit2 = ficha2.calculateCustoUnitario(estoqueMap);
            
            // custoUnit2 deve ser aproximadamente custoUnit1 / fator
            const custoEsperado = Math.round(custoUnit1 / fator);
            const diferenca = Math.abs(custoUnit2 - custoEsperado);
            
            // Permitir diferença de até 2 centavos devido a arredondamentos
            expect(diferenca).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
