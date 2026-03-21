import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import ScrollToTop from "./components/ScrollToTop";

// Eager: landing page for fast first paint
import Index from "./pages/Index";

// Lazy: all other routes
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/CartPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HowToBuy = lazy(() => import("./pages/HowToBuy"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Encargues = lazy(() => import("./pages/Encargues"));
// Nueva página de detalle para productos por encargue
const EncargueDetail = lazy(() => import("./pages/EncargueDetail")); 
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min global stale time
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-px h-12 bg-foreground/20 animate-pulse" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Rutas Principales */}
              <Route path="/" element={<Index />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/carrito" element={<CartPage />} />
              
              {/* Información y Ayuda */}
              <Route path="/preguntas-frecuentes" element={<FAQ />} />
              <Route path="/como-comprar" element={<HowToBuy />} />
              <Route path="/contacto" element={<Contact />} />
              
              {/* Autenticación de Usuarios */}
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/recuperar-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Sistema de Pedidos por Encargue */}
              <Route path="/encargues" element={<Encargues />} />
              <Route path="/encargue/:slug" element={<EncargueDetail />} />
              
              {/* Administración */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Error 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
