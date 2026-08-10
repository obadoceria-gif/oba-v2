/**
 * ProducaoView - View principal do módulo de produção
 */

import { eventBus } from '../../../core/events/EventBus.js';

export class ProducaoView {
  constructor(container) {
    if (!container) throw new Error('Container é obrigatório');
    this.container = container;
    this.eventBus = eventBus;
    this.producoes = [];
    this.fichas = [];
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="producao-view">
        <div class="producao-header">
          <h1>🏭 Produção</h1>
          <button type="button" id="nova-producao-btn" class="btn-primary">
            Nova Produção
          </button>
        </div>
        <div id="producao-content" class="producao-content"></div>
      </div>
    `;
  }

  attachEventListeners() {
    const novaProducaoBtn = this.container.querySelector('#nova-producao-btn');
    novaProducaoBtn?.addEventListener('click', () => this.showForm());

    this.eventBus.on('producao:create', this.handleCreateProducao.bind(this));
    this.eventBus.on('producao:iniciar', this.handleIniciarProducao.bind(this));
    this.eventBus.on('producao:concluir', this.handleConcluirProducao.bind(this));
    this.eventBus.on('producao:cancelar', this.handleCancelarProducao.bind(this));
    this.eventBus.on('producao:cancel', this.handleCancelForm.bind(this));
  }

  renderProducoesList(producoes) {
    this.producoes = producoes;
    const contentContainer = this.container.querySelector('#producao-content');
    
    if (!producoes || producoes.length === 0) {
      contentContainer.innerHTML = `
        <div class="empty-state">
          <p>🏭 Nenhuma produção registrada</p>
          <p class="empty-state-hint">Clique em "Nova Produção" para começar</p>
        </div>
      `;
      return;
    }

    contentContainer.innerHTML = `
      <div class="producoes-list">
        ${producoes.map(p => this.renderProducaoCard(p)).join('')}
      </div>
    `;

    this.attachCardListeners();
  }

  renderProducaoCard(producao) {
    const statusClass = {
      planejada: 'status-planejada',
      em_producao: 'status-em-producao',
      concluida: 'status-concluida',
      cancelada: 'status-cancelada'
    }[producao.status] || '';

    const statusLabel = {
      planejada: 'Planejada',
      em_producao: 'Em Produção',
      concluida: 'Concluída',
      cancelada: 'Cancelada'
    }[producao.status] || producao.status;

    const ficha = this.fichas.find(f => f.id === producao.fichaId);
    const fichaNome = ficha ? ficha.nome : 'Ficha não encontrada';

    return `
      <div class="producao-card ${statusClass}" data-producao-id="${producao.id}">
        <div class="producao-card-header">
          <h3>${fichaNome}</h3>
          <span class="producao-status">${statusLabel}</span>
        </div>
        <div class="producao-card-body">
          <p><strong>Lote:</strong> ${producao.lote}</p>
          <p><strong>Quantidade:</strong> ${producao.quantidade} ${producao.unidade}</p>
          <p><strong>Data:</strong> ${new Date(producao.dataProducao).toLocaleDateString()}</p>
          ${producao.observacoes ? `<p><strong>Obs:</strong> ${producao.observacoes}</p>` : ''}
          <div class="producao-actions">
            ${producao.status === 'planejada' ? `
              <button type="button" class="btn-primary btn-iniciar" data-action="iniciar">
                ▶️ Iniciar
              </button>
            ` : ''}
            ${producao.status === 'em_producao' ? `
              <button type="button" class="btn-success btn-concluir" data-action="concluir">
                ✅ Concluir
              </button>
            ` : ''}
            ${producao.status !== 'cancelada' && producao.status !== 'concluida' ? `
              <button type="button" class="btn-danger btn-cancelar" data-action="cancelar">
                ❌ Cancelar
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  attachCardListeners() {
    const cards = this.container.querySelectorAll('.producao-card');
    
    cards.forEach(card => {
      const producaoId = card.dataset.producaoId;
      
      const iniciarBtn = card.querySelector('[data-action="iniciar"]');
      iniciarBtn?.addEventListener('click', () => {
        if (confirm('Iniciar produção? O estoque será baixado automaticamente.')) {
          this.eventBus.publish('producao:iniciar', { producaoId });
        }
      });
      
      const concluirBtn = card.querySelector('[data-action="concluir"]');
      concluirBtn?.addEventListener('click', () => {
        if (confirm('Concluir produção?')) {
          this.eventBus.publish('producao:concluir', { producaoId });
        }
      });
      
      const cancelarBtn = card.querySelector('[data-action="cancelar"]');
      cancelarBtn?.addEventListener('click', () => {
        if (confirm('Cancelar produção?')) {
          this.eventBus.publish('producao:cancelar', { producaoId });
        }
      });
    });
  }

  showForm() {
    const contentContainer = this.container.querySelector('#producao-content');
    
    contentContainer.innerHTML = `
      <div class="producao-form-container">
        <h2>Nova Produção</h2>
        <form id="producao-form" class="producao-form">
          <div class="form-group">
            <label for="fichaId">Ficha Técnica *</label>
            <select id="fichaId" name="fichaId" required>
              <option value="">Selecione...</option>
              ${this.fichas.map(f => `
                <option value="${f.id}">${f.nome} (${f.rendimento} ${f.unidadeRendimento})</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="quantidade">Quantidade *</label>
            <input type="number" id="quantidade" name="quantidade" min="0.01" step="0.01" required />
          </div>
          
          <div class="form-group">
            <label for="dataProducao">Data de Produção *</label>
            <input type="date" id="dataProducao" name="dataProducao" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          
          <div class="form-group">
            <label for="observacoes">Observações</label>
            <textarea id="observacoes" name="observacoes" rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Criar Produção</button>
            <button type="button" id="cancel-btn" class="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    this.attachFormListeners();
  }

  attachFormListeners() {
    const form = this.container.querySelector('#producao-form');
    const cancelBtn = this.container.querySelector('#cancel-btn');
    const fichaSelect = this.container.querySelector('#fichaId');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    cancelBtn?.addEventListener('click', () => {
      this.eventBus.publish('producao:cancel');
    });

    // Auto-preencher unidade quando selecionar ficha
    fichaSelect?.addEventListener('change', (e) => {
      const fichaId = e.target.value;
      const ficha = this.fichas.find(f => f.id === fichaId);
      if (ficha) {
        // Poderia adicionar campo de unidade aqui
      }
    });
  }

  handleFormSubmit() {
    const form = this.container.querySelector('#producao-form');
    const formData = new FormData(form);
    const fichaId = formData.get('fichaId');
    const ficha = this.fichas.find(f => f.id === fichaId);

    const data = {
      fichaId,
      quantidade: parseFloat(formData.get('quantidade')),
      unidade: ficha ? ficha.unidadeRendimento : 'unidades',
      dataProducao: formData.get('dataProducao'),
      observacoes: formData.get('observacoes') || '',
      status: 'planejada'
    };

    this.eventBus.publish('producao:create', { data });
  }

  updateFichas(fichas) {
    this.fichas = fichas;
  }

  handleCreateProducao({ data }) {
    console.log('[ProducaoView] handleCreateProducao', data);
  }

  handleIniciarProducao({ producaoId }) {
    console.log('[ProducaoView] handleIniciarProducao', producaoId);
  }

  handleConcluirProducao({ producaoId }) {
    console.log('[ProducaoView] handleConcluirProducao', producaoId);
  }

  handleCancelarProducao({ producaoId }) {
    console.log('[ProducaoView] handleCancelarProducao', producaoId);
  }

  handleCancelForm() {
    this.renderProducoesList(this.producoes);
  }

  showLoading(message = 'Carregando...') {
    console.log(`[ProducaoView] Loading: ${message}`);
  }

  hideLoading() {
    console.log('[ProducaoView] Loading concluído');
  }

  showError(message) {
    alert(`Erro: ${message}`);
  }

  showSuccess(message) {
    alert(`Sucesso: ${message}`);
  }

  showValidationErrors(errors) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');
    this.showError(`Erros de validação:\n${errorMessages}`);
  }

  destroy() {
    this.eventBus.off('producao:create', this.handleCreateProducao);
    this.eventBus.off('producao:iniciar', this.handleIniciarProducao);
    this.eventBus.off('producao:concluir', this.handleConcluirProducao);
    this.eventBus.off('producao:cancelar', this.handleCancelarProducao);
    this.eventBus.off('producao:cancel', this.handleCancelForm);
    this.container.innerHTML = '';
  }
}
