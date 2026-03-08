import type { ShippingResult, CartItem } from "@/types/product";
import type { ShippingZone } from "@/types/product";

// Zona sur de Buenos Aires: Avellaneda, Lanús, Lomas de Zamora, Quilmes, Berazategui, etc.
const ZONA_SUR_CP_RANGES: [number, number][] = [
  [1820, 1829], // Lanús / Banfield
  [1832, 1839], // Lomas de Zamora
  [1870, 1879], // Avellaneda
  [1876, 1889], // Sarandí, Wilde, Bernal
  [1878, 1899], // Quilmes, Berazategui, Florencio Varela
  [1842, 1849], // Monte Grande, Esteban Echeverría
  [1852, 1859], // Burzaco, Adrogué, Longchamps
  [1804, 1812], // Ezeiza, Canning
];

export type ShippingZone = "caba" | "zona_sur" | "gba" | "interior";

export function getShippingZone(codigoPostal: string): ShippingZone | null {
  const cp = parseInt(codigoPostal, 10);
  if (isNaN(cp) || codigoPostal.length < 4) return null;

  // CABA: 1000–1499
  if (cp >= 1000 && cp <= 1499) return "caba";

  // Zona Sur de Buenos Aires
  for (const [min, max] of ZONA_SUR_CP_RANGES) {
    if (cp >= min && cp <= max) return "zona_sur";
  }

  // Resto de GBA
  if ((cp >= 1500 && cp <= 1999)) return "gba";

  // Interior del país
  return "interior";
}

export const MINIMUM_PURCHASE: Record<ShippingZone, number> = {
  caba: 0,
  zona_sur: 0,
  gba: 100000,
  interior: 100000,
};

export const ZONE_LABELS: Record<ShippingZone, string> = {
  caba: "CABA",
  zona_sur: "Zona Sur GBA",
  gba: "GBA",
  interior: "Interior del país",
};

export function calcularEnvio(codigoPostal: string): ShippingResult | null {
  const zone = getShippingZone(codigoPostal);
  if (!zone) return null;

  switch (zone) {
    case "caba":
      return {
        cost: 2500,
        method: "Correo Argentino - Envío a CABA",
        estimatedDays: "2 a 4 días hábiles",
      };
    case "zona_sur":
      return {
        cost: 2500,
        method: "Correo Argentino - Envío Zona Sur",
        estimatedDays: "2 a 4 días hábiles",
      };
    case "gba":
      return {
        cost: 3800,
        method: "Correo Argentino - Envío a GBA",
        estimatedDays: "3 a 5 días hábiles",
      };
    case "interior":
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

export function generarMensajeWhatsApp(
  items: CartItem[],
  total: number,
  envio: ShippingResult | null,
  datos: { nombre: string; direccion: string; cp: string }
): string {
  const nroTelefono = "5491134944228";

  let mensaje = `*NUEVO PEDIDO - AURA FEMENINA*%0A%0A`;
  mensaje += `*Cliente:* ${datos.nombre}%0A`;
  mensaje += `*Dirección:* ${datos.direccion} (CP: ${datos.cp})%0A`;
  mensaje += `*Email:* orianaevelyn09@gmail.com%0A%0A`;

  mensaje += `*PRODUCTOS:*%0A`;
  items.forEach((item) => {
    const colorInfo = item.color ? ` - Color: ${item.color}` : "";
    mensaje += `- ${item.product.name} (Talle: ${item.size}${colorInfo}) x${item.quantity}%0A`;
  });

  mensaje += `%0A*Envío:* ${envio ? envio.method : "A convenir"}`;
  mensaje += `%0A*TOTAL A PAGAR:* ${formatPrice(total + (envio?.cost || 0))}%0A%0A`;
  mensaje += `_Instagram: @aurafemenina.oficial_`;

  return `https://wa.me/${nroTelefono}?text=${mensaje}`;
}
