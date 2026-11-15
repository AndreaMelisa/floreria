import { getMinFirstDeliveryDate } from "./calendar";
import {
  ClientUser,
  ScheduledDelivery,
  SimulatedPayment,
  Subscription,
  SubscriptionDraft,
  UserPreferences,
} from "@/types/domain";

export const STORAGE_VERSION = "1.0.0";

export const STORAGE_KEYS = {
  DRAFT: "club_borrador",
  SUBSCRIPTIONS: "club_suscripciones",
  PAYMENTS: "club_pagos",
  DELIVERIES: "club_entregas",
  PREFERENCES: "club_preferencias",
  USERS: "club_usuarios",
  SESSION: "club_sesion",
} as const;

interface VersionedEnvelope<T> {
  version: string;
  updatedAt: string;
  data: T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readEnvelope<T>(
  key: string,
  validator: (val: unknown) => val is T,
  fallback: T
): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<VersionedEnvelope<unknown>>;
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.version === STORAGE_VERSION &&
      validator(parsed.data)
    ) {
      return parsed.data;
    }
    if (validator(parsed)) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function writeEnvelope<T>(key: string, data: T): boolean {
  if (!isBrowser()) return false;
  try {
    const envelope: VersionedEnvelope<T> = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data,
    };
    window.localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function createDefaultDraft(user?: ClientUser | null): SubscriptionDraft {
  return {
    userId: user?.id,
    step: 1,
    modality: "propio",
    customization: {
      planId: "floracion",
      size: "mediano",
      flowerType: "temporada",
      colorPalette: "pastel",
      frequency: "quincenal",
      addons: [],
      dedication: "",
    },
    buyer: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      reference: user?.reference ?? "",
    },
    recipient: {
      fullName: "",
      phone: "",
      address: "",
      reference: "",
      relationship: "",
    },
    firstDeliveryDate: getMinFirstDeliveryDate(),
    shift: "",
    updatedAt: new Date().toISOString(),
  };
}

function isDraftValid(val: unknown): val is SubscriptionDraft {
  if (!val || typeof val !== "object") return false;
  const d = val as Partial<SubscriptionDraft>;
  return (
    typeof d.step === "number" &&
    (d.modality === "propio" || d.modality === "regalo") &&
    !!d.customization &&
    typeof d.customization.planId === "string" &&
    typeof d.customization.size === "string" &&
    !!d.buyer &&
    !!d.recipient &&
    typeof d.firstDeliveryDate === "string"
  );
}

function isSubscriptionArray(val: unknown): val is Subscription[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.status === "string" &&
        typeof item.customization === "object"
    )
  );
}

function isPaymentArray(val: unknown): val is SimulatedPayment[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.cycleId === "string" &&
        typeof item.amount === "number"
    )
  );
}

function isDeliveryArray(val: unknown): val is ScheduledDelivery[] {
  return (
    Array.isArray(val) &&
    val.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.cycleId === "string" &&
        typeof item.scheduledDate === "string"
    )
  );
}

function isPreferencesValid(val: unknown): val is UserPreferences {
  return !!val && typeof val === "object";
}

function isUserArray(val: unknown): val is ClientUser[] {
  return (
    Array.isArray(val) &&
    val.every(
      (u) =>
        u &&
        typeof u === "object" &&
        typeof u.id === "string" &&
        typeof u.email === "string"
    )
  );
}

function isClientUser(val: unknown): val is ClientUser | null {
  if (val === null) return true;
  if (!val || typeof val !== "object") return false;
  const u = val as Partial<ClientUser>;
  return typeof u.id === "string" && typeof u.email === "string";
}

export function loadDraft(user?: ClientUser | null): SubscriptionDraft {
  const draft = readEnvelope(
    STORAGE_KEYS.DRAFT,
    isDraftValid,
    createDefaultDraft(user)
  );
  if (user && !draft.buyer.fullName && !draft.buyer.email) {
    return {
      ...draft,
      userId: user.id,
      buyer: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        reference: user.reference ?? "",
      },
    };
  }
  return draft;
}

export function saveDraft(draft: SubscriptionDraft): boolean {
  return writeEnvelope(STORAGE_KEYS.DRAFT, {
    ...draft,
    updatedAt: new Date().toISOString(),
  });
}

export function clearDraft(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch {
    // Ignorar error de acceso
  }
}

export function loadSubscriptions(): Subscription[] {
  const list = readEnvelope<Subscription[]>(
    STORAGE_KEYS.SUBSCRIPTIONS,
    isSubscriptionArray,
    []
  );
  const map = new Map<string, Subscription>();
  for (const sub of list) {
    map.set(sub.id, sub);
  }
  return Array.from(map.values());
}

export function saveSubscriptions(subscriptions: Subscription[]): boolean {
  const map = new Map<string, Subscription>();
  for (const sub of subscriptions) {
    map.set(sub.id, sub);
  }
  return writeEnvelope(STORAGE_KEYS.SUBSCRIPTIONS, Array.from(map.values()));
}

export function loadPayments(): SimulatedPayment[] {
  const list = readEnvelope<SimulatedPayment[]>(
    STORAGE_KEYS.PAYMENTS,
    isPaymentArray,
    []
  );
  const map = new Map<string, SimulatedPayment>();
  for (const payment of list) {
    map.set(payment.id, payment);
  }
  return Array.from(map.values());
}

export function savePayments(payments: SimulatedPayment[]): boolean {
  const map = new Map<string, SimulatedPayment>();
  for (const p of payments) {
    map.set(p.id, p);
  }
  return writeEnvelope(STORAGE_KEYS.PAYMENTS, Array.from(map.values()));
}

export function loadDeliveries(): ScheduledDelivery[] {
  const list = readEnvelope<ScheduledDelivery[]>(
    STORAGE_KEYS.DELIVERIES,
    isDeliveryArray,
    []
  );
  const map = new Map<string, ScheduledDelivery>();
  for (const del of list) {
    map.set(del.cycleId, del);
  }
  return Array.from(map.values());
}

export function saveDeliveries(deliveries: ScheduledDelivery[]): boolean {
  const map = new Map<string, ScheduledDelivery>();
  for (const del of deliveries) {
    map.set(del.cycleId, del);
  }
  return writeEnvelope(STORAGE_KEYS.DELIVERIES, Array.from(map.values()));
}

export function loadPreferences(): UserPreferences {
  return readEnvelope<UserPreferences>(
    STORAGE_KEYS.PREFERENCES,
    isPreferencesValid,
    {
      reducedMotion: false,
      highContrastAssist: false,
      demoDateOverride: null,
      lastVisitedTab: "contratar",
    }
  );
}

export function savePreferences(prefs: UserPreferences): boolean {
  return writeEnvelope(STORAGE_KEYS.PREFERENCES, prefs);
}

export function loadRegisteredUsers(): ClientUser[] {
  return readEnvelope<ClientUser[]>(STORAGE_KEYS.USERS, isUserArray, []);
}

export function saveRegisteredUsers(users: ClientUser[]): boolean {
  return writeEnvelope(STORAGE_KEYS.USERS, users);
}

export function loadSessionUser(): ClientUser | null {
  return readEnvelope<ClientUser | null>(STORAGE_KEYS.SESSION, isClientUser, null);
}

export function saveSessionUser(user: ClientUser | null): boolean {
  return writeEnvelope(STORAGE_KEYS.SESSION, user);
}
