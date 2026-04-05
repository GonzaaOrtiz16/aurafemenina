import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Bienvenida de vuelta!" });
      navigate("/");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast({ title: "Error con Google", description: String(result.error), variant: "destructive" });
      setGoogleLoading(false);
      return;
    }

    if (result.redirected) return;

    toast({ title: "¡Bienvenida!" });
    navigate("/");
    setGoogleLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-md py-20 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Iniciar Sesión
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

        {/* Google Sign In */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full rounded-none border border-border bg-background text-foreground hover:bg-secondary font-bold text-[10px] uppercase tracking-[0.2em] py-6 mb-6 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Conectando..." : "Continuar con Google"}
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">o</span>
          <div className="flex-1 h-[1px] bg-border" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="rounded-none border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-[0.2em] py-6"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm">
          <Link to="/recuperar-password" className="text-muted-foreground hover:text-accent transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link to="/registro" className="text-accent font-bold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </Layout>
  );
}