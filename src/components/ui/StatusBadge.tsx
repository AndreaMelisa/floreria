"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import {
  DeliveryStatus,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain";

interface StatusBadgeProps {
  kind: "subscription" | "payment" | "delivery";
  status: SubscriptionStatus | PaymentStatus | DeliveryStatus;
}

export function StatusBadge({ kind, status }: StatusBadgeProps) {
  if (kind === "subscription") {
    switch (status as SubscriptionStatus) {
      case "activa":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-sage bg-sage-light px-3 py-1 text-xs font-semibold text-sage-deep">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Suscripción Activa</span>
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-700 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Suscripción Pendiente</span>
          </span>
        );
      case "cancelada":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-deep bg-rose-pastel px-3 py-1 text-xs font-semibold text-rose-dark">
            <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Suscripción Cancelada</span>
          </span>
        );
      case "finalizada":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-charcoal-muted bg-cream-warm px-3 py-1 text-xs font-semibold text-charcoal">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Suscripción Finalizada</span>
          </span>
        );
    }
  }

  if (kind === "payment") {
    switch (status as PaymentStatus) {
      case "exitoso":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sage bg-sage-light px-2.5 py-0.5 text-xs font-semibold text-sage-deep">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Pago exitoso</span>
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Pago pendiente</span>
          </span>
        );
      case "rechazado":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-900">
            <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Pago rechazado</span>
          </span>
        );
      case "cancelado":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-muted bg-cream-warm px-2.5 py-0.5 text-xs font-semibold text-charcoal">
            <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Pago cancelado</span>
          </span>
        );
    }
  }

  // Delivery status
  switch (status as DeliveryStatus) {
    case "programada":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Entrega programada</span>
        </span>
      );
    case "entregada":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sage bg-sage-light px-2.5 py-0.5 text-xs font-semibold text-sage-deep">
          <PackageCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Entregada</span>
        </span>
      );
    case "cancelada":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-deep bg-rose-pastel px-2.5 py-0.5 text-xs font-semibold text-rose-dark">
          <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Entrega cancelada</span>
        </span>
      );
  }
}
