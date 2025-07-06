/**
 * Requisador de Requisitos - Main Application Script (Refactored)
 * A comprehensive tool for creating and managing system requirements
 * Following Systems Engineering Handbook methodology
 *
 * This is the main coordination module that delegates functionality to specialized tab modules.
 */

/* global AppGlobals, DOMUtils, Storage, ConfigTab, CreateTab, ListTab, TreeTab, ExportTab */

/**
 * Main Application Object
 */
const RequisadorApp = {
  // Current active tab
  activeTab: 'config',

  /**
   * Initialize the application
   */
  init() {
    console.log('🚀 RequisadorApp: Starting application initialization...');

    try {
      // Check dependencies
      this.checkDependencies();

      // Initialize core components
      this.initializeDOMElements();
      this.loadStoredData();
      this.bindGlobalEvents();
      this.initializeTabModules();

      console.log('✅ RequisadorApp: Application initialized successfully');
    } catch (error) {
      console.error('❌ RequisadorApp: Error during initialization:', error);
      DOMUtils.showToast('Error al inicializar la aplicación: ' + error.message, 'error');
    }
  },

  /**
   * Check if all required dependencies are available
   */
  checkDependencies() {
    const dependencies = [
      { name: 'AppGlobals', obj: window.AppGlobals },
      { name: 'DOMUtils', obj: window.DOMUtils },
      { name: 'Storage', obj: window.Storage },
      { name: 'ConfigTab', obj: window.ConfigTab },
      { name: 'CreateTab', obj: window.CreateTab },
      { name: 'ListTab', obj: window.ListTab },
      { name: 'TreeTab', obj: window.TreeTab },
      { name: 'ExportTab', obj: window.ExportTab }
    ];

    const missing = dependencies.filter(dep => !dep.obj);
    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.map(d => d.name).join(', ')}`);
    }

    console.log('✅ RequisadorApp: All dependencies verified');
  },

  /**
   * Initialize DOM element references
   */
  initializeDOMElements() {
    console.log('🔧 RequisadorApp: Initializing DOM elements...');

    // Initialize DOM utils and cache elements
    DOMUtils.initializeDOMElements();

    console.log('✅ RequisadorApp: DOM elements initialized');
  },

  /**
   * Load stored data from localStorage
   */
  loadStoredData() {
    console.log('💾 RequisadorApp: Loading stored data...');

    try {
      // Load configuration and requirements
      Storage.loadConfig();
      Storage.loadRequirements();

      console.log('✅ RequisadorApp: Stored data loaded successfully');
    } catch (error) {
      console.warn('⚠️ RequisadorApp: Error loading stored data, using defaults:', error);
      AppGlobals.resetGlobalState();
    }
  },

  /**
   * Bind global event listeners
   */
  bindGlobalEvents() {
    console.log('🔗 RequisadorApp: Binding global events...');

    // About modal functionality
    this.bindAboutModalEvents();

    // Global keyboard shortcuts
    this.bindKeyboardShortcuts();

    console.log('✅ RequisadorApp: Global events bound');
  },

  /**
   * Bind about modal events
   */
  bindAboutModalEvents() {
    // About button
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => this.showAboutModal());
    }

    // Close modal events (these might be set up after modal loads)
    setTimeout(() => {
      const closeBtn = document.getElementById('closeAboutModal');
      if (closeBtn && !closeBtn.hasAttribute('data-listener-attached')) {
        closeBtn.addEventListener('click', () => this.hideAboutModal());
        closeBtn.setAttribute('data-listener-attached', 'true');
      }

      const aboutModal = document.getElementById('aboutModal');
      if (aboutModal && !aboutModal.hasAttribute('data-listener-attached')) {
        aboutModal.addEventListener('click', (e) => {
          if (e.target === aboutModal) {
            this.hideAboutModal();
          }
        });
        aboutModal.setAttribute('data-listener-attached', 'true');
      }
    }, 1000);
  },

  /**
   * Bind keyboard shortcuts
   */
  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.quickSave();
      }

      // Ctrl+N to add new requirement (when in create tab)
      if (e.ctrlKey && e.key === 'n' && this.activeTab === 'create') {
        e.preventDefault();
        if (CreateTab && CreateTab.addRequirement) {
          CreateTab.addRequirement();
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        this.hideAboutModal();
      }
    });
  },

  /**
   * Initialize all tab modules
   */
  initializeTabModules() {
    console.log('📑 RequisadorApp: Initializing tab modules...');

    // Initialize all tab modules
    if (ConfigTab && ConfigTab.init) {ConfigTab.init();}
    if (CreateTab && CreateTab.init) {CreateTab.init();}
    if (ListTab && ListTab.init) {ListTab.init();}
    if (TreeTab && TreeTab.init) {TreeTab.init();}
    if (ExportTab && ExportTab.init) {ExportTab.init();}

    console.log('✅ RequisadorApp: Tab modules initialized');
  },

  /**
   * Handle tab switching
   */
  switchTab(tabName) {
    console.log(`🔄 RequisadorApp: Switching to tab: ${tabName}`);

    this.activeTab = tabName;

    // Update select options when switching tabs
    DOMUtils.updateSelects();

    // Tab-specific initialization
    switch (tabName) {
    case 'config':
      if (ConfigTab && ConfigTab.renderAllLists) {
        ConfigTab.renderAllLists();
      }
      break;
    case 'create':
      if (CreateTab && CreateTab.updateParentRequirementOptions) {
        CreateTab.updateParentRequirementOptions();
      }
      if (CreateTab && CreateTab.updatePreview) {
        CreateTab.updatePreview();
      }
      break;
    case 'list':
      if (ListTab && ListTab.renderRequirementsList) {
        ListTab.renderRequirementsList();
      }
      break;
    case 'tree':
      if (TreeTab && TreeTab.renderTreeView) {
        TreeTab.renderTreeView();
      }
      break;
    case 'export':
      // Export tab doesn't need special initialization
      break;
    }
  },

  /**
   * Show about modal
   */
  showAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal) {
      aboutModal.classList.remove('hidden');
    } else {
      console.error('About modal element not found');
    }
  },

  /**
   * Hide about modal
   */
  hideAboutModal() {
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal) {
      aboutModal.classList.add('hidden');
    }
  },

  /**
   * Quick save functionality
   */
  quickSave() {
    try {
      Storage.saveConfig();
      Storage.saveRequirements();
      DOMUtils.showToast('Datos guardados automáticamente', 'success');
    } catch (error) {
      console.error('Error during quick save:', error);
      DOMUtils.showToast('Error al guardar los datos', 'error');
    }
  },

  /**
   * Global UI update (called when switching tabs or after major changes)
   */
  updateUI() {
    console.log('🎨 RequisadorApp: Updating UI...');

    // Update selects
    DOMUtils.updateSelects();

    // Update current tab view
    this.switchTab(this.activeTab);

    console.log('✅ RequisadorApp: UI updated');
  },

  /**
   * Reinitialize DOM elements (called after dynamic content loading)
   */
  reinitializeDOMElements() {
    console.log('🔄 RequisadorApp: Reinitializing DOM elements...');

    // Reinitialize DOM utils
    DOMUtils.reinitializeDOMElements();

    // Rebind tab-specific events
    if (ConfigTab && ConfigTab.bindEvents) {ConfigTab.bindEvents();}
    if (CreateTab && CreateTab.bindEvents) {CreateTab.bindEvents();}
    if (ListTab && ListTab.bindEvents) {ListTab.bindEvents();}
    if (TreeTab && TreeTab.bindEvents) {TreeTab.bindEvents();}
    if (ExportTab && ExportTab.bindEvents) {ExportTab.bindEvents();}

    console.log('✅ RequisadorApp: DOM elements reinitialized');
  },

  /**
   * Bind event listeners (called after dynamic content loading)
   */
  bindEventListeners() {
    console.log('🔗 RequisadorApp: Binding event listeners...');

    // Rebind global events
    this.bindAboutModalEvents();

    console.log('✅ RequisadorApp: Event listeners bound');
  }
};

// Legacy function compatibility layer
// These functions are called by the existing HTML and tab loading system

function initialize() {
  console.log('🔧 Legacy initialize function called');
  RequisadorApp.init();
}

function updateUI() {
  console.log('🎨 Legacy updateUI function called');
  if (RequisadorApp.updateUI) {
    RequisadorApp.updateUI();
  }
}

function reinitializeDOMElements() {
  console.log('🔄 Legacy reinitializeDOMElements function called');
  if (RequisadorApp.reinitializeDOMElements) {
    RequisadorApp.reinitializeDOMElements();
  }
}

function bindEventListeners() {
  console.log('🔗 Legacy bindEventListeners function called');
  if (RequisadorApp.bindEventListeners) {
    RequisadorApp.bindEventListeners();
  }
}

// Legacy modal functions (called from HTML)
function showAboutModal() {
  console.log('📖 Legacy showAboutModal function called');
  if (RequisadorApp.showAboutModal) {
    RequisadorApp.showAboutModal();
  }
}

function hideAboutModal() {
  console.log('📖 Legacy hideAboutModal function called');
  if (RequisadorApp.hideAboutModal) {
    RequisadorApp.hideAboutModal();
  }
}

// Legacy function redirects to new tab modules
// These maintain compatibility with existing function calls

function renderRequirementsList() {
  console.log('📋 Legacy renderRequirementsList called, delegating to ListTab');
  if (ListTab && ListTab.renderRequirementsList) {
    ListTab.renderRequirementsList();
  }
}

function renderTreeView() {
  console.log('🌳 Legacy renderTreeView called, delegating to TreeTab');
  if (TreeTab && TreeTab.renderTreeView) {
    TreeTab.renderTreeView();
  }
}

function updateParentRequirementOptions() {
  console.log('🔄 Legacy updateParentRequirementOptions called, delegating to CreateTab');
  if (CreateTab && CreateTab.updateParentRequirementOptions) {
    CreateTab.updateParentRequirementOptions();
  }
}

function renderConfigLists() {
  console.log('⚙️ Legacy renderConfigLists called, delegating to ConfigTab');
  if (ConfigTab && ConfigTab.renderAllLists) {
    ConfigTab.renderAllLists();
  }
}

function updateSelects() {
  console.log('🔄 Legacy updateSelects called, delegating to DOMUtils');
  if (DOMUtils && DOMUtils.updateSelects) {
    DOMUtils.updateSelects();
  }
}

function expandAllTreeNodes() {
  console.log('📖 Legacy expandAllTreeNodes called, delegating to TreeTab');
  if (TreeTab && TreeTab.expandAllTreeNodes) {
    TreeTab.expandAllTreeNodes();
  }
}

function collapseAllTreeNodes() {
  console.log('📕 Legacy collapseAllTreeNodes called, delegating to TreeTab');
  if (TreeTab && TreeTab.collapseAllTreeNodes) {
    TreeTab.collapseAllTreeNodes();
  }
}

// Export/Import legacy functions
function exportToCSV() {
  console.log('📤 Legacy exportToCSV called, delegating to ExportTab');
  if (ExportTab && ExportTab.exportToCSV) {
    ExportTab.exportToCSV();
  }
}

function exportToLaTeX() {
  console.log('📤 Legacy exportToLaTeX called, delegating to ExportTab');
  if (ExportTab && ExportTab.exportToLaTeX) {
    ExportTab.exportToLaTeX();
  }
}

function exportProject() {
  console.log('📤 Legacy exportProject called, delegating to ExportTab');
  if (ExportTab && ExportTab.exportProject) {
    ExportTab.exportProject();
  }
}

function importProject() {
  console.log('📥 Legacy importProject called, delegating to ExportTab');
  if (ExportTab && ExportTab.importProject) {
    ExportTab.importProject();
  }
}

function handleFileImport(event) {
  console.log('📥 Legacy handleFileImport called, delegating to ExportTab');
  if (ExportTab && ExportTab.handleFileImport) {
    ExportTab.handleFileImport(event);
  }
}

// Legacy requirement management functions
function addRequirement() {
  console.log('➕ Legacy addRequirement called, delegating to CreateTab');
  if (CreateTab && CreateTab.addRequirement) {
    CreateTab.addRequirement();
  }
}

function clearAllRequirements() {
  console.log('🗑️ Legacy clearAllRequirements called, delegating to ListTab');
  if (ListTab && ListTab.clearAllRequirements) {
    ListTab.clearAllRequirements();
  }
}

function deleteRequirement(index) {
  console.log('🗑️ Legacy deleteRequirement called, delegating to ListTab');
  if (ListTab && ListTab.deleteRequirement) {
    ListTab.deleteRequirement(index);
  }
}

function moveRequirementUp(index) {
  console.log('⬆️ Legacy moveRequirementUp called, delegating to ListTab');
  if (ListTab && ListTab.moveRequirement) {
    ListTab.moveRequirement(index, 'up');
  }
}

function moveRequirementDown(index) {
  console.log('⬇️ Legacy moveRequirementDown called, delegating to ListTab');
  if (ListTab && ListTab.moveRequirement) {
    ListTab.moveRequirement(index, 'down');
  }
}

function convertRequirementLevel(index) {
  console.log('🔄 Legacy convertRequirementLevel called, delegating to ListTab');
  if (ListTab && ListTab.convertRequirementLevel) {
    ListTab.convertRequirementLevel(index);
  }
}

function clearForm() {
  console.log('🧹 Legacy clearForm called, delegating to CreateTab');
  if (CreateTab && CreateTab.clearForm) {
    CreateTab.clearForm();
  }
}

function updatePreview() {
  console.log('👁️ Legacy updatePreview called, delegating to CreateTab');
  if (CreateTab && CreateTab.updatePreview) {
    CreateTab.updatePreview();
  }
}

// Storage legacy functions
function saveToLocalStorage() {
  console.log('💾 Legacy saveToLocalStorage called, delegating to Storage');
  if (Storage && Storage.saveRequirements) {
    Storage.saveRequirements();
  }
}

function loadFromLocalStorage() {
  console.log('📁 Legacy loadFromLocalStorage called, delegating to Storage');
  if (Storage && Storage.loadRequirements) {
    Storage.loadRequirements();
  }
}

// Toast notification legacy function
function showToast(message, type = 'info') {
  console.log('💬 Legacy showToast called, delegating to DOMUtils');
  if (DOMUtils && DOMUtils.showToast) {
    DOMUtils.showToast(message, type);
  }
}

// Expose main app to window for debugging
window.RequisadorApp = RequisadorApp;

// Expose legacy initialize function to window
window.initialize = initialize;
window.updateUI = updateUI;
window.reinitializeDOMElements = reinitializeDOMElements;
window.bindEventListeners = bindEventListeners;

console.log('✅ Main Application Script (Refactored) loaded successfully');
