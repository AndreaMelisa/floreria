"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flower2,
  Menu,
  X,
  Sparkles,
  CalendarHeart,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { loadSubscriptions } from "@/lib/storage";
import { getActiveClientUser, logoutClient } from "@/lib/auth";
import { ClientUser } from "@/types/domain";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubsCount, setActiveSubsCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null);

  useEffect(() => {
    const syncState = () => {
      const user = getActiveClientUser();
      setCurrentUser(user);

      if (user) {
        const subs = loadSubscriptions();
        const active = subs.filter(
          (s) => s.status === "activa" && s.userId === user.id
        ).length;
        setActiveSubsCount(active);
      } else {
        setActiveSubsCount(0);
      }
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener("club-storage-updated", syncState);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("club-storage-updated", syncState);
    };
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/nosotros", label: "Nosotros" },
    {
      href: "/suscripciones",
      label: "Suscripciones",
      badge:
        activeSubsCount > 0
          ? `${activeSubsCount} activa${activeSubsCount > 1 ? "s" : ""}`
          : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cream-border bg-cream-ivory/95 backdrop-blur-md">
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-rose-dark focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream-ivory focus:shadow-lg focus:outline-3 focus:outline-offset-2 focus:outline-rose-deep"
      >
        Saltar al contenido principal
      </a>

      {/* Barra superior informativa comercial */}
      <div className="border-b border-cream-border bg-rose-pastel px-4 py-1.5 text-center text-xs text-charcoal">
        <span className="font-semibold text-rose-dark">
          Suscripciones florales personalizadas:
        </span>{" "}
        Entregas programadas en Turno Mañana (9:00 a. m. - 1:00 p. m.) y Turno Tarde (3:00 p. m. - 6:00 p. m.) · Lima, Perú (PEN S/).
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-xl p-1 text-charcoal transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-dusty/40 bg-rose-soft text-rose-dark transition group-hover:bg-rose-dusty group-hover:text-cream-ivory"
            aria-hidden="true"
          >
            <Flower2 className="h-5 w-5" />
          </span>
          <div>
            <span className="block font-serif text-lg font-bold tracking-tight text-charcoal sm:text-xl">
              El club de las flores {"<3"}
            </span>
            <span className="block text-xs text-charcoal-muted">
              Suscripciones botánicas en Lima
            </span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-2 md:flex"
        >
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep ${
                  isActive
                    ? "border-2 border-rose-deep bg-rose-soft font-bold text-rose-dark"
                    : "border-2 border-transparent text-charcoal hover:bg-cream-warm"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full border border-sage bg-sage-light px-2 py-0.5 text-xs font-semibold text-sage-deep">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl border border-cream-border bg-cream px-3 py-1.5 text-xs">
              <User className="h-4 w-4 text-sage-deep" aria-hidden="true" />
              <span className="font-semibold text-charcoal">
                {currentUser.fullName.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={() => logoutClient()}
                aria-label="Cerrar sesión de cliente"
                className="ml-1 inline-flex items-center gap-1 rounded-lg border border-cream-border bg-cream-ivory px-2 py-1 text-xs font-semibold text-rose-dark transition hover:bg-rose-soft"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <Link
              href="/suscripciones"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-cream-border bg-cream px-3.5 py-2 text-xs font-semibold text-charcoal transition hover:bg-rose-pastel"
            >
              <LogIn className="h-4 w-4 text-rose-dark" aria-hidden="true" />
              <span>Iniciar sesión</span>
            </Link>
          )}

          <Link
            href="/suscripciones"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-rose-dark px-5 py-2.5 text-sm font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Personalizar mi arreglo</span>
          </Link>
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="menu-movil-principal"
          aria-label={
            mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
          }
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-cream-border bg-cream p-2 text-charcoal transition hover:bg-rose-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Menú desplegable móvil */}
      {mobileMenuOpen && (
        <nav
          id="menu-movil-principal"
          aria-label="Navegación principal móvil"
          className="border-t border-cream-border bg-cream-ivory px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-[44px] items-center justify-between rounded-xl px-4 py-2.5 text-base font-medium transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-deep ${
                      isActive
                        ? "border-2 border-rose-deep bg-rose-soft font-bold text-rose-dark"
                        : "text-charcoal hover:bg-cream-warm"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full border border-sage bg-sage-light px-2.5 py-0.5 text-xs font-semibold text-sage-deep">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            {currentUser && (
              <li className="flex items-center justify-between rounded-xl border border-cream-border bg-cream px-4 py-2.5 text-xs">
                <span className="font-semibold text-charcoal">
                  Cliente: {currentUser.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logoutClient();
                    setMobileMenuOpen(false);
                  }}
                  className="font-bold text-rose-dark underline"
                >
                  Cerrar sesión
                </button>
              </li>
            )}
            <li className="pt-2">
              <Link
                href="/suscripciones"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-rose-dark px-5 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-rose-dark"
              >
                <CalendarHeart className="h-5 w-5" aria-hidden="true" />
                <span>Personalizar mi arreglo</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
