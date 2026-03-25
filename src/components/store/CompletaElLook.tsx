import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/shipping";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const GEMINI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;

interface Props {
  product: Product;
  allProducts: Product[];
}

export default function CompletaElLook({ product, allProducts }: Props) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || allProducts.length < 3) return;
    setFetched(true);
    setLoading(true);

    const otherProducts = allProducts
      .filter((p) => p.id !== product.id)
      .map((p) => `ID:${p.id}|${p.name}|Cat:${p.category}|Sub:${p.subcategory || ""}|$${p.price}`)
      .join("\n");

    fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        action: "complete-look",
        payload: {
          productName: product.name,
          productCategory: product.category,
          productSubcategory: product.subcategory || "",
          catalog: otherProducts,
        },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const ids: string[] = data.ids || [];
        const matched = ids
          .map((id) => allProducts.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setSuggestions(matched.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [product.id, allProducts, fetched]);

  if (!loading && suggestions.length === 0) return null;

  return (
    <section className="mt-20 md:mt-28">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-4 h-4 text-accent" />
        <h2 className="font-display text-xl md:text-2xl tracking-[0.15em] uppercase font-light">
          Completá el <span className="italic text-accent">Look</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs tracking-widest uppercase">Creando tu outfit...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:gap-10">
          {suggestions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={`/producto/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {p.images[1] && (
                    <img
                      src={p.images[1]}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-body text-xs font-medium uppercase tracking-wider">{p.name}</h3>
                  <span className="font-body text-sm font-semibold mt-1 block">{formatPrice(p.price)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
