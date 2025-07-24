import { Component, signal, inject, OnInit, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService, Requirement } from '../services/database.service';

interface ExportData {
  id: string;
  function_name: string;
  variable_name: string;
  component_name: string;
  mode_name: string;
  behavior: string;
  condition: string;
  justification: string;
  level: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-export',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Exportar Requisitos</h2>
          <p class="text-sm text-gray-600 mt-1">Exporta todos los requisitos del sistema en diferentes formatos</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ totalRequirements() }} requisitos
          </span>
        </div>
      </div>

      <!-- Export Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- CSV Export -->
        <div class="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">Exportar a CSV</h3>
              <p class="text-sm text-gray-600">Formato de valores separados por comas</p>
            </div>
          </div>
          
          <div class="space-y-3 mb-4">
            <div class="text-sm text-gray-600">
              <strong>Incluye:</strong>
              <ul class="mt-2 space-y-1 text-xs text-gray-500 ml-4">
                <li>• ID del requisito y jerarquía</li>
                <li>• Función, Variable, Componente y Modo</li>
                <li>• Comportamiento y condiciones</li>
                <li>• Justificación y metadatos</li>
                <li>• Fechas de creación y modificación</li>
              </ul>
            </div>
          </div>

          <button 
            (click)="exportToCSV()"
            [disabled]="isExporting() || totalRequirements() === 0"
            class="w-full px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg transition-all duration-200 hover:bg-green-500 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            @if (isExporting()) {
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exportando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Descargar CSV</span>
            }
          </button>
        </div>

        <!-- JSON Export -->
        <div class="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">Exportar a JSON</h3>
              <p class="text-sm text-gray-600">Formato JavaScript Object Notation</p>
            </div>
          </div>
          
          <div class="space-y-3 mb-4">
            <div class="text-sm text-gray-600">
              <strong>Incluye:</strong>
              <ul class="mt-2 space-y-1 text-xs text-gray-500 ml-4">
                <li>• Estructura completa jerárquica</li>
                <li>• Todos los metadatos y relaciones</li>
                <li>• Formato estructurado para APIs</li>
                <li>• Compatible con herramientas de desarrollo</li>
              </ul>
            </div>
          </div>

          <button 
            (click)="exportToJSON()"
            [disabled]="isExporting() || totalRequirements() === 0"
            class="w-full px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg transition-all duration-200 hover:bg-blue-500 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            @if (isExporting()) {
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exportando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Descargar JSON</span>
            }
          </button>
        </div>
      </div>

      <!-- Export Status -->
      @if (exportStatus()) {
        <div class="mt-6 p-4 rounded-lg" 
             [class]="exportStatus()?.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'">
          <div class="flex items-center space-x-2">
            @if (exportStatus()?.type === 'success') {
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            } @else {
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            }
            <span class="font-medium">{{ exportStatus()?.message }}</span>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (totalRequirements() === 0) {
        <div class="mt-8 text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h6"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay requisitos para exportar</h3>
          <p class="text-gray-600 mb-4">Crea algunos requisitos primero para poder exportarlos.</p>
          <button 
            (click)="navigateToCreate.emit()"
            class="px-4 py-2 bg-primary-600 text-white border border-primary-600 rounded-lg transition-all duration-200 hover:bg-primary-500 hover:border-primary-500">
            Ir a Crear Requisitos
          </button>
        </div>
      }

      <!-- Preview Section -->
      @if (totalRequirements() > 0) {
        <div class="mt-8 border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Vista Previa de Datos</h3>
          <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div class="text-xs font-mono text-gray-600">
              <div class="grid grid-cols-1 gap-2">
                @for (req of previewRequirements(); track req.id) {
                  <div class="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                    <span class="font-medium">{{ generateRequirementId(req) }}</span>
                    <span class="text-gray-500 truncate ml-4 max-w-md">{{ req.behavior }}</span>
                  </div>
                }
              </div>
              @if (totalRequirements() > 5) {
                <div class="text-center py-2 text-gray-500">
                  ... y {{ totalRequirements() - 5 }} requisitos más
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ExportComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  
  // Output to communicate with parent component
  navigateToCreate = output<void>();

  // State signals
  requirements = signal<Requirement[]>([]);
  isExporting = signal(false);
  exportStatus = signal<{message: string, type: 'success' | 'error'} | null>(null);

  // Computed values
  totalRequirements = signal(0);
  previewRequirements = signal<Requirement[]>([]);

  async ngOnInit() {
    await this.loadRequirements();
  }

  private async loadRequirements() {
    try {
      // Wait for database to be ready
      while (!this.databaseService.isReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const reqs = this.databaseService.requirements.getAll();
      this.requirements.set(reqs);
      this.totalRequirements.set(reqs.length);
      this.previewRequirements.set(reqs.slice(0, 5)); // Show first 5 for preview
    } catch (error) {
      console.error('Error loading requirements:', error);
      this.setExportStatus('Error al cargar los requisitos', 'error');
    }
  }

  generateRequirementId(requirement: Requirement): string {
    // Build hierarchical ID based on parent-child relationships
    const buildHierarchicalId = (req: Requirement): string => {
      if (!req.parent_id) {
        // Root requirement
        return `R${req.order_index}`;
      }
      
      // Find parent requirement
      const parent = this.requirements().find(r => r.id === req.parent_id);
      if (parent) {
        const parentId = buildHierarchicalId(parent);
        return `${parentId}-${req.order_index}`;
      }
      
      // Fallback if parent not found
      return `R${req.order_index}`;
    };
    
    return buildHierarchicalId(requirement);
  }

  private buildExportData(): ExportData[] {
    const requirements = this.requirements();
    const functions = this.databaseService.functions.getAll();
    const variables = this.databaseService.variables.getAll();
    const components = this.databaseService.components.getAll();
    const modes = this.databaseService.modes.getAll();

    // Create lookup maps
    const functionMap = new Map(functions.map(f => [f.id!, f.name]));
    const variableMap = new Map(variables.map(v => [v.id!, v.name]));
    const componentMap = new Map(components.map(c => [c.id!, c.name]));
    const modeMap = new Map(modes.map(m => [m.id!, m.name]));

    // Sort requirements by level and order_index for proper hierarchy
    const sortedRequirements = [...requirements].sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.order_index - b.order_index;
    });

    return sortedRequirements.map(req => ({
      id: this.generateRequirementId(req),
      function_name: functionMap.get(req.function_id) || 'Unknown',
      variable_name: variableMap.get(req.variable_id) || 'Unknown',
      component_name: componentMap.get(req.component_id) || 'Unknown',
      mode_name: modeMap.get(req.mode_id) || 'Unknown',
      behavior: req.behavior,
      condition: req.condition || '',
      justification: req.justification || '',
      level: req.level,
      order_index: req.order_index,
      created_at: this.formatDate(req.created_at || ''),
      updated_at: this.formatDate(req.updated_at || '')
    }));
  }

  async exportToCSV() {
    try {
      this.isExporting.set(true);
      this.exportStatus.set(null);

      const exportData = this.buildExportData();
      
      if (exportData.length === 0) {
        this.setExportStatus('No hay requisitos para exportar', 'error');
        return;
      }

      // Create CSV content
      const headers = [
        'ID',
        'Función',
        'Variable', 
        'Componente',
        'Modo',
        'Comportamiento',
        'Condición',
        'Justificación',
        'Nivel',
        'Orden',
        'Fecha Creación',
        'Fecha Modificación'
      ];

      const csvContent = [
        headers.join(','),
        ...exportData.map(row => [
          this.escapeCsvValue(row.id),
          this.escapeCsvValue(row.function_name),
          this.escapeCsvValue(row.variable_name),
          this.escapeCsvValue(row.component_name),
          this.escapeCsvValue(row.mode_name),
          this.escapeCsvValue(row.behavior),
          this.escapeCsvValue(row.condition),
          this.escapeCsvValue(row.justification),
          row.level,
          row.order_index,
          this.escapeCsvValue(row.created_at),
          this.escapeCsvValue(row.updated_at)
        ].join(','))
      ].join('\n');

      // Create and download file
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `requisitos-${timestamp}.csv`;
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.setExportStatus(`CSV exportado exitosamente: ${filename} (${exportData.length} requisitos)`, 'success');
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      this.setExportStatus('Error al exportar a CSV', 'error');
    } finally {
      this.isExporting.set(false);
    }
  }

  async exportToJSON() {
    try {
      this.isExporting.set(true);
      this.exportStatus.set(null);

      const exportData = this.buildExportData();
      
      if (exportData.length === 0) {
        this.setExportStatus('No hay requisitos para exportar', 'error');
        return;
      }

      // Create JSON content with metadata
      const jsonData = {
        metadata: {
          export_date: new Date().toISOString(),
          total_requirements: exportData.length,
          version: '2.0.0',
          source: 'Requisador de Requisitos'
        },
        requirements: exportData
      };

      const jsonContent = JSON.stringify(jsonData, null, 2);

      // Create and download file
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `requisitos-${timestamp}.json`;
      
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.setExportStatus(`JSON exportado exitosamente: ${filename} (${exportData.length} requisitos)`, 'success');
      
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      this.setExportStatus('Error al exportar a JSON', 'error');
    } finally {
      this.isExporting.set(false);
    }
  }

  private escapeCsvValue(value: string | number): string {
    if (typeof value === 'number') {
      return value.toString();
    }
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const stringValue = value || '';
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private setExportStatus(message: string, type: 'success' | 'error') {
    this.exportStatus.set({ message, type });
    
    // Auto-clear success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.exportStatus.set(null);
      }, 5000);
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
