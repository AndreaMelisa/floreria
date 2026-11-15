import React from "react";
import Link from "next/link";
import { Flower2, Clock, ShieldCheck, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cream-border bg-cream-warm text-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Columna 1: Marca */}
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-dusty/40 bg-rose-soft text-rose-dark"
                aria-hidden="true"
              >
                <Flower2 className="h-5 w-5" />
              </span>
              <span className="font-serif text-lg font-bold text-charcoal">
                El club de las flores {"<3"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
              Servicio de suscripción de arreglos florales frescos diseñados a tu
              medida. Elige tu plan, personaliza tus flores y recibe belleza
              botánica periódicamente para ti o para regalar.
            </p>
          </div>

          {/* Columna 2: Vistas del sistema */}
          <div>
            <h2 className="font-serif text-base font-bold text-charcoal">
              Mapa del sitio
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-[36px] items-center text-charcoal-muted underline-offset-4 hover:text-rose-dark hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
                >
                  Inicio — Planes, beneficios y preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="inline-flex min-h-[36px] items-center text-charcoal-muted underline-offset-4 hover:text-rose-dark hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
                >
                  Nosotros — Filosofía botánica y compromiso de calidad
                </Link>
              </li>
              <li>
                <Link
                  href="/suscripciones"
                  className="inline-flex min-h-[36px] items-center text-charcoal-muted underline-offset-4 hover:text-rose-dark hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
                >
                  Suscripciones — Contratar y gestionar mis suscripciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Turnos y Pagos */}
          <div>
            <h2 className="font-serif text-base font-bold text-charcoal">
              Horarios de entrega y medios de pago
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-charcoal-muted">
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  aria-hidden="true"
                />
                <span>
                  <strong>Turno Mañana:</strong> 9:00 a. m. a 1:00 p. m.
                  <br />
                  <strong>Turno Tarde:</strong> 3:00 p. m. a 6:00 p. m.
                  <br />
                  <span className="text-xs">(Zona horaria: America/Lima)</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark"
                  aria-hidden="true"
                />
                <span>
                  <strong>Tarjetas aceptadas:</strong> Pagos con tarjeta de
                  crédito o débito en Soles Peruanos (S/ PEN).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-charcoal"
                  aria-hidden="true"
                />
                <span>
                  <strong>Gestión flexible:</strong> Modifica tu plan, tus
                  flores, tu dirección o cancela tu suscripción desde tu cuenta
                  de cliente.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-cream-border pt-6 text-center text-xs text-charcoal-muted">
          <p>
            © 2026 El club de las flores {"<3"} · Suscripciones de arreglos
            florales en Lima, Perú.
          </p>
        </div>
      </div>
    </footer>
  );
}
