import {Component as NgComponent, signal} from '@angular/core';
import { ConfigurationComponent } from './components/configuration.component';
import { SpecificationsManagementComponent } from './components/specifications-management.component';
import { RequirementsCreatorComponent } from './components/requirements-creator.component';
import { RequirementsManageComponent } from './components/requirements-manage.component';

@NgComponent({
  selector: 'app-root',
  imports: [ConfigurationComponent, SpecificationsManagementComponent, RequirementsCreatorComponent, RequirementsManageComponent],
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
          
          <!-- About Button -->
          <button 
            (click)="showAboutModal.set(true)"
            class="px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors font-medium flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Acerca De</span>
          </button>
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
            <div class="text-center py-16">
              <div class="max-w-md mx-auto">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h2 class="text-2xl font-semibold text-gray-900 mb-4">Exportar</h2>
                <p class="text-gray-600">Exporta requisitos en formato JSON o CSV</p>
                <p class="text-sm text-gray-500 mt-2">Funcionalidad próximamente disponible</p>
              </div>
            </div>
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
              UTN FRC 2025 - para los Gladiadores Electrónicos
            </p>
            <p class="text-xs text-gray-500">
              Requisador de Requisitos siguiendo metodología del Systems Engineering Handbook
            </p>
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
                  <p class="text-gray-600">1.0.0 - Enero 2025</p>
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
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'Requisador de Requisitos';
  activeTab = signal<'config' | 'especificaciones' | 'create' | 'manage' | 'export'>('config');
  showAboutModal = signal(false);
}
