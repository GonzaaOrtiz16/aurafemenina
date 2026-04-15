---
name: Shipping Logic
description: Dynamic shipping rates stored in site_settings, editable from admin, with postal code zone detection
type: feature
---
- Shipping rates (cost per zone + minimums) are stored in `site_settings` under key `shipping_rates`
- Admin can edit rates from AdminConfig with a link to Correo Argentino's calculator
- ShippingCalculator reads rates dynamically via `useShippingRates` hook
- Zones: caba, zona_sur, gba, interior — detected by postal code ranges in `getShippingZone()`
- CartPage also reads dynamic minimums from the same hook
- Fallback defaults: CABA/Sur $2500, GBA $3800, Interior $5500; minimums $0 for CABA/Sur, $100k for GBA/Interior
