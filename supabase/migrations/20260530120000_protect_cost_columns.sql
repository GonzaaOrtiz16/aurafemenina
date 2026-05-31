-- Oculta el costo (margen de ganancia) al rol anónimo.
-- La policy RLS "Anyone can read products" usa USING (true), por lo que cualquier
-- visitante con la anon key podía leer la columna `cost`. RLS no filtra columnas,
-- así que aplicamos privilegios a nivel de columna: revocamos el SELECT de tabla
-- para `anon` y lo re-otorgamos sobre todas las columnas EXCEPTO `cost`.
--
-- Nota: el panel admin lee `cost` con el rol `authenticated` (no se toca acá) y las
-- edge functions usan service_role, que ignora estos privilegios. PostgREST expande
-- `select=*` solo a las columnas accesibles por el rol, así que el store público sigue
-- funcionando sin cambios.

-- ── products ──
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, name, slug, description, price, original_price,
  category_id, subcategory_id, sizes, images, colores, featured,
  created_at, updated_at
) ON public.products TO anon;

-- ── custom_products (encargues) ──
REVOKE SELECT ON public.custom_products FROM anon;
GRANT SELECT (
  id, name, slug, description, price_estimate, original_price,
  estimated_days, category_id, subcategory_id, sizes, images, colores,
  featured, created_at
) ON public.custom_products TO anon;
