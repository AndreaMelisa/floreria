export type PlanId = "brote" | "floracion" | "jardin";

export type ArrangementSize = "pequeno" | "mediano" | "grande";

export type FlowerType = "temporada" | "mixtas" | "rosas" | "premium";

export type ColorPalette = "pastel" | "intensos" | "blancos" | "sorpresa";

export type SubscriptionFrequency = "semanal" | "quincenal" | "mensual";

export type AddonId = "tarjeta" | "envoltura" | "chocolates";

export type SubscriptionModality = "propio" | "regalo";

export type DeliveryShift = "manana" | "tarde";

export type SubscriptionStatus = "pendiente" | "activa" | "cancelada" | "finalizada";

export type PaymentStatus = "pendiente" | "exitoso" | "rechazado" | "cancelado";

export type DeliveryStatus = "programada" | "cancelada" | "entregada";

export type CardType = "credito" | "debito";

export interface ClientUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  reference?: string;
  createdAt: string;
}

export interface CardPaymentInput {
  cardType: CardType;
  cardNumber: string;
  cardHolder: string;
  expiry: string; // MM/YY
  cvv: string;
}

export interface FloralPlan {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  defaultSize: ArrangementSize;
  stemsEstimate: string;
  idealFor: string;
  features: string[];
  badge?: string;
  image: string;
  imageAlt: string;
}

export interface BuyerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  reference?: string;
}

export interface RecipientInfo {
  fullName: string;
  phone: string;
  address: string;
  reference?: string;
  relationship?: string;
}

export interface FloralCustomization {
  planId: PlanId;
  name?: string;
  size: ArrangementSize;
  flowerType: FlowerType;
  colorPalette: ColorPalette;
  frequency: SubscriptionFrequency;
  addons: AddonId[];
  dedication: string;
}

export interface PriceBreakdown {
  sizePrice: number;
  flowerTypePrice: number;
  addonsPrice: number;
  addonsDetail: { id: AddonId; name: string; price: number }[];
  pricePerDelivery: number;
  pricePerBillingCycle: number;
  estimatedMonthlyPrice: number;
  deliveriesPerMonthEstimate: number;
  currency: "PEN";
}

export interface SubscriptionDraft {
  userId?: string;
  step: number;
  modality: SubscriptionModality;
  customization: FloralCustomization;
  buyer: BuyerInfo;
  recipient: RecipientInfo;
  firstDeliveryDate: string; // YYYY-MM-DD in America/Lima
  shift: DeliveryShift | "";
  updatedAt: string;
}

export interface CommercialChangeSet {
  planId: PlanId;
  size: ArrangementSize;
  flowerType: FlowerType;
  colorPalette: ColorPalette;
  frequency: SubscriptionFrequency;
  addons: AddonId[];
  pricePerDelivery: number;
  scheduledAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  code: string;
  status: SubscriptionStatus;
  modality: SubscriptionModality;
  customization: FloralCustomization;
  buyer: BuyerInfo;
  recipient?: RecipientInfo;
  firstDeliveryDate: string; // YYYY-MM-DD
  nextBillingDate: string; // YYYY-MM-DD
  shift: DeliveryShift;
  pricePerDelivery: number;
  currentCycle: number;
  paymentMethodSummary?: string;
  pendingCommercialChanges?: CommercialChangeSet;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface SimulatedPayment {
  id: string;
  userId?: string;
  subscriptionId: string;
  cycleNumber: number;
  cycleId: string; // Unique key: `${subscriptionId}_cycle_${cycleNumber}` to prevent duplicate payments
  amount: number;
  currency: "PEN";
  status: PaymentStatus;
  simulatedOutcome: "exitoso" | "rechazado" | "cancelado";
  paymentMethodSummary?: string;
  reason?: string;
  createdAt: string;
  periodDate: string; // YYYY-MM-DD corresponding to the cycle date
}

export interface ScheduledDelivery {
  id: string;
  userId?: string;
  subscriptionId: string;
  cycleNumber: number;
  cycleId: string;
  paymentId: string;
  scheduledDate: string; // YYYY-MM-DD
  shift: DeliveryShift;
  status: DeliveryStatus;
  recipientName: string;
  deliveryAddress: string;
  deliveryReference?: string;
  summaryDescription: string;
  deliveredAt?: string;
  isDemoVerified?: boolean;
}

export interface UserPreferences {
  reducedMotion?: boolean;
  highContrastAssist?: boolean;
  demoDateOverride?: string | null;
  lastVisitedTab?: "contratar" | "mis-suscripciones";
}
