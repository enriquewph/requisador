// Database interfaces and types for the Requisador de Requisitos application

export interface Function {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface ToleranceSpecification {
  id?: number;
  name: string;
  type: 'Absoluta' | 'Relativa' | 'Estadística' | 'Funcional';
  value: number;
  units: string;
  physical_interpretation: string;
  justification: string;
  created_at?: string;
  updated_at?: string;
}

export interface Variable {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  latency_spec_id?: number;
  tolerance_spec_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LatencySpecification {
  id?: number;
  name: string;
  type: 'Real' | 'Digital' | 'Virtual' | 'Discrete';
  value: number;
  units: string;
  physical_interpretation: string;
  justification: string;
  created_at?: string;
  updated_at?: string;
}

export interface Component {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Mode {
  id?: number;
  name: string;
  description: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModeComponent {
  mode_id: number;
  component_id: number;
}

export interface Requirement {
  id?: number;
  function_id: number;
  variable_id: number;
  component_id: number;
  mode_id: number;
  parent_id?: number;
  behavior: string;
  condition?: string;
  justification?: string;
  level: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface InitialData {
  functions: Function[];
  variables: Variable[];
  components: Component[];
  modes: Mode[];
  mode_components: ModeComponent[];
  latency_specifications: LatencySpecification[];
  tolerance_specifications: ToleranceSpecification[];
}

// Extended interfaces with relationships
export interface VariableWithSpecifications extends Variable {
  latency_spec?: LatencySpecification;
  tolerance_spec?: ToleranceSpecification;
}
