import { Component, signal, OnInit, inject } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatabaseService } from '../services/database.service';
import { Requirement } from '../services/database/interfaces';

interface RequirementTreeNode extends TreeNode {
  data: {
    id: number;
    textualId: string;  // Add textual ID like "R0", "R0-0", "R0-1-0"
    behavior: string;
    condition: string;
    justification: string;
    component: string;
    mode: string;
    function: string;
    variable: string;
    level: number;
    order_index: number;
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
  private databaseService = inject(DatabaseService);
  
  requirements = signal<RequirementTreeNode[]>([]);
  selectedRequirement = signal<RequirementTreeNode | null>(null);
  activeSubTab = signal<'tree' | 'list' | 'reports'>('tree');
  
  cols = [
    { field: 'textualId', header: 'ID', width: '120px' },
    { field: 'behavior', header: 'Comportamiento', width: '300px' },
    { field: 'condition', header: 'Condición', width: '250px' },
    { field: 'component', header: 'Componente', width: '140px' },
    { field: 'mode', header: 'Modo', width: '120px' },
    { field: 'function', header: 'Función', width: '140px' },
    { field: 'variable', header: 'Variable', width: '140px' },
    { field: 'justification', header: 'Justificación', width: '250px' }
  ];

  async ngOnInit() {
    // Wait for database to be ready
    const checkDatabase = () => {
      if (this.databaseService.isReady()) {
        this.loadRequirements();
      } else {
        setTimeout(checkDatabase, 100);
      }
    };
    checkDatabase();
  }

  async loadRequirements() {
    try {
      // Wait for database to be ready
      if (!this.databaseService.isReady()) {
        console.log('Database not ready yet, waiting...');
        return;
      }

      const requirements = this.databaseService.requirements.getAll();
      const components = this.databaseService.components.getAll();
      const modes = this.databaseService.modes.getAll();
      const functions = this.databaseService.functions.getAll();
      const variables = this.databaseService.variables.getAll();

      const treeData = this.buildTreeStructure(requirements, components, modes, functions, variables);
      this.requirements.set(treeData);
    } catch (error) {
      console.error('Error loading requirements:', error);
    }
  }

  buildTreeStructure(
    requirements: Requirement[], 
    components: any[], 
    modes: any[], 
    functions: any[], 
    variables: any[]
  ): RequirementTreeNode[] {
    // Create lookup maps
    const componentMap = new Map(components.map(c => [c.id!, c.name]));
    const modeMap = new Map(modes.map(m => [m.id!, m.name]));
    const functionMap = new Map(functions.map(f => [f.id!, f.name]));
    const variableMap = new Map(variables.map(v => [v.id!, v.name]));

    const nodeMap = new Map<number, RequirementTreeNode>();
    const rootNodes: RequirementTreeNode[] = [];

    // First pass: create all nodes
    requirements.forEach(req => {
      const node: RequirementTreeNode = {
        data: {
          id: req.id!,
          textualId: '', // Will be computed after building hierarchy
          behavior: req.behavior,
          condition: req.condition || '',
          justification: req.justification || '',
          component: componentMap.get(req.component_id) || 'Unknown',
          mode: modeMap.get(req.mode_id) || 'Unknown',
          function: functionMap.get(req.function_id) || 'Unknown',
          variable: variableMap.get(req.variable_id) || 'Unknown',
          level: req.level,
          order_index: req.order_index
        },
        children: [],
        expanded: req.level <= 1, // Auto-expand first two levels
        leaf: false
      };
      nodeMap.set(req.id!, node);
    });

    // Second pass: build hierarchy
    requirements.forEach(req => {
      const node = nodeMap.get(req.id!)!;
      
      if (req.parent_id) {
        const parentNode = nodeMap.get(req.parent_id);
        if (parentNode) {
          parentNode.children!.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Mark leaf nodes and sort children by order_index
    nodeMap.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => a.data.order_index - b.data.order_index);
        node.leaf = false;
      } else {
        node.leaf = true;
      }
    });

    // Sort root nodes by order_index
    const sortedRoots = rootNodes.sort((a, b) => a.data.order_index - b.data.order_index);
    
    // Third pass: compute textual IDs
    this.computeTextualIds(sortedRoots);
    
    return sortedRoots;
  }

  /**
   * Recursively compute textual IDs for the tree structure
   * Root nodes: R0, R1, R2, ...
   * Children: R0-0, R0-1, R0-2, ...
   * Grandchildren: R0-0-0, R0-0-1, R0-1-0, ...
   */
  private computeTextualIds(nodes: RequirementTreeNode[], parentId: string = ''): void {
    nodes.forEach((node, index) => {
      if (parentId === '') {
        // Root level: R0, R1, R2, ...
        node.data.textualId = `R${index}`;
      } else {
        // Child level: append index to parent ID
        node.data.textualId = `${parentId}-${index}`;
      }
      
      // Recursively compute IDs for children
      if (node.children && node.children.length > 0) {
        this.computeTextualIds(node.children, node.data.textualId);
      }
    });
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

  /**
   * Generate the next textual ID for a new requirement
   * @param parentNode - Parent requirement node (null for root level)
   * @returns Next available textual ID
   */
  generateNextTextualId(parentNode: RequirementTreeNode | null = null): string {
    if (!parentNode) {
      // Root level: find the next R{n} ID
      const rootNodes = this.requirements();
      const maxIndex = rootNodes.length > 0 
        ? Math.max(...rootNodes.map(node => {
            const match = node.data.textualId.match(/^R(\d+)$/);
            return match ? parseInt(match[1]) : -1;
          }))
        : -1;
      return `R${maxIndex + 1}`;
    } else {
      // Child level: append next index to parent ID
      const children = parentNode.children || [];
      const nextIndex = children.length;
      return `${parentNode.data.textualId}-${nextIndex}`;
    }
  }

  /**
   * Parse textual ID to extract hierarchy information
   * @param textualId - Textual ID like "R0-1-2"
   * @returns Object with level and indices
   */
  /**
   * Parse textual ID to extract hierarchy information
   * @param textualId - Textual ID like "R0-1-2"
   * @returns Object with level and indices
   */
  parseTextualId(textualId: string): { level: number; indices: number[] } {
    const match = textualId.match(/^R(\d+)(?:-(\d+))*$/);
    if (!match) {
      throw new Error(`Invalid textual ID format: ${textualId}`);
    }
    
    const parts = textualId.substring(1).split('-'); // Remove 'R' and split by '-'
    const indices = parts.map(part => parseInt(part));
    
    return {
      level: indices.length - 1, // R0 = level 0, R0-1 = level 1, R0-1-2 = level 2
      indices
    };
  }

  /**
   * Get CSS classes for different column types and requirement levels
   */
  getColumnClass(field: string, level: number): string {
    const baseClasses: string[] = [];
    
    switch (field) {
      case 'textualId':
        const levelClass = `req-id-level-${Math.min(level, 4)}`;
        baseClasses.push(levelClass);
        break;
        
      case 'behavior':
        baseClasses.push('text-content');
        break;
        
      case 'condition':
        baseClasses.push('text-content-secondary');
        break;
        
      case 'justification':
        baseClasses.push('text-content-muted');
        break;
        
      case 'component':
        baseClasses.push('entity-tag', 'component-tag');
        break;
        
      case 'mode':
        baseClasses.push('entity-tag', 'mode-tag');
        break;
        
      case 'function':
        baseClasses.push('entity-tag', 'function-tag');
        break;
        
      case 'variable':
        baseClasses.push('entity-tag', 'variable-tag');
        break;
        
      default:
        baseClasses.push('text-content');
    }
    
    return baseClasses.join(' ');
  }

  deleteRequirement(requirement: any) {
    if (confirm(`¿Está seguro de eliminar el requisito ${requirement.textualId}?`)) {
      console.log('Delete requirement:', requirement);
      // TODO: Implement delete functionality
    }
  }
}
