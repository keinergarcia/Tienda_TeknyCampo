# Tekny Campo 🛒

E-commerce platform for agricultural supplies built with React, TypeScript, and Supabase.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| State | React Context (Auth, Cart, Products) |
| Icons | Lucide React |
| Routing | React Router v7 |
| Build | Vite 5 |

## Features

- **Product Catalog** — Browse by category, search, filter by offers/featured
- **Shopping Cart** — Anonymous (session-based) or authenticated, persisted in Supabase
- **User Auth** — Sign up / login, profile editing, secure email & password change
- **Order History** — Track order status (pending, confirmed, shipped, delivered, cancelled)
- **Wishlist** — Save products for later
- **Admin Panel** — Full CRUD for products (with 1-5 images + auto WebP conversion), categories, and offer/featured toggles
- **Image Upload** — PNG/JPG auto-converted to WebP via browser Canvas API, stored in Supabase Storage
- **Responsive** — Mobile-first design with Tailwind CSS
- **Security** — Row Level Security (RLS) policies, admin role via `app_metadata`

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Database Setup

Push the migrations and seed data to your Supabase project:

```bash
npx supabase db push --db-url "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

### Creating an Admin User

Run this SQL in the Supabase SQL Editor (replace with your user's ID):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
WHERE email = 'admin@teknycampo.com';
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/        # Admin panel components (ImageUploader)
│   ├── layout/       # Navbar, Footer, Layout
│   ├── products/     # ProductCard, CategoryCard
│   └── ui/           # LoadingSpinner, EmptyState
├── context/          # React contexts (Auth, Cart, Products)
├── lib/              # Utilities (Supabase client, session, upload)
├── pages/            # Route pages
│   └── admin/        # Admin pages (Products, Categories, Offers)
└── types/            # TypeScript interfaces
```

## Security

- **RLS enabled** on all tables (products, categories, cart_items, orders, wishlists, product_images)
- **Admin role** checked via `auth.jwt() -> 'app_metadata' ->> 'role'`, never from `user_metadata`
- **Anon cart** restricted to rows with a valid `session_id`
- **Storage bucket** public-read, admin-write only

## License

MIT
