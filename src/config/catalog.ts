import {
  AddonId,
  ArrangementSize,
  ColorPalette,
  DeliveryShift,
  FloralPlan,
  FlowerType,
  SubscriptionFrequency,
} from "@/types/domain";
import { ADDON_PRICES, FLOWER_TYPE_PRICES, SIZE_PRICES } from "./pricing";

export const FLORAL_PLANS: FloralPlan[] = [
  {
    id: "brote",
    name: "Plan Brote",
    tagline: "Arreglo pequeño · Delicado y acogedor",
    description:
      "Pensado para escritorios, mesas de noche o rincones de lectura que buscan un toque fresco de naturaleza.",
    defaultSize: "pequeno",
    stemsEstimate: "8 a 12 tallos seleccionados",
    idealFor: "Espacios compactos, estudios y detalles cotidianos",
    features: [
      "8 a 12 tallos frescos de corte reciente",
      "Follaje botánico aromático de estación",
      "Sobre de nutriente floral para prolongar la frescura",
      "Guía impresa de cuidados básicos de tallos",
    ],
    imageAlt:
      "Arreglo floral pequeño del Plan Brote con flores frescas en tonos suaves sobre una mesa de madera clara",
  },
  {
    id: "floracion",
    name: "Plan Floración",
    tagline: "Arreglo mediano · Equilibrio y protagonismo",
    description:
      "Nuestra composición insignia para comedores, salas de estar o regalos llenos de afecto y presencia visual.",
    defaultSize: "mediano",
    stemsEstimate: "15 a 20 tallos seleccionados",
    idealFor: "Mesas principales, salas y obsequios especiales",
    badge: "Más elegido",
    features: [
      "15 a 20 tallos con flores focales y secundarias",
      "Combinación armónica de texturas y follaje verde salvia",
      "2 sobres de nutriente floral por entrega",
      "Guía de diseño y conservación en agua",
    ],
    imageAlt:
      "Arreglo floral mediano del Plan Floración con variedad equilibrada de flores y follaje botánico en un comedor luminoso",
  },
  {
    id: "jardin",
    name: "Plan Jardín",
    tagline: "Arreglo grande · Abundancia y distinción",
    description:
      "Una creación floral exuberante de gran volumen y altura para transformar ambientes amplios o celebrar ocasiones memorables.",
    defaultSize: "grande",
    stemsEstimate: "25 a 32 tallos seleccionados",
    idealFor: "Recibidores amplios, celebraciones y amantes de la botánica",
    badge: "Máxima presencia",
    features: [
      "25 a 32 tallos con variedades de apertura escalonada",
      "Estructura botánica de alto volumen y fragancia natural",
      "Nutriente floral para toda la semana y tarjeta de curaduría",
      "Atención preferente en selección de tallos",
    ],
    imageAlt:
      "Arreglo floral grande del Plan Jardín con abundante volumen de flores selectas y follaje estructurado",
  },
];

export interface SizeOption {
  id: ArrangementSize;
  name: string;
  planName: string;
  stems: string;
  dimensions: string;
  price: number;
  description: string;
}

export const SIZE_OPTIONS: SizeOption[] = [
  {
    id: "pequeno",
    name: "Pequeño (Brote)",
    planName: "Plan Brote",
    stems: "8 - 12 tallos",
    dimensions: "Altura aprox. 25 cm",
    price: SIZE_PRICES.pequeno,
    description: "Sutil y encantador para escritorios o mesas auxiliares.",
  },
  {
    id: "mediano",
    name: "Mediano (Floración)",
    planName: "Plan Floración",
    stems: "15 - 20 tallos",
    dimensions: "Altura aprox. 38 cm",
    price: SIZE_PRICES.mediano,
    description: "Volumen equilibrado ideal para centro de mesa o sala.",
  },
  {
    id: "grande",
    name: "Grande (Jardín)",
    planName: "Plan Jardín",
    stems: "25 - 32 tallos",
    dimensions: "Altura aprox. 50 cm",
    price: SIZE_PRICES.grande,
    description: "Arreglo abundante y frondoso de gran impacto visual.",
  },
];

export interface FlowerTypeOption {
  id: FlowerType;
  name: string;
  price: number;
  description: string;
  examples: string;
}

export const FLOWER_TYPE_OPTIONS: FlowerTypeOption[] = [
  {
    id: "temporada",
    name: "Flores de temporada",
    price: FLOWER_TYPE_PRICES.temporada,
    description: "Selección fresca según la cosecha de la estación.",
    examples: "Astromelias, claveles selectos, margaritas y follaje fresco",
  },
  {
    id: "mixtas",
    name: "Diseño mixto de autor",
    price: FLOWER_TYPE_PRICES.mixtas,
    description: "Combinación curada de diversas especies y texturas.",
    examples: "Lisianthus, gerberas, mini rosas, eucalipto y flor de cera",
  },
  {
    id: "rosas",
    name: "Selección de rosas",
    price: FLOWER_TYPE_PRICES.rosas,
    description: "Rosas de tallo largo e inglés acompañadas de follaje fino.",
    examples: "Rosas de jardín, rosas spray y eucalipto plateado",
  },
  {
    id: "premium",
    name: "Botánica premium",
    price: FLOWER_TYPE_PRICES.premium,
    description: "Especies de floristería de lujo y duración extendida.",
    examples: "Liliums perfumados, hortensias, tulipanes o ranúnculos según estación",
  },
];

export interface ColorPaletteOption {
  id: ColorPalette;
  name: string;
  description: string;
  swatchColors: string[];
  patternLabel: string;
}

export const COLOR_PALETTE_OPTIONS: ColorPaletteOption[] = [
  {
    id: "pastel",
    name: "Tonos pastel",
    description: "Rosa empolvado, durazno suave, lavanda y crema para transmitir calma.",
    swatchColors: ["#F4C2C2", "#FADADD", "#E6E6FA", "#FAF0E6"],
    patternLabel: "Suave y romántico",
  },
  {
    id: "intensos",
    name: "Colores intensos",
    description: "Carmesí, coral vibrante, fucsia y destellos cálidos llenos de energía.",
    swatchColors: ["#B8335A", "#E05A47", "#D93870", "#F2A65A"],
    patternLabel: "Vibrante y expresivo",
  },
  {
    id: "blancos",
    name: "Blancos y verdes",
    description: "Marfil, blanco puro y abundancia de hojas color verde salvia.",
    swatchColors: ["#FFFEFB", "#EAE6DF", "#8FA893", "#4A6B53"],
    patternLabel: "Sereno y luminoso",
  },
  {
    id: "sorpresa",
    name: "Sorpresa del florista",
    description: "Nuestros diseñadores eligen la paleta más armoniosa del día.",
    swatchColors: ["#D48C9E", "#E8C597", "#7D9B84", "#C3B1E1"],
    patternLabel: "Curaduría artística",
  },
];

export interface FrequencyOption {
  id: SubscriptionFrequency;
  name: string;
  intervalLabel: string;
  cycleDescription: string;
  daysInterval: number | "monthly";
  deliveriesPerMonthEstimate: number;
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    id: "semanal",
    name: "Semanal",
    intervalLabel: "Cada 7 días",
    cycleDescription: "Recibes y renuevas tu arreglo cada 7 días calendario.",
    daysInterval: 7,
    deliveriesPerMonthEstimate: 4,
  },
  {
    id: "quincenal",
    name: "Quincenal",
    intervalLabel: "Cada 14 días",
    cycleDescription: "Recibes y renuevas tu arreglo cada 14 días calendario.",
    daysInterval: 14,
    deliveriesPerMonthEstimate: 2,
  },
  {
    id: "mensual",
    name: "Mensual",
    intervalLabel: "Cada mes calendario",
    cycleDescription: "Recibes y renuevas tu arreglo una vez al mes.",
    daysInterval: "monthly",
    deliveriesPerMonthEstimate: 1,
  },
];

export interface AddonOption {
  id: AddonId;
  name: string;
  price: number;
  description: string;
}

export const ADDON_OPTIONS: AddonOption[] = [
  {
    id: "tarjeta",
    name: "Tarjeta caligráfica en papel algodón",
    price: ADDON_PRICES.tarjeta,
    description: "Sobre lacrado con tu dedicatoria impresa en papel texturizado.",
  },
  {
    id: "envoltura",
    name: "Envoltura especial de lino y cinta de seda",
    price: ADDON_PRICES.envoltura,
    description: "Presentación de regalo con tela botánica reutilizable y lazo.",
  },
  {
    id: "chocolates",
    name: "Caja de bombones artesanales (120 g)",
    price: ADDON_PRICES.chocolates,
    description: "Selección de chocolates peruanos con cacao al 65%.",
  },
];

export interface ShiftOption {
  id: DeliveryShift;
  name: string;
  schedule: string;
  description: string;
}

export const DELIVERY_SHIFTS: ShiftOption[] = [
  {
    id: "manana",
    name: "Turno Mañana",
    schedule: "9:00 a. m. a 1:00 p. m.",
    description: "Ideal para recibir las flores al iniciar el día en casa u oficina.",
  },
  {
    id: "tarde",
    name: "Turno Tarde",
    schedule: "3:00 p. m. a 6:00 p. m.",
    description: "Perfecto para entregas vespertinas o sorpresas al finalizar la jornada.",
  },
];
