import { Database } from 'sql.js';
import { Component } from './interfaces';

export class ComponentsRepository {
  constructor(private db: Database | null) {}

  getAll(): Component[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM components ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Component);
    }
    stmt.free();
    return results;
  }

  add(component: Omit<Component, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO components (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([component.name, component.description, component.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  update(id: number, component: Omit<Component, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE components SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([component.name, component.description, component.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM components WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  getNextOrderIndex(): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM components');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result['next_order'] as number;
  }
}
