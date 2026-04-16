import { lazy, Suspense } from "react";
import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import StoreInfo from "@/components/store/StoreInfo";

// Lazy load below-the-fold sections
const FeaturedProducts = lazy(() => import("@/components/store/FeaturedProducts"));
const EncarguePreview = lazy(() => import("@/components/store/EncarguePreview"));

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <StoreInfo />
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={null}>
        <EncarguePreview />
      </Suspense>
      <div className="h-16" />
    </Layout>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="container py-20 md:py-32 px-6 md:px-12">
      <div className="text-center mb-16">
        <div className="h-3 w-20 bg-secondary rounded mx-auto mb-3" />
        <div className="h-10 w-48 bg-secondary rounded mx-auto mb-6" />
        <div className="w-16 h-[1px] bg-secondary mx-auto" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] bg-secondary rounded-sm animate-pulse" />
            <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
