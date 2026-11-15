"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  Flower2,
  Gift,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import {
  ADDON_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  DELIVERY_SHIFTS,
  FLORAL_PLANS,
  FLOWER_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  SIZE_OPTIONS,
} from "@/config/catalog";
import { formatPEN, PLAN_TO_SIZE, SIZE_TO_PLAN } from "@/config/pricing";
import {
  addDaysISO,
  formatDateHuman,
  formatDateShort,
  getLimaDateString,
  getMaxFirstDeliveryDate,
  getMinFirstDeliveryDate,
  getProjectedDeliveryDates,
} from "@/lib/calendar";
import { SimulatedCheckoutOutcome } from "@/lib/payments";
import {
  calculatePriceBreakdown,
  getColorPaletteLabel,
  getFlowerTypeLabel,
  getFrequencyIntervalLabel,
  getFrequencyLabel,
  getPlanLabel,
  getShiftLabel,
  getSizeLabel,
} from "@/lib/pricing";
import {
  formatCardNumber,
  formatExpiryDate,
  MAX_DEDICATION_LENGTH,
  validateBuyerInfo,
  validateCardPaymentInput,
  validateDedication,
  validateRecipientInfo,
  validateStepDelivery,
  validateStepRecipientAndBuyer,
  ValidationErrors,
} from "@/lib/validation";
import {
  AddonId,
  ArrangementSize,
  BuyerInfo,
  CardPaymentInput,
  CardType,
  ClientUser,
  ColorPalette,
  DeliveryShift,
  FlowerType,
  PlanId,
  RecipientInfo,
  SimulatedPayment,
  Subscription,
  SubscriptionDraft,
  SubscriptionFrequency,
  SubscriptionModality,
} from "@/types/domain";
import { BotanicalIllustration } from "@/components/ui/BotanicalIllustration";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DynamicSummaryCard } from "./DynamicSummaryCard";

interface SubscriptionWizardProps {
  currentUser?: ClientUser | null;
  draft: SubscriptionDraft;
  onUpdateDraft: (updater: (prev: SubscriptionDraft) => SubscriptionDraft) => void;
  onExecuteCheckout: (
    outcome: SimulatedCheckoutOutcome,
    paymentMethodSummary?: string
  ) => Promise<{
    activated: boolean;
    subscription?: Subscription;
    payment: SimulatedPayment;
    message: string;
  }>;
  onResetDraft: () => void;
  onGoToMySubscriptions: () => void;
}

const WIZARD_STEPS = [
  { number: 1, label: "Seleccionar plan" },
  { number: 2, label: "Personalizar" },
  { number: 3, label: "Destinatario" },
  { number: 4, label: "Entrega" },
  { number: 5, label: "Resumen" },
  { number: 6, label: "Pago con tarjeta" },
  { number: 7, label: "Confirmación" },
];

export function SubscriptionWizard({
  currentUser,
  draft,
  onUpdateDraft,
  onExecuteCheckout,
  onResetDraft,
  onGoToMySubscriptions,
}: SubscriptionWizardProps) {
  const [liveFeedback, setLiveFeedback] = useState<string>("");
  const [buyerErrors, setBuyerErrors] = useState<ValidationErrors<keyof BuyerInfo>>({});
  const [recipientErrors, setRecipientErrors] = useState<
    ValidationErrors<keyof RecipientInfo>
  >({});
  const [dedicationError, setDedicationError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [shiftError, setShiftError] = useState<string | undefined>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Estado del formulario de tarjeta de crédito o débito (Paso 6)
  const [cardData, setCardData] = useState<CardPaymentInput>({
    cardType: "credito",
    cardNumber: "",
    cardHolder: currentUser?.fullName || draft.buyer.fullName || "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<
    ValidationErrors<keyof CardPaymentInput>
  >({});

  const [confirmedSubscription, setConfirmedSubscription] =
    useState<Subscription | null>(null);

  const todayLima = getLimaDateString();
  const minDate = getMinFirstDeliveryDate(todayLima);
  const maxDate = getMaxFirstDeliveryDate(todayLima);

  const announce = (msg: string) => {
    setLiveFeedback(msg);
  };

  const goToStep = (targetStep: number, feedbackMsg?: string) => {
    if (targetStep === 6 && !cardData.cardHolder && draft.buyer.fullName) {
      setCardData((prev) => ({
        ...prev,
        cardHolder: draft.buyer.fullName,
      }));
    }
    onUpdateDraft((prev) => ({ ...prev, step: targetStep }));
    if (feedbackMsg) announce(feedbackMsg);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handlers de Paso 1 y 2
  const handleSelectPlan = (planId: PlanId) => {
    const newSize = PLAN_TO_SIZE[planId];
    const newBreakdown = calculatePriceBreakdown({
      ...draft.customization,
      size: newSize,
    });
    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        planId,
        size: newSize,
      },
    }));
    announce(
      `Seleccionaste ${getPlanLabel(planId)}. El precio de tu suscripción se actualizó a ${formatPEN(newBreakdown.pricePerDelivery)} por entrega.`
    );
  };

  const handleSelectSize = (size: ArrangementSize) => {
    const newPlanId = SIZE_TO_PLAN[size];
    const newBreakdown = calculatePriceBreakdown({
      ...draft.customization,
      size,
    });
    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        size,
        planId: newPlanId,
      },
    }));
    announce(
      `Cambiaste el tamaño a ${getSizeLabel(size)}. El precio de tu suscripción se actualizó a ${formatPEN(newBreakdown.pricePerDelivery)} por entrega.`
    );
  };

  const handleSelectFlowerType = (flowerType: FlowerType) => {
    const newBreakdown = calculatePriceBreakdown({
      ...draft.customization,
      flowerType,
    });
    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        flowerType,
      },
    }));
    announce(
      `Seleccionaste ${getFlowerTypeLabel(flowerType)}. El precio de tu suscripción se actualizó a ${formatPEN(newBreakdown.pricePerDelivery)} por entrega.`
    );
  };

  const handleSelectColorPalette = (colorPalette: ColorPalette) => {
    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        colorPalette,
      },
    }));
    announce(`Paleta de colores actualizada a ${getColorPaletteLabel(colorPalette)}.`);
  };

  const handleSelectFrequency = (frequency: SubscriptionFrequency) => {
    const newBreakdown = calculatePriceBreakdown({
      ...draft.customization,
      frequency,
    });
    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        frequency,
      },
    }));
    announce(
      `Frecuencia cambiada a ${getFrequencyLabel(frequency)} (${getFrequencyIntervalLabel(frequency)}). Estimación mensual aproximada: ${formatPEN(newBreakdown.estimatedMonthlyPrice)}.`
    );
  };

  const handleToggleAddon = (addonId: AddonId) => {
    const exists = draft.customization.addons.includes(addonId);
    const nextAddons = exists
      ? draft.customization.addons.filter((a) => a !== addonId)
      : [...draft.customization.addons, addonId];

    const newBreakdown = calculatePriceBreakdown({
      ...draft.customization,
      addons: nextAddons,
    });

    onUpdateDraft((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        addons: nextAddons,
      },
    }));

    announce(
      `${exists ? "Quitaste" : "Agregaste"} el complemento. El precio de tu suscripción se actualizó a ${formatPEN(newBreakdown.pricePerDelivery)} por entrega.`
    );
  };

  const handleContinueFromPersonalize = () => {
    const dedErr = validateDedication(draft.customization.dedication);
    if (dedErr) {
      setDedicationError(dedErr);
      announce(dedErr);
      return;
    }
    setDedicationError(undefined);
    goToStep(3, "Avanzaste al paso 3: Datos del comprador y destinatario.");
  };

  // Handlers de Paso 3
  const handleSelectModality = (modality: SubscriptionModality) => {
    onUpdateDraft((prev) => ({ ...prev, modality }));
    setRecipientErrors({});
    announce(
      modality === "regalo"
        ? "Elegiste Para regalar. Se habilitaron los campos del destinatario."
        : "Elegiste Para mí mismo. La entrega se realizará en tu dirección de comprador."
    );
  };

  const handleFillAccountData = () => {
    onUpdateDraft((prev) => ({
      ...prev,
      buyer: {
        fullName: currentUser?.fullName || "Valeria Mendoza Ríos",
        email: currentUser?.email || "valeria@flores.pe",
        phone: currentUser?.phone || "987654321",
        address:
          currentUser?.address ||
          "Av. Primavera 1420, Dpto. 402, Santiago de Surco",
        reference:
          currentUser?.reference ||
          "Frente al parque, edificio de ladrillo visto",
      },
    }));
    setBuyerErrors({});
    announce("Se cargaron los datos de tu cuenta de cliente.");
  };

  const handleContinueFromRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStepRecipientAndBuyer(
      draft.modality,
      draft.buyer,
      draft.recipient
    );
    setBuyerErrors(validation.buyerErrors);
    setRecipientErrors(validation.recipientErrors);

    if (!validation.valid) {
      const firstBuyerErr = Object.values(validation.buyerErrors)[0];
      const firstRecipErr = Object.values(validation.recipientErrors)[0];
      announce(
        firstBuyerErr ||
          firstRecipErr ||
          "Revisa los campos obligatorios marcados antes de continuar."
      );
      return;
    }

    goToStep(4, "Datos validados correctamente. Avanzaste al paso 4: Fecha y turno de entrega.");
  };

  // Handlers de Paso 4
  const handleSelectDate = (dateStr: string) => {
    onUpdateDraft((prev) => ({ ...prev, firstDeliveryDate: dateStr }));
    const check = validateStepDelivery(dateStr, draft.shift, todayLima);
    setDateError(check.dateError);
    if (!check.dateError) {
      announce(`Has seleccionado la primera fecha de entrega: ${formatDateHuman(dateStr)}.`);
    } else {
      announce(check.dateError);
    }
  };

  const handleSelectShift = (shift: DeliveryShift) => {
    onUpdateDraft((prev) => ({ ...prev, shift }));
    setShiftError(undefined);
    announce(
      shift === "manana"
        ? "Has seleccionado el turno de mañana (9:00 a. m. a 1:00 p. m.)."
        : "Has seleccionado el turno de tarde (3:00 p. m. a 6:00 p. m.)."
    );
  };

  const handleContinueFromDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateStepDelivery(
      draft.firstDeliveryDate,
      draft.shift,
      todayLima
    );
    setDateError(check.dateError);
    setShiftError(check.shiftError);

    if (!check.valid) {
      announce(
        check.shiftError ||
          check.dateError ||
          "Completa la fecha y el turno de entrega para continuar."
      );
      return;
    }

    goToStep(5, "Fecha y turno confirmados. Avanzaste al paso 5: Resumen de suscripción.");
  };

  // Handler de Paso 6: Pago con tarjeta de crédito o débito (automáticamente exitoso)
  const handleCardPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingPayment) return;

    const errors = validateCardPaymentInput(cardData);
    setCardErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErr = Object.values(errors)[0];
      announce(
        firstErr || "Completa los datos de tu tarjeta para procesar el pago."
      );
      return;
    }

    setIsProcessingPayment(true);
    announce("Procesando pago con tarjeta...");

    try {
      const last4 = cardData.cardNumber.replace(/\D/g, "").slice(-4);
      const typeLabel =
        cardData.cardType === "credito"
          ? "Tarjeta de Crédito"
          : "Tarjeta de Débito";
      const paymentMethodSummary = `${typeLabel} •••• ${last4}`;

      const result = await onExecuteCheckout("exitoso", paymentMethodSummary);
      announce(result.message);

      if (result.activated && result.subscription) {
        setConfirmedSubscription(result.subscription);
        goToStep(7, result.message);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const breakdown = calculatePriceBreakdown(draft.customization);
  const projectedDates = getProjectedDeliveryDates(
    draft.firstDeliveryDate,
    draft.customization.frequency,
    3
  );

  const quickDates = Array.from({ length: 6 }, (_, idx) =>
    addDaysISO(minDate, idx)
  );

  return (
    <div className="space-y-8">
      {/* Región ARIA-LIVE para anunciar cambios relevantes a lectores de pantalla */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="live-region-announcer"
      >
        {liveFeedback}
      </div>

      {/* Barra de progreso del flujo de contratación */}
      <nav
        aria-label="Pasos del proceso de contratación"
        className="rounded-2xl border border-cream-border bg-cream-ivory p-4 shadow-2xs"
      >
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {WIZARD_STEPS.map((s) => {
            const isCurrent = draft.step === s.number;
            const isCompleted = draft.step > s.number;
            const canClickJump =
              s.number < draft.step && draft.step < 7;

            return (
              <li key={s.number} className="flex">
                <button
                  type="button"
                  disabled={!canClickJump}
                  onClick={() => {
                    if (canClickJump) {
                      goToStep(s.number, `Volviste al paso ${s.number}: ${s.label}.`);
                    }
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                    isCurrent
                      ? "border-2 border-rose-deep bg-rose-soft font-bold text-rose-dark"
                      : isCompleted
                        ? "cursor-pointer border-sage/40 bg-sage-light text-sage-deep hover:bg-sage-soft"
                        : "cursor-default border-cream-border bg-cream text-charcoal-muted opacity-80"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-rose-dark text-cream-ivory"
                        : isCompleted
                          ? "bg-sage-deep text-cream-ivory"
                          : "bg-cream-border text-charcoal"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      s.number
                    )}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Banner de retroalimentación visible */}
      {liveFeedback && draft.step < 7 && (
        <div
          className="flex items-center gap-2.5 rounded-xl border border-sage/40 bg-sage-light px-4 py-2.5 text-xs font-medium text-sage-deep"
          data-testid="visible-feedback-banner"
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{liveFeedback}</span>
        </div>
      )}

      {/* Contenedor principal en grilla */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className={draft.step === 7 ? "lg:col-span-12" : "lg:col-span-8"}>
          {/* =========================================================
              PASO 1: SELECCIONAR PLAN
          ========================================================= */}
          {draft.step === 1 && (
            <section
              aria-labelledby="step1-heading"
              className="rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-cream-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                  Paso 1 de 7 · Catálogo de planes
                </span>
                <h2
                  id="step1-heading"
                  className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                >
                  Selecciona tu plan floral base
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Elige la escala inicial de tu arreglo (Brote, Floración o
                  Jardín). En el siguiente paso podrás personalizar flores,
                  colores, frecuencia y complementos.
                </p>
              </div>

              <div
                role="group"
                aria-label="Planes florales disponibles"
                className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                {FLORAL_PLANS.map((plan) => {
                  const isSelected = draft.customization.planId === plan.id;
                  const basePrice =
                    SIZE_OPTIONS.find((s) => s.id === plan.defaultSize)?.price ??
                    65;

                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-5 transition ${
                        isSelected
                          ? "border-rose-deep bg-rose-pastel shadow-md ring-2 ring-rose-deep/20"
                          : "border-cream-border bg-cream hover:border-rose-dusty"
                      }`}
                    >
                      <div>
                        <div className="relative mb-4 overflow-hidden rounded-xl border border-cream-border">
                          <BotanicalIllustration
                            variant={plan.id}
                            alt={plan.imageAlt}
                            className="h-36 w-full object-cover"
                          />
                          {plan.badge && (
                            <span className="absolute top-2 right-2 rounded-full bg-rose-dark px-2.5 py-0.5 text-xs font-semibold text-cream-ivory">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-xl font-bold text-charcoal">
                            {plan.name}
                          </h3>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-deep bg-cream-ivory px-2.5 py-0.5 text-xs font-bold text-rose-dark">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Elegido</span>
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-semibold text-rose-dark">
                          {plan.tagline}
                        </p>

                        <p className="mt-2 font-serif text-2xl font-bold text-charcoal">
                          {formatPEN(basePrice)}{" "}
                          <span className="font-sans text-xs font-normal text-charcoal-muted">
                            base / entrega
                          </span>
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-charcoal-muted">
                          {plan.description}
                        </p>

                        <ul className="mt-3 space-y-1.5 border-t border-cream-border pt-3 text-xs text-charcoal">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-1.5">
                              <Check
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep"
                                aria-hidden="true"
                              />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep ${
                          isSelected
                            ? "border-2 border-rose-dark bg-rose-dark text-cream-ivory"
                            : "border-2 border-charcoal/20 bg-cream-ivory text-charcoal hover:border-rose-deep hover:bg-rose-soft"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            <span>{plan.name} seleccionado</span>
                          </>
                        ) : (
                          <span>Seleccionar {plan.name}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end border-t border-cream-border pt-5">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(
                      2,
                      "Avanzaste al paso 2: Personalización de tu arreglo floral."
                    )
                  }
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
                >
                  <span>Personalizar mi arreglo</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {/* =========================================================
              PASO 2: PERSONALIZAR ARREGLO Y FRECUENCIA
          ========================================================= */}
          {draft.step === 2 && (
            <section
              aria-labelledby="step2-heading"
              className="space-y-8 rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-cream-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                  Paso 2 de 7 · Configurador floral
                </span>
                <h2
                  id="step2-heading"
                  className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                >
                  Personaliza tus flores, frecuencia y complementos
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Define cómo se compondrá cada entrega. Cada cambio actualiza
                  instantáneamente el precio en el resumen dinámico.
                </p>
              </div>

              {/* 2.1 Tamaño del arreglo */}
              <fieldset className="space-y-3">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  1. Tamaño del arreglo (vinculado a tu plan)
                </legend>
                <p className="text-xs text-charcoal-muted">
                  Al cambiar el tamaño se actualiza automáticamente la categoría
                  de tu plan y el costo base.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {SIZE_OPTIONS.map((option) => {
                    const isSelected = draft.customization.size === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectSize(option.id)}
                        className={`flex min-h-[44px] flex-col justify-between rounded-xl border-2 p-4 text-left transition ${
                          isSelected
                            ? "border-rose-deep bg-rose-pastel ring-2 ring-rose-deep/20"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-charcoal">
                              {option.name}
                            </span>
                            {isSelected && (
                              <Check
                                className="h-4 w-4 shrink-0 text-rose-dark"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-charcoal-muted">
                            {option.stems} · {option.dimensions}
                          </p>
                        </div>
                        <p className="mt-3 font-serif text-lg font-bold text-rose-dark">
                          {formatPEN(option.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2.2 Tipo de flores */}
              <fieldset className="space-y-3 border-t border-cream-border pt-6">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  2. Tipo de flores
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {FLOWER_TYPE_OPTIONS.map((flower) => {
                    const isSelected =
                      draft.customization.flowerType === flower.id;
                    return (
                      <button
                        key={flower.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectFlowerType(flower.id)}
                        className={`flex min-h-[44px] flex-col justify-between rounded-xl border-2 p-4 text-left transition ${
                          isSelected
                            ? "border-rose-deep bg-rose-pastel ring-2 ring-rose-deep/20"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-charcoal">
                              {flower.name}
                            </span>
                            <span className="rounded-full border border-rose-dusty/40 bg-cream-ivory px-2.5 py-0.5 text-xs font-bold text-rose-dark">
                              {flower.price === 0
                                ? "Incluido (S/ 0.00)"
                                : `+${formatPEN(flower.price)}`}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-charcoal-muted">
                            {flower.description}
                          </p>
                          <p className="mt-1 text-xs font-medium text-charcoal">
                            Ejemplos: {flower.examples}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2.3 Paleta de colores */}
              <fieldset className="space-y-3 border-t border-cream-border pt-6">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  3. Paleta de colores
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {COLOR_PALETTE_OPTIONS.map((palette) => {
                    const isSelected =
                      draft.customization.colorPalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectColorPalette(palette.id)}
                        className={`flex min-h-[44px] flex-col justify-between rounded-xl border-2 p-4 text-left transition ${
                          isSelected
                            ? "border-rose-deep bg-rose-pastel ring-2 ring-rose-deep/20"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-charcoal">
                              {palette.name}
                            </span>
                            <span className="text-xs font-semibold text-rose-dark">
                              {palette.patternLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-charcoal-muted">
                            {palette.description}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          {palette.swatchColors.map((hex, i) => (
                            <span
                              key={i}
                              aria-hidden="true"
                              style={{ backgroundColor: hex }}
                              className="h-5 w-5 rounded-full border border-charcoal/30 shadow-2xs"
                            />
                          ))}
                          {isSelected && (
                            <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-rose-dark">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2.4 Frecuencia de entrega */}
              <fieldset className="space-y-3 border-t border-cream-border pt-6">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  4. Frecuencia de entrega y renovación
                </legend>
                <p className="text-xs text-charcoal-muted">
                  Cada ciclo corresponde a una entrega. Elige cada cuánto tiempo
                  deseas recibir y renovar tu arreglo.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {FREQUENCY_OPTIONS.map((freq) => {
                    const isSelected =
                      draft.customization.frequency === freq.id;
                    return (
                      <button
                        key={freq.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectFrequency(freq.id)}
                        className={`flex min-h-[44px] flex-col justify-between rounded-xl border-2 p-4 text-left transition ${
                          isSelected
                            ? "border-sage-deep bg-sage-light ring-2 ring-sage/30"
                            : "border-cream-border bg-cream hover:border-sage"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-charcoal">
                              {freq.name}
                            </span>
                            {isSelected && (
                              <Check
                                className="h-4 w-4 text-sage-deep"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className="mt-0.5 inline-block text-xs font-bold text-sage-deep">
                            {freq.intervalLabel}
                          </span>
                          <p className="mt-1.5 text-xs text-charcoal-muted">
                            {freq.cycleDescription}
                          </p>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-charcoal">
                          Aprox. {freq.deliveriesPerMonthEstimate}{" "}
                          {freq.deliveriesPerMonthEstimate === 1
                            ? "entrega al mes"
                            : "entregas al mes"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2.5 Complementos opcionales */}
              <fieldset className="space-y-3 border-t border-cream-border pt-6">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  5. Complementos opcionales (puedes elegir varios)
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {ADDON_OPTIONS.map((addon) => {
                    const isChecked = draft.customization.addons.includes(
                      addon.id
                    );
                    return (
                      <label
                        key={addon.id}
                        className={`flex min-h-[44px] cursor-pointer flex-col justify-between rounded-xl border-2 p-4 transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-rose-deep ${
                          isChecked
                            ? "border-rose-deep bg-rose-pastel"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-charcoal">
                              {addon.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAddon(addon.id)}
                              className="mt-0.5 h-5 w-5 rounded border-charcoal text-rose-dark focus:ring-rose-deep"
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-charcoal-muted">
                            {addon.description}
                          </p>
                        </div>
                        <span className="mt-3 inline-block font-serif text-sm font-bold text-rose-dark">
                          +{formatPEN(addon.price)} por entrega
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* 2.6 Dedicatoria opcional */}
              <div className="border-t border-cream-border pt-6">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="dedicatoria-input"
                    className="font-serif text-lg font-bold text-charcoal"
                  >
                    6. Dedicatoria opcional para acompañar tus flores
                  </label>
                  <span
                    id="dedicatoria-counter"
                    className={`text-xs font-semibold ${
                      draft.customization.dedication.length >
                      MAX_DEDICATION_LENGTH
                        ? "text-red-800"
                        : "text-charcoal-muted"
                    }`}
                  >
                    {draft.customization.dedication.length} /{" "}
                    {MAX_DEDICATION_LENGTH} caracteres
                  </span>
                </div>
                <p
                  id="dedicatoria-help"
                  className="mt-1 text-xs text-charcoal-muted"
                >
                  Si deseas incluir un mensaje escrito, escríbelo aquí (máximo{" "}
                  {MAX_DEDICATION_LENGTH} caracteres).
                </p>
                <textarea
                  id="dedicatoria-input"
                  rows={3}
                  maxLength={MAX_DEDICATION_LENGTH}
                  value={draft.customization.dedication}
                  aria-describedby="dedicatoria-help dedicatoria-counter"
                  aria-invalid={!!dedicationError}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateDraft((prev) => ({
                      ...prev,
                      customization: {
                        ...prev.customization,
                        dedication: val,
                      },
                    }));
                    setDedicationError(validateDedication(val));
                  }}
                  placeholder="Ej.: Que estas flores iluminen tu semana con mucha alegría..."
                  className="mt-2 w-full rounded-xl border-2 border-cream-border bg-cream px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
                />
                {dedicationError && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-800"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{dedicationError}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-cream-border pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(1, "Volviste al paso 1: Selección de plan.")
                  }
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Volver a planes</span>
                </button>

                <button
                  type="button"
                  onClick={handleContinueFromPersonalize}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
                >
                  <span>Continuar a destinatario</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {/* =========================================================
              PASO 3: DESTINATARIO Y DATOS DEL COMPRADOR
          ========================================================= */}
          {draft.step === 3 && (
            <form
              noValidate
              onSubmit={handleContinueFromRecipient}
              aria-labelledby="step3-heading"
              className="space-y-8 rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-cream-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                    Paso 3 de 7 · Comprador y Destinatario
                  </span>
                  <h2
                    id="step3-heading"
                    className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                  >
                    ¿Para quién es esta suscripción floral?
                  </h2>
                  <p className="mt-1 text-sm text-charcoal-muted">
                    Confirma tus datos de contacto como titular y define si
                    recibirás las flores tú mismo o si serán enviadas como
                    regalo a otra persona.
                  </p>
                </div>

                {currentUser && (
                  <button
                    type="button"
                    onClick={handleFillAccountData}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-sage bg-sage-light px-3.5 py-2 text-xs font-semibold text-sage-deep transition hover:bg-sage-soft"
                  >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Usar datos de mi cuenta</span>
                  </button>
                )}
              </div>

              {/* Selección de modalidad */}
              <fieldset className="space-y-3">
                <legend className="font-serif text-lg font-bold text-charcoal">
                  1. Elige la modalidad de tu suscripción
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={draft.modality === "propio"}
                    onClick={() => handleSelectModality("propio")}
                    className={`flex min-h-[56px] items-start gap-3.5 rounded-xl border-2 p-4 text-left transition ${
                      draft.modality === "propio"
                        ? "border-sage-deep bg-sage-light ring-2 ring-sage/20"
                        : "border-cream-border bg-cream hover:border-sage"
                    }`}
                  >
                    <User
                      className="mt-0.5 h-6 w-6 shrink-0 text-sage-deep"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="block font-serif text-base font-bold text-charcoal">
                        Para mí mismo
                      </span>
                      <span className="mt-0.5 block text-xs text-charcoal-muted">
                        Recibiré los arreglos florales en mi propia dirección.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    aria-pressed={draft.modality === "regalo"}
                    onClick={() => handleSelectModality("regalo")}
                    className={`flex min-h-[56px] items-start gap-3.5 rounded-xl border-2 p-4 text-left transition ${
                      draft.modality === "regalo"
                        ? "border-rose-deep bg-rose-pastel ring-2 ring-rose-deep/20"
                        : "border-cream-border bg-cream hover:border-rose-dusty"
                    }`}
                  >
                    <Gift
                      className="mt-0.5 h-6 w-6 shrink-0 text-rose-dark"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="block font-serif text-base font-bold text-charcoal">
                        Para regalar a otra persona
                      </span>
                      <span className="mt-0.5 block text-xs text-charcoal-muted">
                        Enviaré la suscripción a un destinatario distinto.
                      </span>
                    </div>
                  </button>
                </div>
              </fieldset>

              {/* Datos del comprador (Titular) */}
              <fieldset className="space-y-4 rounded-2xl border border-cream-border bg-cream p-5">
                <legend className="px-2 font-serif text-lg font-bold text-charcoal">
                  2. Tus datos como comprador{" "}
                  {draft.modality === "propio" && "(y lugar de entrega)"}
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="buyer-fullName"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Nombre y apellido completo{" "}
                      <span className="text-rose-dark" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="buyer-fullName"
                      type="text"
                      required
                      value={draft.buyer.fullName}
                      aria-invalid={!!buyerErrors.fullName}
                      aria-describedby={
                        buyerErrors.fullName ? "buyer-fullName-error" : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateDraft((prev) => ({
                          ...prev,
                          buyer: { ...prev.buyer, fullName: val },
                        }));
                        if (buyerErrors.fullName) {
                          setBuyerErrors((prev) => ({
                            ...prev,
                            fullName: validateBuyerInfo({
                              ...draft.buyer,
                              fullName: val,
                            }).fullName,
                          }));
                        }
                      }}
                      placeholder="Ej.: Valeria Mendoza Ríos"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {buyerErrors.fullName && (
                      <p
                        id="buyer-fullName-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{buyerErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="buyer-email"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Correo electrónico{" "}
                      <span className="text-rose-dark" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="buyer-email"
                      type="email"
                      required
                      value={draft.buyer.email}
                      aria-invalid={!!buyerErrors.email}
                      aria-describedby={
                        buyerErrors.email ? "buyer-email-error" : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateDraft((prev) => ({
                          ...prev,
                          buyer: { ...prev.buyer, email: val },
                        }));
                        if (buyerErrors.email) {
                          setBuyerErrors((prev) => ({
                            ...prev,
                            email: validateBuyerInfo({
                              ...draft.buyer,
                              email: val,
                            }).email,
                          }));
                        }
                      }}
                      placeholder="nombre@dominio.com"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {buyerErrors.email && (
                      <p
                        id="buyer-email-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{buyerErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="buyer-phone"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Teléfono móvil (9 dígitos){" "}
                      <span className="text-rose-dark" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="buyer-phone"
                      type="tel"
                      required
                      value={draft.buyer.phone}
                      aria-invalid={!!buyerErrors.phone}
                      aria-describedby={
                        buyerErrors.phone ? "buyer-phone-error" : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateDraft((prev) => ({
                          ...prev,
                          buyer: { ...prev.buyer, phone: val },
                        }));
                        if (buyerErrors.phone) {
                          setBuyerErrors((prev) => ({
                            ...prev,
                            phone: validateBuyerInfo({
                              ...draft.buyer,
                              phone: val,
                            }).phone,
                          }));
                        }
                      }}
                      placeholder="Ej.: 987654321"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {buyerErrors.phone && (
                      <p
                        id="buyer-phone-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{buyerErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="buyer-address"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      {draft.modality === "propio"
                        ? "Dirección exacta de entrega"
                        : "Tu dirección de facturación/contacto"}{" "}
                      <span className="text-rose-dark" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="buyer-address"
                      type="text"
                      required
                      value={draft.buyer.address}
                      aria-invalid={!!buyerErrors.address}
                      aria-describedby={
                        buyerErrors.address ? "buyer-address-error" : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdateDraft((prev) => ({
                          ...prev,
                          buyer: { ...prev.buyer, address: val },
                        }));
                        if (buyerErrors.address) {
                          setBuyerErrors((prev) => ({
                            ...prev,
                            address: validateBuyerInfo({
                              ...draft.buyer,
                              address: val,
                            }).address,
                          }));
                        }
                      }}
                      placeholder="Av. / Calle, número, interior y distrito"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {buyerErrors.address && (
                      <p
                        id="buyer-address-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{buyerErrors.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="buyer-reference"
                    className="block text-sm font-semibold text-charcoal"
                  >
                    Referencia adicional (opcional)
                  </label>
                  <input
                    id="buyer-reference"
                    type="text"
                    value={draft.buyer.reference ?? ""}
                    onChange={(e) =>
                      onUpdateDraft((prev) => ({
                        ...prev,
                        buyer: { ...prev.buyer, reference: e.target.value },
                      }))
                    }
                    placeholder="Ej.: Edificio frente al parque, dejar en recepción"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                  />
                </div>
              </fieldset>

              {/* Datos condicionales del Destinatario si eligió "Para regalar" */}
              {draft.modality === "regalo" && (
                <fieldset
                  data-testid="recipient-fieldset"
                  className="space-y-4 rounded-2xl border-2 border-rose-deep/50 bg-rose-pastel/60 p-5"
                >
                  <legend className="px-2 font-serif text-lg font-bold text-rose-dark">
                    3. Datos de la persona que recibirá el regalo
                  </legend>
                  <p className="text-xs text-charcoal-muted">
                    Separamos tus datos de comprador de los datos del
                    destinatario para entregar el arreglo directamente en su
                    domicilio sin mostrar importes.
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="recipient-fullName"
                        className="block text-sm font-semibold text-charcoal"
                      >
                        Nombre completo del destinatario{" "}
                        <span className="text-rose-dark" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="recipient-fullName"
                        type="text"
                        required
                        value={draft.recipient.fullName}
                        aria-invalid={!!recipientErrors.fullName}
                        aria-describedby={
                          recipientErrors.fullName
                            ? "recipient-fullName-error"
                            : undefined
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateDraft((prev) => ({
                            ...prev,
                            recipient: { ...prev.recipient, fullName: val },
                          }));
                          if (recipientErrors.fullName) {
                            setRecipientErrors((prev) => ({
                              ...prev,
                              fullName: validateRecipientInfo({
                                ...draft.recipient,
                                fullName: val,
                              }).fullName,
                            }));
                          }
                        }}
                        placeholder="Ej.: Elena Ríos de Mendoza"
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                      {recipientErrors.fullName && (
                        <p
                          id="recipient-fullName-error"
                          role="alert"
                          className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                        >
                          <AlertCircle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{recipientErrors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="recipient-phone"
                        className="block text-sm font-semibold text-charcoal"
                      >
                        Teléfono del destinatario{" "}
                        <span className="text-rose-dark" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="recipient-phone"
                        type="tel"
                        required
                        value={draft.recipient.phone}
                        aria-invalid={!!recipientErrors.phone}
                        aria-describedby={
                          recipientErrors.phone
                            ? "recipient-phone-error"
                            : undefined
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateDraft((prev) => ({
                            ...prev,
                            recipient: { ...prev.recipient, phone: val },
                          }));
                          if (recipientErrors.phone) {
                            setRecipientErrors((prev) => ({
                              ...prev,
                              phone: validateRecipientInfo({
                                ...draft.recipient,
                                phone: val,
                              }).phone,
                            }));
                          }
                        }}
                        placeholder="Ej.: 998877665"
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                      {recipientErrors.phone && (
                        <p
                          id="recipient-phone-error"
                          role="alert"
                          className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                        >
                          <AlertCircle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{recipientErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="recipient-address"
                        className="block text-sm font-semibold text-charcoal"
                      >
                        Dirección de entrega del destinatario{" "}
                        <span className="text-rose-dark" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="recipient-address"
                        type="text"
                        required
                        value={draft.recipient.address}
                        aria-invalid={!!recipientErrors.address}
                        aria-describedby={
                          recipientErrors.address
                            ? "recipient-address-error"
                            : undefined
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateDraft((prev) => ({
                            ...prev,
                            recipient: { ...prev.recipient, address: val },
                          }));
                          if (recipientErrors.address) {
                            setRecipientErrors((prev) => ({
                              ...prev,
                              address: validateRecipientInfo({
                                ...draft.recipient,
                                address: val,
                              }).address,
                            }));
                          }
                        }}
                        placeholder="Calle / Avenida, número, interior y distrito en Lima"
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                      {recipientErrors.address && (
                        <p
                          id="recipient-address-error"
                          role="alert"
                          className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                        >
                          <AlertCircle
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{recipientErrors.address}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="recipient-reference"
                        className="block text-sm font-semibold text-charcoal"
                      >
                        Referencia del domicilio (opcional)
                      </label>
                      <input
                        id="recipient-reference"
                        type="text"
                        value={draft.recipient.reference ?? ""}
                        onChange={(e) =>
                          onUpdateDraft((prev) => ({
                            ...prev,
                            recipient: {
                              ...prev.recipient,
                              reference: e.target.value,
                            },
                          }))
                        }
                        placeholder="Ej.: Casa de rejas blancas, tocar timbre 2"
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="recipient-relationship"
                        className="block text-sm font-semibold text-charcoal"
                      >
                        Parentesco o motivo especial (opcional)
                      </label>
                      <input
                        id="recipient-relationship"
                        type="text"
                        value={draft.recipient.relationship ?? ""}
                        onChange={(e) =>
                          onUpdateDraft((prev) => ({
                            ...prev,
                            recipient: {
                              ...prev.recipient,
                              relationship: e.target.value,
                            },
                          }))
                        }
                        placeholder="Ej.: Mamá, Pareja, Aniversario..."
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-cream-border pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(2, "Volviste al paso 2: Personalización.")
                  }
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Volver a personalización</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
                >
                  <span>Continuar a entrega</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================
              PASO 4: CALENDARIO Y TURNO DE ENTREGA
          ========================================================= */}
          {draft.step === 4 && (
            <form
              noValidate
              onSubmit={handleContinueFromDelivery}
              aria-labelledby="step4-heading"
              className="space-y-8 rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-cream-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                  Paso 4 de 7 · Programación en zona horaria America/Lima
                </span>
                <h2
                  id="step4-heading"
                  className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                >
                  Selecciona la fecha y el turno de entrega
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Elige cuándo recibirás tu primer arreglo y en qué rango
                  horario (Mañana o Tarde). El turno seleccionado se aplicará
                  también a tus entregas recurrentes.
                </p>
              </div>

              {/* Selección de Fecha */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="first-delivery-date"
                    className="block font-serif text-lg font-bold text-charcoal"
                  >
                    1. Primera fecha de entrega (desde mañana {formatDateShort(minDate)})
                  </label>
                  <p
                    id="date-constraint-help"
                    className="mt-1 text-xs text-charcoal-muted"
                  >
                    Las fechas pasadas y el día de hoy ({formatDateShort(todayLima)})
                    están bloqueados porque preparamos cada arreglo con al menos
                    24 horas de anticipación.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <input
                    id="first-delivery-date"
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={draft.firstDeliveryDate}
                    aria-describedby="date-constraint-help"
                    aria-invalid={!!dateError}
                    onChange={(e) => handleSelectDate(e.target.value)}
                    className="min-h-[48px] rounded-xl border-2 border-cream-border bg-cream px-4 py-2.5 text-base font-semibold text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
                  />
                  <span className="text-sm font-medium text-charcoal">
                    Fecha elegida:{" "}
                    <strong className="text-rose-dark">
                      {formatDateHuman(draft.firstDeliveryDate)}
                    </strong>
                  </span>
                </div>

                {/* Botones rápidos de fechas */}
                <div>
                  <span className="block text-xs font-semibold text-charcoal-muted">
                    Selección rápida de fechas cercanas (America/Lima):
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="flex min-h-[44px] cursor-not-allowed flex-col items-start justify-center rounded-xl border border-cream-border bg-cream-warm/60 px-3 py-2 text-left text-xs text-charcoal-muted opacity-60"
                    >
                      <span className="line-through">
                        {formatDateShort(addDaysISO(todayLima, -1))}
                      </span>
                      <span className="text-[11px] font-semibold text-red-800">
                        Fecha pasada (Bloqueada)
                      </span>
                    </button>

                    {quickDates.map((dStr) => {
                      const isSelected = draft.firstDeliveryDate === dStr;
                      return (
                        <button
                          key={dStr}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleSelectDate(dStr)}
                          className={`flex min-h-[44px] flex-col items-start justify-center rounded-xl border-2 px-3 py-2 text-left text-xs transition ${
                            isSelected
                              ? "border-rose-deep bg-rose-pastel font-bold text-rose-dark"
                              : "border-cream-border bg-cream text-charcoal hover:border-rose-dusty"
                          }`}
                        >
                          <span>{formatDateShort(dStr)}</span>
                          <span className="text-[11px] text-charcoal-muted">
                            {isSelected ? "Seleccionada" : "Disponible"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {dateError && (
                  <p
                    role="alert"
                    className="flex items-center gap-1.5 rounded-xl border border-red-700 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-900"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{dateError}</span>
                  </p>
                )}

                {/* Proyección de próximas entregas según la frecuencia */}
                {projectedDates.length > 0 && (
                  <div className="rounded-xl border border-sage/30 bg-sage-light/70 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-deep">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <span>
                        Proyección de tu calendario ({getFrequencyLabel(draft.customization.frequency)} ·{" "}
                        {getFrequencyIntervalLabel(draft.customization.frequency)})
                      </span>
                    </h3>
                    <ol className="mt-2.5 grid grid-cols-1 gap-2 text-xs text-charcoal sm:grid-cols-3">
                      {projectedDates.map((d, idx) => (
                        <li
                          key={d}
                          className="rounded-lg border border-sage/20 bg-cream-ivory px-3 py-2"
                        >
                          <span className="block font-bold text-sage-deep">
                            Ciclo #{idx + 1}{" "}
                            {idx === 0 ? "(1.ª entrega)" : "(Renovación)"}
                          </span>
                          <span>{formatDateHuman(d)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Selección de Turno */}
              <fieldset
                aria-invalid={!!shiftError}
                aria-describedby={shiftError ? "shift-error-msg" : undefined}
                className="space-y-3 border-t border-cream-border pt-6"
              >
                <legend className="font-serif text-lg font-bold text-charcoal">
                  2. Selecciona un único turno de entrega{" "}
                  <span className="text-rose-dark" aria-hidden="true">
                    *
                  </span>
                </legend>
                <p className="text-xs text-charcoal-muted">
                  El turno elegido se aplicará tanto a tu primera entrega como a
                  las renovaciones posteriores (puedes cambiarlo después desde
                  Mis Suscripciones).
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {DELIVERY_SHIFTS.map((shiftOption) => {
                    const isChecked = draft.shift === shiftOption.id;
                    return (
                      <label
                        key={shiftOption.id}
                        className={`flex min-h-[64px] cursor-pointer items-start gap-3.5 rounded-2xl border-2 p-4 transition focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-rose-deep ${
                          isChecked
                            ? "border-rose-deep bg-rose-pastel shadow-xs ring-2 ring-rose-deep/20"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery-shift"
                          value={shiftOption.id}
                          checked={isChecked}
                          onChange={() => handleSelectShift(shiftOption.id)}
                          className="mt-1 h-5 w-5 border-charcoal text-rose-dark focus:ring-rose-deep"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif text-base font-bold text-charcoal">
                              {shiftOption.name}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-dusty/40 bg-cream-ivory px-2.5 py-0.5 text-xs font-bold text-rose-dark">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>{shiftOption.schedule}</span>
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-charcoal-muted">
                            {shiftOption.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {shiftError && (
                  <p
                    id="shift-error-msg"
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-xs font-semibold text-red-900"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{shiftError}</span>
                  </p>
                )}
              </fieldset>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-cream-border pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(3, "Volviste al paso 3: Datos de comprador y destinatario.")
                  }
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Volver a destinatario</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
                >
                  <span>Revisar mi suscripción</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================
              PASO 5: RESUMEN ANTES DE PAGAR
          ========================================================= */}
          {draft.step === 5 && (
            <section
              aria-labelledby="step5-heading"
              className="space-y-6 rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-cream-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                  Paso 5 de 7 · Verificación previa al pago
                </span>
                <h2
                  id="step5-heading"
                  className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                >
                  Revisa los detalles de tu suscripción
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Verifica que toda tu configuración sea correcta antes de pasar
                  al pago con tarjeta. Si necesitas corregir algún dato, usa los
                  botones &ldquo;Modificar&rdquo; de cada bloque.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Bloque 1: Plan y personalización */}
                <div className="rounded-2xl border border-cream-border bg-cream p-5">
                  <div className="flex items-center justify-between border-b border-cream-border pb-3">
                    <h3 className="flex items-center gap-2 font-serif text-base font-bold text-charcoal">
                      <Flower2
                        className="h-4 w-4 text-rose-dark"
                        aria-hidden="true"
                      />
                      <span>Arreglo y frecuencia</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        goToStep(2, "Volviste al paso 2 para editar tu arreglo.")
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-dark underline-offset-4 hover:underline"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Modificar arreglo</span>
                    </button>
                  </div>
                  <dl className="mt-3 space-y-2 text-xs text-charcoal">
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Plan y tamaño:</dt>
                      <dd className="font-semibold">
                        {getPlanLabel(draft.customization.planId)} ·{" "}
                        {getSizeLabel(draft.customization.size)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Flores:</dt>
                      <dd className="font-semibold">
                        {getFlowerTypeLabel(draft.customization.flowerType)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Paleta:</dt>
                      <dd className="font-semibold">
                        {getColorPaletteLabel(draft.customization.colorPalette)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Frecuencia:</dt>
                      <dd className="font-semibold text-sage-deep">
                        {getFrequencyLabel(draft.customization.frequency)} (
                        {getFrequencyIntervalLabel(
                          draft.customization.frequency
                        )}
                        )
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Complementos:</dt>
                      <dd className="text-right font-semibold">
                        {breakdown.addonsDetail.length > 0
                          ? breakdown.addonsDetail.map((a) => a.name).join(", ")
                          : "Ninguno"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Bloque 2: Comprador y Destinatario */}
                <div className="rounded-2xl border border-cream-border bg-cream p-5">
                  <div className="flex items-center justify-between border-b border-cream-border pb-3">
                    <h3 className="flex items-center gap-2 font-serif text-base font-bold text-charcoal">
                      <User
                        className="h-4 w-4 text-sage-deep"
                        aria-hidden="true"
                      />
                      <span>Comprador y Destinatario</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        goToStep(
                          3,
                          "Volviste al paso 3 para editar los datos de destinatario."
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-dark underline-offset-4 hover:underline"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Modificar datos</span>
                    </button>
                  </div>
                  <dl className="mt-3 space-y-2 text-xs text-charcoal">
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Modalidad:</dt>
                      <dd className="font-semibold">
                        {draft.modality === "regalo"
                          ? "Para regalar"
                          : "Para mí mismo"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Comprador:</dt>
                      <dd className="font-semibold">
                        {draft.buyer.fullName} ({draft.buyer.email})
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-charcoal-muted">Recibe:</dt>
                      <dd className="font-semibold">
                        {draft.modality === "regalo"
                          ? draft.recipient.fullName
                          : draft.buyer.fullName}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-charcoal-muted">
                        Dirección de entrega:
                      </dt>
                      <dd className="text-right font-semibold">
                        {draft.modality === "regalo"
                          ? draft.recipient.address
                          : draft.buyer.address}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Bloque 3: Fecha y Turno */}
                <div className="rounded-2xl border border-cream-border bg-cream p-5 md:col-span-2">
                  <div className="flex items-center justify-between border-b border-cream-border pb-3">
                    <h3 className="flex items-center gap-2 font-serif text-base font-bold text-charcoal">
                      <Clock
                        className="h-4 w-4 text-rose-dark"
                        aria-hidden="true"
                      />
                      <span>Fecha y turno de entrega (America/Lima)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        goToStep(
                          4,
                          "Volviste al paso 4 para editar la fecha o el turno."
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-dark underline-offset-4 hover:underline"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Modificar horario</span>
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                    <div>
                      <span className="block text-charcoal-muted">
                        Primera entrega:
                      </span>
                      <strong className="text-sm text-charcoal">
                        {formatDateHuman(draft.firstDeliveryDate)}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted">
                        Turno asignado:
                      </span>
                      <strong className="text-sm text-rose-dark">
                        {draft.shift ? getShiftLabel(draft.shift) : "Sin turno"}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-charcoal-muted">
                        Siguiente renovación automática:
                      </span>
                      <strong className="text-sm text-sage-deep">
                        {projectedDates[1]
                          ? formatDateHuman(projectedDates[1])
                          : "-"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicación explícita de renovación automática */}
              <div className="rounded-2xl border-2 border-sage/30 bg-sage-light/70 p-4 text-xs leading-relaxed text-charcoal">
                <p className="font-bold text-sage-deep">
                  ¿Qué ocurrirá cuando completes el pago con tarjeta?
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  <li>
                    Tu suscripción quedará <strong>Activa</strong> de inmediato y
                    asociada a tu cuenta de cliente.
                  </li>
                  <li>
                    Se programará tu primera entrega por{" "}
                    <strong>{formatPEN(breakdown.pricePerDelivery)}</strong> en
                    el horario elegido ({draft.shift ? getShiftLabel(draft.shift) : ""}).
                  </li>
                  <li>
                    La renovación automática se ejecutará cada ciclo (
                    {getFrequencyIntervalLabel(
                      draft.customization.frequency
                    ).toLowerCase()}
                    ) hasta que decidas cancelarla desde tu cuenta.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-cream-border pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    goToStep(4, "Volviste al paso 4: Fecha y turno de entrega.")
                  }
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Volver a entrega</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    goToStep(6, "Avanzaste al paso 6: Pago con tarjeta de crédito o débito.");
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
                >
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                  <span>Continuar al pago con tarjeta</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {/* =========================================================
              PASO 6: PAGO CON TARJETA DE CRÉDITO O DÉBITO
          ========================================================= */}
          {draft.step === 6 && (
            <form
              noValidate
              onSubmit={handleCardPaymentSubmit}
              aria-labelledby="step6-heading"
              className="space-y-6 rounded-2xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
            >
              <div className="border-b border-cream-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                  Paso 6 de 7 · Pago con tarjeta
                </span>
                <h2
                  id="step6-heading"
                  className="mt-1 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
                >
                  Paga tu suscripción con tarjeta de crédito o débito
                </h2>
                <p className="mt-1 text-sm text-charcoal-muted">
                  Ingresa los datos de tu tarjeta para procesar el cobro de tu
                  primer ciclo y activar tu suscripción de inmediato.
                </p>
              </div>

              {/* Resumen de cobro del ciclo #1 */}
              <div className="rounded-2xl border-2 border-rose-dusty/40 bg-rose-pastel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
                      Total a pagar hoy (Ciclo #1)
                    </span>
                    <p className="font-serif text-3xl font-bold text-charcoal">
                      {formatPEN(breakdown.pricePerDelivery)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-charcoal">
                    <span className="block font-semibold">
                      {getPlanLabel(draft.customization.planId)} ·{" "}
                      {getFrequencyLabel(draft.customization.frequency)}
                    </span>
                    <span className="text-charcoal-muted">
                      1.ª entrega: {formatDateShort(draft.firstDeliveryDate)} ·{" "}
                      {draft.shift ? getShiftLabel(draft.shift) : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Tipo de Tarjeta (Crédito o Débito) */}
              <fieldset className="space-y-3">
                <legend className="font-serif text-base font-bold text-charcoal">
                  1. Selecciona el tipo de tarjeta *
                </legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        id: "credito" as CardType,
                        title: "Tarjeta de Crédito",
                        subtitle: "Visa, Mastercard, American Express o Diners",
                      },
                      {
                        id: "debito" as CardType,
                        title: "Tarjeta de Débito",
                        subtitle: "Visa Débito o Mastercard Débito en Soles (S/)",
                      },
                    ] as const
                  ).map((option) => {
                    const isSelected = cardData.cardType === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                          isSelected
                            ? "border-rose-deep bg-rose-pastel ring-2 ring-rose-deep/20"
                            : "border-cream-border bg-cream hover:border-rose-dusty"
                        }`}
                      >
                        <input
                          type="radio"
                          name="card-type"
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            setCardData((prev) => ({
                              ...prev,
                              cardType: option.id,
                            }))
                          }
                          className="mt-1 h-4 w-4 text-rose-dark focus:ring-rose-deep"
                        />
                        <div>
                          <span className="block text-sm font-bold text-charcoal">
                            {option.title}
                          </span>
                          <span className="text-xs text-charcoal-muted">
                            {option.subtitle}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Campos de la tarjeta */}
              <fieldset className="space-y-4 rounded-2xl border border-cream-border bg-cream p-5">
                <legend className="px-2 font-serif text-base font-bold text-charcoal">
                  2. Datos de la tarjeta
                </legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="card-number"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Número de tarjeta (16 dígitos) *
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        required
                        maxLength={19}
                        value={cardData.cardNumber}
                        aria-invalid={!!cardErrors.cardNumber}
                        aria-describedby={
                          cardErrors.cardNumber ? "card-number-error" : undefined
                        }
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setCardData((prev) => ({
                            ...prev,
                            cardNumber: formatted,
                          }));
                          if (cardErrors.cardNumber) {
                            setCardErrors((prev) => ({
                              ...prev,
                              cardNumber: validateCardPaymentInput({
                                ...cardData,
                                cardNumber: formatted,
                              }).cardNumber,
                            }));
                          }
                        }}
                        placeholder="4532 0000 1111 2222"
                        className="min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 font-mono text-sm tracking-wider text-charcoal focus:border-rose-deep focus:outline-none"
                      />
                      <CreditCard
                        className="pointer-events-none absolute top-3 right-3.5 h-5 w-5 text-charcoal-muted"
                        aria-hidden="true"
                      />
                    </div>
                    {cardErrors.cardNumber && (
                      <p
                        id="card-number-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{cardErrors.cardNumber}</span>
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="card-holder"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Nombre del titular (como aparece en la tarjeta) *
                    </label>
                    <input
                      id="card-holder"
                      type="text"
                      autoComplete="cc-name"
                      required
                      value={cardData.cardHolder}
                      aria-invalid={!!cardErrors.cardHolder}
                      aria-describedby={
                        cardErrors.cardHolder ? "card-holder-error" : undefined
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setCardData((prev) => ({
                          ...prev,
                          cardHolder: val,
                        }));
                        if (cardErrors.cardHolder) {
                          setCardErrors((prev) => ({
                            ...prev,
                            cardHolder: validateCardPaymentInput({
                              ...cardData,
                              cardHolder: val,
                            }).cardHolder,
                          }));
                        }
                      }}
                      placeholder="Ej.: VALERIA MENDOZA RIOS"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {cardErrors.cardHolder && (
                      <p
                        id="card-holder-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{cardErrors.cardHolder}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Fecha de vencimiento (MM/AA) *
                    </label>
                    <input
                      id="card-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      required
                      maxLength={5}
                      value={cardData.expiry}
                      aria-invalid={!!cardErrors.expiry}
                      aria-describedby={
                        cardErrors.expiry ? "card-expiry-error" : undefined
                      }
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setCardData((prev) => ({
                          ...prev,
                          expiry: formatted,
                        }));
                        if (cardErrors.expiry) {
                          setCardErrors((prev) => ({
                            ...prev,
                            expiry: validateCardPaymentInput({
                              ...cardData,
                              expiry: formatted,
                            }).expiry,
                          }));
                        }
                      }}
                      placeholder="08/29"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 font-mono text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {cardErrors.expiry && (
                      <p
                        id="card-expiry-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{cardErrors.expiry}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="card-cvv"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Código de seguridad (CVV / CVC) *
                    </label>
                    <input
                      id="card-cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      required
                      maxLength={4}
                      value={cardData.cvv}
                      aria-invalid={!!cardErrors.cvv}
                      aria-describedby={
                        cardErrors.cvv ? "card-cvv-error" : undefined
                      }
                      onChange={(e) => {
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setCardData((prev) => ({
                          ...prev,
                          cvv: digits,
                        }));
                        if (cardErrors.cvv) {
                          setCardErrors((prev) => ({
                            ...prev,
                            cvv: validateCardPaymentInput({
                              ...cardData,
                              cvv: digits,
                            }).cvv,
                          }));
                        }
                      }}
                      placeholder="123"
                      className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream-ivory px-3.5 py-2 font-mono text-sm text-charcoal focus:border-rose-deep focus:outline-none"
                    />
                    {cardErrors.cvv && (
                      <p
                        id="card-cvv-error"
                        role="alert"
                        className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-800"
                      >
                        <AlertCircle
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{cardErrors.cvv}</span>
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-cream-border pt-6 sm:flex-row">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() =>
                    goToStep(5, "Volviste al paso 5: Resumen de suscripción.")
                  }
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Volver al resumen</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-sage-deep px-8 py-3.5 text-base font-semibold text-cream-ivory shadow-sm transition hover:bg-sage disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Procesando pago...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" aria-hidden="true" />
                      <span>
                        Pagar {formatPEN(breakdown.pricePerDelivery)} y activar
                        suscripción
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================
              PASO 7: CONFIRMACIÓN DE SUSCRIPCIÓN ACTIVADA
          ========================================================= */}
          {draft.step === 7 && confirmedSubscription && (
            <section
              aria-labelledby="step7-heading"
              data-testid="subscription-confirmation-view"
              className="mx-auto max-w-3xl rounded-3xl border-2 border-sage bg-cream-ivory p-6 shadow-lg sm:p-10"
            >
              <div className="flex flex-col items-center text-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-sage bg-sage-light text-sage-deep"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="h-9 w-9" />
                </span>

                <div className="mt-4">
                  <StatusBadge
                    kind="subscription"
                    status={confirmedSubscription.status}
                  />
                </div>

                <h2
                  id="step7-heading"
                  className="mt-3 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
                >
                  ¡Tu suscripción {confirmedSubscription.code} está activa!
                </h2>

                <p className="mt-2 max-w-xl text-sm text-charcoal-muted sm:text-base">
                  Tu pago con tarjeta fue procesado exitosamente. Hemos
                  registrado tu suscripción en tu cuenta y programado tu primera
                  entrega floral.
                </p>
              </div>

              <dl className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-cream-border bg-cream p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Código de suscripción:
                  </dt>
                  <dd className="font-serif text-lg font-bold text-charcoal">
                    {confirmedSubscription.code}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Importe pagado (Ciclo #1):
                  </dt>
                  <dd className="font-serif text-lg font-bold text-sage-deep">
                    {formatPEN(confirmedSubscription.pricePerDelivery)}{" "}
                    {confirmedSubscription.paymentMethodSummary && (
                      <span className="block font-sans text-xs font-normal text-charcoal-muted">
                        ({confirmedSubscription.paymentMethodSummary})
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Plan y configuración:
                  </dt>
                  <dd className="font-semibold text-charcoal">
                    {getPlanLabel(confirmedSubscription.customization.planId)} ·{" "}
                    {getSizeLabel(confirmedSubscription.customization.size)} ·{" "}
                    {getFlowerTypeLabel(
                      confirmedSubscription.customization.flowerType
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Frecuencia y próxima renovación:
                  </dt>
                  <dd className="font-semibold text-charcoal">
                    {getFrequencyLabel(
                      confirmedSubscription.customization.frequency
                    )}{" "}
                    (Próximo ciclo:{" "}
                    {formatDateShort(confirmedSubscription.nextBillingDate)})
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Primera fecha de entrega (America/Lima):
                  </dt>
                  <dd className="font-semibold text-rose-dark">
                    {formatDateHuman(confirmedSubscription.firstDeliveryDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-charcoal-muted">
                    Turno seleccionado:
                  </dt>
                  <dd className="font-semibold text-rose-dark">
                    {getShiftLabel(confirmedSubscription.shift)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs text-charcoal-muted">
                    Destinatario y dirección de entrega:
                  </dt>
                  <dd className="font-semibold text-charcoal">
                    {confirmedSubscription.modality === "regalo" &&
                    confirmedSubscription.recipient
                      ? `${confirmedSubscription.recipient.fullName} — ${confirmedSubscription.recipient.address}`
                      : `${confirmedSubscription.buyer.fullName} — ${confirmedSubscription.buyer.address}`}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onGoToMySubscriptions}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
                >
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <span>Ir a Mis Suscripciones</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmedSubscription(null);
                    onResetDraft();
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream px-6 py-3 text-base font-semibold text-charcoal transition hover:bg-cream-warm"
                >
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  <span>Contratar otra suscripción</span>
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Columna Lateral: Resumen dinámico visible en Pasos 1 a 6 */}
        {draft.step < 7 && (
          <div className="lg:sticky lg:top-24 lg:col-span-4">
            <DynamicSummaryCard draft={draft} />
          </div>
        )}
      </div>
    </div>
  );
}
