/**
 * EstoqueList Component
 * 
 * Lista de estoques com filtros e ações.
 * 
 * Requirements:
 * - 3.9: Visualização de estoque atual
 * - 3.10: Filtros por categoria e estoque baixo
 */

export class EstoqueList {
  /**
   * @param {HTMLElement} container - Container onde a lista será renderizada
   * @param {Object} options - Opções de configuração
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.estoques = [];
    this.insumos = [];
    this.filteredEstoques = [];
    this.filters = {
      search: '',
      categoria: '',
      apenasAbaixoMinimo: false
    };
    
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza a lista
   */
  render() {
    this.container.innerHTML = `
      <div class="estoque-list">
        <div class="list-header">
          <h2 class="list-title">Estoque Atual</h2>
          <span class="list-count">${this.filteredEstoques.length} ${this.filteredEstoques.length === 1 ? 'item' : 'itens'}</span>
        </div>

        <div class="list-filters">
          <div class="filter-group">
            <input
              type="text"
              id="search-input"
              class="filter-input"
              placeholder="🔍 Buscar por nome..."
              value="${this.filters.search}"
            />
          </div>

          <div class="filter-group">
            <select id="categoria-filter" class="filter-select">
              <option value="">Todas as categorias</option>
              <option value="kg" ${this.filters.categoria === 'kg' ? 'selected' : ''}>Quilograma (kg)</option>
              <option value="g" ${this.filters.categoria === 'g' ? 'selected' : ''}>Grama (g)</option>
              <option value="L" ${this.filters.categoria === 'L' ? 'selected' : ''}>Litro (L)</option>
              <option value="ml" ${this.filters.categoria === 'ml' ? 'selected' : ''}>Mililitro (ml)</option>
              <option value="un" ${this.filters.categoria === 'un' ? 'selected' : ''}>Unidade (un)</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-checkbox">
              <input
                type="checkbox"
                id="abaixo-minimo-filter"
                ${this.filters.apenasAbaixoMinimo ? 'checked' : ''}
              />
              <span>Apenas abaixo do mínimo</span>
            </label>
          </div>

          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-filters">
            Limpar Filtros
          </button>
        </div>

        <div class="list-content">
          ${this.renderTable()}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza a tabela de estoques
   * @returns {string} - HTML da tabela
   */
  renderTable() {
    if (this.filteredEstoques.length === 0) {
      return `
        <div class="empty-state">
          <p class="empty-message">
            ${this.estoques.length === 0 
              ? 'Nenhum estoque registrado ainda.' 
              : 'Nenhum estoque encontrado com os filtros aplicados.'}
          </p>
        </div>
      `;
    }

    return `
      <table class="estoque-table">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Unidade</th>
            <th class="text-right">Quantidade Atual</th>
            <th class="text-right">Estoque Mínimo</th>
            <th class="text-right">Custo Médio</th>
            <th class="text-right">Valor Total</th>
            <th class="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredEstoques.map(item => this.renderRow(item)).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Renderiza uma linha da tabela
   * @param {Object} item - Dados do estoque e insumo
   * @returns {string} - HTML da linha
   */
  renderRow(item) {
    const { estoque, insumo } = item;
    const custoMedioFormatado = this.formatCurrency(estoque.custoMedioPonderado);
    const valorTotal = estoque.quantidadeAtual * estoque.custoMedioPonderado;
    const valorTotalFormatado = this.formatCurrency(valorTotal);
    const isLowStock = this.isLowStock(estoque, insumo);
    const rowClass = isLowStock ? 'row-warning' : '';

    return `
      <tr class="${rowClass}" data-id="${estoque.insumoId}">
        <td>
          <div class="cell-content">
            ${isLowStock ? '<span class="badge badge-warning">⚠️ Estoque Baixo</span>' : ''}
            <span class="insumo-name">${this.escapeHtml(insumo.nome)}</span>
          </div>
        </td>
        <td>${this.escapeHtml(insumo.unidade)}</td>
        <td class="text-right">${estoque.quantidadeAtual}</td>
        <td class="text-right">${insumo.estoqueMinimo || 0}</td>
        <td class="text-right">${custoMedioFormatado}</td>
        <td class="text-right">${valorTotalFormatado}</td>
        <td class="actions-cell">
          <button
            type="button"
            class="btn-icon btn-history"
            data-id="${estoque.insumoId}"
            title="Ver Histórico"
            aria-label="Ver histórico de ${this.escapeHtml(insumo.nome)}"
          >
            📋
          </button>
        </td>
      </tr>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    const searchInput = this.container.querySelector('#search-input');
    const categoriaFilter = this.container.querySelector('#categoria-filter');
    const abaixoMinimoFilter = this.container.querySelector('#abaixo-minimo-filter');
    const btnClearFilters = this.container.querySelector('#btn-clear-filters');

    // Busca
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de categoria
    if (categoriaFilter) {
      categoriaFilter.addEventListener('change', (e) => {
        this.filters.categoria = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de abaixo do mínimo
    if (abaixoMinimoFilter) {
      abaixoMinimoFilter.addEventListener('change', (e) => {
        this.filters.apenasAbaixoMinimo = e.target.checked;
        this.applyFilters();
      });
    }

    // Limpar filtros
    if (btnClearFilters) {
      btnClearFilters.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Botão de histórico
    this.container.addEventListener('click', (e) => {
      const target = e.target;

      if (target.classList.contains('btn-history')) {
        const insumoId = target.dataset.id;
        this.handleViewHistory(insumoId);
      }
    });
  }

  /**
   * Atualiza a lista de estoques
   * @param {Array} estoques - Array de estoques
   * @param {Array} insumos - Array de insumos
   */
  update(estoques, insumos) {
    this.estoques = estoques || [];
    this.insumos = insumos || [];
    this.applyFilters();
  }

  /**
   * Aplica filtros à lista
   */
  applyFilters() {
    this.filteredEstoques = this.estoques
      .map(estoque => {
        const insumo = this.insumos.find(i => i.id === estoque.insumoId);
        return insumo ? { estoque, insumo } : null;
      })
      .filter(item => item !== null)
      .filter(item => {
        const { estoque, insumo } = item;

        // Filtro de busca (nome)
        if (this.filters.search) {
          const searchLower = this.filters.search.toLowerCase();
          const nomeLower = insumo.nome.toLowerCase();
          if (!nomeLower.includes(searchLower)) {
            return false;
          }
        }

        // Filtro de categoria (unidade)
        if (this.filters.categoria && insumo.unidade !== this.filters.categoria) {
          return false;
        }

        // Filtro de abaixo do mínimo
        if (this.filters.apenasAbaixoMinimo) {
          if (!this.isLowStock(estoque, insumo)) {
            return false;
          }
        }

        return true;
      });

    this.render();
    this.attachEventListeners();
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filters = {
      search: '',
      categoria: '',
      apenasAbaixoMinimo: false
    };
    this.applyFilters();
  }

  /**
   * Verifica se estoque está abaixo do mínimo
   * @param {Object} estoque - Dados do estoque
   * @param {Object} insumo - Dados do insumo
   * @returns {boolean} - True se estoque baixo
   */
  isLowStock(estoque, insumo) {
    if (!insumo.estoqueMinimo) {
      return false;
    }
    return estoque.isAbaixoMinimo(insumo.estoqueMinimo);
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
   * Handler para ver histórico de movimentações
   * @param {string} insumoId - ID do insumo
   */
  handleViewHistory(insumoId) {
    this.emit('viewHistory', insumoId);
  }

  /**
   * Emite um evento customizado
   * @param {string} eventName - Nome do evento
   * @param {*} data - Dados do evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(`estoque-list:${eventName}`, {
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
    this.container.addEventListener(`estoque-list:${eventName}`, (e) => {
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
