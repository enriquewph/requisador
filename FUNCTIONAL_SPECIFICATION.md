# Requisador de Requisitos - Functional Specification

## 🎯 Application Overview

**Requisador de Requisitos** is a professional requirements management web application designed for systems engineering projects. It follows the Systems Engineering Handbook methodology to create, organize, and manage behavioral and performance requirements for complex systems.

---

## 🏗️ Core Functionality

### 1. **Configuration Management**
The app manages four core entities that form the foundation of all requirements:

- **Functions**: System capabilities (e.g., "Navigation", "Communication", "Control")
- **Variables**: Controlled parameters (e.g., "Speed", "Position", "Temperature") 
- **Components**: System parts (e.g., "HMI", "ECI")
- **Modes**: Operating conditions (e.g., "Normal", "Emergency", "Maintenance")

**Key Features:**
- CRUD operations for all entities
- Many-to-many relationships between Modes and Components
- Real-time validation and duplicate prevention
- Drag-and-drop reordering

### 2. **Requirements Creation Wizard**
A step-by-step guided process for creating structured requirements:

**Step 1**: Select Function + Variable
**Step 2**: Choose Parent Requirement (optional, for hierarchical structure)  
**Step 3**: Select Component + Mode
**Step 4**: Write Behavior Description
**Step 5**: Preview & Confirm

**Output Format**: 
```
"El [Component] deberá [Behavior] [Variable] cuando el sistema esté en modo [Mode]"
```

### 3. **Requirements Management**
Comprehensive CRUD operations for requirements with:

- **Hierarchical Structure**: Parent-child relationships (Multiple levels)
- **Automatic ID Generation**: R0, R1, R1-0, R1-1, R1-1-0 etc. as we go 1 level deep we add one slash
- **Reordering**: Move requirements up/down within lists
- **Validation**: Ensure all referenced entities exist
- **Bulk Operations**: Delete, reorder, export

### 4. **Multiple View Modes**

#### **List View**
- Tabular display with all requirement details
- Sortable columns (ID, Function, Variable, Component, Mode, Behavior)
- Inline editing capabilities
- Hierarchical indentation for sub-requirements
- Bulk selection and operations

#### **Tree View**  
- Interactive hierarchical display
- Expandable/collapsible nodes
- Visual parent-child relationships
- Tooltips with detailed requirement information
- Drag-and-drop for restructuring

### 5. **Data Management**

#### **Import/Export**
- **Export formats**: JSON, CSV
- **Backup/Restore**: Complete application state

#### **Storage**
- **Primary**: SQLite database with normalized schema stored on users pc.
- **Relationships**: Foreign key constraints and referential integrity
- **Performance**: Indexed queries for fast retrieval

---

## 🎨 User Interface Design

### **Layout Structure**
- **Header**: Application title, version info, about modal
- **Tab Navigation**: Config, Create, List, Tree views
- **Main Content**: Dynamic tab content loading
- **Footer**: Status information and actions

### **Design Principles**
- **Modern UI**: TailwindCSS with consistent design system
- **Responsive**: Mobile-first approach with breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Lazy loading, efficient DOM updates
- **Visual Feedback**: Loading states, success/error messages, validation hints

### **Color Coding**
- **Functions**: Blue theme
- **Variables**: Green theme  
- **Components**: Indigo theme
- **Modes**: Purple theme
- **Requirements**: Neutral with accent colors

---

## 🗄️ Data Architecture

### **Database Schema (SQLite)**

```sql
functions (id, name, description, timestamps)
variables (id, name, description, timestamps)
components (id, name, description, timestamps)  
modes (id, name, description, timestamps)
mode_components (mode_id, component_id) -- Many-to-many junction
requirements (id, function_id, variable_id, component_id, mode_id, parent_id, behavior, level, order_index, timestamps)
metadata (key, value, timestamps) -- Version tracking
```

### **Relationships**
- **Functions → Requirements**: One-to-many
- **Variables → Requirements**: One-to-many
- **Components → Requirements**: One-to-many
- **Modes → Requirements**: One-to-many
- **Modes ↔ Components**: Many-to-many (junction table)
- **Requirements → Requirements**: Self-referencing (parent-child hierarchy)

### **Business Rules**
- Requirements must reference valid Function, Variable, Component, and Mode
- Mode-Component associations determine valid combinations
- Parent requirements can only be Level 1 (top-level)
- Child requirements are not level 1 (sub-requirements)
- Delete cascades: Mode/Component deletion removes associations
- Delete restrictions: Cannot delete referenced Functions/Variables/Components/Modes

---

## 🔧 Technical Requirements

### **Core Technologies**
- **Frontend**: Modern JavaScript (ES6+), HTML5, CSS3
- **Styling**: TailwindCSS utility-first framework
- **Database**: SQLite with foreign key constraints
- **Architecture**: Modular component-based structure
- **Build**: Static site generation (target: Scully + Angular)

### **Key Features to Implement**
- **State Management**: Centralized application state
- **Data Layer**: Service abstraction for database operations
- **Component Architecture**: Reusable UI components
- **Routing**: Client-side navigation between views
- **Forms**: Reactive forms with validation
- **Error Handling**: Global error management and user feedback
- **Performance**: Lazy loading, virtual scrolling for large lists
- **Offline Support**: Service workers for offline functionality

### **Migration Requirements**
- **Data Migration**: Convert localStorage format to SQLite schema
- **Version Detection**: Automatic detection of legacy data format
- **Backward Compatibility**: Graceful handling of old data structures
- **User Communication**: Clear migration progress and status

---

## 🎯 User Workflows

### **Primary Workflow: Creating Requirements**
1. **Setup**: Configure Functions, Variables, Components, Modes
2. **Association**: Define which Components work with which Modes
3. **Creation**: Use wizard to create structured requirements
4. **Organization**: Arrange in hierarchical structure if needed
5. **Review**: Use List/Tree views to validate and refine
6. **Export**: Generate deliverable documentation

### **Secondary Workflows**
- **Configuration Management**: Add/edit/delete master data
- **Bulk Import**: Load existing configurations from files
- **Data Migration**: Upgrade from previous versions
- **Documentation**: Export requirements in various formats
- **Collaboration**: Share configurations between team members

---

## 🚀 Success Metrics

### **Functional Goals**
- ✅ Eliminate manual requirement writing errors
- ✅ Ensure consistent requirement structure
- ✅ Enable rapid requirement generation for large systems
- ✅ Provide multiple views for different stakeholder needs
- ✅ Support iterative refinement and reorganization

### **Technical Goals**  
- ✅ Fast, responsive user interface
- ✅ Reliable data persistence and integrity
- ✅ Scalable architecture for complex projects
- ✅ Professional-grade export capabilities
- ✅ Seamless migration from legacy formats

---

## 📋 Development Priorities

### **Phase 1: Core Foundation**
- Database setup and entity management
- Basic CRUD operations for all entities
- Simple requirement creation workflow

### **Phase 2: Advanced Features**
- Hierarchical requirements support
- Multiple view modes (List, Tree)
- Import/export functionality

### **Phase 3: Polish & Performance**
- Advanced UI/UX improvements
- Performance optimization
- Comprehensive error handling
- Documentation and help system

---

## 💡 Key Insights for Rebuild

### **What Works Well**
- Clear separation of configuration vs. requirement creation
- Step-by-step wizard approach reduces user errors
- Multiple view modes serve different user needs
- Hierarchical structure supports complex requirements
- Export capabilities enable integration with other tools

### **Areas for Improvement**
- **Framework**: Angular + Scully will provide better structure
- **State Management**: Centralized state with observables
- **Component Reusability**: Better separation of concerns
- **Performance**: Virtual scrolling for large datasets
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Better in-app help and guidance

---

**🎯 Target: Rebuild as a modern, scalable, professional-grade requirements management system using Angular + Scully with the same core functionality but superior architecture and user experience.**
