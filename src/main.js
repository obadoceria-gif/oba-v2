/**
 * OBA Doceria V2 - Sistema de Gestão Modular
 * Entry point da aplicação
 */

import IndexedDBAdapter from './core/storage/IndexedDBAdapter.js';
import { StateManager } from './core/state/StateManager.js';
import { EventBus } from './core/events/EventBus.js';
import { InsumosRepository } from './modules/insumos/repositories/InsumosRepository.js';
import { InsumosService } from './modules/insumos/services/InsumosService.js';
import { InsumosController } from './modules/insumos/controllers/InsumosController.js';
import { InsumosView } from './modules/insumos/views/InsumosView.js';

console.log('🍰 OBA Doceria V2 - Iniciando...');

async function initApp() {
  try {
    // 1. Inicializar Storage
    const storage = new IndexedDBAdapter();
    await storage.init();
    console.log('✅ Storage inicializado');

    // 2. Inicializar State Manager
    const stateManager = new StateManager(storage);
    await stateManager.restore();
    console.log('✅ State Manager inicializado');

    // 3. Inicializar Event Bus
    const eventBus = new EventBus();
    console.log('✅ Event Bus inicializado');

    // 4. Preparar container da aplicação
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = '';

    // 5. Inicializar módulo Insumos
    const insumosRepository = new InsumosRepository(storage, stateManager);
    const insumosService = new InsumosService(insumosRepository, eventBus);
    const insumosView = new InsumosView(appContainer);
    const insumosController = new InsumosController(insumosService, insumosView);

    // 6. Inicializar controller
    insumosController.initialize();

    console.log('✅ Sistema inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    document.getElementById('app').innerHTML = `
      <div class="container error">
        <h1>❌ Erro ao Inicializar</h1>
        <p>${error.message}</p>
        <p>Verifique o console para mais detalhes.</p>
      </div>
    `;
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
