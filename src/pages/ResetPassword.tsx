import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a recovery session
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    
    if (type === "recovery") {
      setIsValidSession(true);
    } else {
      // Also check if user is already authenticated via recovery
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "¡Contraseña actualizada!", description: "Ya podés iniciar sesión con tu nueva contraseña." });
      await supabase.auth.signOut();
      navigate("/login");
    }
    setLoading(false);
  };

  if (!isValidSession) {
    return (
      <Layout>
        <div className="container max-w-md py-20 px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl mb-4">Enlace inválido</h1>
          <p className="text-muted-foreground mb-6">
            Este enlace de recuperación no es válido o ya expiró.
          </p>
          <Button onClick={() => navigate("/recuperar-password")} className="rounded-none">
            Solicitar nuevo enlace
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md py-20 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Nueva Contraseña
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Nueva contraseña
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-[0.2em] py-6"
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
