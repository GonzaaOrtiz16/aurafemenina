
-- Add original_price to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price numeric DEFAULT NULL;

-- Create site_settings table for editable content
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (is_admin());

CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE TO authenticated USING (is_admin());

-- Seed default values
INSERT INTO public.site_settings (key, value) VALUES
  ('hero', '{"image": "/banner-aura.jpg", "tagline": "Descubrí tu esencia", "title_line1": "TU AURA", "title_line2": "FEMENINA", "subtitle": "Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza.", "button_text": "VER COLECCIÓN"}'::jsonb),
  ('faqs', '[{"question": "¿Cómo realizo una compra?", "answer": "Navegá por nuestros productos, seleccioná el talle y agregalo al carrito. Cuando tengas todo listo, hacé clic en Finalizar compra por WhatsApp y te contactaremos para coordinar el pago y envío."}, {"question": "¿Cuáles son los medios de pago?", "answer": "Aceptamos transferencia bancaria, Mercado Pago, efectivo y tarjeta de débito/crédito. Coordinamos el pago por WhatsApp una vez que realizás el pedido."}, {"question": "¿Cuánto tarda el envío?", "answer": "Los envíos a CABA demoran entre 2 y 4 días hábiles, a GBA entre 3 y 5 días hábiles, y al interior del país entre 5 y 8 días hábiles. Todos los envíos se realizan por Correo Argentino."}, {"question": "¿Puedo cambiar o devolver un producto?", "answer": "Sí, tenés 30 días desde la recepción para solicitar un cambio o devolución. El producto debe estar sin uso y con etiquetas originales. Contactanos por WhatsApp para gestionar el cambio."}, {"question": "¿Cómo elijo mi talle?", "answer": "Cada producto tiene una guía de talles disponible. Si tenés dudas, escribinos por WhatsApp y te asesoramos con gusto."}, {"question": "¿Hacen envíos a todo el país?", "answer": "Sí, enviamos a todo el territorio argentino a través de Correo Argentino. Podés calcular el costo de envío ingresando tu código postal en el carrito."}]'::jsonb),
  ('contact', '{"whatsapp": "5491134944228", "email": "orianaevelyn09@gmail.com", "instagram": "@aurafemenina.oficial", "instagram_url": "https://instagram.com/aurafemenina.oficial", "location": "Buenos Aires, Argentina", "hours_weekday": "Lunes a Viernes: 9:00 a 18:00 hs", "hours_saturday": "Sábados: 10:00 a 14:00 hs"}'::jsonb),
  ('announcement', '{"text": "ENVÍO GRATIS A CABA Y ZONA SUR · 3 CUOTAS SIN INTERÉS · NUEVOS INGRESOS TODAS LAS SEMANAS", "enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
