import React from "react";
import Link from "next/link";
import {
  Flower2,
  Heart,
  Sparkles,
  Leaf,
  CheckCircle2,
  Eye,
  Compass,
  Award,
  ArrowRight,
  CalendarHeart,
} from "lucide-react";
import { BotanicalIllustration } from "@/components/ui/BotanicalIllustration";

export default function NosotrosPage() {
  const coreValues = [
    {
      icon: Leaf,
      title: "Frescura y respeto botánico",
      description:
        "Priorizamos tallos de corte reciente y combinaciones que respetan el ciclo natural de apertura de cada flor.",
    },
    {
      icon: Heart,
      title: "Empatía y calidez humana",
      description:
        "Entendemos que cada arreglo acompaña un espacio personal o lleva un mensaje de afecto hacia alguien especial.",
    },
    {
      icon: Sparkles,
      title: "Claridad y transparencia",
      description:
        "Comunicamos de forma directa el precio por entrega, las frecuencias de renovación y el alcance de cada cambio.",
    },
    {
      icon: Award,
      title: "Diseño accesible para todos",
      description:
        "Construimos una experiencia digital comprensible, operable por teclado y clara en cada paso de personalización.",
    },
  ];

  const qualityCommitments = [
    "Selección cuidadosa de tallos principales, flores secundarias y follaje aromático.",
    "Hidratación controlada y entrega de sobre de nutriente floral en cada envío.",
    "Presentación protegida para conservar la estructura durante el traslado en el turno elegido.",
    "Guía práctica de corte en diagonal y recambio de agua para prolongar la vida en jarrón.",
    "Flexibilidad total para programar cambios comerciales para el siguiente ciclo o cancelar sin cargos ocultos.",
  ];

  return (
    <div>
      {/* 1. CABECERA E HISTORIA DE LA FLORERÍA */}
      <section
        aria-labelledby="nosotros-heading"
        className="border-b border-cream-border bg-gradient-to-br from-rose-pastel via-cream to-cream-ivory py-14 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-dusty/40 bg-cream-ivory px-3.5 py-1 text-xs font-semibold text-rose-dark">
                <Flower2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Nuestra identidad y propósito</span>
              </span>

              <h1
                id="nosotros-heading"
                className="mt-4 font-serif text-3xl font-bold leading-tight text-charcoal sm:text-5xl"
              >
                El origen de El club de las flores
              </h1>

              <div className="mt-5 space-y-4 text-base leading-relaxed text-charcoal-muted">
                <p>
                  <strong>El club de las flores</strong> nació como una
                  propuesta contemporánea de floristería por suscripción, creada
                  para acercar la belleza botánica a la vida cotidiana sin la
                  fricción de las compras esporádicas tradicionales.
                </p>
                <p>
                  Partimos de una idea sencilla: las flores no deberían
                  reservarse únicamente para fechas protocolares. Un arreglo
                  fresco en el escritorio, en la mesa del comedor o enviado como
                  un gesto constante de cariño transforma la atmósfera de
                  cualquier espacio y renueva el ánimo de quien lo recibe.
                </p>
                <p>
                  Nuestra propuesta une la sensibilidad del diseño floral con
                  una experiencia digital intuitiva y accesible, ofreciendo al
                  cliente control total sobre su plan, sus flores y sus horarios
                  de entrega.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <figure className="overflow-hidden rounded-3xl border-2 border-cream-border bg-cream-ivory p-3 shadow-lg">
                <BotanicalIllustration
                  variant="atelier-workshop"
                  alt="Ilustración fotográfica de nuestra mesa de taller botánico con tres jarrones de cerámica mostrando los tamaños Brote, Floración y Jardín"
                  className="h-auto w-full rounded-2xl"
                />
                <figcaption className="mt-2.5 px-2 text-center text-xs text-charcoal-muted">
                  Composición de referencia de nuestros tres tamaños: Brote,
                  Floración y Jardín.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISIÓN, VISIÓN Y VALORES */}
      <section
        aria-labelledby="mision-vision-heading"
        className="border-b border-cream-border bg-cream-ivory py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sage-deep">
              Principios rectores
            </span>
            <h2
              id="mision-vision-heading"
              className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              Misión, Visión y Valores
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <article className="rounded-2xl border-2 border-cream-border bg-cream p-7">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-soft text-rose-dark"
                  aria-hidden="true"
                >
                  <Compass className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Nuestra Misión
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-charcoal-muted sm:text-base">
                Brindar una experiencia de suscripción floral personalizada,
                clara y accesible, permitiendo que cada persona configure
                arreglos a su medida —para disfrutar en su propio espacio o para
                regalar— con total transparencia en precios, frecuencias y
                horarios de entrega.
              </p>
            </article>

            <article className="rounded-2xl border-2 border-cream-border bg-cream p-7">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-light text-sage-deep"
                  aria-hidden="true"
                >
                  <Eye className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Nuestra Visión
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-charcoal-muted sm:text-base">
                Consolidar un modelo de servicio floral centrado en el ser
                humano, donde la estética botánica y la usabilidad digital
                converjan para que contratar, personalizar o modificar una
                suscripción sea tan armónico y placentero como recibir las
                flores.
              </p>
            </article>
          </div>

          {/* Valores */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-cream-border bg-cream p-6"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-pastel text-rose-dark"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-charcoal">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FILOSOFÍA DE MARCA Y COMPROMISO CON LA CALIDAD */}
      <section
        aria-labelledby="filosofia-calidad-heading"
        className="border-b border-cream-border bg-cream py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <figure className="overflow-hidden rounded-3xl border-2 border-cream-border bg-cream-ivory p-3 shadow-md">
                <BotanicalIllustration
                  variant="botanical-curation"
                  alt="Ilustración fotográfica de curaduría floral con rosas en tonos pastel y empolvados acompañadas de ramas de eucalipto verde salvia"
                  className="h-auto w-full rounded-2xl"
                />
                <figcaption className="mt-2.5 px-2 text-center text-xs text-charcoal-muted">
                  Armonía cromática entre tonos rosa pastel, marfil y verde
                  salvia.
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-dark">
                Artesanía y cuidado
              </span>
              <h2
                id="filosofia-calidad-heading"
                className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-4xl"
              >
                Filosofía de marca y compromiso con la calidad
              </h2>

              <p className="mt-4 text-base leading-relaxed text-charcoal-muted">
                Nuestra filosofía concibe el diseño floral como un lenguaje
                sensorial. Combinamos tallos de apertura gradual —para que el
                arreglo evolucione día tras día— con paletas cromáticas
                cuidadosamente definidas: desde la serenidad de los blancos y
                verdes hasta la calidez de los tonos pastel o la energía de los
                colores intensos.
              </p>

              <div className="mt-6 rounded-2xl border border-cream-border bg-cream-ivory p-6">
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Nuestro estándar en cada entrega programada
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-charcoal">
                  {qualityCommitments.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GALERÍA DE ESTILOS Y CTA HACIA SUSCRIPCIONES */}
      <section
        aria-labelledby="galeria-cta-heading"
        className="bg-cream-ivory py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="galeria-cta-heading"
              className="font-serif text-2xl font-bold text-charcoal sm:text-4xl"
            >
              Nuestras colecciones botánicas
            </h2>
            <p className="mt-3 text-base text-charcoal-muted">
              Explora visualmente las tres escalas de composición que puedes
              personalizar en nuestra sección de suscripciones.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <figure className="rounded-2xl border border-cream-border bg-cream p-3">
              <BotanicalIllustration
                variant="brote"
                alt="Colección Brote: arreglo floral pequeño de 8 a 12 tallos para rincones acogedores"
                className="h-44 w-full rounded-xl object-cover"
              />
              <figcaption className="mt-3 px-1">
                <strong className="block font-serif text-base text-charcoal">
                  Escala Brote (Pequeño)
                </strong>
                <span className="text-xs text-charcoal-muted">
                  Delicadeza botánica para escritorios y mesas auxiliares.
                </span>
              </figcaption>
            </figure>

            <figure className="rounded-2xl border border-cream-border bg-cream p-3">
              <BotanicalIllustration
                variant="floracion"
                alt="Colección Floración: arreglo floral mediano de 15 a 20 tallos para centro de mesa"
                className="h-44 w-full rounded-xl object-cover"
              />
              <figcaption className="mt-3 px-1">
                <strong className="block font-serif text-base text-charcoal">
                  Escala Floración (Mediano)
                </strong>
                <span className="text-xs text-charcoal-muted">
                  Equilibrio de volumen y color para salas y comedores.
                </span>
              </figcaption>
            </figure>

            <figure className="rounded-2xl border border-cream-border bg-cream p-3">
              <BotanicalIllustration
                variant="jardin"
                alt="Colección Jardín: arreglo floral grande de 25 a 32 tallos de alto impacto visual"
                className="h-44 w-full rounded-xl object-cover"
              />
              <figcaption className="mt-3 px-1">
                <strong className="block font-serif text-base text-charcoal">
                  Escala Jardín (Grande)
                </strong>
                <span className="text-xs text-charcoal-muted">
                  Abundancia floral y estructura botánica protagonista.
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="mt-12 rounded-3xl border-2 border-rose-dusty/40 bg-gradient-to-r from-rose-pastel via-cream to-sage-light p-8 text-center sm:p-10">
            <h3 className="font-serif text-2xl font-bold text-charcoal sm:text-3xl">
              Lleva la experiencia de El club de las floresa tu espacio
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-charcoal-muted sm:text-base">
              Configura tu plan paso a paso, consulta el cálculo dinámico de
              precios en tiempo real y prueba el flujo completo de suscripción.
            </p>
            <div className="mt-6">
              <Link
                href="/suscripciones"
                className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-rose-dark px-8 py-3.5 text-base font-semibold text-cream-ivory shadow-sm transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
              >
                <CalendarHeart className="h-5 w-5" aria-hidden="true" />
                <span>Personalizar mi suscripción ahora</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
