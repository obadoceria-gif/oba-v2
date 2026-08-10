/**
 * CompraList - Lista de compras com filtros e ações
 */

import { eventBus } from '../../../core/events/EventBus.js';
import { formatCurrency } from '../../../core/utils/currency.js';
import { formatDate } from '../../../core/utils/date.js';

export class CompraList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Container da lista
   * @param {Array} options.compras - Lista de compras
   * @param {Array} options.fornecedores - Lista de fornecedores
   */
  constructor({ container, compras = [], fornecedores = [] }) {
    if (!container) {
      throw new Error('Container é obrigatório');
    }

    this.container = container;
    this.compras = compras;
    this.fornecedores = fornecedores;
    this.filtros = {
      fornecedor: '',
      dataInicio: '',
      dataFim: '',
      status: ''
    };
    this.eventBus = eventBus;

    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza a lista
   */
  render() {
    this.container.innerHTML = `
      <div class="compra-list">
        <div class="list-filters">
          <select id="filtro-fornecedor" class="filter-select">
            <option value="">Todos os fornecedores</option>
            ${this.fornecedores.map(f => `
              <option value="${f.id}">${f.nome}</option>
            `).join('')}
          </select>

          <input 
            type="date" 
            id="filtro-data-inicio" 
            class="filter-input"
            placeholder="Data início"
          />

          <input 
            type="date" 
            id="filtro-data-fim" 
            class="filter-input"
            placeholder="Data fim"
          />

          <select id="filtro-status" class="filter-select">
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="recebida">Recebida</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <button type="button" id="limpar-filtros-btn" class="btn-secondary">
            Limpar Filtros
          </button>
        </div>

        <div id="compras-table-container" class="table-container">
          ${this.renderTable()}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza a tabela de compras
   */
  renderTable() {
    const comprasFiltradas = this.getComprasFiltradas();

    if (comprasFiltradas.length === 0) {
      return '<p class="empty-message">Nenhuma compra encontrada</p>';
    }

    return `
      <table class="compras-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Insumos</th>
            <th>Valor Total</th>
            <th>Forma Pagamento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${comprasFiltradas.map(compra => this.renderCompraRow(compra)).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Renderiza uma linha da tabela
   */
  renderCompraRow(compra) {
    const fornecedor = this.fornecedores.find(f => f.id === compra.fornecedorId);
    const fornecedorNome = fornecedor ? fornecedor.nome : 'Desconhecido';
    const statusClass = `status-${compra.status}`;

    return `
      <tr data-compra-id="${compra.id}">
        <td>${formatDate(compra.data)}</td>
        <td>${fornecedorNome}</td>
        <td>${compra.insumos.length} item(ns)</td>
        <td>${formatCurrency(compra.valorTotal)}</td>
        <td>${this.formatFormaPagamento(compra.formaPagamento)}</td>
        <td>
          <span class="status-badge ${statusClass}">
            ${this.formatStatus(compra.status)}
          </span>
        </td>
        <td class="actions-cell">
          <button 
            type="button" 
            class="btn-icon btn-view" 
            data-compra-id="${compra.id}"
            title="Ver detalhes"
          >
            👁️
          </button>
          ${compra.status === 'pendente' ? `
            <button 
              type="button" 
              class="btn-icon btn-receive" 
              data-compra-id="${compra.id}"
              title="Marcar como recebida"
            >
              ✓
            </button>
            <button 
              type="button" 
              class="btn-icon btn-cancel" 
              data-compra-id="${compra.id}"
              title="Cancelar"
            >
              ✕
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    // Filtros
    const filtroFornecedor = this.container.querySelector('#filtro-fornecedor');
    const filtroDataInicio = this.container.querySelector('#filtro-data-inicio');
    const filtroDataFim = this.container.querySelector('#filtro-data-fim');
    const filtroStatus = this.container.querySelector('#filtro-status');
    const limparFiltrosBtn = this.container.querySelector('#limpar-filtros-btn');

    filtroFornecedor?.addEventListener('change', (e) => {
      this.filtros.fornecedor = e.target.value;
      this.updateTable();
    });

    filtroDataInicio?.addEventListener('change', (e) => {
      this.filtros.dataInicio = e.target.value;
      this.updateTable();
    });

    filtroDataFim?.addEventListener('change', (e) => {
      this.filtros.dataFim = e.target.value;
      this.updateTable();
    });

    filtroStatus?.addEventListener('change', (e) => {
      this.filtros.status = e.target.value;
      this.updateTable();
    });

    limparFiltrosBtn?.addEventListener('click', () => {
      this.limparFiltros();
    });

    // Ações da tabela
    this.attachTableActions();
  }

  /**
   * Anexa listeners das ações da tabela
   */
  attachTableActions() {
    const tableContainer = this.container.querySelector('#compras-table-container');

    tableContainer?.addEventListener('click', (e) => {
      const target = e.target;

      if (target.classList.contains('btn-view')) {
        const compraId = target.dataset.compraId;
        this.handleView(compraId);
      } else if (target.classList.contains('btn-receive')) {
        const compraId = target.dataset.compraId;
        this.handleReceive(compraId);
      } else if (target.classList.contains('btn-cancel')) {
        const compraId = target.dataset.compraId;
        this.handleCancel(compraId);
      }
    });
  }

  /**
   * Retorna compras filtradas
   */
  getComprasFiltradas() {
    return this.compras.filter(compra => {
      // Filtro por fornecedor
      if (this.filtros.fornecedor && compra.fornecedorId !== this.filtros.fornecedor) {
        return false;
      }

      // Filtro por data início
      if (this.filtros.dataInicio) {
        const dataCompra = new Date(compra.data);
        const dataInicio = new Date(this.filtros.dataInicio);
        if (dataCompra < dataInicio) {
          return false;
        }
      }

      // Filtro por data fim
      if (this.filtros.dataFim) {
        const dataCompra = new Date(compra.data);
        const dataFim = new Date(this.filtros.dataFim);
        if (dataCompra > dataFim) {
          return false;
        }
      }

      // Filtro por status
      if (this.filtros.status && compra.status !== this.filtros.status) {
        return false;
      }

      return true;
    });
  }

  /**
   * Atualiza a tabela
   */
  updateTable() {
    const tableContainer = this.container.querySelector('#compras-table-container');
    if (tableContainer) {
      tableContainer.innerHTML = this.renderTable();
      this.attachTableActions();
    }
  }

  /**
   * Limpa os filtros
   */
  limparFiltros() {
    this.filtros = {
      fornecedor: '',
      dataInicio: '',
      dataFim: '',
      status: ''
    };

    // Limpa os campos
    const filtroFornecedor = this.container.querySelector('#filtro-fornecedor');
    const filtroDataInicio = this.container.querySelector('#filtro-data-inicio');
    const filtroDataFim = this.container.querySelector('#filtro-data-fim');
    const filtroStatus = this.container.querySelector('#filtro-status');

    if (filtroFornecedor) filtroFornecedor.value = '';
    if (filtroDataInicio) filtroDataInicio.value = '';
    if (filtroDataFim) filtroDataFim.value = '';
    if (filtroStatus) filtroStatus.value = '';

    this.updateTable();
  }

  /**
   * Manipula visualização de detalhes
   */
  handleView(compraId) {
    this.eventBus.emit('compra:view', { compraId });
  }

  /**
   * Manipula recebimento de compra
   */
  handleReceive(compraId) {
    if (confirm('Confirma o recebimento desta compra?')) {
      this.eventBus.emit('compra:receive', { compraId });
    }
  }

  /**
   * Manipula cancelamento de compra
   */
  handleCancel(compraId) {
    if (confirm('Confirma o cancelamento desta compra?')) {
      this.eventBus.emit('compra:cancel', { compraId });
    }
  }

  /**
   * Formata forma de pagamento
   */
  formatFormaPagamento(forma) {
    const formas = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      boleto: 'Boleto'
    };
    return formas[forma] || forma;
  }

  /**
   * Formata status
   */
  formatStatus(status) {
    const statusMap = {
      pendente: 'Pendente',
      recebida: 'Recebida',
      cancelada: 'Cancelada'
    };
    return statusMap[status] || status;
  }

  /**
   * Atualiza lista de compras
   */
  updateCompras(compras) {
    this.compras = compras;
    this.updateTable();
  }

  /**
   * Atualiza lista de fornecedores
   */
  updateFornecedores(fornecedores) {
    this.fornecedores = fornecedores;
    const select = this.container.querySelector('#filtro-fornecedor');
    if (select) {
      const currentValue = select.value;
      select.innerHTML = `
        <option value="">Todos os fornecedores</option>
        ${fornecedores.map(f => `
          <option value="${f.id}">${f.nome}</option>
        `).join('')}
      `;
      select.value = currentValue;
    }
    this.updateTable();
  }

  /**
   * Destrói o componente
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
