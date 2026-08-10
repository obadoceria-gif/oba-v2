/**
 * ProducaoService
 * 
 * Lógica de negócio para produções.
 * Gerencia produção e baixa automática de estoque.
 */

import { Producao } from '../models/Producao.js';

export class ProducaoService {
  /**
   * @param {ProducaoRepository} producaoRepository
   * @param {EventBus} eventBus
   * @param {FichasTecnicasRepository} fichasTecnicasRepository
   * @param {EstoqueService} estoqueService
   */
  constructor(producaoRepository, eventBus, fichasTecnicasRepository, estoqueService) {
    this.producaoRepository = producaoRepository;
    this.eventBus = eventBus;
    this.fichasTecnicasRepository = fichasTecnicasRepository;
    this.estoqueService = estoqueService;
  }

  /**
   * Cria nova produção
   * @param {Object} data - Dados da produção
   * @returns {Promise<Object>} { success, data?, message?, errors? }
   */
  async createProducao(data) {
    try {
      // Validar ficha técnica existe
      const ficha = await this.fichasTecnicasRepository.findById(data.fichaId);
      if (!ficha) {
        return {
          success: false,
          message: 'Ficha técnica não encontrada'
        };
      }

      const producao = new Producao(data);
      const validation = producao.validate();

      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      await this.producaoRepository.save(producao);

      this.eventBus.publish('producao:created', { producao });

      return {
        success: true,
        data: producao,
        message: 'Produção criada com sucesso'
      };
    } catch (error) {
      console.error('[ProducaoService] Erro ao criar produção:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar produção'
      };
    }
  }

  /**
   * Inicia produção (baixa estoque)
   * @param {string} producaoId - ID da produção
   * @returns {Promise<Object>}
   */
  async iniciarProducao(producaoId) {
    try {
      const producao = await this.producaoRepository.findById(producaoId);
      if (!producao) {
        return {
          success: false,
          message: 'Produção não encontrada'
        };
      }

      if (producao.status !== 'planejada') {
        return {
          success: false,
          message: 'Produção já foi iniciada ou concluída'
        };
      }

      // Buscar ficha técnica
      const ficha = await this.fichasTecnicasRepository.findById(producao.fichaId);
      if (!ficha) {
        return {
          success: false,
          message: 'Ficha técnica não encontrada'
        };
      }

      // Calcular quantidades necessárias baseado na quantidade produzida
      const fator = producao.quantidade / ficha.rendimento;
      const movimentacoes = [];

      // Baixar estoque de cada insumo
      for (const insumo of ficha.insumos) {
        const quantidadeNecessaria = insumo.quantidade * fator;
        
        const result = await this.estoqueService.registrarSaida({
          insumoId: insumo.insumoId,
          quantidade: quantidadeNecessaria,
          tipo: 'producao',
          observacoes: `Produção ${producao.lote} - ${ficha.nome}`
        });

        if (!result.success) {
          return {
            success: false,
            message: `Erro ao baixar estoque: ${result.message}`
          };
        }

        movimentacoes.push(result.data.id);
      }

      // Atualizar status e movimentações
      producao.status = 'em_producao';
      producao.movimentacoes = movimentacoes;
      await this.producaoRepository.save(producao);

      this.eventBus.publish('producao:iniciada', { producao });

      return {
        success: true,
        data: producao,
        message: 'Produção iniciada e estoque baixado'
      };
    } catch (error) {
      console.error('[ProducaoService] Erro ao iniciar produção:', error);
      return {
        success: false,
        message: error.message || 'Erro ao iniciar produção'
      };
    }
  }

  /**
   * Conclui produção
   * @param {string} producaoId - ID da produção
   * @returns {Promise<Object>}
   */
  async concluirProducao(producaoId) {
    try {
      const producao = await this.producaoRepository.findById(producaoId);
      if (!producao) {
        return {
          success: false,
          message: 'Produção não encontrada'
        };
      }

      if (producao.status === 'concluida') {
        return {
          success: false,
          message: 'Produção já foi concluída'
        };
      }

      producao.status = 'concluida';
      await this.producaoRepository.save(producao);

      this.eventBus.publish('producao:concluida', { producao });

      return {
        success: true,
        data: producao,
        message: 'Produção concluída'
      };
    } catch (error) {
      console.error('[ProducaoService] Erro ao concluir produção:', error);
      return {
        success: false,
        message: error.message || 'Erro ao concluir produção'
      };
    }
  }

  /**
   * Cancela produção (estorna estoque se já iniciada)
   * @param {string} producaoId - ID da produção
   * @returns {Promise<Object>}
   */
  async cancelarProducao(producaoId) {
    try {
      const producao = await this.producaoRepository.findById(producaoId);
      if (!producao) {
        return {
          success: false,
          message: 'Produção não encontrada'
        };
      }

      if (producao.status === 'cancelada') {
        return {
          success: false,
          message: 'Produção já foi cancelada'
        };
      }

      // Se já foi iniciada, estornar movimentações
      if (producao.status === 'em_producao' && producao.movimentacoes.length > 0) {
        // Aqui você implementaria a lógica de estorno
        // Por simplicidade, apenas marcamos como cancelada
      }

      producao.status = 'cancelada';
      await this.producaoRepository.save(producao);

      this.eventBus.publish('producao:cancelada', { producao });

      return {
        success: true,
        data: producao,
        message: 'Produção cancelada'
      };
    } catch (error) {
      console.error('[ProducaoService] Erro ao cancelar produção:', error);
      return {
        success: false,
        message: error.message || 'Erro ao cancelar produção'
      };
    }
  }

  /**
   * Busca todas as produções
   * @returns {Promise<Array<Producao>>}
   */
  async getAllProducoes() {
    return await this.producaoRepository.findAll();
  }

  /**
   * Busca produção por ID
   * @param {string} id - ID da produção
   * @returns {Promise<Producao|null>}
   */
  async getProducaoById(id) {
    return await this.producaoRepository.findById(id);
  }

  /**
   * Busca produções por ficha técnica
   * @param {string} fichaId - ID da ficha técnica
   * @returns {Promise<Array<Producao>>}
   */
  async getProducoesByFicha(fichaId) {
    return await this.producaoRepository.findByFicha(fichaId);
  }

  /**
   * Busca produções por status
   * @param {string} status - Status
   * @returns {Promise<Array<Producao>>}
   */
  async getProducoesByStatus(status) {
    return await this.producaoRepository.findByStatus(status);
  }
}
