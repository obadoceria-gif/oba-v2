/**
 * Property Test: Stock Movement Invariant
 * 
 * Valida que as movimentações de estoque mantêm invariantes:
 * - Entrada sempre aumenta quantidade
 * - Saída sempre diminui quantidade
 * - Quantidade nunca pode ser negativa
 * 
 * Requirements: 3.3, 3.5
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';

describe('Property Test: Stock Movement Invariant', () => {
  it('entrada sempre aumenta quantidade', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // quantidade inicial
        fc.integer({ min: 1, max: 1000 }), // quantidade entrada
        fc.integer({ min: 1, max: 10000 }), // custo
        (quantidadeInicial, quantidadeEntrada, custo) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeInicial,
            custoMedioPonderado: 500
          });

          const quantidadeAntes = estoque.quantidadeAtual;
          estoque.adicionarEntrada(quantidadeEntrada, custo);
          const quantidadeDepois = estoque.quantidadeAtual;

          // Invariante: quantidade após entrada > quantidade antes
          expect(quantidadeDepois).toBeGreaterThan(quantidadeAntes);
          expect(quantidadeDepois).toBe(quantidadeAntes + quantidadeEntrada);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('saída sempre diminui quantidade', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }), // quantidade inicial (suficiente)
        fc.integer({ min: 1, max: 99 }), // quantidade saída (menor que inicial)
        (quantidadeInicial, quantidadeSaida) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeInicial,
            custoMedioPonderado: 500
          });

          const quantidadeAntes = estoque.quantidadeAtual;
          estoque.removerSaida(quantidadeSaida);
          const quantidadeDepois = estoque.quantidadeAtual;

          // Invariante: quantidade após saída < quantidade antes
          expect(quantidadeDepois).toBeLessThan(quantidadeAntes);
          expect(quantidadeDepois).toBe(quantidadeAntes - quantidadeSaida);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('quantidade nunca pode ser negativa', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // quantidade inicial
        fc.array(
          fc.record({
            tipo: fc.constantFrom('entrada', 'saida'),
            quantidade: fc.integer({ min: 1, max: 100 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (quantidadeInicial, movimentacoes) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeInicial,
            custoMedioPonderado: 500
          });

          for (const mov of movimentacoes) {
            if (mov.tipo === 'entrada') {
              estoque.adicionarEntrada(mov.quantidade, 500);
            } else {
              // Saída: só executar se houver estoque suficiente
              if (estoque.quantidadeAtual >= mov.quantidade) {
                estoque.removerSaida(mov.quantidade);
              }
            }

            // Invariante: quantidade sempre >= 0
            expect(estoque.quantidadeAtual).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sequência de entradas e saídas mantém consistência', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            tipo: fc.constantFrom('entrada', 'saida'),
            quantidade: fc.integer({ min: 1, max: 50 })
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (movimentacoes) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: 0,
            custoMedioPonderado: 0
          });

          let quantidadeEsperada = 0;

          for (const mov of movimentacoes) {
            if (mov.tipo === 'entrada') {
              estoque.adicionarEntrada(mov.quantidade, 500);
              quantidadeEsperada += mov.quantidade;
            } else {
              // Saída: só executar se houver estoque suficiente
              if (estoque.quantidadeAtual >= mov.quantidade) {
                estoque.removerSaida(mov.quantidade);
                quantidadeEsperada -= mov.quantidade;
              }
            }

            // Verificar consistência
            expect(estoque.quantidadeAtual).toBe(quantidadeEsperada);
            expect(estoque.quantidadeAtual).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('custo médio não muda com saídas', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 1000 }), // quantidade inicial
        fc.integer({ min: 100, max: 10000 }), // custo médio
        fc.integer({ min: 1, max: 50 }), // quantidade saída
        (quantidadeInicial, custoMedio, quantidadeSaida) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeInicial,
            custoMedioPonderado: custoMedio
          });

          const custoAntes = estoque.custoMedioPonderado;
          estoque.removerSaida(quantidadeSaida);
          const custoDepois = estoque.custoMedioPonderado;

          // Invariante: saída não altera custo médio ponderado
          expect(custoDepois).toBe(custoAntes);
        }
      ),
      { numRuns: 100 }
    );
  });
});
