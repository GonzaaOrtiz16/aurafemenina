import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <Layout>
      <div className="container max-w-md py-20 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Iniciar Sesión
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

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
