import { useState } from "react";
import { calcularEnvio, formatPrice } from "@/lib/shipping";
import { ShippingResult } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

interface ShippingCalculatorProps {
  onShippingCalculated?: (result: ShippingResult | null) => void;
}

export default function ShippingCalculator({ onShippingCalculated }: ShippingCalculatorProps) {
  const [cp, setCp] = useState("");
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const r = calcularEnvio(cp);
    if (!r) {
      setError("Ingresá un código postal válido (4 dígitos).");
      setResult(null);
      onShippingCalculated?.(null);
      return;
    }
    setResult(r);
    onShippingCalculated?.(r);
  };

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
      {result && (
        <div className="rounded-sm border border-border bg-secondary p-3 space-y-1">
          <p className="font-body text-sm font-medium">{result.method}</p>
          <p className="font-body text-sm font-semibold">{formatPrice(result.cost)}</p>
          <p className="font-body text-xs text-muted-foreground">{result.estimatedDays}</p>
        </div>
      )}
    </div>
  );
}
