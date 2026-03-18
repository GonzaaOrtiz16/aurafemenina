
-- Subcategories table for product categories
CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subcategories" ON public.subcategories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert subcategories" ON public.subcategories FOR INSERT TO public WITH CHECK (is_admin());
CREATE POLICY "Admins can update subcategories" ON public.subcategories FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete subcategories" ON public.subcategories FOR DELETE TO public USING (is_admin());

-- Subcategories table for encargue categories
CREATE TABLE public.encargue_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.encargue_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

ALTER TABLE public.encargue_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read encargue_subcategories" ON public.encargue_subcategories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert encargue_subcategories" ON public.encargue_subcategories FOR INSERT TO public WITH CHECK (is_admin());
CREATE POLICY "Admins can update encargue_subcategories" ON public.encargue_subcategories FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete encargue_subcategories" ON public.encargue_subcategories FOR DELETE TO public USING (is_admin());

-- Add subcategory_id to products
ALTER TABLE public.products ADD COLUMN subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL;

-- Add subcategory_id and colores/sizes to custom_products
ALTER TABLE public.custom_products ADD COLUMN subcategory_id uuid REFERENCES public.encargue_subcategories(id) ON DELETE SET NULL;
ALTER TABLE public.custom_products ADD COLUMN colores jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.custom_products ADD COLUMN sizes jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.custom_products ADD COLUMN original_price numeric;
ALTER TABLE public.custom_products ADD COLUMN featured boolean NOT NULL DEFAULT false;
