import {
  BuyerInfo,
  CardPaymentInput,
  DeliveryShift,
  RecipientInfo,
  SubscriptionModality,
} from "@/types/domain";
import { validateDeliveryDate } from "./calendar";

export const MAX_DEDICATION_LENGTH = 220;
export const MAX_NAME_LENGTH = 80;
export const MAX_ADDRESS_LENGTH = 140;
export const MAX_REFERENCE_LENGTH = 140;

export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS_REGEX = /^[0-9+\s()-]{7,15}$/;

export function validateBuyerInfo(buyer: BuyerInfo): ValidationErrors<keyof BuyerInfo> {
  const errors: ValidationErrors<keyof BuyerInfo> = {};

  const trimmedName = buyer.fullName.trim();
  if (!trimmedName) {
    errors.fullName =
      "Ingresa tu nombre y apellido completo (por ejemplo: Camila Quispe).";
  } else if (trimmedName.length < 3) {
    errors.fullName =
      "El nombre debe tener al menos 3 caracteres. Escribe tu nombre y apellido.";
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.fullName = `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
  }

  const trimmedEmail = buyer.email.trim();
  if (!trimmedEmail) {
    errors.email =
      "Ingresa tu correo electrónico para enviarte el resumen de tu suscripción.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email =
      "El formato del correo no es válido. Usa el formato nombre@dominio.com.";
  }

  const trimmedPhone = buyer.phone.trim();
  const digitsOnly = trimmedPhone.replace(/\D/g, "");
  if (!trimmedPhone) {
    errors.phone =
      "Ingresa un número de teléfono de contacto para coordinar la entrega.";
  } else if (
    !PHONE_DIGITS_REGEX.test(trimmedPhone) ||
    digitsOnly.length < 7 ||
    digitsOnly.length > 12
  ) {
    errors.phone =
      "Ingresa un teléfono válido de 9 dígitos (por ejemplo: 987 654 321).";
  }

  const trimmedAddress = buyer.address.trim();
  if (!trimmedAddress) {
    errors.address =
      "Completa tu dirección con calle, número y distrito para continuar.";
  } else if (trimmedAddress.length < 8) {
    errors.address =
      "La dirección es demasiado corta. Incluye avenida/calle, número y distrito.";
  } else if (trimmedAddress.length > MAX_ADDRESS_LENGTH) {
    errors.address = `La dirección no puede exceder los ${MAX_ADDRESS_LENGTH} caracteres.`;
  }

  if (buyer.reference && buyer.reference.length > MAX_REFERENCE_LENGTH) {
    errors.reference = `La referencia no puede superar los ${MAX_REFERENCE_LENGTH} caracteres.`;
  }

  return errors;
}

export function validateRecipientInfo(
  recipient: RecipientInfo
): ValidationErrors<keyof RecipientInfo> {
  const errors: ValidationErrors<keyof RecipientInfo> = {};

  const trimmedName = recipient.fullName.trim();
  if (!trimmedName) {
    errors.fullName =
      "Ingresa el nombre de la persona que recibirá el arreglo floral.";
  } else if (trimmedName.length < 3) {
    errors.fullName =
      "El nombre del destinatario debe tener al menos 3 caracteres.";
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.fullName = `El nombre del destinatario no puede superar los ${MAX_NAME_LENGTH} caracteres.`;
  }

  const trimmedPhone = recipient.phone.trim();
  const digitsOnly = trimmedPhone.replace(/\D/g, "");
  if (!trimmedPhone) {
    errors.phone =
      "Ingresa el teléfono del destinatario para que el repartidor pueda avisarle al llegar.";
  } else if (
    !PHONE_DIGITS_REGEX.test(trimmedPhone) ||
    digitsOnly.length < 7 ||
    digitsOnly.length > 12
  ) {
    errors.phone =
      "Ingresa un teléfono válido de 9 dígitos para el destinatario (ej.: 999 888 777).";
  }

  const trimmedAddress = recipient.address.trim();
  if (!trimmedAddress) {
    errors.address =
      "Completa la dirección exacta de entrega del destinatario (calle, número y distrito).";
  } else if (trimmedAddress.length < 8) {
    errors.address =
      "La dirección del destinatario debe incluir calle/avenida, número y distrito.";
  } else if (trimmedAddress.length > MAX_ADDRESS_LENGTH) {
    errors.address = `La dirección no puede exceder los ${MAX_ADDRESS_LENGTH} caracteres.`;
  }

  if (recipient.reference && recipient.reference.length > MAX_REFERENCE_LENGTH) {
    errors.reference = `La referencia no puede superar los ${MAX_REFERENCE_LENGTH} caracteres.`;
  }

  return errors;
}

export function validateDedication(dedication: string): string | undefined {
  if (dedication.length > MAX_DEDICATION_LENGTH) {
    return `La dedicatoria tiene ${dedication.length} caracteres y el límite máximo es de ${MAX_DEDICATION_LENGTH}. Reduce el texto para continuar.`;
  }
  return undefined;
}

export function validateStepRecipientAndBuyer(
  modality: SubscriptionModality,
  buyer: BuyerInfo,
  recipient: RecipientInfo
): {
  valid: boolean;
  buyerErrors: ValidationErrors<keyof BuyerInfo>;
  recipientErrors: ValidationErrors<keyof RecipientInfo>;
} {
  const buyerErrors = validateBuyerInfo(buyer);
  const recipientErrors =
    modality === "regalo" ? validateRecipientInfo(recipient) : {};

  const valid =
    Object.keys(buyerErrors).length === 0 &&
    Object.keys(recipientErrors).length === 0;

  return { valid, buyerErrors, recipientErrors };
}

export function validateStepDelivery(
  firstDeliveryDate: string,
  shift: DeliveryShift | "",
  todayLimaStr?: string
): {
  valid: boolean;
  dateError?: string;
  shiftError?: string;
} {
  const dateCheck = validateDeliveryDate(firstDeliveryDate, todayLimaStr);
  let shiftError: string | undefined;

  if (!shift || (shift !== "manana" && shift !== "tarde")) {
    shiftError =
      "Selecciona un turno de entrega (Mañana: 9:00 a. m. - 1:00 p. m. o Tarde: 3:00 p. m. - 6:00 p. m.) para continuar.";
  }

  return {
    valid: dateCheck.valid && !shiftError,
    dateError: dateCheck.error,
    shiftError,
  };
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function validateCardPaymentInput(
  input: CardPaymentInput
): ValidationErrors<keyof CardPaymentInput> {
  const errors: ValidationErrors<keyof CardPaymentInput> = {};

  const rawNumber = input.cardNumber.replace(/\D/g, "");
  if (!rawNumber) {
    errors.cardNumber =
      "Ingresa los 16 dígitos de tu tarjeta de crédito o débito.";
  } else if (rawNumber.length !== 16) {
    errors.cardNumber =
      "El número de tarjeta debe tener exactamente 16 dígitos.";
  }

  const trimmedHolder = input.cardHolder.trim();
  if (!trimmedHolder) {
    errors.cardHolder = "Ingresa el nombre del titular tal como figura en la tarjeta.";
  } else if (trimmedHolder.length < 3) {
    errors.cardHolder = "El nombre del titular debe tener al menos 3 caracteres.";
  }

  const expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(input.expiry.trim());
  if (!input.expiry.trim()) {
    errors.expiry = "Ingresa la fecha de vencimiento en formato MM/AA (ej.: 08/29).";
  } else if (!expiryMatch) {
    errors.expiry =
      "Formato de vencimiento inválido. Usa MM/AA con un mes entre 01 y 12.";
  }

  const rawCvv = input.cvv.replace(/\D/g, "");
  if (!rawCvv) {
    errors.cvv = "Ingresa el código de seguridad CVV de 3 o 4 dígitos.";
  } else if (rawCvv.length < 3 || rawCvv.length > 4) {
    errors.cvv = "El código CVV debe tener 3 o 4 dígitos numéricos.";
  }

  return errors;
}
