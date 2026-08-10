/**
 * FornecedorList
 * 
 * Componente para exibir lista de fornecedores em tabela.
 */

export class FornecedorList {
  /**
   * @param {HTMLElement} container - Container do componente
   * @param {Fornecedor[]} fornecedores - Lista de fornecedores
   */
  constructor(container, fornecedores = []) {
    this.container = container;
    this.fornecedores = fornecedores;
    this.listeners = {};
  }

  /**
   * Renderiza o componente
   */
  render() {
    if (!this.container) {
      console.error('[FornecedorList] Container não encontrado');
      return;
    }

    this.container.innerHTML = `
      <div class="fornecedor-list">
        ${this.fornecedores.length === 0 ? this.renderEmpty() : this.renderTable()}
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Renderiza mensagem de lista vazia
   * @returns {string}
   */
  renderEmpty() {
    return `
      <div class="fornecedor-list-empty">
        <p>📦 Nenhum fornecedor encontrado</p>
        <p class="text-muted">Clique em "Novo Fornecedor" para adicionar</p>
      </div>
    `;
  }

  /**
   * Renderiza tabela de fornecedores
   * @returns {string}
   */
  renderTable() {
    return `
      <div class="table-responsive">
        <table class="fornecedor-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${this.fornecedores.map(f => this.renderRow(f)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Renderiza uma linha da tabela
   * @param {Fornecedor} fornecedor
   * @returns {string}
   */
  renderRow(fornecedor) {
    const statusBadge = fornecedor.ativo 
      ? '<span class="badge badge-success">Ativo</span>'
      : '<span class="badge badge-secondary">Inativo</span>';

    return `
      <tr data-fornecedor-id="${fornecedor.id}">
        <td class="fornecedor-nome">${this.escapeHtml(fornecedor.nome)}</td>
        <td>${this.formatTelefone(fornecedor.telefone)}</td>
        <td>${this.escapeHtml(fornecedor.email || '-')}</td>
        <td>${statusBadge}</td>
        <td class="text-center">
          <div class="btn-group">
            <button 
              type="button"
              class="btn btn-sm btn-info btn-view" 
              data-fornecedor-id="${fornecedor.id}"
              title="Ver detalhes"
            >
              👁️
            </button>
            <button 
              type="button"
              class="btn btn-sm btn-primary btn-edit" 
              data-fornecedor-id="${fornecedor.id}"
              title="Editar"
            >
              ✏️
            </button>
            ${fornecedor.ativo ? `
              <button 
                type="button"
                class="btn btn-sm btn-warning btn-deactivate" 
                data-fornecedor-id="${fornecedor.id}"
                title="Desativar"
              >
                🚫
              </button>
            ` : `
              <button 
                type="button"
                class="btn btn-sm btn-success btn-activate" 
                data-fornecedor-id="${fornecedor.id}"
                title="Ativar"
              >
                ✅
              </button>
            `}
            <button 
              type="button"
              class="btn btn-sm btn-danger btn-delete" 
              data-fornecedor-id="${fornecedor.id}"
              title="Excluir"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    if (!this.container) return;

    // Ver detalhes
    this.container.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.fornecedorId;
        this.emit('fornecedor:view', { id });
      });
    });

    // Editar
    this.container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.fornecedorId;
        this.emit('fornecedor:edit', { id });
      });
    });

    // Desativar
    this.container.querySelectorAll('.btn-deactivate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.fornecedorId;
        this.emit('fornecedor:desativar', { id });
      });
    });

    // Ativar
    this.container.querySelectorAll('.btn-activate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.fornecedorId;
        this.emit('fornecedor:ativar', { id });
      });
    });

    // Excluir
    this.container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.fornecedorId;
        this.emit('fornecedor:delete', { id });
      });
    });
  }

  /**
   * Atualiza a lista de fornecedores
   * @param {Fornecedor[]} fornecedores
   */
  update(fornecedores) {
    this.fornecedores = fornecedores;
    this.render();
  }

  /**
   * Formata telefone
   * @param {string} telefone
   * @returns {string}
   */
  formatTelefone(telefone) {
    if (!telefone) return '-';
    
    // Remove caracteres não numéricos
    const numbers = telefone.replace(/\D/g, '');
    
    // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.substr(0, 2)}) ${numbers.substr(2, 5)}-${numbers.substr(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.substr(0, 2)}) ${numbers.substr(2, 4)}-${numbers.substr(6)}`;
    }
    
    return telefone;
  }

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Registra listener de evento
   * @param {string} eventName
   * @param {Function} handler
   */
  on(eventName, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  /**
   * Emite evento
   * @param {string} eventName
   * @param {*} data
   */
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(handler => handler(data));
    }
  }

  /**
   * Destrói o componente
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.listeners = {};
  }
}
