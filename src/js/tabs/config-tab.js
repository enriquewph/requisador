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

    // Modes many-to-many list manager
    this.listManagers.modes = new DOMUtils.ManyToManyListManager({
      listId: 'modesList',
      inputId: 'newModeInput',
      buttonId: 'addModeBtn',
      itemName: 'modo',
      associatedItemName: 'componente',
      getItems: () => AppGlobals.state.allModes,
      getAssociatedItems: () => AppGlobals.state.allComponents,
      addItem: (mode) => AppGlobals.state.allModes.push(mode),
      removeItem: (mode) => {
        const index = AppGlobals.state.allModes.indexOf(mode);
        if (index !== -1) {
          AppGlobals.state.allModes.splice(index, 1);
        }
        AppGlobals.removeModeComponentAssociation(mode);
      },
      getAssociations: (mode) => AppGlobals.getComponentsForMode(mode),
      setAssociations: (mode, components) => AppGlobals.addModeComponentAssociation(mode, components),
      onAdd: () => DOMUtils.updateSelects(),
      onRemove: () => DOMUtils.updateSelects(),
      onAssociationChange: () => DOMUtils.updateSelects()
    });

    // Initialize all managers
    Object.values(this.listManagers).forEach(manager => manager.init());

    // Expose managers globally for onclick handlers
    window.ConfigListManagers = this.listManagers;
    window.ManyToManyManagers = { modes: this.listManagers.modes };
  },

  /**
   * Bind custom events (non-list events)
   */
  bindCustomEvents() {
    console.log('🔧 ConfigTab: Binding custom events...');
    
    // Component management
    const addComponentBtn = document.getElementById('addComponentBtn');
    console.log('🔧 ConfigTab: Add component button found:', addComponentBtn);
    if (addComponentBtn) {
      addComponentBtn.addEventListener('click', () => this.addComponent());
      console.log('✅ ConfigTab: Add component button event bound');
    } else {
      console.warn('⚠️ ConfigTab: Add component button not found!');
    }

    const newComponentInput = document.getElementById('newComponentInput');
    console.log('🔧 ConfigTab: New component input found:', newComponentInput);
    if (newComponentInput) {
      newComponentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addComponent();
        }
      });
      console.log('✅ ConfigTab: Component input keypress event bound');
    } else {
      console.warn('⚠️ ConfigTab: New component input not found!');
    }

    // Reset functionality
    const resetBtn = document.getElementById('resetConfigBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetConfiguration());
    }

    console.log('✅ ConfigTab: Custom events bound successfully');
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
    input.value = '';
    this.renderComponentsList();
    // Update the modes list to show the new component in multi-selects
    this.listManagers.modes.render();
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
      
      // Remove component from all mode associations and clean up empty modes
      AppGlobals.removeComponentFromAllModes(removedComponent);
      
      this.renderComponentsList();
      // Update the modes list to reflect changes
      this.listManagers.modes.render();
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
   * Render all configuration lists
   */
  renderAllLists() {
    console.log('🔧 ConfigTab: Rendering all lists...');
    // Functions, variables, and modes are handled by their list managers
    Object.values(this.listManagers).forEach(manager => manager.render());
    
    // Components need custom rendering
    this.renderComponentsList();
    
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
      .map((component, index) => {
        const associatedModes = AppGlobals.getModesForComponent(component);
        return `
          <div class="config-list-item">
            <div class="flex-1">
              <span class="font-medium text-gray-800">${component}</span>
              <div class="text-xs text-gray-500 mt-1">
                ${associatedModes.length > 0 ? `${associatedModes.length} modos: ${associatedModes.join(', ')}` : 'Sin modos asignados'}
              </div>
            </div>
            <button 
              onclick="ConfigTab.removeComponent(${index})" 
              class="remove-btn"
              title="Eliminar componente"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      }).join('');
  }
};

// Expose ConfigTab to window for global access
window.ConfigTab = ConfigTab;

console.log('✅ ConfigTab module loaded successfully');
