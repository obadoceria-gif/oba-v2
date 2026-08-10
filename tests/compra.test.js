import { describe, it, expect } from 'vitest';
import { Compra } from '../src/modules/compras/models/Compra.js';

describe('Compra Model', () => {
  const compraValidaData = {
    fornecedorId: 'fornecedor_123',
    insumos: [
      {
        insumoId: 'insumo_1',
        quantidade: 10,
        custoUnitario: 5.50,
        subtotal: 55.00
      },
      {
        insumoId: 'insumo_2',
        quantidade: 5,
        custoUnitario: 10.00,
        subtotal: 50.00
      }
    ],
    formaPagamento: 'pix',
    valorTotal: 105.00,
    observacoes: 'Compra de teste'
  };

  describe('Criação', () => {
    it('deve criar uma compra válida', () => {
      const compra = new Compra(compraValidaData);

      expect(compra.id).toBeDefined();
      expect(compra.fornecedorId).toBe('fornecedor_123');
      expect(compra.insumos).toHaveLength(2);
      expect(compra.formaPagamento).toBe('pix');
      expect(compra.valorTotal).toBe(105.00);
      expect(compra.observacoes).toBe('Compra de teste');
      expect(compra.status).toBe('pendente');
      expect(compra.criadoEm).toBeDefined();
      expect(compra.atualizadoEm).toBeDefined();
    });

    it('deve gerar ID único automaticamente', () => {
      const compra1 = new Compra(compraValidaData);
      const compra2 = new Compra(compraValidaData);

      expect(compra1.id).not.toBe(compra2.id);
      expect(compra1.id).toMatch(/^compra_/);
    });

    it('deve usar ID fornecido se presente', () => {
      const data = { ...compraValidaData, id: 'compra_custom_123' };
      const compra = new Compra(data);

      expect(compra.id).toBe('compra_custom_123');
    });

    it('deve definir status padrão como pendente', () => {
      const compra = new Compra(compraValidaData);

      expect(compra.status).toBe('pendente');
    });

    it('deve definir observacoes vazio se não fornecido', () => {
      const data = { ...compraValidaData };
      delete data.observacoes;
      const compra = new Compra(data);

      expect(compra.observacoes).toBe('');
    });
  });

  describe('Validação de fornecedorId', () => {
    it('deve rejeitar compra sem fornecedorId', () => {
      const data = { ...compraValidaData };
      delete data.fornecedorId;

      expect(() => new Compra(data)).toThrow('fornecedorId é obrigatório');
    });

    it('deve rejeitar fornecedorId vazio', () => {
      const data = { ...compraValidaData, fornecedorId: '' };

      expect(() => new Compra(data)).toThrow('fornecedorId é obrigatório');
    });
  });

  describe('Validação de insumos', () => {
    it('deve rejeitar compra sem insumos', () => {
      const data = { ...compraValidaData };
      delete data.insumos;

      expect(() => new Compra(data)).toThrow('insumos deve ser um array não vazio');
    });

    it('deve rejeitar array de insumos vazio', () => {
      const data = { ...compraValidaData, insumos: [] };

      expect(() => new Compra(data)).toThrow('insumos deve ser um array não vazio');
    });

    it('deve rejeitar insumo sem insumoId', () => {
      const data = {
        ...compraValidaData,
        insumos: [{
          quantidade: 10,
          custoUnitario: 5.50,
          subtotal: 55.00
        }]
      };

      expect(() => new Compra(data)).toThrow('insumos[0].insumoId é obrigatório');
    });

    it('deve rejeitar quantidade não positiva', () => {
      const data = {
        ...compraValidaData,
        insumos: [{
          insumoId: 'insumo_1',
          quantidade: 0,
          custoUnitario: 5.50,
          subtotal: 0
        }],
        valorTotal: 0
      };

      expect(() => new Compra(data)).toThrow('insumos[0].quantidade deve ser um número positivo');
    });

    it('deve rejeitar quantidade negativa', () => {
      const data = {
        ...compraValidaData,
        insumos: [{
          insumoId: 'insumo_1',
          quantidade: -5,
          custoUnitario: 5.50,
          subtotal: -27.50
        }],
        valorTotal: -27.50
      };

      expect(() => new Compra(data)).toThrow('insumos[0].quantidade deve ser um número positivo');
    });

    it('deve rejeitar custoUnitario não positivo', () => {
      const data = {
        ...compraValidaData,
        insumos: [{
          insumoId: 'insumo_1',
          quantidade: 10,
          custoUnitario: 0,
          subtotal: 0
        }],
        valorTotal: 0
      };

      expect(() => new Compra(data)).toThrow('insumos[0].custoUnitario deve ser um número positivo');
    });

    it('deve rejeitar subtotal incorreto', () => {
      const data = {
        ...compraValidaData,
        insumos: [{
          insumoId: 'insumo_1',
          quantidade: 10,
          custoUnitario: 5.50,
          subtotal: 100.00 // Deveria ser 55.00
        }],
        valorTotal: 100.00
      };

      expect(() => new Compra(data)).toThrow('insumos[0].subtotal não corresponde ao cálculo');
    });
  });

  describe('Validação de formaPagamento', () => {
    it('deve aceitar dinheiro', () => {
      const data = { ...compraValidaData, formaPagamento: 'dinheiro' };
      const compra = new Compra(data);

      expect(compra.formaPagamento).toBe('dinheiro');
    });

    it('deve aceitar pix', () => {
      const data = { ...compraValidaData, formaPagamento: 'pix' };
      const compra = new Compra(data);

      expect(compra.formaPagamento).toBe('pix');
    });

    it('deve aceitar cartao_debito', () => {
      const data = { ...compraValidaData, formaPagamento: 'cartao_debito' };
      const compra = new Compra(data);

      expect(compra.formaPagamento).toBe('cartao_debito');
    });

    it('deve aceitar cartao_credito', () => {
      const data = { ...compraValidaData, formaPagamento: 'cartao_credito' };
      const compra = new Compra(data);

      expect(compra.formaPagamento).toBe('cartao_credito');
    });

    it('deve rejeitar forma de pagamento inválida', () => {
      const data = { ...compraValidaData, formaPagamento: 'boleto' };

      expect(() => new Compra(data)).toThrow('formaPagamento deve ser um dos seguintes');
    });
  });

  describe('Validação de valorTotal', () => {
    it('deve rejeitar valorTotal não positivo', () => {
      const data = { ...compraValidaData, valorTotal: 0 };

      expect(() => new Compra(data)).toThrow('valorTotal deve ser um número positivo');
    });

    it('deve rejeitar valorTotal negativo', () => {
      const data = { ...compraValidaData, valorTotal: -100 };

      expect(() => new Compra(data)).toThrow('valorTotal deve ser um número positivo');
    });

    it('deve rejeitar valorTotal que não corresponde à soma dos subtotais', () => {
      const data = { ...compraValidaData, valorTotal: 200.00 }; // Deveria ser 105.00

      expect(() => new Compra(data)).toThrow('valorTotal não corresponde à soma dos subtotais');
    });
  });

  describe('Validação de status', () => {
    it('deve aceitar status pendente', () => {
      const data = { ...compraValidaData, status: 'pendente' };
      const compra = new Compra(data);

      expect(compra.status).toBe('pendente');
    });

    it('deve aceitar status concluida', () => {
      const data = { ...compraValidaData, status: 'concluida' };
      const compra = new Compra(data);

      expect(compra.status).toBe('concluida');
    });

    it('deve aceitar status cancelada', () => {
      const data = { ...compraValidaData, status: 'cancelada' };
      const compra = new Compra(data);

      expect(compra.status).toBe('cancelada');
    });

    it('deve rejeitar status inválido', () => {
      const data = { ...compraValidaData, status: 'em_andamento' };

      expect(() => new Compra(data)).toThrow('status deve ser um dos seguintes');
    });
  });

  describe('Métodos', () => {
    it('touch() deve atualizar atualizadoEm', () => {
      const compra = new Compra(compraValidaData);
      const atualizadoEmAntes = compra.atualizadoEm;

      // Aguardar um pouco para garantir diferença de timestamp
      setTimeout(() => {
        compra.touch();
        expect(compra.atualizadoEm).not.toBe(atualizadoEmAntes);
      }, 10);
    });

    it('toJSON() deve retornar objeto simples', () => {
      const compra = new Compra(compraValidaData);
      const json = compra.toJSON();

      expect(json).toEqual({
        id: compra.id,
        fornecedorId: 'fornecedor_123',
        insumos: compraValidaData.insumos,
        formaPagamento: 'pix',
        valorTotal: 105.00,
        observacoes: 'Compra de teste',
        status: 'pendente',
        criadoEm: compra.criadoEm,
        atualizadoEm: compra.atualizadoEm
      });
    });

    it('fromJSON() deve criar instância a partir de objeto', () => {
      const data = { ...compraValidaData, id: 'compra_123' };
      const compra = Compra.fromJSON(data);

      expect(compra).toBeInstanceOf(Compra);
      expect(compra.id).toBe('compra_123');
      expect(compra.fornecedorId).toBe('fornecedor_123');
    });
  });

  describe('Métodos estáticos', () => {
    it('calcularValorTotal() deve calcular corretamente', () => {
      const insumos = [
        { insumoId: 'i1', quantidade: 10, custoUnitario: 5.50, subtotal: 55.00 },
        { insumoId: 'i2', quantidade: 5, custoUnitario: 10.00, subtotal: 50.00 }
      ];

      const total = Compra.calcularValorTotal(insumos);

      expect(total).toBe(105.00);
    });

    it('calcularSubtotal() deve calcular corretamente', () => {
      const subtotal = Compra.calcularSubtotal(10, 5.50);

      expect(subtotal).toBe(55.00);
    });

    it('calcularSubtotal() deve lidar com decimais', () => {
      const subtotal = Compra.calcularSubtotal(3, 1.99);

      expect(subtotal).toBeCloseTo(5.97, 2);
    });
  });
});
