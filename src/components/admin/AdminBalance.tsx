import { useState } from "react";
import { LayoutDashboard, ShoppingCart, Receipt, Wallet, FileSpreadsheet } from "lucide-react";
import BalanceOverview from "./balance/BalanceOverview";
import SalesManager from "./balance/SalesManager";
import ExpensesManager from "./balance/ExpensesManager";
import FiadosManager from "./balance/FiadosManager";
import BalanceExcel from "./balance/BalanceExcel";

const SUBTABS = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "sales", label: "Ventas", icon: ShoppingCart },
  { id: "expenses", label: "Gastos", icon: Receipt },
  { id: "fiados", label: "Fiados", icon: Wallet },
  { id: "excel", label: "Excel", icon: FileSpreadsheet },
] as const;

type SubTab = (typeof SUBTABS)[number]["id"];

export default function AdminBalance() {
  const [tab, setTab] = useState<SubTab>("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-wide">Balance & Finanzas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Controlá ventas, gastos, fiados y rentabilidad de tu negocio.
        </p>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto -mb-px">
          {SUBTABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "overview" && <BalanceOverview />}
      {tab === "sales" && <SalesManager />}
      {tab === "expenses" && <ExpensesManager />}
      {tab === "fiados" && <FiadosManager />}
      {tab === "excel" && <BalanceExcel />}
    </div>
  );
}
