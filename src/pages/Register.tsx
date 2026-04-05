import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleRegister = async () => {
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

    toast({ title: "¡Cuenta creada con Google!" });
    navigate("/");
    setGoogleLoading(false);
  };

  return (
    <Layout>
      <div className="container max-w-md py-16 px-4">
        <h1 className="font-display text-3xl md:text-4xl text-center mb-2 tracking-wide">
          Crear Cuenta
        </h1>
        <div className="w-10 h-[1px] bg-accent/40 mx-auto mb-10" />

        {/* Google Sign Up */}
        <Button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="w-full rounded-none border border-border bg-background text-foreground hover:bg-secondary font-bold text-[10px] uppercase tracking-[0.2em] py-6 mb-6 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Conectando..." : "Registrarse con Google"}
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">o</span>
          <div className="flex-1 h-[1px] bg-border" />
        </div>

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
