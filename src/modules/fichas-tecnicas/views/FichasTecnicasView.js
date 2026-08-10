/**
 * FichasTecnicasView - View principal do módulo de fichas técnicas
 * Orquestra todos os componentes e gerencia o estado da view
 */

import { eventBus } from '../../../core/events/EventBus.js';

export class FichasTecnicasView {
  /**
   * @param {HTMLElement} container - Container principal
   */
  constructor(container) {
    if (!container) {
      throw new Error('Container é obrigatório');
    }

    this.container = container;
    this.eventBus = eventBus;
    
    // Estado da view
    this.currentView = 'list'; // 'list' | 'form' | 'details'
    this.fichas = [];
    this.insumos = [];
    this.selectedFicha = null;

    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza estrutura principal
   */
  render() {
    this.container.innerHTML = `
      <div class="fichas-view">
        <div class="fichas-header">
          <h1>📋 Fichas Técnicas</h1>
          <button type="button" id="nova-ficha-btn" class="btn-primary">
            Nova Ficha Técnica
          </button>
        </div>
        <div id="fichas-content" class="fichas-content"></div>
        <div id="fichas-modal" class="fichas-modal"></div>
      </div>
    `;
  }

  /**
   * Anexa event listeners globais
   */
  attachEventListeners() {
    // Botão de nova ficha
    const novaFichaBtn = this.container.querySelector('#nova-ficha-btn');
    novaFichaBtn?.addEventListener('click', () => this.showForm());

    // Eventos do EventBus
    this.eventBus.on('ficha:create', this.handleCreateFicha.bind(this));
    this.eventBus.on('ficha:update', this.handleUpdateFicha.bind(this));
    this.eventBus.on('ficha:delete', this.handleDeleteFicha.bind(this));
    this.eventBus.on('ficha:view', this.handleViewFicha.bind(this));
    this.eventBus.on('ficha:calculate', this.handleCalculateCustos.bind(this));
    this.eventBus.on('ficha:cancel', this.handleCancelForm.bind(this));
    this.eventBus.on('ficha:details:close', this.handleCloseDetails.bind(this));
  }

  /**
   * Renderiza lista de fichas técnicas
   * @param {Array<FichaTecnica>} fichas - Lista de fichas técnicas
   */
  renderFichasList(fichas) {
    this.fichas = fichas;
    this.currentView = 'list';
    
    const contentContainer = this.container.querySelector('#fichas-content');
    
    if (!fichas || fichas.length === 0) {
      contentContainer.innerHTML = `
        <div class="empty-state">
          <p>📋 Nenhuma ficha técnica cadastrada</p>
          <p class="empty-state-hint">Clique em "Nova Ficha Técnica" para começar</p>
        </div>
      `;
      return;
    }

    contentContainer.innerHTML = `
      <div class="fichas-list">
        ${fichas.map(ficha => this.renderFichaCard(ficha)).join('')}
      </div>
    `;

    // Anexar event listeners dos cards
    this.attachCardListeners();
  }

  /**
   * Renderiza um card de ficha técnica
   * @param {FichaTecnica} ficha - Ficha técnica
   * @returns {string} HTML do card
   */
  renderFichaCard(ficha) {
    return `
      <div class="ficha-card" data-ficha-id="${ficha.id}">
        <div class="ficha-card-header">
          <h3>${ficha.nome}</h3>
          <div class="ficha-card-actions">
            <button type="button" class="btn-icon btn-view" data-action="view" title="Ver detalhes">
              👁️
            </button>
            <button type="button" class="btn-icon btn-edit" data-action="edit" title="Editar">
              ✏️
            </button>
            <button type="button" class="btn-icon btn-delete" data-action="delete" title="Excluir">
              🗑️
            </button>
          </div>
        </div>
        <div class="ficha-card-body">
          <p><strong>Rendimento:</strong> ${ficha.rendimento} ${ficha.unidadeRendimento}</p>
          <p><strong>Insumos:</strong> ${ficha.insumos.length} item(ns)</p>
          <button type="button" class="btn-secondary btn-calculate" data-action="calculate">
            💰 Calcular Custos
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Anexa event listeners dos cards
   */
  attachCardListeners() {
    const cards = this.container.querySelectorAll('.ficha-card');
    
    cards.forEach(card => {
      const fichaId = card.dataset.fichaId;
      
      // Botão ver detalhes
      const viewBtn = card.querySelector('[data-action="view"]');
      viewBtn?.addEventListener('click', () => {
        this.eventBus.publish('ficha:view', { fichaId });
      });
      
      // Botão editar
      const editBtn = card.querySelector('[data-action="edit"]');
      editBtn?.addEventListener('click', () => {
        this.showForm(fichaId);
      });
      
      // Botão excluir
      const deleteBtn = card.querySelector('[data-action="delete"]');
      deleteBtn?.addEventListener('click', async () => {
        const ficha = this.fichas.find(f => f.id === fichaId);
        if (ficha && confirm(`Deseja realmente excluir a ficha técnica "${ficha.nome}"?`)) {
          this.eventBus.publish('ficha:delete', { fichaId });
        }
      });
      
      // Botão calcular custos
      const calculateBtn = card.querySelector('[data-action="calculate"]');
      calculateBtn?.addEventListener('click', () => {
        this.eventBus.publish('ficha:calculate', { fichaId });
      });
    });
  }

  /**
   * Mostra formulário de ficha técnica
   * @param {string} [fichaId] - ID da ficha para edição (opcional)
   */
  showForm(fichaId = null) {
    this.currentView = 'form';
    
    const ficha = fichaId ? this.fichas.find(f => f.id === fichaId) : null;
    const isEdit = !!ficha;
    
    const contentContainer = this.container.querySelector('#fichas-content');
    
    contentContainer.innerHTML = `
      <div class="ficha-form-container">
        <h2>${isEdit ? 'Editar' : 'Nova'} Ficha Técnica</h2>
        <form id="ficha-form" class="ficha-form">
          <div class="form-group">
            <label for="nome">Nome da Receita *</label>
            <input 
              type="text" 
              id="nome" 
              name="nome" 
              value="${ficha?.nome || ''}"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="rendimento">Rendimento *</label>
              <input 
                type="number" 
                id="rendimento" 
                name="rendimento" 
                value="${ficha?.rendimento || ''}"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="unidadeRendimento">Unidade *</label>
              <select id="unidadeRendimento" name="unidadeRendimento" required>
                <option value="">Selecione...</option>
                <option value="kg" ${ficha?.unidadeRendimento === 'kg' ? 'selected' : ''}>kg</option>
                <option value="g" ${ficha?.unidadeRendimento === 'g' ? 'selected' : ''}>g</option>
                <option value="L" ${ficha?.unidadeRendimento === 'L' ? 'selected' : ''}>L</option>
                <option value="mL" ${ficha?.unidadeRendimento === 'mL' ? 'selected' : ''}>mL</option>
                <option value="unidades" ${ficha?.unidadeRendimento === 'unidades' ? 'selected' : ''}>unidades</option>
                <option value="porções" ${ficha?.unidadeRendimento === 'porções' ? 'selected' : ''}>porções</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Insumos *</label>
            <div id="insumos-list" class="insumos-list">
              ${this.renderInsumosList(ficha?.insumos || [])}
            </div>
            <button type="button" id="add-insumo-btn" class="btn-secondary">
              + Adicionar Insumo
            </button>
          </div>
          
          <div class="form-group">
            <label for="modoPreparo">Modo de Preparo</label>
            <textarea 
              id="modoPreparo" 
              name="modoPreparo" 
              rows="5"
            >${ficha?.modoPreparo || ''}</textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              ${isEdit ? 'Atualizar' : 'Criar'} Ficha Técnica
            </button>
            <button type="button" id="cancel-btn" class="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;

    // Anexar event listeners do formulário
    this.attachFormListeners(fichaId);
  }

  /**
   * Renderiza lista de insumos no formulário
   * @param {Array} insumos - Lista de insumos
   * @returns {string} HTML da lista
   */
  renderInsumosList(insumos) {
    if (!insumos || insumos.length === 0) {
      return '<p class="empty-insumos">Nenhum insumo adicionado</p>';
    }

    return insumos.map((insumo, index) => `
      <div class="insumo-item" data-index="${index}">
        <select name="insumoId_${index}" required>
          <option value="">Selecione o insumo...</option>
          ${this.insumos.map(i => `
            <option value="${i.id}" ${insumo.insumoId === i.id ? 'selected' : ''}>
              ${i.nome}
            </option>
          `).join('')}
        </select>
        <input 
          type="number" 
          name="quantidade_${index}" 
          value="${insumo.quantidade || ''}"
          placeholder="Quantidade"
          min="0.01"
          step="0.01"
          required
        />
        <button type="button" class="btn-icon btn-remove-insumo" data-index="${index}">
          ❌
        </button>
      </div>
    `).join('');
  }

  /**
   * Anexa event listeners do formulário
   * @param {string} [fichaId] - ID da ficha para edição
   */
  attachFormListeners(fichaId) {
    const form = this.container.querySelector('#ficha-form');
    const cancelBtn = this.container.querySelector('#cancel-btn');
    const addInsumoBtn = this.container.querySelector('#add-insumo-btn');

    // Submit do formulário
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(fichaId);
    });

    // Botão cancelar
    cancelBtn?.addEventListener('click', () => {
      this.eventBus.publish('ficha:cancel');
    });

    // Botão adicionar insumo
    addInsumoBtn?.addEventListener('click', () => {
      this.addInsumoField();
    });

    // Botões remover insumo
    this.attachRemoveInsumoListeners();
  }

  /**
   * Adiciona campo de insumo
   */
  addInsumoField() {
    const insumosList = this.container.querySelector('#insumos-list');
    const emptyMessage = insumosList.querySelector('.empty-insumos');
    
    if (emptyMessage) {
      emptyMessage.remove();
    }

    const index = insumosList.querySelectorAll('.insumo-item').length;
    
    const insumoItem = document.createElement('div');
    insumoItem.className = 'insumo-item';
    insumoItem.dataset.index = index;
    insumoItem.innerHTML = `
      <select name="insumoId_${index}" required>
        <option value="">Selecione o insumo...</option>
        ${this.insumos.map(i => `
          <option value="${i.id}">${i.nome}</option>
        `).join('')}
      </select>
      <input 
        type="number" 
        name="quantidade_${index}" 
        placeholder="Quantidade"
        min="0.01"
        step="0.01"
        required
      />
      <button type="button" class="btn-icon btn-remove-insumo" data-index="${index}">
        ❌
      </button>
    `;

    insumosList.appendChild(insumoItem);
    this.attachRemoveInsumoListeners();
  }

  /**
   * Anexa event listeners dos botões remover insumo
   */
  attachRemoveInsumoListeners() {
    const removeButtons = this.container.querySelectorAll('.btn-remove-insumo');
    
    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.insumo-item');
        item?.remove();

        // Se não houver mais insumos, mostrar mensagem
        const insumosList = this.container.querySelector('#insumos-list');
        if (insumosList.querySelectorAll('.insumo-item').length === 0) {
          insumosList.innerHTML = '<p class="empty-insumos">Nenhum insumo adicionado</p>';
        }
      });
    });
  }

  /**
   * Manipula submit do formulário
   * @param {string} [fichaId] - ID da ficha para edição
   */
  handleFormSubmit(fichaId) {
    const form = this.container.querySelector('#ficha-form');
    const formData = new FormData(form);

    // Coletar dados básicos
    const data = {
      nome: formData.get('nome'),
      rendimento: parseFloat(formData.get('rendimento')),
      unidadeRendimento: formData.get('unidadeRendimento'),
      modoPreparo: formData.get('modoPreparo') || '',
      insumos: []
    };

    // Coletar insumos
    const insumoItems = this.container.querySelectorAll('.insumo-item');
    insumoItems.forEach((item, index) => {
      const insumoId = formData.get(`insumoId_${index}`);
      const quantidade = parseFloat(formData.get(`quantidade_${index}`));
      
      if (insumoId && quantidade) {
        data.insumos.push({ insumoId, quantidade });
      }
    });

    // Validar insumos
    if (data.insumos.length === 0) {
      this.showError('Adicione pelo menos um insumo à ficha técnica');
      return;
    }

    // Publicar evento
    if (fichaId) {
      this.eventBus.publish('ficha:update', { fichaId, data });
    } else {
      this.eventBus.publish('ficha:create', { data });
    }
  }

  /**
   * Mostra detalhes de uma ficha técnica
   * @param {FichaTecnica} ficha - Ficha técnica
   */
  showFichaDetails(ficha) {
    this.selectedFicha = ficha;
    
    const modalContainer = this.container.querySelector('#fichas-modal');
    
    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${ficha.nome}</h2>
            <button type="button" class="btn-close" id="close-details-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="ficha-details">
              <div class="detail-section">
                <h3>Informações Gerais</h3>
                <p><strong>Rendimento:</strong> ${ficha.rendimento} ${ficha.unidadeRendimento}</p>
              </div>
              
              <div class="detail-section">
                <h3>Insumos</h3>
                <ul class="insumos-details-list">
                  ${ficha.insumos.map(insumo => {
                    const insumoData = this.insumos.find(i => i.id === insumo.insumoId);
                    return `
                      <li>
                        ${insumoData?.nome || 'Insumo não encontrado'}: 
                        ${insumo.quantidade} ${insumoData?.unidade || ''}
                      </li>
                    `;
                  }).join('')}
                </ul>
              </div>
              
              ${ficha.modoPreparo ? `
                <div class="detail-section">
                  <h3>Modo de Preparo</h3>
                  <p class="modo-preparo">${ficha.modoPreparo}</p>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-primary" id="calculate-custos-btn">
              💰 Calcular Custos
            </button>
          </div>
        </div>
      </div>
    `;

    // Anexar event listeners
    const closeBtn = modalContainer.querySelector('#close-details-btn');
    closeBtn?.addEventListener('click', () => {
      this.eventBus.publish('ficha:details:close');
    });

    const calculateBtn = modalContainer.querySelector('#calculate-custos-btn');
    calculateBtn?.addEventListener('click', () => {
      this.eventBus.publish('ficha:calculate', { fichaId: ficha.id });
    });
  }

  /**
   * Mostra custos calculados
   * @param {Object} result - Resultado do cálculo
   */
  showCustos(result) {
    const custoLoteReais = (result.custoLote / 100).toFixed(2);
    const custoUnitarioReais = (result.custoUnitario / 100).toFixed(2);
    
    alert(`
Custos Calculados:

Custo do Lote: R$ ${custoLoteReais}
Custo Unitário: R$ ${custoUnitarioReais}
    `.trim());
  }

  /**
   * Atualiza lista de insumos disponíveis
   * @param {Array} insumos - Lista de insumos
   */
  updateInsumos(insumos) {
    this.insumos = insumos;
  }

  /**
   * Manipula criação de ficha
   */
  async handleCreateFicha({ data }) {
    // O controller vai manipular isso
    console.log('[FichasTecnicasView] handleCreateFicha', data);
  }

  /**
   * Manipula atualização de ficha
   */
  async handleUpdateFicha({ fichaId, data }) {
    // O controller vai manipular isso
    console.log('[FichasTecnicasView] handleUpdateFicha', fichaId, data);
  }

  /**
   * Manipula exclusão de ficha
   */
  async handleDeleteFicha({ fichaId }) {
    // O controller vai manipular isso
    console.log('[FichasTecnicasView] handleDeleteFicha', fichaId);
  }

  /**
   * Manipula visualização de ficha
   */
  handleViewFicha({ fichaId }) {
    const ficha = this.fichas.find(f => f.id === fichaId);
    if (ficha) {
      this.showFichaDetails(ficha);
    }
  }

  /**
   * Manipula cálculo de custos
   */
  async handleCalculateCustos({ fichaId }) {
    // O controller vai manipular isso
    console.log('[FichasTecnicasView] handleCalculateCustos', fichaId);
  }

  /**
   * Manipula cancelamento do formulário
   */
  handleCancelForm() {
    this.renderFichasList(this.fichas);
  }

  /**
   * Manipula fechamento do modal de detalhes
   */
  handleCloseDetails() {
    const modalContainer = this.container.querySelector('#fichas-modal');
    modalContainer.innerHTML = '';
    this.selectedFicha = null;
  }

  /**
   * Mostra indicador de loading
   */
  showLoading(message = 'Carregando...') {
    console.log(`[FichasTecnicasView] Loading: ${message}`);
  }

  /**
   * Esconde indicador de loading
   */
  hideLoading() {
    console.log('[FichasTecnicasView] Loading concluído');
  }

  /**
   * Mostra mensagem de erro
   */
  showError(message) {
    alert(`Erro: ${message}`);
  }

  /**
   * Mostra mensagem de sucesso
   */
  showSuccess(message) {
    alert(`Sucesso: ${message}`);
  }

  /**
   * Mostra erros de validação
   */
  showValidationErrors(errors) {
    const errorMessages = Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');
    
    this.showError(`Erros de validação:\n${errorMessages}`);
  }

  /**
   * Destrói a view
   */
  destroy() {
    // Remove event listeners
    this.eventBus.off('ficha:create', this.handleCreateFicha);
    this.eventBus.off('ficha:update', this.handleUpdateFicha);
    this.eventBus.off('ficha:delete', this.handleDeleteFicha);
    this.eventBus.off('ficha:view', this.handleViewFicha);
    this.eventBus.off('ficha:calculate', this.handleCalculateCustos);
    this.eventBus.off('ficha:cancel', this.handleCancelForm);
    this.eventBus.off('ficha:details:close', this.handleCloseDetails);

    // Limpa container
    this.container.innerHTML = '';
  }
}
