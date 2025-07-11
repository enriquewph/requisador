import { Component, computed, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, LatencySpecification } from '../services/database.service';

@Component({
  selector: 'app-latency-management',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-6 text-orange-600">Latency Specifications Management</h2>
        
        <!-- Add/Edit Form -->
        <div class="p-4 border rounded-lg bg-orange-50 mb-6">
          <h3 class="font-medium mb-3 text-orange-700">
            {{ isEditing() ? 'Edit Latency Specification' : 'Add New Latency Specification' }}
          </h3>
          
          <form [formGroup]="latencyForm" (ngSubmit)="saveLatency()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input 
                type="text" 
                formControlName="name"
                class="w-full"
                placeholder="e.g., Response Time Standard">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select formControlName="type" class="w-full">
                <option value="">Select type...</option>
                <option value="Real">Real</option>
                <option value="Digital">Digital</option>
                <option value="Virtual">Virtual</option>
                <option value="Discrete">Discrete</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Value *</label>
              <input 
                type="number" 
                formControlName="value"
                class="w-full"
                placeholder="e.g., 100"
                step="0.01">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Units *</label>
              <select formControlName="units" class="w-full">
                <option value="">Select units...</option>
                <option value="ms">milliseconds (ms)</option>
                <option value="s">seconds (s)</option>
                <option value="us">microseconds (us)</option>
                <option value="ns">nanoseconds (ns)</option>
                <option value="Hz">Hertz (Hz)</option>
                <option value="kHz">kiloHertz (kHz)</option>
                <option value="MHz">megaHertz (MHz)</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Physical Interpretation *</label>
              <textarea 
                formControlName="physical_interpretation"
                class="w-full"
                rows="2"
                placeholder="e.g., El tiempo máximo durante el cual el sistema debe responder a una entrada del usuario"></textarea>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Justification</label>
              <textarea 
                formControlName="justification"
                class="w-full"
                rows="2"
                placeholder="e.g., Basado en estándares de usabilidad para interfaces críticas"></textarea>
            </div>
            
            <div class="md:col-span-2 flex space-x-3">
              <button 
                type="submit" 
                class="primary"
                [disabled]="!latencyForm.valid">
                {{ isEditing() ? 'Update' : 'Add' }} Latency Specification
              </button>
              
              @if (isEditing()) {
                <button 
                  type="button" 
                  (click)="cancelEdit()"
                  class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200">
                  Cancel
                </button>
              }
            </div>
          </form>
        </div>

        <!-- Latency Specifications List -->
        <div class="space-y-3">
          <h3 class="font-medium text-orange-700">Existing Latency Specifications ({{ latencySpecs().length }})</h3>
          
          @if (latencySpecs().length === 0) {
            <div class="text-center py-8 text-gray-500">
              <p>No latency specifications defined yet.</p>
              <p class="text-sm">Add your first specification above.</p>
            </div>
          } @else {
            @for (spec of latencySpecs(); track spec.id) {
              <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-orange-50 bg-white">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <span class="font-medium text-orange-700">{{ spec.name }}</span>
                    <span class="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-600">{{ spec.type }}</span>
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
                    class="px-3 py-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors">
                    Edit
                  </button>
                  <button 
                    (click)="deleteLatency(spec.id!)"
                    class="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            }
          }
        </div>

        <!-- Help Section -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="font-medium text-blue-700 mb-2">About Latency Specifications</h4>
          <div class="text-sm text-blue-600 space-y-1">
            <p><strong>Real:</strong> Continuous physical time measurements (ms, s)</p>
            <p><strong>Digital:</strong> Discrete digital system timing (clock cycles, sample periods)</p>
            <p><strong>Virtual:</strong> Software-defined timing constraints (execution time, response time)</p>
            <p><strong>Discrete:</strong> Event-based timing (periodic intervals, trigger-based)</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LatencyManagementComponent {
  private fb = inject(FormBuilder);
  private databaseService = inject(DatabaseService);

  latencySpecs = signal<LatencySpecification[]>([]);
  isEditing = signal(false);
  editingId = signal<number | null>(null);

  latencyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['', Validators.required],
    value: [null, [Validators.required, Validators.min(0)]],
    units: ['', Validators.required],
    physical_interpretation: ['', [Validators.required, Validators.minLength(10)]],
    justification: ['']
  });

  async ngOnInit() {
    await this.loadLatencySpecs();
  }

  private async loadLatencySpecs() {
    try {
      const specs = this.databaseService.getLatencySpecifications();
      this.latencySpecs.set(specs);
    } catch (error) {
      console.error('Error loading latency specifications:', error);
    }
  }

  async saveLatency() {
    if (!this.latencyForm.valid) return;

    const latencyData = this.latencyForm.value;

    try {
      if (this.isEditing()) {
        const success = this.databaseService.updateLatencySpecification(this.editingId()!, latencyData);
        if (!success) throw new Error('Failed to update latency specification');
      } else {
        const id = this.databaseService.addLatencySpecification(latencyData);
        if (id === -1) throw new Error('Failed to create latency specification');
      }
      
      await this.loadLatencySpecs();
      this.resetForm();
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
    this.isEditing.set(true);
    this.editingId.set(spec.id!);
  }

  cancelEdit() {
    this.resetForm();
  }

  async deleteLatency(id: number) {
    if (!confirm('Are you sure you want to delete this latency specification?')) return;

    try {
      const success = this.databaseService.deleteLatencySpecification(id);
      if (!success) throw new Error('Failed to delete latency specification');
      await this.loadLatencySpecs();
    } catch (error) {
      console.error('Error deleting latency specification:', error);
    }
  }

  private resetForm() {
    this.latencyForm.reset();
    this.isEditing.set(false);
    this.editingId.set(null);
  }
}
