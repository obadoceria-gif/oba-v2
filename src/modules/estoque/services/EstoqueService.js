/**
 * EstoqueService
 * 
 * Serviço para gerenciar operações de estoque.
 * 
 * Requirements:
 * - 3.3: Método removerSaida
 * - 3.4: Cálculo de custo médio ponderado
 * - 3.5: Validação de quantidade suficiente
 * - 3.6: Rejeição de saída com estoque insuficiente
 * - 3.7: Método isAbaixoMinimo
 * - 11.8: Emitir evento ESTOQUE_BAIXO
 */

import { Estoque } from '../models/Estoque.js';
import { Movimentacao } from '../models/Movimentacao.js';

export class EstoqueService {
  /**
   * @param {EstoqueRepository} estoqueRepository - Repository de estoques
   * @param {MovimentacoesRepository} movimentacoesRepository - Repository de movimentações
   * @param {EventBus} eventBus - Event bus para emitir eventos
   */
  constructor(estoqueRepository, movimentacoesRepository, eventBus) {
    if (!estoqueRepository) {
      throw new Error('EstoqueRepository é obrigatório');
    }
    if (!movimentacoesRepository) {
      throw new Error('MovimentacoesRepository é obrigatório');
    }
    if (!eventBus) {
      throw new Error('EventBus é obrigatório');
    }

    this.estoqueRepository = estoqueRepository;
    this.movimentacoesRepository = movimentacoesRepository;
    this.eventBus = eventBus;
  }

  /**
   * Cria uma movimentação de estoque (entrada ou saída)
   * 
   * @param {Object} data - Dados da movimentação
   * @param {string} data.tipo - Tipo: 'entrada' ou 'saida'
   * @param {string} data.insumoId - ID do insumo
   * @param {number} data.quantidade - Quantidade
   * @param {number} data.custoUnitario - Custo unitário em centavos
   * @param {string} data.origem - Origem (ex: 'compra', 'producao', 'ajuste')
   * @param {string} data.origemId - ID da origem (opcional)
   * @param {string} data.observacoes - Observações (opcional)
   * @returns {Promise<{estoque: Estoque, movimentacao: Movimentacao}>}
   * 
   * Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 11.8
   */
  async createMovimentacao(data) {
    // Validar dados
    if (!data.tipo || !['entrada', 'saida'].includes(data.tipo)) {
      throw new Error('Tipo deve ser "entrada" ou "saida"');
    }

    if (!data.insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    if (typeof data.quantidade !== 'number' || data.quantidade <= 0) {
      throw new Error('Quantidade deve ser um número positivo');
    }

    if (typeof data.custoUnitario !== 'number' || data.custoUnitario < 0) {
      throw new Error('Custo unitário deve ser um número não-negativo');
    }

    if (!data.origem) {
      throw new Error('Origem é obrigatória');
    }

    // Buscar ou criar estoque
    let estoque = await this.estoqueRepository.getByInsumoId(data.insumoId);
    
    if (!estoque) {
      // Criar novo estoque se não existir
      estoque = new Estoque(data.insumoId, 0, 0);
    }

    // Aplicar movimentação
    if (data.tipo === 'entrada') {
      estoque.adicionarEntrada(data.quantidade, data.custoUnitario);
    } else {
      // Validar estoque suficiente antes de remover
      estoque.removerSaida(data.quantidade);
    }

    // Salvar estoque atualizado
    if (await this.estoqueRepository.getByInsumoId(data.insumoId)) {
      await this.estoqueRepository.update(data.insumoId, estoque);
    } else {
      await this.estoqueRepository.save(estoque);
    }

    // Criar e salvar movimentação
    const movimentacao = new Movimentacao({
      insumoId: data.insumoId,
      tipo: data.tipo,
      quantidade: data.quantidade,
      custoUnitario: data.custoUnitario,
      origem: data.origem,
      origemId: data.origemId,
      observacoes: data.observacoes
    });

    await this.movimentacoesRepository.save(movimentacao);

    // Emitir evento de movimentação
    this.eventBus.publish(`estoque:${data.tipo}`, {
      insumoId: data.insumoId,
      quantidade: data.quantidade,
      movimentacaoId: movimentacao.id
    });

    return { estoque, movimentacao };
  }

  /**
   * Verifica se estoque está abaixo do mínimo e emite evento se necessário
   * 
   * @param {string} insumoId - ID do insumo
   * @param {number} estoqueMinimo - Quantidade mínima
   * @returns {Promise<boolean>} - true se está abaixo do mínimo
   * 
   * Requirements: 3.7, 11.8
   */
  async checkEstoqueBaixo(insumoId, estoqueMinimo) {
    if (!insumoId) {
      throw new Error('insumoId é obrigatório');
    }

    if (typeof estoqueMinimo !== 'number' || estoqueMinimo < 0) {
      return false;
    }

    const estoque = await this.estoqueRepository.getByInsumoId(insumoId);
    
    if (!estoque) {
      return false;
    }

    const isAbaixo = estoque.isAbaixoMinimo(estoqueMinimo);

    if (isAbaixo) {
      // Emitir evento ESTOQUE_BAIXO
      this.eventBus.publish('estoque:baixo', {
        insumoId,
        quantidadeAtual: estoque.quantidadeAtual,
        estoqueMinimo
      });
    }

    return isAbaixo;
  }

  /**
   * Busca estoque por ID do insumo
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<Estoque|null>}
   */
  async getEstoqueByInsumoId(insumoId) {
    return await this.estoqueRepository.getByInsumoId(insumoId);
  }

  /**
   * Retorna todos os estoques
   * @returns {Promise<Estoque[]>}
   */
  async getAllEstoques() {
    return await this.estoqueRepository.getAll();
  }

  /**
   * Busca movimentações de um insumo
   * @param {string} insumoId - ID do insumo
   * @returns {Promise<Movimentacao[]>}
   */
  async getMovimentacoesByInsumo(insumoId) {
    return await this.movimentacoesRepository.getByInsumoId(insumoId);
  }

  /**
   * Busca movimentações com filtros
   * @param {Object} filters - Filtros
   * @returns {Promise<Movimentacao[]>}
   */
  async getMovimentacoes(filters) {
    return await this.movimentacoesRepository.findByFilters(filters);
  }

  /**
   * Retorna todas as movimentações
   * @returns {Promise<Movimentacao[]>}
   */
  async getAllMovimentacoes() {
    return await this.movimentacoesRepository.getAll();
  }
}
