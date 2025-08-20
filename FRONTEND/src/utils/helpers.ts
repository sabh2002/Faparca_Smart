// utils/helpers.ts - UTILIDADES DEL SISTEMA OEE
import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import type { RegistroOEE, OEEMetrics, Turno } from '@/types/oee'

// ===== CONSTANTES =====

export const OEE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 75,
  WARNING: 65,
  CRITICAL: 0
} as const

export const TURNO_HORARIOS = {
  A: { inicio: '06:00', fin: '14:00', nombre: 'Mañana' },
  B: { inicio: '14:00', fin: '22:00', nombre: 'Tarde' },
  C: { inicio: '22:00', fin: '06:00', nombre: 'Noche' }
} as const

// ===== UTILIDADES DE FECHAS =====

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export function formatDisplayDate(
  date: string | Date,
  formatString: string = 'dd/MM/yyyy'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    return format(dateObj, formatString, { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Formatea una fecha y hora completa
 */
export function formatDateTime(
  date: string | Date,
  includeSeconds: boolean = false
): string {
  const formatString = includeSeconds ? 'dd/MM/yyyy HH:mm:ss' : 'dd/MM/yyyy HH:mm'
  return formatDisplayDate(date, formatString)
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatRelativeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Fecha inválida'
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Obtiene la fecha actual en formato ISO
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtiene la hora actual en formato HH:mm
 */
export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm')
}

/**
 * Calcula la diferencia en horas entre dos tiempos
 */
export function calculateHoursDifference(
  startTime: string,
  endTime: string
): number {
  try {
    const start = new Date(`1970-01-01T${startTime}:00`)
    let end = new Date(`1970-01-01T${endTime}:00`)

    // Manejar turno nocturno (cruce de medianoche)
    if (end < start) {
      end = new Date(`1970-01-02T${endTime}:00`)
    }

    const diffMs = end.getTime() - start.getTime()
    return diffMs / (1000 * 60 * 60)
  } catch {
    return 0
  }
}

// ===== UTILIDADES DE NÚMEROS =====

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  if (!isFinite(value)) return '0.0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(
  value: number,
  decimals: number = 0
): string {
  if (!isFinite(value)) return '0'
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formatea un valor de producción con unidades
 */
export function formatProduction(
  value: number,
  unit: 'kg' | 'bultos' = 'kg',
  decimals: number = 2
): string {
  const formatted = formatNumber(value, decimals)
  return `${formatted} ${unit}`
}

/**
 * Redondea un número a decimales específicos
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Clampea un valor entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ===== UTILIDADES DE OEE =====

/**
 * Calcula las métricas OEE completas
 */
export function calculateOEEMetrics(registro: Partial<RegistroOEE>): OEEMetrics {
  const {
    plan_produccion = 0,
    produccion_real = 0,
    hora_inicio = '06:00',
    hora_fin = '14:00',
    paradas = 0
  } = registro

  // Calcular tiempo total de operación
  const tiempoTotal = calculateHoursDifference(hora_inicio, hora_fin) * 60 // en minutos
  const tiempoOperacion = Math.max(0, tiempoTotal - paradas)

  // Disponibilidad = (Tiempo de Operación / Tiempo Total) * 100
  const disponibilidad = tiempoTotal > 0 ? (tiempoOperacion / tiempoTotal) * 100 : 0

  // Rendimiento = (Producción Real / Producción Planificada) * 100
  const rendimiento = plan_produccion > 0 ? (produccion_real / plan_produccion) * 100 : 0

  // Calidad = 100% (asumiendo productos buenos por defecto)
  const calidad = 100

  // OEE = (Disponibilidad * Rendimiento * Calidad) / 10000
  const oee = (disponibilidad * rendimiento * calidad) / 10000

  return {
    oee: roundTo(oee, 1),
    disponibilidad: roundTo(disponibilidad, 1),
    rendimiento: roundTo(Math.min(rendimiento, 150), 1), // Limitar a 150%
    calidad: roundTo(calidad, 1),
    tiempo_total: roundTo(tiempoTotal, 1),
    tiempo_operacion: roundTo(tiempoOperacion, 1),
    tiempo_paradas: paradas,
    produccion_teorica: plan_produccion,
    produccion_real: produccion_real,
    productos_defectuosos: 0, // Por ahora 0
    productos_buenos: produccion_real
  }
}

/**
 * Obtiene el estado OEE basado en el valor
 */
export function getOEEStatus(oee: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (oee >= OEE_THRESHOLDS.EXCELLENT) return 'excellent'
  if (oee >= OEE_THRESHOLDS.GOOD) return 'good'
  if (oee >= OEE_THRESHOLDS.WARNING) return 'warning'
  return 'critical'
}

/**
 * Obtiene el color CSS para un valor OEE
 */
export function getOEEColor(oee: number): string {
  const status = getOEEStatus(oee)
  const colors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600'
  }
  return colors[status]
}

/**
 * Obtiene el color de fondo para un valor OEE
 */
export function getOEEBackgroundColor(oee: number): string {
  const status = getOEEStatus(oee)
  const colors = {
    excellent: 'bg-green-100',
    good: 'bg-blue-100',
    warning: 'bg-yellow-100',
    critical: 'bg-red-100'
  }
  return colors[status]
}

/**
 * Obtiene la descripción del estado OEE
 */
export function getOEEStatusText(oee: number): string {
  const status = getOEEStatus(oee)
  const texts = {
    excellent: 'Excelente',
    good: 'Bueno',
    warning: 'Necesita Atención',
    critical: 'Crítico'
  }
  return texts[status]
}

// ===== UTILIDADES DE TURNOS =====

/**
 * Obtiene información del turno actual
 */
export function getCurrentTurno(): { turno: Turno; info: typeof TURNO_HORARIOS[Turno] } {
  const now = new Date()
  const currentHour = now.getHours()

  if (currentHour >= 6 && currentHour < 14) {
    return { turno: 'A', info: TURNO_HORARIOS.A }
  } else if (currentHour >= 14 && currentHour < 22) {
    return { turno: 'B', info: TURNO_HORARIOS.B }
  } else {
    return { turno: 'C', info: TURNO_HORARIOS.C }
  }
}

/**
 * Obtiene el nombre descriptivo de un turno
 */
export function getTurnoName(turno: Turno): string {
  return `Turno ${turno} (${TURNO_HORARIOS[turno].inicio} - ${TURNO_HORARIOS[turno].fin})`
}

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una contraseña según las reglas establecidas
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un código de área
 */
export function isValidAreaCode(code: string): boolean {
  // Formato: LETRAS_LETRAS o LETRAS_NUMERO
  const codeRegex = /^[A-Z]+_[A-Z0-9]+$/
  return codeRegex.test(code.toUpperCase())
}

// ===== UTILIDADES DE ARCHIVOS =====

/**
 * Formatea el tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

/**
 * Valida si un archivo es del tipo permitido
 */
export function isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = getFileExtension(filename)
  return allowedTypes.includes(extension)
}

// ===== UTILIDADES DE URL =====

/**
 * Construye una URL con parámetros
 */
export function buildUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, window.location.origin)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

/**
 * Obtiene parámetros de la URL actual
 */
export function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {}
  const urlParams = new URLSearchParams(window.location.search)

  for (const [key, value] of urlParams) {
    params[key] = value
  }

  return params
}

// ===== UTILIDADES DE STORAGE =====

/**
 * Guarda datos en localStorage de forma segura
 */
export function setLocalStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

/**
 * Obtiene datos de localStorage de forma segura
 */
export function getLocalStorage<T = any>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue || null
  }
}

/**
 * Elimina un item de localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

// ===== UTILIDADES DE TEXTO =====

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convierte a título (primera letra de cada palabra en mayúscula)
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => capitalize(txt))
}

/**
 * Trunca texto a una longitud específica
 */
export function truncateText(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Genera iniciales de un nombre
 */
export function generateInitials(firstName: string, lastName: string = ''): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName.charAt(0).toUpperCase()
  return first + last
}

// ===== UTILIDADES DE ARRAYS =====

/**
 * Agrupa un array por una propiedad
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Ordena un array por múltiples campos
 */
export function sortBy<T>(
  array: T[],
  ...sorters: Array<keyof T | ((item: T) => any)>
): T[] {
  return [...array].sort((a, b) => {
    for (const sorter of sorters) {
      let valueA: any, valueB: any

      if (typeof sorter === 'function') {
        valueA = sorter(a)
        valueB = sorter(b)
      } else {
        valueA = a[sorter]
        valueB = b[sorter]
      }

      if (valueA < valueB) return -1
      if (valueA > valueB) return 1
    }
    return 0
  })
}

/**
 * Remueve duplicados de un array
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

// ===== UTILIDADES DE DEBUGGING =====

/**
 * Log condicional solo en desarrollo
 */
export function devLog(...args: any[]): void {
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('[DEV]', ...args)
  }
}

/**
 * Medición de performance
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Operation'
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  if (import.meta.env.VITE_SHOW_PERFORMANCE === 'true') {
    console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`)
  }

  return result
}

// ===== EXPORTACIONES POR DEFECTO =====

export default {
  // Fechas
  formatDisplayDate,
  formatDateTime,
  formatRelativeDate,
  getCurrentDate,
  getCurrentTime,
  calculateHoursDifference,

  // Números
  formatPercentage,
  formatNumber,
  formatProduction,
  roundTo,
  clamp,

  // OEE
  calculateOEEMetrics,
  getOEEStatus,
  getOEEColor,
  getOEEBackgroundColor,
  getOEEStatusText,

  // Turnos
  getCurrentTurno,
  getTurnoName,

  // Validación
  isValidEmail,
  validatePassword,
  isValidAreaCode,

  // Archivos
  formatFileSize,
  getFileExtension,
  isAllowedFileType,

  // URL
  buildUrl,
  getUrlParams,

  // Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,

  // Texto
  capitalize,
  toTitleCase,
  truncateText,
  generateInitials,

  // Arrays
  groupBy,
  sortBy,
  uniqueBy,

  // Debugging
  devLog,
  measurePerformance,

  // Constantes
  OEE_THRESHOLDS,
  TURNO_HORARIOS
}
