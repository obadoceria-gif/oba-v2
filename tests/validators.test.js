/**
 * Testes para ValidationEngine e Validators
 * 
 * Valida:
 * - Requirement 13.1: Validators para required, numeric, positive, dates, email, phone
 * - Requirement 13.2: ValidationEngine que aceita regras e dados
 * - Requirement 13.3: Mensagens de erro em português
 * - Requirement 13.9: Retornar { valid, errors }
 */

import { describe, it, expect } from 'vitest';
import ValidationEngine from '../src/core/validators/ValidationEngine.js';
import * as validators from '../src/core/validators/validators.js';

describe('ValidationEngine', () => {
  describe('validate', () => {
    it('should validate data against rules and return valid result', () => {
      const data = {
        nome: 'Farinha de Trigo',
        preco: 500
      };

      const rules = {
        nome: [validators.required()],
        preco: [validators.required(), validators.numeric(), validators.positive()]
      };

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid data', () => {
      const data = {
        nome: '',
        preco: -10
      };

      const rules = {
        nome: [validators.required()],
        preco: [validators.positive()]
      };

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveProperty('nome');
      expect(result.errors).toHaveProperty('preco');
      expect(result.errors.nome).toContain('Campo obrigatório');
      expect(result.errors.preco).toContain('Deve ser um número positivo');
    });

    it('should collect multiple errors for same field', () => {
      const data = {
        senha: 'ab'
      };

      const rules = {
        senha: [validators.required(), validators.minLength(8)]
      };

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(false);
      expect(result.errors.senha).toHaveLength(1);
      expect(result.errors.senha[0]).toContain('no mínimo 8 caracteres');
    });

    it('should validate multiple fields', () => {
      const data = {
        nome: 'João',
        email: 'joao@example.com',
        telefone: '(11) 98765-4321',
        idade: 25
      };

      const rules = {
        nome: [validators.required(), validators.minLength(3)],
        email: [validators.required(), validators.email()],
        telefone: [validators.required(), validators.phone()],
        idade: [validators.required(), validators.numeric(), validators.positive()]
      };

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should handle empty rules', () => {
      const data = { nome: 'Teste' };
      const rules = {};

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should handle missing fields in data', () => {
      const data = {};
      const rules = {
        nome: [validators.required()]
      };

      const result = ValidationEngine.validate(data, rules);

      expect(result.valid).toBe(false);
      expect(result.errors.nome).toContain('Campo obrigatório');
    });
  });

  describe('validateField', () => {
    it('should validate single field and return valid result', () => {
      const result = ValidationEngine.validateField(
        'joao@example.com',
        [validators.required(), validators.email()]
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid field', () => {
      const result = ValidationEngine.validateField(
        'invalid-email',
        [validators.email()]
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Email inválido');
    });

    it('should collect multiple errors', () => {
      const result = ValidationEngine.validateField(
        '',
        [validators.required(), validators.minLength(5)]
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Campo obrigatório');
    });

    it('should pass data context to validators', () => {
      const customValidator = (value, data) => {
        return data.minimo && value < data.minimo ? 'Valor abaixo do mínimo' : true;
      };

      const result = ValidationEngine.validateField(
        5,
        [customValidator],
        { minimo: 10 }
      );

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toBe('Valor abaixo do mínimo');
    });
  });

  describe('combine', () => {
    it('should combine multiple validators into one', () => {
      const combinedValidator = ValidationEngine.combine(
        validators.required(),
        validators.numeric(),
        validators.positive()
      );

      expect(combinedValidator(100)).toBe(true);
      expect(combinedValidator('')).toBe('Campo obrigatório');
      expect(combinedValidator('abc')).toBe('Deve ser um número');
      expect(combinedValidator(-10)).toBe('Deve ser um número positivo');
    });

    it('should return first error encountered', () => {
      const combinedValidator = ValidationEngine.combine(
        validators.required(),
        validators.minLength(5)
      );

      const result = combinedValidator('');
      expect(result).toBe('Campo obrigatório');
    });

    it('should pass data context through combined validators', () => {
      const customValidator = (value, data) => {
        return data.max && value > data.max ? 'Acima do máximo' : true;
      };

      const combinedValidator = ValidationEngine.combine(
        validators.required(),
        validators.numeric(),
        customValidator
      );

      expect(combinedValidator(100, { max: 50 })).toBe('Acima do máximo');
    });
  });
});

describe('Validators', () => {
  describe('required', () => {
    it('should accept non-empty values', () => {
      expect(validators.required()('texto')).toBe(true);
      expect(validators.required()(123)).toBe(true);
      expect(validators.required()(0)).toBe(true);
      expect(validators.required()(false)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validators.required()('')).toBe('Campo obrigatório');
      expect(validators.required()(null)).toBe('Campo obrigatório');
      expect(validators.required()(undefined)).toBe('Campo obrigatório');
    });

    it('should reject whitespace-only strings', () => {
      expect(validators.required()('   ')).toBe('Campo obrigatório');
      expect(validators.required()('\t\n')).toBe('Campo obrigatório');
    });

    it('should reject empty arrays', () => {
      expect(validators.required()([])).toBe('Campo obrigatório');
    });

    it('should accept non-empty arrays', () => {
      expect(validators.required()([1, 2, 3])).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.required('Preenchimento obrigatório')('')).toBe('Preenchimento obrigatório');
    });
  });

  describe('numeric', () => {
    it('should accept numbers', () => {
      expect(validators.numeric()(123)).toBe(true);
      expect(validators.numeric()(0)).toBe(true);
      expect(validators.numeric()(-456)).toBe(true);
      expect(validators.numeric()(3.14)).toBe(true);
    });

    it('should accept numeric strings', () => {
      expect(validators.numeric()('123')).toBe(true);
      expect(validators.numeric()('0')).toBe(true);
      expect(validators.numeric()('-456')).toBe(true);
      expect(validators.numeric()('3.14')).toBe(true);
    });

    it('should reject non-numeric values', () => {
      expect(validators.numeric()('abc')).toBe('Deve ser um número');
      expect(validators.numeric()('12abc')).toBe('Deve ser um número');
      expect(validators.numeric()(NaN)).toBe('Deve ser um número');
    });

    it('should allow empty values', () => {
      expect(validators.numeric()('')).toBe(true);
      expect(validators.numeric()(null)).toBe(true);
      expect(validators.numeric()(undefined)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.numeric('Apenas números')('abc')).toBe('Apenas números');
    });
  });

  describe('positive', () => {
    it('should accept positive numbers', () => {
      expect(validators.positive()(1)).toBe(true);
      expect(validators.positive()(100)).toBe(true);
      expect(validators.positive()(0.01)).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      expect(validators.positive()(0)).toBe('Deve ser um número positivo');
      expect(validators.positive()(-1)).toBe('Deve ser um número positivo');
      expect(validators.positive()(-100)).toBe('Deve ser um número positivo');
    });

    it('should accept positive numeric strings', () => {
      expect(validators.positive()('100')).toBe(true);
      expect(validators.positive()('0.5')).toBe(true);
    });

    it('should reject zero and negative numeric strings', () => {
      expect(validators.positive()('0')).toBe('Deve ser um número positivo');
      expect(validators.positive()('-10')).toBe('Deve ser um número positivo');
    });

    it('should allow empty values', () => {
      expect(validators.positive()('')).toBe(true);
      expect(validators.positive()(null)).toBe(true);
      expect(validators.positive()(undefined)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.positive('Valor deve ser positivo')(0)).toBe('Valor deve ser positivo');
    });
  });

  describe('nonNegative', () => {
    it('should accept zero and positive numbers', () => {
      expect(validators.nonNegative()(0)).toBe(true);
      expect(validators.nonNegative()(1)).toBe(true);
      expect(validators.nonNegative()(100)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(validators.nonNegative()(-1)).toBe('Não pode ser negativo');
      expect(validators.nonNegative()(-100)).toBe('Não pode ser negativo');
    });

    it('should accept zero and positive numeric strings', () => {
      expect(validators.nonNegative()('0')).toBe(true);
      expect(validators.nonNegative()('100')).toBe(true);
    });

    it('should allow empty values', () => {
      expect(validators.nonNegative()('')).toBe(true);
      expect(validators.nonNegative()(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.nonNegative('Não aceita negativos')(-5)).toBe('Não aceita negativos');
    });
  });

  describe('date', () => {
    it('should accept valid ISO 8601 dates', () => {
      expect(validators.date()('2024-01-15')).toBe(true);
      expect(validators.date()('2024-12-31')).toBe(true);
      expect(validators.date()('2024-01-15T10:30:00.000Z')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(validators.date()('15/01/2024')).toBe('Data inválida');
      expect(validators.date()('2024/01/15')).toBe('Data inválida');
      expect(validators.date()('invalid')).toBe('Data inválida');
    });

    it('should reject invalid dates', () => {
      expect(validators.date()('2024-13-01')).toBe('Data inválida');
      expect(validators.date()('2024-02-30')).toBe('Data inválida');
    });

    it('should allow empty values', () => {
      expect(validators.date()('')).toBe(true);
      expect(validators.date()(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.date('Formato de data incorreto')('invalid')).toBe('Formato de data incorreto');
    });
  });

  describe('email', () => {
    it('should accept valid email formats', () => {
      expect(validators.email()('user@example.com')).toBe(true);
      expect(validators.email()('test.user@domain.co.uk')).toBe(true);
      expect(validators.email()('name+tag@company.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validators.email()('invalid')).toBe('Email inválido');
      expect(validators.email()('user@')).toBe('Email inválido');
      expect(validators.email()('@domain.com')).toBe('Email inválido');
      expect(validators.email()('user @domain.com')).toBe('Email inválido');
    });

    it('should allow empty values', () => {
      expect(validators.email()('')).toBe(true);
      expect(validators.email()(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.email('Email incorreto')('invalid')).toBe('Email incorreto');
    });
  });

  describe('phone', () => {
    it('should accept valid Brazilian phone formats', () => {
      expect(validators.phone()('(11) 98765-4321')).toBe(true);
      expect(validators.phone()('(11) 3456-7890')).toBe(true);
      expect(validators.phone()('(11)98765-4321')).toBe(true);
      expect(validators.phone()('(11)34567890')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validators.phone()('11987654321')).toBe('Telefone inválido. Use (XX) XXXXX-XXXX');
      expect(validators.phone()('(11) 9876-4321')).toBe('Telefone inválido. Use (XX) XXXXX-XXXX');
      expect(validators.phone()('invalid')).toBe('Telefone inválido. Use (XX) XXXXX-XXXX');
    });

    it('should allow empty values', () => {
      expect(validators.phone()('')).toBe(true);
      expect(validators.phone()(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.phone('Telefone incorreto')('invalid')).toBe('Telefone incorreto');
    });
  });

  describe('minLength', () => {
    it('should accept strings meeting minimum length', () => {
      expect(validators.minLength(3)('abc')).toBe(true);
      expect(validators.minLength(3)('abcd')).toBe(true);
      expect(validators.minLength(5)('hello')).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(validators.minLength(5)('abc')).toBe('Deve ter no mínimo 5 caracteres');
      expect(validators.minLength(10)('short')).toBe('Deve ter no mínimo 10 caracteres');
    });

    it('should allow empty values', () => {
      expect(validators.minLength(5)('')).toBe(true);
      expect(validators.minLength(5)(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.minLength(5, 'Muito curto')('ab')).toBe('Muito curto');
    });
  });

  describe('maxLength', () => {
    it('should accept strings within maximum length', () => {
      expect(validators.maxLength(10)('abc')).toBe(true);
      expect(validators.maxLength(10)('1234567890')).toBe(true);
    });

    it('should reject strings exceeding maximum length', () => {
      expect(validators.maxLength(5)('abcdef')).toBe('Deve ter no máximo 5 caracteres');
      expect(validators.maxLength(3)('toolong')).toBe('Deve ter no máximo 3 caracteres');
    });

    it('should allow empty values', () => {
      expect(validators.maxLength(5)('')).toBe(true);
      expect(validators.maxLength(5)(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.maxLength(5, 'Muito longo')('toolong')).toBe('Muito longo');
    });
  });

  describe('oneOf', () => {
    it('should accept values in the list', () => {
      expect(validators.oneOf(['kg', 'g', 'L'])('kg')).toBe(true);
      expect(validators.oneOf(['kg', 'g', 'L'])('g')).toBe(true);
      expect(validators.oneOf([1, 2, 3])(2)).toBe(true);
    });

    it('should reject values not in the list', () => {
      expect(validators.oneOf(['kg', 'g', 'L'])('mL')).toBe('Deve ser um dos valores: kg, g, L');
      expect(validators.oneOf([1, 2, 3])(4)).toBe('Deve ser um dos valores: 1, 2, 3');
    });

    it('should allow empty values', () => {
      expect(validators.oneOf(['kg', 'g'])('')).toBe(true);
      expect(validators.oneOf(['kg', 'g'])(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.oneOf(['A', 'B'], 'Opção inválida')('C')).toBe('Opção inválida');
    });
  });

  describe('min', () => {
    it('should accept values above or equal to minimum', () => {
      expect(validators.min(10)(10)).toBe(true);
      expect(validators.min(10)(15)).toBe(true);
      expect(validators.min(0)(0)).toBe(true);
    });

    it('should reject values below minimum', () => {
      expect(validators.min(10)(5)).toBe('Deve ser no mínimo 10');
      expect(validators.min(0)(-1)).toBe('Deve ser no mínimo 0');
    });

    it('should accept numeric strings', () => {
      expect(validators.min(10)('15')).toBe(true);
      expect(validators.min(10)('5')).toBe('Deve ser no mínimo 10');
    });

    it('should allow empty values', () => {
      expect(validators.min(10)('')).toBe(true);
      expect(validators.min(10)(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.min(10, 'Abaixo do mínimo')(5)).toBe('Abaixo do mínimo');
    });
  });

  describe('max', () => {
    it('should accept values below or equal to maximum', () => {
      expect(validators.max(100)(100)).toBe(true);
      expect(validators.max(100)(50)).toBe(true);
      expect(validators.max(0)(0)).toBe(true);
    });

    it('should reject values above maximum', () => {
      expect(validators.max(100)(150)).toBe('Deve ser no máximo 100');
      expect(validators.max(0)(1)).toBe('Deve ser no máximo 0');
    });

    it('should accept numeric strings', () => {
      expect(validators.max(100)('50')).toBe(true);
      expect(validators.max(100)('150')).toBe('Deve ser no máximo 100');
    });

    it('should allow empty values', () => {
      expect(validators.max(100)('')).toBe(true);
      expect(validators.max(100)(null)).toBe(true);
    });

    it('should use custom message', () => {
      expect(validators.max(100, 'Acima do máximo')(150)).toBe('Acima do máximo');
    });
  });
});

describe('Integration Tests', () => {
  it('should validate complete insumo data', () => {
    const insumo = {
      nome: 'Farinha de Trigo',
      unidade: 'kg',
      custoPadrao: 500,
      estoqueMinimo: 10
    };

    const rules = {
      nome: [validators.required(), validators.minLength(3)],
      unidade: [validators.required(), validators.oneOf(['kg', 'g', 'L', 'mL', 'unidade', 'pacote', 'caixa'])],
      custoPadrao: [validators.required(), validators.numeric(), validators.positive()],
      estoqueMinimo: [validators.required(), validators.numeric(), validators.nonNegative()]
    };

    const result = ValidationEngine.validate(insumo, rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should validate complete cliente data', () => {
    const cliente = {
      nome: 'João Silva',
      telefone: '(11) 98765-4321',
      email: 'joao@example.com'
    };

    const rules = {
      nome: [validators.required(), validators.minLength(3)],
      telefone: [validators.required(), validators.phone()],
      email: [validators.email()]
    };

    const result = ValidationEngine.validate(cliente, rules);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should collect all validation errors', () => {
    const data = {
      nome: '',
      email: 'invalid-email',
      telefone: '123',
      preco: -10,
      quantidade: 'abc'
    };

    const rules = {
      nome: [validators.required(), validators.minLength(3)],
      email: [validators.required(), validators.email()],
      telefone: [validators.required(), validators.phone()],
      preco: [validators.required(), validators.numeric(), validators.positive()],
      quantidade: [validators.required(), validators.numeric(), validators.nonNegative()]
    };

    const result = ValidationEngine.validate(data, rules);

    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(5);
    expect(result.errors.nome).toContain('Campo obrigatório');
    expect(result.errors.email).toContain('Email inválido');
    expect(result.errors.telefone).toContain('Telefone inválido. Use (XX) XXXXX-XXXX');
    expect(result.errors.preco).toContain('Deve ser um número positivo');
    expect(result.errors.quantidade).toContain('Deve ser um número');
  });
});
