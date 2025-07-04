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
let reqCounter = 0;
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
    
    domElements.outputId.textContent = `R${reqCounter}`;
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

// Include all other functions from the original script...
// (I'll continue with the rest of the functions in the next part due to length)

// --- Load the rest of the application script ---
// This file will be split into multiple modules for better organization
