/**
 * Configuration Tab Module
 * Handles all configuration tab functionality using reusable list managers
 */

/* global AppGlobals, DOMUtils, Storage */

/**
 * Configuration Tab functionality
 */
const ConfigTab = {
  listManagers: {},

  /**
   * Initialize configuration tab
   */
  init() {
    console.log('🔧 ConfigTab: Initializing configuration tab...');
    this.initializeListManagers();
    this.bindCustomEvents();
    this.renderAllLists();
    console.log('✅ ConfigTab: Configuration tab initialized successfully');
  },

  /**
   * Initialize reusable list managers
   */
  initializeListManagers() {
    // Functions list manager
    this.listManagers.functions = new DOMUtils.ConfigListManager({
      listId: 'functionsList',
      inputId: 'newFunctionInput',
      buttonId: 'addFunctionBtn',
      dataPath: 'allFunctions',
      itemName: 'función',
      onAdd: () => DOMUtils.updateSelects(),
      onRemove: () => DOMUtils.updateSelects()
    });

    // Variables list manager
    this.listManagers.variables = new DOMUtils.ConfigListManager({
      listId: 'variablesList',
      inputId: 'newVariableInput',
      buttonId: 'addVariableBtn',
      dataPath: 'allVariables',
      itemName: 'variable',
      onAdd: () => DOMUtils.updateSelects(),
      onRemove: () => DOMUtils.updateSelects()
    });

    // Initialize all managers
    Object.values(this.listManagers).forEach(manager => manager.init());

    // Expose managers globally for onclick handlers
    window.ConfigListManagers = this.listManagers;
  },

  /**
   * Bind custom events (non-list events)
   */
  bindCustomEvents() {
    console.log('🔧 ConfigTab: Binding custom events...');
    
    // Component management
    const addComponentBtn = document.getElementById('addComponentBtn');
    if (addComponentBtn) {
      addComponentBtn.addEventListener('click', () => this.addComponent());
    }

    const newComponentInput = document.getElementById('newComponentInput');
    if (newComponentInput) {
      newComponentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addComponent();
        }
      });
    }

    // Mode management
    const addModeBtn = document.getElementById('addModeBtn');
    if (addModeBtn) {
      addModeBtn.addEventListener('click', () => this.addMode());
    }

    const newModeInput = document.getElementById('newModeInput');
    if (newModeInput) {
      newModeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addMode();
        }
      });
    }

    // Reset functionality
    const resetBtn = document.getElementById('resetConfigBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetConfiguration());
    }

    console.log('✅ ConfigTab: Custom events bound successfully');
  },

  /**
   * Add a new mode
   */
  addMode() {
    const input = document.getElementById('newModeInput');
    const componentSelect = document.getElementById('modeComponentSelect');

    if (!input || !input.value.trim()) {
      DOMUtils.showToast('Por favor, introduce el nombre del modo.', 'warning');
      return;
    }

    if (!componentSelect || !componentSelect.value) {
      DOMUtils.showToast('Por favor, selecciona un componente.', 'warning');
      return;
    }

    const newMode = input.value.trim();
    const selectedComponent = componentSelect.value;

    if (AppGlobals.state.modes[selectedComponent]?.includes(newMode)) {
      DOMUtils.showToast('Este modo ya existe para el componente seleccionado.', 'warning');
      return;
    }

    if (!AppGlobals.state.modes[selectedComponent]) {
      AppGlobals.state.modes[selectedComponent] = [];
    }

    AppGlobals.state.modes[selectedComponent].push(newMode);
    input.value = '';
    this.renderModesList();
    this.saveState();
    DOMUtils.showToast('Modo añadido correctamente.', 'success');
    console.log('🔧 ConfigTab: Mode added:', newMode, 'to component:', selectedComponent);
  },

  /**
   * Remove a mode
   */
  removeMode(component, modeIndex) {
    if (AppGlobals.state.modes[component] && modeIndex >= 0 && modeIndex < AppGlobals.state.modes[component].length) {
      const removedMode = AppGlobals.state.modes[component].splice(modeIndex, 1)[0];
      
      // If this was the last mode for the component, remove the component entry
      if (AppGlobals.state.modes[component].length === 0) {
        delete AppGlobals.state.modes[component];
      }
      
      this.renderModesList();
      this.saveState();
      DOMUtils.showToast(`Modo "${removedMode}" eliminado del componente "${component}".`, 'success');
      console.log('🔧 ConfigTab: Mode removed:', removedMode, 'from component:', component);
    }
  },

  /**
   * Add a new component
   */
  addComponent() {
    const input = document.getElementById('newComponentInput');
    if (!input || !input.value.trim()) {
      DOMUtils.showToast('Por favor, introduce el nombre del componente.', 'warning');
      return;
    }

    const newComponent = input.value.trim();
    if (AppGlobals.state.allComponents.includes(newComponent)) {
      DOMUtils.showToast('Este componente ya existe.', 'warning');
      return;
    }

    AppGlobals.state.allComponents.push(newComponent);
    // Initialize with a default mode
    AppGlobals.state.modes[newComponent] = ['Modo por defecto'];
    input.value = '';
    this.renderComponentsList();
    this.renderModesList();
    this.updateModeComponentSelect();
    this.saveState();
    DOMUtils.showToast('Componente añadido correctamente.', 'success');
    console.log('🔧 ConfigTab: Component added:', newComponent);
  },

  /**
   * Remove a component
   */
  removeComponent(index) {
    if (index >= 0 && index < AppGlobals.state.allComponents.length) {
      const removedComponent = AppGlobals.state.allComponents.splice(index, 1)[0];
      delete AppGlobals.state.modes[removedComponent];
      this.renderComponentsList();
      this.renderModesList();
      this.updateModeComponentSelect();
      this.saveState();
      DOMUtils.showToast(`Componente "${removedComponent}" eliminado.`, 'success');
      console.log('🔧 ConfigTab: Component removed:', removedComponent);
    }
  },

  /**
   * Reset configuration to defaults
   */
  resetConfiguration() {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración? Esta acción no se puede deshacer.')) {
      console.log('🔧 ConfigTab: Resetting configuration to defaults...');
      AppGlobals.resetGlobalState();
      this.renderAllLists();
      this.updateModeComponentSelect();
      DOMUtils.showToast('Configuración reseteada a valores por defecto.', 'success');
      console.log('✅ ConfigTab: Configuration reset successfully');
    }
  },

  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      Storage.saveConfig();
      console.log('🔧 ConfigTab: Configuration saved to localStorage');
    } catch (error) {
      console.error('❌ ConfigTab: Error saving configuration:', error);
    }
  },

  /**
   * Update the mode component select dropdown
   */
  updateModeComponentSelect() {
    const select = document.getElementById('modeComponentSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar componente...</option>';
    AppGlobals.state.allComponents.forEach(component => {
      const option = document.createElement('option');
      option.value = component;
      option.textContent = component;
      select.appendChild(option);
    });
  },

  /**
   * Render all configuration lists
   */
  renderAllLists() {
    console.log('🔧 ConfigTab: Rendering all lists...');
    // Functions and variables are handled by their list managers
    Object.values(this.listManagers).forEach(manager => manager.render());
    
    // Custom lists that need special handling
    this.renderComponentsList();
    this.renderModesList();
    this.updateModeComponentSelect();
    
    console.log('✅ ConfigTab: All lists rendered successfully');
  },

  /**
   * Render components list with improved styling
   */
  renderComponentsList() {
    const container = document.getElementById('componentsList');
    if (!container) return;

    if (AppGlobals.state.allComponents.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic text-sm col-span-full">No hay componentes configurados.</p>';
      return;
    }

    container.innerHTML = AppGlobals.state.allComponents
      .map((component, index) => `
        <div class="config-list-item">
          <span class="font-medium text-gray-800 flex-1">${component}</span>
          <span class="text-xs text-gray-500 mr-2">${AppGlobals.state.modes[component]?.length || 0} modos</span>
          <button 
            onclick="ConfigTab.removeComponent(${index})" 
            class="remove-btn"
            title="Eliminar componente"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
  },

  /**
   * Render modes list with improved styling and component grouping
   */
  renderModesList() {
    const container = document.getElementById('modesList');
    if (!container) return;

    if (Object.keys(AppGlobals.state.modes).length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic text-sm">No hay modos configurados.</p>';
      return;
    }

    let html = '';
    Object.entries(AppGlobals.state.modes).forEach(([component, modes]) => {
      if (modes && modes.length > 0) {
        html += `
          <div class="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h5 class="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
              <i class="fas fa-microchip text-purple-600"></i>
              ${component}
              <span class="text-xs font-normal text-gray-500">(${modes.length} modos)</span>
            </h5>
            <div class="space-y-1">
              ${modes.map((mode, index) => `
                <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                  <span class="text-sm text-gray-700">${mode}</span>
                  <button 
                    onclick="ConfigTab.removeMode('${component}', ${index})" 
                    class="text-red-500 hover:text-red-700 text-xs p-1 rounded hover:bg-red-50 transition-colors"
                    title="Eliminar modo"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    });

    if (html === '') {
      container.innerHTML = '<p class="text-gray-500 italic text-sm">No hay modos configurados.</p>';
    } else {
      container.innerHTML = html;
    }
  }
};

// Expose ConfigTab to window for global access
window.ConfigTab = ConfigTab;

console.log('✅ ConfigTab module loaded successfully');
