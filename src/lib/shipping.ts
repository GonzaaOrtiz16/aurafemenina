import { ShippingResult } from "@/types/product";

export function calcularEnvio(codigoPostal: string): ShippingResult | null {
  const cp = parseInt(codigoPostal, 10);
  if (isNaN(cp) || codigoPostal.length < 4) return null;

  if (cp >= 1000 && cp <= 1499) {
    return {
      cost: 2500,
      method: "Correo Argentino - Envío a CABA",
      estimatedDays: "2 a 4 días hábiles",
    };
  } else if ((cp >= 1600 && cp <= 1999) || (cp >= 1500 && cp <= 1599)) {
    return {
      cost: 3800,
      method: "Correo Argentino - Envío a GBA",
      estimatedDays: "3 a 5 días hábiles",
    };
  } else {
    return {
      cost: 5500,
      method: "Correo Argentino - Envío al Interior",
      estimatedDays: "5 a 8 días hábiles",
    };
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}
