import { Component as NgComponent, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component, Mode } from '../services/database.service';
import { FormsModule } from '@angular/forms';

@NgComponent({
  selector: 'app-configuration',
  imports: [FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Configuración del Sistema</h2>
        <p class="text-gray-600">Gestiona las entidades fundamentales para la creación de requisitos</p>
      </div>

      <!-- Functions Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-blue-600">Funciones</h3>
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
            class="primary disabled:opacity-50">
            Agregar Función
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
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm">
                Eliminar
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
          <h3 class="text-xl font-semibold text-green-600">Variables</h3>
          <span class="text-sm text-gray-500">{{variables().length}} variables</span>
        </div>
        
        <!-- Add Variable Form -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
          <input
            [(ngModel)]="newVariable.name"
            placeholder="Nombre de la variable"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <input
            [(ngModel)]="newVariable.description"
            placeholder="Descripción"
            class="px-3 py-2 border border-gray-300 rounded-md">
          <button
            (click)="addVariable()"
            [disabled]="!newVariable.name"
            class="primary disabled:opacity-50">
            Agregar Variable
          </button>
        </div>

        <!-- Variables List -->
        <div class="space-y-2">
          @for (variable of variables(); track variable.id) {
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div class="flex-1">
                <span class="font-medium text-green-700">{{variable.name}}</span>
                @if (variable.description) {
                  <span class="text-gray-600 ml-3">{{variable.description}}</span>
                }
              </div>
              <button
                (click)="variable.id && deleteVariable(variable.id)"
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm">
                Eliminar
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
          <h3 class="text-xl font-semibold text-indigo-600">Componentes</h3>
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
            class="primary disabled:opacity-50">
            Agregar Componente
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
                class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm">
                Eliminar
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
          <h3 class="text-xl font-semibold text-purple-600">Modos</h3>
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
            class="primary disabled:opacity-50">
            Agregar Modo
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
                  class="text-red-600 hover:text-red-800 px-3 py-1 rounded text-sm">
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
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  // Form data
  newFunction = {name: '', description: ''};
  newVariable = {name: '', description: ''};
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
      
      const [funcs, vars, comps, modes, modeComps] = await Promise.all([
        Promise.resolve(this.db.getFunctions()),
        Promise.resolve(this.db.getVariables()),
        Promise.resolve(this.db.getComponents()),
        Promise.resolve(this.db.getModes()),
        Promise.resolve(this.db.getModeComponents())
      ]);

      this.functions.set(funcs);
      this.variables.set(vars);
      this.components.set(comps);
      this.modes.set(modes);
      this.modeComponents.set(modeComps);
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
        order_index: this.variables().length
      });
      this.newVariable = {name: '', description: ''};
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

  private showStatus(text: string, type: 'success' | 'error') {
    this.statusMessage.set({text, type});
    setTimeout(() => this.statusMessage.set(null), 3000);
  }
}
