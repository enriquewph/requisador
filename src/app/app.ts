import {Component as NgComponent, signal, inject} from '@angular/core';
import { ConfigurationComponent } from './components/configuration.component';
import { SpecificationsManagementComponent } from './components/specifications-management.component';
import { RequirementsCreatorComponent } from './components/requirements-creator.component';
import { RequirementsManageComponent } from './components/requirements-manage.component';
import { ExportComponent } from './components/export.component';
import { DatabaseService } from './services/database.service';

@NgComponent({
  selector: 'app-root',
  imports: [ConfigurationComponent, SpecificationsManagementComponent, RequirementsCreatorComponent, RequirementsManageComponent, ExportComponent],
  template: `
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center space-x-3">
            <img src="assets/logo.svg" alt="Requisador Logo" class="h-8 w-8">
            <h1 class="text-xl font-bold text-gray-900">Requisador de Requisitos</h1>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <!-- Export Project Button -->
            <button 
              (click)="exportProject()"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Exportar</span>
            </button>
            
            <!-- Import Project Button -->
            <label class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center space-x-2 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
              </svg>
              <span>Importar</span>
              <input 
                type="file" 
                accept=".requisador,.json" 
                (change)="importProject($event)" 
                class="hidden">
            </label>
            
            <!-- About Button -->
            <button 
              (click)="showAboutModal.set(true)"
              class="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors font-medium flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Acerca De</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-1 p-1">
          <button 
            (click)="activeTab.set('config')"
            [class]="activeTab() === 'config' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7l2 2m0 0l2 2m-2-2v6m0 0l-2 2m2-2l-2-2M7 7h0m0 0v0m0 0h0M7 7l2 2m-2-2v2m0-2l-2 2m2-2h2"/>
            </svg>
            <span>Entidades</span>
          </button>
          <button 
            (click)="activeTab.set('especificaciones')"
            [class]="activeTab() === 'especificaciones' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
            <span>Especificaciones</span>
          </button>
          <button 
            (click)="activeTab.set('create')"
            [class]="activeTab() === 'create' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Crear Requisitos</span>
          </button>
          <button 
            (click)="activeTab.set('manage')"
            [class]="activeTab() === 'manage' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
            <span>Gestionar</span>
          </button>
          <button 
            (click)="activeTab.set('export')"
            [class]="activeTab() === 'export' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            class="px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Exportar</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-200px)] bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @switch (activeTab()) {
          @case ('config') {
            <app-configuration></app-configuration>
          }
          @case ('especificaciones') {
            <app-specifications-management></app-specifications-management>
          }
          @case ('create') {
            <app-requirements-creator></app-requirements-creator>
          }
          @case ('manage') {
            <app-requirements-manage></app-requirements-manage>
          }
          @case ('export') {
            <app-export (navigateToCreate)="activeTab.set('create')"></app-export>
          }
        }
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-center md:text-left">
            <p class="text-sm text-gray-600">
              <span class="font-medium text-primary-600">Vibecodeado por</span>
              <a href="https://github.com/enriquewph" 
                 target="_blank" 
                 class="ml-1 text-gray-900 hover:text-primary-600 font-medium">
                enriquewph
              </a>
            </p>
            <p class="text-xs text-gray-500 mt-1">
              UTN FRC 2025 - para los Gladiadores Electrónicos | v2.0.0
            </p>
            <p class="text-xs text-gray-500">
              Requisador de Requisitos siguiendo metodología del Systems Engineering Handbook
            </p>
          </div>
          
          <!-- Load Default Values Button -->
          <div class="flex items-center">
            <button 
              (click)="confirmLoadDefaultValues()"
              class="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span>Cargar Datos por Defecto</span>
            </button>
          </div>
        </div>
      </div>
    </footer>

    <!-- About Modal -->
    @if (showAboutModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
           (click)="showAboutModal.set(false)">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Acerca de Requisador de Requisitos</h2>
            <button 
              (click)="showAboutModal.set(false)"
              class="text-gray-400 hover:text-gray-600 p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="p-6 space-y-6">
            <!-- Project Info -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Sobre el Proyecto</h3>
              <p class="text-gray-600 mb-4">
                Requisador de Requisitos es una aplicación web profesional para la gestión de requisitos 
                de sistemas de ingeniería. Sigue la metodología del Systems Engineering Handbook para 
                crear, organizar y gestionar requisitos comportamentales y de rendimiento.
              </p>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Características principales:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Creación estructurada de requisitos</li>
                  <li>• Gestión de Funciones, Variables, Componentes y Modos</li>
                  <li>• Estructura jerárquica de requisitos</li>
                  <li>• Exportación en múltiples formatos</li>
                  <li>• Base de datos SQLite local</li>
                  <li class="text-green-600 font-medium">• ✨ v2.0.0: Persistencia en localStorage</li>
                </ul>
              </div>
            </div>

            <!-- Developer Info -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Desarrollador</h3>
              <div class="flex items-start space-x-4">
                <img 
                  src="https://www.gravatar.com/avatar/3d9348418fad40ccde62a2df4de7f6f4?s=64" 
                  alt="Enrique Profile" 
                  class="w-16 h-16 rounded-full border-2 border-gray-200">
                <div>
                  <p class="font-medium text-gray-900">Enrique</p>
                  <p class="text-sm text-gray-600">Estudiante UTN FRC</p>
                  <div class="flex space-x-4 mt-2">
                    <a href="https://github.com/enriquewph" 
                       target="_blank" 
                       class="text-sm text-primary-600 hover:text-primary-700">
                      GitHub: enriquewph
                    </a>
                    <a href="mailto:quique18c@gmail.com" 
                       class="text-sm text-primary-600 hover:text-primary-700">
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical Info -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Información Técnica</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="font-medium text-gray-900">Repositorio:</p>
                  <a href="https://github.com/enriquewph/requisador" 
                     target="_blank" 
                     class="text-primary-600 hover:text-primary-700">
                    github.com/enriquewph/requisador
                  </a>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Despliegue:</p>
                  <a href="https://enriquewph.com.ar/requisador" 
                     target="_blank" 
                     class="text-primary-600 hover:text-primary-700">
                    enriquewph.com.ar/requisador
                  </a>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Tecnologías:</p>
                  <p class="text-gray-600">Angular 20+, TypeScript, SQLite, TailwindCSS</p>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Versión:</p>
                  <p class="text-gray-600">2.0.0 - Enero 2025</p>
                </div>
              </div>
            </div>

            <!-- UTN FRC -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Universidad Tecnológica Nacional</h3>
              <p class="text-sm text-gray-600">
                Facultad Regional Córdoba - Ingeniería Electrónica<br>
                Desarrollado para los <span class="font-medium text-purple-600">Gladiadores Electrónicos</span> 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Confirmation Modal for Load Default Values -->
    @if (showLoadDefaultConfirm()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
           (click)="showLoadDefaultConfirm.set(false)">
        <div class="bg-white rounded-lg max-w-md w-full" 
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Confirmar Carga de Datos</h2>
            <button 
              (click)="showLoadDefaultConfirm.set(false)"
              class="text-gray-400 hover:text-gray-600 p-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="p-6">
            <div class="flex items-start space-x-3">
              <svg class="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-2">¿Estás seguro?</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Esta acción cargará los datos por defecto del sistema y <strong>reemplazará todos los datos actuales</strong>. 
                  Se perderán todas las entidades y requisitos que hayas creado.
                </p>
                <p class="text-xs text-blue-600 mb-4">
                  <strong>Recomendación:</strong> Exporta tu proyecto antes de continuar si deseas conservar los datos actuales.
                </p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 mt-6">
              <button 
                (click)="showLoadDefaultConfirm.set(false)"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button 
                (click)="loadDefaultValues()"
                class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium">
                Sí, Cargar Datos por Defecto
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'Requisador de Requisitos';
  activeTab = signal<'config' | 'especificaciones' | 'create' | 'manage' | 'export'>('config');
  showAboutModal = signal(false);
  showLoadDefaultConfirm = signal(false);
  
  private databaseService = inject(DatabaseService);

  confirmLoadDefaultValues() {
    this.showLoadDefaultConfirm.set(true);
  }

  async loadDefaultValues() {
    try {
      this.showLoadDefaultConfirm.set(false);
      await this.databaseService.schema.loadInitialData();
      alert('Datos por defecto cargados exitosamente. La página se recargará para reflejar los cambios.');
      window.location.reload();
    } catch (error) {
      console.error('Error loading default values:', error);
      alert('Error al cargar los datos por defecto. Por favor, revisa la consola para más detalles.');
    }
  }

  async exportProject() {
    try {
      const data = this.databaseService.exportDatabase();
      if (!data) {
        alert('No hay datos para exportar. Asegúrate de que la base de datos esté inicializada.');
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `requisador-project-${timestamp}.requisador`;
      
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Proyecto exportado como: ${filename}`);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Error al exportar el proyecto. Por favor, revisa la consola para más detalles.');
    }
  }

  async importProject(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    if (!file.name.endsWith('.requisador') && !file.name.endsWith('.json')) {
      alert('Por favor, selecciona un archivo .requisador o .json válido.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      
      const success = await this.databaseService.importDatabase(data);
      if (success) {
        alert('Proyecto importado exitosamente. La página se recargará para reflejar los cambios.');
        window.location.reload();
      } else {
        alert('Error al importar el proyecto. El archivo puede estar corrupto o no ser válido.');
      }
    } catch (error) {
      console.error('Error importing project:', error);
      alert('Error al importar el proyecto. Por favor, verifica que el archivo sea válido.');
    }
    
    // Reset the input
    input.value = '';
  }
}
