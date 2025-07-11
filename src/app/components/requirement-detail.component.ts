import { Component as NgComponent, Input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Requirement, Function, Variable, Component, Mode } from '../services/database.service';

@NgComponent({
  selector: 'app-requirement-detail',
  imports: [],
  templateUrl: './requirement-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequirementDetailComponent {
  private db = inject(DatabaseService);

  // Inputs
  @Input() requirement: Requirement | null = null;
  @Input() requirementId = '';
  @Input() showTechnicalDetails = true;

  // Computed values for entities
  functionEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.functions.getAll().find(f => f.id === req.function_id) || null;
  });

  variableEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.variables.getAll().find(v => v.id === req.variable_id) || null;
  });

  componentEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.components.getAll().find(c => c.id === req.component_id) || null;
  });

  modeEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.modes.getAll().find(m => m.id === req.mode_id) || null;
  });

  variableWithSpecs = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.variables.getWithSpecifications(req.variable_id);
  });

  functionName = computed(() => this.functionEntity()?.name || 'N/A');
  variableName = computed(() => this.variableEntity()?.name || 'N/A');
  componentName = computed(() => this.componentEntity()?.name || 'N/A');
  modeName = computed(() => this.modeEntity()?.name || 'N/A');

  parentRequirementId = computed(() => {
    const req = this.requirement;
    if (!req?.parent_id) return '';
    const parent = this.db.requirements.getAll().find(r => r.id === req.parent_id);
    return parent ? this.generateParentId(parent) : '';
  });

  generateRequirementText(requirement: Requirement): string {
    const functionName = this.functionName();
    const variableName = this.variableName();
    const componentName = this.componentName();
    const modeName = this.modeName();

    return `El ${componentName} deberá ${requirement.behavior} ${variableName} cuando el sistema esté en modo ${modeName}`;
  }

  generateParentId(parent: Requirement): string {
    // Simple ID generation - can be enhanced later
    if (!parent.parent_id) {
      return `R${parent.order_index}`;
    } else {
      const grandParent = this.db.requirements.getAll().find(r => r.id === parent.parent_id);
      if (grandParent) {
        return `${this.generateParentId(grandParent)}-${parent.order_index}`;
      }
      return `R${parent.order_index}`;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
