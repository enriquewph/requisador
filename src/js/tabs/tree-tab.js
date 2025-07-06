/**
 * Tree Tab Module
 * Handles requirements tree view display and management
 */

/* global AppGlobals, DOMUtils */

/**
 * Tree Tab functionality
 */
const TreeTab = {
  /**
   * Initialize tree tab
   */
  init() {
    console.log('🔧 TreeTab: Initializing tree tab...');
    this.bindEvents();
    
    // Always render when initializing, especially if data was updated
    if (window.dataUpdated) {
      console.log('🔄 TreeTab: Data was updated, refreshing tree...');
      window.dataUpdated = false; // Reset flag
    }
    this.renderTreeView();
    
    console.log('✅ TreeTab: Tree tab initialized successfully');
  },

  /**
   * Bind event listeners for tree tab
   */
  bindEvents() {
    // Expand all button
    const expandAllBtn = document.getElementById('expandAllBtn');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => this.expandAllTreeNodes());
    }

    // Collapse all button
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => this.collapseAllTreeNodes());
    }

    // Export tree button
    const exportTreeBtn = document.getElementById('exportTreeBtn');
    if (exportTreeBtn) {
      exportTreeBtn.addEventListener('click', () => this.exportTreeStructure());
    }
  },

  /**
   * Render the requirements tree view
   */
  renderTreeView() {
    console.log('TreeTab: Rendering tree view...');

    const container = document.getElementById('requirementsTree');
    if (!container) {
      console.log('ℹ️ TreeTab: Requirements tree container not found (tab not loaded)');
      return;
    }

    const level1Requirements = AppGlobals.state.allRequirements.filter(req => req.level === 1);

    if (level1Requirements.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-600 mb-2">No hay requisitos en el árbol</h3>
          <p class="text-gray-500">Crea requisitos de nivel 1 para ver la estructura del árbol.</p>
        </div>
      `;
      return;
    }

    let treeHTML = '<div class="tree-container space-y-3 p-4">';

    level1Requirements.forEach(level1Req => {
      treeHTML += this.generateTreeNode(level1Req, true);
    });

    treeHTML += '</div>';
    container.innerHTML = treeHTML;

    console.log(`TreeTab: Rendered tree with ${level1Requirements.length} top-level requirements`);
  },

  /**
   * Generate a tree node for a requirement
   */
  generateTreeNode(req, isLevel1 = false) {
    const children = AppGlobals.state.allRequirements.filter(r => r.parentId === req.id);
    const hasChildren = children.length > 0;
    const nodeId = `tree-node-${req.id}`;

    const component = req.component === 'Ambos' ? 'HMI+ECI' : req.component;

    // Truncate behavior for compact view
    const behaviorSummary = req.behavior.length > 80 
      ? req.behavior.substring(0, 80) + '...'
      : req.behavior;

    // Create tooltip content with all details
    const tooltipContent = `
ID: ${req.id}
${req.parentId ? `Padre: ${req.parentId}` : ''}
Componente: ${req.component === 'Ambos' ? 'HMI, ECI' : req.component}
Función: ${req.func}
Variable: ${req.variable}
Modo: ${req.mode}
${req.condition ? `Condición: ${req.condition}` : ''}
Comportamiento: ${req.behavior}
Latencia: ${req.latency}
Tolerancia: ${req.tolerance}
Justificación: ${req.justification}
    `.trim();

    let html = `
      <div class="tree-node ${isLevel1 ? 'level-1' : 'level-2'}" data-req-id="${req.id}">
        <div class="requirement-node bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
             title="${tooltipContent}">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center mb-2">
                ${hasChildren ? `
                  <button 
                    class="toggle-btn mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
                    onclick="TreeTab.toggleNode('${nodeId}')"
                    title="Expandir/Colapsar"
                  >
                    <span class="toggle-icon">▼</span>
                  </button>
                ` : '<div class="w-6 mr-2"></div>'}
                
                <div class="flex items-center space-x-2 min-w-0">
                  <span class="bg-${isLevel1 ? 'blue' : 'green'}-100 text-${isLevel1 ? 'blue' : 'green'}-800 text-xs font-medium px-2 py-1 rounded flex-shrink-0">
                    ${isLevel1 ? 'L1' : 'L2'}
                  </span>
                  <h3 class="text-base font-bold text-gray-900 flex-shrink-0">${req.id}</h3>
                  <span class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded flex-shrink-0">${component}</span>
                  ${hasChildren ? `<span class="text-xs text-gray-500 flex-shrink-0">(${children.length})</span>` : ''}
                </div>
              </div>

              <div class="text-sm text-gray-700 truncate">
                ${behaviorSummary}
              </div>
            </div>

            <div class="flex space-x-1 ml-2 flex-shrink-0">
              <button 
                onclick="TreeTab.editRequirement('${req.id}')" 
                class="text-blue-600 hover:text-blue-800 text-xs p-1"
                title="Editar requisito"
              >
                ✏️
              </button>
              <button 
                onclick="TreeTab.deleteRequirement('${req.id}')" 
                class="text-red-600 hover:text-red-800 text-xs p-1"
                title="Eliminar requisito"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
    `;

    // Add children if any
    if (hasChildren) {
      html += `
        <div class="children-container ml-6 mt-2 space-y-2" id="${nodeId}-children">
      `;

      children.forEach(child => {
        html += this.generateTreeNode(child, false);
      });

      html += '</div>';
    }

    html += '</div>';

    return html;
  },

  /**
   * Toggle a tree node (expand/collapse)
   */
  toggleNode(nodeId) {
    const childrenContainer = document.getElementById(`${nodeId}-children`);
    const toggleIcon = document.querySelector(`[onclick="TreeTab.toggleNode('${nodeId}')"] .toggle-icon`);

    if (childrenContainer && toggleIcon) {
      if (childrenContainer.style.display === 'none') {
        childrenContainer.style.display = 'block';
        toggleIcon.textContent = '▼';
      } else {
        childrenContainer.style.display = 'none';
        toggleIcon.textContent = '▶';
      }
    }
  },

  /**
   * Expand all tree nodes
   */
  expandAllTreeNodes() {
    console.log('TreeTab: Expanding all tree nodes');

    const allChildrenContainers = document.querySelectorAll('.children-container');
    const allToggleIcons = document.querySelectorAll('.toggle-icon');

    allChildrenContainers.forEach(container => {
      container.style.display = 'block';
    });

    allToggleIcons.forEach(icon => {
      icon.textContent = '▼';
    });

    DOMUtils.showToast('Todos los nodos expandidos.', 'success');
  },

  /**
   * Collapse all tree nodes
   */
  collapseAllTreeNodes() {
    console.log('TreeTab: Collapsing all tree nodes');

    const allChildrenContainers = document.querySelectorAll('.children-container');
    const allToggleIcons = document.querySelectorAll('.toggle-icon');

    allChildrenContainers.forEach(container => {
      container.style.display = 'none';
    });

    allToggleIcons.forEach(icon => {
      icon.textContent = '▶';
    });

    DOMUtils.showToast('Todos los nodos colapsados.', 'success');
  },

  /**
   * Edit a requirement (placeholder - could open modal or redirect to create tab)
   */
  editRequirement(reqId) {
    DOMUtils.showToast(`Función de edición para ${reqId} no implementada aún.`, 'info');
    // TODO: Implement edit functionality
    // Could open a modal with the requirement form pre-filled
    // Or redirect to create tab with data loaded
  },

  /**
   * Delete a requirement from tree view
   */
  deleteRequirement(reqId) {
    const reqIndex = AppGlobals.state.allRequirements.findIndex(req => req.id === reqId);
    if (reqIndex === -1) {
      DOMUtils.showToast('Requisito no encontrado.', 'error');
      return;
    }

    const req = AppGlobals.state.allRequirements[reqIndex];

    // Check for child requirements
    const children = AppGlobals.state.allRequirements.filter(r => r.parentId === req.id);
    if (children.length > 0) {
      const confirmDelete = confirm(
        `Este requisito tiene ${children.length} requisito(s) hijo(s). Si lo eliminas, también se eliminarán todos sus hijos. ¿Continuar?`
      );
      if (!confirmDelete) {return;}

      // Remove children first
      children.forEach(child => {
        const childIndex = AppGlobals.state.allRequirements.indexOf(child);
        if (childIndex !== -1) {
          AppGlobals.state.allRequirements.splice(childIndex, 1);
        }
      });
    }

    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar el requisito ${req.id}?`);
    if (!confirmDelete) {return;}

    AppGlobals.state.allRequirements.splice(reqIndex, 1);

    this.renderTreeView();

    // Update other views
    if (typeof window.renderRequirementsList === 'function') {
      window.renderRequirementsList();
    }
    if (typeof window.updateParentRequirementOptions === 'function') {
      window.updateParentRequirementOptions();
    }

    DOMUtils.showToast(`Requisito ${req.id} eliminado correctamente.`, 'success');
  },

  /**
   * Export tree structure as text
   */
  exportTreeStructure() {
    if (AppGlobals.state.allRequirements.length === 0) {
      DOMUtils.showToast('No hay requisitos para exportar.', 'warning');
      return;
    }

    let treeText = 'ESTRUCTURA DE REQUISITOS\n';
    treeText += '========================\n\n';

    const level1Requirements = AppGlobals.state.allRequirements.filter(req => req.level === 1);

    level1Requirements.forEach((req, index) => {
      treeText += this.generateTextNode(req, '');
      if (index < level1Requirements.length - 1) {
        treeText += '\n';
      }
    });

    // Create and download file
    const blob = new Blob([treeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estructura-requisitos.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    DOMUtils.showToast('Estructura de árbol exportada correctamente.', 'success');
  },

  /**
   * Generate text representation of a tree node
   */
  generateTextNode(req, prefix) {
    const children = AppGlobals.state.allRequirements.filter(r => r.parentId === req.id);
    const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;

    let text = `${prefix}${req.id} - ${req.behavior}\n`;
    text += `${prefix}  └─ Componente: ${component}\n`;
    text += `${prefix}  └─ Función: ${req.func}\n`;
    text += `${prefix}  └─ Variable: ${req.variable}\n`;
    text += `${prefix}  └─ Modo: ${req.mode}\n`;
    text += `${prefix}  └─ Latencia: ${req.latency}\n`;
    text += `${prefix}  └─ Tolerancia: ${req.tolerance}\n`;

    if (children.length > 0) {
      text += `${prefix}  └─ Requisitos derivados:\n`;
      children.forEach((child, index) => {
        const isLast = index === children.length - 1;
        const childPrefix = prefix + (isLast ? '    ' : '  │ ');
        const nodePrefix = prefix + (isLast ? '  └─ ' : '  ├─ ');

        text += nodePrefix + this.generateTextNode(child, childPrefix);
      });
    }

    return text;
  }
};

// Expose TreeTab to window for global access
window.TreeTab = TreeTab;

console.log('✅ TreeTab module loaded successfully');
