// types/oee.ts - VERSIÓN COMPLETA
// ===== INTERFACES PRINCIPALES =====

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: 'administrador' | 'supervisor' | 'operador' | 'viewer';
  area_asignada?: number;
  telefono?: string;
  activo: boolean;
  last_login?: string;
  date_joined: string;
}

export interface Area {
  id: number;
  nombre: string;
  codigo: string;
  tipo: 'empaque' | 'prensa';
  capacidad_teorica: number;
  capacidad_real: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistroOEE {
  id: number;
  area: number;
  area_nombre?: string;
  fecha: string;
  turno: 'A' | 'B' | 'C';
  plan_produccion: number;
  produccion_real: number;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;
  usuario: number;
  usuario_nombre?: string;

  // Campos calculados
  oee: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;

  // Campos específicos por tipo de área
  formato_producto?: string;      // Para empaque
  produccion_kg?: number;         // Para empaque
  lectura_inicial?: number;       // Para prensa
  lectura_final?: number;         // Para prensa
  paradas?: number;               // Tiempo de paradas en minutos
  motivo_parada?: string;

  // Metadatos
  created_at: string;
  updated_at: string;
}

// ===== INTERFACES DE AUTENTICACIÓN =====

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
  expires_at?: string;
  refresh_token?: string;
}

export interface TokenPayload {
  user_id: number;
  username: string;
  exp: number;
  iat: number;
}

// ===== INTERFACES DE DASHBOARD =====

export interface DashboardData {
  oee_promedio: number;
  disponibilidad_promedio: number;
  rendimiento_promedio: number;
  calidad_promedio: number;
  total_registros: number;
  registros_hoy?: number;
  areas_activas?: number;
  ultima_actualizacion?: string;
}

export interface AreaStatus {
  id: number;
  nombre: string;
  codigo?: string;
  oee: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  ultima_actualizacion: string;
  turno_actual: string;
  disponibilidad?: number;
  rendimiento?: number;
  calidad?: number;
  produccion_actual?: number;
  plan_actual?: number;
}

// ===== INTERFACES DE API =====

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
  code?: string;
}

// ===== INTERFACES DE FILTROS Y BÚSQUEDAS =====

export interface RegistroFilters {
  area?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  turno?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  usuario?: number;
  oee_min?: number;
  oee_max?: number;
}

export interface AreaFilters {
  tipo?: 'empaque' | 'prensa';
  activa?: boolean;
  search?: string;
}

export interface UsuarioFilters {
  rol?: string;
  activo?: boolean;
  area_asignada?: number;
  search?: string;
}

// ===== INTERFACES DE NOTIFICACIONES =====

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

// ===== ENUMS =====

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

export enum OEEStatus {
  EXCELLENT = 'excellent',  // >= 85%
  GOOD = 'good',           // 75-84%
  WARNING = 'warning',     // 65-74%
  CRITICAL = 'critical'    // < 65%
}

// ===== INTERFACES DE FORMULARIOS =====

export interface RegistroFormData {
  area: number;
  fecha: string;
  turno: Turno;
  plan_produccion: number;
  produccion_real: number;
  hora_inicio: string;
  hora_fin: string;
  observaciones?: string;

  // Campos específicos de empaque
  formato_producto?: string;
  produccion_kg?: number;

  // Campos específicos de prensa
  lectura_inicial?: number;
  lectura_final?: number;

  // Campos de paradas
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

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ===== INTERFACES DE GRÁFICOS Y REPORTES =====

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
}

export interface ReportFilter {
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  fecha_inicio: string;
  fecha_fin: string;
  areas?: number[];
  turnos?: Turno[];
  formato?: 'pdf' | 'excel' | 'csv';
  incluir_graficos?: boolean;
  incluir_detalles?: boolean;
}

export interface ReportData {
  periodo: string;
  fecha_generacion: string;
  areas: AreaReportData[];
  resumen: ReportSummary;
  graficos?: ChartData[];
  configuracion: ReportFilter;
}

export interface AreaReportData {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string;
  oee_promedio: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  total_produccion: number;
  plan_total: number;
  cumplimiento: number;
  registros: RegistroOEE[];
  tendencia: 'mejorando' | 'empeorando' | 'estable';
}

export interface ReportSummary {
  oee_general: number;
  disponibilidad_general: number;
  rendimiento_general: number;
  calidad_general: number;
  mejor_area: string;
  peor_area: string;
  tendencia_general: 'mejorando' | 'empeorando' | 'estable';
  total_registros: number;
  dias_analizados: number;
  observaciones: string[];
  recomendaciones: string[];
}

// ===== INTERFACES DE VALIDACIÓN =====

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface FieldValidation {
  [key: string]: ValidationRule[];
}

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// ===== INTERFACES DE PERMISOS =====

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'admin';
  allowed: boolean;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.SUPERVISOR]: Permission[];
  [UserRole.OPERATOR]: Permission[];
  [UserRole.VIEWER]: Permission[];
}

export interface RoutePermission {
  path: string;
  roles: UserRole[];
  requiresAuth: boolean;
}

// ===== INTERFACES DE CONFIGURACIÓN =====

export interface AppConfig {
  apiUrl: string;
  appTitle: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  session: SessionConfig;
  pagination: PaginationConfig;
  ui: UIConfig;
}

export interface FeatureFlags {
  enableDebug: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enableAutoRefresh: boolean;
  enableNotifications: boolean;
  enableAdvancedReports: boolean;
}

export interface SessionConfig {
  timeout: number;          // milisegundos
  warningTime: number;      // milisegundos antes del timeout para mostrar advertencia
  refreshInterval: number;  // milisegundos para refresh automático del token
  maxRetries: number;       // intentos máximos de refresh
}

export interface PaginationConfig {
  defaultPageSize: number;
  maxPageSize: number;
  showSizeOptions: boolean;
  sizeOptions: number[];
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  autoSave: boolean;
  compactMode: boolean;
}

// ===== INTERFACES DE ESTADO DE APLICACIÓN =====

export interface AppState {
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  notifications: NotificationConfig[];
}

export interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  selectedTheme: string;
  currentPage: string;
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active: boolean;
}

// ===== INTERFACES DE MÉTRICAS Y ANALYTICS =====

export interface OEEMetrics {
  oee: number;
  disponibilidad: number;
  rendimiento: number;
  calidad: number;
  tiempo_total: number;      // minutos
  tiempo_operacion: number;  // minutos
  tiempo_paradas: number;    // minutos
  produccion_teorica: number;
  produccion_real: number;
  productos_defectuosos: number;
  productos_buenos: number;
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Benchmark {
  metric: string;
  current: number;
  target: number;
  industry: number;
  best: number;
  unit: string;
}

// ===== INTERFACES DE IMPORTACIÓN/EXPORTACIÓN =====

export interface ImportOptions {
  file: File;
  skipErrors: boolean;
  updateExisting: boolean;
  previewFirst: boolean;
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  updated: number;
  errors: ImportError[];
  preview?: any[];
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeHeaders: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

// ===== TYPES HELPERS =====

export type APIEndpoint = string | ((id: number) => string);

export type SortDirection = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type FormMode = 'create' | 'edit' | 'view';

export type DatePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ===== INTERFACES DE EVENTOS =====

export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: Date;
  source: string;
}

export interface UserActivityEvent extends AppEvent {
  type: 'user_activity';
  payload: {
    action: string;
    resource: string;
    details?: any;
  };
}

export interface SystemEvent extends AppEvent {
  type: 'system_event';
  payload: {
    level: 'info' | 'warning' | 'error';
    message: string;
    details?: any;
  };
}

// ===== CONSTANTES DE TIPOS =====

export const OEE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 75,
  WARNING: 65,
  CRITICAL: 0
} as const;

export const TURNOS = ['A', 'B', 'C'] as const;

export const TIPOS_AREA = ['empaque', 'prensa'] as const;

export const ROLES_USUARIO = ['administrador', 'supervisor', 'operador', 'viewer'] as const;

export const FORMATOS_EXPORT = ['excel', 'csv', 'pdf'] as const;

export const ESTADOS_OEE = ['excellent', 'good', 'warning', 'critical'] as const;
