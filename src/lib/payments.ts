import { PaymentStatus, SimulatedPayment } from "@/types/domain";

export type SimulatedCheckoutOutcome = "exitoso" | "rechazado" | "cancelado";

export function buildCycleId(subscriptionId: string, cycleNumber: number): string {
  return `${subscriptionId}_cycle_${cycleNumber}`;
}

export function hasSuccessfulPaymentForCycle(
  payments: SimulatedPayment[],
  subscriptionId: string,
  cycleNumber: number
): boolean {
  const targetCycleId = buildCycleId(subscriptionId, cycleNumber);
  return payments.some(
    (p) => p.cycleId === targetCycleId && p.status === "exitoso"
  );
}

export function createSimulatedPaymentRecord(params: {
  userId?: string;
  subscriptionId: string;
  cycleNumber: number;
  amount: number;
  periodDate: string;
  outcome: SimulatedCheckoutOutcome;
  paymentMethodSummary?: string;
  existingPayments?: SimulatedPayment[];
}): {
  payment: SimulatedPayment;
  isDuplicate: boolean;
  message: string;
} {
  const {
    userId,
    subscriptionId,
    cycleNumber,
    amount,
    periodDate,
    outcome,
    paymentMethodSummary,
    existingPayments = [],
  } = params;

  const cycleId = buildCycleId(subscriptionId, cycleNumber);

  if (
    outcome === "exitoso" &&
    hasSuccessfulPaymentForCycle(existingPayments, subscriptionId, cycleNumber)
  ) {
    const existing = existingPayments.find(
      (p) => p.cycleId === cycleId && p.status === "exitoso"
    )!;
    return {
      payment: existing,
      isDuplicate: true,
      message:
        "Este ciclo ya cuenta con un pago exitoso registrado. Se evitó un cobro duplicado.",
    };
  }

  const statusMap: Record<SimulatedCheckoutOutcome, PaymentStatus> = {
    exitoso: "exitoso",
    rechazado: "rechazado",
    cancelado: "cancelado",
  };

  const methodLabel = paymentMethodSummary ? ` con ${paymentMethodSummary}` : "";

  const reasonMap: Record<SimulatedCheckoutOutcome, string> = {
    exitoso: `Pago con tarjeta procesado correctamente${methodLabel}.`,
    rechazado:
      "La operación con tarjeta fue rechazada. Verifica los datos e intenta nuevamente.",
    cancelado:
      "Operación cancelada por el cliente antes de confirmar el cargo.",
  };

  const payment: SimulatedPayment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    subscriptionId,
    cycleNumber,
    cycleId,
    amount,
    currency: "PEN",
    status: statusMap[outcome],
    simulatedOutcome: outcome,
    paymentMethodSummary,
    reason: reasonMap[outcome],
    createdAt: new Date().toISOString(),
    periodDate,
  };

  const messageMap: Record<SimulatedCheckoutOutcome, string> = {
    exitoso: "Pago procesado correctamente. Tu suscripción ha sido activada.",
    rechazado:
      "El pago fue rechazado. Tu suscripción aún no se ha activado; puedes reintentar el pago.",
    cancelado:
      "Cancelaste el proceso de pago. Tus datos siguen guardados por si deseas retomar la contratación.",
  };

  return {
    payment,
    isDuplicate: false,
    message: messageMap[outcome],
  };
}
