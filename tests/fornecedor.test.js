import { describe, it, expect } from 'vitest';
import { Fornecedor } from '../src/modules/compras/models/Fornecedor.js';

describe('Fornecedor Model', () => {
  const fornecedorValidoData = {
    nome: 'Fornecedor Teste Ltda',
    cnpj: '11.222.333/0001-81',

    cnpj: '11.222.333/0001-81',
    telefone: '(11) 98765-4321',
    email: 'contato@fornecedor.com',
    endereco: 'Rua Teste, 123 - São Paulo/SP'
  };

  describe('Criação', () => {
    it('deve criar um fornecedor válido', () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);

      expect(fornecedor.id).toBeDefined();
      expect(fornecedor.nome).toBe('Fornecedor Teste Ltda');
      expect(fornecedor.telefone).toBe('(11) 98765-4321');
      expect(fornecedor.email).toBe('contato@fornecedor.com');
      expect(fornecedor.endereco).toBe('Rua Teste, 123 - São Paulo/SP');
      expect(fornecedor.ativo).toBe(true);
      expect(fornecedor.criadoEm).toBeDefined();
      expect(fornecedor.atualizadoEm).toBeDefined();
    });

    it('deve gerar ID único automaticamente', () => {
      const fornecedor1 = new Fornecedor(fornecedorValidoData);
      const fornecedor2 = new Fornecedor(fornecedorValidoData);

      expect(fornecedor1.id).not.toBe(fornecedor2.id);
      expect(fornecedor1.id).toMatch(/^fornecedor_/);
    });

    it('deve usar ID fornecido se presente', () => {
      const data = { ...fornecedorValidoData, id: 'fornecedor_custom_123' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.id).toBe('fornecedor_custom_123');
    });

    it('deve definir ativo como true por padrão', () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);

      expect(fornecedor.ativo).toBe(true);
    });

    it('deve aceitar ativo como false', () => {
      const data = { ...fornecedorValidoData, ativo: false };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.ativo).toBe(false);
    });

    it('deve definir campos opcionais como string vazia se não fornecidos', () => {
      const data = { nome: 'Fornecedor Simples', cnpj: '22.333.444/0001-05' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.telefone).toBe('');
      expect(fornecedor.email).toBe('');
      expect(fornecedor.endereco).toBe('');
    });
  });

  describe('Validação de nome', () => {
    it('deve rejeitar fornecedor sem nome', () => {
      const data = { ...fornecedorValidoData };
      delete data.nome;

      expect(() => new Fornecedor(data)).toThrow('nome é obrigatório');
    });

    it('deve rejeitar nome vazio', () => {
      const data = { ...fornecedorValidoData, nome: '' };

      expect(() => new Fornecedor(data)).toThrow('nome é obrigatório');
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const data = { ...fornecedorValidoData, nome: 'A' };

      expect(() => new Fornecedor(data)).toThrow('nome deve ter pelo menos 2 caracteres');
    });

    it('deve aceitar nome com 2 caracteres', () => {
      const data = { ...fornecedorValidoData, nome: 'AB' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.nome).toBe('AB');
    });

    it('deve aceitar nome longo', () => {
      const data = { ...fornecedorValidoData, nome: 'Fornecedor de Insumos e Materiais Diversos Ltda ME' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.nome).toBe('Fornecedor de Insumos e Materiais Diversos Ltda ME');
    });
  });

  describe('Validação de email', () => {
    it('deve aceitar email válido', () => {
      const data = { ...fornecedorValidoData, email: 'teste@exemplo.com' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.email).toBe('teste@exemplo.com');
    });

    it('deve aceitar email vazio', () => {
      const data = { ...fornecedorValidoData, email: '' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.email).toBe('');
    });

    it('deve rejeitar email inválido sem @', () => {
      const data = { ...fornecedorValidoData, email: 'emailinvalido.com' };

      expect(() => new Fornecedor(data)).toThrow('email inválido');
    });

    it('deve rejeitar email inválido sem domínio', () => {
      const data = { ...fornecedorValidoData, email: 'email@' };

      expect(() => new Fornecedor(data)).toThrow('email inválido');
    });

    it('deve rejeitar email inválido sem extensão', () => {
      const data = { ...fornecedorValidoData, email: 'email@dominio' };

      expect(() => new Fornecedor(data)).toThrow('email inválido');
    });
  });

  describe('Validação de telefone', () => {
    it('deve aceitar telefone com formato (XX) XXXXX-XXXX', () => {
      const data = { ...fornecedorValidoData, telefone: '(11) 98765-4321' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.telefone).toBe('(11) 98765-4321');
    });

    it('deve aceitar telefone com formato (XX) XXXX-XXXX', () => {
      const data = { ...fornecedorValidoData, telefone: '(11) 3456-7890' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.telefone).toBe('(11) 3456-7890');
    });

    it('deve aceitar telefone sem formatação', () => {
      const data = { ...fornecedorValidoData, telefone: '11987654321' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.telefone).toBe('11987654321');
    });

    it('deve aceitar telefone vazio', () => {
      const data = { ...fornecedorValidoData, telefone: '' };
      const fornecedor = new Fornecedor(data);

      expect(fornecedor.telefone).toBe('');
    });

    it('deve rejeitar telefone com formato inválido', () => {
      const data = { ...fornecedorValidoData, telefone: '123' };

      expect(() => new Fornecedor(data)).toThrow('telefone inválido');
    });

    it('deve rejeitar telefone com letras', () => {
      const data = { ...fornecedorValidoData, telefone: '(11) ABCDE-FGHI' };

      expect(() => new Fornecedor(data)).toThrow('telefone inválido');
    });
  });

  describe('Validação de ativo', () => {
    it('deve rejeitar ativo não booleano', () => {
      const data = { ...fornecedorValidoData, ativo: 'sim' };

      expect(() => new Fornecedor(data)).toThrow('ativo deve ser um booleano');
    });

    it('deve rejeitar ativo como número', () => {
      const data = { ...fornecedorValidoData, ativo: 1 };

      expect(() => new Fornecedor(data)).toThrow('ativo deve ser um booleano');
    });
  });

  describe('Métodos', () => {
    it('touch() deve atualizar atualizadoEm', async () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);
      const atualizadoEmAntes = fornecedor.atualizadoEm;

      // Aguardar um pouco para garantir diferença de timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      fornecedor.touch();

      expect(fornecedor.atualizadoEm).not.toBe(atualizadoEmAntes);
    });

    it('ativar() deve definir ativo como true', () => {
      const data = { ...fornecedorValidoData, ativo: false };
      const fornecedor = new Fornecedor(data);

      fornecedor.ativar();

      expect(fornecedor.ativo).toBe(true);
    });

    it('desativar() deve definir ativo como false', () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);

      fornecedor.desativar();

      expect(fornecedor.ativo).toBe(false);
    });

    it('ativar() deve atualizar atualizadoEm', async () => {
      const data = { ...fornecedorValidoData, ativo: false };
      const fornecedor = new Fornecedor(data);
      const atualizadoEmAntes = fornecedor.atualizadoEm;

      await new Promise(resolve => setTimeout(resolve, 10));
      fornecedor.ativar();

      expect(fornecedor.atualizadoEm).not.toBe(atualizadoEmAntes);
    });

    it('desativar() deve atualizar atualizadoEm', async () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);
      const atualizadoEmAntes = fornecedor.atualizadoEm;

      await new Promise(resolve => setTimeout(resolve, 10));
      fornecedor.desativar();

      expect(fornecedor.atualizadoEm).not.toBe(atualizadoEmAntes);
    });

    it('toJSON() deve retornar objeto simples', () => {
      const fornecedor = new Fornecedor(fornecedorValidoData);
      const json = fornecedor.toJSON();

      expect(json).toEqual({
        id: fornecedor.id,
        nome: 'Fornecedor Teste Ltda',

        cnpj: '11.222.333/0001-81',
        telefone: '(11) 98765-4321',
        email: 'contato@fornecedor.com',
        endereco: 'Rua Teste, 123 - São Paulo/SP',
        ativo: true,
        criadoEm: fornecedor.criadoEm,
        atualizadoEm: fornecedor.atualizadoEm
      });
    });

    it('fromJSON() deve criar instância a partir de objeto', () => {
      const data = { ...fornecedorValidoData, id: 'fornecedor_123' };
      const fornecedor = Fornecedor.fromJSON(data);

      expect(fornecedor).toBeInstanceOf(Fornecedor);
      expect(fornecedor.id).toBe('fornecedor_123');
      expect(fornecedor.nome).toBe('Fornecedor Teste Ltda');
    });
  });
});

