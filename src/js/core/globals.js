/**
 * Global State and Data Management
 * Centralized storage for all application state and default values
 */

// --- Global State Variables ---
const allRequirements = [];
const allFunctions = [];
const allVariables = [];
const allComponents = [];

// Modes configuration for each component
const modes = {
  HMI: [
    'Initialization Mode',
    'Pre-operational Mode',
    'Operational Mode',
    'Fault Mode',
    'Stopped Mode',
  ],
  ECI: [
    'Initialization Mode',
    'Pre-operational Mode',
    'Operational (gw inactive)',
    'Operational (gw active)',
    'Fault mode',
  ],
  Ambos: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode'],
};

// Requirements counter for ID generation
const reqCounter = {
  level1: 0,
  level2: 0,
};

// --- Default Values for Reset Functionality ---
const defaultFunctions = [
  'Runtime Manager',
  'Config Manager',
  'CAN NMT Slave',
  'CAN NMT Master',
  'CAN-GPIO Translator',
  'CAN-ETH Translator',
  'CAN Driver',
  'GPIO Driver',
  'ETH Driver',
];

const defaultVariables = [
  'Indicador de estado',
  'Comandos a Red CAN',
  'Estado de salidas fisicas',
  'Reportes a Proc. Robot',
  'Comandos de gestión de red',
  'Mensajes de sincronización',
  'Respuestas a Terminal de Ingeniería',
];

const defaultModes = {
  HMI: [
    'Initialization Mode',
    'Pre-operational Mode',
    'Operational Mode',
    'Fault Mode',
    'Stopped Mode',
  ],
  ECI: [
    'Initialization Mode',
    'Pre-operational Mode',
    'Operational (gw inactive)',
    'Operational (gw active)',
    'Fault mode',
  ],
  Ambos: ['Initialization Mode', 'Pre-operational Mode', 'Operational Mode', 'Fault Mode'],
};

const defaultComponents = ['HMI', 'ECI', 'Ambos'];

// --- State Management Functions ---

/**
 * Reset all data to default values
 */
function resetGlobalState() {
  allRequirements.length = 0;
  allFunctions.length = 0;
  allVariables.length = 0;
  allComponents.length = 0;

  allFunctions.push(...defaultFunctions);
  allVariables.push(...defaultVariables);
  allComponents.push(...defaultComponents);

  // Clear and reset modes
  Object.keys(modes).forEach(key => delete modes[key]);
  Object.assign(modes, JSON.parse(JSON.stringify(defaultModes)));

  // Reset counter
  reqCounter.level1 = 0;
  reqCounter.level2 = 0;
}

/**
 * Get current state snapshot for export
 */
function getStateSnapshot() {
  return {
    requirements: [...allRequirements],
    functions: [...allFunctions],
    variables: [...allVariables],
    components: [...allComponents],
    modes: JSON.parse(JSON.stringify(modes)),
    counter: { ...reqCounter }
  };
}

/**
 * Load state from snapshot (for import)
 */
function loadStateFromSnapshot(snapshot) {
  // Clear arrays
  allRequirements.length = 0;
  allFunctions.length = 0;
  allVariables.length = 0;
  allComponents.length = 0;

  // Load data
  if (snapshot.requirements) {allRequirements.push(...snapshot.requirements);}
  if (snapshot.functions) {allFunctions.push(...snapshot.functions);}
  if (snapshot.variables) {allVariables.push(...snapshot.variables);}
  if (snapshot.components) {allComponents.push(...snapshot.components);}

  // Load modes
  if (snapshot.modes) {
    Object.keys(modes).forEach(key => delete modes[key]);
    Object.assign(modes, snapshot.modes);
  }

  // Load counter
  if (snapshot.counter) {
    reqCounter.level1 = snapshot.counter.level1 || 0;
    reqCounter.level2 = snapshot.counter.level2 || 0;
  }
}

// --- Export globals for use in other modules ---
window.AppGlobals = {
  // Direct access to state variables (legacy compatibility)
  get allRequirements() { return allRequirements; },
  get allFunctions() { return allFunctions; },
  get allVariables() { return allVariables; },
  get allComponents() { return allComponents; },
  get modes() { return modes; },
  get reqCounter() { return reqCounter; },

  // State object for new modules
  state: {
    get allRequirements() { return allRequirements; },
    get allFunctions() { return allFunctions; },
    get allVariables() { return allVariables; },
    get allComponents() { return allComponents; },
    get modes() { return modes; },
    get reqCounter() { return reqCounter; }
  },

  // Default values
  defaults: {
    functions: defaultFunctions,
    variables: defaultVariables,
    modes: defaultModes,
    components: defaultComponents
  },

  // Legacy default access
  defaultFunctions,
  defaultVariables,
  defaultModes,
  defaultComponents,

  // State management
  resetGlobalState,
  getStateSnapshot,
  loadStateFromSnapshot
};

// For backward compatibility, also expose directly to window
window.allRequirements = allRequirements;
window.allFunctions = allFunctions;
window.allVariables = allVariables;
window.allComponents = allComponents;
window.modes = modes;
window.reqCounter = reqCounter;
window.defaultFunctions = defaultFunctions;
window.defaultVariables = defaultVariables;
window.defaultModes = defaultModes;
window.defaultComponents = defaultComponents;

console.log('✅ Global state module loaded');
