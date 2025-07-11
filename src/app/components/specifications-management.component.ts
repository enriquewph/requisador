import { Component, computed, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService, LatencySpecification, ToleranceSpecification } from '../services/database.service';

@Component({
  selector: 'app-specifications-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specifications-management.component.html',
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
      const latencySpecs = this.databaseService.latencySpecifications.getAll();
      const toleranceSpecs = this.databaseService.toleranceSpecifications.getAll();
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
        const success = this.databaseService.latencySpecifications.update(this.editingLatencyId()!, latencyData);
        if (!success) throw new Error('Failed to update latency specification');
      } else {
        const id = this.databaseService.latencySpecifications.add(latencyData);
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
      const success = this.databaseService.latencySpecifications.delete(id);
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
        const success = this.databaseService.toleranceSpecifications.update(this.editingToleranceId()!, toleranceData);
        if (!success) throw new Error('Failed to update tolerance specification');
      } else {
        const id = this.databaseService.toleranceSpecifications.add(toleranceData);
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
      const success = this.databaseService.toleranceSpecifications.delete(id);
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
