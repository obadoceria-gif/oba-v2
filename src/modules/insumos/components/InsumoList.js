/**
 * InsumoList Component
 * 
 * Lista de insumos com filtros, busca e ações.
 * 
 * Requirements:
 * - 1.8: Busca de insumos com filtros
 * - 1.9: Destaque para insumos abaixo do estoque mínimo
 */

export class InsumoList {
  /**
   * @param {HTMLElement} container - Container onde a lista será renderizada
   * @param {Object} options - Opções de configuração
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.insumos = [];
    this.filteredInsumos = [];
    this.filters = {
      search: '',
      unidade: '',
      fornecedor: ''
    };
    
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza a lista
   */
  render() {
    this.container.innerHTML = `
      <div class="insumo-list">
        <div class="list-header">
          <h2 class="list-title">Insumos Cadastrados</h2>
          <span class="list-count">${this.filteredInsumos.length} ${this.filteredInsumos.length === 1 ? 'item' : 'itens'}</span>
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
            <select id="unidade-filter" class="filter-select">
              <option value="">Todas as unidades</option>
              <option value="kg" ${this.filters.unidade === 'kg' ? 'selected' : ''}>Quilograma (kg)</option>
              <option value="g" ${this.filters.unidade === 'g' ? 'selected' : ''}>Grama (g)</option>
              <option value="L" ${this.filters.unidade === 'L' ? 'selected' : ''}>Litro (L)</option>
              <option value="ml" ${this.filters.unidade === 'ml' ? 'selected' : ''}>Mililitro (ml)</option>
              <option value="un" ${this.filters.unidade === 'un' ? 'selected' : ''}>Unidade (un)</option>
            </select>
          </div>

          <div class="filter-group">
            <input
              type="text"
              id="fornecedor-filter"
              class="filter-input"
              placeholder="Filtrar por fornecedor..."
              value="${this.filters.fornecedor}"
            />
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
   * Renderiza a tabela de insumos
   * @returns {string} - HTML da tabela
   */
  renderTable() {
    if (this.filteredInsumos.length === 0) {
      return `
        <div class="empty-state">
          <p class="empty-message">
            ${this.insumos.length === 0 
              ? 'Nenhum insumo cadastrado ainda.' 
              : 'Nenhum insumo encontrado com os filtros aplicados.'}
          </p>
        </div>
      `;
    }

    return `
      <table class="insumo-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Marca</th>
            <th>Qtde/Embalagem</th>
            <th>Unidade</th>
            <th>Custo Unitário</th>
            <th>Fornecedor</th>
            <th>Estoque Mínimo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredInsumos.map(insumo => this.renderRow(insumo)).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Renderiza uma linha da tabela
   * @param {Object} insumo - Dados do insumo
   * @returns {string} - HTML da linha
   */
  renderRow(insumo) {
    const custoFormatado = this.formatCurrency(insumo.custoUnitario);
    const isLowStock = this.isLowStock(insumo);
    const rowClass = isLowStock ? 'row-warning' : '';

    return `
      <tr class="${rowClass}" data-id="${insumo.id}">
        <td>
          <div class="cell-content">
            ${isLowStock ? '<span class="badge badge-warning">⚠️ Estoque Baixo</span>' : ''}
            <span class="insumo-name">${this.escapeHtml(insumo.nome)}</span>
          </div>
        </td>
        <td>${this.escapeHtml(insumo.marca || '-')}</td>
        <td class="text-center">${insumo.quantidadePorEmbalagem || '-'}</td>
        <td>${this.escapeHtml(insumo.unidade)}</td>
        <td class="text-right">${custoFormatado}</td>
        <td>${this.escapeHtml(insumo.fornecedor || '-')}</td>
        <td class="text-center">${insumo.estoqueMinimo || 0}</td>
        <td class="actions-cell">
          <button
            type="button"
            class="btn-icon btn-edit"
            data-id="${insumo.id}"
            title="Editar"
            aria-label="Editar ${this.escapeHtml(insumo.nome)}"
          >
            ✏️
          </button>
          <button
            type="button"
            class="btn-icon btn-delete"
            data-id="${insumo.id}"
            title="Excluir"
            aria-label="Excluir ${this.escapeHtml(insumo.nome)}"
          >
            🗑️
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
    const unidadeFilter = this.container.querySelector('#unidade-filter');
    const fornecedorFilter = this.container.querySelector('#fornecedor-filter');
    const btnClearFilters = this.container.querySelector('#btn-clear-filters');

    // Busca
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de unidade
    if (unidadeFilter) {
      unidadeFilter.addEventListener('change', (e) => {
        this.filters.unidade = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro de fornecedor
    if (fornecedorFilter) {
      fornecedorFilter.addEventListener('input', (e) => {
        this.filters.fornecedor = e.target.value;
        this.applyFilters();
      });
    }

    // Limpar filtros
    if (btnClearFilters) {
      btnClearFilters.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Botões de ação (editar e excluir)
    this.container.addEventListener('click', (e) => {
      const target = e.target;

      if (target.classList.contains('btn-edit')) {
        const id = target.dataset.id;
        this.handleEdit(id);
      }

      if (target.classList.contains('btn-delete')) {
        const id = target.dataset.id;
        this.handleDelete(id);
      }
    });
  }

  /**
   * Atualiza a lista de insumos
   * @param {Array} insumos - Array de insumos
   */
  update(insumos) {
    console.log('[InsumoList] update chamado com:', insumos);
    console.log('[InsumoList] Quantidade:', insumos?.length || 0);
    this.insumos = insumos || [];
    this.applyFilters();
    console.log('[InsumoList] Filtros aplicados, insumos filtrados:', this.filteredInsumos.length);
  }

  /**
   * Aplica filtros à lista
   */
  applyFilters() {
    console.log('[InsumoList] applyFilters - Total de insumos:', this.insumos.length);
    console.log('[InsumoList] Filtros ativos:', this.filters);
    
    this.filteredInsumos = this.insumos.filter(insumo => {
      // Filtro de busca (nome)
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        const nomeLower = insumo.nome.toLowerCase();
        if (!nomeLower.includes(searchLower)) {
          return false;
        }
      }

      // Filtro de unidade
      if (this.filters.unidade && insumo.unidade !== this.filters.unidade) {
        return false;
      }

      // Filtro de fornecedor
      if (this.filters.fornecedor) {
        const fornecedorLower = this.filters.fornecedor.toLowerCase();
        const insumoFornecedorLower = (insumo.fornecedor || '').toLowerCase();
        if (!insumoFornecedorLower.includes(fornecedorLower)) {
          return false;
        }
      }

      return true;
    });

    console.log('[InsumoList] Insumos após filtros:', this.filteredInsumos.length);
    console.log('[InsumoList] Chamando render()...');
    this.render();
    console.log('[InsumoList] Render concluído, anexando event listeners...');
    this.attachEventListeners();
    console.log('[InsumoList] Event listeners anexados');
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filters = {
      search: '',
      unidade: '',
      fornecedor: ''
    };
    this.applyFilters();
  }

  /**
   * Verifica se insumo está com estoque baixo
   * @param {Object} insumo - Dados do insumo
   * @returns {boolean} - True se estoque baixo
   */
  isLowStock(insumo) {
    // Placeholder: será implementado quando integrar com módulo de estoque
    // Por enquanto, retorna false
    return false;
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
   * Handler para editar insumo
   * @param {string} id - ID do insumo
   */
  handleEdit(id) {
    const insumo = this.insumos.find(i => i.id === id);
    if (insumo) {
      this.emit('edit', insumo);
    }
  }

  /**
   * Handler para excluir insumo
   * @param {string} id - ID do insumo
   */
  handleDelete(id) {
    const insumo = this.insumos.find(i => i.id === id);
    if (insumo) {
      this.emit('delete', id); // Emitir apenas o ID
    }
  }

  /**
   * Emite um evento customizado
   * @param {string} eventName - Nome do evento
   * @param {*} data - Dados do evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(`insumo-list:${eventName}`, {
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
    this.container.addEventListener(`insumo-list:${eventName}`, (e) => {
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
