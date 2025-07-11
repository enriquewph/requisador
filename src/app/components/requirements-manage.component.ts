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
  templateUrl: './requirements-manage.component.html',
  styleUrls: ['./requirements-manage.component.css']
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
