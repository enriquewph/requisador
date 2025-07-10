/**
 * Global State and Data Management
 * Centralized storage for all application state and default values
 */

// --- Global State Variables ---
const allRequirements = [];
const allFunctions = [];
const allVariables = [];
const allComponents = [];

// New many-to-many relationship structure
const allModes = [];
const modeComponentAssociations = []; // Array of { mode: 'ModeName', components: ['Comp1', 'Comp2'] }

// Requirements counter for ID generation
const reqCounter = {
  level1: 1,
  level2: 0,
};

// --- Default Values for Reset Functionality ---
// Note: Default values are now centralized in AppConfig.defaults

// --- State Management Functions ---

/**
 * Reset all data to default values
 */
function resetGlobalState() {
  allRequirements.length = 0;
  allFunctions.length = 0;
  allVariables.length = 0;
  allComponents.length = 0;
  allModes.length = 0;
  modeComponentAssociations.length = 0;

  // Use AppConfig.defaults if available, otherwise use fallback values
  const defaults = window.AppConfig?.defaults || {
    functions: ['Runtime Manager', 'Config Manager'],
    variables: ['Indicador de estado'],
    components: ['HMI', 'ECI'],
    modes: ['Initialization Mode', 'Operational Mode'],
    modeAssociations: [
      { mode: 'Initialization Mode', components: ['HMI', 'ECI'] },
      { mode: 'Operational Mode', components: ['HMI'] }
    ]
  };

  allFunctions.push(...defaults.functions);
  allVariables.push(...defaults.variables);
  allComponents.push(...defaults.components);
  allModes.push(...defaults.modes);
  modeComponentAssociations.push(...defaults.modeAssociations.map(assoc => ({ ...assoc, components: [...assoc.components] })));

  // Reset counter
  reqCounter.level1 = 1;
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
    modes: [...allModes],
    modeComponentAssociations: modeComponentAssociations.map(assoc => ({ ...assoc, components: [...assoc.components] })),
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
  allModes.length = 0;
  modeComponentAssociations.length = 0;

  // Load data
  if (snapshot.requirements) {allRequirements.push(...snapshot.requirements);}
  if (snapshot.functions) {allFunctions.push(...snapshot.functions);}
  if (snapshot.variables) {allVariables.push(...snapshot.variables);}
  if (snapshot.components) {allComponents.push(...snapshot.components);}
  if (snapshot.modes) {allModes.push(...snapshot.modes);}
  if (snapshot.modeComponentAssociations) {
    modeComponentAssociations.push(...snapshot.modeComponentAssociations.map(assoc => ({ ...assoc, components: [...assoc.components] })));
  }

  // Load counter
  if (snapshot.counter) {
    reqCounter.level1 = snapshot.counter.level1 || 1;
    reqCounter.level2 = snapshot.counter.level2 || 0;
  }
}

// --- Export globals for use in other modules ---
window.AppGlobals = {
  // State object for new modules
  state: {
    get allRequirements() { return allRequirements; },
    get allFunctions() { return allFunctions; },
    get allVariables() { return allVariables; },
    get allComponents() { return allComponents; },
    get allModes() { return allModes; },
    get modeComponentAssociations() { return modeComponentAssociations; },
    get reqCounter() { return reqCounter; }
  },

  // Default values (referencing centralized config)
  get defaults() {
    return window.AppConfig?.defaults || {
      functions: ['Runtime Manager', 'Config Manager'],
      variables: ['Indicador de estado'],
      components: ['HMI', 'ECI'],
      modes: ['Initialization Mode', 'Operational Mode'],
      modeAssociations: [
        { mode: 'Initialization Mode', components: ['HMI', 'ECI'] },
        { mode: 'Operational Mode', components: ['HMI'] }
      ]
    };
  },

  // State management
  resetGlobalState,
  getStateSnapshot,
  loadStateFromSnapshot,

  // Mode-Component relationship utilities
  addModeComponentAssociation(mode, selectedComponents) {
    // Remove existing association for this mode
    const existingIndex = modeComponentAssociations.findIndex(assoc => assoc.mode === mode);
    if (existingIndex !== -1) {
      modeComponentAssociations.splice(existingIndex, 1);
    }
    
    // Add new association if components are selected
    if (selectedComponents && selectedComponents.length > 0) {
      modeComponentAssociations.push({
        mode: mode,
        components: [...selectedComponents]
      });
    }
  },

  removeModeComponentAssociation(mode) {
    const index = modeComponentAssociations.findIndex(assoc => assoc.mode === mode);
    if (index !== -1) {
      modeComponentAssociations.splice(index, 1);
    }
  },

  removeComponentFromAllModes(componentToRemove) {
    // Remove component from all mode associations
    modeComponentAssociations.forEach(assoc => {
      assoc.components = assoc.components.filter(comp => comp !== componentToRemove);
    });
    
    // Remove associations that have no components left
    for (let i = modeComponentAssociations.length - 1; i >= 0; i--) {
      if (modeComponentAssociations[i].components.length === 0) {
        // Also remove the mode itself if it has no components
        const modeName = modeComponentAssociations[i].mode;
        const modeIndex = allModes.indexOf(modeName);
        if (modeIndex !== -1) {
          allModes.splice(modeIndex, 1);
        }
        modeComponentAssociations.splice(i, 1);
      }
    }
  },

  getComponentsForMode(mode) {
    const association = modeComponentAssociations.find(assoc => assoc.mode === mode);
    return association ? [...association.components] : [];
  },

  getModesForComponent(component) {
    return modeComponentAssociations
      .filter(assoc => assoc.components.includes(component))
      .map(assoc => assoc.mode);
  },

  // Global project import/export functions
  exportProject() {
    console.log('🔧 AppGlobals: Exporting project...');

    try {
      const projectData = {
        version: AppVersion ? AppVersion.getProjectVersion() : '1.0',
        exportDate: new Date().toISOString(),
        configuration: {
          functions: [...allFunctions],
          variables: [...allVariables],
          components: [...allComponents],
          modes: [...allModes],
          modeComponentAssociations: modeComponentAssociations.map(assoc => ({ ...assoc, components: [...assoc.components] }))
        },
        requirements: [...allRequirements],
        counters: { ...reqCounter }
      };

      // Generate filename with timestamp
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const filename = `requisitos_proyecto_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;

      const jsonContent = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.DOMUtils && window.DOMUtils.showToast) {
          window.DOMUtils.showToast('Proyecto exportado correctamente.', 'success');
        }
        console.log('✅ AppGlobals: Project exported successfully:', filename);
      } else {
        const error = 'Tu navegador no soporta la descarga de archivos.';
        console.error('❌ AppGlobals: Export failed:', error);
        if (window.DOMUtils && window.DOMUtils.showToast) {
          window.DOMUtils.showToast(error, 'error');
        }
      }
    } catch (error) {
      console.error('❌ AppGlobals: Error exporting project:', error);
      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast('Error al exportar proyecto: ' + error.message, 'error');
      }
    }
  },

  importProject() {
    console.log('🔧 AppGlobals: Import project triggered');

    // Find the file input
    let fileInput = document.getElementById('importFileInput');
    if (!fileInput) {
      fileInput = document.getElementById('projectFileInput');
    }

    if (fileInput) {
      console.log('✅ AppGlobals: File input found, triggering click');
      fileInput.click();
    } else {
      console.error('❌ AppGlobals: No file input element found');
      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast('Elemento de selección de archivo no encontrado.', 'error');
      }
    }
  },

  handleFileImport(event) {
    console.log('🔧 AppGlobals: handleFileImport called', event);

    const file = event.target.files[0];
    console.log('📁 AppGlobals: Selected file:', file);

    if (!file) {
      console.log('❌ AppGlobals: No file selected');
      return;
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.log('❌ AppGlobals: Invalid file type:', file.type, file.name);
      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast('Por favor selecciona un archivo JSON válido.', 'error');
      }
      event.target.value = '';
      return;
    }

    console.log('📖 AppGlobals: Reading file...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('✅ AppGlobals: File read successfully, parsing JSON...');
        const projectData = JSON.parse(e.target.result);
        console.log('📊 AppGlobals: Project data parsed:', projectData);
        this.loadProjectData(projectData);
      } catch (error) {
        console.error('❌ AppGlobals: Error parsing JSON:', error);
        if (window.DOMUtils && window.DOMUtils.showToast) {
          window.DOMUtils.showToast('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.', 'error');
        }
      } finally {
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      console.error('❌ AppGlobals: Error reading file');
      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast('Error al leer el archivo.', 'error');
      }
      event.target.value = '';
    };

    reader.readAsText(file);
  },

  loadProjectData(projectData) {
    console.log('🚀 AppGlobals: loadProjectData called with:', projectData);

    try {
      // Validate project data structure
      if (!projectData.configuration || !projectData.requirements) {
        throw new Error('Estructura de proyecto inválida');
      }

      console.log('✅ AppGlobals: Project data structure is valid');

      // Confirm import
      const confirmImport = confirm(
        '¿Estás seguro de que quieres importar este proyecto? Esto reemplazará toda la configuración y requisitos actuales.\n\n' +
        'El proyecto contiene:\n' +
        `- ${projectData.requirements.length} requisitos\n` +
        `- ${projectData.configuration.functions?.length || 0} funciones\n` +
        `- ${projectData.configuration.variables?.length || 0} variables\n` +
        `- ${projectData.configuration.components?.length || 0} componentes`
      );

      console.log('🤔 AppGlobals: User confirmation result:', confirmImport);

      if (!confirmImport) {
        console.log('❌ AppGlobals: User cancelled import');
        return;
      }

      // Load configuration
      if (projectData.configuration.functions) {
        allFunctions.length = 0;
        allFunctions.push(...projectData.configuration.functions);
      }

      if (projectData.configuration.variables) {
        allVariables.length = 0;
        allVariables.push(...projectData.configuration.variables);
      }

      if (projectData.configuration.components) {
        allComponents.length = 0;
        allComponents.push(...projectData.configuration.components);
      }

      if (projectData.configuration.modes) {
        allModes.length = 0;
        allModes.push(...projectData.configuration.modes);
      }

      if (projectData.configuration.modeComponentAssociations) {
        modeComponentAssociations.length = 0;
        modeComponentAssociations.push(...projectData.configuration.modeComponentAssociations.map(assoc => ({ ...assoc, components: [...assoc.components] })));
      }

      // Load requirements
      allRequirements.length = 0;
      allRequirements.push(...projectData.requirements);

      // Load counters
      if (projectData.counters) {
        Object.assign(reqCounter, projectData.counters);
      }

      // Update UI - call all tab updates
      setTimeout(() => {
        // Update all tabs if their render functions exist
        if (typeof window.ConfigTab !== 'undefined' && window.ConfigTab.renderAllLists) {
          window.ConfigTab.renderAllLists();
        }
        if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
          window.ListTab.renderRequirementsList();
        }
        if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
          window.TreeTab.renderTreeView();
        }
        if (typeof window.CreateTab !== 'undefined' && window.CreateTab.updateParentRequirementOptions) {
          window.CreateTab.updateParentRequirementOptions();
        }

        // Update DOM selects if function exists
        if (window.DOMUtils && window.DOMUtils.updateSelects) {
          window.DOMUtils.updateSelects();
        }

        // Save to localStorage if Storage module exists
        if (window.Storage) {
          if (window.Storage.saveConfig) window.Storage.saveConfig();
          if (window.Storage.saveRequirements) window.Storage.saveRequirements();
        }

        // Set data updated flag
        window.dataUpdated = true;
      }, 100);

      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast(
          `Proyecto importado correctamente. ${projectData.requirements.length} requisitos cargados.`,
          'success'
        );
      }

      console.log('✅ AppGlobals: Project imported successfully');

    } catch (error) {
      console.error('❌ AppGlobals: Error importing project:', error);
      if (window.DOMUtils && window.DOMUtils.showToast) {
        window.DOMUtils.showToast('Error al importar el proyecto: ' + error.message, 'error');
      }
    }
  }
};

console.log('✅ Global state module loaded');
