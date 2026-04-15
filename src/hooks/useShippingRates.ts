import { useSiteSetting } from "@/hooks/useSiteSettings";

export interface ShippingRates {
  caba: number;
  zona_sur: number;
  gba: number;
  interior: number;
  minimums: {
    caba: number;
    zona_sur: number;
    gba: number;
    interior: number;
  };
}

const DEFAULT_RATES: ShippingRates = {
  caba: 2500,
  zona_sur: 2500,
  gba: 3800,
  interior: 5500,
  minimums: { caba: 0, zona_sur: 0, gba: 100000, interior: 100000 },
};

export function useShippingRates() {
  const { data, isLoading } = useSiteSetting<ShippingRates>("shipping_rates");
  return { rates: data ?? DEFAULT_RATES, isLoading };
}
