import {
  ScheduledDelivery,
  SimulatedPayment,
  Subscription,
} from "@/types/domain";
import { getLimaDateString, getNextCycleDate } from "./calendar";
import { buildCycleId, hasSuccessfulPaymentForCycle } from "./payments";
import { calculatePriceBreakdown, formatCustomizationSummary } from "./pricing";

export interface RenewalProcessResult {
  subscriptions: Subscription[];
  payments: SimulatedPayment[];
  deliveries: ScheduledDelivery[];
  processedCount: number;
  summaryMessages: string[];
}

const MAX_CYCLES_PER_RUN = 24;

/**
 * Procesa las renovaciones pendientes al abrir la aplicación o al avanzar el ciclo.
 * Aplica los cambios comerciales pendientes al iniciar el nuevo ciclo y previene cobros duplicados mediante cycleId.
 */
export function processDueRenewals(params: {
  subscriptions: Subscription[];
  payments: SimulatedPayment[];
  deliveries: ScheduledDelivery[];
  currentLimaDate?: string;
}): RenewalProcessResult {
  const currentDate = params.currentLimaDate ?? getLimaDateString();
  const updatedSubscriptions = params.subscriptions.map((s) => ({
    ...s,
    customization: { ...s.customization, addons: [...s.customization.addons] },
    buyer: { ...s.buyer },
    recipient: s.recipient ? { ...s.recipient } : undefined,
    pendingCommercialChanges: s.pendingCommercialChanges
      ? {
          ...s.pendingCommercialChanges,
          addons: [...s.pendingCommercialChanges.addons],
        }
      : undefined,
  }));
  const updatedPayments = [...params.payments];
  const updatedDeliveries = [...params.deliveries];
  const summaryMessages: string[] = [];
  let processedCount = 0;

  for (let i = 0; i < updatedSubscriptions.length; i++) {
    const sub = updatedSubscriptions[i];
    if (sub.status !== "activa") continue;

    let safetyCounter = 0;
    while (
      sub.nextBillingDate <= currentDate &&
      safetyCounter < MAX_CYCLES_PER_RUN
    ) {
      safetyCounter++;
      const cycleDate = sub.nextBillingDate;
      const nextCycleNumber = sub.currentCycle + 1;
      const cycleId = buildCycleId(sub.id, nextCycleNumber);

      // Si existen cambios comerciales programados para el siguiente ciclo, se aplican ahora
      if (sub.pendingCommercialChanges) {
        const changes = sub.pendingCommercialChanges;
        sub.customization = {
          ...sub.customization,
          planId: changes.planId,
          size: changes.size,
          flowerType: changes.flowerType,
          colorPalette: changes.colorPalette,
          frequency: changes.frequency,
          addons: [...changes.addons],
        };
        sub.pricePerDelivery = calculatePriceBreakdown(
          sub.customization
        ).pricePerDelivery;
        sub.pendingCommercialChanges = undefined;
      }

      // Verificar protección contra duplicados por cycleId
      const alreadyPaid = hasSuccessfulPaymentForCycle(
        updatedPayments,
        sub.id,
        nextCycleNumber
      );

      if (!alreadyPaid) {
        const paymentId = `pay_ren_${sub.id}_c${nextCycleNumber}`;
        const newPayment: SimulatedPayment = {
          id: paymentId,
          userId: sub.userId,
          subscriptionId: sub.id,
          cycleNumber: nextCycleNumber,
          cycleId,
          amount: sub.pricePerDelivery,
          currency: "PEN",
          status: "exitoso",
          simulatedOutcome: "exitoso",
          paymentMethodSummary: sub.paymentMethodSummary,
          reason: `Renovación automática del ciclo #${nextCycleNumber}.`,
          createdAt: new Date().toISOString(),
          periodDate: cycleDate,
        };
        updatedPayments.push(newPayment);

        const deliveryExists = updatedDeliveries.some(
          (d) => d.cycleId === cycleId
        );
        if (!deliveryExists) {
          const targetPerson =
            sub.modality === "regalo" && sub.recipient
              ? sub.recipient
              : sub.buyer;
          const newDelivery: ScheduledDelivery = {
            id: `del_${sub.id}_c${nextCycleNumber}`,
            userId: sub.userId,
            subscriptionId: sub.id,
            cycleNumber: nextCycleNumber,
            cycleId,
            paymentId,
            scheduledDate: cycleDate,
            shift: sub.shift,
            status: "programada",
            recipientName: targetPerson.fullName,
            deliveryAddress: targetPerson.address,
            deliveryReference: targetPerson.reference,
            summaryDescription: formatCustomizationSummary(sub.customization),
          };
          updatedDeliveries.push(newDelivery);
        }

        processedCount++;
        summaryMessages.push(
          `Suscripción ${sub.code}: se procesó la renovación del ciclo #${nextCycleNumber} (${cycleDate}) por S/ ${sub.pricePerDelivery.toFixed(2)}.`
        );
      }

      sub.currentCycle = nextCycleNumber;
      sub.nextBillingDate = getNextCycleDate(
        cycleDate,
        sub.customization.frequency
      );
      sub.updatedAt = new Date().toISOString();
    }
  }

  return {
    subscriptions: updatedSubscriptions,
    payments: updatedPayments,
    deliveries: updatedDeliveries,
    processedCount,
    summaryMessages,
  };
}
