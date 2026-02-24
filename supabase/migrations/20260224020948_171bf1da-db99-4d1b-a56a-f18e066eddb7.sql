
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- is_admin shorthand
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sizes JSONB NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles RLS
CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin());

-- Seed categories
INSERT INTO public.categories (name, slug) VALUES
  ('Jeans', 'jeans'),
  ('Remeras', 'remeras'),
  ('Vestidos', 'vestidos'),
  ('Shorts', 'shorts'),
  ('Camperas', 'camperas'),
  ('Polleras', 'polleras');

-- Seed products from existing data
INSERT INTO public.products (name, slug, description, price, category_id, sizes, images, featured) VALUES
  ('Jean Clásico Recto', 'jean-clasico-recto', 'Jean de corte recto con lavado clásico. Tiro alto, calce cómodo y versatilidad para combinar con cualquier look.', 45900, (SELECT id FROM public.categories WHERE slug = 'jeans'), '{"XS": 5, "S": 8, "M": 10, "L": 6, "XL": 4}', ARRAY['/images/products/jean-clasico.jpg'], true),
  ('Remera Básica Algodón', 'remera-basica-algodon', 'Remera de algodón premium con corte relajado. Ideal para el día a día, suave al tacto y de fácil combinación.', 18900, (SELECT id FROM public.categories WHERE slug = 'remeras'), '{"XS": 10, "S": 12, "M": 15, "L": 8, "XL": 6}', ARRAY['/images/products/remera-basica.jpg'], true),
  ('Vestido Midi Floral', 'vestido-midi-floral', 'Vestido midi con estampado floral delicado. Escote en V, manga corta y falda con vuelo para un look femenino y elegante.', 52900, (SELECT id FROM public.categories WHERE slug = 'vestidos'), '{"XS": 4, "S": 6, "M": 8, "L": 5, "XL": 3}', ARRAY['/images/products/vestido-midi.jpg'], true),
  ('Campera de Cuero Eco', 'campera-cuero-eco', 'Campera de cuero ecológico con cierre central y bolsillos laterales. El básico de entretiempo que nunca pasa de moda.', 79900, (SELECT id FROM public.categories WHERE slug = 'camperas'), '{"XS": 3, "S": 5, "M": 7, "L": 4, "XL": 2}', ARRAY['/images/products/campera-cuero.jpg'], true),
  ('Short de Denim', 'short-denim', 'Short de jean con terminación desflecada. Tiro alto y calce cómodo, perfecto para los días de calor.', 32900, (SELECT id FROM public.categories WHERE slug = 'shorts'), '{"XS": 6, "S": 9, "M": 11, "L": 7, "XL": 4}', ARRAY['/images/products/short-denim.jpg'], true),
  ('Pollera Plisada Midi', 'pollera-plisada-midi', 'Pollera plisada de largo midi con cintura elástica. Tela liviana con caída perfecta para un look sofisticado.', 38900, (SELECT id FROM public.categories WHERE slug = 'polleras'), '{"XS": 5, "S": 7, "M": 9, "L": 6, "XL": 3}', ARRAY['/images/products/pollera-plisada.jpg'], true);
