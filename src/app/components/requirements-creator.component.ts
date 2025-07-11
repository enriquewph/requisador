import { Component as NgComponent, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component, Mode, Requirement, LatencySpecification } from '../services/database.service';
import { FormsModule } from '@angular/forms';

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
  level: number;
  tolerance_value: number | null;
  tolerance_units: string;
  justification: string;
}

@NgComponent({
  selector: 'app-requirements-creator',
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Asistente de Creación de Requisitos</h2>
        <p class="text-gray-600">Crea requisitos estructurados siguiendo la metodología del Systems Engineering Handbook</p>
      </div>

      <!-- Wizard Progress -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          @for (step of wizardSteps; track step.id) {
            <div class="flex items-center" [class]="step.id < wizardSteps.length ? 'flex-1' : ''">
              <!-- Step Circle -->
              <div 
                [class]="currentStep() >= step.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'"
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                @if (step.completed) {
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                } @else {
                  {{step.id}}
                }
              </div>
              
              <!-- Step Info -->
              <div class="ml-3">
                <p [class]="currentStep() >= step.id ? 'text-primary-600' : 'text-gray-500'" 
                   class="text-sm font-medium">
                  {{step.title}}
                </p>
                <p class="text-xs text-gray-400">{{step.description}}</p>
              </div>
              
              <!-- Connector Line -->
              @if (step.id < wizardSteps.length) {
                <div class="flex-1 h-px bg-gray-200 mx-4"></div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow p-6">
        @switch (currentStep()) {
          @case (1) {
            <!-- Step 1: Select Function + Variable -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Paso 1: Selecciona Función y Variable</h3>
                <p class="text-gray-600 mb-6">Elige qué capacidad del sistema (Función) controlará qué parámetro (Variable)</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Functions Selection -->
                <div>
                  <label class="block text-sm font-medium text-blue-700 mb-3">Función del Sistema</label>
                  <div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                    @for (func of functions(); track func.id) {
                      <label class="flex items-center p-2 hover:bg-blue-50 rounded cursor-pointer">
                        <input 
                          type="radio" 
                          [value]="func.id" 
                          [(ngModel)]="requirementDraft.function_id"
                          name="function"
                          class="mr-3 text-blue-600">
                        <div>
                          <span class="font-medium text-blue-700">{{func.name}}</span>
                          @if (func.description) {
                            <p class="text-sm text-gray-600">{{func.description}}</p>
                          }
                        </div>
                      </label>
                    } @empty {
                      <p class="text-gray-500 text-center py-4">
                        No hay funciones configuradas. 
                        <a href="#" (click)="switchToConfig()" class="text-primary-600 hover:text-primary-700">
                          Configúralas primero
                        </a>
                      </p>
                    }
                  </div>
                </div>

                <!-- Variables Selection -->
                <div>
                  <label class="block text-sm font-medium text-green-700 mb-3">Variable a Controlar</label>
                  <div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                    @for (variable of variables(); track variable.id) {
                      <label class="flex items-center p-2 hover:bg-green-50 rounded cursor-pointer">
                        <input 
                          type="radio" 
                          [value]="variable.id" 
                          [(ngModel)]="requirementDraft.variable_id"
                          name="variable"
                          class="mr-3 text-green-600">
                        <div>
                          <span class="font-medium text-green-700">{{variable.name}}</span>
                          @if (variable.description) {
                            <p class="text-sm text-gray-600">{{variable.description}}</p>
                          }
                        </div>
                      </label>
                    } @empty {
                      <p class="text-gray-500 text-center py-4">
                        No hay variables configuradas. 
                        <a href="#" (click)="switchToConfig()" class="text-primary-600 hover:text-primary-700">
                          Configúralas primero
                        </a>
                      </p>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          @case (2) {
            <!-- Step 2: Choose Parent Requirement (Optional) -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Paso 2: Requisito Padre (Opcional)</h3>
                <p class="text-gray-600 mb-6">¿Este requisito es un sub-requisito de otro? Selecciona el requisito padre para crear una estructura jerárquica</p>
              </div>

              <div class="space-y-4">
                <!-- No Parent Option -->
                <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="radio" 
                    [value]="null" 
                    [(ngModel)]="requirementDraft.parent_id"
                    name="parent"
                    class="mr-3 text-primary-600">
                  <div>
                    <span class="font-medium text-gray-900">Requisito de Nivel Superior</span>
                    <p class="text-sm text-gray-600">Este será un requisito principal (R0, R1, R2, etc.)</p>
                  </div>
                </label>

                <!-- Existing Requirements as Parents -->
                @if (existingRequirements().length > 0) {
                  <div class="border-t pt-4">
                    <h4 class="font-medium text-gray-900 mb-3">Requisitos Existentes (Nivel 1)</h4>
                    <div class="space-y-2 max-h-64 overflow-y-auto">
                      @for (req of topLevelRequirements(); track req.id) {
                        <label class="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input 
                            type="radio" 
                            [value]="req.id" 
                            [(ngModel)]="requirementDraft.parent_id"
                            name="parent"
                            class="mr-3 mt-1 text-primary-600">
                          <div class="flex-1">
                            <span class="font-medium text-gray-900">{{generateRequirementId(req)}}</span>
                            <p class="text-sm text-gray-600 mt-1">{{generateRequirementText(req)}}</p>
                          </div>
                        </label>
                      }
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-8 text-gray-500">
                    <p>No hay requisitos existentes para usar como padre</p>
                    <p class="text-sm">Este será tu primer requisito</p>
                  </div>
                }
              </div>
            </div>
          }

          @case (3) {
            <!-- Step 3: Select Component + Mode -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Paso 3: Selecciona Componente y Modo</h3>
                <p class="text-gray-600 mb-6">Elige qué componente del sistema ejecutará la acción y en qué modo operativo</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Components Selection -->
                <div>
                  <label class="block text-sm font-medium text-indigo-700 mb-3">Componente del Sistema</label>
                  <div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                    @for (component of components(); track component.id) {
                      <label class="flex items-center p-2 hover:bg-indigo-50 rounded cursor-pointer">
                        <input 
                          type="radio" 
                          [value]="component.id" 
                          [(ngModel)]="requirementDraft.component_id"
                          name="component"
                          class="mr-3 text-indigo-600">
                        <div>
                          <span class="font-medium text-indigo-700">{{component.name}}</span>
                          @if (component.description) {
                            <p class="text-sm text-gray-600">{{component.description}}</p>
                          }
                        </div>
                      </label>
                    } @empty {
                      <p class="text-gray-500 text-center py-4">
                        No hay componentes configurados. 
                        <a href="#" (click)="switchToConfig()" class="text-primary-600 hover:text-primary-700">
                          Configúralos primero
                        </a>
                      </p>
                    }
                  </div>
                </div>

                <!-- Modes Selection (filtered by component) -->
                <div>
                  <label class="block text-sm font-medium text-purple-700 mb-3">Modo de Operación</label>
                  @if (requirementDraft.component_id) {
                    <div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                      @for (mode of getModesForComponent(requirementDraft.component_id); track mode.id) {
                        <label class="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer">
                          <input 
                            type="radio" 
                            [value]="mode.id" 
                            [(ngModel)]="requirementDraft.mode_id"
                            name="mode"
                            class="mr-3 text-purple-600">
                          <div>
                            <span class="font-medium text-purple-700">{{mode.name}}</span>
                            @if (mode.description) {
                              <p class="text-sm text-gray-600">{{mode.description}}</p>
                            }
                          </div>
                        </label>
                      } @empty {
                        <p class="text-gray-500 text-center py-4">
                          Este componente no tiene modos asociados. 
                          <a href="#" (click)="switchToConfig()" class="text-primary-600 hover:text-primary-700">
                            Configura las asociaciones
                          </a>
                        </p>
                      }
                    </div>
                  } @else {
                    <div class="border rounded-lg p-4 text-center text-gray-500">
                      <p>Primero selecciona un componente</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          @case (4) {
            <!-- Step 4: Behavior Description & Tolerances -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Paso 4: Comportamiento y Tolerancias</h3>
                <p class="text-gray-600 mb-6">Describe el comportamiento específico y define las tolerancias según las especificaciones de latencia</p>
              </div>

              <!-- Behavior Description -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Comportamiento Requerido *</label>
                  <textarea
                    [(ngModel)]="requirementDraft.behavior"
                    placeholder="Ej: monitorear y mantener, controlar la velocidad de, gestionar la comunicación de..."
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  </textarea>
                  <p class="text-xs text-gray-500 mt-1">
                    Describe la acción que debe realizar el componente. Usa verbos específicos y claros.
                  </p>
                </div>

                <!-- Behavior Suggestions -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-3">Sugerencias de Comportamientos</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    @for (suggestion of behaviorSuggestions; track suggestion) {
                      <button
                        (click)="addBehaviorSuggestion(suggestion)"
                        class="text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-primary-50 hover:border-primary-300 transition-colors">
                        {{suggestion}}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Latency Context (if variable has latency specification) -->
              @if (getSelectedVariable()?.latency_spec_id) {
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-medium text-blue-800 mb-3">Especificación de Latencia Asociada</h4>
                  <div class="text-sm text-blue-700 space-y-2">
                    @for (spec of latencySpecs(); track spec.id) {
                      @if (spec.id === getSelectedVariable()?.latency_spec_id) {
                        <p><strong>{{spec.name}}</strong> ({{spec.type}})</p>
                        <p>{{spec.physical_interpretation}}</p>
                        <p class="text-blue-600">Valor base: {{spec.value}} {{spec.units}}</p>
                      }
                    }
                  </div>
                </div>
              }

              <!-- Tolerance Specification -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 class="font-medium text-yellow-800 mb-4">Especificaciones de Tolerancia</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Valor de Tolerancia</label>
                    <input 
                      type="number" 
                      [(ngModel)]="requirementDraft.tolerance_value"
                      placeholder="Ej: ±5, 10, 0.5"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <p class="text-xs text-gray-500 mt-1">Valor numérico de la tolerancia permitida</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unidades</label>
                    <select 
                      [(ngModel)]="requirementDraft.tolerance_units"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Seleccionar unidades...</option>
                      <option value="ms">milisegundos (ms)</option>
                      <option value="s">segundos (s)</option>
                      <option value="us">microsegundos (μs)</option>
                      <option value="ns">nanosegundos (ns)</option>
                      <option value="%">porcentaje (%)</option>
                      <option value="Hz">Hertz (Hz)</option>
                      <option value="kHz">kiloHertz (kHz)</option>
                      <option value="MHz">megaHertz (MHz)</option>
                      <option value="rpm">revoluciones por minuto (rpm)</option>
                      <option value="m/s">metros por segundo (m/s)</option>
                      <option value="km/h">kilómetros por hora (km/h)</option>
                      <option value="°C">grados Celsius (°C)</option>
                      <option value="°F">grados Fahrenheit (°F)</option>
                      <option value="V">voltios (V)</option>
                      <option value="A">amperios (A)</option>
                      <option value="W">vatios (W)</option>
                      <option value="Pa">pascales (Pa)</option>
                      <option value="bar">bares (bar)</option>
                      <option value="psi">libras por pulgada cuadrada (psi)</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Unidades de medida para la tolerancia</p>
                  </div>
                </div>
              </div>

              <!-- Justification -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Justificación Técnica</label>
                <textarea
                  [(ngModel)]="requirementDraft.justification"
                  placeholder="Ej: Basado en estándares de usabilidad para interfaces críticas, requisitos de tiempo real del sistema..."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                </textarea>
                <p class="text-xs text-gray-500 mt-1">
                  Explica la razón técnica o normativa que justifica estos valores de tolerancia
                </p>
              </div>

              <!-- Tolerance Examples -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Ejemplos de Tolerancias Comunes</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div class="space-y-2">
                    <p><strong>Tiempo de Respuesta:</strong> ±100 ms</p>
                    <p><strong>Frecuencia de Muestreo:</strong> ±5 Hz</p>
                    <p><strong>Precisión de Posición:</strong> ±0.1 m</p>
                  </div>
                  <div class="space-y-2">
                    <p><strong>Temperatura:</strong> ±2 °C</p>
                    <p><strong>Velocidad:</strong> ±5%</p>
                    <p><strong>Presión:</strong> ±0.5 bar</p>
                  </div>
                </div>
              </div>
            </div>
          }

          @case (5) {
            <!-- Step 5: Preview & Confirm -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Paso 5: Vista Previa y Confirmación</h3>
                <p class="text-gray-600 mb-6">Revisa el requisito generado antes de crearlo</p>
              </div>

              <!-- Requirement Preview -->
              <div class="bg-gray-50 rounded-lg p-6">
                <h4 class="font-medium text-gray-900 mb-4">Requisito Generado</h4>
                
                <!-- Requirement ID Preview -->
                <div class="mb-4">
                  <span class="text-sm font-medium text-gray-700">ID: </span>
                  <span class="font-mono text-primary-600">{{getPreviewRequirementId()}}</span>
                </div>

                <!-- Requirement Text -->
                <div class="bg-white p-4 rounded border-l-4 border-primary-500">
                  <p class="text-lg text-gray-900">{{getPreviewRequirementText()}}</p>
                </div>

                <!-- Details Breakdown -->
                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-blue-700">Función:</span>
                    <p class="text-gray-600">{{getSelectedFunction()?.name}}</p>
                  </div>
                  <div>
                    <span class="font-medium text-green-700">Variable:</span>
                    <p class="text-gray-600">{{getSelectedVariable()?.name}}</p>
                  </div>
                  <div>
                    <span class="font-medium text-indigo-700">Componente:</span>
                    <p class="text-gray-600">{{getSelectedComponent()?.name}}</p>
                  </div>
                  <div>
                    <span class="font-medium text-purple-700">Modo:</span>
                    <p class="text-gray-600">{{getSelectedMode()?.name}}</p>
                  </div>
                </div>
              </div>

              <!-- Hierarchy Info -->
              @if (requirementDraft.parent_id) {
                <div class="bg-blue-50 rounded-lg p-4">
                  <h4 class="font-medium text-blue-900 mb-2">Estructura Jerárquica</h4>
                  <p class="text-blue-700">
                    Este requisito será un sub-requisito de: 
                    <span class="font-mono">{{getParentRequirementId()}}</span>
                  </p>
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Navigation Buttons -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between">
          <button
            (click)="previousStep()"
            [disabled]="currentStep() === 1"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Anterior
          </button>

          <div class="flex space-x-3">
            @if (currentStep() < 5) {
              <button
                (click)="nextStep()"
                [disabled]="!isCurrentStepValid()"
                class="primary disabled:opacity-50">
                Siguiente
              </button>
            } @else {
              <button
                (click)="createRequirement()"
                [disabled]="!isCurrentStepValid() || isCreating()"
                class="primary disabled:opacity-50">
                @if (isCreating()) {
                  Creando...
                } @else {
                  Crear Requisito
                }
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Status Message -->
      @if (statusMessage()) {
        <div [class]="statusMessage()!.type === 'success' 
          ? 'bg-green-100 border border-green-400 text-green-700' 
          : 'bg-red-100 border border-red-400 text-red-700'"
          class="px-4 py-3 rounded">
          <p>{{statusMessage()!.text}}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementsCreatorComponent implements OnInit {
  private db = inject(DatabaseService);
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<Component[]>([]);
  latencySpecs = signal<LatencySpecification[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  existingRequirements = signal<Requirement[]>([]);
  
  currentStep = signal(1);
  isCreating = signal(false);
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

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
    level: 1,
    tolerance_value: null,
    tolerance_units: '',
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

  async ngOnInit() {
    await this.loadAllData();
  }

  private async loadAllData() {
    try {
      // Wait for database to be ready
      while (!this.db.isDatabaseReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
        const [funcs, vars, comps, modes, modeComps, reqs, latencySpecs] = await Promise.all([
        Promise.resolve(this.db.getFunctions()),
        Promise.resolve(this.db.getVariables()),
        Promise.resolve(this.db.getComponents()),
        Promise.resolve(this.db.getModes()),
        Promise.resolve(this.db.getModeComponents()),
        Promise.resolve(this.db.getRequirements()),
        Promise.resolve(this.db.getLatencySpecifications())
      ]);
      
      this.functions.set(funcs);
      this.variables.set(vars);
      this.components.set(comps);
      this.modes.set(modes);
      this.modeComponents.set(modeComps);
      this.existingRequirements.set(reqs);
      this.latencySpecs.set(latencySpecs);
    } catch (error) {
      this.showStatus('Error al cargar datos: ' + error, 'error');
    }
  }

  // Navigation methods
  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep() < 5) {
      this.markStepCompleted(this.currentStep());
      this.currentStep.set(this.currentStep() + 1);
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
        const parentId = this.db.generateRequirementId(parent);
        const nextChildIndex = this.db.getNextRequirementOrderIndex(this.requirementDraft.parent_id);
        return `${parentId}-${nextChildIndex}`;
      }
    }
    const nextTopIndex = this.db.getNextRequirementOrderIndex(null);
    return `R${nextTopIndex}`;
  }

  getParentRequirementId(): string {
    const parent = this.existingRequirements().find(r => r.id === this.requirementDraft.parent_id);
    return parent ? this.generateRequirementId(parent) : '';
  }

  generateRequirementId(requirement: Requirement): string {
    return this.db.generateRequirementId(requirement);
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
      const orderIndex = this.db.getNextRequirementOrderIndex(this.requirementDraft.parent_id);

      const newRequirement: Omit<Requirement, 'id'> = {
        function_id: this.requirementDraft.function_id!,
        variable_id: this.requirementDraft.variable_id!,
        component_id: this.requirementDraft.component_id!,
        mode_id: this.requirementDraft.mode_id!,
        parent_id: this.requirementDraft.parent_id || undefined,
        behavior: this.requirementDraft.behavior.trim(),
        level: level,
        order_index: orderIndex
      };

      const newId = this.db.addRequirement(newRequirement);
      
      if (newId > 0) {
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
      level: 1,
      tolerance_value: null,
      tolerance_units: '',
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
}
