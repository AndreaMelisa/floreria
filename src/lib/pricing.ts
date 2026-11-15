import {
  ADDON_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  DELIVERY_SHIFTS,
  FLORAL_PLANS,
  FLOWER_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  SIZE_OPTIONS,
} from "@/config/catalog";
import {
  ADDON_PRICES,
  FLOWER_TYPE_PRICES,
  FREQUENCY_MONTHLY_MULTIPLIER,
  SIZE_PRICES,
} from "@/config/pricing";
import {
  AddonId,
  ArrangementSize,
  ColorPalette,
  DeliveryShift,
  FloralCustomization,
  FlowerType,
  PlanId,
  PriceBreakdown,
  SubscriptionFrequency,
} from "@/types/domain";

export function calculatePriceBreakdown(
  customization: Pick<FloralCustomization, "size" | "flowerType" | "addons" | "frequency">
): PriceBreakdown {
  const sizePrice = SIZE_PRICES[customization.size] ?? 0;
  const flowerTypePrice = FLOWER_TYPE_PRICES[customization.flowerType] ?? 0;

  const uniqueAddons = Array.from(new Set(customization.addons));
  const addonsDetail = uniqueAddons.map((addonId) => {
    const option = ADDON_OPTIONS.find((a) => a.id === addonId);
    const price = ADDON_PRICES[addonId] ?? 0;
    return {
      id: addonId,
      name: option?.name ?? addonId,
      price,
    };
  });

  const addonsPrice = addonsDetail.reduce((acc, item) => acc + item.price, 0);
  const pricePerDelivery = sizePrice + flowerTypePrice + addonsPrice;
  const pricePerBillingCycle = pricePerDelivery; // Cada ciclo corresponde a 1 entrega
  const deliveriesPerMonthEstimate =
    FREQUENCY_MONTHLY_MULTIPLIER[customization.frequency] ?? 1;
  const estimatedMonthlyPrice = pricePerDelivery * deliveriesPerMonthEstimate;

  return {
    sizePrice,
    flowerTypePrice,
    addonsPrice,
    addonsDetail,
    pricePerDelivery,
    pricePerBillingCycle,
    estimatedMonthlyPrice,
    deliveriesPerMonthEstimate,
    currency: "PEN",
  };
}

export function getPlanLabel(planId: PlanId): string {
  return FLORAL_PLANS.find((p) => p.id === planId)?.name ?? planId;
}

export function getSizeLabel(size: ArrangementSize): string {
  return SIZE_OPTIONS.find((s) => s.id === size)?.name ?? size;
}

export function getFlowerTypeLabel(flowerType: FlowerType): string {
  return FLOWER_TYPE_OPTIONS.find((f) => f.id === flowerType)?.name ?? flowerType;
}

export function getColorPaletteLabel(color: ColorPalette): string {
  return COLOR_PALETTE_OPTIONS.find((c) => c.id === color)?.name ?? color;
}

export function getFrequencyLabel(frequency: SubscriptionFrequency): string {
  return FREQUENCY_OPTIONS.find((f) => f.id === frequency)?.name ?? frequency;
}

export function getFrequencyIntervalLabel(frequency: SubscriptionFrequency): string {
  return FREQUENCY_OPTIONS.find((f) => f.id === frequency)?.intervalLabel ?? frequency;
}

export function getShiftLabel(shift: DeliveryShift): string {
  const found = DELIVERY_SHIFTS.find((s) => s.id === shift);
  return found ? `${found.name} (${found.schedule})` : shift;
}

export function getAddonLabel(addonId: AddonId): string {
  return ADDON_OPTIONS.find((a) => a.id === addonId)?.name ?? addonId;
}

export function formatCustomizationSummary(customization: FloralCustomization): string {
  const plan = getPlanLabel(customization.planId);
  const size = getSizeLabel(customization.size);
  const flowers = getFlowerTypeLabel(customization.flowerType);
  const colors = getColorPaletteLabel(customization.colorPalette);
  const addons =
    customization.addons.length > 0
      ? ` + ${customization.addons.map(getAddonLabel).join(", ")}`
      : "";
  return `${plan} · ${size} · ${flowers} (${colors})${addons}`;
}
