import React from "react";

export type FloralSceneVariant =
  | "hero-bouquet"
  | "brote"
  | "floracion"
  | "jardin"
  | "atelier-workshop"
  | "botanical-curation";

const SCENE_SVG_MAP: Record<FloralSceneVariant, string> = {
  "hero-bouquet": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FDF4F6"/>
        <stop offset="50%" stop-color="#FAF7F2"/>
        <stop offset="100%" stop-color="#EEF3EE"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <circle cx="400" cy="280" r="210" fill="#F7E2E7" opacity="0.7"/>
    <!-- Follaje Verde Salvia -->
    <path d="M400 450 Q280 320 230 190 Q310 230 400 380 Z" fill="#4A6B53" opacity="0.85"/>
    <path d="M400 450 Q520 320 570 190 Q490 230 400 380 Z" fill="#2E4736" opacity="0.8"/>
    <path d="M400 440 Q330 250 320 120 Q380 200 400 370 Z" fill="#688B70"/>
    <path d="M400 440 Q470 250 480 120 Q420 200 400 370 Z" fill="#4A6B53"/>
    <!-- Jarrón de cerámica crema -->
    <path d="M330 390 L470 390 L490 540 Q400 565 310 540 Z" fill="#F3EDE2" stroke="#B85D73" stroke-width="3"/>
    <path d="M320 390 Q400 405 480 390" fill="none" stroke="#8C3B50" stroke-width="4"/>
    <!-- Cinta rosa empolvado -->
    <path d="M335 435 Q400 450 465 435" fill="none" stroke="#B85D73" stroke-width="8"/>
    <path d="M400 442 L375 505 M400 442 L425 505" stroke="#B85D73" stroke-width="6" stroke-linecap="round"/>
    <!-- Flores principales -->
    <g transform="translate(400,230)">
      <circle r="54" fill="#B85D73"/>
      <circle r="38" fill="#D98A9C"/>
      <circle r="22" fill="#F7E2E7"/>
      <circle r="9" fill="#8C3B50"/>
    </g>
    <g transform="translate(310,260)">
      <circle r="44" fill="#D98A9C"/>
      <circle r="28" fill="#FDF4F6"/>
      <circle r="12" fill="#B85D73"/>
    </g>
    <g transform="translate(490,265)">
      <circle r="46" fill="#8C3B50"/>
      <circle r="30" fill="#D98A9C"/>
      <circle r="14" fill="#FAF7F2"/>
    </g>
    <g transform="translate(355,165)">
      <circle r="36" fill="#FAF7F2" stroke="#D98A9C" stroke-width="3"/>
      <circle r="18" fill="#F7E2E7"/>
      <circle r="7" fill="#B85D73"/>
    </g>
    <g transform="translate(450,170)">
      <circle r="38" fill="#F7E2E7" stroke="#B85D73" stroke-width="3"/>
      <circle r="20" fill="#B85D73"/>
      <circle r="8" fill="#FAF7F2"/>
    </g>
    <g transform="translate(260,330)">
      <circle r="30" fill="#FAF7F2" stroke="#B85D73" stroke-width="2"/>
      <circle r="12" fill="#D98A9C"/>
    </g>
    <g transform="translate(540,330)">
      <circle r="32" fill="#F7E2E7" stroke="#8C3B50" stroke-width="2"/>
      <circle r="13" fill="#8C3B50"/>
    </g>
  </svg>`,
  brote: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="600" height="420">
    <rect width="600" height="420" fill="#FDF4F6"/>
    <circle cx="300" cy="200" r="145" fill="#FAF7F2"/>
    <path d="M300 310 Q250 220 225 145 Q275 180 300 280 Z" fill="#4A6B53"/>
    <path d="M300 310 Q350 220 375 145 Q325 180 300 280 Z" fill="#688B70"/>
    <path d="M260 280 L340 280 L350 375 Q300 390 250 375 Z" fill="#FFFEFB" stroke="#B85D73" stroke-width="3"/>
    <circle cx="300" cy="195" r="36" fill="#D98A9C"/>
    <circle cx="300" cy="195" r="18" fill="#FDF4F6"/>
    <circle cx="255" cy="220" r="28" fill="#B85D73"/>
    <circle cx="255" cy="220" r="12" fill="#FAF7F2"/>
    <circle cx="345" cy="220" r="28" fill="#F7E2E7" stroke="#B85D73" stroke-width="2"/>
    <circle cx="345" cy="220" r="10" fill="#8C3B50"/>
  </svg>`,
  floracion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="600" height="420">
    <rect width="600" height="420" fill="#FAF7F2"/>
    <circle cx="300" cy="200" r="160" fill="#F7E2E7"/>
    <path d="M300 320 Q220 220 185 130 Q255 170 300 285 Z" fill="#4A6B53"/>
    <path d="M300 320 Q380 220 415 130 Q345 170 300 285 Z" fill="#2E4736"/>
    <path d="M245 275 L355 275 L370 380 Q300 395 230 380 Z" fill="#F3EDE2" stroke="#8C3B50" stroke-width="3"/>
    <circle cx="300" cy="180" r="44" fill="#B85D73"/>
    <circle cx="300" cy="180" r="22" fill="#FAF7F2"/>
    <circle cx="240" cy="210" r="34" fill="#8C3B50"/>
    <circle cx="240" cy="210" r="16" fill="#F7E2E7"/>
    <circle cx="360" cy="210" r="34" fill="#D98A9C"/>
    <circle cx="360" cy="210" r="16" fill="#FFFEFB"/>
    <circle cx="270" cy="135" r="26" fill="#FFFEFB" stroke="#B85D73" stroke-width="2"/>
    <circle cx="335" cy="135" r="26" fill="#F7E2E7" stroke="#8C3B50" stroke-width="2"/>
  </svg>`,
  jardin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="600" height="420">
    <rect width="600" height="420" fill="#EEF3EE"/>
    <circle cx="300" cy="200" r="175" fill="#FAF7F2"/>
    <path d="M300 330 Q190 210 150 105 Q240 155 300 290 Z" fill="#2E4736"/>
    <path d="M300 330 Q410 210 450 105 Q360 155 300 290 Z" fill="#4A6B53"/>
    <path d="M235 280 L365 280 L385 385 Q300 402 215 385 Z" fill="#FFFEFB" stroke="#5C2131" stroke-width="3"/>
    <circle cx="300" cy="170" r="48" fill="#8C3B50"/>
    <circle cx="300" cy="170" r="25" fill="#F7E2E7"/>
    <circle cx="225" cy="195" r="38" fill="#B85D73"/>
    <circle cx="225" cy="195" r="18" fill="#FFFEFB"/>
    <circle cx="375" cy="195" r="38" fill="#B85D73"/>
    <circle cx="375" cy="195" r="18" fill="#FFFEFB"/>
    <circle cx="255" cy="120" r="32" fill="#D98A9C"/>
    <circle cx="345" cy="120" r="32" fill="#D98A9C"/>
    <circle cx="195" cy="250" r="28" fill="#F7E2E7" stroke="#8C3B50" stroke-width="2"/>
    <circle cx="405" cy="250" r="28" fill="#F7E2E7" stroke="#8C3B50" stroke-width="2"/>
  </svg>`,
  "atelier-workshop": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 460" width="700" height="460">
    <rect width="700" height="460" fill="#FAF7F2"/>
    <rect x="40" y="40" width="620" height="380" rx="24" fill="#F3EDE2" stroke="#E5DDD0" stroke-width="3"/>
    <rect x="90" y="310" width="520" height="22" rx="8" fill="#8C3B50"/>
    <!-- Tres jarrones en mesa de taller -->
    <path d="M160 220 L220 220 L230 310 L150 310 Z" fill="#FFFEFB" stroke="#4A6B53" stroke-width="3"/>
    <circle cx="190" cy="180" r="38" fill="#D98A9C"/>
    <circle cx="190" cy="180" r="18" fill="#FAF7F2"/>
    <path d="M315 190 L385 190 L400 310 L300 310 Z" fill="#FDF4F6" stroke="#B85D73" stroke-width="3"/>
    <circle cx="350" cy="145" r="46" fill="#8C3B50"/>
    <circle cx="350" cy="145" r="22" fill="#F7E2E7"/>
    <path d="M480 210 L540 210 L550 310 L470 310 Z" fill="#EEF3EE" stroke="#2E4736" stroke-width="3"/>
    <circle cx="510" cy="165" r="40" fill="#4A6B53"/>
    <circle cx="510" cy="165" r="20" fill="#D5E2D6"/>
  </svg>`,
  "botanical-curation": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 460" width="700" height="460">
    <rect width="700" height="460" fill="#FDF4F6"/>
    <circle cx="350" cy="230" r="180" fill="#FFFEFB" stroke="#E5DDD0" stroke-width="3"/>
    <path d="M230 310 Q350 140 470 310" fill="none" stroke="#4A6B53" stroke-width="8" stroke-linecap="round"/>
    <circle cx="280" cy="220" r="42" fill="#B85D73"/>
    <circle cx="280" cy="220" r="20" fill="#FAF7F2"/>
    <circle cx="420" cy="220" r="42" fill="#8C3B50"/>
    <circle cx="420" cy="220" r="20" fill="#F7E2E7"/>
    <circle cx="350" cy="170" r="36" fill="#D98A9C"/>
    <circle cx="350" cy="170" r="15" fill="#FFFEFB"/>
  </svg>`,
};

interface BotanicalIllustrationProps {
  variant: FloralSceneVariant;
  alt: string;
  decorative?: boolean;
  className?: string;
}

export function BotanicalIllustration({
  variant,
  alt,
  decorative = false,
  className = "w-full h-auto rounded-2xl",
}: BotanicalIllustrationProps) {
  const svgRaw = SCENE_SVG_MAP[variant] ?? SCENE_SVG_MAP["hero-bouquet"];
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgRaw)}`;

  return (
    <img
      src={dataUri}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? "true" : undefined}
      className={className}
      loading="lazy"
    />
  );
}
