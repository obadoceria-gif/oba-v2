/**
 * MovimentacaoHistory Component
 * 
 * Histórico de movimentações de estoque.
 * 
 * Requirements:
 * - 3.11: Histórico de movimentações
 * - 3.12: Filtros por tipo e período
 */

export class MovimentacaoHistory {
  /**
   * @param {HTMLElement} container - Container onde o histórico será renderizado
   * @param {Object} options - Opções de configuração
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.movimentacoes = [];
    this.insumos = [];
    this.filteredMovimentacoes = [];
    this.filters = {
      tipo: '',
      dataInicio: '',
      dataFim: ''
    };
    
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza o histórico
   */
  render() {
    this.container.innerHTML = `
      <div class="movimentacao-history">
        <div class="history-header">
          <h3 class="history-title">Histórico de Movimentações</h3>
          <span class="history-count">${this.filteredMovimentacoes.length} ${this.filteredMovimentacoes.length === 1 ? 'registro' : 'registros'}</span>
        </div>

        <div class="history-filters">
          <div class="filter-group">
            <select id="tipo-filter" class="filter-select">
              <option value="">Todos os tipos</option>
              <option value="entrada" ${this.filters.tipo === 'entrada' ? 'selected' : ''}>Entrada</option>
              <option value="saida" ${this.filters.tipo === 'saida' ? 'selected' : ''}>Saída</option>
            </select>
          </div>

          <div class="filter-group">
            <input
              type="date"
              id="data-inicio-filter"
              class="filter-input"
              placeholder="Data início"
              value="${this.filters.dataInicio}"
            />
          </div>

          <div class="filter-group">
            <input
              type="date"
              id="data-fim-filter"
              class="filter-input"
              placeholder="Data fim"
              value="${this.filters.dataFim}"
            />
          </div>

          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-filters">
            Limpar Filtros
          </button>
        </div>

        <div class="history-content">
          ${this.renderTable()}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza a tabela de movimentações
   * @returns {string} - HTML da tabela
   */
  renderTable() {
    if (this.filteredMovimentacoes.length === 0) {
      return `
        <div class="empty-state">
          <p class="empty-message">
            ${this.movimentacoes.length === 0 
              ? 'Nenhuma movimentação registrada ainda.' 
              : 'Nenhuma movimentação encontrada com os filtros aplicados.'}
          </p>
        </div>
      `;
    }

    return `
      <table class="movimentacao-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Insumo</th>
            <th>Tipo</th>
            <th class="text-right">Quantidade</th>
            <th class="text-right">Custo Unitário</th>
            <th class="text-right">Total</th>
            <th>Origem</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredMovimentacoes.map(mov => this.renderRow(mov)).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Renderiza uma linha da tabela
   * @param {Object} movimentacao - Dados da movimentação
   * @returns {string} - HTML da linha
   */
  renderRow(movimentacao) {
    const insumo = this.insumos.find(i => i.id === movimentacao.insumoId);
    const insumoNome = insumo ? insumo.nome : 'Insumo não encontrado';
    const dataFormatada = this.formatDate(movimentacao.data);
    const custoFormatado = this.formatCurrency(movimentacao.custoUnitario);
    const total = movimentacao.calculateTotal();
    const totalFormatado = this.formatCurrency(total);
    const tipoClass = movimentacao.tipo === 'entrada' ? 'badge-success' : 'badge-danger';
    const tipoLabel = movimentacao.tipo === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída';

    return `
      <tr data-id="${movimentacao.id}">
        <td>${dataFormatada}</td>
        <td>${this.escapeHtml(insumoNome)}</td>
        <td>
          <span class="badge ${tipoClass}">${tipoLabel}</span>
        </td>
        <td class="text-right">${movimentacao.quantidade}</td>
        <td class="text-right">${custoFormatado}</td>
        <td class="text-right">${totalFormatado}</td>
        <td>${this.escapeHtml(movimentacao.origem)}</td>
        <td class="text-truncate">${this.escapeHtml(movimentacao.observacoes || '-')}</td>
      </tr>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    const tipoFilter = this.container.querySelector('#tipo-filter');
    const dataInicioFilter = this.container.querySelector('#data-inicio-filter');
    const dataFimFilter = this.container.querySelector('#data-fim-filter');
    const btnClearFilters = this.container.querySelector('#btn-clear-filters');

    // Filtro de tipo
    if (tipoFilter) {
      tipoFilter.addEventListener('change', (e) => {
        this.filters.tipo = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de data início
    if (dataInicioFilter) {
      dataInicioFilter.addEventListener('change', (e) => {
        this.filters.dataInicio = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de data fim
    if (dataFimFilter) {
      dataFimFilter.addEventListener('change', (e) => {
        this.filters.dataFim = e.target.value;
        this.applyFilters();
      });
    }

    // Limpar filtros
    if (btnClearFilters) {
      btnClearFilters.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  /**
   * Atualiza o histórico de movimentações
   * @param {Array} movimentacoes - Array de movimentações
   * @param {Array} insumos - Array de insumos
   */
  update(movimentacoes, insumos) {
    this.movimentacoes = movimentacoes || [];
    this.insumos = insumos || [];
    this.applyFilters();
  }

  /**
   * Aplica filtros ao histórico
   */
  applyFilters() {
    this.filteredMovimentacoes = this.movimentacoes.filter(mov => {
      // Filtro de tipo
      if (this.filters.tipo && mov.tipo !== this.filters.tipo) {
        return false;
      }

      // Filtro de data início
      if (this.filters.dataInicio) {
        const dataInicio = new Date(this.filters.dataInicio);
        const dataMovimentacao = new Date(mov.data);
        if (dataMovimentacao < dataInicio) {
          return false;
        }
      }

      // Filtro de data fim
      if (this.filters.dataFim) {
        const dataFim = new Date(`${this.filters.dataFim}T23:59:59.999`);
        const dataMovimentacao = new Date(mov.data);
        if (dataMovimentacao > dataFim) {
          return false;
        }
      }

      return true;
    });

    // Ordenar por data (mais recente primeiro)
    this.filteredMovimentacoes.sort((a, b) => {
      return new Date(b.data) - new Date(a.data);
    });

    this.render();
    this.attachEventListeners();
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filters = {
      tipo: '',
      dataInicio: '',
      dataFim: ''
    };
    this.applyFilters();
  }

  /**
   * Formata data
   * @param {string} dateString - Data em formato ISO
   * @returns {string} - Data formatada
   */
  formatDate(dateString) {
    if (!dateString) {
      return '-';
    }
    
    const date = new Date(dateString);
    
    // Validar se a data é válida
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formata valor monetário
   * @param {number} cents - Valor em centavos
   * @returns {string} - Valor formatado
   */
  formatCurrency(cents) {
    const reais = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(reais);
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} - Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Emite um evento customizado
   * @param {string} eventName - Nome do evento
   * @param {*} data - Dados do evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(`movimentacao-history:${eventName}`, {
      detail: data,
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Registra listener para eventos do componente
   * @param {string} eventName - Nome do evento
   * @param {Function} handler - Handler do evento
   */
  on(eventName, handler) {
    this.container.addEventListener(`movimentacao-history:${eventName}`, (e) => {
      handler(e.detail);
    });
  }

  /**
   * Destrói o componente
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
