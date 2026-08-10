/**
 * DashboardController.js - Controller do Dashboard
 * 
 * Gerencia lógica do dashboard e coleta de métricas
 */

export class DashboardController {
  constructor(stateManager, view) {
    this.stateManager = stateManager;
    this.view = view;
  }

  /**
   * Inicializa o controller
   */
  async initialize() {
    const data = this.collectDashboardData();
    this.view.render(data);
    
    // Configurar event listeners nos cards
    this.setupCardListeners();
  }

  /**
   * Coleta dados para o dashboard
   */
  collectDashboardData() {
    const insumos = this.stateManager.getState('insumos') || [];
    const estoque = this.stateManager.getState('estoque') || [];
    const movimentacoes = this.stateManager.getState('movimentacoes') || [];
    const fornecedores = this.stateManager.getState('fornecedores') || [];
    const compras = this.stateManager.getState('compras') || [];
    const fichas = this.stateManager.getState('fichas') || [];
    const producoes = this.stateManager.getState('producoes') || [];

    return {
      insumos: this.getInsumosMetrics(insumos),
      estoque: this.getEstoqueMetrics(estoque),
      fornecedores: this.getFornecedoresMetrics(fornecedores),
      compras: this.getComprasMetrics(compras),
      fichas: this.getFichasMetrics(fichas),
      producao: this.getProducaoMetrics(producoes),
      alerts: this.generateAlerts(estoque, compras, producoes),
      recent: this.getRecentActivities(movimentacoes, compras, producoes)
    };
  }

  /**
   * Métricas de insumos
   */
  getInsumosMetrics(insumos) {
    return {
      total: insumos.length,
      subtitle: `${insumos.length} insumos cadastrados`
    };
  }

  /**
   * Métricas de estoque
   */
  getEstoqueMetrics(estoque) {
    const baixoEstoque = estoque.filter(item => 
      item.quantidade <= (item.estoqueMinimo || 0)
    ).length;

    return {
      total: estoque.length,
      subtitle: `${estoque.length} itens em estoque`,
      badge: baixoEstoque > 0 ? `${baixoEstoque} baixo` : null,
      badgeType: baixoEstoque > 0 ? 'warning' : null
    };
  }

  /**
   * Métricas de fornecedores
   */
  getFornecedoresMetrics(fornecedores) {
    const ativos = fornecedores.filter(f => f.ativo).length;
    const inativos = fornecedores.filter(f => !f.ativo).length;

    return {
      total: fornecedores.length,
      subtitle: `${ativos} ativos, ${inativos} inativos`,
      badge: ativos > 0 ? `${ativos} ativo${ativos > 1 ? 's' : ''}` : null,
      badgeType: ativos > 0 ? 'success' : null
    };
  }

  /**
   * Métricas de compras
   */
  getComprasMetrics(compras) {
    const pendentes = compras.filter(c => c.status === 'pendente').length;
    const confirmadas = compras.filter(c => c.status === 'confirmada').length;

    return {
      total: compras.length,
      subtitle: `${confirmadas} confirmadas, ${pendentes} pendentes`,
      badge: pendentes > 0 ? `${pendentes} pendente${pendentes > 1 ? 's' : ''}` : null,
      badgeType: pendentes > 0 ? 'info' : null
    };
  }

  /**
   * Métricas de fichas técnicas
   */
  getFichasMetrics(fichas) {
    return {
      total: fichas.length,
      subtitle: `${fichas.length} receitas cadastradas`
    };
  }

  /**
   * Métricas de produção
   */
  getProducaoMetrics(producoes) {
    const emAndamento = producoes.filter(p => p.status === 'em_andamento').length;
    const concluidas = producoes.filter(p => p.status === 'concluida').length;

    return {
      total: producoes.length,
      subtitle: `${concluidas} concluídas, ${emAndamento} em andamento`,
      badge: emAndamento > 0 ? `${emAndamento} ativa${emAndamento > 1 ? 's' : ''}` : null,
      badgeType: emAndamento > 0 ? 'success' : null
    };
  }

  /**
   * Gera alertas do sistema
   */
  generateAlerts(estoque, compras, producoes) {
    const alerts = [];

    // Alerta de estoque baixo
    const baixoEstoque = estoque.filter(item => 
      item.quantidade <= (item.estoqueMinimo || 0)
    );
    
    if (baixoEstoque.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Estoque Baixo',
        message: `${baixoEstoque.length} ${baixoEstoque.length === 1 ? 'item está' : 'itens estão'} com estoque abaixo do mínimo`
      });
    }

    // Alerta de compras pendentes
    const comprasPendentes = compras.filter(c => c.status === 'pendente');
    if (comprasPendentes.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Compras Pendentes',
        message: `${comprasPendentes.length} ${comprasPendentes.length === 1 ? 'compra aguardando' : 'compras aguardando'} confirmação`
      });
    }

    // Alerta de produções em andamento
    const producoesAtivas = producoes.filter(p => p.status === 'em_andamento');
    if (producoesAtivas.length > 0) {
      alerts.push({
        type: 'success',
        title: 'Produções Ativas',
        message: `${producoesAtivas.length} ${producoesAtivas.length === 1 ? 'produção em' : 'produções em'} andamento`
      });
    }

    return alerts;
  }

  /**
   * Obtém atividades recentes
   */
  getRecentActivities(movimentacoes, compras, producoes) {
    const activities = [];

    // Últimas movimentações
    const recentMovs = movimentacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 3);

    recentMovs.forEach(mov => {
      activities.push({
        icon: mov.tipo === 'entrada' ? '📥' : '📤',
        title: `${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'} de Estoque`,
        description: `${mov.insumoNome || 'Item'} - ${mov.quantidade} ${mov.unidade || 'un'}`,
        time: this.formatTime(mov.data)
      });
    });

    // Últimas compras
    const recentCompras = compras
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 2);

    recentCompras.forEach(compra => {
      activities.push({
        icon: '🛒',
        title: 'Nova Compra',
        description: `${compra.fornecedorNome || 'Fornecedor'} - R$ ${compra.valorTotal?.toFixed(2) || '0.00'}`,
        time: this.formatTime(compra.data)
      });
    });

    // Últimas produções
    const recentProds = producoes
      .sort((a, b) => new Date(b.dataInicio) - new Date(a.dataInicio))
      .slice(0, 2);

    recentProds.forEach(prod => {
      activities.push({
        icon: '🏭',
        title: 'Produção Iniciada',
        description: `${prod.fichaNome || 'Receita'} - ${prod.quantidade} un`,
        time: this.formatTime(prod.dataInicio)
      });
    });

    // Ordenar por data e limitar a 5
    return activities
      .sort((a, b) => {
        // Ordenação simples por string de tempo (mais recente primeiro)
        return b.time.localeCompare(a.time);
      })
      .slice(0, 5);
  }

  /**
   * Formata tempo relativo
   */
  formatTime(dateString) {
    if (!dateString) return 'Agora';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Configura listeners dos cards
   */
  setupCardListeners() {
    const cards = this.view.container.querySelectorAll('.dashboard-card');
    
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const module = card.dataset.module;
        if (module) {
          // Disparar evento de navegação
          window.dispatchEvent(new CustomEvent('navigate', { 
            detail: { module } 
          }));
        }
      });
    });
  }

  /**
   * Atualiza dashboard
   */
  refresh() {
    const data = this.collectDashboardData();
    this.view.update(data);
    this.setupCardListeners();
  }
}
