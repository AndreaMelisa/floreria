import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CalendarHeart,
  HeartHandshake,
  SlidersHorizontal,
  Truck,
  RefreshCw,
  ShieldCheck,
  Gift,
  Check,
  ArrowRight,
  Clock,
  HelpCircle,
} from "lucide-react";
import { FLORAL_PLANS } from "@/config/catalog";
import { formatPEN, PLAN_TO_SIZE, SIZE_PRICES } from "@/config/pricing";
import { BotanicalIllustration } from "@/components/ui/BotanicalIllustration";

export default function HomePage() {
  const processSteps = [
    {
      step: "1",
      title: "Selecciona tu plan",
      description:
        "Elige entre Brote (pequeño), Floración (mediano) o Jardín (grande) según el espacio que quieras iluminar.",
    },
    {
      step: "2",
      title: "Personaliza tu arreglo",
      description:
        "Define el tipo de flores, paleta de colores, frecuencia (semanal, quincenal o mensual) y complementos.",
    },
    {
      step: "3",
      title: "Indica el destinatario",
      description:
        "Puedes contratar la suscripción para disfrutarla en tu hogar o enviarla como regalo recurrente a alguien especial.",
    },
    {
      step: "4",
      title: "Programa fecha y turno",
      description:
        "Selecciona tu primera fecha en el calendario y elige el turno de Mañana (9:00 a. m. - 1:00 p. m.) o Tarde (3:00 p. m. - 6:00 p. m.).",
    },
    {
      step: "5",
      title: "Revisa y paga con tarjeta",
      description:
        "Verifica cada detalle en el resumen dinámico y completa el pago con tu tarjeta de crédito o débito.",
    },
    {
      step: "6",
      title: "Gestiona desde tu cuenta",
      description:
        "Consulta tus próximas entregas, cambia tus flores o frecuencia para el siguiente ciclo, o cancela sin penalidades.",
    },
  ];

  const clubBenefits = [
    {
      icon: SlidersHorizontal,
      title: "Personalización en cada detalle",
      description:
        "Elige entre flores de temporada, diseño mixto, rosas o botánica premium, además de tu gama cromática favorita.",
    },
    {
      icon: Gift,
      title: "Para ti o para regalar",
      description:
        "Separa tus datos como comprador de los datos del destinatario e incluye una dedicatoria personalizada.",
    },
    {
      icon: Truck,
      title: "Dos turnos horarios claros",
      description:
        "Entregas programadas en horario de Mañana (9:00 a. m. a 1:00 p. m.) o Tarde (3:00 p. m. a 6:00 p. m.) en zona horaria America/Lima.",
    },
    {
      icon: RefreshCw,
      title: "Flexibilidad total entre ciclos",
      description:
        "Modifica el tamaño, las flores, la frecuencia o la dirección desde la sección Mis Suscripciones cuando lo necesites.",
    },
  ];

  const faqs = [
    {
      question: "¿Cómo funciona el cobro y la renovación automática?",
      answer:
        "Cada ciclo equivale a una entrega (cada 7 días en frecuencia semanal, cada 14 días en quincenal o cada mes calendario en mensual). La suscripción se activa al confirmar el pago con tu tarjeta y se renueva automáticamente cada ciclo hasta que decidas cancelar.",
    },
    {
      question: "¿Qué medios de pago puedo utilizar para contratar mi suscripción?",
      answer:
        "Aceptamos tarjetas de crédito y tarjetas de débito en Soles Peruanos (S/ PEN). Todos tus recibos de pago quedan registrados en tu cuenta de cliente.",
    },
    {
      question: "¿Qué ocurre si modifico el plan, las flores o la frecuencia de mi suscripción?",
      answer:
        "Los cambios comerciales (plan, tamaño, tipo de flores, paleta, complementos y frecuencia) quedan programados para aplicarse en tu siguiente ciclo de renovación, respetando el importe ya pagado del ciclo vigente. Los cambios de dirección o turno se actualizan en tus entregas programadas.",
    },
    {
      question: "¿Qué sucede cuando cancelo mi suscripción?",
      answer:
        "Al confirmar la cancelación se detienen inmediatamente las renovaciones futuras, se conserva todo tu historial de pagos y entregas, y las entregas que ya fueron pagadas se mantienen respetadas como programadas.",
    },
    {
      question: "¿En qué horarios se realizan las entregas?",
      answer:
        "Contamos con dos turnos fijos en la zona horaria America/Lima: Turno Mañana (de 9:00 a. m. a 1:00 p. m.) y Turno Tarde (de 3:00 p. m. a 6:00 p. m.). El turno que selecciones se aplicará a tus entregas recurrentes y podrás cambiarlo en cualquier momento.",
    },
  ];

  return (
    <div>
      {/* 1. HERO PRINCIPAL */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden border-b border-cream-border bg-gradient-to-br from-rose-pastel via-cream to-sage-light py-12 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-dusty/40 bg-cream-ivory px-3.5 py-1.5 text-xs font-semibold text-rose-dark shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Suscripción floral personalizada · Moneda S/ (PEN)</span>
              </div>

              <h1
                id="hero-heading"
                className="mt-5 font-serif text-3xl font-bold leading-tight text-charcoal sm:text-5xl"
              >
                El club de las flores {"<3"}: naturaleza fresca que florece a tu
                propio ritmo
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-charcoal-muted sm:text-lg">
                Diseña tu suscripción de arreglos florales para iluminar tu
                hogar o sorprender a quien más quieres. Elige el tamaño, la
                especie botánica, la paleta de color y la frecuencia con total
                claridad desde el primer paso.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  href="/suscripciones"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-rose-dark px-7 py-3.5 text-base font-semibold text-cream-ivory shadow-sm transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
                >
                  <CalendarHeart className="h-5 w-5" aria-hidden="true" />
                  <span>Personalizar mi arreglo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#planes-florales"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream-ivory px-6 py-3.5 text-base font-semibold text-charcoal transition hover:border-rose-deep hover:bg-rose-pastel focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
                >
                  <span>Explorar planes y precios</span>
                </a>
              </div>

              {/* Resumen rápido */}
              <dl className="mt-9 grid grid-cols-1 gap-4 border-t border-cream-border pt-6 sm:grid-cols-3">
                <div className="rounded-xl border border-cream-border bg-cream-ivory/90 p-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                    Planes desde
                  </dt>
                  <dd className="mt-1 font-serif text-xl font-bold text-rose-dark">
                    S/ 65.00{" "}
                    <span className="font-sans text-xs font-normal text-charcoal-muted">
                      / entrega
                    </span>
                  </dd>
                </div>
                <div className="rounded-xl border border-cream-border bg-cream-ivory/90 p-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                    Frecuencia a elección
                  </dt>
                  <dd className="mt-1 font-serif text-base font-bold text-charcoal">
                    Semanal, Quincenal o Mensual
                  </dd>
                </div>
                <div className="rounded-xl border border-cream-border bg-cream-ivory/90 p-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                    Turnos de entrega
                  </dt>
                  <dd className="mt-1 font-serif text-base font-bold text-sage-deep">
                    Mañana o Tarde
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-3xl border-2 border-cream-border bg-cream-ivory p-3 shadow-xl">
                <BotanicalIllustration
                  variant="hero-bouquet"
                  alt="Fotografía ilustrativa de un arreglo floral principal en jarrón de cerámica crema con rosas en tonos rosa empolvado, flores marfil y follaje verde salvia"
                  className="h-auto w-full rounded-2xl"
                />
                <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs text-charcoal-muted">
                  <span>Composición botánica de autor</span>
                  <span className="font-semibold text-sage-deep">
                    Tallos frescos seleccionados
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRESENTACIÓN DE LA MARCA Y EXPLICACIÓN DEL SERVICIO */}
      <section
        aria-labelledby="presentacion-marca-heading"
        className="border-b border-cream-border bg-cream-ivory py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-dark">
              Nuestra propuesta
            </span>
            <h2
              id="presentacion-marca-heading"
              className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              ¿Qué es El club de las floresy cómo funciona?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-charcoal-muted">
              Somos una plataforma dedicada al diseño y entrega periódica de
              arreglos florales. En lugar de realizar pedidos aislados desde
              cero cada vez, configuras tu suscripción una sola vez —eligiendo
              si es para ti o para regalar— y recibes flores frescas en el
              intervalo y horario que prefieras, con libertad para ajustar o
              cancelar tu plan desde tu cuenta de cliente.
            </p>
          </div>

          {/* Beneficios del club */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clubBenefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  className="flex flex-col rounded-2xl border border-cream-border bg-cream p-6 shadow-2xs"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-dusty/30 bg-rose-soft text-rose-dark"
                    aria-hidden="true"
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-charcoal">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PRESENTACIÓN DE PLANES */}
      <section
        id="planes-florales"
        aria-labelledby="planes-heading"
        className="border-b border-cream-border bg-cream py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sage-deep">
              Catálogo de planes
            </span>
            <h2
              id="planes-heading"
              className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              Tres tamaños pensados para cada rincón
            </h2>
            <p className="mt-3 text-base text-charcoal-muted">
              El precio base por entrega depende del tamaño elegido y se
              actualiza instantáneamente al agregar flores especiales o
              complementos en el configurador.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {FLORAL_PLANS.map((plan) => {
              const basePrice = SIZE_PRICES[PLAN_TO_SIZE[plan.id]];
              return (
                <article
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-2xl border-2 bg-cream-ivory p-6 shadow-sm transition ${
                    plan.badge
                      ? "border-rose-deep ring-2 ring-rose-soft"
                      : "border-cream-border"
                  }`}
                >
                  <div>
                    <div className="relative mb-5 overflow-hidden rounded-xl border border-cream-border">
                      <BotanicalIllustration
                        variant={plan.id}
                        alt={plan.imageAlt}
                        className="h-48 w-full object-cover"
                      />
                      {plan.badge && (
                        <span className="absolute top-3 right-3 rounded-full border border-rose-dark bg-rose-dark px-3 py-1 text-xs font-semibold text-cream-ivory shadow-xs">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-charcoal">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose-dark">
                      {plan.tagline}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1.5 border-y border-cream-border py-3">
                      <span className="text-xs font-medium text-charcoal-muted">
                        Desde
                      </span>
                      <span className="font-serif text-3xl font-bold text-charcoal">
                        {formatPEN(basePrice)}
                      </span>
                      <span className="text-xs text-charcoal-muted">
                        por entrega / ciclo
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
                      {plan.description}
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-charcoal">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <Link
                      href={`/suscripciones?plan=${plan.id}`}
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-rose-dark px-5 py-3 text-sm font-semibold text-cream-ivory transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
                    >
                      <span>Elegir {plan.name} y personalizar</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FUNCIONAMIENTO DE LAS SUSCRIPCIONES */}
      <section
        aria-labelledby="funcionamiento-heading"
        className="border-b border-cream-border bg-cream-ivory py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-dark">
              Proceso paso a paso
            </span>
            <h2
              id="funcionamiento-heading"
              className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              Cómo contratar y gestionar tu suscripción
            </h2>
            <p className="mt-3 text-base text-charcoal-muted">
              Hemos diseñado un flujo guiado y transparente para que sepas en
              todo momento qué información necesitas y qué ocurrirá al confirmar.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-cream-border bg-cream p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-dark font-serif text-sm font-bold text-cream-ivory">
                    {item.step}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>

          {/* Cuadro explicativo de renovación y horarios */}
          <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border-2 border-sage/30 bg-sage-light/60 p-6 md:grid-cols-2">
            <div className="flex items-start gap-3.5">
              <RefreshCw
                className="mt-1 h-6 w-6 shrink-0 text-sage-deep"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal">
                  Política transparente de renovación automática
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-charcoal-muted">
                  Cada ciclo de cobro corresponde a una entrega (semanal cada 7
                  días, quincenal cada 14 días, mensual cada mes calendario). Tu
                  suscripción se renueva automáticamente cada ciclo y puedes
                  cancelar cuando quieras sin penalidad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <Clock
                className="mt-1 h-6 w-6 shrink-0 text-rose-dark"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal">
                  Turnos de entrega en horario de Lima (America/Lima)
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-charcoal-muted">
                  Selecciona entre el{" "}
                  <strong>Turno Mañana (9:00 a. m. a 1:00 p. m.)</strong> o el{" "}
                  <strong>Turno Tarde (3:00 p. m. a 6:00 p. m.)</strong>. El
                  horario elegido se mantendrá para tus entregas recurrentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES */}
      <section
        aria-labelledby="faq-heading"
        className="border-b border-cream-border bg-cream py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-dark">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span>Resolvemos tus dudas</span>
            </span>
            <h2
              id="faq-heading"
              className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              Preguntas frecuentes
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-cream-border bg-cream-ivory p-5 shadow-2xs"
              >
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-serif text-base font-bold text-charcoal focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep sm:text-lg">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="rounded-lg border border-cream-border bg-cream px-2.5 py-1 text-xs font-sans font-semibold text-rose-dark transition group-open:bg-rose-soft"
                  >
                    Ver respuesta
                  </span>
                </summary>
                <p className="mt-3 border-t border-cream-border pt-3 text-sm leading-relaxed text-charcoal-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA HACIA SUSCRIPCIONES */}
      <section
        aria-labelledby="cta-final-heading"
        className="bg-gradient-to-r from-rose-pastel via-cream-warm to-sage-light py-16"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <HeartHandshake
            className="mx-auto h-10 w-10 text-rose-dark"
            aria-hidden="true"
          />
          <h2
            id="cta-final-heading"
            className="mt-4 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
          >
            ¿Listo para diseñar tu primer arreglo floral?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-charcoal-muted">
            Personaliza el tamaño, las flores, los colores y los complementos en
            menos de dos minutos.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/suscripciones"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-dark px-8 py-3.5 text-base font-semibold text-cream-ivory shadow-sm transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              <span>Ir a Suscripciones</span>
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-charcoal/20 bg-cream-ivory px-6 py-3.5 text-base font-semibold text-charcoal transition hover:border-rose-deep hover:bg-rose-pastel focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span>Conocer nuestra filosofía</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
