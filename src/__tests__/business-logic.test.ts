import { describe, expect, it } from "vitest";
import { calculatePriceBreakdown } from "@/lib/pricing";
import {
  addDaysISO,
  getMinFirstDeliveryDate,
  getNextCycleDate,
  getProjectedDeliveryDates,
  validateDeliveryDate,
} from "@/lib/calendar";
import {
  buildCycleId,
  createSimulatedPaymentRecord,
} from "@/lib/payments";
import {
  cancelSubscription,
  checkoutSubscriptionFromDraft,
  markDeliveryDeliveredInDemoMode,
  scheduleCommercialModification,
  updateOperationalDetails,
} from "@/lib/subscriptions";
import { processDueRenewals } from "@/lib/renewals";
import { createDefaultDraft } from "@/lib/storage";
import {
  validateBuyerInfo,
  validateDedication,
  validateStepDelivery,
  validateStepRecipientAndBuyer,
} from "@/lib/validation";

describe("Lógica de negocio - El club de las flores", () => {
  describe("1. Cálculo de precios y personalización", () => {
    it("calcula precio por entrega = tamaño + tipo de flores + complementos en PEN", () => {
      const breakdown = calculatePriceBreakdown({
        size: "pequeno", // 65
        flowerType: "temporada", // 0
        addons: [],
        frequency: "mensual",
      });
      expect(breakdown.pricePerDelivery).toBe(65);
      expect(breakdown.pricePerBillingCycle).toBe(65);
      expect(breakdown.estimatedMonthlyPrice).toBe(65);
      expect(breakdown.currency).toBe("PEN");
    });

    it("actualiza el precio al cambiar tamaño, flores y múltiples complementos", () => {
      const breakdown = calculatePriceBreakdown({
        size: "grande", // 135
        flowerType: "premium", // 45
        addons: ["tarjeta", "chocolates"], // 8 + 26 = 34
        frequency: "semanal", // x4 estimado mensual
      });
      expect(breakdown.sizePrice).toBe(135);
      expect(breakdown.flowerTypePrice).toBe(45);
      expect(breakdown.addonsPrice).toBe(34);
      expect(breakdown.pricePerDelivery).toBe(214);
      expect(breakdown.pricePerBillingCycle).toBe(214);
      expect(breakdown.estimatedMonthlyPrice).toBe(214 * 4);
    });
  });

  describe("2. Frecuencias, fechas y turnos (America/Lima)", () => {
    it("calcula correctamente los ciclos semanal (+7d), quincenal (+14d) y mensual (+1m)", () => {
      expect(getNextCycleDate("2026-11-16", "semanal")).toBe("2026-11-23");
      expect(getNextCycleDate("2026-11-16", "quincenal")).toBe("2026-11-30");
      expect(getNextCycleDate("2026-11-16", "mensual")).toBe("2026-12-16");
    });

    it("genera proyección de fechas según la frecuencia", () => {
      const projected = getProjectedDeliveryDates("2026-11-16", "quincenal", 3);
      expect(projected).toEqual(["2026-11-16", "2026-11-30", "2026-12-14"]);
    });

    it("bloquea fechas pasadas y exige plazo mínimo de anticipación", () => {
      const todayLima = "2026-11-15";
      const pastCheck = validateDeliveryDate("2026-11-14", todayLima);
      expect(pastCheck.valid).toBe(false);
      expect(pastCheck.error).toContain("fecha pasada");

      const sameDayCheck = validateDeliveryDate("2026-11-15", todayLima);
      expect(sameDayCheck.valid).toBe(false);
      expect(sameDayCheck.error).toContain("anticipación");

      const validTomorrow = validateDeliveryDate(
        getMinFirstDeliveryDate(todayLima),
        todayLima
      );
      expect(validTomorrow.valid).toBe(true);
    });

    it("exige seleccionar un turno (mañana o tarde) para continuar", () => {
      const todayLima = "2026-11-15";
      const missingShift = validateStepDelivery("2026-11-16", "", todayLima);
      expect(missingShift.valid).toBe(false);
      expect(missingShift.shiftError).toContain("Selecciona un turno");

      const validMorning = validateStepDelivery(
        "2026-11-16",
        "manana",
        todayLima
      );
      expect(validMorning.valid).toBe(true);
    });
  });

  describe("3. Validaciones de comprador, destinatario y dedicatoria", () => {
    it("valida campos obligatorios, formato de correo, teléfono y límite de caracteres", () => {
      const invalidBuyer = validateBuyerInfo({
        fullName: "A",
        email: "correo-invalido",
        phone: "123",
        address: "Corta",
      });
      expect(invalidBuyer.fullName).toBeDefined();
      expect(invalidBuyer.email).toBeDefined();
      expect(invalidBuyer.phone).toBeDefined();
      expect(invalidBuyer.address).toBeDefined();

      const overLimitDedication = validateDedication("x".repeat(225));
      expect(overLimitDedication).toContain("límite máximo");

      const giftValidation = validateStepRecipientAndBuyer(
        "regalo",
        {
          fullName: "Valeria Mendoza",
          email: "valeria@correo.pe",
          phone: "987654321",
          address: "Av. Primavera 1420, Surco",
        },
        {
          fullName: "",
          phone: "",
          address: "",
        }
      );
      expect(giftValidation.valid).toBe(false);
      expect(giftValidation.recipientErrors.fullName).toBeDefined();
    });
  });

  describe("4. Pagos simulados y prevención de duplicados", () => {
    it("solo activa una suscripción después de un pago simulado exitoso", () => {
      const draft = createDefaultDraft();
      draft.shift = "manana";
      draft.firstDeliveryDate = "2026-11-16";
      draft.buyer = {
        fullName: "Valeria Mendoza",
        email: "valeria@correo.pe",
        phone: "987654321",
        address: "Av. Primavera 1420, Surco",
      };

      // Intento rechazado
      const rejectedRes = checkoutSubscriptionFromDraft({
        draft,
        outcome: "rechazado",
        subscriptions: [],
        payments: [],
        deliveries: [],
      });
      expect(rejectedRes.activated).toBe(false);
      expect(rejectedRes.subscriptions).toHaveLength(0);
      expect(rejectedRes.payments).toHaveLength(1);
      expect(rejectedRes.payments[0].status).toBe("rechazado");

      // Intento cancelado
      const cancelledRes = checkoutSubscriptionFromDraft({
        draft,
        outcome: "cancelado",
        subscriptions: [],
        payments: rejectedRes.payments,
        deliveries: [],
      });
      expect(cancelledRes.activated).toBe(false);
      expect(cancelledRes.subscriptions).toHaveLength(0);

      // Intento exitoso
      const successRes = checkoutSubscriptionFromDraft({
        draft,
        outcome: "exitoso",
        subscriptions: [],
        payments: cancelledRes.payments,
        deliveries: [],
        fixedSubscriptionId: "sub_test_1",
      });
      expect(successRes.activated).toBe(true);
      expect(successRes.subscriptions).toHaveLength(1);
      expect(successRes.subscriptions[0].status).toBe("activa");
      expect(successRes.deliveries).toHaveLength(1);
      expect(successRes.deliveries[0].status).toBe("programada");
    });

    it("previene pagos duplicados mediante identificador único por ciclo (cycleId)", () => {
      const first = createSimulatedPaymentRecord({
        subscriptionId: "sub_100",
        cycleNumber: 1,
        amount: 95,
        periodDate: "2026-11-16",
        outcome: "exitoso",
        existingPayments: [],
      });
      expect(first.isDuplicate).toBe(false);
      expect(first.payment.cycleId).toBe(buildCycleId("sub_100", 1));

      const duplicateAttempt = createSimulatedPaymentRecord({
        subscriptionId: "sub_100",
        cycleNumber: 1,
        amount: 95,
        periodDate: "2026-11-16",
        outcome: "exitoso",
        existingPayments: [first.payment],
      });
      expect(duplicateAttempt.isDuplicate).toBe(true);
      expect(duplicateAttempt.payment.id).toBe(first.payment.id);
    });
  });

  describe("5. Renovaciones, modificaciones y cancelaciones", () => {
    it("aplica cambios comerciales al siguiente ciclo respetando el importe ya registrado y procesa renovaciones sin duplicar", () => {
      const draft = createDefaultDraft();
      draft.shift = "tarde";
      draft.firstDeliveryDate = "2026-11-16";
      draft.customization.size = "pequeno"; // S/ 65
      draft.customization.frequency = "semanal"; // +7 días -> 2026-11-23
      draft.buyer = {
        fullName: "Carlos Quispe",
        email: "carlos@ejemplo.pe",
        phone: "987654321",
        address: "Jr. Las Magnolias 220, Miraflores",
      };

      const initial = checkoutSubscriptionFromDraft({
        draft,
        outcome: "exitoso",
        subscriptions: [],
        payments: [],
        deliveries: [],
        fixedSubscriptionId: "sub_ren_1",
      });

      expect(initial.subscriptions[0].pricePerDelivery).toBe(65);
      expect(initial.subscriptions[0].nextBillingDate).toBe("2026-11-23");

      // Programar cambio comercial a tamaño grande (S/ 135) + rosas (+S/ 28) = S/ 163
      const modRes = scheduleCommercialModification({
        subscriptionId: "sub_ren_1",
        subscriptions: initial.subscriptions,
        newConfig: {
          size: "grande",
          flowerType: "rosas",
          colorPalette: "intensos",
          frequency: "quincenal",
          addons: [],
        },
      });
      expect(modRes.success).toBe(true);
      // El importe del ciclo 1 sigue siendo 65
      expect(modRes.subscriptions[0].pricePerDelivery).toBe(65);
      expect(
        modRes.subscriptions[0].pendingCommercialChanges?.pricePerDelivery
      ).toBe(163);

      // Al llegar el 2026-11-23 se procesa la renovación del ciclo #2 con el nuevo importe
      const renewal1 = processDueRenewals({
        subscriptions: modRes.subscriptions,
        payments: initial.payments,
        deliveries: initial.deliveries,
        currentLimaDate: "2026-11-23",
      });
      expect(renewal1.processedCount).toBe(1);
      expect(renewal1.subscriptions[0].currentCycle).toBe(2);
      expect(renewal1.subscriptions[0].pricePerDelivery).toBe(163);
      expect(renewal1.subscriptions[0].pendingCommercialChanges).toBeUndefined();
      expect(renewal1.payments).toHaveLength(2);
      expect(renewal1.Deliveries ?? renewal1.deliveries).toHaveLength(2);

      // Si se vuelve a ejecutar en la misma fecha, no duplica pagos ni entregas
      const renewalDuplicateCheck = processDueRenewals({
        subscriptions: renewal1.subscriptions,
        payments: renewal1.payments,
        deliveries: renewal1.deliveries,
        currentLimaDate: "2026-11-23",
      });
      expect(renewalDuplicateCheck.processedCount).toBe(0);
      expect(renewalDuplicateCheck.payments).toHaveLength(2);
    });

    it("permite modificar dirección/turno y al cancelar detiene renovaciones, conserva historial y respeta entregas pagadas", () => {
      const draft = createDefaultDraft();
      draft.shift = "manana";
      draft.firstDeliveryDate = "2026-11-16";
      draft.buyer = {
        fullName: "Lucía Paredes",
        email: "lucia@ejemplo.pe",
        phone: "987654321",
        address: "Calle Los Pinos 101, San Borja",
      };

      const created = checkoutSubscriptionFromDraft({
        draft,
        outcome: "exitoso",
        subscriptions: [],
        payments: [],
        deliveries: [],
        fixedSubscriptionId: "sub_cancel_1",
      });

      // Modificar turno y dirección
      const opUpdate = updateOperationalDetails({
        subscriptionId: "sub_cancel_1",
        subscriptions: created.subscriptions,
        deliveries: created.deliveries,
        updates: {
          shift: "tarde",
          recipientName: "Lucía Paredes",
          deliveryAddress: "Av. Arequipa 4500, Miraflores",
        },
      });
      expect(opUpdate.success).toBe(true);
      expect(opUpdate.deliveries[0].shift).toBe("tarde");
      expect(opUpdate.deliveries[0].deliveryAddress).toBe(
        "Av. Arequipa 4500, Miraflores"
      );

      // Cancelar suscripción
      const cancelled = cancelSubscription({
        subscriptionId: "sub_cancel_1",
        reason: "Motivo de prueba",
        subscriptions: opUpdate.subscriptions,
        deliveries: opUpdate.deliveries,
      });
      expect(cancelled.success).toBe(true);
      expect(cancelled.subscriptions[0].status).toBe("cancelada");
      // La entrega ya pagada sigue programada
      expect(cancelled.deliveries[0].status).toBe("programada");

      // Intentar modificar una suscripción cancelada está restringido
      const blockedMod = scheduleCommercialModification({
        subscriptionId: "sub_cancel_1",
        subscriptions: cancelled.subscriptions,
        newConfig: {
          size: "grande",
          flowerType: "temporada",
          colorPalette: "pastel",
          frequency: "mensual",
          addons: [],
        },
      });
      expect(blockedMod.success).toBe(false);

      // No se renueva aunque avance la fecha
      const afterCancelRenewal = processDueRenewals({
        subscriptions: cancelled.subscriptions,
        payments: created.payments,
        deliveries: cancelled.deliveries,
        currentLimaDate: addDaysISO("2026-11-16", 40),
      });
      expect(afterCancelRenewal.processedCount).toBe(0);

      // En modo demostración verificable, al marcar la entrega como entregada, la suscripción cancelada pasa a finalizada
      const demoDelivered = markDeliveryDeliveredInDemoMode({
        deliveryId: cancelled.deliveries[0].id,
        subscriptions: cancelled.subscriptions,
        deliveries: cancelled.deliveries,
      });
      expect(demoDelivered.success).toBe(true);
      expect(demoDelivered.deliveries[0].status).toBe("entregada");
      expect(demoDelivered.subscriptions[0].status).toBe("finalizada");
    });
  });
});
