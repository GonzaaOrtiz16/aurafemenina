import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
}

type AuthState = "checking" | "allowed" | "denied";

/**
 * Protege rutas que requieren un usuario con rol admin.
 * La seguridad real la garantiza RLS en la base; esto es la guarda de UX
 * que evita renderizar el panel a quien no corresponde y redirige al login.
 */
export function ProtectedRoute({ children }: Props) {
  const [state, setState] = useState<AuthState>("checking");

  useEffect(() => {
    let active = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) setState("denied");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (active) setState(roles && roles.length > 0 ? "allowed" : "denied");
    })();

    return () => {
      active = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Verificando acceso...
      </div>
    );
  }

  if (state === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
