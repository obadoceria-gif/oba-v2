/**
 * ReportBuilder - Construtor de relatórios com interface fluente
 * Facilita a criação de relatórios complexos
 */

export class ReportBuilder {
  constructor() {
    this.data = [];
    this.columns = [];
    this.filters = [];
    this.sorts = [];
    this.groups = [];
    this.summaries = [];
    this.config = {
      title: 'Relatório',
      subtitle: '',
      footer: ''
    };
  }

  /**
   * Define os dados do relatório
   */
  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    return this;
  }

  /**
   * Adiciona uma coluna
   */
  addColumn(key, label, format = null) {
    this.columns.push({ key, label, format });
    return this;
  }

  /**
   * Define múltiplas colunas de uma vez
   */
  setColumns(columns) {
    this.columns = columns;
    return this;
  }

  /**
   * Adiciona um filtro
   */
  addFilter(key, operator, value) {
    this.filters.push({ key, operator, value });
    return this;
  }

  /**
   * Adiciona ordenação
   */
  addSort(key, direction = 'asc') {
    this.sorts.push({ key, direction });
    return this;
  }

  /**
   * Adiciona agrupamento
   */
  addGroup(key, label) {
    this.groups.push({ key, label });
    return this;
  }

  /**
   * Adiciona sumário (totalizador)
   */
  addSummary(key, operation, label) {
    this.summaries.push({ key, operation, label });
    return this;
  }

  /**
   * Define título
   */
  setTitle(title) {
    this.config.title = title;
    return this;
  }

  /**
   * Define subtítulo
   */
  setSubtitle(subtitle) {
    this.config.subtitle = subtitle;
    return this;
  }

  /**
   * Define rodapé
   */
  setFooter(footer) {
    this.config.footer = footer;
    return this;
  }

  /**
   * Aplica filtros aos dados
   */
  _applyFilters() {
    if (this.filters.length === 0) return this.data;

    return this.data.filter(row => {
      return this.filters.every(filter => {
        const value = row[filter.key];
        
        switch (filter.operator) {
          case '=':
          case 'equals':
            return value === filter.value;
          
          case '!=':
          case 'notEquals':
            return value !== filter.value;
          
          case '>':
          case 'greaterThan':
            return value > filter.value;
          
          case '>=':
          case 'greaterOrEqual':
            return value >= filter.value;
          
          case '<':
          case 'lessThan':
            return value < filter.value;
          
          case '<=':
          case 'lessOrEqual':
            return value <= filter.value;
          
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          
          default:
            return true;
        }
      });
    });
  }

  /**
   * Aplica ordenação aos dados
   */
  _applySorts(data) {
    if (this.sorts.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of this.sorts) {
        const aVal = a[sort.key];
        const bVal = b[sort.key];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Calcula sumários
   */
  _calculateSummaries(data) {
    return this.summaries.map(summary => {
      const values = data.map(row => row[summary.key]).filter(v => v !== null && v !== undefined);
      
      let result = 0;
      switch (summary.operation) {
        case 'sum':
          result = values.reduce((acc, val) => acc + Number(val), 0);
          break;
        
        case 'avg':
        case 'average':
          result = values.reduce((acc, val) => acc + Number(val), 0) / values.length;
          break;
        
        case 'min':
          result = Math.min(...values.map(Number));
          break;
        
        case 'max':
          result = Math.max(...values.map(Number));
          break;
        
        case 'count':
          result = values.length;
          break;
        
        default:
          result = 0;
      }
      
      return {
        label: summary.label,
        value: result
      };
    });
  }

  /**
   * Constrói o relatório
   */
  build() {
    // Aplicar filtros
    let processedData = this._applyFilters();
    
    // Aplicar ordenação
    processedData = this._applySorts(processedData);
    
    // Calcular sumários
    const summaries = this._calculateSummaries(processedData);
    
    return {
      data: processedData,
      columns: this.columns,
      summaries,
      config: this.config,
      metadata: {
        totalRecords: this.data.length,
        filteredRecords: processedData.length,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Reseta o builder
   */
  reset() {
    this.data = [];
    this.columns = [];
    this.filters = [];
    this.sorts = [];
    this.groups = [];
    this.summaries = [];
    this.config = {
      title: 'Relatório',
      subtitle: '',
      footer: ''
    };
    return this;
  }
}

/**
 * Helper para criar builder de relatórios
 */
export function createReportBuilder() {
  return new ReportBuilder();
}
