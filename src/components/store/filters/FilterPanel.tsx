import { memo } from "react";
import { X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterColor {
  nombre: string;
  hex: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

interface FilterPanelProps {
  categories: Array<{ id?: string; slug: string; name: string }>;
  subcategories?: Subcategory[];
  activeCategory: string;
  activeSubcategory?: string;
  activeSize: string;
  activeColor: string;
  maxPrice: number;
  priceRange: { min: number; max: number };
  availableColors: FilterColor[];
  hasActiveFilters: boolean;
  onCategoryChange: (slug: string) => void;
  onSubcategoryChange?: (slug: string) => void;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onMaxPriceChange: (price: number) => void;
  onClearFilters: () => void;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "44"];

function FilterPanel({
  categories,
  subcategories = [],
  activeCategory,
  activeSubcategory = "",
  activeSize,
  activeColor,
  maxPrice,
  priceRange,
  availableColors,
  hasActiveFilters,
  onCategoryChange,
  onSubcategoryChange,
  onSizeChange,
  onColorChange,
  onMaxPriceChange,
  onClearFilters,
}: FilterPanelProps) {
  // Find the active category's id to filter subcategories
  const activeCatObj = categories.find(c => c.slug === activeCategory);
  const filteredSubs = activeCatObj?.id
    ? subcategories.filter(s => s.category_id === activeCatObj.id)
    : [];

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Categorías
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onCategoryChange("")}
            className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
              !activeCategory
                ? "bg-foreground text-background font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
                activeCategory === cat.slug
                  ? "bg-foreground text-background font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories (when a category is active) */}
      {filteredSubs.length > 0 && onSubcategoryChange && (
        <div>
          <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> Subcategorías
          </h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSubcategoryChange("")}
              className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
                !activeSubcategory
                  ? "bg-foreground text-background font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              Todas
            </button>
            {filteredSubs.map((sub) => (
              <button
                key={sub.slug}
                onClick={() => onSubcategoryChange(sub.slug)}
                className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
                  activeSubcategory === sub.slug
                    ? "bg-foreground text-background font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Talle
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(activeSize === size ? "" : size)}
              className={`aspect-square flex items-center justify-center border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 rounded-sm ${
                activeSize === size
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Color
          </h3>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <button
                key={color.nombre}
                onClick={() => onColorChange(activeColor === color.nombre ? "" : color.nombre)}
                title={color.nombre}
                className={`w-8 h-8 rounded-full border-2 transition-all p-[2px] ${
                  activeColor === color.nombre ? "border-foreground scale-110" : "border-transparent"
                }`}
              >
                <div className="w-full h-full rounded-full border border-border/30" style={{ backgroundColor: color.hex }} />
              </button>
            ))}
          </div>
          {activeColor && (
            <p className="font-body text-xs text-muted-foreground mt-2 capitalize">{activeColor}</p>
          )}
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Precio máximo
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            value={maxPrice === priceRange.max ? "" : maxPrice}
            onChange={(e) => {
              const val = e.target.value;
              onMaxPriceChange(val === "" ? priceRange.max : Math.max(0, Number(val)));
            }}
            placeholder={priceRange.max.toLocaleString("es-AR")}
            className="font-body text-sm h-10"
          />
        </div>
        {maxPrice < priceRange.max && (
          <p className="font-body text-xs text-muted-foreground mt-2">
            Hasta <span className="font-bold text-foreground">${maxPrice.toLocaleString("es-AR")}</span>
          </p>
        )}
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider text-accent hover:underline"
        >
          <X className="w-3 h-3" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}

export default memo(FilterPanel);
