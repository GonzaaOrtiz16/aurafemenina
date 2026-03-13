import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { motion } from "framer-motion";

interface HeroData {
  image: string;
  tagline: string;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  button_text: string;
}

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const { data: hero } = useSiteSetting<HeroData>("hero");

  const h = hero || {
    image: "/banner-aura.jpg", tagline: "Descubrí tu esencia",
    title_line1: "TU AURA", title_line2: "FEMENINA",
    subtitle: "Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza.",
    button_text: "VER COLECCIÓN",
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-[90vh] md:h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={h.image}
          alt="Modelo Aura Femenina"
          className={`w-full h-full object-cover transition-transform duration-[2500ms] ease-out ${loaded ? "scale-100" : "scale-110"}`}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 h-full w-full flex flex-col justify-end px-8 md:px-20 lg:px-28 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={loaded ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-accent text-[10px] md:text-xs tracking-[0.6em] font-bold uppercase mb-6"
          >
            {h.tagline}
          </motion.p>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[0.95] mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="block"
            >
              {h.title_line1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block font-display italic text-accent font-normal"
            >
              {h.title_line2}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-white/80 text-sm md:text-base font-light max-w-md leading-relaxed mb-10"
          >
            {h.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Link to="/productos">
              <Button
                size="lg"
                className="bg-white text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 font-bold tracking-[0.3em] text-[10px] uppercase px-12 py-7 rounded-none border-none"
              >
                {h.button_text}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 0.4 } : {}}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <div className="w-px h-10 bg-white animate-pulse" />
        <p className="text-[7px] text-white tracking-[0.4em] uppercase font-bold">Scroll</p>
      </motion.div>
    </section>
  );
}
