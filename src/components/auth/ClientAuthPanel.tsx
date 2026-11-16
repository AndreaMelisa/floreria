"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  KeyRound,
  LogIn,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  authenticateClient,
  DEFAULT_CLIENT_ACCOUNT,
  registerClientAccount,
} from "@/lib/auth";
import { ClientUser } from "@/types/domain";

interface ClientAuthPanelProps {
  onAuthenticated: (user: ClientUser) => void;
}

export function ClientAuthPanel({ onAuthenticated }: ClientAuthPanelProps) {
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [error, setError] = useState<string | null>(null);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campos Registro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regReference, setRegReference] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = authenticateClient(loginEmail, loginPassword);
    if (!res.success || !res.user) {
      setError(res.error ?? "No se pudo iniciar sesión.");
      return;
    }
    onAuthenticated(res.user);
  };

  const handleQuickClientLogin = () => {
    setError(null);
    const res = authenticateClient(
      DEFAULT_CLIENT_ACCOUNT.email,
      DEFAULT_CLIENT_ACCOUNT.password
    );
    if (res.success && res.user) {
      onAuthenticated(res.user);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = registerClientAccount({
      fullName: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      address: regAddress,
      reference: regReference,
    });
    if (!res.success || !res.user) {
      setError(res.error ?? "No se pudo registrar la cuenta.");
      return;
    }
    onAuthenticated(res.user);
  };

  return (
    <section
      aria-labelledby="auth-panel-heading"
      className="mx-auto max-w-xl rounded-3xl border-2 border-cream-border bg-cream-ivory p-6 shadow-md sm:p-8"
    >
      <div className="text-center">
        <h2
          id="auth-panel-heading"
          className="mt-3 font-serif text-2xl font-bold text-charcoal sm:text-3xl"
        >
          {mode === "login"
            ? "Inicia sesión en tu cuenta"
            : "Crea tu cuenta de cliente"}
        </h2>
        <p className="mt-1.5 text-sm text-charcoal-muted">
          Tus suscripciones, direcciones y tarjetas asociadas se vinculan a tu
          cuenta personal de cliente.
        </p>
      </div>

      {/* Pestañas Iniciar sesión / Crear cuenta */}
      <div
        role="tablist"
        aria-label="Opciones de acceso de cliente"
        className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-cream-border bg-cream p-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
            mode === "login"
              ? "bg-rose-dark text-cream-ivory shadow-2xs"
              : "text-charcoal hover:bg-cream-warm"
          }`}
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          <span>Iniciar sesión</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={mode === "registro"}
          onClick={() => {
            setMode("registro");
            setError(null);
          }}
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
            mode === "registro"
              ? "bg-rose-dark text-cream-ivory shadow-2xs"
              : "text-charcoal hover:bg-cream-warm"
          }`}
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Crear cuenta nueva</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2 rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-xs font-semibold text-red-900"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {mode === "login" ? (
        <form onSubmit={handleLoginSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold text-charcoal"
            >
              Correo electrónico *
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="usuario@correo.pe"
              className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-semibold text-charcoal"
            >
              Contraseña *
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-rose-dark px-6 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            <span>Ingresar a mi cuenta</span>
          </button>

          {/* Acceso directo con cuenta de cliente pre-registrada */}
        </form>
      ) : (
        <form
          onSubmit={handleRegisterSubmit}
          noValidate
          className="mt-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="reg-name"
                className="block text-sm font-semibold text-charcoal"
              >
                Nombre y apellido completo *
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-semibold text-charcoal"
              >
                Correo electrónico *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="usuario@correo.pe"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm font-semibold text-charcoal"
              >
                Contraseña (mín. 6 caracteres) *
              </label>
              <input
                id="reg-password"
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-sm font-semibold text-charcoal"
              >
                Teléfono móvil (9 dígitos) *
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="987654321"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-address"
                className="block text-sm font-semibold text-charcoal"
              >
                Dirección principal *
              </label>
              <input
                id="reg-address"
                type="text"
                required
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="Av. / Calle, número y distrito"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-reference"
                className="block text-sm font-semibold text-charcoal"
              >
                Referencia de domicilio (opcional)
              </label>
              <input
                id="reg-reference"
                type="text"
                value={regReference}
                onChange={(e) => setRegReference(e.target.value)}
                placeholder="Ej.: Edificio blanco frente al parque"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border-2 border-cream-border bg-cream px-3.5 py-2 text-sm text-charcoal focus:border-rose-deep focus:bg-cream-ivory focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-rose-dark px-6 py-3 text-base font-semibold text-cream-ivory shadow-xs transition hover:bg-rose-deep"
          >
            <span>Registrarme e iniciar sesión</span>
          </button>
        </form>
      )}
    </section>
  );
}
