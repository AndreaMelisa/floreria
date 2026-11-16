"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarHeart,
  FolderHeart,
  LogOut,
  RefreshCw,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { PLAN_TO_SIZE } from "@/config/pricing";
import { DEFAULT_CLIENT_ACCOUNT, getActiveClientUser, logoutClient } from "@/lib/auth";
import { SimulatedCheckoutOutcome } from "@/lib/payments";
import { processDueRenewals } from "@/lib/renewals";
import {
  clearDraft,
  createDefaultDraft,
  loadDeliveries,
  loadDraft,
  loadPayments,
  loadPreferences,
  loadSubscriptions,
  saveDeliveries,
  saveDraft,
  savePayments,
  savePreferences,
  saveSubscriptions,
} from "@/lib/storage";
import {
  cancelSubscription,
  checkoutSubscriptionFromDraft,
  markDeliveryDeliveredInDemoMode,
  scheduleCommercialModification,
  updateOperationalDetails,
} from "@/lib/subscriptions";
import {
  AddonId,
  ArrangementSize,
  ClientUser,
  ColorPalette,
  DeliveryShift,
  FlowerType,
  PlanId,
  ScheduledDelivery,
  SimulatedPayment,
  Subscription,
  SubscriptionDraft,
  SubscriptionFrequency,
} from "@/types/domain";
import { ClientAuthPanel } from "@/components/auth/ClientAuthPanel";
import { MySubscriptionsPanel } from "./MySubscriptionsPanel";
import { SubscriptionWizard } from "./SubscriptionWizard";

export function SubscriptionsHubClient() {
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(null);
  const [activeTab, setActiveTab] = useState<"contratar" | "mis-suscripciones">(
    "contratar"
  );
  const [draft, setDraft] = useState<SubscriptionDraft>(() =>
    createDefaultDraft()
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<SimulatedPayment[]>([]);
  const [deliveries, setDeliveries] = useState<ScheduledDelivery[]>([]);
  const [autoRenewalBanner, setAutoRenewalBanner] = useState<string[] | null>(
    null
  );

  const notifyStorageChange = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("club-storage-updated"));
    }
  };

  useEffect(() => {
    const syncAll = () => {
      const user = getActiveClientUser();
      setCurrentUser(user);

      const loadedDraft = loadDraft(user);
      const loadedSubs = loadSubscriptions();
      const loadedPayments = loadPayments();
      const loadedDeliveries = loadDeliveries();
      const prefs = loadPreferences();

      // Si viene ?plan=brote|floracion|jardin desde Inicio
      const planParam = searchParams?.get("plan") as PlanId | null;
      if (
        planParam &&
        (planParam === "brote" ||
          planParam === "floracion" ||
          planParam === "jardin")
      ) {
        loadedDraft.customization.planId = planParam;
        loadedDraft.customization.size = PLAN_TO_SIZE[planParam];
        saveDraft(loadedDraft);
      }

      // Procesar renovaciones vencidas al abrir la aplicación
      const renewalCheck = processDueRenewals({
        subscriptions: loadedSubs,
        payments: loadedPayments,
        deliveries: loadedDeliveries,
      });

      if (renewalCheck.processedCount > 0) {
        saveSubscriptions(renewalCheck.subscriptions);
        savePayments(renewalCheck.payments);
        saveDeliveries(renewalCheck.deliveries);
        setSubscriptions(renewalCheck.subscriptions);
        setPayments(renewalCheck.payments);
        setDeliveries(renewalCheck.deliveries);
        setAutoRenewalBanner(renewalCheck.summaryMessages);
      } else {
        setSubscriptions(loadedSubs);
        setPayments(loadedPayments);
        setDeliveries(loadedDeliveries);
      }

      setDraft(loadedDraft);
      if (prefs.lastVisitedTab && !planParam) {
        setActiveTab(prefs.lastVisitedTab);
      }
      setIsHydrated(true);
    };

    syncAll();
    window.addEventListener("club-storage-updated", syncAll);
    return () => {
      window.removeEventListener("club-storage-updated", syncAll);
    };
  }, [searchParams]);

  const handleAuthenticated = (user: ClientUser) => {
    setCurrentUser(user);
    setDraft((prev) => {
      const updated: SubscriptionDraft = {
        ...prev,
        userId: user.id,
        buyer: {
          fullName: prev.buyer.fullName || user.fullName,
          email: prev.buyer.email || user.email,
          phone: prev.buyer.phone || user.phone,
          address: prev.buyer.address || user.address,
          reference: prev.buyer.reference || user.reference || "",
        },
      };
      saveDraft(updated);
      return updated;
    });
  };

  const handleLogout = () => {
    logoutClient();
    setCurrentUser(null);
  };

  const handleSwitchTab = (tab: "contratar" | "mis-suscripciones") => {
    setActiveTab(tab);
    const prefs = loadPreferences();
    savePreferences({ ...prefs, lastVisitedTab: tab });
  };

  const handleUpdateDraft = (
    updater: (prev: SubscriptionDraft) => SubscriptionDraft
  ) => {
    setDraft((prev) => {
      const next = updater(prev);
      saveDraft(next);
      return next;
    });
  };

  const handleResetDraft = () => {
    clearDraft();
    const fresh = createDefaultDraft(currentUser);
    saveDraft(fresh);
    setDraft(fresh);
  };

  const handleExecuteCheckout = async (
    outcome: SimulatedCheckoutOutcome,
    paymentMethodSummary?: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const result = checkoutSubscriptionFromDraft({
      draft,
      outcome,
      subscriptions,
      payments,
      deliveries,
      userId: currentUser?.id,
      paymentMethodSummary,
    });

    setSubscriptions(result.subscriptions);
    setPayments(result.payments);
    setDeliveries(result.deliveries);

    saveSubscriptions(result.subscriptions);
    savePayments(result.payments);
    saveDeliveries(result.deliveries);
    notifyStorageChange();

    return {
      activated: result.activated,
      subscription: result.subscription,
      payment: result.payment,
      message: result.message,
    };
  };

  const handleScheduleCommercialChange = (
    subscriptionId: string,
    newConfig: {
      size: ArrangementSize;
      flowerType: FlowerType;
      colorPalette: ColorPalette;
      frequency: SubscriptionFrequency;
      addons: AddonId[];
    }
  ) => {
    const res = scheduleCommercialModification({
      subscriptionId,
      subscriptions,
      newConfig,
    });
    if (res.success) {
      setSubscriptions(res.subscriptions);
      saveSubscriptions(res.subscriptions);
      notifyStorageChange();
    }
    return { success: res.success, message: res.message };
  };

  const handleUpdateOperationalDetails = (
    subscriptionId: string,
    updates: {
      shift: DeliveryShift;
      dedication?: string;
      recipientName: string;
      deliveryAddress: string;
      deliveryReference?: string;
      recipientPhone?: string;
    }
  ) => {
    const res = updateOperationalDetails({
      subscriptionId,
      subscriptions,
      deliveries,
      updates,
    });
    if (res.success) {
      setSubscriptions(res.subscriptions);
      setDeliveries(res.deliveries);
      saveSubscriptions(res.subscriptions);
      saveDeliveries(res.deliveries);
      notifyStorageChange();
    }
    return { success: res.success, message: res.message };
  };

  const handleCancelSubscription = (
    subscriptionId: string,
    reason?: string
  ) => {
    const res = cancelSubscription({
      subscriptionId,
      reason,
      subscriptions,
      deliveries,
    });
    if (res.success) {
      setSubscriptions(res.subscriptions);
      setDeliveries(res.deliveries);
      saveSubscriptions(res.subscriptions);
      saveDeliveries(res.deliveries);
      notifyStorageChange();
    }
    return { success: res.success, message: res.message };
  };

  const handleMarkDeliveryDeliveredDemo = (deliveryId: string) => {
    const res = markDeliveryDeliveredInDemoMode({
      deliveryId,
      subscriptions,
      deliveries,
    });
    if (res.success) {
      setSubscriptions(res.subscriptions);
      setDeliveries(res.deliveries);
      saveSubscriptions(res.subscriptions);
      saveDeliveries(res.deliveries);
      notifyStorageChange();
    }
    return { success: res.success, message: res.message };
  };

  const handleSimulateNextCycleRenewal = (targetDateStr: string) => {
    const res = processDueRenewals({
      subscriptions,
      payments,
      deliveries,
      currentLimaDate: targetDateStr,
    });
    if (res.processedCount > 0) {
      setSubscriptions(res.subscriptions);
      setPayments(res.payments);
      setDeliveries(res.deliveries);
      saveSubscriptions(res.subscriptions);
      savePayments(res.payments);
      saveDeliveries(res.deliveries);
      notifyStorageChange();
    }
    return {
      processedCount: res.processedCount,
      summaryMessages: res.summaryMessages,
    };
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-cream-border bg-cream-ivory p-8 text-center text-sm text-charcoal-muted"
        >
          Cargando tus suscripciones...
        </div>
      </div>
    );
  }

  // Si el cliente aún no ha iniciado sesión, mostrar el panel de Login / Registro
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ClientAuthPanel onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  // Filtrar suscripciones, entregas y pagos para que pertenezcan exclusivamente al cliente autenticado
  const belongsToCurrentUser = (recordUserId?: string) =>
    recordUserId === currentUser.id ||
    (!recordUserId && currentUser.id === DEFAULT_CLIENT_ACCOUNT.id);

  const userSubscriptions = subscriptions.filter((s) =>
    belongsToCurrentUser(s.userId)
  );
  const userSubIds = new Set(userSubscriptions.map((s) => s.id));
  const userPayments = payments.filter(
    (p) => belongsToCurrentUser(p.userId) || userSubIds.has(p.subscriptionId)
  );
  const userDeliveries = deliveries.filter(
    (d) => belongsToCurrentUser(d.userId) || userSubIds.has(d.subscriptionId)
  );

  const activeCount = userSubscriptions.filter(
    (s) => s.status === "activa"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Barra de cuenta de cliente autenticada */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage/30 bg-sage-light/80 px-4 py-3 text-xs text-charcoal">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-sage-deep" aria-hidden="true" />
          <span>
            Sesión de cliente activa:{" "}
            <strong className="text-sage-deep">{currentUser.fullName}</strong> (
            {currentUser.email})
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border border-cream-border bg-cream-ivory px-3 py-1 font-semibold text-rose-dark transition hover:bg-rose-pastel"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Cambiar de cuenta / Cerrar sesión</span>
        </button>
      </div>

      {/* Encabezado de la Vista 3 */}
      <div className="flex flex-col justify-between gap-6 border-b border-cream-border pb-6 lg:flex-row lg:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-dusty/40 bg-rose-pastel px-3 py-1 text-xs font-semibold text-rose-dark">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mi cuenta de suscripciones</span>
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            Suscripciones de El club de las flores
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-charcoal-muted sm:text-base">
            Personaliza y contrata un arreglo floral recurrente para ti o para
            regalar, o consulta y gestiona tus suscripciones activas, entregas y
            pagos.
          </p>
        </div>

        {/* Selector de pestañas accesible dentro de la Vista 3 */}
        <div
          role="tablist"
          aria-label="Secciones de Suscripciones"
          className="inline-flex rounded-2xl border-2 border-cream-border bg-cream-ivory p-1.5"
        >
          <button
            type="button"
            role="tab"
            id="tab-contratar"
            aria-selected={activeTab === "contratar"}
            aria-controls="panel-contratar"
            onClick={() => handleSwitchTab("contratar")}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "contratar"
                ? "bg-rose-dark text-cream-ivory shadow-xs"
                : "text-charcoal hover:bg-cream-warm"
            }`}
          >
            <CalendarHeart className="h-4 w-4" aria-hidden="true" />
            <span>Contratar suscripción</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-mis-suscripciones"
            aria-selected={activeTab === "mis-suscripciones"}
            aria-controls="panel-mis-suscripciones"
            onClick={() => handleSwitchTab("mis-suscripciones")}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === "mis-suscripciones"
                ? "bg-rose-dark text-cream-ivory shadow-xs"
                : "text-charcoal hover:bg-cream-warm"
            }`}
          >
            <FolderHeart className="h-4 w-4" aria-hidden="true" />
            <span>Mis suscripciones</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === "mis-suscripciones"
                  ? "bg-cream-ivory text-rose-dark"
                  : "bg-sage-light text-sage-deep"
              }`}
            >
              {userSubscriptions.length}
              {activeCount > 0 ? ` (${activeCount} act.)` : ""}
            </span>
          </button>
        </div>
      </div>

      {/* Aviso si se procesaron renovaciones automáticas al abrir la app */}
      {autoRenewalBanner && autoRenewalBanner.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-2xl border-2 border-sage bg-sage-light p-4 text-xs text-sage-deep"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <RefreshCw
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <div>
                <strong className="block text-sm">
                  Renovaciones procesadas en tu cuenta:
                </strong>
                <ul className="mt-1 list-disc pl-4">
                  {autoRenewalBanner.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoRenewalBanner(null)}
              className="font-bold underline"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Contenido de la pestaña seleccionada */}
      <div className="mt-8">
        {activeTab === "contratar" ? (
          <div
            role="tabpanel"
            id="panel-contratar"
            aria-labelledby="tab-contratar"
          >
            <SubscriptionWizard
              currentUser={currentUser}
              draft={draft}
              onUpdateDraft={handleUpdateDraft}
              onExecuteCheckout={handleExecuteCheckout}
              onResetDraft={handleResetDraft}
              onGoToMySubscriptions={() => {
                handleResetDraft();
                handleSwitchTab("mis-suscripciones");
              }}
            />
          </div>
        ) : (
          <div
            role="tabpanel"
            id="panel-mis-suscripciones"
            aria-labelledby="tab-mis-suscripciones"
          >
            <MySubscriptionsPanel
              subscriptions={userSubscriptions}
              payments={userPayments}
              deliveries={userDeliveries}
              onStartNewSubscription={() => {
                handleResetDraft();
                handleSwitchTab("contratar");
              }}
              onScheduleCommercialChange={handleScheduleCommercialChange}
              onUpdateOperationalDetails={handleUpdateOperationalDetails}
              onCancelSubscription={handleCancelSubscription}
              onMarkDeliveryDeliveredDemo={handleMarkDeliveryDeliveredDemo}
              onSimulateNextCycleRenewal={handleSimulateNextCycleRenewal}
            />
          </div>
        )}
      </div>
    </div>
  );
}
