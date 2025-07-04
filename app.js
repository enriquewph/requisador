/**
 * Requisador de Requisitos - Main Application Script
 * A comprehensive tool for creating and managing system requirements
 * Following Systems Engineering Handbook methodology
 */

// --- Data Definitions ---
let modes = {
    HMI: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode', 'Stopped Mode'],
    ECI: ['Initialization Mode', 'Pre-operational Mode', 'Operational (gw inactive)', 'Operational (gw active)', 'Fault mode'],
    Ambos: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode']
};

const allFunctions = ['Runtime Manager', 'Config Manager', 'CAN NMT Slave', 'CAN NMT Master', 'CAN-GPIO Translator', 'CAN-ETH Translator', 'CAN Driver', 'GPIO Driver', 'ETH Driver'];
const allVariables = ['Indicador de estado', 'Comandos a Red CAN', 'Estado de salidas fisicas', 'Reportes a Proc. Robot', 'Comandos de gestión de red', 'Mensajes de sincronización', 'Respuestas a Terminal de Ingeniería'];
let allComponents = ['HMI', 'ECI', 'Ambos'];

// Default values for reset functionality
const defaultFunctions = ['Runtime Manager', 'Config Manager', 'CAN NMT Slave', 'CAN NMT Master', 'CAN-GPIO Translator', 'CAN-ETH Translator', 'CAN Driver', 'GPIO Driver', 'ETH Driver'];
const defaultVariables = ['Indicador de estado', 'Comandos a Red CAN', 'Estado de salidas fisicas', 'Reportes a Proc. Robot', 'Comandos de gestión de red', 'Mensajes de sincronización', 'Respuestas a Terminal de Ingeniería'];
const defaultModes = {
    HMI: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode', 'Stopped Mode'],
    ECI: ['Initialization Mode', 'Pre-operational Mode', 'Operational (gw inactive)', 'Operational (gw active)', 'Fault mode'],
    Ambos: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode']
};
const defaultComponents = ['HMI', 'ECI', 'Ambos'];

// Global variables
let reqCounter = {
    level1: 0,
    level2: 0
};
let allRequirements = [];

// --- DOM Elements Cache ---
let domElements = {};

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
    
    // Tab elements
    domElements.configTab = document.getElementById('configTab');
    domElements.createTab = document.getElementById('createTab');
    domElements.listTab = document.getElementById('listTab');
    domElements.guidelinesTab = document.getElementById('guidelinesTab');
    domElements.configContent = document.getElementById('configContent');
    domElements.createContent = document.getElementById('createContent');
    domElements.listContent = document.getElementById('listContent');
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

// --- Configuration Functions ---
function loadConfig() {
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            allFunctions.length = 0;
            allVariables.length = 0;
            allComponents.length = 0;
            allFunctions.push(...(config.functions || defaultFunctions));
            allVariables.push(...(config.variables || defaultVariables));
            allComponents.push(...(config.components || defaultComponents));
            modes = config.modes || JSON.parse(JSON.stringify(defaultModes));
        } catch (error) {
            console.error('Error loading config:', error);
            resetToDefaults();
        }
    } else {
        resetToDefaults();
    }
}

function saveConfig() {
    const config = {
        functions: [...allFunctions],
        variables: [...allVariables],
        components: [...allComponents],
        modes: JSON.parse(JSON.stringify(modes))
    };
    localStorage.setItem('systemConfig', JSON.stringify(config));
}

function resetToDefaults() {
    allFunctions.length = 0;
    allVariables.length = 0;
    allComponents.length = 0;
    allFunctions.push(...defaultFunctions);
    allVariables.push(...defaultVariables);
    allComponents.push(...defaultComponents);
    modes = JSON.parse(JSON.stringify(defaultModes));
    saveConfig();
    renderConfigLists();
    updateSelects();
}

// --- Component Management Functions ---
function addFunction() {
    const newFunction = domElements.newFunctionInput.value.trim();
    if (newFunction && !allFunctions.includes(newFunction)) {
        allFunctions.push(newFunction);
        domElements.newFunctionInput.value = '';
        saveConfig();
        renderConfigLists();
        updateSelects();
        showToast('Función añadida exitosamente', 'success');
    }
}

function deleteFunction(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta función?')) {
        allFunctions.splice(index, 1);
        saveConfig();
        renderConfigLists();
        updateSelects();
        showToast('Función eliminada', 'info');
    }
}

function addVariable() {
    const newVariable = domElements.newVariableInput.value.trim();
    if (newVariable && !allVariables.includes(newVariable)) {
        allVariables.push(newVariable);
        domElements.newVariableInput.value = '';
        saveConfig();
        renderConfigLists();
        updateSelects();
        showToast('Variable añadida exitosamente', 'success');
    }
}

function deleteVariable(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta variable?')) {
        allVariables.splice(index, 1);
        saveConfig();
        renderConfigLists();
        updateSelects();
        showToast('Variable eliminada', 'info');
    }
}

function addComponent() {
    const newComponent = domElements.newComponentInput.value.trim();
    if (newComponent && !allComponents.includes(newComponent)) {
        allComponents.push(newComponent);
        modes[newComponent] = ['Default Mode'];
        domElements.newComponentInput.value = '';
        saveConfig();
        renderConfigLists();
        updateSelects();
        showToast('Componente añadido exitosamente', 'success');
    }
}

function deleteComponent(componentName) {
    if (confirm(`¿Estás seguro de que quieres eliminar el componente "${componentName}" y todos sus modos?`)) {
        const index = allComponents.indexOf(componentName);
        if (index > -1) {
            allComponents.splice(index, 1);
            delete modes[componentName];
            saveConfig();
            renderConfigLists();
            updateSelects();
            showToast('Componente eliminado', 'info');
        }
    }
}

function addModeToComponent(componentName) {
    const input = document.getElementById(`newMode_${componentName.replace(/\s+/g, '_')}`);
    const newMode = input.value.trim();
    if (newMode && !modes[componentName].includes(newMode)) {
        modes[componentName].push(newMode);
        input.value = '';
        saveConfig();
        renderConfigLists();
        updateModeOptions();
        showToast('Modo añadido exitosamente', 'success');
    }
}

function deleteModeFromComponent(componentName, modeIndex) {
    if (confirm('¿Estás seguro de que quieres eliminar este modo?')) {
        modes[componentName].splice(modeIndex, 1);
        saveConfig();
        renderConfigLists();
        updateModeOptions();
        showToast('Modo eliminado', 'info');
    }
}

// --- UI Rendering Functions ---
function renderConfigLists() {
    if (!domElements.functionsList) return;
    
    // Render functions list
    domElements.functionsList.innerHTML = '';
    allFunctions.forEach((func, index) => {
        const item = document.createElement('div');
        item.className = 'flex justify-between items-center p-2 bg-gray-50 rounded border';
        item.innerHTML = `
            <span class="text-sm">${func}</span>
            <button onclick="deleteFunction(${index})" class="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50">
                Eliminar
            </button>
        `;
        domElements.functionsList.appendChild(item);
    });

    // Render variables list
    if (domElements.variablesList) {
        domElements.variablesList.innerHTML = '';
        allVariables.forEach((variable, index) => {
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center p-2 bg-gray-50 rounded border';
            item.innerHTML = `
                <span class="text-sm">${variable}</span>
                <button onclick="deleteVariable(${index})" class="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50">
                    Eliminar
                </button>
            `;
            domElements.variablesList.appendChild(item);
        });
    }

    // Render components and their modes
    if (domElements.componentsList) {
        domElements.componentsList.innerHTML = '';
        allComponents.forEach((component) => {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'border rounded-lg p-4 bg-white';
            
            const componentModes = modes[component] || [];
            const safeComponentId = component.replace(/\s+/g, '_');
            
            componentDiv.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h6 class="font-semibold text-lg text-gray-800">${component}</h6>
                    <button onclick="deleteComponent('${component}')" class="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-300 hover:border-red-500 hover:bg-red-50">
                        Eliminar Componente
                    </button>
                </div>
                
                <div class="mb-3">
                    <div class="flex gap-2 mb-2">
                        <input type="text" id="newMode_${safeComponentId}" placeholder="Nuevo modo..." class="flex-1 p-2 text-sm border rounded">
                        <button onclick="addModeToComponent('${component}')" class="btn btn-primary text-sm px-3 py-1">Añadir Modo</button>
                    </div>
                </div>
                
                <div class="space-y-1">
                    <h7 class="text-sm font-medium text-gray-600">Modos disponibles:</h7>
                    <div id="modes_${safeComponentId}" class="space-y-1 max-h-32 overflow-y-auto">
                        ${componentModes.map((mode, index) => `
                            <div class="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                <span>${mode}</span>
                                <button onclick="deleteModeFromComponent('${component}', ${index})" class="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-100">
                                    Eliminar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            domElements.componentsList.appendChild(componentDiv);
        });
    }

    // Update previews
    if (domElements.functionsPreview) {
        domElements.functionsPreview.textContent = allFunctions.join(', ');
    }
    if (domElements.variablesPreview) {
        domElements.variablesPreview.textContent = allVariables.join(', ');
    }
}

// --- Utility Functions ---
function populateSelect(selectElement, options) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

function updateSelects() {
    // Store current selections
    const currentFunction = domElements.functionSelect?.value;
    const currentVariable = domElements.variableSelect?.value;
    const currentComponent = domElements.componentSelect?.value;
    
    // Update function select
    populateSelect(domElements.functionSelect, allFunctions);
    if (allFunctions.includes(currentFunction)) {
        domElements.functionSelect.value = currentFunction;
    }
    
    // Update variable select
    populateSelect(domElements.variableSelect, allVariables);
    if (allVariables.includes(currentVariable)) {
        domElements.variableSelect.value = currentVariable;
    }
    
    // Update component select
    populateSelect(domElements.componentSelect, allComponents);
    if (allComponents.includes(currentComponent)) {
        domElements.componentSelect.value = currentComponent;
    }
    
    updateModeOptions();
    updatePreview();
}

function updateComponentOptions() {
    populateSelect(domElements.componentSelect, allComponents);
    updateModeOptions();
}

function updateModeOptions() {
    if (!domElements.componentSelect || !domElements.modeSelect) return;
    
    const selectedComponent = domElements.componentSelect.value;
    const componentModes = modes[selectedComponent];
    if (componentModes) {
        populateSelect(domElements.modeSelect, componentModes);
    } else {
        domElements.modeSelect.innerHTML = '<option>Seleccione...</option>';
    }
    updatePreview();
}

function updatePreview() {
    if (!domElements.outputId) return;
    
    // Calculate the preview ID based on current selections
    const parentId = domElements.parentRequirementSelect?.value;
    let previewId;
    
    if (parentId) {
        // Level 2 requirement
        const childrenCount = allRequirements.filter(req => req.parentId === parentId).length;
        const parentNumber = parentId.replace('R', ''); // Extract parent number
        previewId = `R${parentNumber}-${childrenCount}`;
    } else {
        // Level 1 requirement
        previewId = `R${reqCounter.level1}`;
    }
    
    domElements.outputId.textContent = previewId;
    
    // Add parent info if this is a sub-requirement
    if (parentId) {
        const parentReq = allRequirements.find(req => req.id === parentId);
        if (parentReq) {
            domElements.outputId.innerHTML = `${previewId} <span class="text-purple-400 text-sm">(sub-req de ${parentId})</span>`;
        }
    }
    
    const displayComponent = domElements.componentSelect?.value === 'Ambos' ? 'HMI, ECI' : domElements.componentSelect?.value || 'N/A';
    domElements.outputComponent.textContent = displayComponent;
    domElements.outputFunction.textContent = domElements.functionSelect?.value || 'N/A';
    domElements.outputVariable.textContent = domElements.variableSelect?.value || 'N/A';
    
    const mode = domElements.modeSelect?.value || '[MODO]';
    const condition = domElements.conditionInput?.value || '-';
    const behavior = domElements.behaviorInput?.value || '[COMPORTAMIENTO]';
    
    domElements.outputLogic.innerHTML = `
        <span class="text-yellow-400">SI</span> modo es <span class="text-pink-400 font-semibold">${mode}</span><br>
        <span class="text-yellow-400">Y</span> condición es <span class="text-pink-400 font-semibold">${condition}</span><br>
        <span class="text-yellow-400">ENTONCES</span> <span class="text-cyan-400">${behavior}</span>
    `;

    domElements.outputLatency.textContent = domElements.latencyInput?.value || '[LATENCIA]';
    domElements.outputJustification.textContent = domElements.justificationInput?.value || '[JUSTIFICACIÓN]';
}

// --- Toast Notification System ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const colors = {
        success: 'border-l-4 border-green-500 bg-green-50',
        error: 'border-l-4 border-red-500 bg-red-50',
        info: 'border-l-4 border-blue-500 bg-blue-50',
        warning: 'border-l-4 border-yellow-500 bg-yellow-50'
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

// --- Tab Navigation Functions ---
function switchTab(event, tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to the clicked button
    event.target.classList.add('active');
}

function initializeTabs() {
    console.log('Initializing tabs...');
    
    const configTabBtn = document.getElementById('configTab');
    const createTabBtn = document.getElementById('createTab');
    const listTabBtn = document.getElementById('listTab');
    const guidelinesTabBtn = document.getElementById('guidelinesTab');
    
    if (configTabBtn) configTabBtn.addEventListener('click', (e) => switchTab(e, 'configContent'));
    if (createTabBtn) createTabBtn.addEventListener('click', (e) => switchTab(e, 'createContent'));
    if (listTabBtn) listTabBtn.addEventListener('click', (e) => switchTab(e, 'listContent'));
    if (guidelinesTabBtn) guidelinesTabBtn.addEventListener('click', (e) => switchTab(e, 'guidelinesContent'));
    
    console.log('Tabs initialized');
}

function loadInitialExample() {
    if (domElements.functionSelect) domElements.functionSelect.value = allFunctions[0] || '';
    if (domElements.variableSelect) domElements.variableSelect.value = allVariables[0] || '';
    updateComponentOptions();
    if (domElements.componentSelect) domElements.componentSelect.value = allComponents[0] || '';
    updateModeOptions();
    if (domElements.modeSelect && modes[allComponents[0]]) {
        domElements.modeSelect.value = modes[allComponents[0]][0] || '';
    }
    if (domElements.conditionInput) domElements.conditionInput.value = '';
    if (domElements.behaviorInput) domElements.behaviorInput.value = 'SET LED = Verde, fijo';
    if (domElements.latencyInput) domElements.latencyInput.value = '100 ms';
    if (domElements.justificationInput) domElements.justificationInput.value = 'Señalizar que el módulo está funcionando correctamente y participando activamente en la red.';
    updatePreview();
}

// --- Main Initialize Function ---
function initialize() {
    try {
        console.log('Starting application initialization...');
        
        // Initialize DOM elements first
        initializeDOMElements();
        console.log('DOM elements initialized');
        
        // Initialize tabs
        initializeTabs();
        
        // Load configuration and data
        loadConfig();
        console.log('Configuration loaded');
        
        // Populate selects with initial data
        updateSelects();
        console.log('Selects updated');
        
        // Render configuration lists
        renderConfigLists();
        console.log('Config lists rendered');
        
        // Load saved requirements
        loadFromLocalStorage();
        console.log('Requirements loaded from localStorage');
        
        // Update parent requirement options
        if (typeof updateParentRequirementOptions === 'function') {
            updateParentRequirementOptions();
            console.log('Parent requirement options updated');
        }
        
        // Load initial example
        loadInitialExample();
        console.log('Initial example loaded');
        
        // Update preview
        updatePreview();
        console.log('Preview updated');
        
        // Add event listeners for all buttons and inputs
        if (domElements.addReqBtn) {
            domElements.addReqBtn.addEventListener('click', addRequirement);
            console.log('Add requirement button listener attached');
        }
        
        if (domElements.clearAllBtn) {
            domElements.clearAllBtn.addEventListener('click', clearAllRequirements);
            console.log('Clear all button listener attached');
        }
        
        if (domElements.exportCsvBtn) {
            domElements.exportCsvBtn.addEventListener('click', exportToCSV);
            console.log('Export CSV button listener attached');
        }
        
        if (domElements.exportLatexBtn) {
            domElements.exportLatexBtn.addEventListener('click', exportToLaTeX);
            console.log('Export LaTeX button listener attached');
        }
        
        // Configuration event listeners
        if (domElements.addFunctionBtn) {
            domElements.addFunctionBtn.addEventListener('click', addFunction);
            console.log('Add function button listener attached');
        }
        
        if (domElements.addVariableBtn) {
            domElements.addVariableBtn.addEventListener('click', addVariable);
            console.log('Add variable button listener attached');
        }
        
        if (domElements.addComponentBtn) {
            domElements.addComponentBtn.addEventListener('click', addComponent);
            console.log('Add component button listener attached');
        }
        
        if (domElements.resetConfigBtn) {
            domElements.resetConfigBtn.addEventListener('click', resetToDefaults);
            console.log('Reset config button listener attached');
        }
        
        // Input event listeners for real-time preview updates
        if (domElements.functionSelect) {
            domElements.functionSelect.addEventListener('change', updatePreview);
        }
        if (domElements.variableSelect) {
            domElements.variableSelect.addEventListener('change', updatePreview);
        }
        if (domElements.componentSelect) {
            domElements.componentSelect.addEventListener('change', updateModeOptions);
        }
        if (domElements.modeSelect) {
            domElements.modeSelect.addEventListener('change', updatePreview);
        }
        if (domElements.parentRequirementSelect) {
            domElements.parentRequirementSelect.addEventListener('change', updatePreview);
        }
        if (domElements.conditionInput) {
            domElements.conditionInput.addEventListener('input', updatePreview);
        }
        if (domElements.behaviorInput) {
            domElements.behaviorInput.addEventListener('input', updatePreview);
        }
        if (domElements.latencyInput) {
            domElements.latencyInput.addEventListener('input', updatePreview);
        }
        if (domElements.toleranceInput) {
            domElements.toleranceInput.addEventListener('input', updatePreview);
        }
        if (domElements.justificationInput) {
            domElements.justificationInput.addEventListener('input', updatePreview);
        }
        
        // Enter key handlers for adding functions and variables
        if (domElements.newFunctionInput) {
            domElements.newFunctionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addFunction();
                }
            });
        }
        if (domElements.newVariableInput) {
            domElements.newVariableInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addVariable();
                }
            });
        }
        if (domElements.newComponentInput) {
            domElements.newComponentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addComponent();
                }
            });
        }
        
        // Add event listeners for project import/export
        if (domElements.exportProjectBtn) {
            domElements.exportProjectBtn.addEventListener('click', exportProject);
            console.log('Export project button listener attached');
        }
        if (domElements.importProjectBtn) {
            domElements.importProjectBtn.addEventListener('click', importProject);
            console.log('Import project button listener attached');
        }
        if (domElements.importFileInput) {
            domElements.importFileInput.addEventListener('change', handleFileImport);
            console.log('Import file input listener attached');
        }
        
        console.log('Application initialized successfully');
        showToast('Aplicación inicializada correctamente', 'success');
          } catch (error) {
        console.error('Error during initialization:', error);
        showToast('Error durante la inicialización: ' + error.message, 'error');
    }
}

// Make initialize function globally available immediately
window.initialize = initialize;

// --- Initialize when DOM is ready ---
document.addEventListener('DOMContentLoaded', initialize);

// Make functions globally available for onclick handlers
window.deleteFunction = deleteFunction;
window.deleteVariable = deleteVariable;
window.deleteComponent = deleteComponent;
window.addModeToComponent = addModeToComponent;
window.deleteModeFromComponent = deleteModeFromComponent;
window.moveRequirementUp = moveRequirementUp;
window.moveRequirementDown = moveRequirementDown;
window.moveRequirementToTop = moveRequirementToTop;
window.moveRequirementToBottom = moveRequirementToBottom;
window.deleteRequirement = deleteRequirement;
