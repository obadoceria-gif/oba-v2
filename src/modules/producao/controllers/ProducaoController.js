/**
 * ProducaoController
 * 
 * Controlador para o módulo de produção.
 */

import { getToast } from '../../../core/ui/Toast.js';
import { getLoading } from '../../../core/ui/Loading.js';

export class ProducaoController {
  constructor(producaoService, view) {
    if (!producaoService) throw new Error('ProducaoService é obrigatório');
    if (!view) throw new Error('ProducaoView é obrigatório');

    this.producaoService = producaoService;
    this.view = view;
    this.toast = getToast();
    this.loading = getLoading();
    
    // Bind methods
    this.handleCreateProducao = this.handleCreateProducao.bind(this);
    this.handleIniciarProducao = this.handleIniciarProducao.bind(this);
    this.handleConcluirProducao = this.handleConcluirProducao.bind(this);
    this.handleCancelarProducao = this.handleCancelarProducao.bind(this);
    this.handleLoadProducoes = this.handleLoadProducoes.bind(this);
  }

  async handleCreateProducao(data) {
    const loadingId = this.loading.show('Criando produção...');
    
    try {
      const result = await this.producaoService.createProducao(data);

      if (!result.success) {
        if (result.errors) {
          this.view.showValidationErrors(result.errors);
        } else {
          this.toast.error(result.message || 'Erro ao criar produção');
        }
        return;
      }

      this.toast.success(result.message);
      await this.handleLoadProducoes();
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao criar produção');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  async handleIniciarProducao(producaoId) {
    const loadingId = this.loading.show('Iniciando produção...');
    
    try {
      const result = await this.producaoService.iniciarProducao(producaoId);

      if (!result.success) {
        this.toast.error(result.message);
        return;
      }

      this.toast.success(result.message);
      await this.handleLoadProducoes();
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao iniciar produção');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  async handleConcluirProducao(producaoId) {
    const loadingId = this.loading.show('Concluindo produção...');
    
    try {
      const result = await this.producaoService.concluirProducao(producaoId);

      if (!result.success) {
        this.toast.error(result.message);
        return;
      }

      this.toast.success(result.message);
      await this.handleLoadProducoes();
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao concluir produção');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  async handleCancelarProducao(producaoId) {
    const loadingId = this.loading.show('Cancelando produção...');
    
    try {
      const result = await this.producaoService.cancelarProducao(producaoId);

      if (!result.success) {
        this.toast.error(result.message);
        return;
      }

      this.toast.success(result.message);
      await this.handleLoadProducoes();
      return result.data;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao cancelar produção');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  async handleLoadProducoes() {
    const loadingId = this.loading.show('Carregando produções...');
    
    try {
      const producoes = await this.producaoService.getAllProducoes();
      this.view.renderProducoesList(producoes);
      return producoes;
    } catch (error) {
      this.toast.error(error.message || 'Erro ao carregar produções');
      throw error;
    } finally {
      this.loading.hide(loadingId);
    }
  }

  getState() {
    return { producoes: [], fichas: [] };
  }

  async initialize() {
    try {
      await this.handleLoadProducoes();
    } catch (error) {
      console.error('Erro ao inicializar ProducaoController:', error);
      this.toast.error('Erro ao inicializar módulo de produção');
    }
  }

  destroy() {
    this.view = null;
    this.producaoService = null;
  }
}
