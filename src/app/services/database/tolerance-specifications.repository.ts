import { Database } from 'sql.js';
import { ToleranceSpecification } from './interfaces';

export class ToleranceSpecificationsRepository {
  constructor(
    private db: Database | null,
    private saveCallback?: () => void
  ) {}

  getAll(): ToleranceSpecification[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM tolerance_specifications ORDER BY name');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as ToleranceSpecification);
    }
    stmt.free();
    return results;
  }

  add(toleranceSpec: Omit<ToleranceSpecification, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO tolerance_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([toleranceSpec.name, toleranceSpec.type, toleranceSpec.value, toleranceSpec.units, toleranceSpec.physical_interpretation, toleranceSpec.justification]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return result.values[0][0] as number;
  }

  update(id: number, toleranceSpec: Omit<ToleranceSpecification, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE tolerance_specifications SET name = ?, type = ?, value = ?, units = ?, physical_interpretation = ?, justification = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([toleranceSpec.name, toleranceSpec.type, toleranceSpec.value, toleranceSpec.units, toleranceSpec.physical_interpretation, toleranceSpec.justification, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM tolerance_specifications WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }
}
