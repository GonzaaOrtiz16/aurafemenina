import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import { getFeaturedProducts, categories } from "@/data/products";
import { Link } from "react-router-dom";

const featured = getFeaturedProducts();

export default function Index() {
  return (
    <Layout>
      <HeroSection />

      {/* Categories */}
      <section className="container py-12">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-8 tracking-wide">
          Categorías
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/productos?categoria=${cat.slug}`}
              className="group flex items-center justify-center rounded-sm border border-border bg-card p-6 text-center transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              <span className="font-body text-sm font-medium uppercase tracking-wider">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container pb-16">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-8 tracking-wide">
          Destacados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/productos"
            className="inline-block border border-primary px-8 py-3 font-body text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </section>

      {/* Promo banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-12 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">
            Envíos a todo el país
          </h2>
          <p className="font-body text-sm text-primary-foreground/70 max-w-lg mx-auto">
            Realizá tu pedido por WhatsApp y recibilo en tu domicilio por Correo Argentino. Calculá el costo de envío ingresando tu código postal.
          </p>
        </div>
      </section>
    </Layout>
  );
}
