# Aura Femenina - AI-Driven E-Commerce Platform 🛍️🤖✨

Ecosistema de comercio electrónico de última generación diseñado para la marca de indumentaria **Aura Femenina** (`aurafemenina.com.ar`). Esta plataforma no solo gestiona el catálogo y las ventas tradicionales, sino que integra modelos de Inteligencia Artificial tanto en la experiencia de la usuaria final como en la toma de decisiones del panel de administración.

---

## 🧠 Módulos de Inteligencia Artificial

El núcleo diferenciador de este proyecto es su arquitectura dividida en dos cerebros cognitivos:

### 1. Asistente Virtual IA (Customer-Facing)
Un agente inteligente integrado en el frontend diseñado para guiar a las clientas en su proceso de compra de manera personalizada.
- **Asesoramiento de Estilo Activo:** Recomienda prendas, combina outfits y sugiere productos según las preferencias de navegación de la usuaria.
- **Sincronización Cognitiva de Catálogo:** Conoce al instante el stock, disponibilidad de talles y precios reales en tiempo real (por ejemplo, el valor exacto del *Conjunto NY*).
- **Reducción de Fricción:** Resuelve dudas frecuentes en el checkout y prepara el pedido de forma inteligente antes de derivar la compra final a WhatsApp.

### 2. Cerebro IA en Panel de Control (Admin-Facing)
Un motor de IA especializado integrado en el backend administrativo para optimizar la gestión operativa del negocio.
- **Análisis Predictivo:** Evalúa tendencias de venta y consultas de las usuarias para sugerir stock inteligente o alertar sobre productos de alta demanda.
- **Automatización de Catálogo:** Capacidad de interpretar descripciones y optimizar la carga de nuevos ingresos de indumentaria.
- **Asistente Operativo de Negocio:** Permite al administrador interactuar mediante lenguaje natural para consultar métricas complejas, rendimiento de la base de datos o estados de órdenes sin necesidad de escribir consultas SQL manuales.

---

## ✨ Características Generales de la Plataforma

- **Autenticación Omnicanal:** Inicio de sesión unificado con Google Auth nativo y Email/Contraseña gestionado por capas criptográficas.
- **Flujo de Checkout Fluido:** Carrito dinámico que procesa la orden, calcula costos y genera un formato de orden limpio para confirmación inmediata.
- **Base de Datos Relacional Automatizada:** Arquitectura en Supabase con *Triggers* y *Database Functions* automatizados que crean perfiles de clientes estructurados en la tabla `profiles` inmediatamente tras el registro.
- **Infraestructura Edge y DNS:** Enrutamiento perimetral optimizado y protección contra amenazas mediante proxy inverso en **Cloudflare**, garantizando un tiempo de respuesta ultra bajo en producción.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React + TypeScript (Clean Architecture & Type Safety).
- **Build Tool:** Vite (HMR ultra rápido para desarrollo fluido).
- **UI/UX:** Tailwind CSS + shadcn/ui (Diseño responsivo, estético, minimalista y accesible).
- **Backend as a Service (BaaS):** Supabase (PostgreSQL relacional, Auth Engine y Storage).
- **IA Integration:** Modelos integrados y orquestados mediante el entorno de desarrollo automatizado de Lovable.
- **Red & Infraestructura:** Cloudflare (DNS de alta velocidad, SSL avanzado y Proxying de producción).

---

## 🚀 Arquitectura y Desarrollo Local

Si necesitás clonar el repositorio para auditar código, realizar deploys locales o inyectar nuevas integraciones en el pipeline:

### Requisitos Previos
- Node.js (versión LTS recomendada)
- npm o pnpm

### Pasos de Instalación:

1. **Clonar el repositorio:**
   ```sh
   git clone https://github.com/GonzaaOrtiz16/aurafemenina.git
   cd aurafemenina
   ```

2. **Instalar dependencias:**
   ```sh
   npm install
   ```

3. **Configurar variables de entorno:**
   ```sh
   cp .env.example .env
   ```
   Completá `.env` con los valores de tu proyecto Supabase (ver `.env.example`).
   Los secretos de backend (`LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) se
   configuran en **Supabase → Edge Functions → Secrets**, nunca en el frontend.

4. **Levantar el entorno de desarrollo:**
   ```sh
   npm run dev
   ```
   La app queda disponible en `http://localhost:8080`.

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Build de producción. |
| `npm run preview` | Sirve el build de producción localmente. |
| `npm run lint` | Linting con ESLint. |
| `npm run test` | Corre los tests con Vitest. |
