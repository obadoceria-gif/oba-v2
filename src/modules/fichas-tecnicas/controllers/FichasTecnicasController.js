/**
 * FichasTecnicasController
 * 
 * Controlador para o módulo de fichas técnicas.
 * Gerencia a comunicação entre a camada de serviço e a camada de visualização.
 * Orquestra operações de fichas técnicas (receitas).
 */

import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class FichasTecnicasController {
  /**
   * @param {FichasTecnicasService} fichasTecnicasService - Serviço de fichas técnicas
   * @param {FichasTecnicasView} view - View de fichas técnicas
   */
  constructor(fichasTecnicasService, view) {
    if (!fichasTecnicasService) {
      throw new Error('FichasTecnicasService é obrigatório');
    }
    if (!view) {
      throw new Error('FichasTecnicasView é obrigatório');
    }

    this.fichasTecnicasService = fichasTecnicasService;
    this.view = view;
    this.toast = getToast();
    this.loading = getLoading();
    
    // Bind dos métodos para manter contexto correto
    this.handleCreateFicha = this.handleCreateFicha.bind(this);
    this.handleUpdateFicha = this.handleUpdateFicha.bind(this);
    this.handleDeleteFicha = this.handleDeleteFicha.bind(this);
    this.handleLoadFichas = this.handleLoadFichas.bind(this);
    this.handleSelectFicha = this.handleSelectFicha.bind(this);
    this.handleCalculateCustos = this.handleCalculateCustos.bind(this);
  }

  /**
   * Handler para criação de ficha técnica
   * @param {Object} data - Dados da ficha técnica
   * @param {string} data.nome - Nome da receita
   * @param {Array} data.insumos - Lista de insumos [{insumoId, quantidade}]
   * @param {number} data.rendimento - Quantidade produzida
   * @param {string} data.unidadeRendimento - Unidade do rendimento
   * @param {string} [data.modoPreparo] - Instruções de preparo
   */
  async handleCreateFicha(data) {
    const loadingId = this.loading.show('Criando ficha técnica...');
    
    try {
      const result = await this.fichasTecnicasService.createFichaTecnica(data);
      
      if (!result.success) {
        if (result.errors) {
          this.view.showValidationErrors(result.errors);
        } else {
          this.toast.error(result.message || 'Erro ao criar ficha técnica');
        }
        return;
      }
      
      this.toast.success(
        `Ficha técnica "${result.data.nome}" criada com sucesso!`
      );
      
      // Recarregar lista de fichas
      await this.handleLoadFichas();
      
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao criar ficha técnica');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para atualização de ficha técnica
   * @param {string} id - ID da ficha técnica
   * @param {Object} updates - Dados a serem atualizados
   */
  async handleUpdateFicha(id, updates) {
    const loadingId = this.loading.show('Atualizando ficha técnica...');
    
    try {
      const result = await this.fichasTecnicasService.updateFichaTecnica(id, updates);
      
      if (!result.success) {
        if (result.errors) {
          this.view.showValidationErrors(result.errors);
        } else {
          this.toast.error(result.message || 'Erro ao atualizar ficha técnica');
        }
        return;
      }
      
      this.toast.success(
        `Ficha técnica "${result.data.nome}" atualizada com sucesso!`
      );
      
      // Recarregar lista de fichas
      await this.handleLoadFichas();
      
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao atualizar ficha técnica');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para exclusão de ficha técnica
   * @param {string} id - ID da ficha técnica
   */
  async handleDeleteFicha(id) {
    const loadingId = this.loading.show('Removendo ficha técnica...');
    
    try {
      const result = await this.fichasTecnicasService.deleteFichaTecnica(id);
      
      if (!result.success) {
        this.toast.error(result.message || 'Erro ao remover ficha técnica');
        return;
      }
      
      this.toast.success(result.message);
      
      // Recarregar lista de fichas
      await this.handleLoadFichas();
      
      return true;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao remover ficha técnica');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para carregar todas as fichas técnicas
   */
  async handleLoadFichas() {
    const loadingId = this.loading.show('Carregando fichas técnicas...');
    
    try {
      const fichas = await this.fichasTecnicasService.getAllFichasTecnicas();
      
      this.view.renderFichasList(fichas);
      
      return fichas;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar fichas técnicas');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Handler para selecionar ficha técnica (para visualização de detalhes)
   * @param {string} fichaId - ID da ficha técnica
   */
  async handleSelectFicha(fichaId) {
    try {
      const ficha = await this.fichasTecnicasService.getFichaTecnicaById(fichaId);
      
      if (!ficha) {
        this.toast.error('Ficha técnica não encontrada');
        return;
      }
      
      this.view.showFichaDetails(ficha);
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar ficha técnica');
      throw error;
    }
  }

  /**
   * Handler para calcular custos de uma ficha técnica
   * @param {string} fichaId - ID da ficha técnica
   */
  async handleCalculateCustos(fichaId) {
    const loadingId = this.loading.show('Calculando custos...');
    
    try {
      const result = await this.fichasTecnicasService.calculateCustos(fichaId);
      
      if (!result.success) {
        this.toast.error(result.message || 'Erro ao calcular custos');
        return;
      }
      
      this.view.showCustos(result);
      
      return result;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao calcular custos');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  /**
   * Obtém estado atual do controller
   * @returns {Object} Estado com fichas e insumos
   */
  getState() {
    // O controller não gerencia estado diretamente
    // O estado é gerenciado pelo StateManager através do service
    // Retornar objeto vazio por enquanto - a view usa EventBus para atualizações
    return {
      fichas: [],
      insumos: []
    };
  }

  /**
   * Inicializa o controller
   * Carrega dados iniciais
   */
  async initialize() {
    try {
      await this.handleLoadFichas();
    } catch (error) {
      console.error('Erro ao inicializar FichasTecnicasController:', error);
      this.toast.error('Erro ao inicializar módulo de fichas técnicas');
    }
  }

  /**
   * Destrói o controller
   * Limpa recursos
   */
  destroy() {
    // Limpar referências
    this.view = null;
    this.fichasTecnicasService = null;
  }
}
