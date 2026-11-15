import { SIZE_TO_PLAN } from "@/config/pricing";
import {
  AddonId,
  ArrangementSize,
  ColorPalette,
  DeliveryShift,
  FlowerType,
  RecipientInfo,
  ScheduledDelivery,
  SimulatedPayment,
  Subscription,
  SubscriptionDraft,
  SubscriptionFrequency,
} from "@/types/domain";
import { getNextCycleDate } from "./calendar";
import {
  buildCycleId,
  createSimulatedPaymentRecord,
  SimulatedCheckoutOutcome,
} from "./payments";
import { calculatePriceBreakdown, formatCustomizationSummary } from "./pricing";

export interface CheckoutResult {
  activated: boolean;
  subscription?: Subscription;
  payment: SimulatedPayment;
  delivery?: ScheduledDelivery;
  subscriptions: Subscription[];
  payments: SimulatedPayment[];
  deliveries: ScheduledDelivery[];
  message: string;
}

export function checkoutSubscriptionFromDraft(params: {
  draft: SubscriptionDraft;
  outcome: SimulatedCheckoutOutcome;
  subscriptions: Subscription[];
  payments: SimulatedPayment[];
  deliveries: ScheduledDelivery[];
  userId?: string;
  paymentMethodSummary?: string;
  fixedSubscriptionId?: string;
}): CheckoutResult {
  const {
    draft,
    outcome,
    subscriptions,
    payments,
    deliveries,
    userId,
    paymentMethodSummary,
    fixedSubscriptionId,
  } = params;

  if (!draft.shift) {
    throw new Error("El turno de entrega es obligatorio para procesar la suscripción.");
  }

  const effectiveUserId = userId ?? draft.userId ?? "usr_valeria_01";
  const priceBreakdown = calculatePriceBreakdown(draft.customization);
  const tempSubId =
    fixedSubscriptionId ??
    `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const paymentAttempt = createSimulatedPaymentRecord({
    userId: effectiveUserId,
    subscriptionId: tempSubId,
    cycleNumber: 1,
    amount: priceBreakdown.pricePerDelivery,
    periodDate: draft.firstDeliveryDate,
    outcome,
    paymentMethodSummary,
    existingPayments: payments,
  });

  const nextPayments = [...payments, paymentAttempt.payment];

  // Restricción: Solo activar una suscripción después de un pago exitoso
  if (outcome !== "exitoso") {
    return {
      activated: false,
      payment: paymentAttempt.payment,
      subscriptions,
      payments: nextPayments,
      deliveries,
      message: paymentAttempt.message,
    };
  }

  const codeNumber = String(subscriptions.length + 1).padStart(4, "0");
  const code = `FLORES-${codeNumber}`;
  const now = new Date().toISOString();
  const nextBillingDate = getNextCycleDate(
    draft.firstDeliveryDate,
    draft.customization.frequency
  );

  const newSubscription: Subscription = {
    id: tempSubId,
    userId: effectiveUserId,
    code,
    status: "activa",
    modality: draft.modality,
    customization: {
      ...draft.customization,
      planId: SIZE_TO_PLAN[draft.customization.size],
      addons: [...draft.customization.addons],
    },
    buyer: { ...draft.buyer },
    recipient:
      draft.modality === "regalo" ? { ...draft.recipient } : undefined,
    firstDeliveryDate: draft.firstDeliveryDate,
    nextBillingDate,
    shift: draft.shift,
    pricePerDelivery: priceBreakdown.pricePerDelivery,
    currentCycle: 1,
    paymentMethodSummary,
    createdAt: now,
    updatedAt: now,
  };

  const targetPerson =
    newSubscription.modality === "regalo" && newSubscription.recipient
      ? newSubscription.recipient
      : newSubscription.buyer;

  const firstDelivery: ScheduledDelivery = {
    id: `del_${tempSubId}_c1`,
    userId: effectiveUserId,
    subscriptionId: tempSubId,
    cycleNumber: 1,
    cycleId: buildCycleId(tempSubId, 1),
    paymentId: paymentAttempt.payment.id,
    scheduledDate: draft.firstDeliveryDate,
    shift: draft.shift,
    status: "programada",
    recipientName: targetPerson.fullName,
    deliveryAddress: targetPerson.address,
    deliveryReference: targetPerson.reference,
    summaryDescription: formatCustomizationSummary(newSubscription.customization),
  };

  return {
    activated: true,
    subscription: newSubscription,
    payment: paymentAttempt.payment,
    delivery: firstDelivery,
    subscriptions: [newSubscription, ...subscriptions],
    payments: nextPayments,
    deliveries: [firstDelivery, ...deliveries],
    message: paymentAttempt.message,
  };
}

/**
 * Programa cambios comerciales (plan, tamaño, flores, colores, frecuencia, complementos)
 * para aplicarse a partir del siguiente ciclo de facturación, respetando los importes ya pagados.
 */
export function scheduleCommercialModification(params: {
  subscriptionId: string;
  subscriptions: Subscription[];
  newConfig: {
    size: ArrangementSize;
    flowerType: FlowerType;
    colorPalette: ColorPalette;
    frequency: SubscriptionFrequency;
    addons: AddonId[];
  };
}): {
  success: boolean;
  subscriptions: Subscription[];
  message: string;
} {
  const { subscriptionId, subscriptions, newConfig } = params;
  const target = subscriptions.find((s) => s.id === subscriptionId);

  if (!target) {
    return {
      success: false,
      subscriptions,
      message: "No se encontró la suscripción solicitada.",
    };
  }

  if (target.status !== "activa") {
    return {
      success: false,
      subscriptions,
      message:
        "No es posible modificar una suscripción cancelada o finalizada.",
    };
  }

  const newPlanId = SIZE_TO_PLAN[newConfig.size];
  const breakdown = calculatePriceBreakdown({
    size: newConfig.size,
    flowerType: newConfig.flowerType,
    addons: newConfig.addons,
    frequency: newConfig.frequency,
  });

  const updatedSubscriptions = subscriptions.map((sub) => {
    if (sub.id !== subscriptionId) return sub;
    return {
      ...sub,
      pendingCommercialChanges: {
        planId: newPlanId,
        size: newConfig.size,
        flowerType: newConfig.flowerType,
        colorPalette: newConfig.colorPalette,
        frequency: newConfig.frequency,
        addons: [...newConfig.addons],
        pricePerDelivery: breakdown.pricePerDelivery,
        scheduledAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    success: true,
    subscriptions: updatedSubscriptions,
    message: `Cambios comerciales guardados. El nuevo importe de S/ ${breakdown.pricePerDelivery.toFixed(2)} por entrega se aplicará en tu próximo ciclo (${target.nextBillingDate}), respetando el pago ya registrado del ciclo actual.`,
  };
}

/**
 * Modifica datos operativos (destinatario, dirección, referencia, turno de entrega y dedicatoria)
 * actualizando también las entregas que aún estén programadas.
 */
export function updateOperationalDetails(params: {
  subscriptionId: string;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
  updates: {
    shift: DeliveryShift;
    dedication?: string;
    recipientName: string;
    deliveryAddress: string;
    deliveryReference?: string;
    recipientPhone?: string;
  };
}): {
  success: boolean;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
  message: string;
} {
  const { subscriptionId, subscriptions, deliveries, updates } = params;
  const target = subscriptions.find((s) => s.id === subscriptionId);

  if (!target) {
    return {
      success: false,
      subscriptions,
      deliveries,
      message: "No se encontró la suscripción solicitada.",
    };
  }

  if (target.status !== "activa") {
    return {
      success: false,
      subscriptions,
      deliveries,
      message:
        "No se pueden modificar los datos de entrega de una suscripción cancelada o finalizada.",
    };
  }

  const updatedSubscriptions = subscriptions.map((sub) => {
    if (sub.id !== subscriptionId) return sub;

    const updatedBuyer =
      sub.modality === "propio"
        ? {
            ...sub.buyer,
            fullName: updates.recipientName.trim() || sub.buyer.fullName,
            address: updates.deliveryAddress.trim(),
            reference: updates.deliveryReference?.trim() ?? "",
          }
        : sub.buyer;

    const updatedRecipient: RecipientInfo | undefined =
      sub.modality === "regalo"
        ? {
            fullName:
              updates.recipientName.trim() ||
              sub.recipient?.fullName ||
              sub.buyer.fullName,
            phone:
              updates.recipientPhone?.trim() ||
              sub.recipient?.phone ||
              sub.buyer.phone,
            address: updates.deliveryAddress.trim(),
            reference: updates.deliveryReference?.trim() ?? "",
            relationship: sub.recipient?.relationship,
          }
        : undefined;

    return {
      ...sub,
      shift: updates.shift,
      customization: {
        ...sub.customization,
        dedication:
          updates.dedication !== undefined
            ? updates.dedication
            : sub.customization.dedication,
      },
      buyer: updatedBuyer,
      recipient: updatedRecipient,
      updatedAt: new Date().toISOString(),
    };
  });

  const updatedDeliveries = deliveries.map((del) => {
    if (del.subscriptionId !== subscriptionId || del.status !== "programada") {
      return del;
    }
    return {
      ...del,
      shift: updates.shift,
      recipientName: updates.recipientName.trim(),
      deliveryAddress: updates.deliveryAddress.trim(),
      deliveryReference: updates.deliveryReference?.trim() ?? "",
    };
  });

  return {
    success: true,
    subscriptions: updatedSubscriptions,
    deliveries: updatedDeliveries,
    message:
      "Se actualizaron correctamente la dirección, destinatario y el turno de entrega.",
  };
}

/**
 * Cancela una suscripción activa: detiene renovaciones futuras, conserva el historial
 * y mantiene las entregas ya pagadas como programadas según la política comercial.
 */
export function cancelSubscription(params: {
  subscriptionId: string;
  reason?: string;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
}): {
  success: boolean;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
  message: string;
} {
  const { subscriptionId, reason, subscriptions, deliveries } = params;
  const target = subscriptions.find((s) => s.id === subscriptionId);

  if (!target) {
    return {
      success: false,
      subscriptions,
      deliveries,
      message: "No se encontró la suscripción que intentas cancelar.",
    };
  }

  if (target.status !== "activa") {
    return {
      success: false,
      subscriptions,
      deliveries,
      message: "Esta suscripción ya se encuentra cancelada o finalizada.",
    };
  }

  const now = new Date().toISOString();
  const updatedSubscriptions = subscriptions.map((sub) => {
    if (sub.id !== subscriptionId) return sub;
    return {
      ...sub,
      status: "cancelada" as const,
      pendingCommercialChanges: undefined,
      cancelledAt: now,
      cancellationReason:
        reason?.trim() || "Cancelación solicitada por el cliente.",
      updatedAt: now,
    };
  });

  const paidPendingDeliveries = deliveries.filter(
    (d) => d.subscriptionId === subscriptionId && d.status === "programada"
  ).length;

  return {
    success: true,
    subscriptions: updatedSubscriptions,
    deliveries,
    message:
      paidPendingDeliveries > 0
        ? `Tu suscripción ${target.code} se canceló correctamente. Se detuvieron los cobros futuros y tu entrega ya pagada sigue programada.`
        : `Tu suscripción ${target.code} se canceló correctamente y se detuvieron las próximas renovaciones.`,
  };
}

/**
 * Permite confirmar una entrega programada como "entregada".
 * Si la suscripción estaba cancelada y ya no quedan entregas pendientes, pasa a estado "finalizada".
 */
export function markDeliveryDeliveredInDemoMode(params: {
  deliveryId: string;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
}): {
  success: boolean;
  subscriptions: Subscription[];
  deliveries: ScheduledDelivery[];
  message: string;
} {
  const { deliveryId, subscriptions, deliveries } = params;
  const targetDelivery = deliveries.find((d) => d.id === deliveryId);

  if (!targetDelivery) {
    return {
      success: false,
      subscriptions,
      deliveries,
      message: "No se encontró la entrega seleccionada.",
    };
  }

  if (targetDelivery.status !== "programada") {
    return {
      success: false,
      subscriptions,
      deliveries,
      message: "Solo se pueden marcar como entregadas las entregas programadas.",
    };
  }

  const now = new Date().toISOString();
  const updatedDeliveries = deliveries.map((del) =>
    del.id === deliveryId
      ? {
          ...del,
          status: "entregada" as const,
          deliveredAt: now,
          isDemoVerified: true,
        }
      : del
  );

  // Si la suscripción estaba cancelada y todas sus entregas ya fueron entregadas, pasa a "finalizada"
  const subId = targetDelivery.subscriptionId;
  const remainingScheduled = updatedDeliveries.some(
    (d) => d.subscriptionId === subId && d.status === "programada"
  );

  const updatedSubscriptions = subscriptions.map((sub) => {
    if (sub.id === subId && sub.status === "cancelada" && !remainingScheduled) {
      return {
        ...sub,
        status: "finalizada" as const,
        updatedAt: now,
      };
    }
    return sub;
  });

  return {
    success: true,
    subscriptions: updatedSubscriptions,
    deliveries: updatedDeliveries,
    message:
      "La entrega fue confirmada como Entregada y registrada en tu historial.",
  };
}
