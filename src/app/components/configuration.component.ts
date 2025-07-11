import { Component as NgComponent, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService, Function, Variable, Component, Mode, LatencySpecification, ToleranceSpecification } from '../services/database.service';
import { FormsModule } from '@angular/forms';

@NgComponent({
  selector: 'app-configuration',
  imports: [FormsModule],
  templateUrl: './configuration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationComponent implements OnInit {
  private db = inject(DatabaseService);
  
  // State signals
  functions = signal<Function[]>([]);
  variables = signal<Variable[]>([]);
  components = signal<Component[]>([]);
  modes = signal<Mode[]>([]);
  modeComponents = signal<{mode_id: number, component_id: number}[]>([]);
  latencySpecs = signal<LatencySpecification[]>([]);
  toleranceSpecs = signal<ToleranceSpecification[]>([]);
  statusMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  // Form data
  newFunction = {name: '', description: ''};
  newVariable = {name: '', description: '', latency_spec_id: null as number | null, tolerance_spec_id: null as number | null};
  newComponent = {name: '', description: ''};
  newMode = {name: '', description: ''};

  async ngOnInit() {
    await this.loadAllData();
  }

  private async loadAllData() {
    try {
      // Wait for database to be ready
      while (!this.db.isReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const [funcs, vars, comps, modes, modeComps, latencySpecs, toleranceSpecs] = await Promise.all([
        Promise.resolve(this.db.functions.getAll()),
        Promise.resolve(this.db.variables.getAll()),
        Promise.resolve(this.db.components.getAll()),
        Promise.resolve(this.db.modes.getAll()),
        Promise.resolve(this.db.modes.getModeComponents()),
        Promise.resolve(this.db.latencySpecifications.getAll()),
        Promise.resolve(this.db.toleranceSpecifications.getAll())
      ]);

      this.functions.set(funcs);
      this.variables.set(vars);
      this.components.set(comps);
      this.modes.set(modes);
      this.modeComponents.set(modeComps);
      this.latencySpecs.set(latencySpecs);
      this.toleranceSpecs.set(toleranceSpecs);
    } catch (error) {
      this.showStatus('Error al cargar datos: ' + error, 'error');
    }
  }

  // Function methods
  async addFunction() {
    if (!this.newFunction.name.trim()) return;
    
    try {
      this.db.functions.add({
        name: this.newFunction.name.trim(),
        description: this.newFunction.description.trim(),
        order_index: this.functions().length
      });
      this.newFunction = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Función agregada correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar función: ' + error, 'error');
    }
  }

  async deleteFunction(id: number) {
    if (confirm('¿Estás seguro de eliminar esta función?')) {
      try {
        this.db.functions.delete(id);
        await this.loadAllData();
        this.showStatus('Función eliminada correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar función: ' + error, 'error');
      }
    }
  }

  // Variable methods
  async addVariable() {
    if (!this.newVariable.name.trim()) return;
    
    try {
      this.db.variables.add({
        name: this.newVariable.name.trim(),
        description: this.newVariable.description.trim(),
        order_index: this.variables().length,
        latency_spec_id: this.newVariable.latency_spec_id || undefined,
        tolerance_spec_id: this.newVariable.tolerance_spec_id || undefined
      });
      this.newVariable = {name: '', description: '', latency_spec_id: null, tolerance_spec_id: null};
      await this.loadAllData();
      this.showStatus('Variable agregada correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar variable: ' + error, 'error');
    }
  }

  async deleteVariable(id: number) {
    if (confirm('¿Estás seguro de eliminar esta variable?')) {
      try {
        this.db.variables.delete(id);
        await this.loadAllData();
        this.showStatus('Variable eliminada correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar variable: ' + error, 'error');
      }
    }
  }

  // Component methods
  async addComponent() {
    if (!this.newComponent.name.trim()) return;
    
    try {
      this.db.components.add({
        name: this.newComponent.name.trim(),
        description: this.newComponent.description.trim(),
        order_index: this.components().length
      });
      this.newComponent = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Componente agregado correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar componente: ' + error, 'error');
    }
  }

  async deleteComponent(id: number) {
    if (confirm('¿Estás seguro de eliminar este componente? Esto también eliminará todas sus asociaciones con modos.')) {
      try {
        // Remove all component associations
        this.db.modes.removeComponentAssociations(id);
        
        // Get and delete orphaned modes (modes with no component associations)
        const orphanedModes = this.db.modes.getOrphanedModes();
        for (const mode of orphanedModes) {
          if (mode.id !== undefined) {
            this.db.modes.delete(mode.id);
          }
        }
        
        // Finally delete the component
        this.db.components.delete(id);
        await this.loadAllData();
        this.showStatus('Componente eliminado correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar componente: ' + error, 'error');
      }
    }
  }

  // Mode methods
  async addMode() {
    if (!this.newMode.name.trim()) return;
    
    try {
      this.db.modes.add({
        name: this.newMode.name.trim(),
        description: this.newMode.description.trim(),
        order_index: this.modes().length
      });
      this.newMode = {name: '', description: ''};
      await this.loadAllData();
      this.showStatus('Modo agregado correctamente', 'success');
    } catch (error) {
      this.showStatus('Error al agregar modo: ' + error, 'error');
    }
  }

  async deleteMode(id: number) {
    if (confirm('¿Estás seguro de eliminar este modo?')) {
      try {
        // Remove all mode associations first
        this.db.modes.removeModeAssociations(id);
        // Then delete the mode
        this.db.modes.delete(id);
        await this.loadAllData();
        this.showStatus('Modo eliminado correctamente', 'success');
      } catch (error) {
        this.showStatus('Error al eliminar modo: ' + error, 'error');
      }
    }
  }

  // Mode-Component association methods
  async toggleModeComponent(modeId: number, componentId: number) {
    try {
      const isAssociated = this.isModeComponentAssociated(modeId, componentId);
      
      if (isAssociated) {
        this.db.modes.removeModeComponent(modeId, componentId);
      } else {
        this.db.modes.addModeComponent(modeId, componentId);
      }
      
      await this.loadAllData();
      this.showStatus(
        isAssociated ? 'Asociación eliminada' : 'Asociación creada', 
        'success'
      );
    } catch (error) {
      this.showStatus('Error al modificar asociación: ' + error, 'error');
    }
  }

  isModeComponentAssociated(modeId: number, componentId: number): boolean {
    return this.modeComponents().some(mc => 
      mc.mode_id === modeId && mc.component_id === componentId
    );
  }

  getModeComponentCount(modeId: number): number {
    return this.modeComponents().filter(mc => mc.mode_id === modeId).length;
  }

  // Helper methods for specification names
  getLatencySpecName(specId: number | undefined): string {
    if (!specId) return 'N/A';
    const spec = this.latencySpecs().find(s => s.id === specId);
    return spec ? `${spec.name} (${spec.value} ${spec.units})` : 'N/A';
  }

  getToleranceSpecName(specId: number | undefined): string {
    if (!specId) return 'N/A';
    const spec = this.toleranceSpecs().find(s => s.id === specId);
    return spec ? `${spec.name} (${spec.value} ${spec.units})` : 'N/A';
  }

  private showStatus(text: string, type: 'success' | 'error') {
    this.statusMessage.set({text, type});
    setTimeout(() => this.statusMessage.set(null), 3000);
  }
}
