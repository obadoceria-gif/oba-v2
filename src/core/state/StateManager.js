/**
 * StateManager - Gerenciador centralizado de estado da aplicação
 * 
 * Responsabilidades:
 * - Manter estado imutável da aplicação
 * - Notificar subscribers sobre mudanças
 * - Persistir e restaurar estado usando StorageAdapter
 * - Logging de mudanças para debug
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.9, 10.10, 10.11
 */

export class StateManager {
  /**
   * @param {StorageAdapter} storage - Adapter para persistência
   * @param {Object} initialState - Estado inicial da aplicação
   */
  constructor(storage, initialState = {}) {
    this.storage = storage;
    this.state = this._deepFreeze({ ...initialState });
    this.subscribers = new Map(); // Map<string, Set<Function>>
    this.nextSubscriberId = 1;
    this.enableLogging = true;
  }

  /**
   * Obtém o estado atual (ou uma fatia específica)
   * @param {string} [slice] - Nome da fatia (opcional)
   * @returns {Object} Estado atual ou fatia
   */
  getState(slice = null) {
    if (slice) {
      // Retornar array vazio se slice não existir (em vez de undefined)
      return this.state[slice] || [];
    }
    return this.state;
  }

  /**
   * Atualiza o estado (ou uma fatia específica)
   * @param {string|Object} sliceOrState - Nome da fatia ou objeto de estado completo
   * @param {any} [updates] - Atualizações (se primeiro param for string)
   * @returns {Object} Novo estado
   */
  setState(sliceOrState, updates = null) {
    let newState;

    if (typeof sliceOrState === 'string') {
      // Atualizar fatia específica
      const slice = sliceOrState;
      const oldSliceState = this.state[slice];
      const newSliceState = updates; // Substituir completamente a fatia
      
      newState = {
        ...this.state,
        [slice]: newSliceState
      };

      if (this.enableLogging) {
        console.log(`[StateManager] Atualizando fatia "${slice}":`, {
          antes: oldSliceState,
          depois: newSliceState,
          mudancas: updates
        });
      }
    } else {
      // Atualizar estado completo
      newState = { ...this.state, ...sliceOrState };

      if (this.enableLogging) {
        console.log('[StateManager] Atualizando estado completo:', {
          antes: this.state,
          depois: newState,
          mudancas: sliceOrState
        });
      }
    }

    // Congelar novo estado para garantir imutabilidade
    this.state = this._deepFreeze(newState);

    // Notificar subscribers
    if (typeof sliceOrState === 'string') {
      this._notifySubscribers(sliceOrState);
    } else {
      // Notificar todos os subscribers de todas as fatias
      for (const slice of Object.keys(sliceOrState)) {
        this._notifySubscribers(slice);
      }
    }

    return this.state;
  }

  /**
   * Inscreve um callback para mudanças de estado
   * @param {string} slice - Nome da fatia a observar
   * @param {Function} callback - Função a ser chamada quando estado mudar
   * @returns {Function} Função para cancelar inscrição
   */
  subscribe(slice, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback deve ser uma função');
    }

    // Criar Set de subscribers para esta fatia se não existir
    if (!this.subscribers.has(slice)) {
      this.subscribers.set(slice, new Map());
    }

    const subscriberId = this.nextSubscriberId++;
    this.subscribers.get(slice).set(subscriberId, callback);

    if (this.enableLogging) {
      console.log(`[StateManager] Novo subscriber para "${slice}" (ID: ${subscriberId})`);
    }

    // Fornecer estado atual imediatamente (Requirement 10.6)
    try {
      callback(this.state[slice]);
    } catch (error) {
      console.error(`[StateManager] Erro no subscriber ${subscriberId} de "${slice}" (chamada inicial):`, error);
    }

    // Retornar função de unsubscribe
    return () => this.unsubscribe(slice, subscriberId);
  }

  /**
   * Cancela inscrição de um callback
   * @param {string} slice - Nome da fatia
   * @param {number} subscriberId - ID do subscriber
   */
  unsubscribe(slice, subscriberId) {
    if (this.subscribers.has(slice)) {
      const sliceSubscribers = this.subscribers.get(slice);
      sliceSubscribers.delete(subscriberId);

      if (this.enableLogging) {
        console.log(`[StateManager] Subscriber removido de "${slice}" (ID: ${subscriberId})`);
      }

      // Limpar Map se não houver mais subscribers
      if (sliceSubscribers.size === 0) {
        this.subscribers.delete(slice);
      }
    }
  }

  /**
   * Persiste o estado atual no storage
   * @returns {Promise<void>}
   */
  async persist() {
    try {
      // Limpar stores antes de salvar
      const slices = ['insumos', 'compras', 'estoque', 'movimentacoes', 'fichas', 'clientes', 'pedidos', 'fornecedores'];
      for (const slice of slices) {
        await this.storage.clear(slice);
      }

      // Salvar cada fatia em seu respectivo store
      const promises = [];
      
      for (const [slice, data] of Object.entries(this.state)) {
        if (Array.isArray(data)) {
          // Se for array, salvar cada item
          for (const item of data) {
            if (item && typeof item === 'object') {
              // Garantir que o item tem um ID para o storage
              // Estoque usa insumoId como chave, outros usam id
              const itemToSave = { ...item };
              if (!itemToSave.id) {
                // Adicionar ID temporário para storage, marcando que foi gerado
                itemToSave.id = itemToSave.insumoId || itemToSave.compraId || itemToSave.clienteId || crypto.randomUUID();
                itemToSave._generatedId = true; // Flag para remover ao restaurar
              }
              promises.push(this.storage.save(slice, itemToSave));
            }
          }
        } else if (typeof data === 'object' && data !== null) {
          // Se for objeto, verificar se tem estrutura de mapa (id -> item)
          for (const [id, item] of Object.entries(data)) {
            if (typeof item === 'object' && item !== null) {
              promises.push(this.storage.save(slice, { ...item, id }));
            }
          }
        }
      }

      await Promise.all(promises);

      if (this.enableLogging) {
        console.log('[StateManager] Estado persistido com sucesso');
      }
    } catch (error) {
      console.error('[StateManager] Erro ao persistir estado:', error);
      throw error;
    }
  }

  /**
   * Restaura o estado do storage
   * @returns {Promise<Object>} Estado restaurado
   */
  async restore() {
    try {
      const restoredState = {};

      // Restaurar cada fatia de seu respectivo store
      const slices = ['insumos', 'compras', 'estoque', 'movimentacoes', 'fichas', 'clientes', 'pedidos', 'fornecedores'];
      
      for (const slice of slices) {
        const items = await this.storage.getAll(slice);
        // Remover campos gerados automaticamente durante persist
        restoredState[slice] = items.map(item => {
          if (item._generatedId) {
            const { id, _generatedId, ...rest } = item;
            return rest;
          }
          return item;
        });
      }

      this.state = this._deepFreeze(restoredState);

      if (this.enableLogging) {
        console.log('[StateManager] Estado restaurado com sucesso:', restoredState);
      }

      // Notificar todos os subscribers
      for (const slice of slices) {
        this._notifySubscribers(slice);
      }

      return this.state;
    } catch (error) {
      console.error('[StateManager] Erro ao restaurar estado:', error);
      throw error;
    }
  }

  /**
   * Limpa todo o estado
   */
  clear() {
    const emptyState = {};
    const slices = Object.keys(this.state);

    for (const slice of slices) {
      emptyState[slice] = [];
    }

    this.state = this._deepFreeze(emptyState);

    if (this.enableLogging) {
      console.log('[StateManager] Estado limpo');
    }

    // Notificar todos os subscribers
    for (const slice of slices) {
      this._notifySubscribers(slice);
    }
  }

  /**
   * Notifica subscribers de uma fatia específica
   * @private
   * @param {string} slice - Nome da fatia
   */
  _notifySubscribers(slice) {
    if (this.subscribers.has(slice)) {
      const sliceState = this.state[slice];
      const callbacks = this.subscribers.get(slice);

      for (const [subscriberId, callback] of callbacks) {
        try {
          callback(sliceState);
        } catch (error) {
          console.error(`[StateManager] Erro no subscriber ${subscriberId} de "${slice}":`, error);
        }
      }
    }
  }

  /**
   * Congela objeto recursivamente para garantir imutabilidade
   * @private
   * @param {Object} obj - Objeto a congelar
   * @returns {Object} Objeto congelado
   */
  _deepFreeze(obj) {
    // Congelar propriedades antes de congelar o objeto
    Object.keys(obj).forEach(prop => {
      if (obj[prop] !== null && typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
        this._deepFreeze(obj[prop]);
      }
    });

    return Object.freeze(obj);
  }

  /**
   * Habilita ou desabilita logging
   * @param {boolean} enabled - Se logging deve estar habilitado
   */
  setLogging(enabled) {
    this.enableLogging = enabled;
  }
}

export default StateManager;
