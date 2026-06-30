# Tekny Campo 🛒

Plataforma de comercio electrónico para insumos agropecuarios, construida con React, TypeScript y Supabase.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Estado | React Context (Auth, Cart, Products) |
| Iconos | Lucide React |
| Rutas | React Router v7 |
| Build | Vite 5 |

## Funcionalidades

- **Catálogo de productos** — Navegación por categorías, búsqueda, filtros de ofertas y destacados
- **Carrito de compras** — Anónimo (basado en sesión) o autenticado, persistido en Supabase
- **Autenticación** — Registro / inicio de sesión, edición de perfil, cambio seguro de correo y contraseña
- **Historial de pedidos** — Seguimiento de estado (pendiente, confirmado, enviado, entregado, cancelado)
- **Lista de deseos** — Guarda productos para después
- **Panel de administración** — CRUD completo de productos (con 1-5 imágenes + conversión automática a WebP), categorías y gestión de ofertas/destacados
- **Subida de imágenes** — PNG/JPG se convierten automáticamente a WebP mediante Canvas API del navegador, almacenadas en Supabase Storage
- **Responsive** — Diseño mobile-first con Tailwind CSS
- **Seguridad** — Políticas Row Level Security (RLS), rol de administrador vía `app_metadata`

## Primeros pasos

### Requisitos

- Node.js 18+
- Un proyecto de Supabase (el plan gratuito funciona)

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Instalación

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Configuración de la base de datos

Ejecuta las migraciones y datos iniciales en tu proyecto de Supabase:

```bash
npx supabase db push --db-url "postgresql://postgres:contraseña@db.tu-proyecto.supabase.co:5432/postgres"
```

### Crear un usuario administrador

Ejecuta este SQL en el Editor SQL de Supabase (reemplaza con el ID del usuario):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
WHERE email = 'admin@teknycampo.com';
```

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── admin/        # Componentes del panel admin (ImageUploader)
│   ├── layout/       # Navbar, Footer, Layout
│   ├── products/     # ProductCard, CategoryCard
│   └── ui/           # LoadingSpinner, EmptyState
├── context/          # Contextos de React (Auth, Cart, Products)
├── lib/              # Utilidades (cliente Supabase, sesión, subida)
├── pages/            # Páginas de rutas
│   └── admin/        # Páginas admin (Productos, Categorías, Ofertas)
└── types/            # Interfaces de TypeScript
```

## Seguridad

- **RLS habilitado** en todas las tablas (products, categories, cart_items, orders, wishlists, product_images)
- **Rol de administrador** verificado mediante `auth.jwt() -> 'app_metadata' ->> 'role'`, nunca desde `user_metadata`
- **Carrito anónimo** restringido a filas con un `session_id` válido
- **Bucket de almacenamiento** lectura pública, escritura solo para administradores

## Licencia

MIT
