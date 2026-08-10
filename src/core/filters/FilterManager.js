/**
 * FilterManager - Gerenciador de filtros e busca
 * Sistema completo para filtrar e buscar dados em listas
 */

export class FilterManager {
  constructor(config = {}) {
    this.filters = {};
    this.searchTerm = '';
    this.data = [];
    this.filteredData = [];
    this.config = {
      searchFields: config.searchFields || [],
      caseSensitive: config.caseSensitive || false,
      debounceTime: config.debounceTime || 300,
      persistKey: config.persistKey || null,
      ...config
    };
    
    this.debounceTimer = null;
    this.listeners = [];
    
    // Restaurar filtros salvos
    if (this.config.persistKey) {
      this.loadFilters();
    }
  }

  /**
   * Define os dados a serem filtrados
   */
  setData(data) {
    this.data = data || [];
    this.applyFilters();
    return this;
  }

  /**
   * Define termo de busca
   */
  setSearch(term) {
    this.searchTerm = term || '';
    
    // Debounce para busca em tempo real
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.applyFilters();
      this.saveFilters();
    }, this.config.debounceTime);
    
    return this;
  }

  /**
   * Define um filtro
   */
  setFilter(key, value) {
    if (value === null || value === undefined || value === '') {
      delete this.filters[key];
    } else {
      this.filters[key] = value;
    }
    
    this.applyFilters();
    this.saveFilters();
    return this;
  }

  /**
   * Define múltiplos filtros
   */
  setFilters(filters) {
    this.filters = { ...filters };
    this.applyFilters();
    this.saveFilters();
    return this;
  }

  /**
   * Limpa todos os filtros
   */
  clearFilters() {
    this.filters = {};
    this.searchTerm = '';
    this.applyFilters();
    this.saveFilters();
    return this;
  }

  /**
   * Aplica filtros e busca nos dados
   */
  applyFilters() {
    let result = [...this.data];

    // Aplicar busca
    if (this.searchTerm && this.config.searchFields.length > 0) {
      const term = this.config.caseSensitive 
        ? this.searchTerm 
        : this.searchTerm.toLowerCase();

      result = result.filter(item => {
        return this.config.searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          if (value === null || value === undefined) return false;
          
          const strValue = this.config.caseSensitive
            ? String(value)
            : String(value).toLowerCase();
          
          return strValue.includes(term);
        });
      });
    }

    // Aplicar filtros
    Object.keys(this.filters).forEach(key => {
      const filterValue = this.filters[key];
      
      result = result.filter(item => {
        const itemValue = this.getNestedValue(item, key);
        
        // Filtro por array (múltiplos valores)
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }
        
        // Filtro por função customizada
        if (typeof filterValue === 'function') {
          return filterValue(itemValue, item);
        }
        
        // Filtro por valor exato
        return itemValue === filterValue;
      });
    });

    this.filteredData = result;
    this.notifyListeners();
    return result;
  }

  /**
   * Obtém valor aninhado de um objeto
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Obtém dados filtrados
   */
  getFilteredData() {
    return this.filteredData;
  }

  /**
   * Obtém contagem de resultados
   */
  getCount() {
    return {
      total: this.data.length,
      filtered: this.filteredData.length,
      hasFilters: this.hasActiveFilters()
    };
  }

  /**
   * Verifica se há filtros ativos
   */
  hasActiveFilters() {
    return Object.keys(this.filters).length > 0 || this.searchTerm !== '';
  }

  /**
   * Adiciona listener para mudanças
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifica listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.filteredData, this.getCount());
    });
  }

  /**
   * Salva filtros no localStorage
   */
  saveFilters() {
    if (!this.config.persistKey) return;
    
    try {
      const state = {
        filters: this.filters,
        searchTerm: this.searchTerm
      };
      localStorage.setItem(this.config.persistKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Erro ao salvar filtros:', error);
    }
  }

  /**
   * Carrega filtros do localStorage
   */
  loadFilters() {
    if (!this.config.persistKey) return;
    
    try {
      const saved = localStorage.getItem(this.config.persistKey);
      if (saved) {
        const state = JSON.parse(saved);
        this.filters = state.filters || {};
        this.searchTerm = state.searchTerm || '';
      }
    } catch (error) {
      console.warn('Erro ao carregar filtros:', error);
    }
  }

  /**
   * Limpa filtros salvos
   */
  clearSavedFilters() {
    if (!this.config.persistKey) return;
    
    try {
      localStorage.removeItem(this.config.persistKey);
    } catch (error) {
      console.warn('Erro ao limpar filtros salvos:', error);
    }
  }
}

/**
 * Helper para criar FilterManager
 */
export function createFilterManager(config) {
  return new FilterManager(config);
}
