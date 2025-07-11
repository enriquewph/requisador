# PrimeNG TreeTable Instructions for Requisador de Requisitos

## 📚 Official Documentation
**Always refer to the official documentation**: https://primeng.org/treetable

This guide provides specific examples and patterns for implementing PrimeNG TreeTable in the requirements management system.

## 🚀 Installation & Setup

### 1. Install PrimeNG
```bash
npm install primeng
npm install primeicons
```

### 2. Import in Component
```typescript
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
```

### 3. Add PrimeNG Styles
In `styles.css` or component-specific styles:
```css
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/primeng.css';
@import 'primeicons/primeicons.css';
```

## 🌳 Core Data Structure

### TreeNode Interface for Requirements
```typescript
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
```

### Sample Data Structure
```typescript
const requirementsTree: RequirementTreeNode[] = [
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
        leaf: true
      }
    ]
  }
];
```

## 🎨 Basic TreeTable Implementation

### Component Template
```html
<div class="bg-white rounded-lg shadow p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-gray-900">Gestión de Requisitos</h2>
    <div class="flex space-x-3">
      <button 
        pButton 
        type="button" 
        icon="pi pi-plus" 
        label="Nuevo Requisito"
        class="p-button-primary">
      </button>
      <button 
        pButton 
        type="button" 
        icon="pi pi-expand" 
        label="Expandir Todo"
        class="p-button-outlined"
        (click)="expandAll()">
      </button>
      <button 
        pButton 
        type="button" 
        icon="pi pi-compress" 
        label="Colapsar Todo"
        class="p-button-outlined"
        (click)="collapseAll()">
      </button>
    </div>
  </div>

  <p-treeTable 
    [value]="requirements()" 
    [columns]="cols"
    [scrollable]="true" 
    scrollHeight="600px"
    [resizableColumns]="true"
    [reorderableColumns]="true"
    [globalFilterFields]="['id', 'text', 'component', 'mode']"
    #tt>
    
    <!-- Global Filter -->
    <ng-template pTemplate="caption">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              type="text" 
              placeholder="Buscar requisitos..." 
              (input)="tt.filterGlobal($any($event.target).value, 'contains')"
              class="w-64">
          </span>
        </div>
        <div class="text-sm text-gray-600">
          Total: {{ getTotalRequirements() }} requisitos
        </div>
      </div>
    </ng-template>

    <!-- Column Headers -->
    <ng-template pTemplate="header" let-columns>
      <tr>
        <th *ngFor="let col of columns" [style.width]="col.width" [pSortableColumn]="col.field">
          <div class="flex items-center">
            {{ col.header }}
            <p-sortIcon [field]="col.field"></p-sortIcon>
          </div>
        </th>
        <th style="width: 150px">Acciones</th>
      </tr>
    </ng-template>

    <!-- Row Content -->
    <ng-template pTemplate="body" let-rowNode let-rowData="rowData" let-columns="columns">
      <tr [ttRow]="rowNode">
        <td *ngFor="let col of columns">
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
        
        <!-- Actions Column -->
        <td>
          <div class="flex items-center space-x-2">
            <button 
              pButton 
              type="button" 
              icon="pi pi-eye" 
              class="p-button-text p-button-sm"
              pTooltip="Ver detalles"
              (click)="viewRequirement(rowData)">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-pencil" 
              class="p-button-text p-button-sm"
              pTooltip="Editar"
              (click)="editRequirement(rowData)">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-plus" 
              class="p-button-text p-button-sm"
              pTooltip="Agregar sub-requisito"
              (click)="addChildRequirement(rowData)">
            </button>
            <button 
              pButton 
              type="button" 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger"
              pTooltip="Eliminar"
              (click)="deleteRequirement(rowData)">
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
              pButton 
              type="button" 
              label="Crear Primer Requisito" 
              icon="pi pi-plus"
              class="p-button-outlined">
            </button>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-treeTable>
</div>
```

## 💻 Component Implementation

### TypeScript Component
```typescript
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-requirements-manage',
  imports: [
    TreeTableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- Template from above -->`
})
export class RequirementsManageComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  
  requirements = signal<RequirementTreeNode[]>([]);
  selectedRequirement = signal<RequirementTreeNode | null>(null);
  
  cols = [
    { field: 'id', header: 'ID', width: '120px' },
    { field: 'text', header: 'Texto del Requisito', width: '400px' },
    { field: 'component', header: 'Componente', width: '120px' },
    { field: 'mode', header: 'Modo', width: '120px' },
    { field: 'function', header: 'Función', width: '120px' },
    { field: 'variable', header: 'Variable', width: '120px' },
    { field: 'created_at', header: 'Creado', width: '100px' }
  ];

  ngOnInit() {
    this.loadRequirements();
  }

  async loadRequirements() {
    try {
      const reqs = await this.databaseService.getRequirements();
      const treeData = this.buildTreeStructure(reqs);
      this.requirements.set(treeData);
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  }

  buildTreeStructure(requirements: any[]): RequirementTreeNode[] {
    const nodeMap = new Map<string, RequirementTreeNode>();
    const rootNodes: RequirementTreeNode[] = [];

    // First pass: create all nodes
    requirements.forEach(req => {
      const node: RequirementTreeNode = {
        data: req,
        children: [],
        expanded: req.level <= 1, // Auto-expand first two levels
        leaf: false
      };
      nodeMap.set(req.id, node);
    });

    // Second pass: build hierarchy
    requirements.forEach(req => {
      const node = nodeMap.get(req.id)!;
      
      if (req.parent_id) {
        const parentNode = nodeMap.get(req.parent_id);
        if (parentNode) {
          parentNode.children!.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Mark leaf nodes
    nodeMap.forEach(node => {
      node.leaf = !node.children || node.children.length === 0;
    });

    return rootNodes;
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
    this.selectedRequirement.set(requirement);
    // Open modal or navigate to detail view
  }

  editRequirement(requirement: any) {
    // Open edit modal or navigate to edit form
  }

  addChildRequirement(parentRequirement: any) {
    // Open create modal with parent pre-selected
  }

  async deleteRequirement(requirement: any) {
    if (confirm(`¿Está seguro de eliminar el requisito ${requirement.id}?`)) {
      try {
        await this.databaseService.deleteRequirement(requirement.id);
        await this.loadRequirements(); // Reload data
      } catch (error) {
        console.error('Error deleting requirement:', error);
      }
    }
  }
}
```

## 🎨 Custom Styling

### TreeTable Custom Styles
```css
/* Override PrimeNG TreeTable styles */
.p-treetable {
  @apply border border-gray-200 rounded-lg overflow-hidden;
}

.p-treetable .p-treetable-header {
  @apply bg-gray-50 border-b border-gray-200;
}

.p-treetable .p-treetable-thead > tr > th {
  @apply bg-gray-50 text-gray-700 font-semibold text-sm py-3 px-4 border-b border-gray-200;
}

.p-treetable .p-treetable-tbody > tr > td {
  @apply py-3 px-4 border-b border-gray-100;
}

.p-treetable .p-treetable-tbody > tr:hover {
  @apply bg-gray-50;
}

.p-treetable .p-treetable-tbody > tr.p-highlight {
  @apply bg-primary-50 border-primary-200;
}

/* TreeTable Toggler */
.p-treetable-toggler {
  @apply text-gray-500 hover:text-gray-700;
}

.p-treetable-toggler.p-treetable-toggler-expanded .pi-chevron-right:before {
  content: "\e930"; /* chevron-down icon */
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## 🔧 Advanced Features

### 1. Context Menu
```typescript
// Add to component
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

// In template
<p-contextMenu #cm [model]="contextMenuItems"></p-contextMenu>
<p-treeTable [contextMenu]="cm" ...>

// In component
contextMenuItems: MenuItem[] = [
  {
    label: 'Ver Detalles',
    icon: 'pi pi-eye',
    command: () => this.viewRequirement(this.selectedRequirement())
  },
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    command: () => this.editRequirement(this.selectedRequirement())
  },
  {
    separator: true
  },
  {
    label: 'Agregar Sub-requisito',
    icon: 'pi pi-plus',
    command: () => this.addChildRequirement(this.selectedRequirement())
  },
  {
    separator: true
  },
  {
    label: 'Eliminar',
    icon: 'pi pi-trash',
    styleClass: 'text-red-600',
    command: () => this.deleteRequirement(this.selectedRequirement())
  }
];
```

### 2. Row Selection
```html
<p-treeTable 
  [value]="requirements()" 
  selectionMode="single"
  [(selection)]="selectedRequirement"
  (onNodeSelect)="onRequirementSelect($event)"
  ...>
```

### 3. Filtering
```typescript
// Advanced filtering
filterRequirements(event: any) {
  const query = event.target.value.toLowerCase();
  // Implement custom filtering logic
}
```

### 4. Drag & Drop Reordering
```html
<p-treeTable 
  [value]="requirements()" 
  [reorderableRows]="true"
  (onRowReorder)="onRowReorder($event)"
  ...>
```

## 📱 Responsive Design

### Mobile-Optimized TreeTable
```html
<!-- For mobile, show simplified view -->
<div class="block md:hidden">
  <!-- Mobile card-based view -->
</div>

<div class="hidden md:block">
  <!-- Desktop TreeTable -->
  <p-treeTable ...>
</div>
```

## 🚨 Important Notes

1. **Always check the official documentation**: https://primeng.org/treetable
2. **TreeNode structure is crucial** - ensure proper parent-child relationships
3. **Performance**: Use virtual scrolling for large datasets
4. **Accessibility**: PrimeNG components have built-in ARIA support
5. **Styling**: Use CSS custom properties to match your theme
6. **Data binding**: Use signals for reactive updates

## 🔗 Useful PrimeNG Components for Requirements Management

- **TreeTable**: Main hierarchical view
- **DataTable**: Alternative flat view
- **Dialog**: Modal for editing/viewing
- **ConfirmDialog**: Delete confirmations
- **Toast**: Success/error messages
- **ContextMenu**: Right-click actions
- **Toolbar**: Action buttons
- **Paginator**: For large datasets

## 📚 Additional Resources

- PrimeNG TreeTable Demo: https://primeng.org/treetable
- PrimeNG Theming: https://primeng.org/theming
- Angular Tree Components: https://angular.io/guide/hierarchical-injectors
