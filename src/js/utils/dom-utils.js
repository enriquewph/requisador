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
  if (!selectElement) return;

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

// --- Export functions ---
window.DOMUtils = {
  domElements,
  initializeDOMElements,
  populateSelect,
  updateSelects,
  showToast,
  reinitializeDOMElements
};

// For backward compatibility
window.domElements = domElements;
window.showToast = showToast;
window.initializeDOMElements = initializeDOMElements;
window.populateSelect = populateSelect;
window.updateSelects = updateSelects;
window.reinitializeDOMElements = reinitializeDOMElements;

console.log('✅ DOM utilities module loaded');
