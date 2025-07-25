import { Component as NgComponent, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component, Mode, Requirement, LatencySpecification, ToleranceSpecification } from '../services/database.service';
import { FormsModule } from '@angular/forms';
import { RequirementDetailComponent } from './requirement-detail.component';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface RequirementDraft {
  function_id: number | null;
  variable_id: number | null;
  component_id: number | null;
  mode_id: number | null;
  parent_id: number | null;
  behavior: string;
  condition: string;
  level: number;
  justification: string;
}

@NgComponent({
  selector: 'app-requirements-creator',
  imports: [FormsModule, RequirementDetailComponent],
  templateUrl: './requirements-creator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementsCreatorComponent implements OnInit {
  private db = inject(DatabaseService);
  
  // Constants
  private readonly GENERIC_MODE_ID = 0; // ID del modo genérico para requisitos padre
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<Component[]>([]);
  latencySpecs = signal<LatencySpecification[]>([]);
  toleranceSpecs = signal<ToleranceSpecification[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  existingRequirements = signal<Requirement[]>([]);
  
  // Multi-selection signal (only for modes, component is single selection)
  selectedModes = signal<number[]>([]);
  
  currentStep = signal(1);
  isCreating = signal(false);
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Selected specification IDs for Step 4
  selectedLatencySpecId = signal<number | null>(null);
  selectedToleranceSpecId = signal<number | null>(null);

  // Computed values for dropdown display (convert null to empty string)
  latencyDropdownValue = computed(() => {
    const value = this.selectedLatencySpecId();
    return value === null ? "" : value.toString();
  });
  
  toleranceDropdownValue = computed(() => {
    const value = this.selectedToleranceSpecId();
    return value === null ? "" : value.toString();
  });

  // Wizard configuration
  wizardSteps: WizardStep[] = [
    { id: 1, title: 'Función + Variable', description: 'Capacidad y parámetro', completed: false },
    { id: 2, title: 'Requisito Padre', description: 'Estructura jerárquica', completed: false },
    { id: 3, title: 'Componente + Modo', description: 'Ejecutor y contexto', completed: false },
    { id: 4, title: 'Comportamiento', description: 'Descripción de la acción', completed: false },
    { id: 5, title: 'Vista Previa', description: 'Confirmar y crear', completed: false }
  ];

  // Draft requirement
  requirementDraft: RequirementDraft = {
    function_id: null,
    variable_id: null,
    component_id: null,
    mode_id: null,
    parent_id: null,
    behavior: '',
    condition: '',
    level: 1,
    justification: ''
  };

  // Behavior suggestions
  behaviorSuggestions = [
    'controlar',
    'monitorear',
    'gestionar',
    'mantener',
    'verificar',
    'procesar',
    'transmitir',
    'recibir',
    'calcular',
    'ajustar',
    'validar',
    'almacenar'
  ];

  // Computed properties
  topLevelRequirements = computed(() => 
    this.existingRequirements().filter(req => !req.parent_id)
  );

  // Generate a preview requirement object from the draft
  previewRequirement = computed(() => {
    // For single mode: check selectedModes, for multiple modes: we don't show individual preview
    const selectedModeCount = this.selectedModes().length;
    const modeId = selectedModeCount === 1 ? this.selectedModes()[0] : null;
    
    if (!this.requirementDraft.function_id || !this.requirementDraft.variable_id || 
        !this.requirementDraft.component_id || selectedModeCount === 0 || 
        !this.requirementDraft.behavior.trim()) {
      return null;
    }
    
    // Only show individual preview for single mode
    if (selectedModeCount !== 1) {
      return null;
    }
    
    return {
      id: 0, // Temporary ID for preview
      function_id: this.requirementDraft.function_id,
      variable_id: this.requirementDraft.variable_id,
      component_id: this.requirementDraft.component_id,
      mode_id: modeId!, // Use the selected mode for single mode case
      parent_id: this.requirementDraft.parent_id,
      behavior: this.requirementDraft.behavior,
      condition: this.requirementDraft.condition,
      justification: this.requirementDraft.justification,
      level: this.requirementDraft.level,
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Requirement;
  });

  async ngOnInit() {
    await this.loadAllData();
  }

  private async loadAllData() {
    try {
      // Wait for database to be ready
      while (!this.db.isReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
        const [funcs, vars, comps, modes, modeComps, reqs, latencySpecs, toleranceSpecs] = await Promise.all([
        Promise.resolve(this.db.functions.getAll()),
        Promise.resolve(this.db.variables.getAll()),
        Promise.resolve(this.db.components.getAll()),
        Promise.resolve(this.db.modes.getAll()),
        Promise.resolve(this.db.modes.getModeComponents()),
        Promise.resolve(this.db.requirements.getAll()),
        Promise.resolve(this.db.latencySpecifications.getAll()),
        Promise.resolve(this.db.toleranceSpecifications.getAll())
      ]);
      
      this.functions.set(funcs);
      this.variables.set(vars);
      this.components.set(comps);
      this.modes.set(modes);
      this.modeComponents.set(modeComps);
      this.existingRequirements.set(reqs);
      this.latencySpecs.set(latencySpecs);
      this.toleranceSpecs.set(toleranceSpecs);
    } catch (error) {
      this.showStatus('Error al cargar datos: ' + error, 'error');
    }
  }

  // Navigation methods
  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep() < 5) {
      this.markStepCompleted(this.currentStep());
      const newStep = this.currentStep() + 1;
      this.currentStep.set(newStep);
      
      // Initialize specification IDs when entering step 4
      if (newStep === 4) {
        this.initializeSpecificationSelections();
      }
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  markStepCompleted(stepId: number) {
    const step = this.wizardSteps.find(s => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  // Validation methods
  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!(this.requirementDraft.function_id && this.requirementDraft.variable_id);
      case 2:
        return true; // Parent is optional
      case 3:
        // Always use single component + multiple modes
        return !!(this.requirementDraft.component_id && this.selectedModes().length > 0);
      case 4:
        return !!this.requirementDraft.behavior.trim();
      case 5:
        return this.isAllDataValid();
      default:
        return false;
    }
  }

  private isAllDataValid(): boolean {
    return !!(
      this.requirementDraft.function_id &&
      this.requirementDraft.variable_id &&
      this.requirementDraft.component_id &&
      this.selectedModes().length > 0 &&
      this.requirementDraft.behavior.trim()
    );
  }

  // Helper methods
  getModesForComponent(componentId: number): Mode[] {
    const associatedModeIds = this.modeComponents()
      .filter(mc => mc.component_id === componentId)
      .map(mc => mc.mode_id);
    
    return this.modes().filter(mode => 
      mode.id && associatedModeIds.includes(mode.id)
    );
  }

  getModesForMultipleComponents(componentIds: number[]): Mode[] {
    if (componentIds.length === 0) return [];
    
    // Get mode IDs that are associated with ALL selected components
    const modeIdSets = componentIds.map(componentId => {
      const associatedModeIds = this.modeComponents()
        .filter(mc => mc.component_id === componentId)
        .map(mc => mc.mode_id);
      return new Set(associatedModeIds);
    });
    
    // Find intersection of all mode ID sets
    const commonModeIds = modeIdSets.reduce((intersection, currentSet) => {
      return new Set([...intersection].filter(id => currentSet.has(id)));
    });
    
    return this.modes().filter(mode => 
      mode.id && commonModeIds.has(mode.id)
    );
  }

  // Multi-selection methods (only for modes, component is single selection)
  toggleModeSelection(modeId: number) {
    const current = this.selectedModes();
    const index = current.indexOf(modeId);
    if (index > -1) {
      // Remove mode
      const updated = [...current];
      updated.splice(index, 1);
      this.selectedModes.set(updated);
    } else {
      // Add mode
      this.selectedModes.set([...current, modeId]);
    }
  }

  isModeSelected(modeId: number): boolean {
    return this.selectedModes().includes(modeId);
  }

  // Get available modes for selected components
  getAvailableModesForSelectedComponents(): Mode[] {
    if (!this.requirementDraft.component_id) {
      return [];
    }

    // Get modes that are associated with the selected component
    return this.getModesForComponent(this.requirementDraft.component_id!);
  }

  addBehaviorSuggestion(suggestion: string) {
    if (this.requirementDraft.behavior) {
      this.requirementDraft.behavior += ' ' + suggestion;
    } else {
      this.requirementDraft.behavior = suggestion;
    }
  }

  // Preview methods
  getSelectedFunction(): Function | undefined {
    return this.functions().find(f => f.id === this.requirementDraft.function_id);
  }

  getSelectedVariable(): Variable | undefined {
    return this.variables().find(v => v.id === this.requirementDraft.variable_id);
  }

  getSelectedComponent(): Component | undefined {
    return this.components().find(c => c.id === this.requirementDraft.component_id);
  }

  getSelectedMode(): Mode | undefined {
    return this.modes().find(m => m.id === this.requirementDraft.mode_id);
  }

  getPreviewRequirementText(): string {
    const component = this.getSelectedComponent();
    const variable = this.getSelectedVariable();
    const behavior = this.requirementDraft.behavior;
    const selectedModeCount = this.selectedModes().length;

    if (!component || !variable || !behavior || selectedModeCount === 0) {
      return 'Completa todos los campos para ver la vista previa...';
    }

    if (selectedModeCount === 1) {
      const mode = this.modes().find(m => m.id === this.selectedModes()[0]);
      return `El ${component.name} deberá ${behavior} ${variable.name} cuando el sistema esté en modo ${mode?.name}`;
    } else {
      return `Se crearán ${selectedModeCount + 1} requisitos: 1 padre genérico + ${selectedModeCount} hijos (uno por cada modo seleccionado)`;
    }
  }

  getPreviewRequirementId(): string {
    const selectedModeCount = this.selectedModes().length;
    
    if (selectedModeCount === 1) {
      // Single mode - show normal ID
      if (this.requirementDraft.parent_id) {
        const parent = this.existingRequirements().find(r => r.id === this.requirementDraft.parent_id);
        if (parent) {
          const parentId = this.db.requirements.generateRequirementId(parent);
          const nextChildIndex = this.db.requirements.getNextRequirementOrderIndex(this.requirementDraft.parent_id);
          return `${parentId}-${nextChildIndex}`;
        }
      }
      const nextTopIndex = this.db.requirements.getNextRequirementOrderIndex(null);
      return `R${nextTopIndex}`;
    } else {
      // Multiple modes - show range
      return 'Se generarán IDs automáticamente según la jerarquía';
    }
  }

  // Get preview information for multiple creation
  getMultipleCreationPreview(): { componentName: string, modes: string[] }[] {
    if (!this.requirementDraft.component_id) return [];
    
    const component = this.components().find(c => c.id === this.requirementDraft.component_id);
    const selectedModeNames = this.selectedModes()
      .map(modeId => this.modes().find(m => m.id === modeId)?.name)
      .filter(name => name) as string[];
    
    return [{
      componentName: component?.name || 'Componente desconocido',
      modes: selectedModeNames
    }];
  }

  getMultipleRequirementsCount(): number {
    if (!this.requirementDraft.component_id || this.selectedModes().length <= 1) return 0;
    
    // Create 1 parent + N children (one per mode) - only for multiple modes
    return 1 + this.selectedModes().length;
  }

  getMultipleRequirementsPreview(): { id: string, text: string }[] {
    if (!this.requirementDraft.component_id || this.selectedModes().length <= 1) return [];
    
    const previews: { id: string, text: string }[] = [];
    const variable = this.variables().find(v => v.id === this.requirementDraft.variable_id);
    const component = this.components().find(c => c.id === this.requirementDraft.component_id);
    
    if (!variable || !component) return [];

    // Parent requirement ID and text
    const parentId = this.requirementDraft.parent_id 
      ? `${this.getParentRequirementId()}-0`
      : `R0`;
    
    const parentText = `El ${component.name} deberá ${this.requirementDraft.behavior} ${variable.name}`;
    previews.push({ id: parentId, text: parentText });
    
    // Child requirements for each selected mode
    this.selectedModes().forEach((modeId, index) => {
      const mode = this.modes().find(m => m.id === modeId);
      if (mode) {
        const childId = `${parentId}-${index}`;
        const childText = `El ${component.name} deberá ${this.requirementDraft.behavior} ${variable.name} cuando el sistema esté en modo ${mode.name}`;
        previews.push({ id: childId, text: childText });
      }
    });
    
    return previews;
  }

  getParentRequirementId(): string {
    const parent = this.existingRequirements().find(r => r.id === this.requirementDraft.parent_id);
    return parent ? this.generateRequirementId(parent) : '';
  }

  generateRequirementId(requirement: Requirement): string {
    return this.db.requirements.generateRequirementId(requirement);
  }

  generateRequirementText(requirement: Requirement): string {
    const func = this.functions().find(f => f.id === requirement.function_id);
    const variable = this.variables().find(v => v.id === requirement.variable_id);
    const component = this.components().find(c => c.id === requirement.component_id);
    const mode = this.modes().find(m => m.id === requirement.mode_id);

    if (!func || !variable || !component || !mode) {
      return 'Error: Datos incompletos';
    }

    // Handle generic mode (parent requirement) differently
    if (requirement.mode_id === this.GENERIC_MODE_ID) {
      return `El ${component.name} deberá ${requirement.behavior} ${variable.name}`;
    } else {
      return `El ${component.name} deberá ${requirement.behavior} ${variable.name} cuando el sistema esté en modo ${mode.name}`;
    }
  }

  getSelectedVariableLatency(): LatencySpecification | null {
    const selectedVariable = this.getSelectedVariable();
    if (!selectedVariable?.latency_spec_id) return null;
    return this.latencySpecs().find(ls => ls.id === selectedVariable.latency_spec_id) || null;
  }

  // Creation method
  async createRequirement() {
    if (!this.isAllDataValid()) return;

    this.isCreating.set(true);
    try {
      if (this.selectedModes().length === 1) {
        // Single mode - create one requirement
        await this.createSingleRequirement();
      } else {
        // Multiple modes - create parent + children
        await this.createMultipleRequirements();
      }
    } catch (error) {
      this.showStatus('Error al crear requisito(s): ' + error, 'error');
    } finally {
      this.isCreating.set(false);
    }
  }

  private async createSingleRequirement() {
    // Determine level and order index
    const level = this.requirementDraft.parent_id ? 2 : 1;
    const orderIndex = this.db.requirements.getNextRequirementOrderIndex(this.requirementDraft.parent_id);

    const newRequirement: Omit<Requirement, 'id'> = {
      function_id: this.requirementDraft.function_id!,
      variable_id: this.requirementDraft.variable_id!,
      component_id: this.requirementDraft.component_id!,
      mode_id: this.selectedModes()[0], // Use first selected mode
      parent_id: this.requirementDraft.parent_id || undefined,
      behavior: this.requirementDraft.behavior.trim(),
      condition: this.requirementDraft.condition.trim() || undefined,
      justification: this.requirementDraft.justification.trim() || undefined,
      level: level,
      order_index: orderIndex
    };

    const insertedId = this.db.requirements.add(newRequirement);
    
    if (insertedId) {
      this.showStatus('Requisito creado exitosamente', 'success');
      await this.loadAllData();
      this.resetWizard();
    } else {
      throw new Error('Error al insertar en la base de datos');
    }
  }

  private async createMultipleRequirements() {
    let createdCount = 0;
    const errors: string[] = [];

    try {
      // Create parent requirement (using generic mode)
      const parentOrderIndex = this.db.requirements.getNextRequirementOrderIndex(this.requirementDraft.parent_id);
      
      const parentRequirement: Omit<Requirement, 'id'> = {
        function_id: this.requirementDraft.function_id!,
        variable_id: this.requirementDraft.variable_id!,
        component_id: this.requirementDraft.component_id!,
        mode_id: this.GENERIC_MODE_ID, // Use generic mode for parent requirement
        parent_id: this.requirementDraft.parent_id || undefined,
        behavior: this.requirementDraft.behavior.trim(),
        condition: this.requirementDraft.condition.trim() || undefined,
        justification: this.requirementDraft.justification.trim() || undefined,
        level: this.requirementDraft.parent_id ? 2 : 1,
        order_index: parentOrderIndex
      };

      const parentId = this.db.requirements.add(parentRequirement);
      if (parentId) {
        createdCount++;

        // Create child requirements (one per selected mode)
        for (const modeId of this.selectedModes()) {
          try {
            const childOrderIndex = this.db.requirements.getNextRequirementOrderIndex(parentId);
            
            const childRequirement: Omit<Requirement, 'id'> = {
              function_id: this.requirementDraft.function_id!,
              variable_id: this.requirementDraft.variable_id!,
              component_id: this.requirementDraft.component_id!,
              mode_id: modeId,
              parent_id: parentId,
              behavior: this.requirementDraft.behavior.trim(),
              condition: this.requirementDraft.condition.trim() || undefined,
              justification: this.requirementDraft.justification.trim() || undefined,
              level: (this.requirementDraft.parent_id ? 2 : 1) + 1, // One level deeper than parent
              order_index: childOrderIndex
            };

            const childId = this.db.requirements.add(childRequirement);
            if (childId) {
              createdCount++;
            } else {
              const mode = this.modes().find(m => m.id === modeId);
              errors.push(`Error creando requisito hijo para modo ${mode?.name || modeId}`);
            }
          } catch (error) {
            const mode = this.modes().find(m => m.id === modeId);
            errors.push(`Error creando requisito hijo para modo ${mode?.name || modeId}: ${error}`);
          }
        }
      } else {
        errors.push(`Error creando requisito padre`);
      }

      // Show results
      if (errors.length > 0) {
        this.showStatus(`Creados ${createdCount} requisitos con ${errors.length} errores`, 'error');
        console.error('Errores en creación múltiple:', errors);
      } else {
        this.showStatus(`${createdCount} requisitos creados exitosamente (1 padre + ${this.selectedModes().length} hijos)`, 'success');
      }

      await this.loadAllData();
      this.resetWizard();
      this.currentStep.set(1);

    } catch (error) {
      console.error('Error in createMultipleRequirements:', error);
      this.showStatus(`Error al crear requisitos: ${error}`, 'error');
    }
  }

  resetWizard() {
    this.currentStep.set(1);
    this.requirementDraft = {
      function_id: null,
      variable_id: null,
      component_id: null,
      mode_id: null,
      parent_id: null,
      behavior: '',
      condition: '',
      level: 1,
      justification: ''
    };
    // Reset mode selection (no longer need component selection)
    this.selectedModes.set([]);
    this.wizardSteps.forEach(step => step.completed = false);
  }

  switchToConfig() {
    // This would emit an event to switch tabs
    console.log('Switch to configuration tab');
  }

  private showStatus(text: string, type: 'success' | 'error') {
    this.statusMessage.set({text, type});
    setTimeout(() => this.statusMessage.set(null), 3000);
  }

  // Specification management methods
  initializeSpecificationSelections() {
    const selectedVariable = this.getSelectedVariable();
    if (selectedVariable) {
      // Convert null/undefined to empty string for dropdown display consistency
      this.selectedLatencySpecId.set(selectedVariable.latency_spec_id || null);
      this.selectedToleranceSpecId.set(selectedVariable.tolerance_spec_id || null);
    } else {
      // If no variable selected, initialize with null
      this.selectedLatencySpecId.set(null);
      this.selectedToleranceSpecId.set(null);
    }
  }

  async updateVariableLatencySpec(latencySpecId: number | string | null) {
    // Convert empty string to null, and string numbers to numbers
    const specId = latencySpecId === "" || latencySpecId === null ? null : Number(latencySpecId);
    this.selectedLatencySpecId.set(specId);
    const selectedVariable = this.getSelectedVariable();
    if (selectedVariable?.id) {
      try {
        const updateData = {
          name: selectedVariable.name,
          description: selectedVariable.description,
          order_index: selectedVariable.order_index,
          latency_spec_id: specId || undefined,
          tolerance_spec_id: selectedVariable.tolerance_spec_id
        };
        
        const success = this.db.variables.update(selectedVariable.id!, updateData);
        if (success) {
          // Update the local variables list
          await this.loadAllData();
          this.showStatus('Especificación de latencia actualizada correctamente', 'success');
        } else {
          this.showStatus('Error al actualizar la especificación de latencia', 'error');
        }
      } catch (error) {
        this.showStatus('Error al actualizar la especificación de latencia: ' + error, 'error');
      }
    }
  }

  generateAIPrompt(): string {
    const selectedFunction = this.getSelectedFunction();
    const selectedVariable = this.getSelectedVariable();
    const selectedComponent = this.getSelectedComponent();
    const selectedLatencySpec = this.latencySpecs().find(s => s.id === this.selectedLatencySpecId());
    const selectedToleranceSpec = this.toleranceSpecs().find(s => s.id === this.selectedToleranceSpecId());
    const selectedModeNames = this.selectedModes().map(id => 
      this.modes().find(m => m.id === id)?.name
    ).filter(Boolean).join(", ");

    const prompt = `# Prompt para Generación de Requisito de Sistema

## Contexto del Sistema
Estoy desarrollando requisitos para un sistema de ingeniería siguiendo la metodología del Systems Engineering Handbook. Necesito que me ayudes a completar un requisito con campos muy específicos y concisos.

## Información del Requisito Actual

**Función del Sistema:** ${selectedFunction?.name || 'No especificado'}
${selectedFunction?.description ? `- Descripción: ${selectedFunction.description}` : ''}

**Variable a Controlar:** ${selectedVariable?.name || 'No especificado'}  
${selectedVariable?.description ? `- Descripción: ${selectedVariable.description}` : ''}

**Componente Responsable:** ${selectedComponent?.name || 'No especificado'}
${selectedComponent?.description ? `- Descripción: ${selectedComponent.description}` : ''}

**Modo(s) del Sistema:** ${selectedModeNames || 'No especificado'}

## Especificaciones Técnicas Aplicables

${selectedLatencySpec ? `**Especificación de Latencia:**
- Nombre: ${selectedLatencySpec.name}
- Tipo: ${selectedLatencySpec.type}
- Valor: ${selectedLatencySpec.value} ${selectedLatencySpec.units}
- Interpretación: ${selectedLatencySpec.physical_interpretation}` : '**Especificación de Latencia:** No asignada'}

${selectedToleranceSpec ? `**Especificación de Tolerancia:**
- Nombre: ${selectedToleranceSpec.name}
- Tipo: ${selectedToleranceSpec.type}
- Valor: ${selectedToleranceSpec.value} ${selectedToleranceSpec.units}
- Interpretación: ${selectedToleranceSpec.physical_interpretation}` : '**Especificación de Tolerancia:** No asignada'}

## Entidades del Sistema Completo

### Funciones Disponibles:
${this.functions().map(f => `- **${f.name}**: ${f.description || 'Sin descripción'}`).join('\n')}

### Variables del Sistema:
${this.variables().map(v => `- **${v.name}**: ${v.description || 'Sin descripción'}`).join('\n')}

### Componentes del Sistema:
${this.components().map(c => `- **${c.name}**: ${c.description || 'Sin descripción'}`).join('\n')}

### Modos de Operación:  
${this.modes().map(m => `- **${m.name}**: ${m.description || 'Sin descripción'}`).join('\n')}

### Especificaciones de Latencia:
${this.latencySpecs().map(s => `- **${s.name}** (${s.type}): ${s.value} ${s.units} - ${s.physical_interpretation}`).join('\n')}

### Especificaciones de Tolerancia:
${this.toleranceSpecs().map(s => `- **${s.name}** (${s.type}): ${s.value} ${s.units} - ${s.physical_interpretation}`).join('\n')}

## IMPORTANTE - Formato Requerido:

Necesito que completes ÚNICAMENTE estos 3 campos con las restricciones específicas:

### 1. **Comportamiento Requerido** (MÁXIMO 8 PALABRAS)
- Un verbo de acción técnico + objeto directo
- Ejemplos: "controlar velocidad del motor", "monitorear temperatura del sensor", "procesar datos de navegación"
- NO explicaciones largas, solo la acción específica

### 2. **Condición** (MÁXIMO 10 PALABRAS)  
- Las condiciones mínimas para aplicar el requisito
- Ejemplos: "cuando temperatura > 50°C", "durante modo de emergencia", "cada 100ms"
- Enfócate en umbrales, frecuencias o estados específicos

### 3. **Justificación** (2-3 LÍNEAS MÁXIMO)
- Por qué es necesario ESTE REQUISITO específico (no las especificaciones técnicas)
- Impacto en seguridad, rendimiento, cumplimiento normativo o funcionalidad del sistema
- Referencias a estándares si aplica

## Ejemplo de Respuesta Correcta:
**Comportamiento:** controlar velocidad del motor
**Condición:** cuando velocidad excede límite configurado  
**Justificación:** Evita daños mecánicos por sobrevelocidad y asegura operación segura del sistema según norma ISO 26262 para sistemas automotrices críticos.

## Tu Respuesta:`;

    return prompt;
  }

  async copyAIPromptToClipboard() {
    try {
      const prompt = this.generateAIPrompt();
      await navigator.clipboard.writeText(prompt);
      this.showStatus('Prompt copiado al portapapeles exitosamente', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showStatus('Error al copiar al portapapeles', 'error');
    }
  }

  async updateVariableToleranceSpec(toleranceSpecId: number | string | null) {
    // Convert empty string to null, and string numbers to numbers
    const specId = toleranceSpecId === "" || toleranceSpecId === null ? null : Number(toleranceSpecId);
    this.selectedToleranceSpecId.set(specId);
    const selectedVariable = this.getSelectedVariable();
    if (selectedVariable?.id) {
      try {
        const updateData = {
          name: selectedVariable.name,
          description: selectedVariable.description,
          order_index: selectedVariable.order_index,
          latency_spec_id: selectedVariable.latency_spec_id,
          tolerance_spec_id: specId || undefined
        };
        
        const success = this.db.variables.update(selectedVariable.id!, updateData);
        if (success) {
          // Update the local variables list
          await this.loadAllData();
          this.showStatus('Especificación de tolerancia actualizada correctamente', 'success');
        } else {
          this.showStatus('Error al actualizar la especificación de tolerancia', 'error');
        }
      } catch (error) {
        this.showStatus('Error al actualizar la especificación de tolerancia: ' + error, 'error');
      }
    }
  }
}
