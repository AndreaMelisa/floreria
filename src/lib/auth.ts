import { ClientUser } from "@/types/domain";
import {
  loadRegisteredUsers,
  loadSessionUser,
  saveRegisteredUsers,
  saveSessionUser,
} from "./storage";

export const DEFAULT_CLIENT_ACCOUNT: ClientUser = {
  id: "usr_valeria_01",
  fullName: "Valeria Mendoza Ríos",
  email: "valeria@flores.pe",
  password: "flores123",
  phone: "987654321",
  address: "Av. Primavera 1420, Dpto. 402, Santiago de Surco",
  reference: "Frente al parque, edificio de ladrillo visto",
  createdAt: "2026-11-01T10:00:00.000Z",
};

export function ensureDefaultUsers(): ClientUser[] {
  const existing = loadRegisteredUsers();
  if (existing.length === 0) {
    const initial = [DEFAULT_CLIENT_ACCOUNT];
    saveRegisteredUsers(initial);
    return initial;
  }
  return existing;
}

export function getActiveClientUser(): ClientUser | null {
  ensureDefaultUsers();
  return loadSessionUser();
}

export function authenticateClient(
  email: string,
  password: string
): {
  success: boolean;
  user?: ClientUser;
  error?: string;
} {
  const users = ensureDefaultUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      success: false,
      error: "Ingresa tu correo electrónico para iniciar sesión.",
    };
  }

  if (!password) {
    return {
      success: false,
      error: "Ingresa tu contraseña.",
    };
  }

  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!found || found.password !== password) {
    return {
      success: false,
      error:
        "El correo o la contraseña no coinciden. Verifica tus datos o crea una cuenta nueva.",
    };
  }

  saveSessionUser(found);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("club-storage-updated"));
  }
  return { success: true, user: found };
}

export function registerClientAccount(params: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  reference?: string;
}): {
  success: boolean;
  user?: ClientUser;
  error?: string;
} {
  const users = ensureDefaultUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (params.fullName.trim().length < 3) {
    return {
      success: false,
      error: "Ingresa tu nombre y apellido completo (mínimo 3 caracteres).",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    return {
      success: false,
      error: "Ingresa un correo electrónico válido (ejemplo@dominio.com).",
    };
  }

  if (params.password.length < 6) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
    };
  }

  const digits = params.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 12) {
    return {
      success: false,
      error: "Ingresa un número de teléfono válido de 9 dígitos.",
    };
  }

  if (params.address.trim().length < 8) {
    return {
      success: false,
      error:
        "Ingresa tu dirección completa (calle/avenida, número y distrito).",
    };
  }

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return {
      success: false,
      error:
        "Ya existe una cuenta registrada con este correo electrónico. Inicia sesión con tu contraseña.",
    };
  }

  const newUser: ClientUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    fullName: params.fullName.trim(),
    email: normalizedEmail,
    password: params.password,
    phone: params.phone.trim(),
    address: params.address.trim(),
    reference: params.reference?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  const nextUsers = [newUser, ...users];
  saveRegisteredUsers(nextUsers);
  saveSessionUser(newUser);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("club-storage-updated"));
  }

  return { success: true, user: newUser };
}

export function logoutClient(): void {
  saveSessionUser(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("club-storage-updated"));
  }
}
