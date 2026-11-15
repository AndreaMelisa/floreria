import {
  AddonId,
  ArrangementSize,
  FlowerType,
  PlanId,
  SubscriptionFrequency,
} from "@/types/domain";

export const CURRENCY_CONFIG = {
  code: "PEN" as const,
  symbol: "S/",
  locale: "es-PE",
};

/**
 * Precio base según el tamaño del arreglo (en Soles Peruanos - PEN)
 * Brote -> Pequeño
 * Floración -> Mediano
 * Jardín -> Grande
 */
export const SIZE_PRICES: Record<ArrangementSize, number> = {
  pequeno: 65,
  mediano: 95,
  grande: 135,
};

/**
 * Relación bidireccional entre PlanId y Tamaño predeterminado
 */
export const PLAN_TO_SIZE: Record<PlanId, ArrangementSize> = {
  brote: "pequeno",
  floracion: "mediano",
  jardin: "grande",
};

export const SIZE_TO_PLAN: Record<ArrangementSize, PlanId> = {
  pequeno: "brote",
  mediano: "floracion",
  grande: "jardin",
};

/**
 * Recargo por selección de tipo de flores (en PEN)
 */
export const FLOWER_TYPE_PRICES: Record<FlowerType, number> = {
  temporada: 0,
  mixtas: 15,
  rosas: 28,
  premium: 45,
};

/**
 * Precios de complementos opcionales por entrega (en PEN)
 */
export const ADDON_PRICES: Record<AddonId, number> = {
  tarjeta: 8,
  envoltura: 14,
  chocolates: 26,
};

/**
 * Factor de entregas estimadas por mes para mostrar un costo mensual aproximado
 * Nota: Cada ciclo de cobro corresponde a 1 entrega (semanal = cada 7 días, quincenal = cada 14 días, mensual = cada mes calendario).
 */
export const FREQUENCY_MONTHLY_MULTIPLIER: Record<SubscriptionFrequency, number> = {
  semanal: 4,
  quincenal: 2,
  mensual: 1,
};

export function formatPEN(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}
