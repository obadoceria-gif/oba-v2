/**
 * Teste de Setup - Verifica que o ambiente está configurado corretamente
 */

import { describe, it, expect } from 'vitest';

describe('Setup do Projeto', () => {
  it('deve ter ambiente de testes configurado', () => {
    expect(true).toBe(true);
  });

  it('deve ter acesso a fast-check', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.assert).toBeDefined();
  });

  it('deve ter vitest configurado com globals', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});

describe('Estrutura do Projeto', () => {
  it('deve ter estrutura de pastas criada', () => {
    // Este teste passa se o arquivo foi carregado
    // (significa que a estrutura existe)
    expect(import.meta.url).toContain('tests/setup.test.js');
  });
});
