"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Flower2,
  Gift,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { formatPEN } from "@/config/pricing";
import {
  formatDateHuman,
  formatDateShort,
  getProjectedDeliveryDates,
} from "@/lib/calendar";
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
import { SubscriptionDraft } from "@/types/domain";

interface DynamicSummaryCardProps {
  draft: SubscriptionDraft;
}

export function DynamicSummaryCard({ draft }: DynamicSummaryCardProps) {
  const { customization, modality, buyer, recipient, firstDeliveryDate, shift } =
    draft;
  const breakdown = calculatePriceBreakdown(customization);
  const projectedDates = getProjectedDeliveryDates(
    firstDeliveryDate,
    customization.frequency,
    3
  );

  const recipientDisplay =
    modality === "regalo"
      ? recipient.fullName.trim() || "Destinatario por definir"
      : buyer.fullName.trim() || "Para mí (Comprador)";

  const addressDisplay =
    modality === "regalo"
      ? recipient.address.trim() || "Dirección del destinatario pendiente"
      : buyer.address.trim() || "Dirección de entrega pendiente";

  return (
    <aside
      aria-label="Resumen dinámico de tu suscripción"
      className="rounded-2xl border-2 border-cream-border bg-cream-ivory p-5 shadow-md"
    >
      <div className="flex items-center justify-between border-b border-cream-border pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-rose-dark" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-charcoal">
            Resumen en vivo
          </h2>
        </div>
        <span className="rounded-full border border-rose-dusty/40 bg-rose-pastel px-2.5 py-0.5 text-xs font-semibold text-rose-dark">
          Paso {draft.step} de 7
        </span>
      </div>

      {/* Desglose de configuración floral */}
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-start justify-between gap-2">
          <dt className="text-charcoal-muted">Plan y tamaño:</dt>
          <dd className="text-right font-semibold text-charcoal">
            {getPlanLabel(customization.planId)} ·{" "}
            {getSizeLabel(customization.size)} ({formatPEN(breakdown.sizePrice)})
          </dd>
        </div>

        <div className="flex items-start justify-between gap-2">
          <dt className="text-charcoal-muted">Tipo de flores:</dt>
          <dd className="text-right font-semibold text-charcoal">
            {getFlowerTypeLabel(customization.flowerType)}{" "}
            {breakdown.flowerTypePrice > 0
              ? `(+${formatPEN(breakdown.flowerTypePrice)})`
              : "(Incluido)"}
          </dd>
        </div>

        <div className="flex items-start justify-between gap-2">
          <dt className="text-charcoal-muted">Paleta de color:</dt>
          <dd className="text-right font-medium text-charcoal">
            {getColorPaletteLabel(customization.colorPalette)}
          </dd>
        </div>

        <div className="flex items-start justify-between gap-2">
          <dt className="text-charcoal-muted">Frecuencia:</dt>
          <dd className="text-right font-semibold text-sage-deep">
            {getFrequencyLabel(customization.frequency)} (
            {getFrequencyIntervalLabel(customization.frequency)})
          </dd>
        </div>

        {/* Complementos seleccionados */}
        <div className="border-t border-cream-border pt-2.5">
          <dt className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
            Complementos ({breakdown.addonsDetail.length})
          </dt>
          {breakdown.addonsDetail.length === 0 ? (
            <dd className="mt-1 text-xs text-charcoal-muted">
              Sin complementos adicionales (S/ 0.00)
            </dd>
          ) : (
            <dd className="mt-1.5 space-y-1">
              {breakdown.addonsDetail.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between text-xs text-charcoal"
                >
                  <span>• {addon.name}</span>
                  <span className="font-semibold">+{formatPEN(addon.price)}</span>
                </div>
              ))}
            </dd>
          )}
        </div>
      </dl>

      {/* Bloque de precios actualizado en vivo */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="mt-4 rounded-xl border-2 border-rose-dusty/40 bg-rose-pastel p-4"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-dark">
            Precio por entrega
          </span>
          <span
            data-testid="summary-price-per-delivery"
            className="font-serif text-2xl font-bold text-charcoal"
          >
            {formatPEN(breakdown.pricePerDelivery)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-rose-dusty/20 pt-2 text-xs text-charcoal">
          <span>Precio por ciclo de cobro (1 entrega):</span>
          <strong data-testid="summary-price-per-cycle">
            {formatPEN(breakdown.pricePerBillingCycle)}
          </strong>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-charcoal-muted">
          <span>
            Estimación mensual aprox. ({breakdown.deliveriesPerMonthEstimate}{" "}
            {breakdown.deliveriesPerMonthEstimate === 1 ? "entrega" : "entregas"}
            ):
          </span>
          <strong
            data-testid="summary-monthly-estimate"
            className="text-charcoal"
          >
            ~{formatPEN(breakdown.estimatedMonthlyPrice)} / mes
          </strong>
        </div>
      </div>

      {/* Modalidad, destinatario y horario */}
      <div className="mt-4 space-y-2.5 border-t border-cream-border pt-3.5 text-xs text-charcoal">
        <div className="flex items-start gap-2">
          {modality === "regalo" ? (
            <Gift
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark"
              aria-hidden="true"
            />
          ) : (
            <User
              className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
              aria-hidden="true"
            />
          )}
          <div>
            <span className="font-semibold">
              Modalidad:{" "}
              {modality === "regalo"
                ? "Para regalar a otra persona"
                : "Para mí mismo"}
            </span>
            <p className="text-charcoal-muted">
              Recibe: {recipientDisplay} · {addressDisplay}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar
            className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark"
            aria-hidden="true"
          />
          <div>
            <span className="font-semibold">Primera entrega:</span>{" "}
            <span>{formatDateHuman(firstDeliveryDate)}</span>
            {projectedDates.length > 1 && (
              <p className="mt-0.5 text-charcoal-muted">
                Próximos ciclos:{" "}
                {projectedDates
                  .slice(1)
                  .map((d) => formatDateShort(d))
                  .join(" → ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock
            className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
            aria-hidden="true"
          />
          <div>
            <span className="font-semibold">Turno seleccionado:</span>{" "}
            <span data-testid="summary-selected-shift">
              {shift ? (
                getShiftLabel(shift)
              ) : (
                <em className="text-amber-900">Pendiente de elegir turno</em>
              )}
            </span>
          </div>
        </div>

        {customization.dedication.trim() && (
          <div className="flex items-start gap-2">
            <Flower2
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark"
              aria-hidden="true"
            />
            <div className="italic text-charcoal-muted">
              &ldquo;{customization.dedication.trim()}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Explicación breve de renovación y pago con tarjeta */}
      <div className="mt-4 space-y-2 rounded-xl border border-cream-border bg-cream p-3 text-xs text-charcoal-muted">
        <p className="flex items-start gap-1.5">
          <RefreshCw
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep"
            aria-hidden="true"
          />
          <span>
            <strong>Renovación automática:</strong> Se renueva{" "}
            {getFrequencyIntervalLabel(customization.frequency).toLowerCase()}{" "}
            hasta que decidas cancelar.
          </span>
        </p>
        <p className="flex items-start gap-1.5">
          <ShieldAlert
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-dark"
            aria-hidden="true"
          />
          <span>
            <strong>Pago con tarjeta:</strong> Tarjeta de crédito o débito en
            Soles Peruanos (S/).
          </span>
        </p>
      </div>
    </aside>
  );
}
