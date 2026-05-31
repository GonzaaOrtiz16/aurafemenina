// CORS helper con allowlist de orígenes.
// Configurá orígenes extra (separados por coma) en el secret ALLOWED_ORIGINS.
const DEFAULT_ALLOWED = [
  "https://aurafemenina.com.ar",
  "https://www.aurafemenina.com.ar",
  "http://localhost:8080",
  "http://localhost:5173",
];

const ALLOWED_ORIGINS = new Set([
  ...DEFAULT_ALLOWED,
  ...(Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
]);

const ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  // Si el origen está permitido lo reflejamos; si no, no habilitamos CORS.
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  // Permitimos requests sin Origin (server-to-server / curl interno) y orígenes en la lista.
  return !origin || ALLOWED_ORIGINS.has(origin);
}
