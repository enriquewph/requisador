/**
 * Requisador de Requisitos - Main Application Script (Refactored)
 * A comprehensive tool for creating and managing system requirements
 * Following Systems Engineering Handbook methodology
 *
 * This is the main coordination module that delegates functionality to specialized tab modules.
 */

/* global AppGlobals, DOMUtils, ConfigTab, CreateTab, ListTab, TreeTab, ExportTab */

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

    // Project import/export buttons
    this.bindProjectButtons();

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
   * Bind project import/export buttons
   */
  bindProjectButtons() {
    console.log('🔗 RequisadorApp: Binding project buttons...');

    // Export project button
    const exportBtn = document.getElementById('exportProjectBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        console.log('🔧 RequisadorApp: Export button clicked');
        AppGlobals.exportProject();
      });
      console.log('✅ RequisadorApp: Export button bound');
    } else {
      console.warn('⚠️ RequisadorApp: Export button not found');
    }

    // Import project button
    const importBtn = document.getElementById('importProjectBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        console.log('🔧 RequisadorApp: Import button clicked');
        AppGlobals.importProject();
      });
      console.log('✅ RequisadorApp: Import button bound');
    } else {
      console.warn('⚠️ RequisadorApp: Import button not found');
    }

    // File input for import
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        console.log('🔧 RequisadorApp: File input changed');
        AppGlobals.handleFileImport(e);
      });
      console.log('✅ RequisadorApp: File input bound');
    } else {
      console.warn('⚠️ RequisadorApp: File input not found');
    }
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
      console.log('📋 Initializing config tab...');
      if (ConfigTab && ConfigTab.renderAllLists) {
        ConfigTab.renderAllLists();
      }
      break;
    case 'create':
      console.log('✏️ Initializing create tab...');
      if (CreateTab && CreateTab.updateParentRequirementOptions) {
        CreateTab.updateParentRequirementOptions();
      }
      if (CreateTab && CreateTab.updatePreview) {
        CreateTab.updatePreview();
      }
      break;
    case 'list':
      console.log('📋 Initializing list tab...');
      setTimeout(() => {
        if (ListTab && ListTab.renderRequirementsList) {
          ListTab.renderRequirementsList();
        }
      }, 100); // Small delay to ensure DOM is ready
      break;
    case 'tree':
      console.log('🌳 Initializing tree tab...');
      setTimeout(() => {
        if (TreeTab && TreeTab.renderTreeView) {
          TreeTab.renderTreeView();
        }
      }, 100); // Small delay to ensure DOM is ready
      break;
    case 'export':
      console.log('📤 Initializing export tab...');
      // Export tab doesn't need special initialization
      break;
    default:
      console.log(`🤷 Unknown tab: ${tabName}`);
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

    // Detect current tab and refresh its content
    this.detectAndRefreshCurrentTab();

    console.log('✅ RequisadorApp: UI updated');
  },

  /**
   * Detect which tab is currently active and refresh its content
   */
  detectAndRefreshCurrentTab() {
    // Try to detect current tab by checking which content is loaded
    if (document.getElementById('requirementsList')) {
      console.log('📋 Detected list tab is active, refreshing...');
      this.activeTab = 'list';
      if (ListTab && ListTab.init) {
        ListTab.init(); // Re-initialize to refresh content
      }
    } else if (document.getElementById('requirementsTree')) {
      console.log('🌳 Detected tree tab is active, refreshing...');
      this.activeTab = 'tree';
      if (TreeTab && TreeTab.init) {
        TreeTab.init(); // Re-initialize to refresh content
      }
    } else if (document.getElementById('addReqBtn')) {
      console.log('✏️ Detected create tab is active, refreshing...');
      this.activeTab = 'create';
      if (CreateTab && CreateTab.init) {
        CreateTab.init(); // Re-initialize to refresh content
      }
    } else if (document.getElementById('functionsList')) {
      console.log('⚙️ Detected config tab is active, refreshing...');
      this.activeTab = 'config';
      if (ConfigTab && ConfigTab.init) {
        ConfigTab.init(); // Re-initialize to refresh content
      }
    } else {
      console.log('📤 Assuming export tab is active...');
      this.activeTab = 'export';
      if (ExportTab && ExportTab.init) {
        ExportTab.init(); // Re-initialize to refresh content
      }
    }
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

// Expose main app to window for debugging and initialization
window.RequisadorApp = RequisadorApp;

// Only expose the core initialization function needed by index.html
window.initialize = () => RequisadorApp.init();
window.updateUI = () => RequisadorApp.updateUI();
window.reinitializeDOMElements = () => RequisadorApp.reinitializeDOMElements();
window.bindEventListeners = () => RequisadorApp.bindEventListeners();

console.log('✅ Main Application Script loaded successfully');
