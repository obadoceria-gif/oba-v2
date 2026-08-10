/**
 * InsumoInlineForm - Modal inline para cadastro rápido de insumo
 */

import { eventBus } from '../../../core/events/EventBus.js';

export class InsumoInlineForm {
  /**
   * @param {Object} options
   * @param {Function} options.onSave - Callback ao salvar insumo
   * @param {Function} options.onCancel - Callback ao cancelar
   */
  constructor({ onSave, onCancel }) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.eventBus = eventBus;
    this.modal = null;
  }

  /**
   * Abre o modal
   */
  open() {
    this.render();
    this.attachEventListeners();
    
    // Foca no primeiro campo
    setTimeout(() => {
      const nomeInput = this.modal.querySelector('#insumo-nome-input');
      nomeInput?.focus();
    }, 100);
  }

  /**
   * Renderiza o modal
   */
  render() {
    // Remove modal existente se houver
    this.close();

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'insumo-inline-modal';

    overlay.innerHTML = `
      <div class="modal-content modal-inline">
        <div class="modal-header">
          <h3>Cadastrar Novo Insumo</h3>
          <button type="button" class="modal-close" id="close-modal-btn">✕</button>
        </div>

        <form id="insumo-inline-form" class="modal-body">
          <div class="form-group">
            <label for="insumo-nome-input">Nome *</label>
            <input 
              type="text" 
              id="insumo-nome-input" 
              class="form-control"
              placeholder="Nome do insumo"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="insumo-marca-input">Marca *</label>
            <input 
              type="text" 
              id="insumo-marca-input" 
              class="form-control"
              placeholder="Marca do insumo"
              required
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="insumo-categoria-input">Categoria *</label>
            <select 
              id="insumo-categoria-input" 
              class="form-control"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="materia-prima">Matéria-Prima</option>
              <option value="embalagem">Embalagem</option>
              <option value="ingrediente">Ingrediente</option>
              <option value="descartavel">Descartável</option>
              <option value="limpeza">Limpeza</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="insumo-unidade-input">Unidade de Medida *</label>
            <select 
              id="insumo-unidade-input" 
              class="form-control"
              required
            >
              <option value="">Selecione</option>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="l">Litro (L)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="un">Unidade (un)</option>
              <option value="cx">Caixa (cx)</option>
              <option value="pct">Pacote (pct)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="insumo-qtde-embalagem-input">Qtde por Embalagem *</label>
            <input 
              type="number" 
              id="insumo-qtde-embalagem-input" 
              class="form-control"
              placeholder="Quantidade por embalagem"
              min="0.01"
              step="0.01"
              required
              autocomplete="off"
            />
            <small class="form-hint">Ex: 1kg, 500g, 12 unidades</small>
          </div>

          <div class="form-group">
            <label for="insumo-estoque-input">Estoque Mínimo</label>
            <input 
              type="number" 
              id="insumo-estoque-input" 
              class="form-control"
              placeholder="0"
              min="0"
              step="0.01"
              autocomplete="off"
            />
          </div>

          <div class="modal-footer">
            <button type="button" id="cancel-insumo-btn" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar Insumo
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modal = overlay;

    // Força reflow para garantir que a animação funcione
    overlay.offsetHeight;
    
    // Adiciona classe para animação
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
  }

  /**
   * Anexa event listeners
   */
  attachEventListeners() {
    if (!this.modal) return;

    const form = this.modal.querySelector('#insumo-inline-form');
    const closeBtn = this.modal.querySelector('#close-modal-btn');
    const cancelBtn = this.modal.querySelector('#cancel-insumo-btn');
    const overlay = this.modal;

    // Submit do formulário
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Botão fechar
    closeBtn?.addEventListener('click', () => this.handleClose());

    // Botão cancelar
    cancelBtn?.addEventListener('click', () => this.handleClose());

    // Clique fora do modal
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.handleClose();
      }
    });

    // ESC para fechar
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.handleClose();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    // Formata custo ao digitar
    const custoInput = this.modal.querySelector('#insumo-custo-input');
    custoInput?.addEventListener('blur', (e) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        e.target.value = value.toFixed(2);
      }
    });
  }

  /**
   * Manipula submissão do formulário
   */
  handleSubmit(e) {
    e.preventDefault();

    const nomeInput = this.modal.querySelector('#insumo-nome-input');
    const marcaInput = this.modal.querySelector('#insumo-marca-input');
    const categoriaInput = this.modal.querySelector('#insumo-categoria-input');
    const unidadeInput = this.modal.querySelector('#insumo-unidade-input');
    const qtdeEmbalagemInput = this.modal.querySelector('#insumo-qtde-embalagem-input');
    const estoqueInput = this.modal.querySelector('#insumo-estoque-input');

    const nome = nomeInput.value.trim();
    const marca = marcaInput.value.trim();
    const categoria = categoriaInput.value;
    const unidadeMedida = unidadeInput.value;
    const quantidadePorEmbalagem = parseFloat(qtdeEmbalagemInput.value);
    const estoqueMinimo = parseFloat(estoqueInput.value) || 0;

    // Validações
    if (!nome) {
      this.eventBus.emit('error', { message: 'Nome é obrigatório' });
      nomeInput.focus();
      return;
    }

    if (!marca) {
      this.eventBus.emit('error', { message: 'Marca é obrigatória' });
      marcaInput.focus();
      return;
    }

    if (!categoria) {
      this.eventBus.emit('error', { message: 'Categoria é obrigatória' });
      categoriaInput.focus();
      return;
    }

    if (!unidadeMedida) {
      this.eventBus.emit('error', { message: 'Unidade de medida é obrigatória' });
      unidadeInput.focus();
      return;
    }

    if (isNaN(quantidadePorEmbalagem) || quantidadePorEmbalagem <= 0) {
      this.eventBus.emit('error', { message: 'Quantidade por embalagem inválida' });
      qtdeEmbalagemInput.focus();
      return;
    }

    // Prepara dados
    const insumoData = {
      nome,
      marca,
      categoria,
      unidadeMedida,
      quantidadePorEmbalagem,
      estoqueMinimo,
      custoUnitario: 0 // Será calculado automaticamente
    };

    // Callback de salvamento
    if (this.onSave) {
      this.onSave(insumoData);
    }

    // Fecha modal
    this.close();
  }

  /**
   * Manipula fechamento
   */
  handleClose() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.close();
  }

  /**
   * Fecha o modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('active');
      
      setTimeout(() => {
        this.modal.remove();
        this.modal = null;
      }, 300);
    }

    // Remove listener do ESC
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}
