/**
 * Create Tab Module
 * Handles requirement creation form functionality
 */

/* global AppGlobals, DOMUtils */

/**
 * Create Tab functionality
 */
const CreateTab = {
  /**
   * Initialize create tab
   */
  init() {
    console.log('🔧 CreateTab: Initializing create tab...');
    this.bindEvents();
    this.updateParentRequirementOptions();
    console.log('✅ CreateTab: Create tab initialized successfully');
  },

  /**
   * Bind event listeners for create tab
   */
  bindEvents() {
    // Add requirement button
    const addBtn = document.getElementById('addRequirementBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addRequirement());
    }

    // Clear form button
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearForm());
    }

    // Component change event to update modes
    const componentSelect = document.getElementById('componentSelect');
    if (componentSelect) {
      componentSelect.addEventListener('change', (e) => {
        this.updateModeOptions(e.target.value);
      });
    }

    // Form field changes for preview updates
    const previewFields = [
      'componentSelect', 'functionSelect', 'variableSelect', 'modeSelect',
      'conditionInput', 'behaviorInput', 'latencyInput', 'toleranceInput', 'justificationInput'
    ];

    previewFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => this.updatePreview());
        field.addEventListener('change', () => this.updatePreview());
      }
    });

    // Initialize preview
    this.updatePreview();
  },

  /**
   * Add a new requirement
   */
  addRequirement() {
    console.log('CreateTab: addRequirement function called');

    const formData = this.getFormData();
    if (!this.validateFormData(formData)) {
      return;
    }

    const parentId = formData.parentRequirement;
    let level = 1;
    let parentIndex = null;

    if (parentId) {
      // Find parent requirement
      parentIndex = AppGlobals.state.allRequirements.findIndex(req => req.id === parentId);
      if (parentIndex === -1) {
        DOMUtils.showToast('Requisito padre no encontrado.', 'error');
        return;
      }
      level = 2;
    }

    // Generate new ID based on level
    let newId;
    if (level === 1) {
      newId = `R${AppGlobals.state.reqCounter.level1}`;
      AppGlobals.state.reqCounter.level1++;
    } else {
      // For level 2, find how many children the parent already has
      const childrenCount = AppGlobals.state.allRequirements.filter(req => req.parentId === parentId).length;
      const parentNumber = parentId.replace('R', ''); // Extract parent number
      newId = `R${parentNumber}-${childrenCount}`;
    }

    const newReq = {
      id: newId,
      level: level,
      parentId: parentId || null,
      component: formData.component,
      func: formData.function,
      variable: formData.variable,
      mode: formData.mode,
      condition: formData.condition,
      behavior: formData.behavior,
      latency: formData.latency,
      tolerance: formData.tolerance,
      justification: formData.justification
    };

    // Add requirement to global state
    if (level === 1) {
      AppGlobals.state.allRequirements.push(newReq);
    } else {
      // Insert level 2 requirement after its parent
      const insertIndex = parentIndex + 1;
      // Find where to insert (after parent and its existing children)
      let finalInsertIndex = insertIndex;
      for (let i = insertIndex; i < AppGlobals.state.allRequirements.length; i++) {
        if (AppGlobals.state.allRequirements[i].parentId === parentId) {
          finalInsertIndex = i + 1;
        } else {
          break;
        }
      }
      AppGlobals.state.allRequirements.splice(finalInsertIndex, 0, newReq);
    }

    console.log('New requirement added:', newReq);
    console.log('Updated requirements array:', AppGlobals.state.allRequirements);

    // Update UI
    this.clearForm();
    this.updateParentRequirementOptions();

    // Trigger updates in other tabs if their update functions exist
    if (typeof window.renderRequirementsList === 'function') {
      window.renderRequirementsList();
    }
    if (typeof window.renderTreeView === 'function') {
      window.renderTreeView();
    }

    DOMUtils.showToast(`Requisito ${newId} añadido correctamente.`, 'success');
  },

  /**
   * Get form data
   */
  getFormData() {
    return {
      parentRequirement: document.getElementById('parentRequirementSelect')?.value || '',
      component: document.getElementById('componentSelect')?.value || '',
      function: document.getElementById('functionSelect')?.value || '',
      variable: document.getElementById('variableSelect')?.value || '',
      mode: document.getElementById('modeSelect')?.value || '',
      condition: document.getElementById('conditionInput')?.value?.trim() || '',
      behavior: document.getElementById('behaviorInput')?.value?.trim() || '',
      latency: document.getElementById('latencyInput')?.value?.trim() || '',
      tolerance: document.getElementById('toleranceInput')?.value?.trim() || '',
      justification: document.getElementById('justificationInput')?.value?.trim() || ''
    };
  },

  /**
   * Validate form data
   */
  validateFormData(data) {
    const requiredFields = [
      { field: 'behavior', name: 'Comportamiento Requerido' },
      { field: 'justification', name: 'Justificación' },
      { field: 'latency', name: 'Latencia Máxima' }
    ];

    for (const { field, name } of requiredFields) {
      if (!data[field]) {
        DOMUtils.showToast(`Por favor, completa el campo "${name}".`, 'warning');
        return false;
      }
    }

    return true;
  },

  /**
   * Clear the form
   */
  clearForm() {
    console.log('CreateTab: Clearing form');

    // Clear all form inputs
    const inputs = [
      'parentRequirementSelect', 'componentSelect', 'functionSelect', 'variableSelect',
      'modeSelect', 'conditionInput', 'behaviorInput', 'latencyInput', 'toleranceInput', 'justificationInput'
    ];

    inputs.forEach(inputId => {
      const element = document.getElementById(inputId);
      if (element) {
        if (element.tagName === 'SELECT') {
          element.selectedIndex = 0;
        } else {
          element.value = '';
        }
      }
    });

    // Update preview
    this.updatePreview();

    console.log('CreateTab: Form cleared');
  },

  /**
   * Update parent requirement options
   */
  updateParentRequirementOptions() {
    const select = document.getElementById('parentRequirementSelect');
    if (!select) {return;}

    // Get level 1 requirements only
    const level1Requirements = AppGlobals.state.allRequirements.filter(req => req.level === 1);

    DOMUtils.populateSelect(
      select,
      level1Requirements.map(req => ({ value: req.id, text: `${req.id} - ${req.behavior}` })),
      'Ninguno (Requisito de Nivel 1)'
    );
  },

  /**
   * Update mode options based on selected component
   */
  updateModeOptions(component) {
    const modeSelect = document.getElementById('modeSelect');
    if (!modeSelect || !component) {return;}

    const modes = AppGlobals.state.modes[component] || [];
    DOMUtils.populateSelect(modeSelect, modes, 'Selecciona un modo');

    this.updatePreview();
  },

  /**
   * Update the requirement preview
   */
  updatePreview() {
    const previewElement = document.getElementById('requirementPreview');
    if (!previewElement) {return;}

    const formData = this.getFormData();

    // Determine requirement level
    const level = formData.parentRequirement ? 2 : 1;
    const levelText = level === 1 ? 'Nivel 1 (Principal)' : 'Nivel 2 (Derivado)';

    // Generate preview ID
    let previewId = 'R?';
    if (level === 1) {
      previewId = `R${AppGlobals.state.reqCounter.level1}`;
    } else if (formData.parentRequirement) {
      const childrenCount = AppGlobals.state.allRequirements.filter(req => req.parentId === formData.parentRequirement).length;
      const parentNumber = formData.parentRequirement.replace('R', '');
      previewId = `R${parentNumber}-${childrenCount}`;
    }

    const preview = `
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center mb-3">
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">${levelText}</span>
          <span class="ml-2 font-bold text-blue-900">${previewId}</span>
        </div>
        
        ${formData.parentRequirement ? `
          <div class="mb-2">
            <span class="text-sm text-gray-600">Requisito Padre:</span>
            <span class="ml-1 font-medium">${formData.parentRequirement}</span>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
          <div><span class="font-medium">Componente:</span> ${formData.component || '-'}</div>
          <div><span class="font-medium">Función:</span> ${formData.function || '-'}</div>
          <div><span class="font-medium">Variable:</span> ${formData.variable || '-'}</div>
          <div><span class="font-medium">Modo:</span> ${formData.mode || '-'}</div>
        </div>
        
        ${formData.condition ? `
          <div class="mb-2">
            <span class="font-medium text-sm">Condición:</span>
            <p class="text-gray-700 mt-1">${formData.condition}</p>
          </div>
        ` : ''}
        
        ${formData.behavior ? `
          <div class="mb-2">
            <span class="font-medium text-sm">Comportamiento Requerido:</span>
            <p class="text-gray-700 mt-1">${formData.behavior}</p>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
          <div><span class="font-medium">Latencia Máx.:</span> ${formData.latency || '-'}</div>
          <div><span class="font-medium">Tolerancia:</span> ${formData.tolerance || '-'}</div>
        </div>
        
        ${formData.justification ? `
          <div>
            <span class="font-medium text-sm">Justificación:</span>
            <p class="text-gray-700 mt-1">${formData.justification}</p>
          </div>
        ` : ''}
      </div>
    `;

    previewElement.innerHTML = preview;
  }
};

// Expose CreateTab to window for global access
window.CreateTab = CreateTab;

console.log('✅ CreateTab module loaded successfully');
