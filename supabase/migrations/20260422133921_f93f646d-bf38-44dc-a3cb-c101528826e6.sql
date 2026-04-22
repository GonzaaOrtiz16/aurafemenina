-- 1. Agregar campo costo a productos
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost numeric NOT NULL DEFAULT 0;
ALTER TABLE public.custom_products ADD COLUMN IF NOT EXISTS cost numeric NOT NULL DEFAULT 0;

-- 2. Tabla de ventas (manuales)
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  customer_name text,
  customer_phone text,
  channel text NOT NULL DEFAULT 'manual',
  payment_method text NOT NULL DEFAULT 'efectivo',
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sales" ON public.sales FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update sales" ON public.sales FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete sales" ON public.sales FOR DELETE TO authenticated USING (is_admin());

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sales_date ON public.sales(sale_date DESC);

-- 3. Items de venta
CREATE TABLE public.sale_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  size text,
  color text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sale items" ON public.sale_items FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert sale items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update sale items" ON public.sale_items FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete sale items" ON public.sale_items FOR DELETE TO authenticated USING (is_admin());

CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON public.sale_items(product_id);

-- 4. Gastos
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date timestamp with time zone NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'otros',
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'efectivo',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read expenses" ON public.expenses FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete expenses" ON public.expenses FOR DELETE TO authenticated USING (is_admin());

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_expenses_date ON public.expenses(expense_date DESC);

-- 5. Fiados
CREATE TABLE public.fiados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  due_date date,
  status text NOT NULL DEFAULT 'pendiente',
  paid_at timestamp with time zone,
  notes text,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fiados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read fiados" ON public.fiados FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert fiados" ON public.fiados FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update fiados" ON public.fiados FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "Admins can delete fiados" ON public.fiados FOR DELETE TO authenticated USING (is_admin());

CREATE TRIGGER update_fiados_updated_at BEFORE UPDATE ON public.fiados
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_fiados_status ON public.fiados(status);