/**
 * Export Tab Module
 * Handles all export and import functionality (CSV, LaTeX, Project files)
 */

/* global AppGlobals, DOMUtils, Storage */

/**
 * Export Tab functionality
 */
const ExportTab = {
  // Flag to prevent multiple simultaneous exports
  isExporting: false,

  /**
   * Initialize export tab
   */
  init() {
    console.log('🔧 ExportTab: Initializing export tab...');
    this.bindEvents();
    console.log('✅ ExportTab: Export tab initialized successfully');
  },

  /**
   * Bind event listeners for export tab
   */
  bindEvents() {
    // CSV Export
    const csvExportBtn = document.getElementById('exportCsvBtn');
    if (csvExportBtn) {
      csvExportBtn.addEventListener('click', () => this.exportToCSV());
    }

    // LaTeX Export
    const latexExportBtn = document.getElementById('exportLatexBtn');
    if (latexExportBtn) {
      latexExportBtn.addEventListener('click', () => this.exportToLaTeX());
    }

    // Note: Project import/export buttons are now handled globally in app.js

    // Log which elements were found
    console.log('ExportTab elements found:', {
      csvExportBtn: !!csvExportBtn,
      latexExportBtn: !!latexExportBtn
    });
  },

  /**
   * Export requirements to CSV
   */
  exportToCSV() {
    if (this.isExporting) {
      console.log('Export already in progress, ignoring duplicate request');
      return;
    }

    if (AppGlobals.state.allRequirements.length === 0) {
      DOMUtils.showToast('No hay requisitos para exportar.', 'warning');
      return;
    }

    this.isExporting = true;

    try {
      const headers = [
        'ID',
        'Nivel',
        'Requisito Padre',
        'Componente',
        'Función Asociada',
        'Variable Controlada',
        'Modo del Sistema',
        'Condición',
        'Comportamiento Requerido',
        'Latencia Máx.',
        'Tolerancia',
        'Justificación',
      ];

      const escapeCsvCell = cell => {
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      };

      const csvRows = [headers.join(',')];
      AppGlobals.state.allRequirements.forEach(req => {
        const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;
        const row = [
          req.id,
          req.level,
          req.parentId || '',
          component,
          req.func,
          req.variable,
          req.mode,
          req.condition || '',
          req.behavior,
          req.latency,
          req.tolerance,
          req.justification,
        ].map(escapeCsvCell);
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'requisitos.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        DOMUtils.showToast('Requisitos exportados a CSV correctamente.', 'success');
      } else {
        DOMUtils.showToast('Tu navegador no soporta la descarga de archivos.', 'error');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      DOMUtils.showToast('Error al exportar CSV: ' + error.message, 'error');
    } finally {
      this.isExporting = false;
    }
  },

  /**
   * Export requirements to LaTeX
   */
  exportToLaTeX() {
    if (AppGlobals.state.allRequirements.length === 0) {
      DOMUtils.showToast('No hay requisitos para exportar.', 'warning');
      return;
    }

    let latexContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{geometry}
\\usepackage{longtable}
\\usepackage{array}
\\usepackage{booktabs}
\\geometry{margin=2cm}

\\title{Requisitos del Sistema}
\\author{Generado por Requisador de Requisitos}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introducción}
Este documento presenta los requisitos del sistema generados utilizando la metodología del Systems Engineering Handbook.

\\section{Requisitos de Nivel 1}

`;

    // Level 1 requirements
    const level1Reqs = AppGlobals.state.allRequirements.filter(req => req.level === 1);

    level1Reqs.forEach(req => {
      const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;

      latexContent += `\\subsection{${req.id}}
\\begin{itemize}
    \\item \\textbf{Componente:} ${component}
    \\item \\textbf{Función:} ${req.func}
    \\item \\textbf{Variable:} ${req.variable}
    \\item \\textbf{Modo:} ${req.mode}`;

      if (req.condition) {
        latexContent += `
    \\item \\textbf{Condición:} ${req.condition}`;
      }

      latexContent += `
    \\item \\textbf{Comportamiento:} ${req.behavior}
    \\item \\textbf{Latencia Máxima:} ${req.latency}
    \\item \\textbf{Tolerancia:} ${req.tolerance}
    \\item \\textbf{Justificación:} ${req.justification}
\\end{itemize}

`;

      // Add level 2 requirements for this parent
      const children = AppGlobals.state.allRequirements.filter(child => child.parentId === req.id);
      if (children.length > 0) {
        latexContent += `\\subsubsection{Requisitos Derivados}

`;
        children.forEach(child => {
          const childComponent = child.component === 'Ambos' ? 'HMI, ECI' : child.component;
          latexContent += `\\paragraph{${child.id}}
\\begin{itemize}
    \\item \\textbf{Componente:} ${childComponent}
    \\item \\textbf{Función:} ${child.func}
    \\item \\textbf{Variable:} ${child.variable}
    \\item \\textbf{Modo:} ${child.mode}`;

          if (child.condition) {
            latexContent += `
    \\item \\textbf{Condición:} ${child.condition}`;
          }

          latexContent += `
    \\item \\textbf{Comportamiento:} ${child.behavior}
    \\item \\textbf{Latencia Máxima:} ${child.latency}
    \\item \\textbf{Tolerancia:} ${child.tolerance}
    \\item \\textbf{Justificación:} ${child.justification}
\\end{itemize}

`;
        });
      }
    });

    latexContent += `\\section{Tabla Resumen}

\\begin{longtable}{|p{1.5cm}|p{2cm}|p{2cm}|p{2cm}|p{6cm}|}
\\hline
\\textbf{ID} & \\textbf{Componente} & \\textbf{Función} & \\textbf{Variable} & \\textbf{Comportamiento} \\\\
\\hline
\\endfirsthead
\\hline
\\textbf{ID} & \\textbf{Componente} & \\textbf{Función} & \\textbf{Variable} & \\textbf{Comportamiento} \\\\
\\hline
\\endhead
`;

    AppGlobals.state.allRequirements.forEach(req => {
      const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;
      latexContent += `${req.id} & ${component} & ${req.func} & ${req.variable} & ${req.behavior} \\\\ \\hline
`;
    });

    latexContent += `\\end{longtable}

\\end{document}`;

    const blob = new Blob([latexContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'requisitos.tex');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      DOMUtils.showToast('Requisitos exportados a LaTeX correctamente.', 'success');
    } else {
      DOMUtils.showToast('Tu navegador no soporta la descarga de archivos.', 'error');
    }
  },

  /**
   * Export complete project (requirements + configuration)
   */
  exportProject() {
    if (this.isExporting) {
      console.log('Export already in progress, ignoring duplicate request');
      return;
    }

    this.isExporting = true;

    try {
      const projectData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        configuration: {
          functions: AppGlobals.state.allFunctions,
          variables: AppGlobals.state.allVariables,
          components: AppGlobals.state.allComponents,
          modes: AppGlobals.state.modes
        },
        requirements: AppGlobals.state.allRequirements,
        counters: AppGlobals.state.reqCounter
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

        DOMUtils.showToast('Proyecto exportado correctamente.', 'success');
      } else {
        DOMUtils.showToast('Tu navegador no soporta la descarga de archivos.', 'error');
      }
    } catch (error) {
      console.error('Error exporting project:', error);
      DOMUtils.showToast('Error al exportar proyecto: ' + error.message, 'error');
    } finally {
      this.isExporting = false;
    }
  },

  /**
   * Import project from file
   */
  importProject() {
    console.log('🔧 ExportTab: Import project button clicked');

    // Try to find the file input (check both possible IDs)
    let fileInput = document.getElementById('projectFileInput');
    if (!fileInput) {
      fileInput = document.getElementById('importFileInput');
    }

    if (fileInput) {
      console.log('✅ ExportTab: File input found, triggering click');
      fileInput.click();
    } else {
      console.error('❌ ExportTab: No file input element found');
      DOMUtils.showToast('Elemento de selección de archivo no encontrado.', 'error');
    }
  },

  /**
   * Handle file import
   */
  handleFileImport(event) {
    console.log('🔧 ExportTab: handleFileImport called', event);

    const file = event.target.files[0];
    console.log('📁 ExportTab: Selected file:', file);

    if (!file) {
      console.log('❌ ExportTab: No file selected');
      return;
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      console.log('❌ ExportTab: Invalid file type:', file.type, file.name);
      DOMUtils.showToast('Por favor selecciona un archivo JSON válido.', 'error');
      // Reset the file input
      event.target.value = '';
      return;
    }

    console.log('📖 ExportTab: Reading file...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('✅ ExportTab: File read successfully, parsing JSON...');
        const projectData = JSON.parse(e.target.result);
        console.log('📊 ExportTab: Project data parsed:', projectData);
        this.loadProjectData(projectData);
      } catch (error) {
        console.error('❌ ExportTab: Error parsing JSON:', error);
        DOMUtils.showToast('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.', 'error');
      } finally {
        // Reset the file input so the same file can be selected again
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      console.error('❌ ExportTab: Error reading file');
      DOMUtils.showToast('Error al leer el archivo.', 'error');
      // Reset the file input
      event.target.value = '';
    };

    reader.readAsText(file);
  },

  /**
   * Load project data into the application
   */
  loadProjectData(projectData) {
    console.log('🚀 ExportTab: loadProjectData called with:', projectData);

    try {
      // Validate project data structure
      if (!projectData.configuration || !projectData.requirements) {
        throw new Error('Estructura de proyecto inválida');
      }

      console.log('✅ ExportTab: Project data structure is valid');

      // Confirm import
      const confirmImport = confirm(
        '¿Estás seguro de que quieres importar este proyecto? Esto reemplazará toda la configuración y requisitos actuales.\n\n' +
        'El proyecto contiene:\n' +
        `- ${projectData.requirements.length} requisitos\n` +
        `- ${projectData.configuration.functions?.length || 0} funciones\n` +
        `- ${projectData.configuration.variables?.length || 0} variables\n` +
        `- ${projectData.configuration.components?.length || 0} componentes`
      );

      console.log('🤔 ExportTab: User confirmation result:', confirmImport);

      if (!confirmImport) {
        console.log('❌ ExportTab: User cancelled import');
        return;
      }

      // Load configuration
      if (projectData.configuration.functions) {
        AppGlobals.state.allFunctions.length = 0;
        AppGlobals.state.allFunctions.push(...projectData.configuration.functions);
      }

      if (projectData.configuration.variables) {
        AppGlobals.state.allVariables.length = 0;
        AppGlobals.state.allVariables.push(...projectData.configuration.variables);
      }

      if (projectData.configuration.components) {
        AppGlobals.state.allComponents.length = 0;
        AppGlobals.state.allComponents.push(...projectData.configuration.components);
      }

      if (projectData.configuration.modes) {
        Object.keys(AppGlobals.state.modes).forEach(key => delete AppGlobals.state.modes[key]);
        Object.assign(AppGlobals.state.modes, projectData.configuration.modes);
      }

      // Load requirements
      AppGlobals.state.allRequirements.length = 0;
      AppGlobals.state.allRequirements.push(...projectData.requirements);

      // Load counters
      if (projectData.counters) {
        Object.assign(AppGlobals.state.reqCounter, projectData.counters);
      }

      // Update UI
      DOMUtils.updateSelects();

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

      // Save to localStorage
      Storage.saveConfig();
      Storage.saveRequirements();

      DOMUtils.showToast(
        `Proyecto importado correctamente. ${projectData.requirements.length} requisitos cargados.`,
        'success'
      );

    } catch (error) {
      console.error('Error importing project:', error);
      DOMUtils.showToast('Error al importar el proyecto: ' + error.message, 'error');
    }
  }
};

// Expose ExportTab to window for global access
window.ExportTab = ExportTab;

console.log('✅ ExportTab module loaded successfully');
