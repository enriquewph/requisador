import { Component, computed, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, LatencySpecification, ToleranceSpecification } from '../services/database.service';

@Component({
  selector: 'app-specifications-management',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-6 text-orange-600">Gestión de Especificaciones</h2>
        
        <!-- Tab Navigation -->
        <nav class="flex space-x-4 border-b border-gray-200 mb-6">
          <button 
            (click)="activeSpecTab.set('latencia')"
            [class]="activeSpecTab() === 'latencia' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-2 px-4 border-b-2 font-medium text-sm transition-colors">
            Especificaciones de Latencia
          </button>
          <button 
            (click)="activeSpecTab.set('tolerancia')"
            [class]="activeSpecTab() === 'tolerancia' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-2 px-4 border-b-2 font-medium text-sm transition-colors">
            Especificaciones de Tolerancia
          </button>
        </nav>

        <!-- Latency Specifications Tab -->
        @if (activeSpecTab() === 'latencia') {
          <!-- Add/Edit Latency Form -->
          <div class="p-4 border rounded-lg bg-blue-50 mb-6">
            <h3 class="font-medium mb-3 text-blue-700">
              {{ isEditingLatency() ? 'Editar Especificación de Latencia' : 'Agregar Nueva Especificación de Latencia' }}
            </h3>
            
            <form [formGroup]="latencyForm" (ngSubmit)="saveLatency()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full"
                  placeholder="ej: Tiempo de Respuesta Estándar">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select formControlName="type" class="w-full">
                  <option value="">Seleccionar tipo...</option>
                  <option value="Real">Real</option>
                  <option value="Digital">Digital</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Discrete">Discreto</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input 
                  type="number" 
                  formControlName="value"
                  class="w-full"
                  placeholder="ej: 100"
                  step="0.01">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Unidades *</label>
                <select formControlName="units" class="w-full">
                  <option value="">Seleccionar unidades...</option>
                  <option value="ms">milisegundos (ms)</option>
                  <option value="s">segundos (s)</option>
                  <option value="us">microsegundos (us)</option>
                  <option value="ns">nanosegundos (ns)</option>
                  <option value="Hz">Hertz (Hz)</option>
                  <option value="kHz">kiloHertz (kHz)</option>
                  <option value="MHz">megaHertz (MHz)</option>
                </select>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Interpretación Física *</label>
                <textarea 
                  formControlName="physical_interpretation"
                  class="w-full"
                  rows="2"
                  placeholder="ej: El tiempo máximo durante el cual el sistema debe responder a una entrada del usuario"></textarea>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Justificación</label>
                <textarea 
                  formControlName="justification"
                  class="w-full"
                  rows="2"
                  placeholder="ej: Basado en estándares de usabilidad para interfaces críticas"></textarea>
              </div>
              
              <div class="md:col-span-2 flex space-x-3">
                <button 
                  type="submit" 
                  class="primary"
                  [disabled]="!latencyForm.valid">
                  {{ isEditingLatency() ? 'Actualizar' : 'Agregar' }} Especificación
                </button>
                
                @if (isEditingLatency()) {
                  <button 
                    type="button" 
                    (click)="cancelEditLatency()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200">
                    Cancelar
                  </button>
                }
              </div>
            </form>
          </div>

          <!-- Latency Specifications List -->
          <div class="space-y-3">
            <h3 class="font-medium text-blue-700">Especificaciones de Latencia Existentes ({{ latencySpecs().length }})</h3>
            
            @if (latencySpecs().length === 0) {
              <div class="text-center py-8 text-gray-500">
                <p>No hay especificaciones de latencia definidas aún.</p>
                <p class="text-sm">Agrega tu primera especificación arriba.</p>
              </div>
            } @else {
              @for (spec of latencySpecs(); track spec.id) {
                <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 bg-white">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <span class="font-medium text-blue-700">{{ spec.name }}</span>
                      <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">{{ spec.type }}</span>
                      <span class="text-gray-600">{{ spec.value }} {{ spec.units }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ spec.physical_interpretation }}</p>
                    @if (spec.justification) {
                      <p class="text-xs text-gray-500 mt-1 italic">{{ spec.justification }}</p>
                    }
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      (click)="editLatency(spec)"
                      class="px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                      Editar
                    </button>
                    <button 
                      (click)="deleteLatency(spec.id!)"
                      class="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Tolerance Specifications Tab -->
        @if (activeSpecTab() === 'tolerancia') {
          <!-- Add/Edit Tolerance Form -->
          <div class="p-4 border rounded-lg bg-yellow-50 mb-6">
            <h3 class="font-medium mb-3 text-yellow-700">
              {{ isEditingTolerance() ? 'Editar Especificación de Tolerancia' : 'Agregar Nueva Especificación de Tolerancia' }}
            </h3>
            
            <form [formGroup]="toleranceForm" (ngSubmit)="saveTolerance()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full"
                  placeholder="ej: Precisión Estándar">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select formControlName="type" class="w-full">
                  <option value="">Seleccionar tipo...</option>
                  <option value="Absoluta">Absoluta</option>
                  <option value="Relativa">Relativa</option>
                  <option value="Estadística">Estadística</option>
                  <option value="Funcional">Funcional</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                <input 
                  type="number" 
                  formControlName="value"
                  class="w-full"
                  placeholder="ej: 0.1"
                  step="0.001">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Unidades *</label>
                <select formControlName="units" class="w-full">
                  <option value="">Seleccionar unidades...</option>
                  <option value="%">porcentaje (%)</option>
                  <option value="m">metros (m)</option>
                  <option value="cm">centímetros (cm)</option>
                  <option value="mm">milímetros (mm)</option>
                  <option value="°C">grados Celsius (°C)</option>
                  <option value="°F">grados Fahrenheit (°F)</option>
                  <option value="V">voltios (V)</option>
                  <option value="A">amperios (A)</option>
                  <option value="W">vatios (W)</option>
                  <option value="Pa">pascales (Pa)</option>
                  <option value="bar">bares (bar)</option>
                  <option value="psi">libras por pulgada cuadrada (psi)</option>
                </select>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Interpretación Física *</label>
                <textarea 
                  formControlName="physical_interpretation"
                  class="w-full"
                  rows="2"
                  placeholder="ej: La desviación máxima permitida respecto al valor nominal en condiciones normales"></textarea>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Justificación</label>
                <textarea 
                  formControlName="justification"
                  class="w-full"
                  rows="2"
                  placeholder="ej: Basado en estándares ISO para sistemas de medición de precisión"></textarea>
              </div>
              
              <div class="md:col-span-2 flex space-x-3">
                <button 
                  type="submit" 
                  class="primary"
                  [disabled]="!toleranceForm.valid">
                  {{ isEditingTolerance() ? 'Actualizar' : 'Agregar' }} Especificación
                </button>
                
                @if (isEditingTolerance()) {
                  <button 
                    type="button" 
                    (click)="cancelEditTolerance()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200">
                    Cancelar
                  </button>
                }
              </div>
            </form>
          </div>

          <!-- Tolerance Specifications List -->
          <div class="space-y-3">
            <h3 class="font-medium text-yellow-700">Especificaciones de Tolerancia Existentes ({{ toleranceSpecs().length }})</h3>
            
            @if (toleranceSpecs().length === 0) {
              <div class="text-center py-8 text-gray-500">
                <p>No hay especificaciones de tolerancia definidas aún.</p>
                <p class="text-sm">Agrega tu primera especificación arriba.</p>
              </div>
            } @else {
              @for (spec of toleranceSpecs(); track spec.id) {
                <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-yellow-50 bg-white">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <span class="font-medium text-yellow-700">{{ spec.name }}</span>
                      <span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">{{ spec.type }}</span>
                      <span class="text-gray-600">{{ spec.value }} {{ spec.units }}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ spec.physical_interpretation }}</p>
                    @if (spec.justification) {
                      <p class="text-xs text-gray-500 mt-1 italic">{{ spec.justification }}</p>
                    }
                  </div>
                  <div class="flex space-x-2">
                    <button 
                      (click)="editTolerance(spec)"
                      class="px-3 py-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors">
                      Editar
                    </button>
                    <button 
                      (click)="deleteTolerance(spec.id!)"
                      class="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- Help Section -->
        <div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">Acerca de las Especificaciones</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <div>
              <strong>Latencia:</strong>
              <div class="ml-4 space-y-1">
                <p><strong>Real:</strong> Mediciones continuas de tiempo físico (ms, s)</p>
                <p><strong>Digital:</strong> Temporización de sistemas digitales discretos (ciclos de reloj, períodos de muestreo)</p>
                <p><strong>Virtual:</strong> Restricciones de tiempo definidas por software (tiempo de ejecución, tiempo de respuesta)</p>
                <p><strong>Discreto:</strong> Temporización basada en eventos (intervalos periódicos, basada en disparadores)</p>
              </div>
            </div>
            <div>
              <strong>Tolerancia:</strong>
              <div class="ml-4 space-y-1">
                <p><strong>Absoluta:</strong> Desviación fija respecto al valor nominal (±0.1V, ±2°C)</p>
                <p><strong>Relativa:</strong> Desviación porcentual respecto al valor nominal (±5%, ±0.1%)</p>
                <p><strong>Estadística:</strong> Basada en distribuciones estadísticas (desviación estándar, percentiles)</p>
                <p><strong>Funcional:</strong> Dependiente del contexto operacional (condiciones ambientales, carga del sistema)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificationsManagementComponent {
  private fb = inject(FormBuilder);
  private databaseService = inject(DatabaseService);

  // State signals
  activeSpecTab = signal<'latencia' | 'tolerancia'>('latencia');
  latencySpecs = signal<LatencySpecification[]>([]);
  toleranceSpecs = signal<ToleranceSpecification[]>([]);
  isEditingLatency = signal(false);
  isEditingTolerance = signal(false);
  editingLatencyId = signal<number | null>(null);
  editingToleranceId = signal<number | null>(null);

  // Forms
  latencyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['', Validators.required],
    value: [null, [Validators.required, Validators.min(0)]],
    units: ['', Validators.required],
    physical_interpretation: ['', [Validators.required, Validators.minLength(10)]],
    justification: ['']
  });

  toleranceForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['', Validators.required],
    value: [null, [Validators.required, Validators.min(0)]],
    units: ['', Validators.required],
    physical_interpretation: ['', [Validators.required, Validators.minLength(10)]],
    justification: ['']
  });

  async ngOnInit() {
    await this.loadAllSpecs();
  }

  private async loadAllSpecs() {
    try {
      const latencySpecs = this.databaseService.getLatencySpecifications();
      const toleranceSpecs = this.databaseService.getToleranceSpecifications();
      this.latencySpecs.set(latencySpecs);
      this.toleranceSpecs.set(toleranceSpecs);
    } catch (error) {
      console.error('Error loading specifications:', error);
    }
  }

  // Latency methods
  async saveLatency() {
    if (!this.latencyForm.valid) return;

    const latencyData = this.latencyForm.value;

    try {
      if (this.isEditingLatency()) {
        const success = this.databaseService.updateLatencySpecification(this.editingLatencyId()!, latencyData);
        if (!success) throw new Error('Failed to update latency specification');
      } else {
        const id = this.databaseService.addLatencySpecification(latencyData);
        if (id === -1) throw new Error('Failed to create latency specification');
      }
      
      await this.loadAllSpecs();
      this.resetLatencyForm();
    } catch (error) {
      console.error('Error saving latency specification:', error);
    }
  }

  editLatency(spec: LatencySpecification) {
    this.latencyForm.patchValue({
      name: spec.name,
      type: spec.type,
      value: spec.value,
      units: spec.units,
      physical_interpretation: spec.physical_interpretation,
      justification: spec.justification || ''
    });
    this.isEditingLatency.set(true);
    this.editingLatencyId.set(spec.id!);
  }

  cancelEditLatency() {
    this.resetLatencyForm();
  }

  async deleteLatency(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta especificación de latencia?')) return;

    try {
      const success = this.databaseService.deleteLatencySpecification(id);
      if (!success) throw new Error('Failed to delete latency specification');
      await this.loadAllSpecs();
    } catch (error) {
      console.error('Error deleting latency specification:', error);
    }
  }

  private resetLatencyForm() {
    this.latencyForm.reset();
    this.isEditingLatency.set(false);
    this.editingLatencyId.set(null);
  }

  // Tolerance methods
  async saveTolerance() {
    if (!this.toleranceForm.valid) return;

    const toleranceData = this.toleranceForm.value;

    try {
      if (this.isEditingTolerance()) {
        const success = this.databaseService.updateToleranceSpecification(this.editingToleranceId()!, toleranceData);
        if (!success) throw new Error('Failed to update tolerance specification');
      } else {
        const id = this.databaseService.addToleranceSpecification(toleranceData);
        if (id === -1) throw new Error('Failed to create tolerance specification');
      }
      
      await this.loadAllSpecs();
      this.resetToleranceForm();
    } catch (error) {
      console.error('Error saving tolerance specification:', error);
    }
  }

  editTolerance(spec: ToleranceSpecification) {
    this.toleranceForm.patchValue({
      name: spec.name,
      type: spec.type,
      value: spec.value,
      units: spec.units,
      physical_interpretation: spec.physical_interpretation,
      justification: spec.justification || ''
    });
    this.isEditingTolerance.set(true);
    this.editingToleranceId.set(spec.id!);
  }

  cancelEditTolerance() {
    this.resetToleranceForm();
  }

  async deleteTolerance(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta especificación de tolerancia?')) return;

    try {
      const success = this.databaseService.deleteToleranceSpecification(id);
      if (!success) throw new Error('Failed to delete tolerance specification');
      await this.loadAllSpecs();
    } catch (error) {
      console.error('Error deleting tolerance specification:', error);
    }
  }

  private resetToleranceForm() {
    this.toleranceForm.reset();
    this.isEditingTolerance.set(false);
    this.editingToleranceId.set(null);
  }
}
