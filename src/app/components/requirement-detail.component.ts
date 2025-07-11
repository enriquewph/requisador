import { Component as NgComponent, Input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Requirement, Function, Variable, Component, Mode } from '../services/database.service';

@NgComponent({
  selector: 'app-requirement-detail',
  imports: [],
  template: `
    <div class="space-y-6">
      @if (requirement; as req) {
        
        <!-- Requirement Text Section -->
        <div class="bg-white p-6 rounded-lg border-l-4 border-primary-500 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Requisito {{requirementId}}</h3>
          <p class="text-lg text-gray-900 leading-relaxed">{{generateRequirementText(req)}}</p>
        </div>

        <!-- Condition Section -->
        @if (req.condition && req.condition.trim()) {
          <div class="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400 shadow-sm">
            <h3 class="text-base font-semibold text-amber-800 mb-3">Condición para Aplicación</h3>
            <p class="text-amber-700 leading-relaxed">{{req.condition}}</p>
          </div>
        }

        <!-- Entity Details Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Entidades del Sistema</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
              <h4 class="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">Función</h4>
              <p class="text-blue-700 font-medium text-base mb-2">{{functionName()}}</p>
              @if (functionEntity()?.description) {
                <p class="text-blue-600 text-sm leading-relaxed">{{functionEntity()?.description}}</p>
              }
            </div>
            
            <div class="bg-green-50 p-5 rounded-lg border border-green-100 shadow-sm">
              <h4 class="text-sm font-semibold text-green-800 mb-3 uppercase tracking-wide">Variable</h4>
              <p class="text-green-700 font-medium text-base mb-2">{{variableName()}}</p>
              @if (variableEntity()?.description) {
                <p class="text-green-600 text-sm leading-relaxed">{{variableEntity()?.description}}</p>
              }
            </div>
            
            <div class="bg-indigo-50 p-5 rounded-lg border border-indigo-100 shadow-sm">
              <h4 class="text-sm font-semibold text-indigo-800 mb-3 uppercase tracking-wide">Componente</h4>
              <p class="text-indigo-700 font-medium text-base mb-2">{{componentName()}}</p>
              @if (componentEntity()?.description) {
                <p class="text-indigo-600 text-sm leading-relaxed">{{componentEntity()?.description}}</p>
              }
            </div>
            
            <div class="bg-purple-50 p-5 rounded-lg border border-purple-100 shadow-sm">
              <h4 class="text-sm font-semibold text-purple-800 mb-3 uppercase tracking-wide">Modo</h4>
              <p class="text-purple-700 font-medium text-base mb-2">{{modeName()}}</p>
              @if (modeEntity()?.description) {
                <p class="text-purple-600 text-sm leading-relaxed">{{modeEntity()?.description}}</p>
              }
            </div>
          </div>
        </div>

        <!-- Specifications Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Latency Specification -->
            @if (variableWithSpecs()?.latency_spec; as latencySpec) {
              <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 shadow-sm">
                <h4 class="text-base font-semibold text-blue-800 mb-4">Especificación de Latencia</h4>
                <div class="space-y-2">
                  <p class="text-blue-700 font-medium"><strong>{{latencySpec.name}}</strong> <span class="text-blue-600">({{latencySpec.type}})</span></p>
                  <p class="text-blue-600 text-sm leading-relaxed">{{latencySpec.physical_interpretation}}</p>
                  <p class="text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded inline-block">{{latencySpec.value}} {{latencySpec.units}}</p>
                  @if (latencySpec.justification) {
                    <p class="text-blue-600 text-sm italic mt-3 pl-3 border-l-2 border-blue-300">{{latencySpec.justification}}</p>
                  }
                </div>
              </div>
            } @else {
              <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300 shadow-sm">
                <h4 class="text-base font-semibold text-gray-600 mb-3">Especificación de Latencia</h4>
                <p class="text-gray-500">Sin especificación asignada</p>
              </div>
            }

            <!-- Tolerance Specification -->
            @if (variableWithSpecs()?.tolerance_spec; as toleranceSpec) {
              <div class="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                <h4 class="text-base font-semibold text-yellow-800 mb-4">Especificación de Tolerancia</h4>
                <div class="space-y-2">
                  <p class="text-yellow-700 font-medium"><strong>{{toleranceSpec.name}}</strong> <span class="text-yellow-600">({{toleranceSpec.type}})</span></p>
                  <p class="text-yellow-600 text-sm leading-relaxed">{{toleranceSpec.physical_interpretation}}</p>
                  <p class="text-yellow-700 font-semibold bg-yellow-100 px-3 py-1 rounded inline-block">{{toleranceSpec.value}} {{toleranceSpec.units}}</p>
                  @if (toleranceSpec.justification) {
                    <p class="text-yellow-600 text-sm italic mt-3 pl-3 border-l-2 border-yellow-300">{{toleranceSpec.justification}}</p>
                  }
                </div>
              </div>
            } @else {
              <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-300 shadow-sm">
                <h4 class="text-base font-semibold text-gray-600 mb-3">Especificación de Tolerancia</h4>
                <p class="text-gray-500">Sin especificación asignada</p>
              </div>
            }
          </div>
        </div>

        <!-- Justification Section -->
        @if (req.justification && req.justification.trim()) {
          <div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-400 shadow-sm">
            <h4 class="text-base font-semibold text-green-800 mb-3">Justificación del Requisito</h4>
            <p class="text-green-700 leading-relaxed">{{req.justification}}</p>
          </div>
        }

        <!-- Hierarchy Info Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Información de Jerarquía</h3>
          @if (req.parent_id) {
            <div class="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
              <h4 class="text-base font-semibold text-blue-900 mb-3">Sub-requisito</h4>
              <p class="text-blue-700">
                Requisito padre: 
                <span class="font-mono text-primary-600 bg-white px-2 py-1 rounded border ml-2">{{parentRequirementId()}}</span>
              </p>
            </div>
          } @else {
            <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-100 shadow-sm">
              <h4 class="text-base font-semibold text-indigo-900 mb-3">Requisito Principal</h4>
              <p class="text-indigo-700">Este es un requisito de nivel superior</p>
            </div>
          }
        </div>

        @if (showTechnicalDetails) {
          <!-- Technical Details Section -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <h4 class="text-base font-semibold text-gray-900 mb-4">Información Técnica</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-600 uppercase tracking-wide">ID del Sistema</span>
                <p class="text-gray-900 font-mono bg-white px-2 py-1 rounded border">{{req.id}}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-600 uppercase tracking-wide">Nivel</span>
                <p class="text-gray-900 font-semibold">{{req.level}}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-600 uppercase tracking-wide">Orden</span>
                <p class="text-gray-900 font-semibold">{{req.order_index}}</p>
              </div>
              <div class="space-y-1">
                <span class="text-sm font-medium text-gray-600 uppercase tracking-wide">Fecha de Creación</span>
                <p class="text-gray-900 text-sm">{{formatDate(req.created_at)}}</p>
              </div>
            </div>
          </div>
        }

      } @else {
        <div class="text-center py-12 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-lg font-medium">No se encontró información del requisito</p>
          <p class="text-sm">Verifica que el requisito existe y tiene todos los datos necesarios</p>
        </div>
      }
    </div>
  `,
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
    return this.db.getFunctions().find(f => f.id === req.function_id) || null;
  });

  variableEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.getVariables().find(v => v.id === req.variable_id) || null;
  });

  componentEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.getComponents().find(c => c.id === req.component_id) || null;
  });

  modeEntity = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.getModes().find(m => m.id === req.mode_id) || null;
  });

  variableWithSpecs = computed(() => {
    const req = this.requirement;
    if (!req) return null;
    return this.db.getVariableWithSpecifications(req.variable_id);
  });

  functionName = computed(() => this.functionEntity()?.name || 'N/A');
  variableName = computed(() => this.variableEntity()?.name || 'N/A');
  componentName = computed(() => this.componentEntity()?.name || 'N/A');
  modeName = computed(() => this.modeEntity()?.name || 'N/A');

  parentRequirementId = computed(() => {
    const req = this.requirement;
    if (!req?.parent_id) return '';
    const parent = this.db.getRequirements().find(r => r.id === req.parent_id);
    return parent ? this.db.generateRequirementId(parent) : '';
  });

  generateRequirementText(requirement: Requirement): string {
    const functionName = this.functionName();
    const variableName = this.variableName();
    const componentName = this.componentName();
    const modeName = this.modeName();

    return `El ${componentName} deberá ${requirement.behavior} ${variableName} cuando el sistema esté en modo ${modeName}`;
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
