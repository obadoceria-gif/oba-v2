/**
 * EventBus - Sistema de eventos pub/sub para comunicação entre módulos
 * 
 * Características:
 * - Notificação assíncrona de subscribers
 * - Isolamento de erros entre handlers
 * - Logging de eventos
 * - Suporte a múltiplos subscribers por evento
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.9, 11.10, 11.11
 */

export class EventBus {
  constructor() {
    // Map<eventType, Set<handler>>
    this.subscribers = new Map();
    
    // Histórico de eventos para debugging (últimos 100)
    this.eventHistory = [];
    this.maxHistorySize = 100;
    
    // Flag para logging
    this.loggingEnabled = true;
  }

  /**
   * Publica um evento para todos os subscribers
   * @param {string} eventType - Tipo do evento
   * @param {*} data - Dados do evento
   * @returns {Promise<void>}
   * 
   * Requirements: 11.1, 11.2, 11.9
   */
  async publish(eventType, data = undefined) {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }

    // Log do evento
    if (this.loggingEnabled) {
      this._logEvent(eventType, data);
    }

    // Adicionar ao histórico
    this._addToHistory(eventType, data);

    // Obter subscribers para este tipo de evento
    const handlers = this.subscribers.get(eventType);
    
    if (!handlers || handlers.size === 0) {
      return; // Nenhum subscriber, retorna silenciosamente
    }

    // Notificar todos os subscribers de forma assíncrona
    // Requirement 11.3: Notificação assíncrona
    const promises = Array.from(handlers).map(handler => 
      this._notifyHandler(handler, eventType, data)
    );

    // Aguardar todas as notificações (mas não propagar erros)
    await Promise.allSettled(promises);
  }

  /**
   * Notifica um handler específico, isolando erros
   * @private
   * @param {Function} handler - Handler a ser notificado
   * @param {string} eventType - Tipo do evento
   * @param {*} data - Dados do evento
   * @returns {Promise<void>}
   * 
   * Requirements: 11.10 (error isolation)
   */
  async _notifyHandler(handler, eventType, data) {
    try {
      // Executar handler de forma assíncrona
      await Promise.resolve(handler(data, eventType));
    } catch (error) {
      // Requirement 11.10: Isolar erros entre subscribers
      console.error(`[EventBus] Error in handler for event "${eventType}":`, error);
      
      // Não propagar o erro para não afetar outros handlers
      // Apenas logar para debugging
    }
  }

  /**
   * Inscreve um handler para um tipo de evento
   * @param {string} eventType - Tipo do evento
   * @param {Function} handler - Função a ser chamada quando o evento ocorrer
   * @returns {Function} Função para cancelar a inscrição
   * 
   * Requirements: 11.2, 11.4
   */
  subscribe(eventType, handler) {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    // Criar Set de handlers se não existir
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    // Adicionar handler ao Set
    this.subscribers.get(eventType).add(handler);

    // Retornar função de unsubscribe
    // Requirement 11.4: Suporte a unsubscribe
    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * Remove inscrição de um handler
   * @param {string} eventType - Tipo do evento
   * @param {Function} handler - Handler a ser removido
   * @returns {boolean} true se removido, false se não encontrado
   * 
   * Requirements: 11.4
   */
  unsubscribe(eventType, handler) {
    const handlers = this.subscribers.get(eventType);
    
    if (!handlers) {
      return false;
    }

    const removed = handlers.delete(handler);

    // Limpar Set vazio
    if (handlers.size === 0) {
      this.subscribers.delete(eventType);
    }

    return removed;
  }

  /**
   * Alias para unsubscribe (compatibilidade)
   * @param {string} eventType - Tipo do evento
   * @param {Function} handler - Handler a ser removido
   * @returns {boolean} true se removido, false se não encontrado
   */
  off(eventType, handler) {
    return this.unsubscribe(eventType, handler);
  }

  /**
   * Alias para subscribe (compatibilidade)
   * @param {string} eventType - Tipo do evento
   * @param {Function} handler - Função a ser chamada quando o evento ocorrer
   * @returns {Function} Função para cancelar a inscrição
   */
  on(eventType, handler) {
    return this.subscribe(eventType, handler);
  }

  /**
   * Alias para publish (compatibilidade)
   * @param {string} eventType - Tipo do evento
   * @param {*} data - Dados do evento
   * @returns {Promise<void>}
   */
  emit(eventType, data) {
    return this.publish(eventType, data);
  }

  /**
   * Remove todos os subscribers de um tipo de evento
   * @param {string} eventType - Tipo do evento
   * @returns {boolean} true se removido, false se não encontrado
   */
  unsubscribeAll(eventType) {
    return this.subscribers.delete(eventType);
  }

  /**
   * Remove todos os subscribers de todos os eventos
   * 
   * Requirements: 11.11
   */
  clear() {
    this.subscribers.clear();
    this.eventHistory = [];
  }

  /**
   * Retorna número de subscribers para um evento
   * @param {string} eventType - Tipo do evento
   * @returns {number}
   */
  getSubscriberCount(eventType) {
    const handlers = this.subscribers.get(eventType);
    return handlers ? handlers.size : 0;
  }

  /**
   * Retorna todos os tipos de eventos com subscribers
   * @returns {string[]}
   */
  getEventTypes() {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Retorna histórico de eventos
   * @param {number} limit - Número máximo de eventos a retornar
   * @returns {Array}
   */
  getHistory(limit = 10) {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Habilita ou desabilita logging
   * @param {boolean} enabled
   */
  setLogging(enabled) {
    this.loggingEnabled = enabled;
  }

  /**
   * Loga evento no console
   * @private
   * @param {string} eventType
   * @param {*} data
   * 
   * Requirements: 11.9 (logging)
   */
  _logEvent(eventType, data) {
    const timestamp = new Date().toISOString();
    console.log(`[EventBus] ${timestamp} - Event: ${eventType}`, data);
  }

  /**
   * Adiciona evento ao histórico
   * @private
   * @param {string} eventType
   * @param {*} data
   */
  _addToHistory(eventType, data) {
    // CRITICAL FIX: Detectar recursão infinita
    // Se o mesmo evento foi emitido muito recentemente (< 100ms), pode ser recursão
    const now = Date.now();
    const recentEvents = this.eventHistory
      .filter(e => e.eventType === eventType && (now - new Date(e.timestamp).getTime()) < 100);
    
    if (recentEvents.length > 10) {
      console.warn(`[EventBus] ⚠️ Possível recursão infinita detectada para evento "${eventType}". Ignorando.`);
      return;
    }

    this.eventHistory.push({
      eventType,
      data,
      timestamp: new Date().toISOString()
    });

    // Manter apenas os últimos N eventos
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

// Exportar instância singleton
export const eventBus = new EventBus();
