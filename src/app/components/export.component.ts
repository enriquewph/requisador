import { Component, signal, inject, OnInit, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService, Requirement } from '../services/database.service';
import { jsPDF } from 'jspdf';

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

interface RequirementTreeNode {
  id: string;
  textualId: string;
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
  children: RequirementTreeNode[];
  parent_id?: number;
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <!-- PDF Export -->
        <div class="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">Exportar a PDF</h3>
              <p class="text-sm text-gray-600">Documento con estructura jerárquica</p>
            </div>
          </div>
          
          <div class="space-y-3 mb-4">
            <div class="text-sm text-gray-600">
              <strong>Incluye:</strong>
              <ul class="mt-2 space-y-1 text-xs text-gray-500 ml-4">
                <li>• Vista de árbol desplegado</li>
                <li>• Indentación visual por nivel</li>
                <li>• Información completa de requisitos</li>
                <li>• Formato profesional para reportes</li>
                <li>• Compatible con impresión</li>
              </ul>
            </div>
          </div>

          <button 
            (click)="exportToPDF()"
            [disabled]="isExporting() || totalRequirements() === 0"
            class="w-full px-4 py-2 bg-red-600 text-white border border-red-600 rounded-lg transition-all duration-200 hover:bg-red-500 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
            @if (isExporting()) {
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exportando...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Descargar PDF</span>
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

  private buildRequirementTree(): RequirementTreeNode[] {
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

    // Create node map
    const nodeMap = new Map<number, RequirementTreeNode>();
    const rootNodes: RequirementTreeNode[] = [];

    // First pass: create all nodes
    requirements.forEach(req => {
      const node: RequirementTreeNode = {
        id: req.id!.toString(),
        textualId: this.generateRequirementId(req),
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
        updated_at: this.formatDate(req.updated_at || ''),
        children: [],
        parent_id: req.parent_id
      };
      nodeMap.set(req.id!, node);
    });

    // Second pass: build hierarchy
    requirements.forEach(req => {
      const node = nodeMap.get(req.id!)!;
      
      if (req.parent_id) {
        const parentNode = nodeMap.get(req.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort nodes at each level
    const sortNodes = (nodes: RequirementTreeNode[]) => {
      nodes.sort((a, b) => a.order_index - b.order_index);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);
    return rootNodes;
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
          version: '2.1.0',
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

  async exportToPDF() {
    try {
      this.isExporting.set(true);
      this.exportStatus.set(null);

      const treeData = this.buildRequirementTree();
      
      if (treeData.length === 0) {
        this.setExportStatus('No hay requisitos para exportar', 'error');
        return;
      }

      // Create PDF document
      const doc = new (jsPDF as any)();
      
      // Set document properties
      doc.setProperties({
        title: 'Requisitos del Sistema - Vista Jerárquica',
        subject: 'Documento generado por Requisador de Requisitos',
        author: 'Requisador de Requisitos v2.1.0',
        creator: 'Sistema de Gestión de Requisitos'
      });

      // Document settings
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (2 * margin);
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(96, 93, 200); // Primary color
      doc.text('Requisitos del Sistema', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Vista Jerárquica - Estructura de Árbol', margin, yPosition);
      yPosition += 5;

      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 5;

      doc.text(`Total de requisitos: ${this.totalRequirements()}`, margin, yPosition);
      yPosition += 15;

      // Draw separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Render tree
      yPosition = this.renderTreeToPDF(doc, treeData, margin, yPosition, maxWidth, pageHeight, margin);

      // Add additional sections
      yPosition = await this.addVariablesSection(doc, yPosition, margin, maxWidth, pageHeight);
      yPosition = await this.addLatencyDefinitionsSection(doc, yPosition, margin, maxWidth, pageHeight);
      yPosition = await this.addToleranceDefinitionsSection(doc, yPosition, margin, maxWidth, pageHeight);

      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Requisador de Requisitos v2.1.0', margin, pageHeight - 15);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 30, pageHeight - 15);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin - 80, pageHeight - 10);
      }

      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `requisitos-jerarquicos-${timestamp}.pdf`;
      
      doc.save(filename);

      this.setExportStatus(`PDF exportado exitosamente: ${filename} (${this.totalRequirements()} requisitos)`, 'success');
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.setExportStatus('Error al exportar a PDF', 'error');
    } finally {
      this.isExporting.set(false);
    }
  }

  private renderTreeToPDF(doc: any, nodes: RequirementTreeNode[], xStart: number, yStart: number, maxWidth: number, pageHeight: number, margin: number): number {
    let yPosition = yStart;
    const lineHeight = 6;
    const pageWidth = doc.internal.pageSize.getWidth();

    const renderNode = (node: RequirementTreeNode, level: number): void => {
      // Check if we need a new page (allow more space for complete requirement data)
      if (yPosition > pageHeight - 70) {
        doc.addPage();
        yPosition = margin + 20;
      }

      // Create a card-like layout for each requirement (no indentation)
      const cardX = xStart;
      const cardWidth = maxWidth;
      
      // Calculate total height needed for this requirement
      const hierarchyPrefix = '▸ '.repeat(level);
      const idText = `${hierarchyPrefix}${node.textualId}`;
      const idWidth = Math.max(doc.getTextWidth(idText) + 12, 60);
      
      const fullText = `El ${node.component_name} deberá ${node.behavior} ${node.variable_name} cuando el sistema esté en modo ${node.mode_name}`;
      const textStartX = cardX + idWidth + 10;
      const textWidth = cardWidth - idWidth - 15;
      
      // Calculate split text first to get accurate height
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(fullText, textWidth);
      
      // Calculate total card height based on actual text height plus metadata sections
      const textSectionHeight = Math.max(10, splitText.length * 5);
      const metadataSectionHeight = 30; // Fixed height for the 3 metadata rows
      const totalCardHeight = textSectionHeight + metadataSectionHeight + 10; // +10 for padding
      
      // Background card with proper height
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(220, 220, 220);
      doc.rect(cardX, yPosition - 5, cardWidth, totalCardHeight, 'FD');
      
      // Requirement ID header with hierarchy indicator
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(96, 93, 200);
      doc.roundedRect(cardX + 3, yPosition - 3, idWidth, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(idText, cardX + 7, yPosition + 3);

      // Full requirement text (right side of ID)
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      
      // Add subtle background for requirement text with accurate height
      const textHeight = splitText.length * 5 + 4; // Proper height calculation
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.rect(textStartX - 2, yPosition - 2, textWidth + 4, textHeight, 'FD');
      
      doc.text(splitText, textStartX, yPosition + 3);
      
      yPosition += textSectionHeight;

      // Detailed information section
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      
      // First row: Function and Variable
      doc.setTextColor(30, 64, 175); // Blue for function
      doc.text(`Función: ${node.function_name}`, cardX + 7, yPosition + 5);
      doc.setTextColor(22, 163, 74); // Green for variable
      doc.text(`Variable: ${node.variable_name}`, cardX + 7 + (cardWidth / 2), yPosition + 5);
      
      yPosition += 8;
      
      // Second row: Component and Mode
      doc.setTextColor(99, 102, 241); // Indigo for component
      doc.text(`Componente: ${node.component_name}`, cardX + 7, yPosition + 5);
      doc.setTextColor(147, 51, 234); // Purple for mode
      doc.text(`Modo: ${node.mode_name}`, cardX + 7 + (cardWidth / 2), yPosition + 5);
      
      yPosition += 8;
      
      // Third row: Level and children count only (removed dates)
      doc.setTextColor(107, 114, 128); // Gray for metadata
      doc.setFont('helvetica', 'normal');
      doc.text(`Nivel: ${level}`, cardX + 7, yPosition + 5);
      const childrenCount = node.children.length;
      doc.text(`Sub-requisitos: ${childrenCount}`, cardX + 7 + (cardWidth / 2), yPosition + 5);
      
      // Move yPosition to the end of the card plus spacing
      yPosition += 20; // Space between cards

      // Render children
      node.children.forEach(child => {
        renderNode(child, level + 1);
      });
    };

    // Render all root nodes
    nodes.forEach(node => {
      renderNode(node, 0);
    });

    return yPosition;
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

  private async addVariablesSection(doc: any, yPosition: number, margin: number, maxWidth: number, pageHeight: number): Promise<number> {
    // Check if we need a new page
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = margin + 20;
    }

    // Section title
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74); // Green for variables
    doc.setFont('helvetica', 'bold');
    doc.text('Variables del Sistema', margin, yPosition);
    yPosition += 15;

    try {
      const variables = await this.databaseService.variables.getAll();
      const latencySpecs = await this.databaseService.latencySpecifications.getAll();
      const toleranceSpecs = await this.databaseService.toleranceSpecifications.getAll();

      // Create a map for quick lookup
      const latencyMap = new Map(latencySpecs.map((spec: any) => [spec.variable_id, spec]));
      const toleranceMap = new Map(toleranceSpecs.map((spec: any) => [spec.variable_id, spec]));

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      for (const variable of variables) {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = margin + 20;
        }

        // Get associated specs
        const latencySpec: any = latencyMap.get(variable.id);
        const toleranceSpec: any = toleranceMap.get(variable.id);

        // Calculate card height based on content
        const baseHeight = 45;
        const additionalHeight = (latencySpec ? 25 : 0) + (toleranceSpec ? 25 : 0);
        const cardHeight = baseHeight + additionalHeight;

        // Variable card with dynamic height
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(34, 197, 94);
        doc.rect(margin, yPosition - 3, maxWidth, cardHeight, 'FD');

        // Variable header
        doc.setTextColor(22, 163, 74);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(variable.name, margin + 5, yPosition + 5);

        // Variable description
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const descText = doc.splitTextToSize(variable.description || 'Sin descripción', maxWidth - 10);
        doc.text(descText, margin + 5, yPosition + 12);

        yPosition += Math.max(15, descText.length * 4);

        // Variable details
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`ID: ${variable.id} | Orden: ${variable.order_index}`, margin + 5, yPosition + 5);
        yPosition += 10;

        // Associated Latency Specification
        if (latencySpec) {
          doc.setFillColor(235, 245, 255);
          doc.setDrawColor(59, 130, 246);
          doc.rect(margin + 10, yPosition, maxWidth - 20, 20, 'FD');
          
          doc.setTextColor(59, 130, 246);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`Latencia Asociada: ${latencySpec.name}`, margin + 15, yPosition + 6);
          
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`Tipo: ${latencySpec.type} | Valor: ${latencySpec.value} ${latencySpec.units}`, margin + 15, yPosition + 12);
          doc.text(`Interpretación: ${latencySpec.physical_interpretation}`, margin + 15, yPosition + 17);
          
          yPosition += 25;
        }

        // Associated Tolerance Specification
        if (toleranceSpec) {
          doc.setFillColor(250, 245, 255);
          doc.setDrawColor(168, 85, 247);
          doc.rect(margin + 10, yPosition, maxWidth - 20, 20, 'FD');
          
          doc.setTextColor(168, 85, 247);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`Tolerancia Asociada: ${toleranceSpec.name}`, margin + 15, yPosition + 6);
          
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`Tipo: ${toleranceSpec.type} | Valor: ${toleranceSpec.value} ${toleranceSpec.units}`, margin + 15, yPosition + 12);
          doc.text(`Interpretación: ${toleranceSpec.physical_interpretation}`, margin + 15, yPosition + 17);
          
          yPosition += 25;
        }

        // Show if no specs are associated
        if (!latencySpec && !toleranceSpec) {
          doc.setTextColor(150, 150, 150);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.text('Sin especificaciones de latencia o tolerancia asociadas', margin + 10, yPosition + 5);
          yPosition += 10;
        }

        yPosition += 15; // Space between variables
      }
    } catch (error) {
      console.error('Error loading variables:', error);
      doc.setTextColor(200, 50, 50);
      doc.text('Error al cargar variables', margin, yPosition);
      yPosition += 10;
    }

    return yPosition;
  }

  private async addLatencyDefinitionsSection(doc: any, yPosition: number, margin: number, maxWidth: number, pageHeight: number): Promise<number> {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin + 20;
    }

    // Section title
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Blue for latency
    doc.setFont('helvetica', 'bold');
    doc.text('Definiciones de Latencia', margin, yPosition);
    yPosition += 15;

    try {
      const latencySpecs = await this.databaseService.latencySpecifications.getAll();

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      for (const spec of latencySpecs) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = margin + 20;
        }

        // Calculate card height based on content
        const interpretationText = doc.splitTextToSize(spec.physical_interpretation || 'Sin interpretación', maxWidth - 10);
        const justificationText = doc.splitTextToSize(spec.justification || 'Sin justificación', maxWidth - 10);
        const cardHeight = 50 + (interpretationText.length * 4) + (justificationText.length * 4);

        // Latency specification card
        doc.setFillColor(239, 246, 255);
        doc.setDrawColor(59, 130, 246);
        doc.rect(margin, yPosition - 3, maxWidth, cardHeight, 'FD');

        // Specification header
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(spec.name, margin + 5, yPosition + 5);

        // Type and value
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Tipo: ${spec.type}`, margin + 5, yPosition + 12);
        doc.text(`Valor: ${spec.value} ${spec.units}`, margin + 5 + (maxWidth / 2), yPosition + 12);

        yPosition += 18;

        // Physical interpretation
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Interpretación Física:', margin + 5, yPosition);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(interpretationText, margin + 5, yPosition);
        yPosition += interpretationText.length * 4 + 3;

        // Justification
        doc.setFont('helvetica', 'bold');
        doc.text('Justificación:', margin + 5, yPosition);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(justificationText, margin + 5, yPosition);
        yPosition += justificationText.length * 4;

        // Metadata
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text(`ID: ${spec.id}`, margin + 5, yPosition + 8);
        
        yPosition += 20; // Space between specifications
      }
    } catch (error) {
      console.error('Error loading latency specifications:', error);
      doc.setTextColor(200, 50, 50);
      doc.text('Error al cargar especificaciones de latencia', margin, yPosition);
      yPosition += 10;
    }

    return yPosition;
  }

  private async addToleranceDefinitionsSection(doc: any, yPosition: number, margin: number, maxWidth: number, pageHeight: number): Promise<number> {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin + 20;
    }

    // Section title
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(168, 85, 247); // Purple for tolerance
    doc.setFont('helvetica', 'bold');
    doc.text('Definiciones de Tolerancia', margin, yPosition);
    yPosition += 15;

    try {
      const toleranceSpecs = await this.databaseService.toleranceSpecifications.getAll();

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      for (const spec of toleranceSpecs) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = margin + 20;
        }

        // Calculate card height based on content
        const interpretationText = doc.splitTextToSize(spec.physical_interpretation || 'Sin interpretación', maxWidth - 10);
        const justificationText = doc.splitTextToSize(spec.justification || 'Sin justificación', maxWidth - 10);
        const cardHeight = 50 + (interpretationText.length * 4) + (justificationText.length * 4);

        // Tolerance specification card
        doc.setFillColor(250, 245, 255);
        doc.setDrawColor(168, 85, 247);
        doc.rect(margin, yPosition - 3, maxWidth, cardHeight, 'FD');

        // Specification header
        doc.setTextColor(168, 85, 247);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(spec.name, margin + 5, yPosition + 5);

        // Type and value
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Tipo: ${spec.type}`, margin + 5, yPosition + 12);
        doc.text(`Valor: ${spec.value} ${spec.units}`, margin + 5 + (maxWidth / 2), yPosition + 12);

        yPosition += 18;

        // Physical interpretation
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Interpretación Física:', margin + 5, yPosition);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(interpretationText, margin + 5, yPosition);
        yPosition += interpretationText.length * 4 + 3;

        // Justification
        doc.setFont('helvetica', 'bold');
        doc.text('Justificación:', margin + 5, yPosition);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        doc.text(justificationText, margin + 5, yPosition);
        yPosition += justificationText.length * 4;

        // Metadata
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.text(`ID: ${spec.id}`, margin + 5, yPosition + 8);
        
        yPosition += 20; // Space between specifications
      }
    } catch (error) {
      console.error('Error loading tolerance specifications:', error);
      doc.setTextColor(200, 50, 50);
      doc.text('Error al cargar especificaciones de tolerancia', margin, yPosition);
      yPosition += 10;
    }

    return yPosition;
  }
}
