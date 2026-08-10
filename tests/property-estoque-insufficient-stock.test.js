/**
 * Property Test: Insufficient Stock Rejection
 * 
 * Valida que saídas com quantidade maior que o estoque disponível
 * são rejeitadas com erro apropriado.
 * 
 * Property: Qualquer tentativa de saída com quantidade > estoque atual
 * deve lançar erro e não alterar o estado do estoque.
 * 
 * Requirements: 3.6, 3.7
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Estoque } from '../src/modules/estoque/models/Estoque.js';

describe('Property Test: Insufficient Stock Rejection', () => {
  it('deve rejeitar saída maior que estoque disponível', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // quantidade em estoque
        fc.integer({ min: 1, max: 100 }), // quantidade adicional (excesso)
        (quantidadeEstoque, excesso) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeEstoque,
            custoMedioPonderado: 500
          });

          const quantidadeSaida = quantidadeEstoque + excesso;

          // Deve lançar erro
          expect(() => {
            estoque.removerSaida(quantidadeSaida);
          }).toThrow();

          // Estado não deve ter sido alterado
          expect(estoque.quantidadeAtual).toBe(quantidadeEstoque);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve rejeitar saída de estoque zerado', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // quantidade tentada
        (quantidade) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: 0,
            custoMedioPonderado: 0
          });

          // Deve lançar erro
          expect(() => {
            estoque.removerSaida(quantidade);
          }).toThrow('Estoque insuficiente');

          // Estado não deve ter sido alterado
          expect(estoque.quantidadeAtual).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('erro deve conter informação sobre disponível e solicitado', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // quantidade disponível
        fc.integer({ min: 1, max: 100 }), // excesso
        (disponivel, excesso) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: disponivel,
            custoMedioPonderado: 500
          });

          const solicitado = disponivel + excesso;

          try {
            estoque.removerSaida(solicitado);
            // Se não lançou erro, falha o teste
            expect(true).toBe(false);
          } catch (error) {
            // Verificar que mensagem contém informações úteis
            expect(error.message).toContain('Estoque insuficiente');
            expect(error.message).toContain(disponivel.toString());
            expect(error.message).toContain(solicitado.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve aceitar saída exatamente igual ao estoque disponível', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }), // quantidade
        (quantidade) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidade,
            custoMedioPonderado: 500
          });

          // Não deve lançar erro
          expect(() => {
            estoque.removerSaida(quantidade);
          }).not.toThrow();

          // Estoque deve ficar zerado
          expect(estoque.quantidadeAtual).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('deve rejeitar quantidade zero ou negativa', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 0 }), // quantidade inválida
        (quantidade) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: 100,
            custoMedioPonderado: 500
          });

          const quantidadeAntes = estoque.quantidadeAtual;

          // Deve lançar erro
          expect(() => {
            estoque.removerSaida(quantidade);
          }).toThrow();

          // Estado não deve ter sido alterado
          expect(estoque.quantidadeAtual).toBe(quantidadeAntes);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('múltiplas tentativas de saída insuficiente não alteram estado', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }), // quantidade inicial
        fc.array(
          fc.integer({ min: 1, max: 50 }), // tentativas de saída
          { minLength: 3, maxLength: 10 }
        ),
        (quantidadeInicial, tentativas) => {
          const estoque = new Estoque({
            insumoId: 'test-insumo',
            quantidadeAtual: quantidadeInicial,
            custoMedioPonderado: 500
          });

          // Tentar saídas que excedem o estoque
          for (const tentativa of tentativas) {
            const quantidadeSaida = quantidadeInicial + tentativa;

            try {
              estoque.removerSaida(quantidadeSaida);
            } catch (error) {
              // Esperado
            }

            // Estado deve permanecer inalterado
            expect(estoque.quantidadeAtual).toBe(quantidadeInicial);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
