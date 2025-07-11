import { Component as NgComponent, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component, Mode, LatencySpecification, ToleranceSpecification } from '../services/database.service';
import { FormsModule } from '@angular/forms';

@NgComponent({
  selector: 'app-configuration',
  imports: [FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m0 0l-2 2m2-2l-2-2M7 7h0m0 0v0m0 0h0M7 7l2 2m-2-2v2m0-2l-2 2m2-2h2"/>
          </svg>
          <span>Gestión de Entidades</span>
        </h2>
        <p class="text-gray-600">Gestiona las entidades fundamentales para la creación de requisitos</p>
      </div>

      <!-- Functions Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-blue-600 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span>Funciones</span>
          </h3>
          <span class="text-sm text-gray-500">{{functions().length}} funciones</span>
        </div>
        
        <!-- Add Function Form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <input
            [(ngModel)]="newFunction.name"
            placeholder="Nombre de la función"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <input
            [(ngModel)]="newFunction.description"
            placeholder="Descripción"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <button
            (click)="addFunction()"
            [disabled]="!newFunction.name"
            class="primary disabled:opacity-50 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Agregar Función</span>
          </button>
        </div>

        <!-- Functions List -->
        <div class="space-y-2">
          @for (func of functions(); track func.id) {
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div class="flex-1">
                <span class="font-medium text-blue-700">{{func.name}}</span>
                @if (func.description) {
                  <span class="text-gray-600 ml-3">{{func.description}}</span>
                }
              </div>
              <button
                (click)="func.id && deleteFunction(func.id)"
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          } @empty {
            <p class="text-gray-500 text-center py-8">No hay funciones configuradas</p>
          }
        </div>
      </div>

      <!-- Variables Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-green-600 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
            </svg>
            <span>Variables</span>
          </h3>
          <span class="text-sm text-gray-500">{{variables().length}} variables</span>
        </div>
        
        <!-- Add Variable Form -->
        <div class="grid grid-cols-1 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              [(ngModel)]="newVariable.name"
              placeholder="Nombre de la variable"
              class="px-3 py-2 border border-gray-300 rounded-md">
            <input
              [(ngModel)]="newVariable.description"
              placeholder="Descripción"
              class="px-3 py-2 border border-gray-300 rounded-md">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              [(ngModel)]="newVariable.latency_spec_id"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option [value]="null">Latencia: N/A</option>
              @for (spec of latencySpecs(); track spec.id) {
                <option [value]="spec.id">{{ spec.name }} ({{ spec.value }} {{ spec.units }})</option>
              }
            </select>
            <select
              [(ngModel)]="newVariable.tolerance_spec_id"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option [value]="null">Tolerancia: N/A</option>
              @for (spec of toleranceSpecs(); track spec.id) {
                <option [value]="spec.id">{{ spec.name }} ({{ spec.value }} {{ spec.units }})</option>
              }
            </select>
            <button
              (click)="addVariable()"
              [disabled]="!newVariable.name"
              class="primary disabled:opacity-50 flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Agregar Variable</span>
            </button>
          </div>
        </div>

        <!-- Variables List -->
        <div class="space-y-2">
          @for (variable of variables(); track variable.id) {
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <span class="font-medium text-green-700">{{variable.name}}</span>
                  @if (variable.description) {
                    <span class="text-gray-600">{{variable.description}}</span>
                  }
                </div>
                <div class="flex items-center space-x-4 mt-1 text-xs">
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Latencia: {{ getLatencySpecName(variable.latency_spec_id) }}
                  </span>
                  <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Tolerancia: {{ getToleranceSpecName(variable.tolerance_spec_id) }}
                  </span>
                </div>
              </div>
              <button
                (click)="variable.id && deleteVariable(variable.id)"
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          } @empty {
            <p class="text-gray-500 text-center py-8">No hay variables configuradas</p>
          }
        </div>
      </div>

      <!-- Components Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-indigo-600 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m0 0l-2 2m2-2l-2-2M7 7h0m0 0v0m0 0h0"/>
            </svg>
            <span>Componentes</span>
          </h3>
          <span class="text-sm text-gray-500">{{components().length}} componentes</span>
        </div>
        
        <!-- Add Component Form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-indigo-50 rounded-lg">
          <input
            [(ngModel)]="newComponent.name"
            placeholder="Nombre del componente"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <input
            [(ngModel)]="newComponent.description"
            placeholder="Descripción"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <button
            (click)="addComponent()"
            [disabled]="!newComponent.name"
            class="primary disabled:opacity-50 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Agregar Componente</span>
          </button>
        </div>

        <!-- Components List -->
        <div class="space-y-2">
          @for (component of components(); track component.id) {
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div class="flex-1">
                <span class="font-medium text-indigo-700">{{component.name}}</span>
                @if (component.description) {
                  <span class="text-gray-600 ml-3">{{component.description}}</span>
                }
              </div>
              <button
                (click)="component.id && deleteComponent(component.id)"
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          } @empty {
            <p class="text-gray-500 text-center py-8">No hay componentes configurados</p>
          }
        </div>
      </div>

      <!-- Modes Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-purple-600 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span>Modos</span>
          </h3>
          <span class="text-sm text-gray-500">{{modes().length}} modos</span>
        </div>
        
        <!-- Add Mode Form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
          <input
            [(ngModel)]="newMode.name"
            placeholder="Nombre del modo"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <input
            [(ngModel)]="newMode.description"
            placeholder="Descripción"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <button
            (click)="addMode()"
            [disabled]="!newMode.name"
            class="primary disabled:opacity-50 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Agregar Modo</span>
          </button>
        </div>

        <!-- Modes List with Component Associations -->
        <div class="space-y-4">
          @for (mode of modes(); track mode.id) {
            <div class="border rounded-lg p-4 hover:bg-gray-50">
              <!-- Mode Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex-1">
                  <span class="font-medium text-purple-700">{{mode.name}}</span>
                  @if (mode.description) {
                    <span class="text-gray-600 ml-3">{{mode.description}}</span>
                  }
                </div>
                <button
                  (click)="mode.id && deleteMode(mode.id)"
                  class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar
                </button>
              </div>
              
              <!-- Component Associations -->
              @if (components().length > 0) {
                <div class="border-t pt-3">
                  <p class="text-sm font-medium text-gray-700 mb-2">Componentes asociados:</p>
                  <div class="flex flex-wrap gap-2">
                    @for (component of components(); track component.id) {
                      @if (mode.id && component.id) {
                        <button
                          (click)="toggleModeComponent(mode.id!, component.id!)"
                          [class]="isModeComponentAssociated(mode.id!, component.id!) 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'"
                          class="px-3 py-1 text-sm rounded border transition-colors">
                          {{component.name}}
                        </button>
                      }
                    }
                  </div>
                  @if (mode.id && getModeComponentCount(mode.id) > 0) {
                    <p class="text-xs text-gray-500 mt-2">
                      {{mode.id ? getModeComponentCount(mode.id) : 0}} componente(s) asociado(s)
                    </p>
                  }
                </div>
              } @else {
                <div class="border-t pt-3">
                  <p class="text-sm text-gray-500">No hay componentes disponibles para asociar</p>
                </div>
              }
            </div>
          } @empty {
            <p class="text-gray-500 text-center py-8">No hay modos configurados</p>
          }
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
export class ConfigurationComponent implements OnInit {
  private db = inject(DatabaseService);
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<Component[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  latencySpecs = signal<LatencySpecification[]>([]);
  toleranceSpecs = signal<ToleranceSpecification[]>([]);
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  // Form data
  newFunction = {name: '', description: ''};
  newVariable = {name: '', description: '', latency_spec_id: null as number | null, tolerance_spec_id: null as number | null};
  newComponent = {name: '', description: ''};
  newMode = {name: '', description: ''};

  async ngOnInit() {
    await this.loadAllData();
  }

  private async loadAllData() {
    try {
      // Wait for database to be ready
      while (!this.db.isDatabaseReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const [funcs, vars, comps, modes, modeComps, latencySpecs, toleranceSpecs] = await Promise.all([
        Promise.resolve(this.db.getFunctions()),
        Promise.resolve(this.db.getVariables()),
        Promise.resolve(this.db.getComponents()),
        Promise.resolve(this.db.getModes()),
        Promise.resolve(this.db.getModeComponents()),
        Promise.resolve(this.db.getLatencySpecifications()),
        Promise.resolve(this.db.getToleranceSpecifications())
      ]);

      this.functions.set(funcs);
      this.variables.set(vars);
      this.components.set(comps);
      this.modes.set(modes);
      this.modeComponents.set(modeComps);
      this.latencySpecs.set(latencySpecs);
      this.toleranceSpecs.set(toleranceSpecs);
    } catch (error) {
      this.showStatus('Error al cargar datos: ' + error, 'error');
    }
  }

  // Function methods
  async addFunction() {
    if (!this.newFunction.name.trim()) return;
    
    try {
      this.db.addFunction({
        name: this.newFunction.name.trim(),
        description: this.newFunction.description.trim(),
        order_index: this.functions().length
      });
      this.newFunction = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Función agregada correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar función: ' + error, 'error');
    }
  }

  async deleteFunction(id: number) {
    if (confirm('¿Estás seguro de eliminar esta función?')) {
      try {
        this.db.deleteFunction(id);
        await this.loadAllData();
        this.showStatus('Función eliminada correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar función: ' + error, 'error');
      }
    }
  }

  // Variable methods
  async addVariable() {
    if (!this.newVariable.name.trim()) return;
    
    try {
      this.db.addVariable({
        name: this.newVariable.name.trim(),
        description: this.newVariable.description.trim(),
        order_index: this.variables().length,
        latency_spec_id: this.newVariable.latency_spec_id || undefined,
        tolerance_spec_id: this.newVariable.tolerance_spec_id || undefined
      });
      this.newVariable = {name: '', description: '', latency_spec_id: null, tolerance_spec_id: null};
      await this.loadAllData();
      this.showStatus('Variable agregada correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar variable: ' + error, 'error');
    }
  }

  async deleteVariable(id: number) {
    if (confirm('¿Estás seguro de eliminar esta variable?')) {
      try {
        this.db.deleteVariable(id);
        await this.loadAllData();
        this.showStatus('Variable eliminada correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar variable: ' + error, 'error');
      }
    }
  }

  // Component methods
  async addComponent() {
    if (!this.newComponent.name.trim()) return;
    
    try {
      this.db.addComponent({
        name: this.newComponent.name.trim(),
        description: this.newComponent.description.trim(),
        order_index: this.components().length
      });
      this.newComponent = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Componente agregado correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar componente: ' + error, 'error');
    }
  }

  async deleteComponent(id: number) {
    if (confirm('¿Estás seguro de eliminar este componente? Esto también eliminará todas sus asociaciones con modos.')) {
      try {
        // Remove all component associations
        this.db.removeComponentAssociations(id);
        
        // Get and delete orphaned modes (modes with no component associations)
        const orphanedModes = this.db.getOrphanedModes();
        for (const mode of orphanedModes) {
          if (mode.id !== undefined) {
            this.db.deleteMode(mode.id);
          }
        }
        
        // Finally delete the component
        this.db.deleteComponent(id);
        await this.loadAllData();
        this.showStatus('Componente eliminado correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar componente: ' + error, 'error');
      }
    }
  }

  // Mode methods
  async addMode() {
    if (!this.newMode.name.trim()) return;
    
    try {
      this.db.addMode({
        name: this.newMode.name.trim(),
        description: this.newMode.description.trim(),
        order_index: this.modes().length
      });
      this.newMode = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Modo agregado correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar modo: ' + error, 'error');
    }
  }

  async deleteMode(id: number) {
    if (confirm('¿Estás seguro de eliminar este modo?')) {
      try {
        // Remove all mode associations first
        this.db.removeModeAssociations(id);
        // Then delete the mode
        this.db.deleteMode(id);
        await this.loadAllData();
        this.showStatus('Modo eliminado correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar modo: ' + error, 'error');
      }
    }
  }

  // Mode-Component association methods
  async toggleModeComponent(modeId: number, componentId: number) {
    try {
      const isAssociated = this.isModeComponentAssociated(modeId, componentId);
      
      if (isAssociated) {
        this.db.removeModeComponent(modeId, componentId);
      } else {
        this.db.addModeComponent(modeId, componentId);
      }
      
      await this.loadAllData();
      this.showStatus(
        isAssociated ? 'Asociación eliminada' : 'Asociación creada', 
        'success'
      );
    } catch (error) {
      this.showStatus('Error al modificar asociación: ' + error, 'error');
    }
  }

  isModeComponentAssociated(modeId: number, componentId: number): boolean {
    return this.modeComponents().some(mc => 
      mc.mode_id === modeId && mc.component_id === componentId
    );
  }

  getModeComponentCount(modeId: number): number {
    return this.modeComponents().filter(mc => mc.mode_id === modeId).length;
  }

  // Helper methods for specification names
  getLatencySpecName(specId: number | undefined): string {
    if (!specId) return 'N/A';
    const spec = this.latencySpecs().find(s => s.id === specId);
    return spec ? `${spec.name} (${spec.value} ${spec.units})` : 'N/A';
  }

  getToleranceSpecName(specId: number | undefined): string {
    if (!specId) return 'N/A';
    const spec = this.toleranceSpecs().find(s => s.id === specId);
    return spec ? `${spec.name} (${spec.value} ${spec.units})` : 'N/A';
  }

  private showStatus(text: string, type: 'success' | 'error') {
    this.statusMessage.set({text, type});
    setTimeout(() => this.statusMessage.set(null), 3000);
  }
}
