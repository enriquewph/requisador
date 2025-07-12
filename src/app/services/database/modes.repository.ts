import { Database } from 'sql.js';
import { Mode, ModeComponent } from './interfaces';

export class ModesRepository {
  constructor(
    private db: Database | null,
    private saveCallback?: () => void
  ) {}

  getAll(): Mode[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM modes ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Mode);
    }
    stmt.free();
    return results;
  }

  add(mode: Omit<Mode, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO modes (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([mode.name, mode.description, mode.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return result.values[0][0] as number;
  }

  update(id: number, mode: Omit<Mode, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE modes SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([mode.name, mode.description, mode.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM modes WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  // Mode-Component associations
  getModeComponents(): ModeComponent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT mode_id, component_id FROM mode_components');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as ModeComponent);
    }
    stmt.free();
    return results;
  }

  addModeComponent(modeId: number, componentId: number): boolean {
    if (!this.db) return false;
    try {
      const stmt = this.db.prepare('INSERT INTO mode_components (mode_id, component_id) VALUES (?, ?)');
      stmt.run([modeId, componentId]);
      stmt.free();
      this.saveCallback?.(); // Save to localStorage after write operation
      return true;
    } catch (error) {
      console.error('Error adding mode-component association:', error);
      return false;
    }
  }

  removeModeComponent(modeId: number, componentId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE mode_id = ? AND component_id = ?');
    stmt.run([modeId, componentId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  isModeComponentAssociated(modeId: number, componentId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM mode_components WHERE mode_id = ? AND component_id = ?');
    stmt.bind([modeId, componentId]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return (result['count'] as number) > 0;
  }

  getModeComponentCount(modeId: number): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM mode_components WHERE mode_id = ?');
    stmt.bind([modeId]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result['count'] as number;
  }

  getNextOrderIndex(): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM modes');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result['next_order'] as number;
  }

  // Remove all mode-component associations for a specific component
  removeComponentAssociations(componentId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE component_id = ?');
    stmt.run([componentId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Remove all mode-component associations for a specific mode
  removeModeAssociations(modeId: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM mode_components WHERE mode_id = ?');
    stmt.run([modeId]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  // Get modes that have no component associations
  getOrphanedModes(): Mode[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT m.* FROM modes m 
      LEFT JOIN mode_components mc ON m.id = mc.mode_id 
      WHERE mc.mode_id IS NULL
      ORDER BY m.order_index
    `);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Mode);
    }
    stmt.free();
    return results;
  }
}
