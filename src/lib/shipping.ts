import { ShippingResult, CartItem } from "@/types/product";

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

export function generarMensajeWhatsApp(
  items: CartItem[], 
  total: number, 
  envio: ShippingResult | null, 
  datos: { nombre: string; direccion: string; cp: string }
): string {
  // Tu número de WhatsApp real integrado
  const nroTelefono = "5491134944228"; 
  
  let mensaje = `*NUEVO PEDIDO - AURA FEMENINA*%0A%0A`;
  mensaje += `*Cliente:* ${datos.nombre}%0A`;
  mensaje += `*Dirección:* ${datos.direccion} (CP: ${datos.cp})%0A`;
  mensaje += `*Email:* orianaevelyn09@gmail.com%0A%0A`; // Agregué tu mail como referencia de la tienda si querés
  
  mensaje += `*PRODUCTOS:*%0A`;
  items.forEach((item) => {
    const colorInfo = item.color ? ` - Color: ${item.color}` : "";
    mensaje += `- ${item.product.name} (Talle: ${item.size}${colorInfo}) x${item.quantity}%0A`;
  });

  mensaje += `%0A*Envío:* ${envio ? envio.method : "A convenir"}`;
  mensaje += `%0A*TOTAL A PAGAR:* ${formatPrice(total + (envio?.cost || 0))}%0A%0A`;
  mensaje += `_Instagram: @aurafemenina.oficial_`; // Tu Instagram en el pie del mensaje

  return `https://wa.me/${nroTelefono}?text=${mensaje}`;
}
