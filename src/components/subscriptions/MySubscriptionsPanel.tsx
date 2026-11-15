"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Clock,
  CreditCard,
  Edit3,
  FastForward,
  Flower2,
  Info,
  MapPin,
  PackageCheck,
  PlusCircle,
  RefreshCw,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import {
  ADDON_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  DELIVERY_SHIFTS,
  FLOWER_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  SIZE_OPTIONS,
} from "@/config/catalog";
import { formatPEN } from "@/config/pricing";
import { formatDateHuman, formatDateShort } from "@/lib/calendar";
import {
  calculatePriceBreakdown,
  getAddonLabel,
  getColorPaletteLabel,
  getFlowerTypeLabel,
  getFrequencyIntervalLabel,
  getFrequencyLabel,
  getPlanLabel,
  getShiftLabel,
  getSizeLabel,
} from "@/lib/pricing";
import {
  AddonId,
  ArrangementSize,
  ColorPalette,
  DeliveryShift,
  FlowerType,
  ScheduledDelivery,
  SimulatedPayment,
  Subscription,
  SubscriptionFrequency,
} from "@/types/domain";
import { AccessibleModal } from "@/components/ui/AccessibleModal";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface MySubscriptionsPanelProps {
  subscriptions: Subscription[];
  payments: SimulatedPayment[];
  deliveries: ScheduledDelivery[];
  onStartNewSubscription: () => void;
  onScheduleCommercialChange: (
    subscriptionId: string,
    newConfig: {
      size: ArrangementSize;
      flowerType: FlowerType;
      colorPalette: ColorPalette;
      frequency: SubscriptionFrequency;
      addons: AddonId[];
    }
  ) => { success: boolean; message: string };
  onUpdateOperationalDetails: (
    subscriptionId: string,
    updates: {
      shift: DeliveryShift;
      dedication?: string;
      recipientName: string;
      deliveryAddress: string;
      deliveryReference?: string;
      recipientPhone?: string;
    }
  ) => { success: boolean; message: string };
  onCancelSubscription: (
    subscriptionId: string,
    reason?: string
  ) => { success: boolean; message: string };
  onMarkDeliveryDeliveredDemo: (deliveryId: string) => {
    success: boolean;
    message: string;
  };
  onSimulateNextCycleRenewal: (targetDateStr: string) => {
    processedCount: number;
    summaryMessages: string[];
  };
}

export function MySubscriptionsPanel({
  subscriptions,
  payments,
  deliveries,
  onStartNewSubscription,
  onScheduleCommercialChange,
  onUpdateOperationalDetails,
  onCancelSubscription,
  onMarkDeliveryDeliveredDemo,
  onSimulateNextCycleRenewal,
}: MySubscriptionsPanelProps) {
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "info" | "warning";
    text: string;
  } | null>(null);

  // Estado para modal de cambio comercial (plan, tamaño, flores, frecuencia, complementos)
  const [commercialModalSub, setCommercialModalSub] =
    useState<Subscription | null>(null);
  const [editSize, setEditSize] = useState<ArrangementSize>("mediano");
  const [editFlowerType, setEditFlowerType] =
    useState<FlowerType>("temporada");
  const [editColorPalette, setEditColorPalette] =
    useState<ColorPalette>("pastel");
  const [editFrequency, setEditFrequency] =
    useState<SubscriptionFrequency>("quincenal");
  const [editAddons, setEditAddons] = useState<AddonId[]>([]);

  // Estado para modal de cambio operativo (destinatario, dirección, turno)
  const [operationalModalSub, setOperationalModalSub] =
    useState<Subscription | null>(null);
  const [editShift, setEditShift] = useState<DeliveryShift>("manana");
  const [editRecipientName, setEditRecipientName] = useState("");
  const [editRecipientPhone, setEditRecipientPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editReference, setEditReference] = useState("");
  const [editDedication, setEditDedication] = useState("");
  const [operationalError, setOperationalError] = useState<string | null>(null);

  // Estado para modal de cancelación destructiva
  const [cancelModalSub, setCancelModalSub] =
    useState<Subscription | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const openCommercialModal = (sub: Subscription) => {
    const base = sub.pendingCommercialChanges ?? sub.customization;
    setEditSize(base.size);
    setEditFlowerType(base.flowerType);
    setEditColorPalette(base.colorPalette);
    setEditFrequency(base.frequency);
    setEditAddons([...base.addons]);
    setCommercialModalSub(sub);
  };

  const handleSaveCommercialChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercialModalSub) return;

    const result = onScheduleCommercialChange(commercialModalSub.id, {
      size: editSize,
      flowerType: editFlowerType,
      colorPalette: editColorPalette,
      frequency: editFrequency,
      addons: editAddons,
    });

    setFeedbackBanner({
      type: result.success ? "success" : "warning",
      text: result.message,
    });
    setCommercialModalSub(null);
  };

  const openOperationalModal = (sub: Subscription) => {
    const targetPerson =
      sub.modality === "regalo" && sub.recipient ? sub.recipient : sub.buyer;
    setEditShift(sub.shift);
    setEditRecipientName(targetPerson.fullName);
    setEditRecipientPhone(targetPerson.phone);
    setEditAddress(targetPerson.address);
    setEditReference(targetPerson.reference ?? "");
    setEditDedication(sub.customization.dedication ?? "");
    setOperationalError(null);
    setOperationalModalSub(sub);
  };

  const handleSaveOperationalChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationalModalSub) return;

    if (editRecipientName.trim().length < 3) {
      setOperationalError(
        "El nombre del destinatario debe tener al menos 3 caracteres."
      );
      return;
    }
    if (editAddress.trim().length < 8) {
      setOperationalError(
        "Ingresa una dirección completa (mínimo 8 caracteres, incluyendo calle, número y distrito)."
      );
      return;
    }

    const result = onUpdateOperationalDetails(operationalModalSub.id, {
      shift: editShift,
      recipientName: editRecipientName,
      recipientPhone: editRecipientPhone,
      deliveryAddress: editAddress,
      deliveryReference: editReference,
      dedication: editDedication,
    });

    setFeedbackBanner({
      type: result.success ? "success" : "warning",
      text: result.message,
    });
    setOperationalModalSub(null);
  };

  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSub) return;

    const result = onCancelSubscription(cancelModalSub.id, cancelReason);
    setFeedbackBanner({
      type: result.success ? "info" : "warning",
      text: result.message,
    });
    setCancelReason("");
    setCancelModalSub(null);
  };

  const previewCommercialBreakdown = calculatePriceBreakdown({
    size: editSize,
    flowerType: editFlowerType,
    addons: editAddons,
    frequency: editFrequency,
  });

  return (
    <div className="space-y-8">
      {/* Región aria-live para anunciar notificaciones de gestión */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {feedbackBanner?.text ?? ""}
      </div>

      {feedbackBanner && (
        <div
          role="alert"
          data-testid="management-feedback-banner"
          className={`flex items-start justify-between gap-3 rounded-2xl border-2 p-4 text-sm font-medium ${
            feedbackBanner.type === "success"
              ? "border-sage bg-sage-light text-sage-deep"
              : feedbackBanner.type === "warning"
                ? "border-red-700 bg-red-50 text-red-900"
                : "border-rose-deep bg-rose-pastel text-rose-dark"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{feedbackBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="rounded-lg px-2 py-0.5 text-xs font-bold underline"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* Estado vacío con instrucciones claras */}
      {subscriptions.length === 0 ? (
        <section
          aria-labelledby="empty-subs-heading"
          className="rounded-3xl border-2 border-dashed border-cream-border bg-cream-ivory p-10 text-center"
        >
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-pastel text-rose-dark"
            aria-hidden="true"
          >
            <Flower2 className="h-7 w-7" />
          </span>
          <h2
            id="empty-subs-heading"
            className="mt-4 font-serif text-2xl font-bold text-charcoal"
          >
            Aún no tienes suscripciones en tu cuenta
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-charcoal-muted">
            Para registrar una suscripción en tu cuenta de cliente, completa el
            configurador paso a paso y realiza el pago con tu tarjeta de crédito
            o débito. Podrás consultar tus próximas entregas, cambiar tu plan o
            cancelar cuando quieras.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onStartNewSubscription}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-7 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
            >
              <PlusCircle className="h-5 w-5" aria-hidden="true" />
              <span>Contratar mi primera suscripción</span>
            </button>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="active-subs-heading"
          className="space-y-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2
                id="active-subs-heading"
                className="font-serif text-2xl font-bold text-charcoal sm:text-3xl"
              >
                Mis suscripciones ({subscriptions.length})
              </h2>
              <p className="mt-1 text-sm text-charcoal-muted">
                Consulta el estado de cada suscripción asociada a tu cuenta, sus
                entregas programadas y realiza modificaciones o cancelaciones.
              </p>
            </div>

            <button
              type="button"
              onClick={onStartNewSubscription}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-5 py-2.5 text-sm font-semibold text-cream-ivory transition hover:bg-rose-deep"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span>Nueva suscripción</span>
            </button>
          </div>

          {/* Tarjetas de Suscripciones */}
          <div className="space-y-6">
            {subscriptions.map((sub) => {
              const isActive = sub.status === "activa";
              const subDeliveries = deliveries.filter(
                (d) => d.subscriptionId === sub.id
              );
              const subPayments = payments.filter(
                (p) => p.subscriptionId === sub.id
              );
              const targetPerson =
                sub.modality === "regalo" && sub.recipient
                  ? sub.recipient
                  : sub.buyer;

              return (
                <article
                  key={sub.id}
                  aria-label={`Suscripción ${sub.code}`}
                  className="rounded-3xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
                >
                  {/* Cabecera de la suscripción */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cream-border pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-2xl font-bold text-charcoal">
                          {sub.code} — {getPlanLabel(sub.customization.planId)}
                        </h3>
                        <StatusBadge kind="subscription" status={sub.status} />
                      </div>
                      <p className="mt-1 text-xs text-charcoal-muted">
                        Ciclo actual: #{sub.currentCycle} · Modalidad:{" "}
                        <strong>
                          {sub.modality === "regalo"
                            ? "Para regalar"
                            : "Para mí mismo"}
                        </strong>{" "}
                        · Frecuencia:{" "}
                        <strong>
                          {getFrequencyLabel(sub.customization.frequency)} (
                          {getFrequencyIntervalLabel(
                            sub.customization.frequency
                          )}
                          )
                        </strong>
                        {sub.paymentMethodSummary && (
                          <>
                            {" "}
                            · Medio de pago:{" "}
                            <strong>{sub.paymentMethodSummary}</strong>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-charcoal-muted">
                        Importe por entrega / ciclo
                      </span>
                      <span className="font-serif text-2xl font-bold text-rose-dark">
                        {formatPEN(sub.pricePerDelivery)}
                      </span>
                    </div>
                  </div>

                  {/* Aviso de cambios comerciales pendientes para el siguiente ciclo */}
                  {sub.pendingCommercialChanges && (
                    <div
                      data-testid={`pending-changes-${sub.id}`}
                      className="mt-4 rounded-2xl border-2 border-amber-700/40 bg-amber-50 p-4 text-xs text-amber-950"
                    >
                      <div className="flex items-start gap-2.5">
                        <RefreshCw
                          className="mt-0.5 h-4 w-4 shrink-0 text-amber-800"
                          aria-hidden="true"
                        />
                        <div>
                          <strong className="block text-sm">
                            Cambio comercial programado para el próximo ciclo (
                            {formatDateHuman(sub.nextBillingDate)}):
                          </strong>
                          <p className="mt-1">
                            Nuevo plan:{" "}
                            <strong>
                              {getPlanLabel(
                                sub.pendingCommercialChanges.planId
                              )}{" "}
                              ({getSizeLabel(sub.pendingCommercialChanges.size)})
                            </strong>{" "}
                            · Flores:{" "}
                            <strong>
                              {getFlowerTypeLabel(
                                sub.pendingCommercialChanges.flowerType
                              )}
                            </strong>{" "}
                            · Frecuencia:{" "}
                            <strong>
                              {getFrequencyLabel(
                                sub.pendingCommercialChanges.frequency
                              )}
                            </strong>{" "}
                            · Nuevo importe:{" "}
                            <strong>
                              {formatPEN(
                                sub.pendingCommercialChanges.pricePerDelivery
                              )}
                            </strong>
                            . (El ciclo actual conserva el importe ya pagado de{" "}
                            {formatPEN(sub.pricePerDelivery)}).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detalles del arreglo, destinatario y turno */}
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-cream-border bg-cream p-4 text-xs">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-dark">
                        <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Configuración actual</span>
                      </span>
                      <ul className="mt-2 space-y-1 text-charcoal">
                        <li>
                          <strong>Tamaño:</strong>{" "}
                          {getSizeLabel(sub.customization.size)}
                        </li>
                        <li>
                          <strong>Flores:</strong>{" "}
                          {getFlowerTypeLabel(sub.customization.flowerType)}
                        </li>
                        <li>
                          <strong>Paleta:</strong>{" "}
                          {getColorPaletteLabel(sub.customization.colorPalette)}
                        </li>
                        <li>
                          <strong>Complementos:</strong>{" "}
                          {sub.customization.addons.length > 0
                            ? sub.customization.addons
                                .map(getAddonLabel)
                                .join(", ")
                            : "Ninguno"}
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-cream-border bg-cream p-4 text-xs">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-sage-deep">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Destinatario y dirección</span>
                      </span>
                      <ul className="mt-2 space-y-1 text-charcoal">
                        <li>
                          <strong>Recibe:</strong> {targetPerson.fullName}
                        </li>
                        <li>
                          <strong>Dirección:</strong> {targetPerson.address}
                        </li>
                        {targetPerson.reference && (
                          <li>
                            <strong>Referencia:</strong>{" "}
                            {targetPerson.reference}
                          </li>
                        )}
                        <li>
                          <strong>Comprador:</strong> {sub.buyer.fullName}
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-cream-border bg-cream p-4 text-xs">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-charcoal">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Horario y renovación</span>
                      </span>
                      <ul className="mt-2 space-y-1 text-charcoal">
                        <li>
                          <strong>Turno recurrente:</strong>{" "}
                          <span className="font-semibold text-rose-dark">
                            {getShiftLabel(sub.shift)}
                          </span>
                        </li>
                        <li>
                          <strong>Próxima renovación:</strong>{" "}
                          {isActive
                            ? formatDateHuman(sub.nextBillingDate)
                            : "Detenida por cancelación"}
                        </li>
                        {sub.cancelledAt && (
                          <li className="text-rose-dark">
                            <strong>Motivo cancelación:</strong>{" "}
                            {sub.cancellationReason}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Controles de acción sobre la suscripción */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-cream-border pt-5">
                    {isActive ? (
                      <>
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => openCommercialModal(sub)}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-rose-deep bg-rose-pastel px-4 py-2 text-xs font-bold text-rose-dark transition hover:bg-rose-soft"
                          >
                            <SlidersHorizontal
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            <span>
                              Cambiar plan, tamaño, flores o frecuencia
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openOperationalModal(sub)}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-sage bg-sage-light px-4 py-2 text-xs font-bold text-sage-deep transition hover:bg-sage-soft"
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                            <span>
                              Modificar destinatario, dirección o turno
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const res = onSimulateNextCycleRenewal(
                                sub.nextBillingDate
                              );
                              setFeedbackBanner({
                                type: "success",
                                text:
                                  res.summaryMessages[0] ??
                                  "Se procesó la renovación del siguiente ciclo.",
                              });
                            }}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-charcoal/25 bg-cream px-3.5 py-2 text-xs font-semibold text-charcoal transition hover:bg-cream-warm"
                          >
                            <FastForward
                              className="h-4 w-4 text-sage-deep"
                              aria-hidden="true"
                            />
                            <span>
                              Adelantar renovación del ciclo #{sub.currentCycle + 1}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCancelReason("");
                            setCancelModalSub(sub);
                          }}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-red-800/50 bg-red-50 px-4 py-2 text-xs font-bold text-red-900 transition hover:bg-red-100"
                        >
                          <Ban className="h-4 w-4" aria-hidden="true" />
                          <span>Cancelar suscripción</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex w-full items-center gap-2 rounded-xl border border-cream-border bg-cream px-4 py-3 text-xs text-charcoal-muted">
                        <Ban
                          className="h-4 w-4 shrink-0 text-rose-dark"
                          aria-hidden="true"
                        />
                        <span>
                          Esta suscripción se encuentra{" "}
                          <strong>{sub.status}</strong>, por lo que sus opciones
                          comerciales y operativas están bloqueadas para edición.
                          Su historial de entregas y pagos permanece disponible.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Relación conceptual: Entregas y Pagos asociados a esta suscripción */}
                  <div className="mt-6 grid grid-cols-1 gap-4 border-t border-cream-border pt-5 lg:grid-cols-2">
                    {/* Entregas de la suscripción */}
                    <div className="rounded-2xl border border-cream-border bg-cream p-4">
                      <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-charcoal">
                        <Truck
                          className="h-4 w-4 text-sage-deep"
                          aria-hidden="true"
                        />
                        <span>
                          Entregas asociadas ({subDeliveries.length})
                        </span>
                      </h4>
                      <ul className="mt-3 space-y-2.5 text-xs">
                        {subDeliveries.map((del) => (
                          <li
                            key={del.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-border bg-cream-ivory p-3"
                          >
                            <div>
                              <span className="font-bold text-charcoal">
                                Ciclo #{del.cycleNumber} ·{" "}
                                {formatDateShort(del.scheduledDate)}
                              </span>
                              <p className="text-charcoal-muted">
                                {getShiftLabel(del.shift)} · Recibe:{" "}
                                {del.recipientName}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge
                                kind="delivery"
                                status={del.status}
                              />
                              {del.status === "programada" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = onMarkDeliveryDeliveredDemo(
                                      del.id
                                    );
                                    setFeedbackBanner({
                                      type: "success",
                                      text: res.message,
                                    });
                                  }}
                                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-sage bg-sage-light px-2.5 py-1 text-[11px] font-bold text-sage-deep hover:bg-sage-soft"
                                >
                                  <PackageCheck
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span>Confirmar recepción</span>
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pagos de la suscripción */}
                    <div className="rounded-2xl border border-cream-border bg-cream p-4">
                      <h4 className="flex items-center gap-2 font-serif text-sm font-bold text-charcoal">
                        <CreditCard
                          className="h-4 w-4 text-rose-dark"
                          aria-hidden="true"
                        />
                        <span>Pagos del ciclo ({subPayments.length})</span>
                      </h4>
                      <ul className="mt-3 space-y-2.5 text-xs">
                        {subPayments.map((pay) => (
                          <li
                            key={pay.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-border bg-cream-ivory p-3"
                          >
                            <div>
                              <span className="font-bold text-charcoal">
                                Ciclo #{pay.cycleNumber} ·{" "}
                                {formatPEN(pay.amount)}
                              </span>
                              <p className="text-charcoal-muted">
                                Fecha: {formatDateShort(pay.periodDate)}
                                {pay.paymentMethodSummary
                                  ? ` · ${pay.paymentMethodSummary}`
                                  : ""}
                              </p>
                            </div>
                            <StatusBadge kind="payment" status={pay.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          HISTORIAL DE PAGOS DEL CLIENTE
      ========================================================= */}
      <section
        aria-labelledby="global-history-heading"
        className="rounded-3xl border-2 border-cream-border bg-cream-ivory p-6 shadow-xs sm:p-8"
      >
        <h2
          id="global-history-heading"
          className="font-serif text-xl font-bold text-charcoal sm:text-2xl"
        >
          Historial de pagos de mi cuenta ({payments.length})
        </h2>
        <p className="mt-1 text-xs text-charcoal-muted">
          Registro de cobros con tarjeta asociados a tus suscripciones.
        </p>

        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal-muted">
            Aún no se han registrado pagos en tu cuenta.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-cream-border bg-cream text-charcoal">
                  <th className="p-3 font-bold">Fecha ciclo</th>
                  <th className="p-3 font-bold">Referencia de ciclo</th>
                  <th className="p-3 font-bold">Importe (PEN)</th>
                  <th className="p-3 font-bold">Estado</th>
                  <th className="p-3 font-bold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/60">
                    <td className="p-3 font-medium text-charcoal">
                      {formatDateShort(p.periodDate)}
                    </td>
                    <td className="p-3 font-mono text-charcoal-muted">
                      {p.cycleId}
                    </td>
                    <td className="p-3 font-bold text-charcoal">
                      {formatPEN(p.amount)}
                    </td>
                    <td className="p-3">
                      <StatusBadge kind="payment" status={p.status} />
                    </td>
                    <td className="p-3 text-charcoal-muted">{p.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =========================================================
          MODAL 1: MODIFICACIÓN COMERCIAL (PRÓXIMO CICLO)
      ========================================================= */}
      <AccessibleModal
        isOpen={!!commercialModalSub}
        onClose={() => setCommercialModalSub(null)}
        title={
          commercialModalSub
            ? `Cambiar plan, flores o frecuencia (${commercialModalSub.code})`
            : "Modificar suscripción"
        }
        description="Los cambios comerciales se aplicarán a partir del siguiente ciclo de renovación, respetando el importe ya pagado del ciclo vigente."
        maxWidthClass="max-w-2xl"
      >
        {commercialModalSub && (
          <form onSubmit={handleSaveCommercialChanges} className="space-y-5">
            {/* Tamaño / Plan */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-charcoal">
                Tamaño y Plan del arreglo
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={editSize === opt.id}
                    onClick={() => setEditSize(opt.id)}
                    className={`rounded-xl border-2 p-3 text-left text-xs transition ${
                      editSize === opt.id
                        ? "border-rose-deep bg-rose-pastel font-bold text-rose-dark"
                        : "border-cream-border bg-cream text-charcoal"
                    }`}
                  >
                    <span className="block">{opt.name}</span>
                    <span className="font-serif text-sm">
                      {formatPEN(opt.price)}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Tipo de flores */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-charcoal">
                Tipo de flores
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FLOWER_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={editFlowerType === opt.id}
                    onClick={() => setEditFlowerType(opt.id)}
                    className={`rounded-xl border-2 p-3 text-left text-xs transition ${
                      editFlowerType === opt.id
                        ? "border-rose-deep bg-rose-pastel font-bold text-rose-dark"
                        : "border-cream-border bg-cream text-charcoal"
                    }`}
                  >
                    <span>{opt.name}</span>{" "}
                    <span className="font-bold">
                      ({opt.price === 0 ? "Incluido" : `+${formatPEN(opt.price)}`})
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Paleta de colores */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-charcoal">
                Paleta de colores
              </legend>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {COLOR_PALETTE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={editColorPalette === opt.id}
                    onClick={() => setEditColorPalette(opt.id)}
                    className={`rounded-xl border-2 p-2.5 text-left text-xs transition ${
                      editColorPalette === opt.id
                        ? "border-rose-deep bg-rose-pastel font-bold text-rose-dark"
                        : "border-cream-border bg-cream text-charcoal"
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Frecuencia */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-charcoal">
                Frecuencia de renovación
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={editFrequency === opt.id}
                    onClick={() => setEditFrequency(opt.id)}
                    className={`rounded-xl border-2 p-3 text-left text-xs transition ${
                      editFrequency === opt.id
                        ? "border-sage-deep bg-sage-light font-bold text-sage-deep"
                        : "border-cream-border bg-cream text-charcoal"
                    }`}
                  >
                    <span className="block">{opt.name}</span>
                    <span className="text-[11px]">{opt.intervalLabel}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Complementos */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-bold text-charcoal">
                Complementos opcionales
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ADDON_OPTIONS.map((addon) => {
                  const checked = editAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border-2 p-3 text-xs ${
                        checked
                          ? "border-rose-deep bg-rose-pastel font-bold"
                          : "border-cream-border bg-cream"
                      }`}
                    >
                      <span>
                        {addon.name} (+{formatPEN(addon.price)})
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setEditAddons((prev) =>
                            prev.includes(addon.id)
                              ? prev.filter((a) => a !== addon.id)
                              : [...prev, addon.id]
                          );
                        }}
                        className="h-4 w-4 rounded border-charcoal text-rose-dark"
                      />
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Comparativa de precio actual vs próximo ciclo */}
            <div className="rounded-xl border border-rose-dusty/40 bg-rose-pastel p-4 text-xs">
              <div className="flex items-center justify-between">
                <span>Importe del ciclo actual (respetado):</span>
                <strong>{formatPEN(commercialModalSub.pricePerDelivery)}</strong>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm font-bold text-rose-dark">
                <span>
                  Nuevo importe para el siguiente ciclo (
                  {formatDateShort(commercialModalSub.nextBillingDate)}):
                </span>
                <span>{formatPEN(previewCommercialBreakdown.pricePerDelivery)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-cream-border pt-4">
              <button
                type="button"
                onClick={() => setCommercialModalSub(null)}
                className="min-h-[44px] rounded-xl border border-cream-border bg-cream px-4 py-2 text-xs font-semibold text-charcoal"
              >
                Descartar
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-rose-dark px-5 py-2 text-xs font-semibold text-cream-ivory hover:bg-rose-deep"
              >
                Guardar cambios para el próximo ciclo
              </button>
            </div>
          </form>
        )}
      </AccessibleModal>

      {/* =========================================================
          MODAL 2: MODIFICACIÓN OPERATIVA (DESTINATARIO, DIRECCIÓN, TURNO)
      ========================================================= */}
      <AccessibleModal
        isOpen={!!operationalModalSub}
        onClose={() => setOperationalModalSub(null)}
        title={
          operationalModalSub
            ? `Modificar destinatario, dirección o turno (${operationalModalSub.code})`
            : "Modificar entrega"
        }
        description="Estos cambios actualizarán tus entregas programadas pendientes."
      >
        {operationalModalSub && (
          <form onSubmit={handleSaveOperationalChanges} className="space-y-4">
            <div>
              <label
                htmlFor="edit-recipient-name"
                className="block text-xs font-bold text-charcoal"
              >
                Nombre de quien recibe las flores *
              </label>
              <input
                id="edit-recipient-name"
                type="text"
                required
                value={editRecipientName}
                onChange={(e) => setEditRecipientName(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label
                htmlFor="edit-delivery-address"
                className="block text-xs font-bold text-charcoal"
              >
                Dirección de entrega *
              </label>
              <input
                id="edit-delivery-address"
                type="text"
                required
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal"
              />
            </div>

            <div>
              <label
                htmlFor="edit-delivery-reference"
                className="block text-xs font-bold text-charcoal"
              >
                Referencia opcional
              </label>
              <input
                id="edit-delivery-reference"
                type="text"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-charcoal">
                Turno de entrega (America/Lima) *
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {DELIVERY_SHIFTS.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 p-3 text-xs ${
                      editShift === s.id
                        ? "border-rose-deep bg-rose-pastel font-bold text-rose-dark"
                        : "border-cream-border bg-cream text-charcoal"
                    }`}
                  >
                    <input
                      type="radio"
                      name="modal-edit-shift"
                      value={s.id}
                      checked={editShift === s.id}
                      onChange={() => setEditShift(s.id)}
                      className="h-4 w-4 text-rose-dark"
                    />
                    <div>
                      <span className="block">{s.name}</span>
                      <span className="text-[11px]">{s.schedule}</span>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {operationalError && (
              <p role="alert" className="text-xs font-bold text-red-800">
                {operationalError}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-cream-border pt-4">
              <button
                type="button"
                onClick={() => setOperationalModalSub(null)}
                className="min-h-[44px] rounded-xl border border-cream-border bg-cream px-4 py-2 text-xs font-semibold text-charcoal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-sage-deep px-5 py-2 text-xs font-semibold text-cream-ivory hover:bg-sage"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </AccessibleModal>

      {/* =========================================================
          MODAL 3: CONFIRMACIÓN DE CANCELACIÓN DESTRUCTIVA
      ========================================================= */}
      <AccessibleModal
        isOpen={!!cancelModalSub}
        onClose={() => setCancelModalSub(null)}
        title={
          cancelModalSub
            ? `¿Confirmas cancelar la suscripción ${cancelModalSub.code}?`
            : "Cancelar suscripción"
        }
        description="Conoce las consecuencias antes de confirmar esta acción."
      >
        {cancelModalSub && (
          <form onSubmit={handleConfirmCancellation} className="space-y-4">
            <div className="rounded-xl border-2 border-red-800/40 bg-red-50 p-4 text-xs text-red-950">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-800"
                  aria-hidden="true"
                />
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Se detendrán inmediatamente todas las renovaciones y cobros
                    futuros.
                  </li>
                  <li>
                    Las entregas que ya fueron pagadas se respetarán y seguirán
                    programadas.
                  </li>
                  <li>
                    Se conservará el historial de tu suscripción, pero ya no
                    podrás editar su configuración comercial.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <label
                htmlFor="cancel-reason-input"
                className="block text-xs font-bold text-charcoal"
              >
                Motivo de cancelación (opcional)
              </label>
              <input
                id="cancel-reason-input"
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej.: Viaje temporal, cambio de presupuesto..."
                className="mt-1 min-h-[42px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-cream-border pt-4">
              <button
                type="button"
                onClick={() => setCancelModalSub(null)}
                className="min-h-[44px] rounded-xl border border-cream-border bg-cream px-4 py-2 text-xs font-semibold text-charcoal"
              >
                Mantener mi suscripción activa
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-red-800 px-5 py-2 text-xs font-semibold text-cream-ivory hover:bg-red-900"
              >
                Confirmar cancelación definitiva
              </button>
            </div>
          </form>
        )}
      </AccessibleModal>
    </div>
  );
}
