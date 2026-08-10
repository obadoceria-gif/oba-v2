/**
 * ComprasService
 * 
 * Serviço para gerenciar lógica de negócio de compras.
 * Responsável por criar compras e integrar com o estoque.
 */

import { Compra } from '../models/Compra.js';
import { FornecedoresRepository } from '../../fornecedores/repositories/FornecedoresRepository.js';

export class ComprasService {
  /**
   * @param {ComprasRepository} comprasRepository - Repository de compras
   * @param {FornecedoresRepository} fornecedoresRepository - Repository de fornecedores
   * @param {EstoqueService} estoqueService - Service de estoque
   * @param {EventBus} eventBus - Event bus para emitir eventos
   */
  constructor(comprasRepository, fornecedoresRepository, estoqueService, eventBus) {
    if (!comprasRepository) {
      throw new Error('ComprasRepository é obrigatório');
    }
    if (!fornecedoresRepository) {
      throw new Error('FornecedoresRepository é obrigatório');
    }
    if (!estoqueService) {
      throw new Error('EstoqueService é obrigatório');
    }
    if (!eventBus) {
      throw new Error('EventBus é obrigatório');
    }

    this.comprasRepository = comprasRepository;
    this.fornecedoresRepository = fornecedoresRepository;
    this.estoqueService = estoqueService;
    this.eventBus = eventBus;
  }

  /**
   * Cria uma nova compra e atualiza o estoque
   * 
   * @param {Object} data - Dados da compra
   * @param {string} data.fornecedorId - ID do fornecedor
   * @param {Array} data.insumos - Lista de insumos
   * @param {string} data.formaPagamento - Forma de pagamento
   * @param {string} [data.observacoes] - Observações
   * @returns {Promise<Compra>}
   */
  async criarCompra(data) {
    // Validar fornecedor existe
    const fornecedor = await this.fornecedoresRepository.getById(data.fornecedorId);
    if (!fornecedor) {
      throw new Error(`Fornecedor ${data.fornecedorId} não encontrado`);
    }

    // Validar fornecedor ativo
    if (!fornecedor.ativo) {
      throw new Error(`Fornecedor ${fornecedor.nome} está inativo`);
    }

    // Calcular subtotais e valor total
    const insumosComSubtotal = data.insumos.map(item => ({
      ...item,
      subtotal: Compra.calcularSubtotal(item.quantidade, item.custoUnitario)
    }));

    const valorTotal = Compra.calcularValorTotal(insumosComSubtotal);

    // Criar compra
    const compra = new Compra({
      fornecedorId: data.fornecedorId,
      insumos: insumosComSubtotal,
      formaPagamento: data.formaPagamento,
      valorTotal,
      observacoes: data.observacoes || '',
      status: 'pendente'
    });

    // Salvar compra
    await this.comprasRepository.save(compra);

    // Emitir evento de compra criada
    this.eventBus.publish('compra:criada', {
      compraId: compra.id,
      fornecedorId: compra.fornecedorId,
      valorTotal: compra.valorTotal
    });

    return compra;
  }

  /**
   * Confirma uma compra e atualiza o estoque
   * 
   * @param {string} compraId - ID da compra
   * @returns {Promise<Compra>}
   */
  async confirmarCompra(compraId) {
    // Buscar compra
    const compra = await this.comprasRepository.getById(compraId);
    if (!compra) {
      throw new Error(`Compra ${compraId} não encontrada`);
    }

    // Validar status
    if (compra.status !== 'pendente') {
      throw new Error(`Compra ${compraId} não está pendente (status: ${compra.status})`);
    }

    // Atualizar estoque para cada insumo
    for (const item of compra.insumos) {
      await this.estoqueService.createMovimentacao({
        tipo: 'entrada',
        insumoId: item.insumoId,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
        origem: 'compra',
        origemId: compra.id,
        observacoes: `Compra #${compra.id.substring(0, 8)}`
      });
    }

    // Atualizar status da compra
    compra.status = 'concluida';
    compra.touch();

    await this.comprasRepository.update(compra.id, compra);

    // Emitir evento de compra confirmada
    this.eventBus.publish('compra:confirmada', {
      compraId: compra.id,
      fornecedorId: compra.fornecedorId,
      insumos: compra.insumos.map(i => ({
        insumoId: i.insumoId,
        quantidade: i.quantidade
      }))
    });

    return compra;
  }

  /**
   * Cancela uma compra
   * 
   * @param {string} compraId - ID da compra
   * @param {string} motivo - Motivo do cancelamento
   * @returns {Promise<Compra>}
   */
  async cancelarCompra(compraId, motivo) {
    // Buscar compra
    const compra = await this.comprasRepository.getById(compraId);
    if (!compra) {
      throw new Error(`Compra ${compraId} não encontrada`);
    }

    // Validar status
    if (compra.status === 'cancelada') {
      throw new Error(`Compra ${compraId} já está cancelada`);
    }

    if (compra.status === 'concluida') {
      throw new Error(`Compra ${compraId} já foi concluída e não pode ser cancelada`);
    }

    // Atualizar status
    compra.status = 'cancelada';
    compra.observacoes = `${compra.observacoes}\nCancelada: ${motivo}`.trim();
    compra.touch();

    await this.comprasRepository.update(compra.id, compra);

    // Emitir evento de compra cancelada
    this.eventBus.publish('compra:cancelada', {
      compraId: compra.id,
      fornecedorId: compra.fornecedorId,
      motivo
    });

    return compra;
  }

  /**
   * Busca compra por ID
   * @param {string} compraId - ID da compra
   * @returns {Promise<Compra|null>}
   */
  async getCompraById(compraId) {
    return await this.comprasRepository.getById(compraId);
  }

  /**
   * Retorna todas as compras
   * @returns {Promise<Compra[]>}
   */
  async getAllCompras() {
    return await this.comprasRepository.getAll();
  }

  /**
   * Busca compras por fornecedor
   * @param {string} fornecedorId - ID do fornecedor
   * @returns {Promise<Compra[]>}
   */
  async getComprasByFornecedor(fornecedorId) {
    return await this.comprasRepository.getByFornecedor(fornecedorId);
  }

  /**
   * Busca compras por período
   * @param {string} dataInicio - Data inicial (ISO)
   * @param {string} dataFim - Data final (ISO)
   * @returns {Promise<Compra[]>}
   */
  async getComprasByPeriodo(dataInicio, dataFim) {
    return await this.comprasRepository.getByData(dataInicio, dataFim);
  }

  /**
   * Busca compras por status
   * @param {string} status - Status da compra
   * @returns {Promise<Compra[]>}
   */
  async getComprasByStatus(status) {
    return await this.comprasRepository.getByStatus(status);
  }

  /**
   * Calcula total de compras por fornecedor em um período
   * @param {string} fornecedorId - ID do fornecedor
   * @param {string} dataInicio - Data inicial (ISO)
   * @param {string} dataFim - Data final (ISO)
   * @returns {Promise<number>}
   */
  async calcularTotalComprasFornecedor(fornecedorId, dataInicio, dataFim) {
    const compras = await this.comprasRepository.getByFornecedor(fornecedorId);
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    const comprasPeriodo = compras.filter(compra => {
      const dataCompra = new Date(compra.criadoEm);
      return dataCompra >= inicio && dataCompra <= fim && compra.status === 'concluida';
    });

    return comprasPeriodo.reduce((total, compra) => total + compra.valorTotal, 0);
  }

  /**
   * Retorna estatísticas de compras
   * @returns {Promise<Object>}
   */
  async getEstatisticas() {
    const todasCompras = await this.comprasRepository.getAll();

    const pendentes = todasCompras.filter(c => c.status === 'pendente').length;
    const concluidas = todasCompras.filter(c => c.status === 'concluida').length;
    const canceladas = todasCompras.filter(c => c.status === 'cancelada').length;

    const valorTotalConcluidas = todasCompras
      .filter(c => c.status === 'concluida')
      .reduce((total, c) => total + c.valorTotal, 0);

    return {
      total: todasCompras.length,
      pendentes,
      concluidas,
      canceladas,
      valorTotalConcluidas
    };
  }
}
