
-- Create encargue categories table
CREATE TABLE public.encargue_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.encargue_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read encargue categories" ON public.encargue_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert encargue categories" ON public.encargue_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update encargue categories" ON public.encargue_categories FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete encargue categories" ON public.encargue_categories FOR DELETE USING (is_admin());

-- Add category_id to custom_products
ALTER TABLE public.custom_products ADD COLUMN category_id uuid REFERENCES public.encargue_categories(id) ON DELETE SET NULL;
