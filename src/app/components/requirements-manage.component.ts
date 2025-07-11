import { Component as NgComponent, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Requirement } from '../services/database.service';
import { TreeTableModule } from 'primeng/treetable';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { RequirementDetailModalComponent } from './requirement-detail-modal.component';

interface TreeNode {
  data: Requirement;
  children?: TreeNode[];
  expanded?: boolean;
}

interface Column {
  field: string;
  header: string;
  width?: string;
  sortable?: boolean;
}

@NgComponent({
  selector: 'app-requirements-manage',
  imports: [TreeTableModule, ContextMenuModule, RequirementDetailModalComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <span>Gestionar Requisitos</span>
        </h2>
        <p class="text-gray-600">Visualiza, edita y organiza todos los requisitos del sistema</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button 
              (click)="activeTab.set('tree')"
              [class]="activeTab() === 'tree' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
              Vista de Árbol
            </button>
            <button 
              (click)="activeTab.set('list')"
              [class]="activeTab() === 'list' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
              Vista de Lista
            </button>
            <button 
              (click)="activeTab.set('matrix')"
              [class]="activeTab() === 'matrix' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
              Matriz de Trazabilidad
            </button>
          </nav>
        </div>

        <div class="p-6">
          @switch (activeTab()) {
            @case ('tree') {
              <!-- Tree View -->
              <div class="space-y-4">
                <!-- Toolbar -->
                <div class="flex justify-between items-center">
                  <div class="flex space-x-4 items-center">
                    <h3 class="text-lg font-medium text-gray-900">Vista Jerárquica</h3>
                    <span class="text-sm text-gray-500">
                      {{requirements().length}} requisitos total
                    </span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <!-- Column Toggle -->
                    <button 
                      (click)="showColumnToggle.set(!showColumnToggle())"
                      class="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0V17m0-10a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2"/>
                      </svg>
                    </button>
                    
                    <!-- Expand All -->
                    <button 
                      (click)="expandAll()"
                      class="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Expandir Todo
                    </button>
                    
                    <!-- Collapse All -->
                    <button 
                      (click)="collapseAll()"
                      class="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Contraer Todo
                    </button>
                  </div>
                </div>

                <!-- Column Toggle Panel -->
                @if (showColumnToggle()) {
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-3">Columnas Visibles</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                      @for (col of allColumns; track col.field) {
                        <label class="flex items-center">
                          <input 
                            type="checkbox" 
                            [checked]="visibleColumns().includes(col.field)"
                            (change)="toggleColumn(col.field, ($event.target as HTMLInputElement).checked)"
                            class="mr-2">
                          <span class="text-sm">{{col.header}}</span>
                        </label>
                      }
                    </div>
                  </div>
                }

                <!-- TreeTable -->
                <div class="border rounded-lg overflow-hidden">
                  <p-treetable 
                    [value]="treeData()" 
                    [columns]="displayColumns()"
                    [scrollable]="true" 
                    [scrollHeight]="'400px'"
                    [resizableColumns]="true"
                    [reorderableColumns]="true"
                    [frozenColumns]="frozenColumns"
                    [contextMenu]="cm"
                    [(contextMenuSelection)]="selectedRequirement"
                    dataKey="id"
                    styleClass="p-treetable-sm">
                    
                    <!-- Header Template -->
                    <ng-template #header let-columns>
                      <tr>
                        @for (col of columns; track col.field) {
                          <th 
                            [ttSortableColumn]="col.sortable ? col.field : null"
                            ttResizableColumn
                            ttReorderableColumn
                            [style.width]="col.width">
                            <div class="flex items-center gap-2">
                              {{col.header}}
                              @if (col.sortable) {
                                <p-treetable-sort-icon [field]="col.field" />
                              }
                            </div>
                          </th>
                        }
                      </tr>
                    </ng-template>
                    
                    <!-- Body Template -->
                    <ng-template #body let-rowNode let-rowData="rowData" let-columns="columns">
                      <tr [ttRow]="rowNode" [ttContextMenuRow]="rowNode">
                        @for (col of columns; track col.field; let i = $index) {
                          <td>
                            @if (i === 0) {
                              <p-treetable-toggler [rowNode]="rowNode" />
                            }
                            {{getColumnValue(rowData, col.field)}}
                          </td>
                        }
                      </tr>
                    </ng-template>
                  </p-treetable>
                </div>
              </div>
            }
            
            @case ('list') {
              <!-- List View -->
              <div class="text-center py-16">
                <div class="max-w-md mx-auto">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Vista de Lista</h3>
                  <p class="text-gray-600">Lista plana de todos los requisitos</p>
                  <p class="text-sm text-gray-500 mt-2">Próximamente disponible</p>
                </div>
              </div>
            }
            
            @case ('matrix') {
              <!-- Matrix View -->
              <div class="text-center py-16">
                <div class="max-w-md mx-auto">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Matriz de Trazabilidad</h3>
                  <p class="text-gray-600">Relaciones entre requisitos y entidades</p>
                  <p class="text-sm text-gray-500 mt-2">Próximamente disponible</p>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <p-contextmenu #cm [model]="menuItems" />

    <!-- Requirement Detail Modal -->
    <app-requirement-detail-modal
      [isVisible]="showModal()"
      [requirement]="modalRequirement()"
      [requirementId]="modalRequirementId()"
      [mode]="modalMode()"
      (close)="closeModal()"
      (save)="saveRequirement($event)">
    </app-requirement-detail-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementsManageComponent implements OnInit {
  private db = inject(DatabaseService);

  // State
  activeTab = signal<'tree' | 'list' | 'matrix'>('tree');
  showColumnToggle = signal(false);
  showModal = signal(false);
  modalRequirement = signal<Requirement | null>(null);
  modalRequirementId = signal('');
  modalMode = signal<'view' | 'edit'>('view');
  
  selectedRequirement: any = null;
  frozenColumns: Column[] = [];

  // Data
  requirements = signal<Requirement[]>([]);
  
  // Column configuration
  allColumns: Column[] = [
    { field: 'id', header: 'ID', width: '100px', sortable: true },
    { field: 'text', header: 'Requisito', width: '400px', sortable: false },
    { field: 'function', header: 'Función', width: '150px', sortable: true },
    { field: 'variable', header: 'Variable', width: '150px', sortable: true },
    { field: 'component', header: 'Componente', width: '150px', sortable: true },
    { field: 'mode', header: 'Modo', width: '150px', sortable: true },
    { field: 'condition', header: 'Condición', width: '200px', sortable: false },
    { field: 'level', header: 'Nivel', width: '80px', sortable: true },
    { field: 'created_at', header: 'Creado', width: '120px', sortable: true }
  ];

  visibleColumns = signal<string[]>(['id', 'text', 'function', 'variable', 'component', 'mode']);

  displayColumns = computed(() => 
    this.allColumns.filter(col => this.visibleColumns().includes(col.field))
  );

  // Context Menu
  menuItems: MenuItem[] = [
    {
      label: 'Ver Detalles',
      icon: 'pi pi-eye',
      command: () => this.viewRequirement()
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => this.editRequirement()
    },
    { separator: true },
    {
      label: 'Crear Hijo',
      icon: 'pi pi-plus',
      command: () => this.createChild()
    },
    {
      label: 'Hacer Padre',
      icon: 'pi pi-arrow-up',
      command: () => this.makeParent()
    },
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => this.deleteRequirement(),
      styleClass: 'text-red-600'
    }
  ];

  ngOnInit(): void {
    this.loadRequirements();
    this.frozenColumns = [this.allColumns[0]]; // Freeze ID column
  }

  loadRequirements(): void {
    this.requirements.set(this.db.getRequirements());
  }

  // Tree data transformation
  treeData = computed(() => {
    const requirements = this.requirements();
    return this.buildTreeStructure(requirements);
  });

  private buildTreeStructure(requirements: Requirement[]): TreeNode[] {
    const nodeMap = new Map<number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create all nodes first
    requirements.forEach(req => {
      nodeMap.set(req.id!, {
        data: req,
        children: [],
        expanded: true
      });
    });

    // Build parent-child relationships
    requirements.forEach(req => {
      const node = nodeMap.get(req.id!);
      if (node) {
        if (req.parent_id) {
          const parent = nodeMap.get(req.parent_id);
          if (parent) {
            parent.children!.push(node);
          } else {
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }

  // Column management
  toggleColumn(field: string, visible: boolean): void {
    const current = this.visibleColumns();
    if (visible && !current.includes(field)) {
      this.visibleColumns.set([...current, field]);
    } else if (!visible && current.includes(field)) {
      this.visibleColumns.set(current.filter(col => col !== field));
    }
  }

  // Tree operations
  expandAll(): void {
    // Implementation for expanding all nodes
    console.log('Expand all');
  }

  collapseAll(): void {
    // Implementation for collapsing all nodes
    console.log('Collapse all');
  }

  // Get display value for a column
  getColumnValue(requirement: Requirement, field: string): string {
    switch (field) {
      case 'id':
        return this.db.generateRequirementId(requirement);
      case 'text':
        return this.generateRequirementText(requirement);
      case 'function':
        return this.db.getFunctions().find(f => f.id === requirement.function_id)?.name || 'N/A';
      case 'variable':
        return this.db.getVariables().find(v => v.id === requirement.variable_id)?.name || 'N/A';
      case 'component':
        return this.db.getComponents().find(c => c.id === requirement.component_id)?.name || 'N/A';
      case 'mode':
        return this.db.getModes().find(m => m.id === requirement.mode_id)?.name || 'N/A';
      case 'condition':
        return requirement.condition || '-';
      case 'level':
        return requirement.level.toString();
      case 'created_at':
        return requirement.created_at ? new Date(requirement.created_at).toLocaleDateString('es-ES') : '-';
      default:
        return '-';
    }
  }

  // Context menu actions
  viewRequirement(): void {
    if (this.selectedRequirement?.data) {
      this.modalRequirement.set(this.selectedRequirement.data);
      this.modalRequirementId.set(this.db.generateRequirementId(this.selectedRequirement.data));
      this.modalMode.set('view');
      this.showModal.set(true);
    }
  }

  editRequirement(): void {
    if (this.selectedRequirement?.data) {
      this.modalRequirement.set(this.selectedRequirement.data);
      this.modalRequirementId.set(this.db.generateRequirementId(this.selectedRequirement.data));
      this.modalMode.set('edit');
      this.showModal.set(true);
    }
  }

  createChild(): void {
    console.log('Create child for:', this.selectedRequirement);
    // Implementation for creating child requirement
  }

  makeParent(): void {
    console.log('Make parent:', this.selectedRequirement);
    // Implementation for making requirement parent
  }

  deleteRequirement(): void {
    if (this.selectedRequirement?.data && confirm('¿Estás seguro de que quieres eliminar este requisito?')) {
      this.db.deleteRequirement(this.selectedRequirement.data.id!);
      this.loadRequirements();
    }
  }

  // Modal management
  closeModal(): void {
    this.showModal.set(false);
    this.modalRequirement.set(null);
    this.modalRequirementId.set('');
  }

  saveRequirement(requirement: Requirement): void {
    // Implementation for saving requirement changes
    console.log('Save requirement:', requirement);
    this.closeModal();
    this.loadRequirements();
  }

  // Helper methods
  private generateRequirementText(requirement: Requirement): string {
    const functionName = this.db.getFunctions().find(f => f.id === requirement.function_id)?.name || 'N/A';
    const variableName = this.db.getVariables().find(v => v.id === requirement.variable_id)?.name || 'N/A';
    const componentName = this.db.getComponents().find(c => c.id === requirement.component_id)?.name || 'N/A';
    const modeName = this.db.getModes().find(m => m.id === requirement.mode_id)?.name || 'N/A';

    return `El ${componentName} deberá ${requirement.behavior} ${variableName} cuando el sistema esté en modo ${modeName}`;
  }
}
