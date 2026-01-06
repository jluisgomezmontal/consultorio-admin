/**
 * Parsea una fecha ISO string sin aplicar conversión de zona horaria.
 * Útil cuando el backend envía fechas en formato "YYYY-MM-DDTHH:mm:ss.sssZ"
 * y queremos mantener la fecha local sin que JavaScript la ajuste a la zona horaria del navegador.
 * 
 * @param dateString - Fecha en formato ISO string (ej: "2026-01-23T00:00:00.000Z")
 * @returns Date object con la fecha local sin conversión de zona horaria
 */
export function parseLocalDate(dateString: string): Date {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset);
}

/**
 * Formatea una fecha ISO string a formato local sin conversión de zona horaria.
 * 
 * @param dateString - Fecha en formato ISO string
 * @param options - Opciones de formato para toLocaleDateString
 * @returns Fecha formateada en español
 */
export function formatLocalDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('es-MX', options);
}
