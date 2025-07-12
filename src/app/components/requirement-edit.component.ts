import { Component, signal, computed, inject, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component as SystemComponent, Mode, Requirement } from '../services/database.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-requirement-edit',
  imports: [FormsModule],
  templateUrl: './requirement-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementEditComponent implements OnInit {
  private db = inject(DatabaseService);
  
  @Input() requirement: Requirement | null = null;
  @Input() requirementId: string = '';
  @Output() onSave = new EventEmitter<Requirement>();
  @Output() onCancel = new EventEmitter<void>();
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<SystemComponent[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  existingRequirements = signal<Requirement[]>([]);
  
  isUpdating = signal(false);
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Form data signals for reactivity
  formData = {
    function_id: signal<number | null>(null),
    variable_id: signal<number | null>(null),
    component_id: signal<number | null>(null),
    mode_id: signal<number | null>(null),
    parent_id: signal<number | null>(null),
    behavior: signal<string>(''),
    condition: signal<string>(''),
    justification: signal<string>(''),
    level: signal<number>(0)
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

  // Computed values
  availableComponents = computed(() => {
    const selectedModeId = this.formData.mode_id();
    if (!selectedModeId) return this.components();
    
    const validComponentIds = this.modeComponents()
      .filter(mc => mc.mode_id === selectedModeId)
      .map(mc => mc.component_id);
    
    return this.components().filter(c => validComponentIds.includes(c.id!));
  });

  selectedFunction = computed(() => {
    return this.functions().find(f => f.id === this.formData.function_id()) || null;
  });

  selectedVariable = computed(() => {
    return this.variables().find(v => v.id === this.formData.variable_id()) || null;
  });

  selectedComponent = computed(() => {
    return this.components().find(c => c.id === this.formData.component_id()) || null;
  });

  selectedMode = computed(() => {
    return this.modes().find(m => m.id === this.formData.mode_id()) || null;
  });

  parentRequirement = computed(() => {
    return this.existingRequirements().find(r => r.id === this.formData.parent_id()) || null;
  });

  // Available modes based on selected component
  availableModes = computed(() => {
    if (!this.formData.component_id()) {
      return this.modes();
    }
    
    // Filter modes that are associated with the selected component
    const validModeIds = this.modeComponents()
      .filter(mc => mc.component_id === this.formData.component_id())
      .map(mc => mc.mode_id);
    
    return this.modes().filter(mode => validModeIds.includes(mode.id!));
  });

  // Check if current mode-component combination is valid
  isModeComponentValid = computed(() => {
    if (!this.formData.component_id() || !this.formData.mode_id()) {
      return true; // If either is not selected, don't show error yet
    }
    
    return this.modeComponents().some(mc => 
      mc.component_id === this.formData.component_id() && 
      mc.mode_id === this.formData.mode_id()
    );
  });

  // Validation
  isFormValid = computed(() => {
    return !!(
      this.formData.function_id() &&
      this.formData.variable_id() &&
      this.formData.component_id() &&
      this.formData.mode_id() &&
      this.formData.behavior().trim() &&
      this.isModeComponentValid() // Add mode-component validation
    );
  });

  // Preview text generation
  previewText = computed(() => {
    const func = this.selectedFunction();
    const variable = this.selectedVariable();
    const component = this.selectedComponent();
    const mode = this.selectedMode();
    
    if (!func || !variable || !component || !mode || !this.formData.behavior().trim()) {
      return 'Completa todos los campos para ver la vista previa...';
    }

    return `El ${component.name} deberá ${this.formData.behavior().trim()} ${variable.name} cuando el sistema esté en modo ${mode.name}`;
  });

  ngOnInit() {
    this.loadData();
    this.populateFormFromRequirement();
  }

  private async loadData() {
    if (!this.db.isReady()) {
      setTimeout(() => this.loadData(), 100);
      return;
    }

    try {
      this.functions.set(this.db.functions.getAll());
      this.variables.set(this.db.variables.getAll());
      this.components.set(this.db.components.getAll());
      this.modes.set(this.db.modes.getAll());
      this.modeComponents.set(this.db.modes.getModeComponents());
      this.existingRequirements.set(this.db.requirements.getAll());
    } catch (error) {
      console.error('Error loading data:', error);
      this.statusMessage.set({
        text: 'Error al cargar datos. Por favor, recarga la página.',
        type: 'error'
      });
    }
  }

  private populateFormFromRequirement() {
    if (this.requirement) {
      this.formData.function_id.set(this.requirement.function_id);
      this.formData.variable_id.set(this.requirement.variable_id);
      this.formData.component_id.set(this.requirement.component_id);
      this.formData.mode_id.set(this.requirement.mode_id);
      this.formData.parent_id.set(this.requirement.parent_id || null);
      this.formData.behavior.set(this.requirement.behavior);
      this.formData.condition.set(this.requirement.condition || '');
      this.formData.justification.set(this.requirement.justification || '');
      this.formData.level.set(this.requirement.level);
    }
  }

  onComponentChange() {
    // If the current mode is not valid for the new component, reset it
    if (this.formData.component_id() && this.formData.mode_id()) {
      const isValid = this.modeComponents().some(mc => 
        mc.component_id === this.formData.component_id() && 
        mc.mode_id === this.formData.mode_id()
      );
      
      if (!isValid) {
        this.formData.mode_id.set(null);
      }
    }
  }

  onModeChange() {
    // Mode validation is handled by the computed properties
    // This method can be used for any additional mode-specific logic
  }

  addBehaviorSuggestion(suggestion: string) {
    if (this.formData.behavior().trim()) {
      this.formData.behavior.set(this.formData.behavior() + ' ' + suggestion);
    } else {
      this.formData.behavior.set(suggestion);
    }
  }

  async saveRequirement() {
    if (!this.isFormValid() || !this.requirement) {
      return;
    }

    this.isUpdating.set(true);
    this.statusMessage.set(null);

    try {
      // Create the updated requirement object
      const updatedRequirement: Requirement = {
        ...this.requirement,
        function_id: this.formData.function_id()!,
        variable_id: this.formData.variable_id()!,
        component_id: this.formData.component_id()!,
        mode_id: this.formData.mode_id()!,
        parent_id: this.formData.parent_id() || undefined,
        behavior: this.formData.behavior().trim(),
        condition: this.formData.condition().trim() || undefined,
        justification: this.formData.justification().trim() || undefined,
        updated_at: new Date().toISOString()
      };

      this.statusMessage.set({
        text: `Guardando cambios...`,
        type: 'success'
      });

      // Emit the updated requirement to parent component
      this.onSave.emit(updatedRequirement);

    } catch (error) {
      console.error('Error preparing requirement update:', error);
      this.statusMessage.set({
        text: 'Error al preparar los cambios. Por favor, inténtalo de nuevo.',
        type: 'error'
      });
      this.isUpdating.set(false);
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  clearStatusMessage() {
    this.statusMessage.set(null);
  }
}
