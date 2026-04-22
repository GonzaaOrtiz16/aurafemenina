import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function BalanceExcel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const ExcelJS = (await import("exceljs")).default;

      // Fetch products with categories
      const { data: products, error } = await supabase
        .from("products")
        .select("*, categories(name), subcategories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Aura Femenina Admin";
      workbook.created = new Date();

      // ========== HOJA 1: PRODUCTOS ==========
      const sProd = workbook.addWorksheet("Productos", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      sProd.columns = [
        { header: "ID", key: "id", width: 38 },
        { header: "Producto", key: "name", width: 35 },
        { header: "Categoría", key: "category", width: 18 },
        { header: "Subcategoría", key: "subcategory", width: 18 },
        { header: "Precio Venta ($)", key: "price", width: 16 },
        { header: "Precio Original ($)", key: "original_price", width: 18 },
        { header: "Stock Total", key: "stock", width: 13 },
        { header: "Costo Unitario ($)", key: "cost", width: 18 },
        { header: "Ganancia Unit. ($)", key: "profit_unit", width: 18 },
        { header: "Margen (%)", key: "margin", width: 13 },
        { header: "Valor Inventario ($)", key: "inventory_value", width: 20 },
        { header: "Ganancia Potencial ($)", key: "potential_profit", width: 22 },
        { header: "Unidades Vendidas", key: "units_sold", width: 18 },
        { header: "Ingresos Reales ($)", key: "real_revenue", width: 20 },
        { header: "Ganancia Real ($)", key: "real_profit", width: 20 },
      ];

      const sumValues = (obj: any): number =>
        (Object.values(obj || {}) as any[]).reduce((s: number, v: any) => s + (Number(v) || 0), 0);

      const calcStock = (p: any): number => {
        const colores = (p.colores as any[]) || [];
        if (colores.length > 0) {
          return colores.reduce((sum: number, c: any) => sum + sumValues(c.sizes), 0);
        }
        return sumValues(p.sizes);
      };

      (products || []).forEach((p: any, idx: number) => {
        const row = idx + 2; // header is row 1
        const stock = calcStock(p);
        sProd.addRow({
          id: p.id,
          name: p.name,
          category: p.categories?.name || "",
          subcategory: p.subcategories?.name || "",
          price: Number(p.price) || 0,
          original_price: p.original_price ? Number(p.original_price) : null,
          stock,
          cost: null, // editable por el usuario
          profit_unit: { formula: `E${row}-H${row}` },
          margin: { formula: `IF(E${row}=0,0,(E${row}-H${row})/E${row})` },
          inventory_value: { formula: `E${row}*G${row}` },
          potential_profit: { formula: `(E${row}-H${row})*G${row}` },
          units_sold: 0,
          real_revenue: { formula: `E${row}*M${row}` },
          real_profit: { formula: `(E${row}-H${row})*M${row}` },
        });
      });

      // Styling header
      const headerRow = sProd.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 28;

      // Number formats
      const moneyFmt = '"$"#,##0;[Red]("$"#,##0);"-"';
      const pctFmt = "0.0%;[Red]-0.0%;-";
      ["E", "F", "I", "K", "L", "N", "O"].forEach((col) => {
        sProd.getColumn(col).numFmt = moneyFmt;
      });
      sProd.getColumn("H").numFmt = moneyFmt; // costo
      sProd.getColumn("J").numFmt = pctFmt;

      // Highlight editable columns (Costo H, Vendidas M) light yellow
      const lastRow = (products?.length || 0) + 1;
      for (let r = 2; r <= lastRow; r++) {
        ["H", "M"].forEach((col) => {
          const cell = sProd.getCell(`${col}${r}`);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFEF3C7" },
          };
          cell.font = { color: { argb: "FF1E40AF" } };
        });
        // Formula cells black
        ["I", "J", "K", "L", "N", "O"].forEach((col) => {
          sProd.getCell(`${col}${r}`).font = { color: { argb: "FF000000" } };
        });
      }

      // Borders
      sProd.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      });

      // ========== HOJA 2: BALANCE (TOTALES) ==========
      const sBal = workbook.addWorksheet("Balance");
      sBal.columns = [
        { header: "Concepto", key: "concept", width: 35 },
        { header: "Valor", key: "value", width: 20 },
      ];
      const balHeader = sBal.getRow(1);
      balHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      balHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
      balHeader.alignment = { vertical: "middle", horizontal: "center" };
      balHeader.height = 28;

      const range = `Productos!G2:G${lastRow}`;
      const balanceRows = [
        ["Total productos publicados", { formula: `COUNTA(Productos!B2:B${lastRow})` }, "0"],
        ["Stock total (unidades)", { formula: `SUM(${range})` }, "0"],
        ["Valor total del inventario", { formula: `SUM(Productos!K2:K${lastRow})` }, moneyFmt],
        ["Costo total del inventario", { formula: `SUMPRODUCT(Productos!H2:H${lastRow},Productos!G2:G${lastRow})` }, moneyFmt],
        ["Ganancia potencial total", { formula: `SUM(Productos!L2:L${lastRow})` }, moneyFmt],
        ["", "", ""],
        ["Unidades vendidas (total)", { formula: `SUM(Productos!M2:M${lastRow})` }, "0"],
        ["Ingresos reales", { formula: `SUM(Productos!N2:N${lastRow})` }, moneyFmt],
        ["Ganancia real", { formula: `SUM(Productos!O2:O${lastRow})` }, moneyFmt],
        ["Margen real promedio", { formula: `IF(SUM(Productos!N2:N${lastRow})=0,0,SUM(Productos!O2:O${lastRow})/SUM(Productos!N2:N${lastRow}))` }, pctFmt],
        ["", "", ""],
        ["Precio promedio de venta", { formula: `IFERROR(AVERAGE(Productos!E2:E${lastRow}),0)` }, moneyFmt],
        ["Margen promedio (%)", { formula: `IFERROR(AVERAGE(Productos!J2:J${lastRow}),0)` }, pctFmt],
      ];

      balanceRows.forEach((r) => {
        const row = sBal.addRow({ concept: r[0], value: r[1] });
        if (r[2]) row.getCell(2).numFmt = r[2] as string;
        row.getCell(1).font = { bold: true };
        row.getCell(2).font = { color: { argb: "FF000000" } };
      });

      sBal.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      });

      // ========== HOJA 3: RESUMEN POR CATEGORÍA ==========
      const sRes = workbook.addWorksheet("Resumen");
      sRes.columns = [
        { header: "Categoría", key: "cat", width: 25 },
        { header: "Productos", key: "count", width: 12 },
        { header: "Stock total", key: "stock", width: 14 },
        { header: "Precio promedio ($)", key: "avg_price", width: 20 },
        { header: "Valor inventario ($)", key: "inv_val", width: 22 },
        { header: "Ganancia potencial ($)", key: "pot_profit", width: 22 },
      ];
      const resHeader = sRes.getRow(1);
      resHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      resHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };
      resHeader.alignment = { vertical: "middle", horizontal: "center" };
      resHeader.height = 28;

      // Group by category
      const byCat = new Map<string, any[]>();
      (products || []).forEach((p: any) => {
        const cat = p.categories?.name || "Sin categoría";
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat)!.push(p);
      });

      Array.from(byCat.entries()).forEach(([cat, list]) => {
        const stock = list.reduce((s, p) => s + calcStock(p), 0);
        const avgPrice = list.reduce((s, p) => s + Number(p.price || 0), 0) / list.length;
        const invVal = list.reduce((s, p) => s + Number(p.price || 0) * calcStock(p), 0);
        const row = sRes.addRow({
          cat,
          count: list.length,
          stock,
          avg_price: avgPrice,
          inv_val: invVal,
          pot_profit: 0, // depende de costos cargados manualmente
        });
        row.getCell(4).numFmt = moneyFmt;
        row.getCell(5).numFmt = moneyFmt;
        row.getCell(6).numFmt = moneyFmt;
        row.getCell(6).note = "Cargá los costos en la hoja Productos para ver la ganancia potencial real por categoría";
      });

      sRes.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      });

      // Note sheet for instructions
      const sNote = workbook.addWorksheet("Instrucciones");
      sNote.columns = [{ header: "Cómo usar esta planilla", key: "txt", width: 100 }];
      sNote.getRow(1).font = { bold: true, size: 13 };
      const instrucciones = [
        "",
        "1. Andá a la hoja 'Productos'.",
        "2. Las celdas en AMARILLO son editables: 'Costo Unitario' y 'Unidades Vendidas'.",
        "3. A medida que cargues los costos, se calculan automáticamente:",
        "   • Ganancia por unidad",
        "   • Margen %",
        "   • Valor del inventario",
        "   • Ganancia potencial total",
        "4. Cargá las 'Unidades Vendidas' para ver ingresos y ganancia real.",
        "5. La hoja 'Balance' resume todos los totales y promedios.",
        "6. La hoja 'Resumen' muestra estadísticas agrupadas por categoría.",
        "",
        "💡 Tip: guardá una copia mensual para llevar histórico de balances.",
        "",
        `Generado: ${new Date().toLocaleString("es-AR")}`,
      ];
      instrucciones.forEach((t) => sNote.addRow({ txt: t }));

      // Generate and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `aura-femenina-balance-${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Excel descargado",
        description: `${products?.length || 0} productos exportados correctamente.`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error al generar Excel",
        description: e.message || "Intentá de nuevo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-wide">Balance & Reportes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Descargá una planilla Excel funcional con todos los productos publicados, fórmulas
          automáticas de ganancia, márgenes, inventario y ventas.
        </p>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold">Planilla de Balance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Incluye 4 hojas: Productos (con fórmulas), Balance general, Resumen por categoría e
              Instrucciones.
            </p>
            <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc list-inside">
              <li>Cargás el <strong>costo</strong> y las <strong>unidades vendidas</strong> en las celdas amarillas.</li>
              <li>Excel calcula automáticamente ganancia, margen %, inventario, ingresos y ganancia real.</li>
              <li>Promedios y totales se actualizan solos en la hoja Balance.</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={loading}
          size="lg"
          className="w-full sm:w-auto gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando Excel...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Descargar Excel de Balance
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
