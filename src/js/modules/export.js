/**
 * Export/Import Module
 * Handles CSV, LaTeX, and project export/import functionality
 */

/* global allRequirements:writable, allFunctions:writable, allVariables:writable, allComponents:writable, modes:writable, domElements, showToast, renderRequirementsList, updatePreview, reqCounter:writable, renderConfigLists, updateSelects, defaultFunctions, defaultVariables, defaultComponents, defaultModes, saveConfig, saveToLocalStorage */

// --- Export Functions ---
function exportToCSV() {
  if (allRequirements.length === 0) {
    showToast('No hay requisitos para exportar.', 'warning');
    return;
  }

  const headers = [
    'ID',
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
  allRequirements.forEach(req => {
    const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;
    const row = [
      req.id, // Use the actual ID instead of R${index}
      component,
      req.func,
      req.variable,
      req.mode,
      req.condition,
      req.behavior,
      req.latency,
      req.tolerance,
      req.justification,
    ].map(escapeCsvCell);
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  downloadFile(csvString, 'requisitos_detallados.csv', 'text/csv');
  showToast('Archivo CSV exportado exitosamente', 'success');
}

function exportToLaTeX() {
  if (allRequirements.length === 0) {
    showToast('No hay requisitos para exportar.', 'warning');
    return;
  }

  const escapeLatexCell = cell => {
    return cell
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}');
  };

  let latexContent = `\\begin{landscape}
\\begin{longtable}{p{0.06\\textwidth}p{0.20\\textwidth}p{0.16\\textwidth}p{0.20\\textwidth}p{0.14\\textwidth}p{0.18\\textwidth}p{0.30\\textwidth}}
\\toprule
\\textbf{ID} & \\textbf{Componente} & \\textbf{Función} & \\textbf{Variable} & \\textbf{Modo} & \\textbf{Condición} & \\textbf{Comportamiento} \\\\
\\midrule
\\endfirsthead
\\toprule
\\textbf{ID} & \\textbf{Componente} & \\textbf{Función} & \\textbf{Variable} & \\textbf{Modo} & \\textbf{Condición} & \\textbf{Comportamiento} \\\\
\\midrule
\\endhead
\\midrule
\\multicolumn{7}{r}{\\textit{Continúa en la siguiente página...}} \\\\
\\endfoot
\\bottomrule`;

  allRequirements.forEach(req => {
    const condition = req.condition === '-' ? 'N/A' : req.condition;
    const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;
    // Add indentation for level 2 requirements in LaTeX
    const indentation = req.level === 2 ? '\\quad ' : '';
    latexContent += `${indentation}${escapeLatexCell(req.id)} & ${escapeLatexCell(component)} & ${escapeLatexCell(req.func)} & ${escapeLatexCell(req.variable)} & ${escapeLatexCell(req.mode)} & ${escapeLatexCell(condition)} & ${escapeLatexCell(req.behavior)} \\\\\n`;
  });

  latexContent += `\\end{longtable}
\\end{landscape}
\\captionof{table}{Lista de Requisitos Detallados del Sistema}
\\label{tab:requisitos-detallados}`;

  downloadFile(latexContent, 'requisitos_detallados.tex', 'text/plain');
  showToast('Archivo LaTeX exportado exitosamente', 'success');
}

// --- Project Import/Export Functions ---
function exportProject() {
  const projectData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    config: {
      functions: [...allFunctions],
      variables: [...allVariables],
      components: [...allComponents],
      modes: JSON.parse(JSON.stringify(modes)),
    },
    requirements: {
      list: [...allRequirements],
      counter: reqCounter,
    },
    metadata: {
      totalRequirements: allRequirements.length,
      exportedBy: 'Requisador de Requisitos',
      description: 'Proyecto completo con configuración y requisitos del sistema',
    },
  };

  const jsonString = JSON.stringify(projectData, null, 2);

  // Generate filename with current date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `requisitos_proyecto_${dateStr}_${timeStr}.json`;

  downloadFile(jsonString, filename, 'application/json');
  showToast(`Proyecto exportado exitosamente como: ${filename}`, 'success');
}

function importProject() {
  if (domElements.importFileInput) {
    domElements.importFileInput.click();
  }
}

function handleFileImport(event) {
  console.log('🔄 File import started');
  const file = event.target.files[0];
  if (!file) {
    console.log('❌ No file selected');
    return;
  }

  console.log('📁 File selected:', file.name, 'Type:', file.type);

  if (file.type !== 'application/json') {
    console.log('❌ Invalid file type:', file.type);
    showToast('Por favor selecciona un archivo JSON válido.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      console.log('📖 Reading file content...');
      const projectData = JSON.parse(e.target.result);
      console.log('✅ JSON parsed successfully:', projectData);

      if (!projectData.config || !projectData.requirements) {
        console.log('❌ Invalid project structure:', {
          hasConfig: !!projectData.config,
          hasRequirements: !!projectData.requirements
        });
        throw new Error('Formato de archivo inválido');
      }

      const confirmMsg =
        '¿Estás seguro de que quieres importar este proyecto?\n\n' +
        `Versión: ${projectData.version || 'No especificada'}\n` +
        `Fecha: ${projectData.timestamp ? new Date(projectData.timestamp).toLocaleString() : 'No especificada'}\n` +
        `Requisitos: ${projectData.metadata?.totalRequirements || projectData.requirements.list?.length || 0}\n` +
        `Funciones: ${projectData.config.functions?.length || 0}\n` +
        `Variables: ${projectData.config.variables?.length || 0}\n` +
        `Componentes: ${projectData.config.components?.length || 0}\n\n` +
        'ADVERTENCIA: Esto reemplazará toda tu configuración y requisitos actuales.';

      console.log('💬 Showing confirmation dialog...');
      const userConfirmed = confirm(confirmMsg);
      console.log('👤 User confirmation result:', userConfirmed);

      if (!userConfirmed) {
        console.log('🚫 Import cancelled by user');
        return;
      }

      console.log('✅ Starting import process...');

      // Import configuration
      allFunctions.length = 0;
      allVariables.length = 0;
      allComponents.length = 0;
      allFunctions.push(...(projectData.config.functions || defaultFunctions));
      allVariables.push(...(projectData.config.variables || defaultVariables));
      allComponents.push(...(projectData.config.components || defaultComponents));
      
      // Clear and repopulate modes object instead of reassigning
      Object.keys(modes).forEach(key => delete modes[key]);
      const importedModes = projectData.config.modes || JSON.parse(JSON.stringify(defaultModes));
      Object.assign(modes, importedModes);

      // Import requirements
      // Import requirements data with array clearing approach
      allRequirements.length = 0;
      if (projectData.requirements.list && Array.isArray(projectData.requirements.list)) {
        allRequirements.push(...projectData.requirements.list);
      }
      
      // Update reqCounter properties instead of reassigning
      const importedCounter = projectData.requirements.counter || { level1: allRequirements.length, level2: 0 };
      reqCounter.level1 = importedCounter.level1 || 0;
      reqCounter.level2 = importedCounter.level2 || 0;

      // Save to localStorage
      saveConfig();
      saveToLocalStorage();

      // Update UI
      renderConfigLists();
      updateSelects();
      renderRequirementsList();
      if (typeof renderTreeView === 'function') {
        renderTreeView();
      }
      if (typeof updateParentRequirementOptions === 'function') {
        updateParentRequirementOptions();
      }
      updatePreview();

      console.log('✅ Import completed successfully');
      showToast(
        `Proyecto importado exitosamente. ${allRequirements.length} requisitos cargados.`,
        'success'
      );
    } catch (error) {
      console.error('❌ Import error:', error);
      showToast('Error al importar el proyecto: ' + error.message, 'error');
    }
  };

  reader.onerror = function () {
    console.error('❌ File reading error');
    showToast('Error al leer el archivo', 'error');
  };

  console.log('📚 Starting file read...');
  reader.readAsText(file);
  event.target.value = ''; // Clear input
}

// --- Utility Functions ---
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Make functions globally available
window.exportToCSV = exportToCSV;
window.exportToLaTeX = exportToLaTeX;
window.exportProject = exportProject;
window.importProject = importProject;
window.handleFileImport = handleFileImport;
