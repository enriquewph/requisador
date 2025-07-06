/**
 * List Tab Module
 * Handles requirements list display and management
 */

/* global AppGlobals, DOMUtils */

/**
 * List Tab functionality
 */
const ListTab = {
  /**
   * Initialize list tab
   */
  init() {
    console.log('🔧 ListTab: Initializing list tab...');
    this.bindEvents();
    this.renderRequirementsList();
    console.log('✅ ListTab: List tab initialized successfully');
  },

  /**
   * Bind event listeners for list tab
   */
  bindEvents() {
    // Clear all requirements button
    const clearAllBtn = document.getElementById('clearAllRequirementsBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => this.clearAllRequirements());
    }

    // Search/filter functionality
    const searchInput = document.getElementById('requirementsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterRequirements(e.target.value));
    }

    // Level filter
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
      levelFilter.addEventListener('change', () => this.renderRequirementsList());
    }

    // Component filter
    const componentFilter = document.getElementById('componentFilter');
    if (componentFilter) {
      componentFilter.addEventListener('change', () => this.renderRequirementsList());
    }
  },

  /**
   * Render the requirements list
   */
  renderRequirementsList() {
    console.log('ListTab: Rendering requirements list...');

    const container = document.getElementById('requirementsList');
    if (!container) {
      console.warn('ListTab: Requirements list container not found');
      return;
    }

    // Get filter values
    const levelFilter = document.getElementById('levelFilter')?.value || 'all';
    const componentFilter = document.getElementById('componentFilter')?.value || 'all';
    const searchTerm = document.getElementById('requirementsSearch')?.value?.toLowerCase() || '';

    // Filter requirements
    const filteredRequirements = AppGlobals.state.allRequirements.filter(req => {
      // Level filter
      if (levelFilter !== 'all' && req.level.toString() !== levelFilter) {
        return false;
      }

      // Component filter
      if (componentFilter !== 'all' && req.component !== componentFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchableText = [
          req.id, req.behavior, req.justification, req.func,
          req.variable, req.mode, req.condition
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });

    if (filteredRequirements.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-600 mb-2">No hay requisitos que mostrar</h3>
          <p class="text-gray-500">
            ${AppGlobals.state.allRequirements.length === 0
    ? 'Aún no has creado ningún requisito. Ve a la pestaña "Crear Requisito" para comenzar.'
    : 'No se encontraron requisitos que coincidan con los filtros aplicados.'
}
          </p>
        </div>
      `;
      return;
    }

    // Generate requirements HTML
    const requirementsHTML = filteredRequirements.map((req, index) => {
      const actualIndex = AppGlobals.state.allRequirements.indexOf(req);
      return this.generateRequirementCard(req, actualIndex);
    }).join('');

    container.innerHTML = `
      <div class="space-y-4">
        ${requirementsHTML}
      </div>
    `;

    console.log(`ListTab: Rendered ${filteredRequirements.length} requirements`);
  },

  /**
   * Generate HTML for a requirement card
   */
  generateRequirementCard(req, index) {
    const levelBadge = req.level === 1
      ? '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Nivel 1</span>'
      : '<span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Nivel 2</span>';

    const parentInfo = req.parentId
      ? `<div class="text-sm text-gray-600 mb-2">
           <span class="font-medium">Requisito Padre:</span> ${req.parentId}
         </div>`
      : '';

    const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;

    return `
      <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            ${levelBadge}
            <h3 class="text-lg font-bold text-gray-900">${req.id}</h3>
          </div>
          <div class="flex space-x-2">
            <button 
              onclick="ListTab.moveRequirement(${index}, 'up')" 
              class="text-gray-500 hover:text-blue-600 p-1"
              title="Mover arriba"
              ${index === 0 ? 'disabled' : ''}
            >
              ↑
            </button>
            <button 
              onclick="ListTab.moveRequirement(${index}, 'down')" 
              class="text-gray-500 hover:text-blue-600 p-1"
              title="Mover abajo"
              ${index === AppGlobals.state.allRequirements.length - 1 ? 'disabled' : ''}
            >
              ↓
            </button>
            <button 
              onclick="ListTab.convertRequirementLevel(${index})" 
              class="text-gray-500 hover:text-yellow-600 p-1"
              title="Convertir nivel"
            >
              ⇄
            </button>
            <button 
              onclick="ListTab.deleteRequirement(${index})" 
              class="text-gray-500 hover:text-red-600 p-1"
              title="Eliminar requisito"
            >
              🗑️
            </button>
          </div>
        </div>

        ${parentInfo}

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Componente:</span>
            <div class="text-gray-900">${component}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Función:</span>
            <div class="text-gray-900">${req.func}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Variable:</span>
            <div class="text-gray-900">${req.variable}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Modo:</span>
            <div class="text-gray-900">${req.mode}</div>
          </div>
        </div>

        ${req.condition ? `
          <div class="mb-3">
            <span class="font-medium text-gray-600 text-sm">Condición:</span>
            <p class="text-gray-800 mt-1">${req.condition}</p>
          </div>
        ` : ''}

        <div class="mb-3">
          <span class="font-medium text-gray-600 text-sm">Comportamiento Requerido:</span>
          <p class="text-gray-800 mt-1">${req.behavior}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
          <div>
            <span class="font-medium text-gray-600">Latencia Máxima:</span>
            <div class="text-gray-900">${req.latency}</div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Tolerancia:</span>
            <div class="text-gray-900">${req.tolerance}</div>
          </div>
        </div>

        <div>
          <span class="font-medium text-gray-600 text-sm">Justificación:</span>
          <p class="text-gray-800 mt-1">${req.justification}</p>
        </div>
      </div>
    `;
  },

  /**
   * Filter requirements based on search term
   */
  filterRequirements(searchTerm) {
    // The filtering is handled in renderRequirementsList
    this.renderRequirementsList();
  },

  /**
   * Move requirement up or down
   */
  moveRequirement(index, direction) {
    const requirements = AppGlobals.state.allRequirements;

    if (direction === 'up' && index > 0) {
      [requirements[index], requirements[index - 1]] = [requirements[index - 1], requirements[index]];
    } else if (direction === 'down' && index < requirements.length - 1) {
      [requirements[index], requirements[index + 1]] = [requirements[index + 1], requirements[index]];
    }

    this.renderRequirementsList();

    // Update other views
    if (typeof window.renderTreeView === 'function') {
      window.renderTreeView();
    }

    DOMUtils.showToast('Requisito movido correctamente.', 'success');
  },

  /**
   * Convert requirement level (1 to 2 or 2 to 1)
   */
  convertRequirementLevel(index) {
    const req = AppGlobals.state.allRequirements[index];
    if (!req) {return;}

    if (req.level === 1) {
      // Convert to level 2 - ask for parent
      const level1Reqs = AppGlobals.state.allRequirements.filter(r => r.level === 1 && r.id !== req.id);
      if (level1Reqs.length === 0) {
        DOMUtils.showToast('No hay requisitos de nivel 1 disponibles como padre.', 'warning');
        return;
      }

      const parentOptions = level1Reqs.map(r => `${r.id} - ${r.behavior.substring(0, 50)}...`);
      const selectedParent = prompt(`Selecciona un requisito padre:\n${parentOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nIngresa el número:`);

      if (selectedParent && !isNaN(selectedParent) && selectedParent > 0 && selectedParent <= level1Reqs.length) {
        const parentReq = level1Reqs[selectedParent - 1];
        req.level = 2;
        req.parentId = parentReq.id;

        // Update ID
        const childrenCount = AppGlobals.state.allRequirements.filter(r => r.parentId === parentReq.id).length - 1;
        const parentNumber = parentReq.id.replace('R', '');
        req.id = `R${parentNumber}-${childrenCount}`;
      }
    } else {
      // Convert to level 1
      req.level = 1;
      req.parentId = null;
      req.id = `R${AppGlobals.state.reqCounter.level1}`;
      AppGlobals.state.reqCounter.level1++;
    }

    this.renderRequirementsList();

    // Update other views
    if (typeof window.renderTreeView === 'function') {
      window.renderTreeView();
    }
    if (typeof window.updateParentRequirementOptions === 'function') {
      window.updateParentRequirementOptions();
    }

    DOMUtils.showToast('Nivel de requisito convertido correctamente.', 'success');
  },

  /**
   * Delete a requirement
   */
  deleteRequirement(index) {
    const req = AppGlobals.state.allRequirements[index];
    if (!req) {return;}

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

    AppGlobals.state.allRequirements.splice(index, 1);

    this.renderRequirementsList();

    // Update other views
    if (typeof window.renderTreeView === 'function') {
      window.renderTreeView();
    }
    if (typeof window.updateParentRequirementOptions === 'function') {
      window.updateParentRequirementOptions();
    }

    DOMUtils.showToast(`Requisito ${req.id} eliminado correctamente.`, 'success');
  },

  /**
   * Clear all requirements
   */
  clearAllRequirements() {
    if (AppGlobals.state.allRequirements.length === 0) {
      DOMUtils.showToast('No hay requisitos para eliminar.', 'warning');
      return;
    }

    const confirmClear = confirm(
      `¿Estás seguro de que quieres eliminar todos los ${AppGlobals.state.allRequirements.length} requisitos? Esta acción no se puede deshacer.`
    );

    if (!confirmClear) {return;}

    AppGlobals.state.allRequirements.length = 0;
    AppGlobals.state.reqCounter.level1 = 0;
    AppGlobals.state.reqCounter.level2 = 0;

    this.renderRequirementsList();

    // Update other views
    if (typeof window.renderTreeView === 'function') {
      window.renderTreeView();
    }
    if (typeof window.updateParentRequirementOptions === 'function') {
      window.updateParentRequirementOptions();
    }

    DOMUtils.showToast('Todos los requisitos han sido eliminados.', 'success');
  }
};

// Expose ListTab to window for global access
window.ListTab = ListTab;

console.log('✅ ListTab module loaded successfully');
