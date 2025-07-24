import { Database } from 'sql.js';
import { Requirement } from './interfaces';

export class RequirementsRepository {
  constructor(
    private db: Database | null,
    private saveCallback?: () => void
  ) {}

  getAll(): Requirement[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT 
        r.*,
        f.name as function_name,
        v.name as variable_name,
        c.name as component_name,
        m.name as mode_name
      FROM requirements r
      LEFT JOIN functions f ON r.function_id = f.id
      LEFT JOIN variables v ON r.variable_id = v.id
      LEFT JOIN components c ON r.component_id = c.id
      LEFT JOIN modes m ON r.mode_id = m.id
      ORDER BY r.order_index, r.id
    `);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Requirement);
    }
    stmt.free();
    return results;
  }

  getById(id: number): Requirement | null {
    if (!this.db) return null;
    const stmt = this.db.prepare(`
      SELECT 
        r.*,
        f.name as function_name,
        v.name as variable_name,
        c.name as component_name,
        m.name as mode_name
      FROM requirements r
      LEFT JOIN functions f ON r.function_id = f.id
      LEFT JOIN variables v ON r.variable_id = v.id
      LEFT JOIN components c ON r.component_id = c.id
      LEFT JOIN modes m ON r.mode_id = m.id
      WHERE r.id = ?
    `);
    stmt.bind([id]);
    const result = stmt.step() ? stmt.getAsObject() as unknown as Requirement : null;
    stmt.free();
    return result;
  }

  getByParentId(parentId: number): Requirement[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT 
        r.*,
        f.name as function_name,
        v.name as variable_name,
        c.name as component_name,
        m.name as mode_name
      FROM requirements r
      LEFT JOIN functions f ON r.function_id = f.id
      LEFT JOIN variables v ON r.variable_id = v.id
      LEFT JOIN components c ON r.component_id = c.id
      LEFT JOIN modes m ON r.mode_id = m.id
      WHERE r.parent_id = ?
      ORDER BY r.order_index, r.id
    `);
    stmt.bind([parentId]);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Requirement);
    }
    stmt.free();
    return results;
  }

  getRootRequirements(): Requirement[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT 
        r.*,
        f.name as function_name,
        v.name as variable_name,
        c.name as component_name,
        m.name as mode_name
      FROM requirements r
      LEFT JOIN functions f ON r.function_id = f.id
      LEFT JOIN variables v ON r.variable_id = v.id
      LEFT JOIN components c ON r.component_id = c.id
      LEFT JOIN modes m ON r.mode_id = m.id
      WHERE r.parent_id IS NULL
      ORDER BY r.order_index, r.id
    `);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Requirement);
    }
    stmt.free();
    return results;
  }

  generateNextId(parentId?: number): number {
    if (!this.db) return 1;
    
    if (!parentId) {
      // Root level requirement
      const stmt = this.db.prepare('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM requirements WHERE parent_id IS NULL');
      stmt.step();
      const nextId = stmt.getAsObject()['next_id'] as number;
      stmt.free();
      return nextId;
    } else {
      // Child requirement
      const stmt = this.db.prepare('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM requirements');
      stmt.step();
      const nextId = stmt.getAsObject()['next_id'] as number;
      stmt.free();
      return nextId;
    }
  }

  add(requirement: Omit<Requirement, 'id' | 'created_at' | 'updated_at'>): number | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare(`
      INSERT INTO requirements (
        function_id, variable_id, component_id, mode_id, parent_id, 
        behavior, condition, justification, level, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run([
        requirement.function_id,
        requirement.variable_id,
        requirement.component_id,
        requirement.mode_id,
        requirement.parent_id || null,
        requirement.behavior,
        requirement.condition || null,
        requirement.justification || null,
        requirement.level,
        requirement.order_index
      ]);
      
      // Get the last inserted row ID
      const lastIdStmt = this.db.prepare('SELECT last_insert_rowid() as id');
      lastIdStmt.step();
      const insertedId = lastIdStmt.getAsObject()['id'] as number;
      lastIdStmt.free();
      stmt.free();
      
      this.saveCallback?.(); // Save to localStorage after write operation
      return insertedId;
    } catch (error) {
      stmt.free();
      console.error('Error adding requirement:', error);
      return null;
    }
  }

  update(id: number, requirement: Partial<Omit<Requirement, 'id' | 'created_at'>>): boolean {
    if (!this.db) return false;
    
    const fields = [];
    const values = [];
    
    if (requirement.behavior !== undefined) {
      fields.push('behavior = ?');
      values.push(requirement.behavior);
    }
    if (requirement.condition !== undefined) {
      fields.push('condition = ?');
      values.push(requirement.condition);
    }
    if (requirement.justification !== undefined) {
      fields.push('justification = ?');
      values.push(requirement.justification);
    }
    if (requirement.function_id !== undefined) {
      fields.push('function_id = ?');
      values.push(requirement.function_id);
    }
    if (requirement.variable_id !== undefined) {
      fields.push('variable_id = ?');
      values.push(requirement.variable_id);
    }
    if (requirement.component_id !== undefined) {
      fields.push('component_id = ?');
      values.push(requirement.component_id);
    }
    if (requirement.mode_id !== undefined) {
      fields.push('mode_id = ?');
      values.push(requirement.mode_id);
    }
    if (requirement.order_index !== undefined) {
      fields.push('order_index = ?');
      values.push(requirement.order_index);
    }
    
    if (fields.length === 0) return false;
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE requirements SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    const changes = this.db.getRowsModified();
    stmt.free();
    this.saveCallback?.(); // Save to localStorage after write operation
    return changes > 0;
  }

  delete(id: number): boolean {
    if (!this.db) return false;
    
    try {
      // First delete all child requirements recursively
      this.deleteChildRequirements(id);
      
      // Then delete the requirement itself
      const stmt = this.db.prepare('DELETE FROM requirements WHERE id = ?');
      stmt.run([id]);
      const changes = this.db.getRowsModified();
      stmt.free();
      this.saveCallback?.(); // Save to localStorage after write operation
      return changes > 0;
    } catch (error) {
      console.error('Error deleting requirement:', error);
      return false;
    }
  }

  private deleteChildRequirements(parentId: number): void {
    if (!this.db) return;
    
    const childStmt = this.db.prepare('SELECT id FROM requirements WHERE parent_id = ?');
    childStmt.bind([parentId]);
    
    const childIds = [];
    while (childStmt.step()) {
      childIds.push(childStmt.getAsObject()['id'] as number);
    }
    childStmt.free();
    
    // Recursively delete children
    childIds.forEach(childId => this.deleteChildRequirements(childId));
    
    // Delete all children at this level
    if (childIds.length > 0) {
      const deleteStmt = this.db.prepare('DELETE FROM requirements WHERE parent_id = ?');
      deleteStmt.run([parentId]);
      deleteStmt.free();
    }
  }

  hasChildren(id: number): boolean {
    if (!this.db) return false;
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM requirements WHERE parent_id = ?');
    stmt.bind([id]);
    stmt.step();
    const count = stmt.getAsObject()['count'] as number;
    stmt.free();
    return count > 0;
  }

  getChildCount(id: number): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM requirements WHERE parent_id = ?');
    stmt.bind([id]);
    stmt.step();
    const count = stmt.getAsObject()['count'] as number;
    stmt.free();
    return count;
  }

  getMaxLevel(): number {
    if (!this.db) return 0;
    const stmt = this.db.prepare('SELECT COALESCE(MAX(level), 0) as max_level FROM requirements');
    stmt.step();
    const maxLevel = stmt.getAsObject()['max_level'] as number;
    stmt.free();
    return maxLevel;
  }

  // Generate next order index for requirements
  getNextRequirementOrderIndex(parentId: number | null): number {
    if (!this.db) return 0;
    const stmt = parentId
      ? this.db.prepare('SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM requirements WHERE parent_id = ?')
      : this.db.prepare('SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM requirements WHERE parent_id IS NULL');
    
    if (parentId) {
      stmt.bind([parentId]);
    }
    
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result['next_order'] as number;
    }
    stmt.free();
    return 0;
  }

  // Generate requirement ID based on hierarchy (R0, R1, R1-0, etc.)
  generateRequirementId(requirement: Requirement): string {
    if (!this.db) return 'R0';
    
    if (!requirement.parent_id) {
      // Top-level requirement
      return `R${requirement.order_index}`;
    } else {
      // Child requirement - get parent ID and append child index
      const stmt = this.db.prepare('SELECT * FROM requirements WHERE id = ?');
      stmt.bind([requirement.parent_id]);
      
      if (stmt.step()) {
        const parent = stmt.getAsObject() as unknown as Requirement;
        const parentId = this.generateRequirementId(parent);
        stmt.free();
        return `${parentId}-${requirement.order_index}`;
      }
      stmt.free();
      return `R${requirement.order_index}`;
    }
  }
}
