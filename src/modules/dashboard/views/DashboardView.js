/**
 * DashboardView.js - View do Dashboard
 * 
 * Exibe visão geral do sistema com métricas e indicadores
 */

export class DashboardView {
  constructor(container) {
    this.container = container;
    this.cards = [];
  }

  /**
   * Renderiza o dashboard
   */
  render(data) {
    this.container.innerHTML = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>📊 Dashboard</h2>
          <p class="dashboard-subtitle">Visão geral do sistema</p>
        </div>

        <div class="dashboard-cards">
          ${this.renderCard('insumos', '📦', 'Insumos', data.insumos)}
          ${this.renderCard('estoque', '📊', 'Estoque', data.estoque)}
          ${this.renderCard('fornecedores', '🏢', 'Fornecedores', data.fornecedores)}
          ${this.renderCard('compras', '🛒', 'Compras', data.compras)}
          ${this.renderCard('fichas', '📋', 'Fichas Técnicas', data.fichas)}
          ${this.renderCard('producao', '🏭', 'Produção', data.producao)}
        </div>

        <div class="dashboard-alerts">
          <h3>⚠️ Alertas</h3>
          <div class="alerts-list" id="alerts-list">
            ${this.renderAlerts(data.alerts)}
          </div>
        </div>

        <div class="dashboard-recent">
          <h3>🕐 Atividades Recentes</h3>
          <div class="recent-list" id="recent-list">
            ${this.renderRecentActivities(data.recent)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza um card de métrica
   */
  renderCard(id, icon, title, data) {
    return `
      <div class="dashboard-card" data-module="${id}">
        <div class="card-header">
          <div class="card-icon">${icon}</div>
        </div>
        <div class="card-content">
          <h3>${title}</h3>
          <div class="card-metric">
            <span class="metric-value">${data.total || 0}</span>
            <span class="metric-label">Total</span>
          </div>
          ${data.subtitle ? `<p class="card-subtitle">${data.subtitle}</p>` : ''}
        </div>
        ${data.badge ? `<div class="card-badge ${data.badgeType || ''}">${data.badge}</div>` : ''}
      </div>
    `;
  }

  /**
   * Renderiza lista de alertas
   */
  renderAlerts(alerts) {
    if (!alerts || alerts.length === 0) {
      return '<p class="empty-message">✅ Nenhum alerta no momento</p>';
    }

    return alerts.map(alert => `
      <div class="alert-item ${alert.type}">
        <span class="alert-icon">${this.getAlertIcon(alert.type)}</span>
        <div class="alert-content">
          <strong>${alert.title}</strong>
          <p>${alert.message}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Renderiza atividades recentes
   */
  renderRecentActivities(activities) {
    if (!activities || activities.length === 0) {
      return '<p class="empty-message">Nenhuma atividade recente</p>';
    }

    return activities.map(activity => `
      <div class="activity-item">
        <span class="activity-icon">${activity.icon}</span>
        <div class="activity-content">
          <strong>${activity.title}</strong>
          <p>${activity.description}</p>
          <span class="activity-time">${activity.time}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Retorna ícone do alerta
   */
  getAlertIcon(type) {
    const icons = {
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * Atualiza dados do dashboard
   */
  update(data) {
    this.render(data);
  }

  /**
   * Destrói a view
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
