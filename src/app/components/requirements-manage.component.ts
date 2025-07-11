import { Component, signal, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface RequirementTreeNode extends TreeNode {
  data: {
    id: string;
    text: string;
    component: string;
    mode: string;
    function: string;
    variable: string;
    level: number;
    created_at: string;
    updated_at: string;
  };
  children?: RequirementTreeNode[];
  expanded?: boolean;
  leaf?: boolean;
}

@Component({
  selector: 'app-requirements-manage',
  imports: [
    CommonModule,
    TreeTableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Gestión de Requisitos</h2>
          <p class="text-sm text-gray-600 mt-1">Visualiza y gestiona todos los requisitos del sistema</p>
        </div>
        <div class="flex space-x-3">
          <button 
            type="button" 
            class="px-4 py-2 bg-primary-600 text-white border border-primary-600 rounded-lg transition-all duration-200 hover:bg-primary-500 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Nuevo Requisito</span>
          </button>
        </div>
      </div>

      <!-- Tab View -->
      <!-- Custom Tab Navigation -->
      <nav class="bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div class="flex space-x-1 p-1">
          <button 
            type="button"
            (click)="activeSubTab.set('tree')"
            [class]="activeSubTab() === 'tree' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <span>Vista de Árbol</span>
          </button>
          <button 
            type="button"
            (click)="activeSubTab.set('list')"
            [class]="activeSubTab() === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            <span>Vista de Lista</span>
          </button>
          <button 
            type="button"
            (click)="activeSubTab.set('reports')"
            [class]="activeSubTab() === 'reports' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <span>Reportes</span>
          </button>
        </div>
      </nav>

      <!-- Tab Content -->
      <div class="bg-white border border-gray-200 border-t-0 rounded-b-lg">
        @switch (activeSubTab()) {
          @case ('tree') {
            <div class="p-6">
              <!-- Tree Actions -->
              <div class="flex justify-between items-center mb-4">
                <div class="flex space-x-3">
                  <button 
                    type="button" 
                    class="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200 hover:border-gray-400 flex items-center space-x-2"
                    (click)="expandAll()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/>
                    </svg>
                    <span>Expandir Todo</span>
                  </button>
                  <button 
                    type="button" 
                    class="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200 hover:border-gray-400 flex items-center space-x-2"
                    (click)="collapseAll()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/>
                    </svg>
                    <span>Colapsar Todo</span>
                  </button>
                </div>
                <div class="text-sm text-gray-600">
                  Total: {{ getTotalRequirements() }} requisitos
                </div>
              </div>

            <!-- Search -->
            <div class="mb-4">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar requisitos..." 
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  (input)="tt.filterGlobal($any($event.target).value, 'contains')"
                  #globalFilter>
              </div>
            </div>

            <!-- TreeTable -->
            <p-treeTable 
              [value]="requirements()" 
              [columns]="cols"
              [scrollable]="true" 
              scrollHeight="500px"
              [resizableColumns]="true"
              [globalFilterFields]="['id', 'text', 'component', 'mode', 'function', 'variable']"
              styleClass="p-treetable-sm"
              #tt>
              
              <!-- Column Headers -->
              <ng-template pTemplate="header" let-columns>
                <tr>
                  @for (col of columns; track col.field) {
                    <th [style.width]="col.width">
                      <div class="flex items-center">
                        {{ col.header }}
                      </div>
                    </th>
                  }
                  <th style="width: 120px">Acciones</th>
                </tr>
              </ng-template>

              <!-- Row Content -->
              <ng-template pTemplate="body" let-rowNode let-rowData="rowData" let-columns="columns">
                <tr [ttRow]="rowNode">
                  @for (col of columns; track col.field) {
                    <td>
                      @switch (col.field) {
                      @case ('id') {
                        <div class="flex items-center">
                          <p-treeTableToggler [rowNode]="rowNode"></p-treeTableToggler>
                          <span class="font-mono text-sm font-medium ml-2" 
                                [class]="getRequirementIdClass(rowData.level)">
                            {{ rowData.id }}
                          </span>
                        </div>
                      }
                      @case ('text') {
                        <div class="max-w-md">
                          <p class="text-sm text-gray-900 line-clamp-2" 
                             [title]="rowData.text">
                            {{ rowData.text }}
                          </p>
                        </div>
                      }
                      @case ('component') {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {{ rowData.component }}
                        </span>
                      }
                      @case ('mode') {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {{ rowData.mode }}
                        </span>
                      }
                      @case ('function') {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {{ rowData.function }}
                        </span>
                      }
                      @case ('variable') {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {{ rowData.variable }}
                        </span>
                      }
                      @case ('created_at') {
                        <span class="text-sm text-gray-600">
                          {{ formatDate(rowData.created_at) }}
                        </span>
                      }
                      @default {
                        {{ rowData[col.field] }}
                      }
                    }
                  </td>
                  }
                  
                  <!-- Actions Column -->
                  <td>
                    <div class="flex items-center space-x-1">
                      <button 
                        type="button" 
                        class="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                        title="Ver detalles"
                        (click)="viewRequirement(rowData)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        class="text-gray-400 hover:text-green-600 p-1 rounded transition-colors"
                        title="Editar"
                        (click)="editRequirement(rowData)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        class="text-gray-400 hover:text-purple-600 p-1 rounded transition-colors"
                        title="Agregar sub-requisito"
                        (click)="addChildRequirement(rowData)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        class="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Eliminar"
                        (click)="deleteRequirement(rowData)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </ng-template>

              <!-- Empty State -->
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td [attr.colspan]="cols.length + 1" class="text-center py-8">
                    <div class="flex flex-col items-center space-y-4">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      <p class="text-gray-600">No se encontraron requisitos</p>
                      <button 
                        type="button" 
                        class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200 hover:border-gray-400">
                        Crear Primer Requisito
                      </button>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-treeTable>
            </div>
          }
          @case ('list') {
            <div class="p-6">
              <div class="text-center py-16">
                <div class="max-w-md mx-auto">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Vista de Lista</h3>
                  <p class="text-gray-600">Vista plana de todos los requisitos</p>
                  <p class="text-sm text-gray-500 mt-2">Próximamente disponible</p>
                </div>
              </div>
            </div>
          }
          @case ('reports') {
            <div class="p-6">
              <div class="text-center py-16">
                <div class="max-w-md mx-auto">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Reportes y Estadísticas</h3>
                  <p class="text-gray-600">Análisis y métricas de requisitos</p>
                  <p class="text-sm text-gray-500 mt-2">Próximamente disponible</p>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    /* Line clamp utility */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* PrimeNG TreeTable custom styling */
    :host ::ng-deep .p-treetable .p-treetable-thead > tr > th {
      background-color: #f9fafb;
      color: #374151;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    :host ::ng-deep .p-treetable .p-treetable-tbody > tr > td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    :host ::ng-deep .p-treetable .p-treetable-tbody > tr:hover {
      background-color: #f9fafb;
    }

    :host ::ng-deep .p-treetable-toggler {
      color: #6b7280;
    }

    :host ::ng-deep .p-treetable-toggler:hover {
      color: #374151;
    }

    /* Hide default PrimeNG TabView completely */
    :host ::ng-deep .p-tabview .p-tabview-nav {
      display: none;
    }

    :host ::ng-deep .p-tabview .p-tabview-panels {
      padding: 0;
      background: transparent;
      border: none;
    }

    :host ::ng-deep .p-tabview .p-tabview-panel {
      padding: 0;
    }
  `]
})
export class RequirementsManageComponent implements OnInit {
  requirements = signal<RequirementTreeNode[]>([]);
  selectedRequirement = signal<RequirementTreeNode | null>(null);
  activeSubTab = signal<'tree' | 'list' | 'reports'>('tree');
  
  cols = [
    { field: 'id', header: 'ID', width: '100px' },
    { field: 'text', header: 'Texto del Requisito', width: '350px' },
    { field: 'component', header: 'Componente', width: '120px' },
    { field: 'mode', header: 'Modo', width: '100px' },
    { field: 'function', header: 'Función', width: '120px' },
    { field: 'variable', header: 'Variable', width: '120px' },
    { field: 'created_at', header: 'Creado', width: '100px' }
  ];

  ngOnInit() {
    this.loadSampleData();
  }

  loadSampleData() {
    // Sample data for testing the TreeTable
    const sampleData: RequirementTreeNode[] = [
      {
        data: {
          id: 'R0',
          text: 'El HMI deberá mostrar velocidad cuando el sistema esté en modo Normal',
          component: 'HMI',
          mode: 'Normal',
          function: 'Navegación',
          variable: 'Velocidad',
          level: 0,
          created_at: '2025-01-15',
          updated_at: '2025-01-15'
        },
        expanded: true,
        children: [
          {
            data: {
              id: 'R0-0',
              text: 'El HMI deberá actualizar velocidad cada segundo cuando el sistema esté en modo Normal',
              component: 'HMI',
              mode: 'Normal',
              function: 'Navegación',
              variable: 'Velocidad',
              level: 1,
              created_at: '2025-01-15',
              updated_at: '2025-01-15'
            },
            leaf: true
          },
          {
            data: {
              id: 'R0-1',
              text: 'El HMI deberá mostrar velocidad en km/h cuando el sistema esté en modo Normal',
              component: 'HMI',
              mode: 'Normal',
              function: 'Navegación',
              variable: 'Velocidad',
              level: 1,
              created_at: '2025-01-15',
              updated_at: '2025-01-15'
            },
            expanded: true,
            children: [
              {
                data: {
                  id: 'R0-1-0',
                  text: 'El HMI deberá mostrar velocidad con precisión de 1 km/h cuando el sistema esté en modo Normal',
                  component: 'HMI',
                  mode: 'Normal',
                  function: 'Navegación',
                  variable: 'Velocidad',
                  level: 2,
                  created_at: '2025-01-15',
                  updated_at: '2025-01-15'
                },
                leaf: true
              }
            ]
          }
        ]
      },
      {
        data: {
          id: 'R1',
          text: 'El ECI deberá controlar posición cuando el sistema esté en modo Automático',
          component: 'ECI',
          mode: 'Automático',
          function: 'Control',
          variable: 'Posición',
          level: 0,
          created_at: '2025-01-15',
          updated_at: '2025-01-15'
        },
        expanded: false,
        children: [
          {
            data: {
              id: 'R1-0',
              text: 'El ECI deberá mantener posición con tolerancia de ±1m cuando el sistema esté en modo Automático',
              component: 'ECI',
              mode: 'Automático',
              function: 'Control',
              variable: 'Posición',
              level: 1,
              created_at: '2025-01-15',
              updated_at: '2025-01-15'
            },
            leaf: true
          }
        ]
      },
      {
        data: {
          id: 'R2',
          text: 'El Sistema deberá monitorear temperatura cuando el sistema esté en modo Operacional',
          component: 'Sistema',
          mode: 'Operacional',
          function: 'Monitoreo',
          variable: 'Temperatura',
          level: 0,
          created_at: '2025-01-15',
          updated_at: '2025-01-15'
        },
        leaf: true
      }
    ];

    this.requirements.set(sampleData);
  }

  expandAll() {
    this.toggleAllNodes(this.requirements(), true);
  }

  collapseAll() {
    this.toggleAllNodes(this.requirements(), false);
  }

  private toggleAllNodes(nodes: RequirementTreeNode[], expanded: boolean) {
    nodes.forEach(node => {
      node.expanded = expanded;
      if (node.children) {
        this.toggleAllNodes(node.children, expanded);
      }
    });
  }

  getTotalRequirements(): number {
    return this.countNodes(this.requirements());
  }

  private countNodes(nodes: RequirementTreeNode[]): number {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children) {
        count += this.countNodes(node.children);
      }
    });
    return count;
  }

  getRequirementIdClass(level: number): string {
    const colors = [
      'text-gray-900',     // Level 0
      'text-blue-600',     // Level 1
      'text-green-600',    // Level 2
      'text-purple-600',   // Level 3
      'text-orange-600'    // Level 4+
    ];
    return colors[Math.min(level, colors.length - 1)];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  viewRequirement(requirement: any) {
    console.log('View requirement:', requirement);
    this.selectedRequirement.set(requirement);
    // TODO: Open modal or navigate to detail view
  }

  editRequirement(requirement: any) {
    console.log('Edit requirement:', requirement);
    // TODO: Open edit modal or navigate to edit form
  }

  addChildRequirement(parentRequirement: any) {
    console.log('Add child requirement for:', parentRequirement);
    // TODO: Open create modal with parent pre-selected
  }

  deleteRequirement(requirement: any) {
    if (confirm(`¿Está seguro de eliminar el requisito ${requirement.id}?`)) {
      console.log('Delete requirement:', requirement);
      // TODO: Implement delete functionality
    }
  }
}
