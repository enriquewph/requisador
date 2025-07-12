import { Database } from 'sql.js';
import { Function } from './interfaces';

export class FunctionsRepository {
  constructor(
    private db: Database | null,
    private saveCallback?: () => void
  ) {}

  getAll(): Function[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM functions ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Function);
    }
    stmt.free();
    return results;
  }

  add(func: Omit<Function, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO functions (name, description, order_index) VALUES (?, ?, ?)');
    stmt.run([func.name, func.description, func.order_index]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return result.values[0][0] as number;
  }

  update(id: number, func: Omit<Function, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE functions SET name = ?, description = ?, order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([func.name, func.description, func.order_index, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM functions WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  getNextOrderIndex(): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM functions');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result['next_order'] as number;
  }
}
