import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroData {
  image: string;
  image_position?: string;
  tagline: string;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  button_text: string;
}

const HERO_CACHE_KEY = "hero_cached";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const { data: hero, isLoading } = useSiteSetting<HeroData>("hero");

  // Cache hero data in sessionStorage to avoid ghost flash on revisits
  useEffect(() => {
    if (hero) {
      try { sessionStorage.setItem(HERO_CACHE_KEY, JSON.stringify(hero)); } catch {}
    }
  }, [hero]);

  const cached = (() => {
    try {
      const raw = sessionStorage.getItem(HERO_CACHE_KEY);
      return raw ? JSON.parse(raw) as HeroData : null;
    } catch { return null; }
  })();

  const h = hero || cached || null;

  // Only trigger entrance animation once image is loaded
  useEffect(() => {
    if (imgReady) {
      const timer = setTimeout(() => setLoaded(true), 50);
      return () => clearTimeout(timer);
    }
  }, [imgReady]);

  // Show skeleton if no data at all yet
  if (!h && isLoading) {
    return (
      <section className="relative w-full h-[90vh] md:h-screen bg-secondary flex items-end px-8 md:px-20 pb-20">
        <div className="space-y-4 max-w-md">
          <Skeleton className="h-3 w-24 bg-muted" />
          <Skeleton className="h-14 w-72 bg-muted" />
          <Skeleton className="h-14 w-56 bg-muted" />
          <Skeleton className="h-4 w-64 bg-muted" />
          <Skeleton className="h-14 w-44 bg-muted mt-4" />
        </div>
      </section>
    );
  }

  if (!h) return null;

  return (
    <section className="relative w-full h-[90vh] md:h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={h.image}
          alt="Modelo Aura Femenina"
          className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-out will-change-transform ${imgReady && loaded ? "scale-100" : "scale-105"}`}
          style={{ objectPosition: h.image_position || "center center" }}
          fetchPriority="high"
          decoding="sync"
          onLoad={() => setImgReady(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 h-full w-full flex flex-col justify-end px-8 md:px-20 lg:px-28 pb-20 md:pb-28">
        <div
          className={`max-w-2xl transition-all duration-1000 ease-out will-change-[opacity,transform] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <p
            className={`text-accent text-[10px] md:text-xs tracking-[0.6em] font-bold uppercase mb-6 transition-all duration-700 will-change-[opacity,transform] ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
            style={{ transitionDelay: "400ms" }}
          >
            {h.tagline}
          </p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[0.95] mb-8">
            <span
              className={`block transition-all duration-800 ease-out will-change-[opacity,transform] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "500ms" }}
            >
              {h.title_line1}
            </span>
            <span
              className={`block font-display italic text-accent font-normal transition-all duration-800 ease-out will-change-[opacity,transform] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "700ms" }}
            >
              {h.title_line2}
            </span>
          </h1>

          <p
            className={`text-white/80 text-sm md:text-base font-light max-w-md leading-relaxed mb-10 transition-opacity duration-800 will-change-[opacity] ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "900ms" }}
          >
            {h.subtitle}
          </p>

          <div
            className={`transition-all duration-600 will-change-[opacity,transform] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "1100ms" }}
          >
            <Link to="/productos">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 font-bold tracking-[0.3em] text-[10px] uppercase px-12 py-7 rounded-none border-none"
              >
                {h.button_text}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-1000 ${loaded ? "opacity-40" : "opacity-0"}`}
        style={{ transitionDelay: "1600ms" }}
      >
        <div className="w-px h-10 bg-white animate-pulse" />
        <p className="text-[7px] text-white tracking-[0.4em] uppercase font-bold">Scroll</p>
      </div>
    </section>
  );
}
