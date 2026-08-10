/**
 * FornecedorStats
 * 
 * Componente para exibir estatísticas de fornecedores.
 */

export class FornecedorStats {
  /**
   * @param {HTMLElement} container - Container do componente
   * @param {Object} stats - Estatísticas
   */
  constructor(container, stats = {}) {
    this.container = container;
    this.stats = stats;
  }

  /**
   * Renderiza o componente
   */
  render() {
    if (!this.container) {
      console.error('[FornecedorStats] Container não encontrado');
      return;
    }

    this.container.innerHTML = `
      <div class="fornecedor-stats">
        ${this.renderCard('Total', this.stats.total || 0, '📦', 'primary')}
        ${this.renderCard('Ativos', this.stats.ativos || 0, '✅', 'success')}
        ${this.renderCard('Inativos', this.stats.inativos || 0, '🚫', 'secondary')}
      </div>
    `;
  }

  /**
   * Renderiza um card de estatística
   * @param {string} title - Título do card
   * @param {number} value - Valor
   * @param {string} icon - Ícone
   * @param {string} color - Cor (primary, success, danger, etc)
   * @returns {string}
   */
  renderCard(title, value, icon, color) {
    return `
      <div class="stat-card stat-card-${color}">
        <div class="stat-icon">${icon}</div>
        <div class="stat-content">
          <div class="stat-value">${value}</div>
          <div class="stat-title">${title}</div>
        </div>
      </div>
    `;
  }

  /**
   * Atualiza as estatísticas
   * @param {Object} stats
   */
  update(stats) {
    this.stats = stats;
    this.render();
  }

  /**
   * Destrói o componente
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
