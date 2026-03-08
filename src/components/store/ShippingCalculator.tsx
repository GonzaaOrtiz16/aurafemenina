import { useState } from "react";
import { calcularEnvio, formatPrice, getShippingZone, MINIMUM_PURCHASE, ZONE_LABELS } from "@/lib/shipping";
import type { ShippingResult, ShippingZone } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck, AlertTriangle, CheckCircle } from "lucide-react";

interface ShippingCalculatorProps {
  onShippingCalculated?: (result: ShippingResult | null) => void;
  onZoneDetected?: (zone: ShippingZone | null) => void;
  cartSubtotal?: number;
}

export default function ShippingCalculator({ onShippingCalculated, onZoneDetected, cartSubtotal = 0 }: ShippingCalculatorProps) {
  const [cp, setCp] = useState("");
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const detectedZone = getShippingZone(cp);
    setZone(detectedZone);
    onZoneDetected?.(detectedZone);

    const r = calcularEnvio(cp);
    if (!r || !detectedZone) {
      setError("Ingresá un código postal válido (4 dígitos).");
      setResult(null);
      onShippingCalculated?.(null);
      return;
    }
    setResult(r);
    onShippingCalculated?.(r);
  };

  const minimum = zone ? MINIMUM_PURCHASE[zone] : 0;
  const meetsMinimum = minimum === 0 || cartSubtotal >= minimum;

  return (
    <div className="space-y-3">
      <label className="font-body text-sm font-medium flex items-center gap-2">
        <Truck className="h-4 w-4" /> Calcular envío
      </label>
      <div className="flex gap-2">
        <Input
          placeholder="Código postal"
          value={cp}
          onChange={(e) => setCp(e.target.value)}
          maxLength={4}
          className="flex-1 font-body"
        />
        <Button onClick={handleCalculate} variant="outline" className="font-body text-sm">
          Calcular
        </Button>
      </div>
      {error && <p className="text-xs text-destructive font-body">{error}</p>}
      {result && zone && (
        <div className="rounded-sm border border-border bg-secondary p-3 space-y-2">
          <p className="font-body text-sm font-medium">{result.method}</p>
          <p className="font-body text-sm font-semibold">{formatPrice(result.cost)}</p>
          <p className="font-body text-xs text-muted-foreground">{result.estimatedDays}</p>
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">
            Zona: {ZONE_LABELS[zone]}
          </p>

          {minimum > 0 && (
            <div className={`flex items-start gap-2 mt-2 p-2 rounded-sm text-xs font-body ${
              meetsMinimum
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
              {meetsMinimum ? (
                <>
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>¡Cumplís el mínimo de compra de {formatPrice(minimum)}!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Para envíos a {ZONE_LABELS[zone]} el mínimo de compra es de{" "}
                    <strong>{formatPrice(minimum)}</strong>. Te faltan{" "}
                    <strong>{formatPrice(minimum - cartSubtotal)}</strong>.
                  </span>
                </>
              )}
            </div>
          )}

          {minimum === 0 && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-sm text-xs font-body bg-green-50 text-green-700 border border-green-200">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>¡Sin mínimo de compra para {ZONE_LABELS[zone]}!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
