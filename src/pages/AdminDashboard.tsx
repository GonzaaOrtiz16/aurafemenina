import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingBag, Image, HelpCircle, Settings, Bot } from "lucide-react";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminEncargues from "@/components/admin/AdminEncargues";
import AdminHero from "@/components/admin/AdminHero";
import AdminFAQs from "@/components/admin/AdminFAQs";
import AdminConfig from "@/components/admin/AdminConfig";
import AdminAI from "@/components/admin/AdminAI";

const TABS = [
  { id: "products", label: "Productos", icon: Package },
  { id: "encargues", label: "Encargues", icon: ShoppingBag },
  { id: "hero", label: "Portada", icon: Image },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "config", label: "Configuración", icon: Settings },
  { id: "ai", label: "IA Admin", icon: Bot },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("products");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin/login"); return; }
    setAuthChecked(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Verificando acceso...</div>;

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="font-display text-lg md:text-xl font-semibold tracking-wider">AURA FEMENINA — Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-xs">
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container px-4">
          <nav className="flex gap-1 overflow-x-auto py-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container py-6 px-4">
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "encargues" && <AdminEncargues />}
        {activeTab === "hero" && <AdminHero />}
        {activeTab === "faqs" && <AdminFAQs />}
        {activeTab === "config" && <AdminConfig />}
        {activeTab === "ai" && <AdminAI onNavigateTab={setActiveTab} />}
      </div>
    </div>
  );
}
