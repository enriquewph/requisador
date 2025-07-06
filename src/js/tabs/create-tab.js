/**
 * Create Tab Module
 * Handles requirement creation form functionality
 */

/* global AppGlobals, DOMUtils, ListTab, TreeTab */

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
    console.log('🔗 CreateTab: Binding events...');
    // Add requirement button
    const addBtn = document.getElementById('addReqBtn');
    if (addBtn) {
      // Remove any existing event listeners to prevent duplicates
      addBtn.replaceWith(addBtn.cloneNode(true));
      const newAddBtn = document.getElementById('addReqBtn');
      
      newAddBtn.addEventListener('click', (e) => {
        console.log('🖱️ CreateTab: addReqBtn clicked - event fired');
        e.preventDefault();
        this.addRequirement();
      });
      console.log('✅ CreateTab: addReqBtn event listener attached');
    } else {
      console.log('ℹ️ CreateTab: addReqBtn element not found (may not be loaded yet)');
    }

    // Clear form button (not implemented in HTML yet)
    const clearBtn = document.getElementById('clearFormBtn');
    if (clearBtn) {
      clearBtn.replaceWith(clearBtn.cloneNode(true));
      const newClearBtn = document.getElementById('clearFormBtn');
      newClearBtn.addEventListener('click', () => this.clearForm());
      console.log('✅ CreateTab: clearFormBtn event listener attached');
    } else {
      console.log('ℹ️ CreateTab: clearFormBtn not found (not implemented in HTML)');
    }

    // Generate prompt button
    const generatePromptBtn = document.getElementById('generatePromptBtn');
    if (generatePromptBtn) {
      generatePromptBtn.replaceWith(generatePromptBtn.cloneNode(true));
      const newGeneratePromptBtn = document.getElementById('generatePromptBtn');
      newGeneratePromptBtn.addEventListener('click', () => this.generatePrompt());
      console.log('✅ CreateTab: generatePromptBtn event listener attached');
    } else {
      console.log('ℹ️ CreateTab: generatePromptBtn not found');
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
    console.log('🔧 CreateTab: addRequirement function called');

    const formData = this.getFormData();
    console.log('📝 CreateTab: Form data collected:', formData);
    
    if (!this.validateFormData(formData)) {
      console.log('❌ CreateTab: Form validation failed');
      return;
    }
    console.log('✅ CreateTab: Form validation passed');

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
      newId = `R${parentNumber}-${childrenCount + 1}`;
    }

    console.log('🆔 CreateTab: Generated new requirement ID:', newId);
    console.log('📊 CreateTab: Updated req counter:', AppGlobals.state.reqCounter);

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

    console.log('✅ CreateTab: New requirement created:', newReq);
    console.log('📋 CreateTab: Total requirements before adding:', AppGlobals.state.allRequirements.length);

    // Add requirement to global state
    if (level === 1) {
      AppGlobals.state.allRequirements.push(newReq);
      console.log('➕ CreateTab: Added level 1 requirement');
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
      console.log('➕ CreateTab: Added level 2 requirement at index:', finalInsertIndex);
    }

    console.log('📋 CreateTab: Total requirements after adding:', AppGlobals.state.allRequirements.length);
    console.log('📊 CreateTab: Updated requirements array:', AppGlobals.state.allRequirements);

    // Save to storage
    if (typeof window.Storage !== 'undefined' && window.Storage.saveRequirements) {
      window.Storage.saveRequirements();
      console.log('💾 CreateTab: Requirements saved to localStorage');
    }

    // Clear form and update UI
    this.clearForm();
    this.updateParentRequirementOptions();

    // Mark that data has been updated so other tabs can refresh when activated
    window.dataUpdated = true;

    DOMUtils.showToast(`Requisito ${newId} añadido correctamente. Ve a la pestaña "Lista" o "Árbol" para verlo.`, 'success');
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
    const formData = this.getFormData();

    // Update individual output elements
    const outputId = document.getElementById('outputId');
    const outputFunction = document.getElementById('outputFunction');
    const outputVariable = document.getElementById('outputVariable');
    const outputComponent = document.getElementById('outputComponent');
    const outputLogic = document.getElementById('outputLogic');
    const outputLatency = document.getElementById('outputLatency');
    const outputJustification = document.getElementById('outputJustification');

    if (!outputId) return; // If elements don't exist, skip update

    // Determine requirement level and ID
    const level = formData.parentRequirement ? 2 : 1;
    let previewId = 'R?';
    if (level === 1) {
      previewId = `R${AppGlobals.state.reqCounter.level1}`;
    } else if (formData.parentRequirement) {
      const childrenCount = AppGlobals.state.allRequirements.filter(req => req.parentId === formData.parentRequirement).length;
      const parentNumber = formData.parentRequirement.replace('R', '');
      previewId = `R${parentNumber}-${childrenCount + 1}`;
    }

    // Update ID
    outputId.textContent = previewId;

    // Update function, variable, component
    outputFunction.textContent = formData.function || '-';
    outputVariable.textContent = formData.variable || '-';
    outputComponent.textContent = formData.component || '-';

    // Update logic/behavior section
    let logicText = '';
    if (formData.condition) {
      logicText += `Cuando ${formData.condition}, `;
    }
    if (formData.behavior) {
      logicText += `el sistema debe ${formData.behavior}`;
    }
    if (formData.tolerance) {
      logicText += ` con una tolerancia de ${formData.tolerance}`;
    }
    if (formData.mode) {
      logicText += ` en modo ${formData.mode}`;
    }
    
    outputLogic.textContent = logicText || 'Completa los campos para ver la descripción del requisito';

    // Update latency and justification
    outputLatency.textContent = formData.latency || '-';
    outputJustification.textContent = formData.justification || '-';
  },

  /**
   * Generate AI prompt for requirement refinement
   */
  generatePrompt() {
    const formData = this.getFormData();

    const prompt = `Por favor, ayúdame a refinar este requisito del sistema siguiendo la metodología del Systems Engineering Handbook:

**Contexto del Sistema:**
- Componente: ${formData.component || '[No especificado]'}
- Función Asociada: ${formData.func || '[No especificado]'}
- Variable Controlada: ${formData.variable || '[No especificado]'}
- Modo del Sistema: ${formData.mode || '[No especificado]'}

**Requisito Actual:**
${formData.condition ? `- Condición: ${formData.condition}` : ''}
- Comportamiento: ${formData.behavior || '[No especificado]'}
- Latencia Máxima: ${formData.latency || '[No especificado]'}
- Tolerancia: ${formData.tolerance || '[No especificado]'}
- Justificación: ${formData.justification || '[No especificado]'}

**Solicitud:**
1. Analiza si el requisito es claro, medible y verificable
2. Sugiere mejoras en la redacción del comportamiento
3. Evalúa si la latencia y tolerancia son apropiadas
4. Propone una justificación más sólida si es necesario
5. Identifica posibles requisitos derivados (sub-requisitos)

Por favor, proporciona retroalimentación constructiva y sugerencias específicas.`;

    // Copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      DOMUtils.showToast('Prompt copiado al portapapeles. Puedes pegarlo en tu IA favorita.', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      DOMUtils.showToast('Prompt copiado al portapapeles.', 'success');
    });
  }
};

// Expose CreateTab to window for global access
window.CreateTab = CreateTab;

console.log('✅ CreateTab module loaded successfully');
