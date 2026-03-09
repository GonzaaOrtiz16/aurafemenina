import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "¡Email enviado!", description: "Revisá tu casilla de correo." });
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-md py-20 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Recuperar Contraseña
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Te enviamos un email con instrucciones para restablecer tu contraseña.
            </p>
            <Link to="/login" className="text-accent font-bold hover:underline">
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-[0.2em] py-6"
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>
        )}

        <p className="text-center mt-8 text-sm text-muted-foreground">
          <Link to="/login" className="text-accent font-bold hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </Layout>
  );
}
