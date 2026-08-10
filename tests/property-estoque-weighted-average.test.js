/**
 * Property Test: Weighted Average Cost Calculation
 * 
 * Valida que o cálculo do custo médio ponderado está correto
 * após múltiplas entradas no estoque.
 * 
 * Property: Após N entradas, o custo médio ponderado deve ser igual a:
 * (soma de todas as (quantidade * custo)) / (soma de todas as quantidades)
 * 
 * Requirements: 3.4
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';

describe('Property Test: Weighted Average Cost Calculation', () => {
  it('deve calcular custo médio ponderado corretamente após múltiplas entradas', () => {
    fc.assert(
      fc.property(
        // Gerar array de entradas (quantidade, custo)
        fc.array(
          fc.record({
            quantidade: fc.integer({ min: 1, max: 1000 }),
            custo: fc.integer({ min: 1, max: 10000 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (entradas) => {
          // Criar estoque vazio
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: 0,
            custoMedioPonderado: 0
          });

          // Aplicar todas as entradas
          let somaValores = 0;
          let somaQuantidades = 0;

          for (const entrada of entradas) {
            estoque.adicionarEntrada(entrada.quantidade, entrada.custo);
            somaValores += entrada.quantidade * entrada.custo;
            somaQuantidades += entrada.quantidade;
          }

          // Calcular custo médio esperado (arredondado para 2 casas decimais como no modelo)
          const custoMedioEsperado = Math.round((somaValores / somaQuantidades) * 100) / 100;

          // Verificar que o custo médio ponderado está correto
          // Tolerância de ±2 centavos devido a arredondamentos intermediários acumulados
          const diferenca = Math.abs(estoque.custoMedioPonderado - custoMedioEsperado);
          expect(diferenca).toBeLessThanOrEqual(2);
          expect(estoque.quantidadeAtual).toBe(somaQuantidades);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve manter custo médio correto ao adicionar entrada em estoque existente', () => {
    fc.assert(
      fc.property(
        // Estoque inicial
        fc.record({
          quantidadeInicial: fc.integer({ min: 1, max: 1000 }),
          custoInicial: fc.integer({ min: 1, max: 10000 })
        }),
        // Nova entrada
        fc.record({
          quantidadeEntrada: fc.integer({ min: 1, max: 1000 }),
          custoEntrada: fc.integer({ min: 1, max: 10000 })
        }),
        (inicial, entrada) => {
          // Criar estoque com valores iniciais
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: inicial.quantidadeInicial,
            custoMedioPonderado: inicial.custoInicial
          });

          // Adicionar nova entrada
          estoque.adicionarEntrada(entrada.quantidadeEntrada, entrada.custoEntrada);

          // Calcular custo médio esperado
          const valorAnterior = inicial.quantidadeInicial * inicial.custoInicial;
          const valorEntrada = entrada.quantidadeEntrada * entrada.custoEntrada;
          const quantidadeTotal = inicial.quantidadeInicial + entrada.quantidadeEntrada;
          const custoMedioEsperado = Math.round((valorAnterior + valorEntrada) / quantidadeTotal);

          // Verificar com tolerância de ±1 centavo
          const diferenca = Math.abs(estoque.custoMedioPonderado - custoMedioEsperado);
          expect(diferenca).toBeLessThanOrEqual(1);
          expect(estoque.quantidadeAtual).toBe(quantidadeTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve usar custo da entrada quando estoque está zerado', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // quantidade
        fc.integer({ min: 1, max: 10000 }), // custo
        (quantidade, custo) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: 0,
            custoMedioPonderado: 0
          });

          estoque.adicionarEntrada(quantidade, custo);

          // Quando estoque está zerado, custo médio = custo da entrada
          expect(estoque.custoMedioPonderado).toBe(custo);
          expect(estoque.quantidadeAtual).toBe(quantidade);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve arredondar custo médio para centavos inteiros', () => {
    const estoque = new Estoque({
      insumoId: 'test-insumo',
      quantidadeAtual: 0,
      custoMedioPonderado: 0
    });

    // Entrada que gera custo médio com decimais
    estoque.adicionarEntrada(3, 100); // 3 unidades a R$ 1,00
    estoque.adicionarEntrada(2, 150); // 2 unidades a R$ 1,50

    // Custo médio = (3*100 + 2*150) / 5 = 600 / 5 = 120
    expect(estoque.custoMedioPonderado).toBe(120);
    expect(Number.isInteger(estoque.custoMedioPonderado)).toBe(true);
  });
});
