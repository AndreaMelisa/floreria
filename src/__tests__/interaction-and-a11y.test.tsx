import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import axe from "axe-core";
import { SubscriptionWizard } from "@/components/subscriptions/SubscriptionWizard";
import { AccessibleModal } from "@/components/ui/AccessibleModal";
import { createDefaultDraft } from "@/lib/storage";
import { SubscriptionDraft } from "@/types/domain";

function WizardTestHarness({ initialStep = 1 }: { initialStep?: number }) {
  const [draft, setDraft] = useState<SubscriptionDraft>(() => ({
    ...createDefaultDraft(),
    step: initialStep,
  }));

  return (
    <SubscriptionWizard
      draft={draft}
      onUpdateDraft={(updater) => setDraft((prev) => updater(prev))}
      onExecuteCheckout={async (outcome) => ({
        activated: outcome === "exitoso",
        payment: {
          id: "pay_test_1",
          subscriptionId: "sub_test_1",
          cycleNumber: 1,
          cycleId: "sub_test_1_cycle_1",
          amount: 95,
          currency: "PEN",
          status: outcome,
          simulatedOutcome: outcome,
          reason: "Simulación de prueba",
          createdAt: new Date().toISOString(),
          periodDate: draft.firstDeliveryDate,
        },
        message:
          outcome === "rechazado"
            ? "El pago simulado fue rechazado. Tu suscripción aún no se ha activado; puedes reintentar el pago demostrativo."
            : "Pago simulado procesado.",
      })}
      onResetDraft={() => setDraft(createDefaultDraft())}
      onGoToMySubscriptions={vi.fn()}
    />
  );
}

describe("Interacción y Accesibilidad (IHM) — El club de las flores <3", () => {
  it("1. Mapeo y Feedback: cambiar tamaño actualiza instantáneamente el precio en el resumen dinámico sin recargar", () => {
    render(<WizardTestHarness initialStep={2} />);

    // Por defecto es Mediano (Floración) = S/ 95.00
    expect(screen.getByTestId("summary-price-per-delivery")).toHaveTextContent(
      "S/ 95.00"
    );

    // Seleccionar tamaño Grande (Jardín) = S/ 135.00
    const largeBtn = screen.getByRole("button", { name: /Grande \(Jardín\)/i });
    fireEvent.click(largeBtn);

    expect(largeBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("summary-price-per-delivery")).toHaveTextContent(
      "S/ 135.00"
    );
    expect(screen.getByTestId("live-region-announcer")).toHaveTextContent(
      /S\/ 135\.00/
    );
  });

  it("2. Mapeo condicional: elegir 'Para regalar' muestra el formulario del destinatario con etiquetas accesibles", () => {
    render(<WizardTestHarness initialStep={3} />);

    expect(screen.queryByTestId("recipient-fieldset")).not.toBeInTheDocument();

    const giftButton = screen.getByRole("button", {
      name: /Para regalar a otra persona/i,
    });
    fireEvent.click(giftButton);

    expect(giftButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("recipient-fieldset")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Nombre completo del destinatario/i)
    ).toBeInTheDocument();
  });

  it("3. Restricciones: impide continuar en el paso de entrega si no se ha seleccionado un turno y muestra mensaje claro", () => {
    render(<WizardTestHarness initialStep={4} />);

    const continueBtn = screen.getByRole("button", {
      name: /Revisar mi suscripción/i,
    });
    fireEvent.click(continueBtn);

    // Debe permanecer en el paso 4 y mostrar alerta explicando que falta seleccionar turno
    expect(screen.getByRole("alert")).toHaveTextContent(/Selecciona un turno/i);

    // Ahora seleccionamos el Turno Mañana
    const morningRadio = screen.getByRole("radio", { name: /Turno Mañana/i });
    fireEvent.click(morningRadio);

    expect(screen.getByTestId("summary-selected-shift")).toHaveTextContent(
      /9:00 a\. m\. a 1:00 p\. m\./i
    );
  });

  it("4. Pago con tarjeta de crédito o débito: valida los datos de la tarjeta y procesa automáticamente el pago exitoso", async () => {
    const onExecuteCheckout = vi.fn().mockResolvedValue({
      activated: true,
      subscription: {
        id: "sub_test_1",
        userId: "usr_valeria_01",
        code: "FLORES-0001",
        status: "activa",
        modality: "propio",
        customization: createDefaultDraft().customization,
        buyer: {
          fullName: "Valeria Mendoza",
          email: "valeria@flores.pe",
          phone: "987654321",
          address: "Av. Primavera 1420",
        },
        firstDeliveryDate: "2026-11-16",
        nextBillingDate: "2026-11-30",
        shift: "manana",
        pricePerDelivery: 95,
        currentCycle: 1,
        paymentMethodSummary: "Tarjeta de Crédito •••• 2222",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      payment: {
        id: "pay_test_1",
        subscriptionId: "sub_test_1",
        cycleNumber: 1,
        cycleId: "sub_test_1_cycle_1",
        amount: 95,
        currency: "PEN",
        status: "exitoso",
        simulatedOutcome: "exitoso",
        reason: "Pago con tarjeta procesado correctamente.",
        createdAt: new Date().toISOString(),
        periodDate: "2026-11-16",
      },
      message: "Pago procesado correctamente. Tu suscripción ha sido activada.",
    });

    const draft = { ...createDefaultDraft(), step: 6, shift: "manana" as const };
    render(
      <SubscriptionWizard
        draft={draft}
        onUpdateDraft={vi.fn()}
        onExecuteCheckout={onExecuteCheckout}
        onResetDraft={vi.fn()}
        onGoToMySubscriptions={vi.fn()}
      />
    );

    // Intentar enviar sin llenar la tarjeta muestra errores de validación
    const payBtn = screen.getByRole("button", {
      name: /Pagar S\/ 95\.00 y activar suscripción/i,
    });
    fireEvent.click(payBtn);
    expect(onExecuteCheckout).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(/Ingresa los 16 dígitos de tu tarjeta/i).length
    ).toBeGreaterThan(0);

    // Llenar formulario de tarjeta de crédito o débito
    fireEvent.change(screen.getByLabelText(/Número de tarjeta/i), {
      target: { value: "4532000011112222" },
    });
    fireEvent.change(screen.getByLabelText(/Nombre del titular/i), {
      target: { value: "VALERIA MENDOZA" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha de vencimiento/i), {
      target: { value: "0829" },
    });
    fireEvent.change(screen.getByLabelText(/Código de seguridad/i), {
      target: { value: "123" },
    });

    fireEvent.click(payBtn);

    expect(onExecuteCheckout).toHaveBeenCalledWith(
      "exitoso",
      "Tarjeta de Crédito •••• 2222"
    );
  });

  it("5. Tecnologías de Apoyo: AccessibleModal gestiona el foco, no pierde el foco al escribir y se cierra con la tecla Escape", async () => {
    const onClose = vi.fn();

    function ModalTypingHarness() {
      const [text, setText] = useState("");
      return (
        <AccessibleModal
          isOpen={true}
          onClose={() => onClose()}
          title="Modal de prueba accesible"
          description="Descripción accesible del modal"
        >
          <label htmlFor="modal-input">Campo editable</label>
          <input
            id="modal-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="button">Acción interna</button>
        </AccessibleModal>
      );
    }

    render(<ModalTypingHarness />);

    const dialog = screen.getByRole("dialog", {
      name: "Modal de prueba accesible",
    });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const input = screen.getByLabelText("Campo editable");
    input.focus();
    expect(document.activeElement).toBe(input);

    // Escribir varios caracteres seguidos causando re-renderizados con onClose inline
    fireEvent.change(input, { target: { value: "A" } });
    fireEvent.change(input, { target: { value: "Av" } });
    fireEvent.change(input, { target: { value: "Av. Primavera 1420" } });

    // Esperar más de 10ms para comprobar que el temporizador del modal no roba el foco
    await new Promise((r) => setTimeout(r, 30));
    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue("Av. Primavera 1420");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("6. Verificación automática de accesibilidad con axe-core en el flujo de suscripción", async () => {
    const { container } = render(<WizardTestHarness initialStep={1} />);
    const results = await axe.run(container, {
      rules: {
        // En jsdom no se calcula el renderizado de lienzo para color-contrast
        "color-contrast": { enabled: false },
      },
    });
    expect(results.violations).toHaveLength(0);
  });
});
