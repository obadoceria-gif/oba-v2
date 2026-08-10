/**
 * FilterPanel - Painel de filtros
 * Componente para exibir e gerenciar múltiplos filtros
 */

export class FilterPanel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      filters: options.filters || [],
      onFilterChange: options.onFilterChange || (() => {}),
      onClear: options.onClear || (() => {}),
      showClearButton: options.showClearButton !== false,
      ...options
    };
    
    this.filterValues = {};
    
    this.render();
    this.attachEvents();
  }

  render() {
    const filtersHTML = this.options.filters.map(filter => {
      return this.renderFilter(filter);
    }).join('');

    const clearButtonHTML = this.options.showClearButton ? `
      <button class="filter-clear-btn" title="Limpar todos os filtros">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Limpar Filtros
      </button>
    ` : '';

    this.container.innerHTML = `
      <div class="filter-panel">
        <div class="filter-panel-header">
          <h3 class="filter-panel-title">Filtros</h3>
          ${clearButtonHTML}
        </div>
        <div class="filter-panel-body">
          ${filtersHTML}
        </div>
      </div>
    `;
  }

  renderFilter(filter) {
    switch (filter.type) {
      case 'select':
        return this.renderSelect(filter);
      case 'checkbox':
        return this.renderCheckbox(filter);
      case 'date':
        return this.renderDate(filter);
      case 'range':
        return this.renderRange(filter);
      default:
        return '';
    }
  }

  renderSelect(filter) {
    const options = filter.options.map(opt => {
      const value = typeof opt === 'object' ? opt.value : opt;
      const label = typeof opt === 'object' ? opt.label : opt;
      return `<option value="${value}">${label}</option>`;
    }).join('');

    return `
      <div class="filter-group">
        <label class="filter-label">${filter.label}</label>
        <select class="filter-select" data-filter-key="${filter.key}">
          <option value="">Todos</option>
          ${options}
        </select>
      </div>
    `;
  }

  renderCheckbox(filter) {
    const checkboxes = filter.options.map(opt => {
      const value = typeof opt === 'object' ? opt.value : opt;
      const label = typeof opt === 'object' ? opt.label : opt;
      return `
        <label class="filter-checkbox-label">
          <input 
            type="checkbox" 
            class="filter-checkbox" 
            data-filter-key="${filter.key}"
            value="${value}"
          >
          <span>${label}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="filter-group">
        <label class="filter-label">${filter.label}</label>
        <div class="filter-checkbox-group">
          ${checkboxes}
        </div>
      </div>
    `;
  }

  renderDate(filter) {
    return `
      <div class="filter-group">
        <label class="filter-label">${filter.label}</label>
        <input 
          type="date" 
          class="filter-date" 
          data-filter-key="${filter.key}"
        >
      </div>
    `;
  }

  renderRange(filter) {
    return `
      <div class="filter-group">
        <label class="filter-label">${filter.label}</label>
        <div class="filter-range-group">
          <input 
            type="number" 
            class="filter-range-input" 
            data-filter-key="${filter.key}-min"
            placeholder="Mín"
          >
          <span class="filter-range-separator">até</span>
          <input 
            type="number" 
            class="filter-range-input" 
            data-filter-key="${filter.key}-max"
            placeholder="Máx"
          >
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Selects
    this.container.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const key = e.target.dataset.filterKey;
        const value = e.target.value;
        this.filterValues[key] = value;
        this.options.onFilterChange(key, value);
      });
    });

    // Checkboxes
    this.container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const key = checkbox.dataset.filterKey;
        const checked = Array.from(
          this.container.querySelectorAll(`.filter-checkbox[data-filter-key="${key}"]:checked`)
        ).map(cb => cb.value);
        
        this.filterValues[key] = checked.length > 0 ? checked : null;
        this.options.onFilterChange(key, this.filterValues[key]);
      });
    });

    // Dates
    this.container.querySelectorAll('.filter-date').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.filterKey;
        const value = e.target.value;
        this.filterValues[key] = value;
        this.options.onFilterChange(key, value);
      });
    });

    // Range inputs
    this.container.querySelectorAll('.filter-range-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.filterKey;
        const value = e.target.value;
        this.filterValues[key] = value;
        this.options.onFilterChange(key, value);
      });
    });

    // Clear button
    const clearBtn = this.container.querySelector('.filter-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clear();
      });
    }
  }

  clear() {
    // Limpar selects
    this.container.querySelectorAll('.filter-select').forEach(select => {
      select.value = '';
    });

    // Limpar checkboxes
    this.container.querySelectorAll('.filter-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Limpar dates
    this.container.querySelectorAll('.filter-date').forEach(input => {
      input.value = '';
    });

    // Limpar ranges
    this.container.querySelectorAll('.filter-range-input').forEach(input => {
      input.value = '';
    });

    this.filterValues = {};
    this.options.onClear();
  }

  getValues() {
    return { ...this.filterValues };
  }

  setValues(values) {
    Object.keys(values).forEach(key => {
      const value = values[key];
      
      // Set select
      const select = this.container.querySelector(`.filter-select[data-filter-key="${key}"]`);
      if (select) {
        select.value = value;
      }

      // Set checkboxes
      if (Array.isArray(value)) {
        value.forEach(val => {
          const checkbox = this.container.querySelector(
            `.filter-checkbox[data-filter-key="${key}"][value="${val}"]`
          );
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }

      // Set date
      const date = this.container.querySelector(`.filter-date[data-filter-key="${key}"]`);
      if (date) {
        date.value = value;
      }

      // Set range
      const range = this.container.querySelector(`.filter-range-input[data-filter-key="${key}"]`);
      if (range) {
        range.value = value;
      }
    });

    this.filterValues = { ...values };
  }
}

/**
 * Helper para criar FilterPanel
 */
export function createFilterPanel(container, options) {
  return new FilterPanel(container, options);
}
