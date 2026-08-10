/**
 * ComprasController
 * 
 * Controlador para o módulo de compras.
 * Gerencia a comunicação entre a camada de serviço e a camada de visualização.
 * Orquestra operações de compras e fornecedores.
 */

import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class ComprasController {
  /**
   * @param {ComprasService} comprasService - Serviço de compras
   * @param {ComprasView} view - View de compras (será implementada na Tarefa 23)
   */
  constructor(comprasService, view) {
    if (!comprasService) {
      throw new Error('ComprasService é obrigatório');
    }
    if (!view) {
      throw new Error('ComprasView é obrigatório');
    }

    this.comprasService = comprasService;
    this.view = view;
    this.toast = getToast();
    this.loading = getLoading();
    
    // Bind dos métodos para manter contexto correto
    this.handleCreateCompra = this.handleCreateCompra.bind(this);
    this.handleConfirmarCompra = this.handleConfirmarCompra.bind(this);
    this.handleCancelarCompra = this.handleCancelarCompra.bind(this);
    this.handleLoadCompras = this.handleLoadCompras.bind(this);
    this.handleLoadComprasByFornecedor = this.handleLoadComprasByFornecedor.bind(this);
    this.handleLoadComprasByStatus = this.handleLoadComprasByStatus.bind(this);
    this.handleSelectCompra = this.handleSelectCompra.bind(this);
    this.handleLoadEstatisticas = this.handleLoadEstatisticas.bind(this);
  }

  /**
   * Handler para criação de compra
   * @param {Object} data - Dados da compra
   * @param {string} data.fornecedorId - ID do fornecedor
   * @param {Array} data.insumos - Lista de insumos
   * @param {string} data.formaPagamento - Forma de pagamento
   * @param {string} [data.observacoes] - Observações
   */
  async handleCreateCompra(data) {
    const loadingId = this.loading.show('Criando compra...');
    
    try {
      const compra = await this.comprasService.criarCompra(data);
      
      this.toast.success(
        `Compra #${compra.id.substring(0, 8)} criada com sucesso!`
      );
      
      // Recarregar lista de compras
      await this.handleLoadCompras();
      
      return compra;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao criar compra');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para criação de fornecedor
   * @param {Object} data - Dados do fornecedor
   * @param {string} data.nome - Nome do fornecedor
   * @param {string} data.cnpj - CNPJ do fornecedor
   * @param {string} [data.telefone] - Telefone do fornecedor
   * @param {string} [data.email] - Email do fornecedor
   */
  async handleCreateFornecedor(data) {
    const loadingId = this.loading.show('Cadastrando fornecedor...');
    
    try {
      // Validar CNPJ duplicado
      const fornecedores = await this.comprasService.fornecedoresRepository.getAll();
      const cnpjExistente = fornecedores.find(f => f.cnpj === data.cnpj);
      
      if (cnpjExistente) {
        const errorMessage = `CNPJ ${data.cnpj} já cadastrado para o fornecedor "${cnpjExistente.nome}"`;
        
        // Usar Toast diretamente (mais confiável que EventBus)
        this.toast.error(errorMessage);
        
        // Lançar erro para interromper fluxo
        throw new Error('CNPJ já cadastrado');
      }
      
      // Importa o modelo Fornecedor dinamicamente
      const { Fornecedor } = await import('../models/Fornecedor.js');
      
      // Cria o fornecedor
      const fornecedor = new Fornecedor({
        nome: data.nome,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        ativo: true
      });
      
      // Salva via repository
      await this.comprasService.fornecedoresRepository.save(fornecedor);
      
      const successMessage = `Fornecedor "${fornecedor.nome}" cadastrado com sucesso!`;
      
      // Usar Toast diretamente (mais confiável que EventBus)
      this.toast.success(successMessage);
      
      return fornecedor;
    } catch (error) {
      // Só mostrar erro se não for CNPJ duplicado (já foi mostrado acima)
      if (error.message !== 'CNPJ já cadastrado') {
        const errorMessage = error.message || 'Erro ao cadastrar fornecedor';
        this.toast.error(errorMessage);
      }
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para criação de insumo
   * @param {Object} data - Dados do insumo
   * @param {string} data.nome - Nome do insumo
   * @param {string} data.categoria - Categoria do insumo
   * @param {string} data.unidadeMedida - Unidade de medida
   * @param {number} data.custoUnitario - Custo unitário
   * @param {number} [data.estoqueMinimo] - Estoque mínimo
   */
  async handleCreateInsumo(data) {
    const loadingId = this.loading.show('Cadastrando insumo...');
    
    try {
      // Importa o modelo Insumo dinamicamente
      const { Insumo } = await import('../../insumos/models/Insumo.js');
      
      // Cria o insumo
      const insumo = new Insumo({
        nome: data.nome,
        categoria: data.categoria,
        unidadeMedida: data.unidadeMedida,
        custoUnitario: data.custoUnitario,
        estoqueMinimo: data.estoqueMinimo || 0
      });
      
      // Salva via repository (precisa acessar o repository de insumos)
      const { InsumosRepository } = await import('../../insumos/repositories/InsumosRepository.js');
      const insumosRepository = new InsumosRepository();
      await insumosRepository.save(insumo);
      
      this.toast.success(
        `Insumo "${insumo.nome}" cadastrado com sucesso!`
      );
      
      return insumo;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao cadastrar insumo');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para confirmar compra
   * @param {string} compraId - ID da compra
   */
  async handleConfirmarCompra(compraId) {
    const loadingId = this.loading.show('Confirmando compra...');
    
    try {
      const compra = await this.comprasService.confirmarCompra(compraId);
      
      this.toast.success(
        `Compra #${compra.id.substring(0, 8)} confirmada! Estoque atualizado.`
      );
      
      // Recarregar lista de compras e estatísticas
      await this.handleLoadCompras();
      await this.handleLoadEstatisticas();
      
      return compra;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao confirmar compra');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para cancelar compra
   * @param {Object} data - Dados do cancelamento
   * @param {string} data.compraId - ID da compra
   * @param {string} data.motivo - Motivo do cancelamento
   */
  async handleCancelarCompra(data) {
    const loadingId = this.loading.show('Cancelando compra...');
    
    try {
      const { compraId, motivo } = data;
      
      const compra = await this.comprasService.cancelarCompra(compraId, motivo);
      
      this.toast.success(
        `Compra #${compra.id.substring(0, 8)} cancelada.`
      );
      
      // Recarregar lista de compras
      await this.handleLoadCompras();
      
      return compra;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao cancelar compra');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar todas as compras
   */
  async handleLoadCompras() {
    const loadingId = this.loading.show('Carregando compras...');
    
    try {
      const compras = await this.comprasService.getAllCompras();
      
      this.view.renderComprasList(compras);
      
      return compras;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar compras');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar compras por fornecedor
   * @param {string} fornecedorId - ID do fornecedor
   */
  async handleLoadComprasByFornecedor(fornecedorId) {
    const loadingId = this.loading.show('Carregando compras do fornecedor...');
    
    try {
      const compras = await this.comprasService.getComprasByFornecedor(fornecedorId);
      
      this.view.renderComprasList(compras);
      
      return compras;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar compras');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar compras por status
   * @param {string} status - Status da compra (pendente, concluida, cancelada)
   */
  async handleLoadComprasByStatus(status) {
    const loadingId = this.loading.show('Carregando compras...');
    
    try {
      const compras = await this.comprasService.getComprasByStatus(status);
      
      this.view.renderComprasList(compras);
      
      return compras;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar compras');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para selecionar compra (para visualização de detalhes)
   * @param {string} compraId - ID da compra
   */
  async handleSelectCompra(compraId) {
    try {
      const compra = await this.comprasService.getCompraById(compraId);
      
      if (!compra) {
        this.toast.error('Compra não encontrada');
        return;
      }
      
      this.view.showCompraDetails(compra);
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar compra');
      throw error;
    }
  }

  /**
   * Handler para carregar estatísticas de compras
   */
  async handleLoadEstatisticas() {
    try {
      const stats = await this.comprasService.getEstatisticas();
      
      this.view.renderEstatisticas(stats);
      
      return stats;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar estatísticas');
      throw error;
    }
  }

  /**
   * Obtém estado atual do controller
   * @returns {Object} Estado com compras, fornecedores e insumos
   */
  getState() {
    // Busca dados do StateManager através dos repositories
    // (ComprasService não tem stateManager, mas os repositories têm)
    const compras = this.comprasService.comprasRepository.stateManager.getState('compras') || [];
    const fornecedores = this.comprasService.fornecedoresRepository.stateManager.getState('fornecedores') || [];
    const insumos = this.comprasService.fornecedoresRepository.stateManager.getState('insumos') || [];
    
    return {
      compras,
      fornecedores,
      insumos
    };
  }

  /**
   * Inicializa o controller
   * Carrega dados iniciais
   */
  async initialize() {
    try {
      await this.handleLoadCompras();
      await this.handleLoadEstatisticas();
    } catch (error) {
      console.error('Erro ao inicializar ComprasController:', error);
      this.toast.error('Erro ao inicializar módulo de compras');
    }
  }

  /**
   * Destrói o controller
   * Limpa recursos
   */
  destroy() {
    // Limpar referências
    this.view = null;
    this.comprasService = null;
  }
}

