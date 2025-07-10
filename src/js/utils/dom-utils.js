/**
 * DOM Utilities Module
 * Common DOM manipulation functions and utilities
 */

// --- DOM Elements Cache ---
const domElements = {};

/**
 * Initialize DOM element references
 */
function initializeDOMElements() {
  // Form elements
  domElements.componentSelect = document.getElementById('componentSelect');
  domElements.functionSelect = document.getElementById('functionSelect');
  domElements.variableSelect = document.getElementById('variableSelect');
  domElements.modeSelect = document.getElementById('modeSelect');
  domElements.parentRequirementSelect = document.getElementById('parentRequirementSelect');
  domElements.conditionInput = document.getElementById('conditionInput');
  domElements.behaviorInput = document.getElementById('behaviorInput');
  domElements.latencyInput = document.getElementById('latencyInput');
  domElements.toleranceInput = document.getElementById('toleranceInput');
  domElements.justificationInput = document.getElementById('justificationInput');
  domElements.generatePromptBtn = document.getElementById('generatePromptBtn');

  // Buttons
  domElements.addReqBtn = document.getElementById('addReqBtn');
  domElements.clearAllBtn = document.getElementById('clearAllBtn');
  domElements.exportCsvBtn = document.getElementById('exportCsvBtn');
  domElements.exportLatexBtn = document.getElementById('exportLatexBtn');

  // Lists and displays
  domElements.requirementsList = document.getElementById('requirementsList');
  domElements.functionsList = document.getElementById('functionsList');
  domElements.variablesList = document.getElementById('variablesList');
  domElements.componentsList = document.getElementById('componentsList');
  domElements.functionsPreview = document.getElementById('functionsPreview');
  domElements.variablesPreview = document.getElementById('variablesPreview');

  // Configuration elements
  domElements.newFunctionInput = document.getElementById('newFunctionInput');
  domElements.addFunctionBtn = document.getElementById('addFunctionBtn');
  domElements.newVariableInput = document.getElementById('newVariableInput');
  domElements.addVariableBtn = document.getElementById('addVariableBtn');
  domElements.resetConfigBtn = document.getElementById('resetConfigBtn');
  domElements.newComponentInput = document.getElementById('newComponentInput');
  domElements.addComponentBtn = document.getElementById('addComponentBtn');

  // Project import/export
  domElements.importProjectBtn = document.getElementById('importProjectBtn');
  domElements.exportProjectBtn = document.getElementById('exportProjectBtn');
  domElements.importFileInput = document.getElementById('importFileInput');

  // About modal
  domElements.aboutBtn = document.getElementById('aboutBtn');
  domElements.aboutModal = document.getElementById('aboutModal');
  domElements.closeAboutModal = document.getElementById('closeAboutModal');

  // Tab elements
  domElements.configTab = document.getElementById('configTab');
  domElements.createTab = document.getElementById('createTab');
  domElements.listTab = document.getElementById('listTab');
  domElements.treeTab = document.getElementById('treeTab');
  domElements.guidelinesTab = document.getElementById('guidelinesTab');
  domElements.configContent = document.getElementById('configContent');
  domElements.createContent = document.getElementById('createContent');
  domElements.listContent = document.getElementById('listContent');
  domElements.treeContent = document.getElementById('treeContent');
  domElements.guidelinesContent = document.getElementById('guidelinesContent');

  // Output elements
  domElements.outputId = document.getElementById('outputId');
  domElements.outputComponent = document.getElementById('outputComponent');
  domElements.outputFunction = document.getElementById('outputFunction');
  domElements.outputVariable = document.getElementById('outputVariable');
  domElements.outputLogic = document.getElementById('outputLogic');
  domElements.outputLatency = document.getElementById('outputLatency');
  domElements.outputJustification = document.getElementById('outputJustification');
}

/**
 * Populate a select element with options
 */
function populateSelect(selectElement, options, defaultText = '') {
  if (!selectElement) {return;}

  selectElement.innerHTML = '';

  // Add default option if provided
  if (defaultText) {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultText;
    selectElement.appendChild(defaultOption);
  }

  // Handle array of strings or array of objects
  options.forEach(option => {
    const opt = document.createElement('option');
    if (typeof option === 'string') {
      opt.value = option;
      opt.textContent = option;
    } else {
      opt.value = option.value || option;
      opt.textContent = option.text || option.textContent || option.value || option;
    }
    selectElement.appendChild(opt);
  });
}

/**
 * Update all select elements with current global data
 */
function updateSelects() {
  // Update component selects
  const componentSelects = [
    document.getElementById('componentSelect'),
    document.getElementById('modeComponentSelect')
  ];

  componentSelects.forEach(select => {
    if (select) {
      populateSelect(select, window.AppGlobals?.state?.allComponents || [], 'Selecciona un componente');
    }
  });

  // Update function select
  const functionSelect = document.getElementById('functionSelect');
  if (functionSelect) {
    populateSelect(functionSelect, window.AppGlobals?.state?.allFunctions || [], 'Selecciona una función');
  }

  // Update variable select
  const variableSelect = document.getElementById('variableSelect');
  if (variableSelect) {
    populateSelect(variableSelect, window.AppGlobals?.state?.allVariables || [], 'Selecciona una variable');
  }

  // Update mode select (this is component-dependent, so we just clear it)
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) {
    populateSelect(modeSelect, [], 'Selecciona un modo');
  }

  // Update parent requirement select
  const parentSelect = document.getElementById('parentRequirementSelect');
  if (parentSelect && window.AppGlobals?.state?.allRequirements) {
    const level1Requirements = window.AppGlobals.state.allRequirements
      .filter(req => req.level === 1)
      .map(req => ({ value: req.id, text: `${req.id} - ${req.behavior}` }));
    populateSelect(parentSelect, level1Requirements, 'Ninguno (Requisito de Nivel 1)');
  }
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const colors = {
    success: 'border-l-4 border-green-500 bg-green-50',
    error: 'border-l-4 border-red-500 bg-red-50',
    info: 'border-l-4 border-blue-500 bg-blue-50',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50',
  };

  toast.innerHTML = `
        <div class="flex items-center ${colors[type]} p-3 rounded">
            <span class="text-sm font-medium">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
                ✕
            </button>
        </div>
    `;

  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Re-initialize DOM elements after dynamic content load
 */
function reinitializeDOMElements() {
  console.log('🔄 Re-initializing DOM elements for current tab...');
  initializeDOMElements();
  console.log('✅ DOM elements re-initialized for current tab');
}

// --- Reusable Configuration List Manager ---
class ConfigListManager {
  constructor(config) {
    this.listId = config.listId;
    this.inputId = config.inputId;
    this.buttonId = config.buttonId;
    this.dataPath = config.dataPath; // e.g., 'allFunctions', 'allVariables'
    this.itemName = config.itemName; // e.g., 'función', 'variable'
    this.validate = config.validate || (() => true);
    this.onAdd = config.onAdd || (() => {});
    this.onRemove = config.onRemove || (() => {});
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const button = document.getElementById(this.buttonId);
    const input = document.getElementById(this.inputId);

    if (button) {
      button.addEventListener('click', () => this.addItem());
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addItem();
        }
      });
    }
  }

  addItem() {
    const input = document.getElementById(this.inputId);
    if (!input || !input.value.trim()) {
      DOMUtils.showToast(`Por favor, introduce el nombre de la ${this.itemName}.`, 'warning');
      return;
    }

    const newItem = input.value.trim();
    const dataArray = this.getDataArray();

    if (dataArray.includes(newItem)) {
      DOMUtils.showToast(`Esta ${this.itemName} ya existe.`, 'warning');
      return;
    }

    if (!this.validate(newItem)) {
      return;
    }

    dataArray.push(newItem);
    input.value = '';
    this.render();
    this.onAdd(newItem);
    DOMUtils.showToast(`${this.itemName.charAt(0).toUpperCase() + this.itemName.slice(1)} añadida correctamente.`, 'success');
    
    // Auto-save
    if (window.Storage && Storage.saveConfig) {
      Storage.saveConfig();
    }
  }

  removeItem(index) {
    const dataArray = this.getDataArray();
    if (index >= 0 && index < dataArray.length) {
      const removedItem = dataArray.splice(index, 1)[0];
      this.render();
      this.onRemove(removedItem, index);
      DOMUtils.showToast(`${this.itemName.charAt(0).toUpperCase() + this.itemName.slice(1)} "${removedItem}" eliminada.`, 'success');
      
      // Auto-save
      if (window.Storage && Storage.saveConfig) {
        Storage.saveConfig();
      }
    }
  }

  getDataArray() {
    return window.AppGlobals?.state?.[this.dataPath] || [];
  }

  render() {
    const container = document.getElementById(this.listId);
    if (!container) return;

    const dataArray = this.getDataArray();

    if (dataArray.length === 0) {
      container.innerHTML = `<p class="text-gray-500 italic text-sm">No hay ${this.itemName}s configuradas.</p>`;
      return;
    }

    container.innerHTML = dataArray
      .map((item, index) => `
        <div class="config-list-item">
          <span class="font-medium text-gray-800 flex-1">${item}</span>
          <button 
            onclick="window.ConfigListManagers.${this.dataPath}.removeItem(${index})" 
            class="remove-btn"
            title="Eliminar ${this.itemName}"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
  }
}

// --- Many-to-Many Configuration List Manager ---
class ManyToManyListManager {
  constructor(config) {
    this.listId = config.listId;
    this.inputId = config.inputId;
    this.buttonId = config.buttonId;
    this.itemName = config.itemName; // e.g., 'modo'
    this.associatedItemName = config.associatedItemName; // e.g., 'componente'
    this.getItems = config.getItems; // function to get main items array
    this.getAssociatedItems = config.getAssociatedItems; // function to get associated items array
    this.addItem = config.addItem; // function to add new item
    this.removeItem = config.removeItem; // function to remove item
    this.getAssociations = config.getAssociations; // function to get associations for an item
    this.setAssociations = config.setAssociations; // function to set associations for an item
    this.validate = config.validate || (() => true);
    this.onAdd = config.onAdd || (() => {});
    this.onRemove = config.onRemove || (() => {});
    this.onAssociationChange = config.onAssociationChange || (() => {});
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const button = document.getElementById(this.buttonId);
    const input = document.getElementById(this.inputId);

    if (button) {
      button.addEventListener('click', () => this.addNewItem());
    }

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addNewItem();
        }
      });
    }
  }

  addNewItem() {
    const input = document.getElementById(this.inputId);
    if (!input || !input.value.trim()) {
      DOMUtils.showToast(`Por favor, introduce el nombre del ${this.itemName}.`, 'warning');
      return;
    }

    const newItem = input.value.trim();
    const items = this.getItems();

    if (items.includes(newItem)) {
      DOMUtils.showToast(`Este ${this.itemName} ya existe.`, 'warning');
      return;
    }

    if (!this.validate(newItem)) {
      return;
    }

    this.addItem(newItem);
    input.value = '';
    this.render();
    this.onAdd(newItem);
    DOMUtils.showToast(`${this.itemName.charAt(0).toUpperCase() + this.itemName.slice(1)} añadido correctamente.`, 'success');
    
    // Auto-save
    if (window.Storage && Storage.saveConfig) {
      Storage.saveConfig();
    }
  }

  removeItemByIndex(index) {
    const items = this.getItems();
    if (index >= 0 && index < items.length) {
      const removedItem = items[index];
      this.removeItem(removedItem);
      this.render();
      this.onRemove(removedItem, index);
      DOMUtils.showToast(`${this.itemName.charAt(0).toUpperCase() + this.itemName.slice(1)} "${removedItem}" eliminado.`, 'success');
      
      // Auto-save
      if (window.Storage && Storage.saveConfig) {
        Storage.saveConfig();
      }
    }
  }

  updateAssociations(item, selectedAssociations) {
    this.setAssociations(item, selectedAssociations);
    this.onAssociationChange(item, selectedAssociations);
    
    // Auto-save
    if (window.Storage && Storage.saveConfig) {
      Storage.saveConfig();
    }
  }

  render() {
    const container = document.getElementById(this.listId);
    if (!container) return;

    const items = this.getItems();
    const associatedItems = this.getAssociatedItems();

    if (items.length === 0) {
      container.innerHTML = `<p class="text-gray-500 italic text-sm">No hay ${this.itemName}s configurados.</p>`;
      return;
    }

    container.innerHTML = items
      .map((item, index) => {
        const associations = this.getAssociations(item);
        
        // Create checkbox-based multi-select UI
        const associationCheckboxes = associatedItems
          .map(assocItem => {
            const isSelected = associations.includes(assocItem);
            const checkboxId = `${this.listId}_${index}_${assocItem.replace(/\s+/g, '_')}`;
            return `
              <label class="mode-component-label inline-flex items-center px-3 py-1 rounded-full border cursor-pointer transition-all text-sm ${
                isSelected 
                  ? 'bg-purple-100 border-purple-300 text-purple-800' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }" onclick="window.ManyToManyManagers.modes.toggleAssociation('${item}', '${assocItem}')">>
                <span class="font-medium">${assocItem}</span>
                ${isSelected ? '<i class="fas fa-check ml-2 text-purple-600"></i>' : ''}
              </label>
            `;
          }).join('');

        return `
          <div class="mb-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3 flex-1">
                <div class="flex items-center gap-2">
                  <i class="fas fa-layer-group text-purple-600"></i>
                  <h5 class="font-semibold text-gray-800">${item}</h5>
                </div>
                <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  ${associations.length} ${this.associatedItemName}${associations.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button 
                onclick="window.ManyToManyManagers.modes.removeItemByIndex(${index})" 
                class="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                title="Eliminar ${this.itemName}"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            ${associatedItems.length > 0 ? `
              <div class="space-y-2">
                <label class="block text-xs font-medium text-gray-600 mb-2">
                  Seleccionar ${this.associatedItemName}s:
                </label>
                <div class="flex flex-wrap gap-2">
                  ${associationCheckboxes}
                </div>
              </div>
            ` : `
              <div class="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                <i class="fas fa-exclamation-triangle mr-1 text-yellow-600"></i>
                No hay ${this.associatedItemName}s disponibles. Añade ${this.associatedItemName}s primero.
              </div>
            `}
          </div>
        `;
      }).join('');

    // Add click event listeners to component labels
    setTimeout(() => {
      const container = document.getElementById(this.listId);
      if (container) {
        const labels = container.querySelectorAll('.mode-component-label');
        labels.forEach(label => {
          label.addEventListener('click', (e) => {
            e.preventDefault();
            const mode = label.dataset.mode;
            const component = label.dataset.component;
            this.toggleAssociation(mode, component);
          });
        });
      }
    }, 0);
  }

  // Handle toggling associations for checkbox-style labels
  toggleAssociation(item, associatedItem) {
    const currentAssociations = this.getAssociations(item);
    const isCurrentlySelected = currentAssociations.includes(associatedItem);
    
    let newAssociations;
    if (isCurrentlySelected) {
      // Remove the association
      newAssociations = currentAssociations.filter(assoc => assoc !== associatedItem);
    } else {
      // Add the association
      newAssociations = [...currentAssociations, associatedItem];
    }
    
    this.updateAssociations(item, newAssociations);
    // Re-render to update the visual state
    this.render();
  }
}

// --- Export functions ---
window.DOMUtils = {
  domElements,
  initializeDOMElements,
  populateSelect,
  updateSelects,
  showToast,
  reinitializeDOMElements,
  ConfigListManager,
  ManyToManyListManager
};

console.log('✅ DOM utilities module loaded');
