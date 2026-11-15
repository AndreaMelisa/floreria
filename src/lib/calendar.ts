import { SubscriptionFrequency } from "@/types/domain";

export const LIMA_TIMEZONE = "America/Lima";
export const MIN_ADVANCE_DAYS = 1; // Mínimo 1 día de anticipación para preparar flores frescas
export const MAX_ADVANCE_DAYS = 60; // Hasta 60 días hacia adelante para programar la primera entrega

/**
 * Obtiene la fecha actual en la zona horaria America/Lima en formato YYYY-MM-DD.
 * Permite inyectar una fecha de referencia para pruebas o modo demostración.
 */
export function getLimaDateString(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: LIMA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(referenceDate);
}

/**
 * Convierte una cadena YYYY-MM-DD en un objeto Date UTC al mediodía para evitar desfases horarios.
 */
export function parseDateISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1, 12, 0, 0));
}

/**
 * Formatea un Date UTC a YYYY-MM-DD.
 */
export function formatDateISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Suma días a una fecha YYYY-MM-DD.
 */
export function addDaysISO(dateStr: string, days: number): string {
  const d = parseDateISO(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateISO(d);
}

/**
 * Suma meses calendario a una fecha YYYY-MM-DD respetando el fin de mes.
 */
export function addMonthsISO(dateStr: string, months: number): string {
  const d = parseDateISO(dateStr);
  const originalDay = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDayOfTargetMonth = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12, 0, 0)
  ).getUTCDate();
  d.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));
  return formatDateISO(d);
}

/**
 * Calcula la siguiente fecha de ciclo según la frecuencia:
 * - Semanal: cada 7 días
 * - Quincenal: cada 14 días
 * - Mensual: cada mes calendario
 */
export function getNextCycleDate(
  currentDateStr: string,
  frequency: SubscriptionFrequency
): string {
  switch (frequency) {
    case "semanal":
      return addDaysISO(currentDateStr, 7);
    case "quincenal":
      return addDaysISO(currentDateStr, 14);
    case "mensual":
      return addMonthsISO(currentDateStr, 1);
  }
}

/**
 * Genera una lista de las próximas N fechas de entrega a partir de una fecha inicial.
 */
export function getProjectedDeliveryDates(
  firstDateStr: string,
  frequency: SubscriptionFrequency,
  count: number = 3
): string[] {
  if (!firstDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(firstDateStr)) {
    return [];
  }
  const dates: string[] = [firstDateStr];
  let current = firstDateStr;
  for (let i = 1; i < count; i++) {
    current = getNextCycleDate(current, frequency);
    dates.push(current);
  }
  return dates;
}

/**
 * Obtiene la fecha mínima permitida para la primera entrega (mañana en America/Lima).
 */
export function getMinFirstDeliveryDate(todayLimaStr?: string): string {
  const base = todayLimaStr ?? getLimaDateString();
  return addDaysISO(base, MIN_ADVANCE_DAYS);
}

/**
 * Obtiene la fecha máxima permitida para programar la primera entrega.
 */
export function getMaxFirstDeliveryDate(todayLimaStr?: string): string {
  const base = todayLimaStr ?? getLimaDateString();
  return addDaysISO(base, MAX_ADVANCE_DAYS);
}

/**
 * Valida si una fecha de primera entrega es válida según las restricciones de negocio.
 */
export function validateDeliveryDate(
  dateStr: string,
  todayLimaStr?: string
): { valid: boolean; error?: string } {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return {
      valid: false,
      error: "Selecciona una fecha válida del calendario para programar tu entrega.",
    };
  }

  const today = todayLimaStr ?? getLimaDateString();
  const minDate = getMinFirstDeliveryDate(today);
  const maxDate = getMaxFirstDeliveryDate(today);

  if (dateStr < today) {
    return {
      valid: false,
      error:
        "No es posible seleccionar una fecha pasada. Elige una fecha a partir de mañana.",
    };
  }

  if (dateStr < minDate) {
    return {
      valid: false,
      error:
        "Requerimos al menos 24 horas de anticipación para preparar tallos frescos. Selecciona una fecha desde mañana.",
    };
  }

  if (dateStr > maxDate) {
    return {
      valid: false,
      error: `Puedes programar tu primera entrega hasta con ${MAX_ADVANCE_DAYS} días de anticipación (${formatDateHuman(maxDate)}).`,
    };
  }

  return { valid: true };
}

/**
 * Formatea una fecha YYYY-MM-DD en español legible (ej. "lunes, 16 de noviembre de 2026").
 */
export function formatDateHuman(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "Fecha por definir";
  const date = parseDateISO(dateStr);
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formatea una fecha YYYY-MM-DD en formato corto (ej. "16 nov 2026").
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "-";
  const date = parseDateISO(dateStr);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
