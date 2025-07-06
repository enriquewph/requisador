/**
 * Configuration Tab Module
 * Handles all configuration tab functionality including functions, variables, components, and modes management
 */

/* global AppGlobals, DOMUtils, Storage */

/**
 * Configuration Tab functionality
 */
const ConfigTab = {
  /**
   * Initialize configuration tab
   */
  init() {
    console.log('🔧 ConfigTab: Initializing configuration tab...');
    this.bindEvents();
    this.renderAllLists();
    console.log('✅ ConfigTab: Configuration tab initialized successfully');
  },

  /**
   * Bind event listeners for configuration tab
   */
  bindEvents() {
    // Function management
    const addFunctionBtn = document.getElementById('addFunctionBtn');
    if (addFunctionBtn) {
      addFunctionBtn.addEventListener('click', () => this.addFunction());
    }

    const newFunctionInput = document.getElementById('newFunctionInput');
    if (newFunctionInput) {
      newFunctionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addFunction();
        }
      });
    }

    // Variable management
    const addVariableBtn = document.getElementById('addVariableBtn');
    if (addVariableBtn) {
      addVariableBtn.addEventListener('click', () => this.addVariable());
    }

    const newVariableInput = document.getElementById('newVariableInput');
    if (newVariableInput) {
      newVariableInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addVariable();
        }
      });
    }

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

    // Save functionality
    const saveBtn = document.getElementById('saveConfigBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveConfiguration());
    }
  },

  /**
   * Add a new function
   */
  addFunction() {
    const input = document.getElementById('newFunctionInput');
    if (!input || !input.value.trim()) {
      DOMUtils.showToast('Por favor, introduce el nombre de la función.', 'warning');
      return;
    }

    const newFunction = input.value.trim();
    if (AppGlobals.state.allFunctions.includes(newFunction)) {
      DOMUtils.showToast('Esta función ya existe.', 'warning');
      return;
    }

    AppGlobals.state.allFunctions.push(newFunction);
    input.value = '';
    this.renderFunctionsList();
    DOMUtils.updateSelects();
    DOMUtils.showToast('Función añadida correctamente.', 'success');
  },

  /**
   * Remove a function
   */
  removeFunction(index) {
    if (index >= 0 && index < AppGlobals.state.allFunctions.length) {
      const removedFunction = AppGlobals.state.allFunctions.splice(index, 1)[0];
      this.renderFunctionsList();
      DOMUtils.updateSelects();
      DOMUtils.showToast(`Función "${removedFunction}" eliminada.`, 'success');
    }
  },

  /**
   * Add a new variable
   */
  addVariable() {
    const input = document.getElementById('newVariableInput');
    if (!input || !input.value.trim()) {
      DOMUtils.showToast('Por favor, introduce el nombre de la variable.', 'warning');
      return;
    }

    const newVariable = input.value.trim();
    if (AppGlobals.state.allVariables.includes(newVariable)) {
      DOMUtils.showToast('Esta variable ya existe.', 'warning');
      return;
    }

    AppGlobals.state.allVariables.push(newVariable);
    input.value = '';
    this.renderVariablesList();
    DOMUtils.updateSelects();
    DOMUtils.showToast('Variable añadida correctamente.', 'success');
  },

  /**
   * Remove a variable
   */
  removeVariable(index) {
    if (index >= 0 && index < AppGlobals.state.allVariables.length) {
      const removedVariable = AppGlobals.state.allVariables.splice(index, 1)[0];
      this.renderVariablesList();
      DOMUtils.updateSelects();
      DOMUtils.showToast(`Variable "${removedVariable}" eliminada.`, 'success');
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
    AppGlobals.state.modes[newComponent] = ['Modo por defecto']; // Initialize with default mode
    input.value = '';
    this.renderComponentsList();
    this.renderModesList();
    DOMUtils.updateSelects();
    DOMUtils.showToast('Componente añadido correctamente.', 'success');
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
      DOMUtils.updateSelects();
      DOMUtils.showToast(`Componente "${removedComponent}" eliminado.`, 'success');
    }
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
    DOMUtils.updateSelects();
    DOMUtils.showToast('Modo añadido correctamente.', 'success');
  },

  /**
   * Remove a mode
   */
  removeMode(component, modeIndex) {
    if (AppGlobals.state.modes[component] && modeIndex >= 0 && modeIndex < AppGlobals.state.modes[component].length) {
      const removedMode = AppGlobals.state.modes[component].splice(modeIndex, 1)[0];
      this.renderModesList();
      DOMUtils.updateSelects();
      DOMUtils.showToast(`Modo "${removedMode}" eliminado del componente "${component}".`, 'success');
    }
  },

  /**
   * Reset configuration to defaults
   */
  resetConfiguration() {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración? Esta acción no se puede deshacer.')) {
      AppGlobals.resetGlobalState();
      this.renderAllLists();
      DOMUtils.updateSelects();
      DOMUtils.showToast('Configuración reseteada a valores por defecto.', 'success');
    }
  },

  /**
   * Save configuration to localStorage
   */
  saveConfiguration() {
    try {
      Storage.saveConfig();
      DOMUtils.showToast('Configuración guardada correctamente.', 'success');
    } catch (error) {
      console.error('Error saving configuration:', error);
      DOMUtils.showToast('Error al guardar la configuración.', 'error');
    }
  },

  /**
   * Render all configuration lists
   */
  renderAllLists() {
    this.renderFunctionsList();
    this.renderVariablesList();
    this.renderComponentsList();
    this.renderModesList();
  },

  /**
   * Render functions list
   */
  renderFunctionsList() {
    const container = document.getElementById('functionsList');
    if (!container) {return;}

    if (AppGlobals.state.allFunctions.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">No hay funciones configuradas.</p>';
      return;
    }

    container.innerHTML = AppGlobals.state.allFunctions
      .map((func, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span class="font-medium">${func}</span>
          <button 
            onclick="ConfigTab.removeFunction(${index})" 
            class="text-red-600 hover:text-red-800 text-sm"
            title="Eliminar función"
          >
            ✕
          </button>
        </div>
      `).join('');
  },

  /**
   * Render variables list
   */
  renderVariablesList() {
    const container = document.getElementById('variablesList');
    if (!container) {return;}

    if (AppGlobals.state.allVariables.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">No hay variables configuradas.</p>';
      return;
    }

    container.innerHTML = AppGlobals.state.allVariables
      .map((variable, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span class="font-medium">${variable}</span>
          <button 
            onclick="ConfigTab.removeVariable(${index})" 
            class="text-red-600 hover:text-red-800 text-sm"
            title="Eliminar variable"
          >
            ✕
          </button>
        </div>
      `).join('');
  },

  /**
   * Render components list
   */
  renderComponentsList() {
    const container = document.getElementById('componentsList');
    if (!container) {return;}

    if (AppGlobals.state.allComponents.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">No hay componentes configurados.</p>';
      return;
    }

    container.innerHTML = AppGlobals.state.allComponents
      .map((component, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span class="font-medium">${component}</span>
          <button 
            onclick="ConfigTab.removeComponent(${index})" 
            class="text-red-600 hover:text-red-800 text-sm"
            title="Eliminar componente"
          >
            ✕
          </button>
        </div>
      `).join('');

    // Update mode component select
    const modeComponentSelect = document.getElementById('modeComponentSelect');
    if (modeComponentSelect) {
      DOMUtils.populateSelect(modeComponentSelect, AppGlobals.state.allComponents, 'Selecciona un componente');
    }
  },

  /**
   * Render modes list
   */
  renderModesList() {
    const container = document.getElementById('modesList');
    if (!container) {return;}

    if (Object.keys(AppGlobals.state.modes).length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">No hay modos configurados.</p>';
      return;
    }

    let html = '';
    Object.entries(AppGlobals.state.modes).forEach(([component, modes]) => {
      html += `
        <div class="mb-4 p-3 bg-gray-50 rounded">
          <h4 class="font-semibold text-gray-800 mb-2">${component}</h4>
          <div class="space-y-1">
            ${modes.map((mode, index) => `
              <div class="flex items-center justify-between p-1">
                <span class="text-sm">${mode}</span>
                <button 
                  onclick="ConfigTab.removeMode('${component}', ${index})" 
                  class="text-red-600 hover:text-red-800 text-xs"
                  title="Eliminar modo"
                >
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};

// Expose ConfigTab to window for global access
window.ConfigTab = ConfigTab;

console.log('✅ ConfigTab module loaded successfully');
