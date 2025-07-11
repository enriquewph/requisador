import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, Function, Variable, Component as ComponentEntity, Mode } from '../services/database.service';

@Component({
  selector: 'app-database-test',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 class="text-2xl font-bold mb-6 text-primary-600">
        Requisador Database Interface
      </h1>
      
      @if (!dbService.isDatabaseReady()) {
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p>Initializing database...</p>
        </div>
      } @else {
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>Database ready! Initial data loaded successfully.</p>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6">
          <nav class="flex space-x-4">
            <button 
              (click)="activeTab.set('functions')"
              [class]="getTabClass('functions')">
              Functions ({{ functions().length }})
            </button>
            <button 
              (click)="activeTab.set('variables')"
              [class]="getTabClass('variables')">
              Variables ({{ variables().length }})
            </button>
            <button 
              (click)="activeTab.set('components')"
              [class]="getTabClass('components')">
              Components ({{ components().length }})
            </button>
            <button 
              (click)="activeTab.set('modes')"
              [class]="getTabClass('modes')">
              Modes ({{ modes().length }})
            </button>
            <button 
              (click)="activeTab.set('associations')"
              [class]="getTabClass('associations')">
              Mode-Component Associations
            </button>
          </nav>
        </div>

        <!-- Functions Tab -->
        @if (activeTab() === 'functions') {
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 text-blue-600">Functions</h2>
            
            <!-- Add Function Form -->
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 class="font-medium mb-3">Add New Function</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  [(ngModel)]="newFunction.name"
                  placeholder="Function name"
                  class="px-3 py-2 border rounded-md">
                <input 
                  type="text" 
                  [(ngModel)]="newFunction.description"
                  placeholder="Description"
                  class="px-3 py-2 border rounded-md">
                <button 
                  (click)="addFunction()"
                  class="primary">
                  Add Function
                </button>
              </div>
            </div>

            <!-- Functions List -->
            <div class="space-y-2">
              @for (func of functions(); track func.id) {
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <span class="font-medium text-blue-700">{{ func.name }}</span>
                    <span class="text-gray-600 ml-3">{{ func.description }}</span>
                  </div>
                  <button 
                    (click)="deleteFunction(func.id!)"
                    class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Variables Tab -->
        @if (activeTab() === 'variables') {
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 text-green-600">Variables</h2>
            
            <!-- Add Variable Form -->
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 class="font-medium mb-3">Add New Variable</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  [(ngModel)]="newVariable.name"
                  placeholder="Variable name"
                  class="px-3 py-2 border rounded-md">
                <input 
                  type="text" 
                  [(ngModel)]="newVariable.description"
                  placeholder="Description"
                  class="px-3 py-2 border rounded-md">
                <button 
                  (click)="addVariable()"
                  class="primary">
                  Add Variable
                </button>
              </div>
            </div>

            <!-- Variables List -->
            <div class="space-y-2">
              @for (variable of variables(); track variable.id) {
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <span class="font-medium text-green-700">{{ variable.name }}</span>
                    <span class="text-gray-600 ml-3">{{ variable.description }}</span>
                  </div>
                  <button 
                    (click)="deleteVariable(variable.id!)"
                    class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Components Tab -->
        @if (activeTab() === 'components') {
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 text-indigo-600">Components</h2>
            
            <!-- Add Component Form -->
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 class="font-medium mb-3">Add New Component</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  [(ngModel)]="newComponent.name"
                  placeholder="Component name"
                  class="px-3 py-2 border rounded-md">
                <input 
                  type="text" 
                  [(ngModel)]="newComponent.description"
                  placeholder="Description"
                  class="px-3 py-2 border rounded-md">
                <button 
                  (click)="addComponent()"
                  class="primary">
                  Add Component
                </button>
              </div>
            </div>

            <!-- Components List -->
            <div class="space-y-2">
              @for (component of components(); track component.id) {
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <span class="font-medium text-indigo-700">{{ component.name }}</span>
                    <span class="text-gray-600 ml-3">{{ component.description }}</span>
                  </div>
                  <button 
                    (click)="deleteComponent(component.id!)"
                    class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Modes Tab -->
        @if (activeTab() === 'modes') {
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 text-purple-600">Modes</h2>
            
            <!-- Add Mode Form -->
            <div class="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 class="font-medium mb-3">Add New Mode</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  [(ngModel)]="newMode.name"
                  placeholder="Mode name"
                  class="px-3 py-2 border rounded-md">
                <input 
                  type="text" 
                  [(ngModel)]="newMode.description"
                  placeholder="Description"
                  class="px-3 py-2 border rounded-md">
                <button 
                  (click)="addMode()"
                  class="primary">
                  Add Mode
                </button>
              </div>
            </div>

            <!-- Modes List -->
            <div class="space-y-2">
              @for (mode of modes(); track mode.id) {
                <div class="flex items-center justify-between p-3 border rounded-lg">
                  <div class="flex-1">
                    <span class="font-medium text-purple-700">{{ mode.name }}</span>
                    <span class="text-gray-600 ml-3">{{ mode.description }}</span>
                  </div>
                  <button 
                    (click)="deleteMode(mode.id!)"
                    class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Associations Tab -->
        @if (activeTab() === 'associations') {
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Mode-Component Associations</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Add Association -->
              <div class="p-4 border rounded-lg bg-gray-50">
                <h3 class="font-medium mb-3">Add Association</h3>
                <div class="space-y-3">
                  <select [(ngModel)]="selectedModeId" class="w-full px-3 py-2 border rounded-md">
                    <option value="">Select Mode</option>
                    @for (mode of modes(); track mode.id) {
                      <option [value]="mode.id">{{ mode.name }}</option>
                    }
                  </select>
                  <select [(ngModel)]="selectedComponentId" class="w-full px-3 py-2 border rounded-md">
                    <option value="">Select Component</option>
                    @for (component of components(); track component.id) {
                      <option [value]="component.id">{{ component.name }}</option>
                    }
                  </select>
                  <button 
                    (click)="addModeComponent()"
                    [disabled]="!selectedModeId || !selectedComponentId"
                    class="w-full primary disabled:opacity-50">
                    Add Association
                  </button>
                </div>
              </div>

              <!-- Current Associations -->
              <div>
                <h3 class="font-medium mb-3">Current Associations</h3>
                <div class="space-y-2">
                  @for (association of modeComponentsDisplay(); track association.mode_id + '-' + association.component_id) {
                    <div class="flex items-center justify-between p-2 border rounded">
                      <span>{{ association.modeName }} ↔ {{ association.componentName }}</span>
                      <button 
                        (click)="removeModeComponent(association.mode_id, association.component_id)"
                        class="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm">
                        Remove
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .tab-active {
      @apply bg-primary-600 text-white;
    }
    
    .tab-inactive {
      @apply bg-gray-100 text-gray-700 hover:bg-primary-50;
    }
  `]
})
export class DatabaseTestComponent {
  dbService = inject(DatabaseService);
  
  activeTab = signal<'functions' | 'variables' | 'components' | 'modes' | 'associations'>('functions');
  
  // Data signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<ComponentEntity[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<any[]>([]);
  
  // Form data
  newFunction = { name: '', description: '', order_index: 1 };
  newVariable = { name: '', description: '', order_index: 1 };
  newComponent = { name: '', description: '', order_index: 1 };
  newMode = { name: '', description: '', order_index: 1 };
  
  selectedModeId = '';
  selectedComponentId = '';

  // Computed display data for associations
  modeComponentsDisplay = computed(() => {
    const associations = this.modeComponents();
    const modesMap = new Map(this.modes().map(m => [m.id!, m.name]));
    const componentsMap = new Map(this.components().map(c => [c.id!, c.name]));
    
    return associations.map(assoc => ({
      ...assoc,
      modeName: modesMap.get(assoc.mode_id) || 'Unknown',
      componentName: componentsMap.get(assoc.component_id) || 'Unknown'
    }));
  });

  constructor() {
    // Watch for database ready state and load data
    const checkReady = () => {
      if (this.dbService.isDatabaseReady()) {
        this.loadAllData();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  }

  loadAllData(): void {
    this.functions.set(this.dbService.getFunctions());
    this.variables.set(this.dbService.getVariables());
    this.components.set(this.dbService.getComponents());
    this.modes.set(this.dbService.getModes());
    this.modeComponents.set(this.dbService.getModeComponents());
  }

  getTabClass(tab: string): string {
    const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors';
    return this.activeTab() === tab 
      ? `${baseClass} tab-active`
      : `${baseClass} tab-inactive`;
  }

  // Functions CRUD
  addFunction(): void {
    if (!this.newFunction.name.trim()) return;
    
    const nextOrder = Math.max(...this.functions().map(f => f.order_index), 0) + 1;
    const id = this.dbService.addFunction({
      ...this.newFunction,
      order_index: nextOrder
    });
    
    if (id > 0) {
      this.newFunction = { name: '', description: '', order_index: 1 };
      this.functions.set(this.dbService.getFunctions());
    }
  }

  deleteFunction(id: number): void {
    if (this.dbService.deleteFunction(id)) {
      this.functions.set(this.dbService.getFunctions());
    }
  }

  // Variables CRUD
  addVariable(): void {
    if (!this.newVariable.name.trim()) return;
    
    const nextOrder = Math.max(...this.variables().map(v => v.order_index), 0) + 1;
    const id = this.dbService.addVariable({
      ...this.newVariable,
      order_index: nextOrder
    });
    
    if (id > 0) {
      this.newVariable = { name: '', description: '', order_index: 1 };
      this.variables.set(this.dbService.getVariables());
    }
  }

  deleteVariable(id: number): void {
    if (this.dbService.deleteVariable(id)) {
      this.variables.set(this.dbService.getVariables());
    }
  }

  // Components CRUD
  addComponent(): void {
    if (!this.newComponent.name.trim()) return;
    
    const nextOrder = Math.max(...this.components().map(c => c.order_index), 0) + 1;
    const id = this.dbService.addComponent({
      ...this.newComponent,
      order_index: nextOrder
    });
    
    if (id > 0) {
      this.newComponent = { name: '', description: '', order_index: 1 };
      this.components.set(this.dbService.getComponents());
    }
  }

  deleteComponent(id: number): void {
    if (this.dbService.deleteComponent(id)) {
      this.components.set(this.dbService.getComponents());
    }
  }

  // Modes CRUD
  addMode(): void {
    if (!this.newMode.name.trim()) return;
    
    const nextOrder = Math.max(...this.modes().map(m => m.order_index), 0) + 1;
    const id = this.dbService.addMode({
      ...this.newMode,
      order_index: nextOrder
    });
    
    if (id > 0) {
      this.newMode = { name: '', description: '', order_index: 1 };
      this.modes.set(this.dbService.getModes());
    }
  }

  deleteMode(id: number): void {
    if (this.dbService.deleteMode(id)) {
      this.modes.set(this.dbService.getModes());
    }
  }

  // Mode-Component associations
  addModeComponent(): void {
    if (!this.selectedModeId || !this.selectedComponentId) return;
    
    if (this.dbService.addModeComponent(+this.selectedModeId, +this.selectedComponentId)) {
      this.selectedModeId = '';
      this.selectedComponentId = '';
      this.modeComponents.set(this.dbService.getModeComponents());
    }
  }

  removeModeComponent(modeId: number, componentId: number): void {
    if (this.dbService.removeModeComponent(modeId, componentId)) {
      this.modeComponents.set(this.dbService.getModeComponents());
    }
  }
}
