/**
 * CompraForm - Formulário de criação de compras
 */

import { eventBus } from '../../../core/events/EventBus.js';
import { formatCurrency } from '../../../core/utils/currency.js';
import { FornecedorInlineForm } from './FornecedorInlineForm.js';
import { InsumoInlineForm } from './InsumoInlineForm.js';

export class CompraForm {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Container do formulário
   * @param {Array} options.fornecedores - Lista de fornecedores
   * @param {Array} options.insumos - Lista de insumos
   */
  constructor({ container, fornecedores = [], insumos = [] }) {
    if (!container) {
      throw new Error('Container é obrigatório');
    }

    this.container = container;
    this.fornecedores = fornecedores;
    this.insumos = insumos;
    this.insumosCompra = [];
    this.eventBus = eventBus;

    this.render();
    this.attachEventListeners();
  }

  /**
   * Renderiza o formulário
   */
  render() {
    this.container.innerHTML = `
      <div class="compra-form">
        <form id="compra-form" class="form">
          <div class="form-section">
            <h3>Informações da Compra</h3>
            
            <div class="fornecedor-field-group">
              <div class="form-group">
                <label for="fornecedor-select">Fornecedor *</label>
                <select id="fornecedor-select" class="form-control" required>
                  <option value="">Selecione um fornecedor</option>
                  ${this.fornecedores.map(f => `
                    <option value="${f.id}">${f.nome}</option>
                  `).join('')}
                </select>
              </div>
              <button type="button" id="new-fornecedor-btn" class="btn-new-fornecedor">
                + Novo Fornecedor
              </button>
            </div>

            <div class="form-group">
              <label for="forma-pagamento-select">Forma de Pagamento *</label>
              <select id="forma-pagamento-select" class="form-control" required>
                <option value="">Selecione</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            <div class="form-group">
              <label for="observacoes-input">Observações</label>
              <textarea 
                id="observacoes-input" 
                class="form-control" 
                rows="3"
                placeholder="Observações sobre a compra (opcional)"
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Adicionar Insumos</h3>
            
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="insumo-select">Insumo</label>
                <div class="insumo-field-group">
                  <select id="insumo-select" class="form-control">
                    <option value="">Selecione um insumo</option>
                    ${this.insumos.map(i => `
                      <option value="${i.id}" data-custo="${i.custoUnitario}">
                        ${i.nome} - ${formatCurrency(i.custoUnitario)}
                      </option>
                    `).join('')}
                  </select>
                  <button type="button" id="new-insumo-btn" class="btn-new-insumo" title="Cadastrar novo insumo">
                    +
                  </button>
                </div>
              </div>

              <div class="form-group flex-1">
                <label for="quantidade-input">Quantidade</label>
                <input 
                  type="number" 
                  id="quantidade-input" 
                  class="form-control"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div class="form-group flex-0">
                <label>&nbsp;</label>
                <button type="button" id="add-insumo-btn" class="btn-primary">
                  Adicionar
                </button>
              </div>
            </div>

            <div id="insumos-list" class="insumos-list">
              ${this.renderInsumosList()}
            </div>
          </div>

          <div class="form-section">
            <h3>Resumo</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total de Insumos:</span>
                <span id="total-insumos" class="summary-value">0</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Valor Total:</span>
                <span id="valor-total" class="summary-value">R$ 0,00</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Criar Compra</button>
            <button type="button" id="cancel-btn" class="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    `;

    this.updateSummary();
  }

  /**
   * Renderiza lista de insumos adicionados
   */
  renderInsumosList() {
    if (this.insumosCompra.length === 0) {
      return '<p class="empty-message">Nenhum insumo adicionado</p>';
    }

    return `
      <table class="insumos-table">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Quantidade</th>
            <th>Custo Unitário</th>
            <th>Subtotal</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.insumosCompra.map(item => `
            <tr>
              <td>${item.nome}</td>
              <td>${item.quantidade}</td>
              <td>${formatCurrency(item.custoUnitario)}</td>
              <td>${formatCurrency(item.subtotal)}</td>
              <td>
                <button 
                  type="button" 
                  class="btn-icon btn-remove" 
                  data-insumo-id="${item.insumoId}"
                  title="Remover"
                >
                  ✕
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    // Event delegation no container principal - mais robusto
    this.container.addEventListener('click', (e) => {
      const target = e.target;
      
      // Botão Novo Fornecedor
      if (target.id === 'new-fornecedor-btn' || target.closest('#new-fornecedor-btn')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Clique capturado: Novo Fornecedor');
        this.handleNewFornecedor();
        return;
      }
      
      // Botão Novo Insumo
      if (target.id === 'new-insumo-btn' || target.closest('#new-insumo-btn')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Clique capturado: Novo Insumo');
        this.handleNewInsumo();
        return;
      }
      
      // Botão Adicionar Insumo
      if (target.id === 'add-insumo-btn' || target.closest('#add-insumo-btn')) {
        e.preventDefault();
        this.handleAddInsumo();
        return;
      }
      
      // Botão Cancelar
      if (target.id === 'cancel-btn' || target.closest('#cancel-btn')) {
        e.preventDefault();
        this.handleCancel();
        return;
      }
      
      // Botões de remover insumo
      if (target.classList.contains('btn-remove') || target.closest('.btn-remove')) {
        e.preventDefault();
        const btn = target.classList.contains('btn-remove') ? target : target.closest('.btn-remove');
        const insumoId = btn?.dataset.insumoId;
        if (insumoId) {
          this.handleRemoveInsumo(insumoId);
        }
        return;
      }
    });
    
    // Submit do formulário
    const form = this.container.querySelector('#compra-form');
    form?.addEventListener('submit', (e) => this.handleSubmit(e));
    
    console.log('✅ Event delegation configurado no container');
  }

  /**
   * Manipula adição de insumo
   */
  handleAddInsumo() {
    const insumoSelect = this.container.querySelector('#insumo-select');
    const quantidadeInput = this.container.querySelector('#quantidade-input');

    const insumoId = insumoSelect.value;
    const quantidade = parseFloat(quantidadeInput.value);

    // Validações
    if (!insumoId) {
      this.eventBus.emit('error', { message: 'Selecione um insumo' });
      return;
    }

    if (!quantidade || quantidade <= 0) {
      this.eventBus.emit('error', { message: 'Informe uma quantidade válida' });
      return;
    }

    // Verifica se já foi adicionado
    if (this.insumosCompra.find(i => i.insumoId === insumoId)) {
      this.eventBus.emit('error', { message: 'Insumo já adicionado' });
      return;
    }

    // Busca dados do insumo
    const insumo = this.insumos.find(i => i.id === insumoId);
    if (!insumo) {
      this.eventBus.emit('error', { message: 'Insumo não encontrado' });
      return;
    }

    // Adiciona à lista
    const subtotal = quantidade * insumo.custoUnitario;
    this.insumosCompra.push({
      insumoId: insumo.id,
      nome: insumo.nome,
      quantidade,
      custoUnitario: insumo.custoUnitario,
      subtotal
    });

    // Atualiza UI
    this.updateInsumosList();
    this.updateSummary();

    // Limpa campos
    insumoSelect.value = '';
    quantidadeInput.value = '';
  }

  /**
   * Manipula remoção de insumo
   */
  handleRemoveInsumo(insumoId) {
    this.insumosCompra = this.insumosCompra.filter(i => i.insumoId !== insumoId);
    this.updateInsumosList();
    this.updateSummary();
  }

  /**
   * Atualiza lista de insumos na UI
   */
  updateInsumosList() {
    const insumosList = this.container.querySelector('#insumos-list');
    if (insumosList) {
      insumosList.innerHTML = this.renderInsumosList();
    }
  }

  /**
   * Atualiza resumo
   */
  updateSummary() {
    const totalInsumos = this.container.querySelector('#total-insumos');
    const valorTotal = this.container.querySelector('#valor-total');

    if (totalInsumos) {
      totalInsumos.textContent = this.insumosCompra.length;
    }

    if (valorTotal) {
      const total = this.insumosCompra.reduce((sum, item) => sum + item.subtotal, 0);
      valorTotal.textContent = formatCurrency(total);
    }
  }

  /**
   * Manipula submissão do formulário
   */
  handleSubmit(e) {
    e.preventDefault();

    const fornecedorSelect = this.container.querySelector('#fornecedor-select');
    const formaPagamentoSelect = this.container.querySelector('#forma-pagamento-select');
    const observacoesInput = this.container.querySelector('#observacoes-input');

    const fornecedorId = fornecedorSelect.value;
    const formaPagamento = formaPagamentoSelect.value;
    const observacoes = observacoesInput.value.trim();

    // Validações
    if (!fornecedorId) {
      this.eventBus.emit('error', { message: 'Selecione um fornecedor' });
      return;
    }

    if (this.insumosCompra.length === 0) {
      this.eventBus.emit('error', { message: 'Adicione pelo menos um insumo' });
      return;
    }

    if (!formaPagamento) {
      this.eventBus.emit('error', { message: 'Selecione a forma de pagamento' });
      return;
    }

    // Prepara dados
    const compraData = {
      fornecedorId,
      formaPagamento,
      observacoes: observacoes || undefined,
      insumos: this.insumosCompra.map(item => ({
        insumoId: item.insumoId,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario
      }))
    };

    // Emite evento
    this.eventBus.emit('compra:create', compraData);
  }

  /**
   * Manipula cancelamento
   */
  handleCancel() {
    // Reseta formulário
    this.insumosCompra = [];
    this.updateInsumosList();
    this.updateSummary();

    // Emite evento
    this.eventBus.emit('compra:cancel');
  }

  /**
   * Atualiza lista de fornecedores
   */
  updateFornecedores(fornecedores) {
    this.fornecedores = fornecedores;
    const select = this.container.querySelector('#fornecedor-select');
    if (select) {
      const currentValue = select.value;
      select.innerHTML = `
        <option value="">Selecione um fornecedor</option>
        ${fornecedores.map(f => `
          <option value="${f.id}">${f.nome}</option>
        `).join('')}
      `;
      select.value = currentValue;
    }
  }

  /**
   * Atualiza lista de insumos
   */
  updateInsumos(insumos) {
    this.insumos = insumos;
    const select = this.container.querySelector('#insumo-select');
    if (select) {
      const currentValue = select.value;
      select.innerHTML = `
        <option value="">Selecione um insumo</option>
        ${insumos.map(i => `
          <option value="${i.id}" data-custo="${i.custoUnitario}">
            ${i.nome} - ${formatCurrency(i.custoUnitario)}
          </option>
        `).join('')}
      `;
      select.value = currentValue;
    }
  }

  /**
   * Manipula abertura do modal de novo fornecedor
   */
  handleNewFornecedor() {
    try {
      console.log('📝 Criando modal de Fornecedor...');
      const modal = new FornecedorInlineForm({
        onSave: (fornecedorData) => {
          console.log('💾 Salvando fornecedor:', fornecedorData);
          // Emite evento para criar fornecedor
          this.eventBus.emit('fornecedor:create', fornecedorData);
        },
        onCancel: () => {
          console.log('❌ Cancelado cadastro de fornecedor');
        }
      });

      console.log('✅ Modal criado, abrindo...');
      modal.open();
      console.log('✅ Modal.open() chamado');
    } catch (error) {
      console.error('❌ Erro ao abrir modal de Fornecedor:', error);
    }
  }

  /**
   * Manipula abertura do modal de novo insumo
   */
  handleNewInsumo() {
    try {
      console.log('📝 Criando modal de Insumo...');
      const modal = new InsumoInlineForm({
        onSave: (insumoData) => {
          console.log('💾 Salvando insumo:', insumoData);
          // Emite evento para criar insumo
          this.eventBus.emit('insumo:create', insumoData);
        },
        onCancel: () => {
          console.log('❌ Cancelado cadastro de insumo');
        }
      });

      console.log('✅ Modal criado, abrindo...');
      modal.open();
      console.log('✅ Modal.open() chamado');
    } catch (error) {
      console.error('❌ Erro ao abrir modal de Insumo:', error);
    }
  }

  /**
   * Destrói o componente
   */
  destroy() {
    this.container.innerHTML = '';
  }
}
