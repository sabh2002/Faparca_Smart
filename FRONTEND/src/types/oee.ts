// src/types/oee.ts
export interface Area {
  id: number;
  nombre: string;
  codigo: string;
  tipo: 'empaque' | 'prensa';
  capacidad_teorica: number;
  capacidad_real: number;
  activa: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: 'administrador' | 'supervisor' | 'operador' | 'viewer';
  area_asignada?: number;
  area_nombre?: string;
  telefono?: string;
  activo: boolean;
  ultimo_acceso?: string;
  date_joined?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface RegistroOEE {
  id?: number;
  area: number;
  area_nombre?: string;
  fecha: string;
  turno: 'A' | 'B' | 'C';
  plan_produccion: number;
  produccion_real: number;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;
  
  // Específicos empaque
  formato_producto?: string;
  produccion_kg?: number;
  
  // Específicos prensa
  lectura_inicial?: number;
  lectura_final?: number;
  paradas?: number;
  motivo_parada?: string;
  
  // Calculados
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  oee: number;
  
  // Metadata
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
  expires_at?: string;
  expires_in?: number;
  message?: string;
}

export interface TokenInfo {
  key: string;
  created: string;
  expires_at: string;
  expires_in: number;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface DashboardData {
  oee_promedio: number;
  disponibilidad_promedio: number;
  rendimiento_promedio: number;
  calidad_promedio: number;
  total_registros: number;
  registros_hoy?: number;
  areas_activas?: number;
  tendencia?: 'up' | 'down' | 'stable';
}

export interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
  non_field_errors?: string | string[];
  status?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FilterParams {
  area?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  turno?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface SessionInfo {
  isActive: boolean;
  timeRemaining?: number;
  lastActivity?: Date;
  expiresAt?: Date;
}

// Enums para mejorar el type safety
export enum UserRole {
  ADMIN = 'administrador',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operador',
  VIEWER = 'viewer'
}

export enum Turno {
  A = 'A',
  B = 'B',
  C = 'C'
}

export enum TipoArea {
  EMPAQUE = 'empaque',
  PRENSA = 'prensa'
}

// Interfaces para formularios
export interface RegistroFormData {
  area: number;
  fecha: string;
  turno: Turno;
  plan_produccion: number;
  produccion_real: number;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;
  formato_producto?: string;
  produccion_kg?: number;
  lectura_inicial?: number;
  lectura_final?: number;
  paradas?: number;
  motivo_parada?: string;
}

export interface AreaFormData {
  nombre: string;
  codigo: string;
  tipo: TipoArea;
  capacidad_teorica: number;
  capacidad_real: number;
  activa: boolean;
}

export interface UsuarioFormData {
  username: string;
  email: string;
  password?: string;
  password2?: string;
  first_name: string;
  last_name: string;
  rol: UserRole;
  area_asignada?: number;
  telefono?: string;
  activo: boolean;
}

// Tipos para gráficos y reportes
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ReportFilter {
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  fecha_inicio: string;
  fecha_fin: string;
  areas?: number[];
  turnos?: Turno[];
  formato?: 'pdf' | 'excel' | 'csv';
}

export interface ReportData {
  periodo: string;
  areas: {
    id: number;
    nombre: string;
    oee_promedio: number;
    disponibilidad: number;
    rendimiento: number;
    calidad: number;
    total_produccion: number;
    registros: RegistroOEE[];
  }[];
  resumen: {
    oee_general: number;
    mejor_area: string;
    peor_area: string;
    tendencia: 'mejorando' | 'empeorando' | 'estable';
    observaciones: string[];
  };
}

// Tipos para validación
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface FieldValidation {
  [key: string]: ValidationRule[];
}

// Tipos para permisos y acceso
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  allowed: boolean;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.SUPERVISOR]: Permission[];
  [UserRole.OPERATOR]: Permission[];
  [UserRole.VIEWER]: Permission[];
}

// Tipos para configuración
export interface AppConfig {
  apiUrl: string;
  appTitle: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableDebug: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
  };
  session: {
    timeout: number;
    warningTime: number;
    refreshInterval: number;
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
}
