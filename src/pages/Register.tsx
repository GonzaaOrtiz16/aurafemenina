import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          phone,
          newsletter_opt_in: newsletter,
        },
      },
    });

    if (error) {
      toast({ title: "Error al registrarte", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "¡Registro exitoso!",
        description: "Revisá tu email para confirmar tu cuenta.",
      });
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-md py-16 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Crear Cuenta
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Nombre completo
            </Label>
            <Input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              className="rounded-none border-border"
            />
          </div>

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
            <Label htmlFor="phone" className="font-body text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 11 1234-5678"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="rounded-none border-border"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(checked) => setNewsletter(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="newsletter" className="text-sm text-muted-foreground leading-snug cursor-pointer">
              Quiero recibir novedades y ofertas exclusivas por email
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-[0.2em] py-6"
          >
            {loading ? "Registrando..." : "Crear mi cuenta"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-accent font-bold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </Layout>
  );
}
