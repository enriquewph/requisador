import { Database } from 'sql.js';
import { Variable, LatencySpecification, ToleranceSpecification, VariableWithSpecifications } from './interfaces';

export class VariablesRepository {
  constructor(
    private db: Database | null,
    private saveCallback?: () => void
  ) {}

  getAll(): Variable[] {
    if (!this.db) return [];
    const stmt = this.db.prepare('SELECT * FROM variables ORDER BY order_index');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Variable);
    }
    stmt.free();
    return results;
  }

  add(variable: Omit<Variable, 'id'>): number {
    if (!this.db) return -1;
    const stmt = this.db.prepare('INSERT INTO variables (name, description, order_index, latency_spec_id, tolerance_spec_id) VALUES (?, ?, ?, ?, ?)');
    stmt.run([variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null]);
    const result = this.db.exec('SELECT last_insert_rowid()')[0];
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return result.values[0][0] as number;
  }

  update(id: number, variable: Omit<Variable, 'id'>): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('UPDATE variables SET name = ?, description = ?, order_index = ?, latency_spec_id = ?, tolerance_spec_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run([variable.name, variable.description, variable.order_index, variable.latency_spec_id || null, variable.tolerance_spec_id || null, id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('DELETE FROM variables WHERE id = ?');
    stmt.run([id]);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  getWithSpecifications(variableId: number): VariableWithSpecifications | null {
    if (!this.db) return null;
    const stmt = this.db.prepare(`
      SELECT v.*, 
             ls.name as latency_name, ls.type as latency_type, ls.value as latency_value, 
             ls.units as latency_units, ls.physical_interpretation as latency_interpretation, ls.justification as latency_justification,
             ts.name as tolerance_name, ts.type as tolerance_type, ts.value as tolerance_value,
             ts.units as tolerance_units, ts.physical_interpretation as tolerance_interpretation, ts.justification as tolerance_justification
      FROM variables v
      LEFT JOIN latency_specifications ls ON v.latency_spec_id = ls.id
      LEFT JOIN tolerance_specifications ts ON v.tolerance_spec_id = ts.id
      WHERE v.id = ?
    `);
    stmt.bind([variableId]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      
      const variable: VariableWithSpecifications = {
        id: row['id'] as number,
        name: row['name'] as string,
        description: row['description'] as string,
        order_index: row['order_index'] as number,
        latency_spec_id: row['latency_spec_id'] as number,
        tolerance_spec_id: row['tolerance_spec_id'] as number,
        created_at: row['created_at'] as string,
        updated_at: row['updated_at'] as string
      };

      if (row['latency_name']) {
        variable.latency_spec = {
          id: row['latency_spec_id'] as number,
          name: row['latency_name'] as string,
          type: row['latency_type'] as LatencySpecification['type'],
          value: row['latency_value'] as number,
          units: row['latency_units'] as string,
          physical_interpretation: row['latency_interpretation'] as string,
          justification: row['latency_justification'] as string
        };
      }

      if (row['tolerance_name']) {
        variable.tolerance_spec = {
          id: row['tolerance_spec_id'] as number,
          name: row['tolerance_name'] as string,
          type: row['tolerance_type'] as ToleranceSpecification['type'],
          value: row['tolerance_value'] as number,
          units: row['tolerance_units'] as string,
          physical_interpretation: row['tolerance_interpretation'] as string,
          justification: row['tolerance_justification'] as string
        };
      }
      
      return variable;
    }
    stmt.free();
    return null;
  }

  getNextOrderIndex(): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM variables');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result['next_order'] as number;
  }
}
