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
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<Component[]>([]);
  latencySpecs = signal<LatencySpecification[]>([]);
  toleranceSpecs = signal<ToleranceSpecification[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  existingRequirements = signal<Requirement[]>([]);
  
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
    if (!this.requirementDraft.function_id || !this.requirementDraft.variable_id || 
        !this.requirementDraft.component_id || !this.requirementDraft.mode_id || 
        !this.requirementDraft.behavior.trim()) {
      return null;
    }
    
    return {
      id: 0, // Temporary ID for preview
      function_id: this.requirementDraft.function_id,
      variable_id: this.requirementDraft.variable_id,
      component_id: this.requirementDraft.component_id,
      mode_id: this.requirementDraft.mode_id,
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
        return !!(this.requirementDraft.component_id && this.requirementDraft.mode_id);
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
      this.requirementDraft.mode_id &&
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
    const mode = this.getSelectedMode();
    const behavior = this.requirementDraft.behavior;

    if (!component || !variable || !mode || !behavior) {
      return 'Completa todos los campos para ver la vista previa...';
    }

    return `El ${component.name} deberá ${behavior} ${variable.name} cuando el sistema esté en modo ${mode.name}`;
  }

  getPreviewRequirementId(): string {
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

    return `El ${component.name} deberá ${requirement.behavior} ${variable.name} cuando el sistema esté en modo ${mode.name}`;
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
      // Determine level and order index
      const level = this.requirementDraft.parent_id ? 2 : 1;
      const orderIndex = this.db.requirements.getNextRequirementOrderIndex(this.requirementDraft.parent_id);

      const newRequirement: Omit<Requirement, 'id'> = {
        function_id: this.requirementDraft.function_id!,
        variable_id: this.requirementDraft.variable_id!,
        component_id: this.requirementDraft.component_id!,
        mode_id: this.requirementDraft.mode_id!,
        parent_id: this.requirementDraft.parent_id || undefined,
        behavior: this.requirementDraft.behavior.trim(),
        condition: this.requirementDraft.condition.trim() || undefined,
        justification: this.requirementDraft.justification.trim() || undefined,
        level: level,
        order_index: orderIndex
      };

      const success = this.db.requirements.add(newRequirement);
      
      if (success) {
        this.showStatus('Requisito creado exitosamente', 'success');
        await this.loadAllData(); // Refresh data
        this.resetWizard();
      } else {
        throw new Error('Error al insertar en la base de datos');
      }
    } catch (error) {
      this.showStatus('Error al crear requisito: ' + error, 'error');
    } finally {
      this.isCreating.set(false);
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
