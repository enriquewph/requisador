import { Database } from 'sql.js';
import { LatencySpecification } from './interfaces';

export class LatencySpecificationsRepository {
  constructor(private db: Database | null) {}

  getAll(): LatencySpecification[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM latency_specifications ORDER BY name');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as LatencySpecification);
    }
    stmt.free();
    return results;
  }

  add(latencySpec: Omit<LatencySpecification, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO latency_specifications (name, type, value, units, physical_interpretation, justification) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run([latencySpec.name, latencySpec.type, latencySpec.value, latencySpec.units, latencySpec.physical_interpretation, latencySpec.justification]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    return result.values[0][0] as number;
  }

  update(id: number, latencySpec: Omit<LatencySpecification, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE latency_specifications SET name = ?, type = ?, value = ?, units = ?, physical_interpretation = ?, justification = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([latencySpec.name, latencySpec.type, latencySpec.value, latencySpec.units, latencySpec.physical_interpretation, latencySpec.justification, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM latency_specifications WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    return changes > 0;
  }
}
