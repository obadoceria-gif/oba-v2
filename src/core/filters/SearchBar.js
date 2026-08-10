/**
 * SearchBar - Componente de barra de busca
 * Input de busca com ícone e funcionalidade de limpar
 */

export class SearchBar {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: options.placeholder || 'Buscar...',
      onSearch: options.onSearch || (() => {}),
      debounce: options.debounce || 300,
      ...options
    };
    
    this.searchTerm = '';
    this.debounceTimer = null;
    
    this.render();
    this.attachEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-bar">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="${this.options.placeholder}"
            value="${this.searchTerm}"
          >
          <button class="search-clear" style="display: none;" title="Limpar busca">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.input = this.container.querySelector('.search-input');
    this.clearBtn = this.container.querySelector('.search-clear');
  }

  attachEvents() {
    // Input com debounce
    this.input.addEventListener('input', (e) => {
      this.searchTerm = e.target.value;
      this.updateClearButton();
      
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.options.onSearch(this.searchTerm);
      }, this.options.debounce);
    });

    // Botão limpar
    this.clearBtn.addEventListener('click', () => {
      this.clear();
    });

    // Enter para buscar imediatamente
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
        this.options.onSearch(this.searchTerm);
      }
    });
  }

  updateClearButton() {
    if (this.searchTerm) {
      this.clearBtn.style.display = 'flex';
    } else {
      this.clearBtn.style.display = 'none';
    }
  }

  clear() {
    this.searchTerm = '';
    this.input.value = '';
    this.updateClearButton();
    this.options.onSearch('');
    this.input.focus();
  }

  setValue(value) {
    this.searchTerm = value || '';
    this.input.value = this.searchTerm;
    this.updateClearButton();
  }

  getValue() {
    return this.searchTerm;
  }

  focus() {
    this.input.focus();
  }

  disable() {
    this.input.disabled = true;
  }

  enable() {
    this.input.disabled = false;
  }
}

/**
 * Helper para criar SearchBar
 */
export function createSearchBar(container, options) {
  return new SearchBar(container, options);
}
