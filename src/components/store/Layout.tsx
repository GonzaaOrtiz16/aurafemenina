import { lazy, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

// Lazy load heavy floating components - they aren't needed for first paint
const WhatsAppButton = lazy(() => import("./WhatsAppButton"));
const AuraStylist = lazy(() => import("./AuraStylist"));

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <WhatsAppButton />
        <AuraStylist />
      </Suspense>
    </div>
  );
}
