import { describe, it, expect } from "vitest";
import {
  getShippingZone,
  calcularEnvio,
  formatPrice,
  MINIMUM_PURCHASE,
} from "@/lib/shipping";

describe("getShippingZone", () => {
  it("detecta CABA (1000–1499)", () => {
    expect(getShippingZone("1000")).toBe("caba");
    expect(getShippingZone("1425")).toBe("caba");
    expect(getShippingZone("1499")).toBe("caba");
  });

  it("detecta Zona Sur de GBA", () => {
    expect(getShippingZone("1870")).toBe("zona_sur"); // Avellaneda
    expect(getShippingZone("1832")).toBe("zona_sur"); // Lomas de Zamora
  });

  it("detecta el resto de GBA (1500–1999) no incluido en Zona Sur", () => {
    expect(getShippingZone("1650")).toBe("gba");
  });

  it("cae en interior para CP fuera de Buenos Aires", () => {
    expect(getShippingZone("5000")).toBe("interior"); // Córdoba
    expect(getShippingZone("8300")).toBe("interior"); // Neuquén
  });

  it("devuelve null para entradas inválidas", () => {
    expect(getShippingZone("")).toBeNull();
    expect(getShippingZone("abc")).toBeNull();
    expect(getShippingZone("12")).toBeNull();
  });
});

describe("calcularEnvio", () => {
  it("devuelve costo y método según la zona", () => {
    expect(calcularEnvio("1425")?.cost).toBe(2500); // CABA
    expect(calcularEnvio("1650")?.cost).toBe(3800); // GBA
    expect(calcularEnvio("5000")?.cost).toBe(5500); // Interior
  });

  it("devuelve null para CP inválido", () => {
    expect(calcularEnvio("xx")).toBeNull();
  });
});

describe("MINIMUM_PURCHASE", () => {
  it("no exige mínimo en CABA y Zona Sur", () => {
    expect(MINIMUM_PURCHASE.caba).toBe(0);
    expect(MINIMUM_PURCHASE.zona_sur).toBe(0);
  });

  it("exige mínimo en GBA e interior", () => {
    expect(MINIMUM_PURCHASE.gba).toBeGreaterThan(0);
    expect(MINIMUM_PURCHASE.interior).toBeGreaterThan(0);
  });
});

describe("formatPrice", () => {
  it("formatea como moneda argentina sin decimales", () => {
    const out = formatPrice(32990);
    expect(out).toContain("32.990");
    expect(out).toContain("$");
  });
});
