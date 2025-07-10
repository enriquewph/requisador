/**
 * Application Configuration
 * Central configuration for the Requirements Manager application
 */

/* global AppVersion */

const AppConfig = {
  // Application metadata
  app: {
    name: 'Requisador de Requisitos',
    get version() { return AppVersion ? AppVersion.app : '0.1.0'; },
    get fullVersion() { return AppVersion ? AppVersion.getFullVersion() : '0.1.0'; },
    author: 'Enrique Walter Philippeaux',
    organization: 'UTN FRC 2025',
  },

  // File paths for components and pages
  paths: {
    components: {
      header: './components/header.html',
      footer: './components/footer.html',
      aboutModal: './components/about-modal.html',
    },
    pages: {
      config: './pages/config.html',
      create: './pages/create.html',
      list: './pages/list.html',
      tree: './pages/tree.html',
      guidelines: './pages/guidelines.html',
    },
    assets: {
      css: './css/styles.css',
      favicon: './assets/favicon.svg',
    },
    scripts: {
      core: './js/core/',
      modules: './js/modules/',
      utils: './js/utils/',
    },
  },

  // Tab configuration
  tabs: [
    {
      id: 'config',
      buttonId: 'configTab',
      contentId: 'configContent',
      title: 'Configuración del Sistema',
      pagePath: './pages/config.html',
    },
    {
      id: 'create',
      buttonId: 'createTab',
      contentId: 'createContent',
      title: 'Crear Requisito',
      pagePath: './pages/create.html',
    },
    {
      id: 'list',
      buttonId: 'listTab',
      contentId: 'listContent',
      title: 'Lista de Requisitos',
      pagePath: './pages/list.html',
    },
    {
      id: 'tree',
      buttonId: 'treeTab',
      contentId: 'treeContent',
      title: 'Vista de Árbol',
      pagePath: './pages/tree.html',
    },
    {
      id: 'guidelines',
      buttonId: 'guidelinesTab',
      contentId: 'guidelinesContent',
      title: 'Lineamientos para Requisitos',
      pagePath: './pages/guidelines.html',
    },
  ],

  // Default data
  defaults: {
    functions: [
      'Runtime Manager',
      'Config Manager',
      'CAN NMT Slave',
      'CAN NMT Master',
      'CAN-GPIO Translator',
      'CAN-ETH Translator',
      'CAN Driver',
      'GPIO Driver',
      'ETH Driver',
    ],
    variables: [
      'Indicador de estado',
      'Comandos a Red CAN',
      'Estado de salidas fisicas',
      'Reportes a Proc. Robot',
      'Comandos de gestión de red',
      'Mensajes de sincronización',
      'Respuestas a Terminal de Ingeniería',
    ],
    components: ['HMI', 'ECI'],
    modes: [
      'Initialization Mode',
      'Pre-operational Mode', 
      'Operational Mode',
      'Fault Mode',
      'Stopped Mode',
      'Operational (gw inactive)',
      'Operational (gw active)'
    ],
    modeAssociations: [
      { mode: 'Initialization Mode', components: ['HMI', 'ECI'] },
      { mode: 'Pre-operational Mode', components: ['HMI', 'ECI'] },
      { mode: 'Operational Mode', components: ['HMI'] },
      { mode: 'Fault Mode', components: ['HMI', 'ECI'] },
      { mode: 'Stopped Mode', components: ['HMI'] },
      { mode: 'Operational (gw inactive)', components: ['ECI'] },
      { mode: 'Operational (gw active)', components: ['ECI'] }
    ],
  },

  // UI Configuration
  ui: {
    toastDuration: 3000,
    animationDuration: 200,
    maxTooltipWidth: 300,
  },

  // Storage keys for localStorage
  storage: {
    requirements: 'requirements',
    functions: 'functions',
    variables: 'variables',
    components: 'components',
    modes: 'modes',
    counters: 'reqCounters',
  },

  // Application URLs
  urls: {
    github: {
      profile: 'https://github.com/enriquewph',
      project: 'https://github.com/enriquewph/requisador',
    },
  },
};

// Export configuration
window.AppConfig = AppConfig;
