/**
 * Storage Module
 * Handles localStorage operations for configuration and requirements
 */

/* global AppGlobals */

/**
 * Save configuration to localStorage
 */
function saveConfig() {
  const config = {
    functions: [...AppGlobals.allFunctions],
    variables: [...AppGlobals.allVariables],
    components: [...AppGlobals.allComponents],
    modes: JSON.parse(JSON.stringify(AppGlobals.modes)),
  };
  localStorage.setItem('systemConfig', JSON.stringify(config));
}

/**
 * Load configuration from localStorage
 */
function loadConfig() {
  const savedConfig = localStorage.getItem('systemConfig');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      AppGlobals.allFunctions.length = 0;
      AppGlobals.allVariables.length = 0;
      AppGlobals.allComponents.length = 0;
      AppGlobals.allFunctions.push(...(config.functions || AppGlobals.defaults.functions));
      AppGlobals.allVariables.push(...(config.variables || AppGlobals.defaults.variables));
      AppGlobals.allComponents.push(...(config.components || AppGlobals.defaults.components));

      // Clear and reload modes
      Object.keys(AppGlobals.modes).forEach(key => delete AppGlobals.modes[key]);
      Object.assign(AppGlobals.modes, config.modes || JSON.parse(JSON.stringify(AppGlobals.defaults.modes)));
    } catch (error) {
      console.error('Error loading config:', error);
      resetToDefaults();
    }
  } else {
    resetToDefaults();
  }
}

/**
 * Save requirements to localStorage
 */
function saveRequirements() {
  const requirementsData = {
    requirements: [...AppGlobals.allRequirements],
    counter: { ...AppGlobals.reqCounter }
  };
  localStorage.setItem('systemRequirements', JSON.stringify(requirementsData));
}

/**
 * Load requirements from localStorage
 */
function loadRequirements() {
  const savedRequirements = localStorage.getItem('systemRequirements');
  if (savedRequirements) {
    try {
      const data = JSON.parse(savedRequirements);
      AppGlobals.allRequirements.length = 0;
      AppGlobals.allRequirements.push(...(data.requirements || []));

      // Update counter
      if (data.counter) {
        AppGlobals.reqCounter.level1 = data.counter.level1 || 0;
        AppGlobals.reqCounter.level2 = data.counter.level2 || 0;
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      AppGlobals.allRequirements.length = 0;
      AppGlobals.reqCounter.level1 = 0;
      AppGlobals.reqCounter.level2 = 0;
    }
  }
}

/**
 * Reset configuration to default values
 */
function resetToDefaults() {
  AppGlobals.allFunctions.length = 0;
  AppGlobals.allVariables.length = 0;
  AppGlobals.allComponents.length = 0;
  AppGlobals.allFunctions.push(...AppGlobals.defaults.functions);
  AppGlobals.allVariables.push(...AppGlobals.defaults.variables);
  AppGlobals.allComponents.push(...AppGlobals.defaults.components);

  Object.keys(AppGlobals.modes).forEach(key => delete AppGlobals.modes[key]);
  Object.assign(AppGlobals.modes, JSON.parse(JSON.stringify(AppGlobals.defaults.modes)));

  saveConfig();
}

/**
 * Save requirements to localStorage
 */
function saveToLocalStorage() {
  const data = {
    version: '3.0',
    requirements: [...AppGlobals.allRequirements],
    counter: { ...AppGlobals.reqCounter },
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('requirementsData', JSON.stringify(data));
}

/**
 * Load requirements from localStorage
 */
function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem('requirementsData');
    if (!savedData) {
      console.log('No saved requirements data found');
      return;
    }

    console.log('Loading requirements from localStorage...');
    const data = JSON.parse(savedData);

    // Clear and repopulate the array instead of reassigning
    AppGlobals.allRequirements.length = 0;
    if (data.requirements && Array.isArray(data.requirements)) {
      AppGlobals.allRequirements.push(...data.requirements);
    }

    // Check if this is legacy data (no version field or old version)
    const isLegacyData = !data.version || data.version !== '3.0';

    // Handle legacy data format
    if (typeof data.counter === 'number' || isLegacyData) {
      console.log('Migrating data to new RN-M ID format...');
      AppGlobals.reqCounter.level1 = 0;
      AppGlobals.reqCounter.level2 = 0;

      // Update ALL requirements to new format
      AppGlobals.allRequirements.forEach((req, index) => {
        req.level = 1; // All legacy requirements become level 1
        req.parentId = null;
      });

      // Force save with new format
      if (typeof recalculateIds === 'function') {
        recalculateIds();
      }
      saveToLocalStorage();
      showToast('Datos migrados al nuevo formato RN-M de IDs', 'info');
    } else {
      const savedCounter = data.counter || { level1: 0, level2: 0 };
      AppGlobals.reqCounter.level1 = savedCounter.level1 || 0;
      AppGlobals.reqCounter.level2 = savedCounter.level2 || 0;
    }

    // Ensure ALL requirements have proper level and structure
    AppGlobals.allRequirements.forEach((req, index) => {
      // If level is missing, assume it's level 1
      if (!req.level) {
        req.level = 1;
        req.parentId = null;
      }

      // Ensure parentId is properly set
      if (req.level === 1) {
        req.parentId = null;
      } else if (req.level === 2 && !req.parentId) {
        // If it's level 2 but has no parent, convert to level 1
        req.level = 1;
        req.parentId = null;
      }
    });

    // Recalculate IDs to ensure consistency
    if (typeof recalculateIds === 'function') {
      recalculateIds();
    }
  } catch (error) {
    console.error('Error loading saved data:', error);
    // Clear the array instead of reassigning
    AppGlobals.allRequirements.length = 0;
    AppGlobals.reqCounter.level1 = 0;
    AppGlobals.reqCounter.level2 = 0;
  }
}

// --- Export functions ---
window.Storage = {
  saveConfig,
  loadConfig,
  saveRequirements,
  loadRequirements,
  resetToDefaults,
  saveToLocalStorage,
  loadFromLocalStorage
};

// For backward compatibility
window.saveConfig = saveConfig;
window.loadConfig = loadConfig;
window.saveRequirements = saveRequirements;
window.loadRequirements = loadRequirements;
window.resetToDefaults = resetToDefaults;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;

console.log('✅ Storage module loaded');
