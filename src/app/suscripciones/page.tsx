import React, { Suspense } from "react";
import { SubscriptionsHubClient } from "@/components/subscriptions/SubscriptionsHubClient";

export const metadata = {
  title: "Suscripciones | El club de las flores <3",
  description:
    "Configura tu plan floral, elige frecuencia, destinatario y turno de entrega, simula tu pago y gestiona tus suscripciones.",
};

export default function SuscripcionesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-charcoal-muted">
          Cargando vista de suscripciones...
        </div>
      }
    >
      <SubscriptionsHubClient />
    </Suspense>
  );
}
