/**
 * CompraDetails - Modal de detalhes da compra
 */

import { eventBus } from '../../../core/events/EventBus.js';
import { formatCurrency } from '../../../core/utils/currency.js';
import { formatDate } from '../../../core/utils/date.js';

export class CompraDetails {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Container do modal
   * @param {Object} options.compra - Dados da compra
   * @param {Object} options.fornecedor - Dados do fornecedor
   * @param {Array} options.insumos - Lista de insumos
   */
  constructor({ container, compra, fornecedor, insumos = [] }) {
    if (!container) {
      throw new Error('Container é obrigatório');
    }

    this.container = container;
    this.compra = compra;
    this.fornecedor = fornecedor;
    this.insumos = insumos;
    this.eventBus = eventBus;

    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza o modal
   */
  render() {
    if (!this.compra) {
      this.container.innerHTML = '<p class="error-message">Compra não encontrada</p>';
      return;
    }

    const statusClass = `status-${this.compra.status}`;

    this.container.innerHTML = `
      <div class="modal-overlay" id="compra-details-overlay">
        <div class="modal-content compra-details-modal">
          <div class="modal-header">
            <h2>Detalhes da Compra</h2>
            <button type="button" class="btn-close" id="close-details-btn">✕</button>
          </div>

          <div class="modal-body">
            <div class="details-section">
              <h3>Informações Gerais</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Data:</span>
                  <span class="detail-value">${formatDate(this.compra.data)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">
                    <span class="status-badge ${statusClass}">
                      ${this.formatStatus(this.compra.status)}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Fornecedor:</span>
                  <span class="detail-value">${this.fornecedor?.nome || 'Desconhecido'}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Forma de Pagamento:</span>
                  <span class="detail-value">${this.formatFormaPagamento(this.compra.formaPagamento)}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Insumos</h3>
              <table class="details-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Quantidade</th>
                    <th>Custo Unitário</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.compra.insumos.map(item => {
                    const insumo = this.insumos.find(i => i.id === item.insumoId);
                    const subtotal = item.quantidade * item.custoUnitario;
                    return `
                      <tr>
                        <td>${insumo?.nome || 'Desconhecido'}</td>
                        <td>${item.quantidade}</td>
                        <td>${formatCurrency(item.custoUnitario)}</td>
                        <td>${formatCurrency(subtotal)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right"><strong>Total:</strong></td>
                    <td><strong>${formatCurrency(this.compra.valorTotal)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${this.compra.observacoes ? `
              <div class="details-section">
                <h3>Observações</h3>
                <p class="observacoes-text">${this.compra.observacoes}</p>
              </div>
            ` : ''}

            ${this.compra.dataRecebimento ? `
              <div class="details-section">
                <h3>Recebimento</h3>
                <div class="detail-item">
                  <span class="detail-label">Data de Recebimento:</span>
                  <span class="detail-value">${formatDate(this.compra.dataRecebimento)}</span>
                </div>
              </div>
            ` : ''}

            ${this.compra.motivoCancelamento ? `
              <div class="details-section">
                <h3>Cancelamento</h3>
                <div class="detail-item">
                  <span class="detail-label">Motivo:</span>
                  <span class="detail-value">${this.compra.motivoCancelamento}</span>
                </div>
                ${this.compra.dataCancelamento ? `
                  <div class="detail-item">
                    <span class="detail-label">Data:</span>
                    <span class="detail-value">${formatDate(this.compra.dataCancelamento)}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <div class="modal-footer">
            ${this.compra.status === 'pendente' ? `
              <button type="button" id="receive-compra-btn" class="btn-primary">
                Marcar como Recebida
              </button>
              <button type="button" id="cancel-compra-btn" class="btn-danger">
                Cancelar Compra
              </button>
            ` : ''}
            <button type="button" id="close-modal-btn" class="btn-secondary">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    const overlay = this.container.querySelector('#compra-details-overlay');
    const closeBtn = this.container.querySelector('#close-details-btn');
    const closeModalBtn = this.container.querySelector('#close-modal-btn');
    const receiveBtn = this.container.querySelector('#receive-compra-btn');
    const cancelBtn = this.container.querySelector('#cancel-compra-btn');

    // Fechar modal
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    closeBtn?.addEventListener('click', () => this.close());
    closeModalBtn?.addEventListener('click', () => this.close());

    // Ações
    receiveBtn?.addEventListener('click', () => this.handleReceive());
    cancelBtn?.addEventListener('click', () => this.handleCancel());
  }

  /**
   * Manipula recebimento
   */
  handleReceive() {
    if (confirm('Confirma o recebimento desta compra?')) {
      this.eventBus.emit('compra:receive', { compraId: this.compra.id });
      this.close();
    }
  }

  /**
   * Manipula cancelamento
   */
  handleCancel() {
    const motivo = prompt('Informe o motivo do cancelamento:');
    if (motivo && motivo.trim()) {
      this.eventBus.emit('compra:cancel', { 
        compraId: this.compra.id,
        motivo: motivo.trim()
      });
      this.close();
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
   * Fecha o modal
   */
  close() {
    this.eventBus.emit('compra:details:close');
    this.destroy();
  }

  /**
   * Destrói o componente
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
