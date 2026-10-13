# LUXORA WATCHES

A full-stack luxury watch e-commerce platform — React + Vite + GSAP on the frontend,
Node.js + Express + PostgreSQL on the backend. Real authentication, a real database,
a real admin panel. No mock data, no fake auth.

```
luxora-watches/
├── backend/     Express API + PostgreSQL
└── frontend/    React + Vite + GSAP
```

---

## 1. Install Node.js

You need **Node.js 18 or later**. Check your version:

```bash
node -v
```

If you need to install it, get it from [nodejs.org](https://nodejs.org) or via a version
manager like `nvm`.

## 2. Install PostgreSQL

Install PostgreSQL 14+ from [postgresql.org](https://www.postgresql.org/download/) or via
your package manager:

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 3. Create the database

```bash
psql postgres
```

```sql
CREATE DATABASE luxora_watches;
CREATE USER luxora_user WITH ENCRYPTED PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE luxora_watches TO luxora_user;
\q
```

## 4. Configure environment variables

**Backend:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

```
DATABASE_URL=postgresql://luxora_user:change_this_password@localhost:5432/luxora_watches
JWT_SECRET=<run: openssl rand -base64 48>
COOKIE_SECRET=<run: openssl rand -base64 48>
CLIENT_URL=http://localhost:5173
PORT=5000
```

Leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` blank for now — see step 10.

For product images and avatars, create a free [Cloudinary](https://cloudinary.com) account and set
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Without them the app runs fine,
but image/avatar uploads return a clear "image storage is not configured" error (seeded products use
hosted photo URLs, so the storefront still looks complete).

**Frontend:**

```bash
cd ../frontend
cp .env.example .env
```

The defaults (`VITE_API_URL=http://localhost:5000/api`) work out of the box for local dev.

## 5. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 6. Run database migrations

This creates every table, index, and trigger:

```bash
cd backend
npm run migrate
```

You should see `✔ Schema migration complete.`

## 7. Seed the database

This seeds 7 categories and 30+ realistic watch products with real photography:

```bash
npm run seed
```

You should see `✔ Seed complete.`

## 8. Start the backend

```bash
# from backend/
npm run dev
```

The API is now running at `http://localhost:5000`. Verify with:

```bash
curl http://localhost:5000/api/health
```

## 9. Start the frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. You should see the Luxora homepage with the preloader,
hero, and live product data from your database.

## 10. Configure Google OAuth (optional)

To enable "Continue with Google":

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID (type: Web application).
3. Add `http://localhost:5173` to **Authorized JavaScript origins**.
4. Copy the **Client ID** and **Client Secret**.
5. In `backend/.env`, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. In `frontend/.env`, set `VITE_GOOGLE_CLIENT_ID` to the same Client ID.
7. Restart both servers.

Until configured, the Google button shows a clear "not yet configured" message instead
of pretending to work.

## 11. Create an admin account

Set a strong password in `backend/.env`:

```
ADMIN_EMAIL=admin@luxora.com
ADMIN_PASSWORD=<a strong password — this is only read once by the script below>
```

Then run:

```bash
cd backend
npm run create-admin
```

This creates (or promotes) that account to `role = admin`. Sign in at
`http://localhost:5173/login` with those credentials, then visit
`http://localhost:5173/admin`. Regular customer accounts can never reach admin routes —
this is enforced server-side, not just hidden in the UI.

You can remove `ADMIN_PASSWORD` from `.env` after running the script if you'd like it out
of the file.

## 12. Production deployment

**Backend:**
- Set `NODE_ENV=production` and a real `DATABASE_URL` (managed Postgres — RDS, Supabase,
  Render, Railway, etc. all work).
- Set strong, unique `JWT_SECRET` and `COOKIE_SECRET` values.
- Set `CLIENT_URL` to your deployed frontend's origin (required for CORS and cookies).
- Run `npm run migrate && npm run seed` once against the production database (skip seed
  if you're loading real inventory instead).
- Run `npm run create-admin` once to provision your real admin account.
- Start with `npm start` behind a process manager (pm2, systemd) or deploy to a Node host
  (Render, Railway, Fly.io, a VPS).

**Frontend:**
- Set `VITE_API_URL` to your deployed backend's `/api` URL.
- Build with `npm run build` — this outputs static files to `frontend/dist/`.
- Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront).

**Checklist before going live:**
- [ ] `JWT_SECRET` / `COOKIE_SECRET` are long, random, and not committed anywhere
- [ ] `NODE_ENV=production` so cookies are set `secure: true`
- [ ] Database has automated backups configured
- [ ] Google OAuth origins updated to your production domain
- [ ] Admin password rotated from whatever was used during setup

---

## What's implemented

- Full PostgreSQL schema (idempotent `schema.sql` + `schema_v2_upgrade.sql`, both run by `npm run migrate`) and a 30-product seed priced in **PKR**
- JWT + bcrypt authentication, Google sign-in (Google Identity Services), HTTP-only cookies, role-based admin authorization enforced on the backend
- Catalog with filtering/sorting/pagination, cart, wishlist, multi-step checkout with transactional stock locking and backend coupon validation (percentage/fixed, min order, max discount, start/expiry, usage + per-user limits), order history with status timeline
- Reviews with verified-purchase detection, duplicate prevention and admin moderation
- **PKR everywhere** (`formatPKR`), free shipping above PKR 150,000, PKR 2,500 standard / 4,500 express
- **Font Awesome** icons throughout (single icon layer: `frontend/src/components/icons.jsx`)
- **Real image upload** via Cloudinary: multi-image product manager (drag & drop, progress, reorder, set primary, remove) and customer/admin avatar upload with validation
- Admin panel: dashboard (real DB stats/charts), products (CRUD + bulk actions + image manager), categories, collections, orders, customers, inventory, reviews, coupons, journal CMS, testimonials, messages inbox, notifications, activity log, settings, admin profile, Ctrl+K command palette / global search
- Contact form → database → admin inbox + notification
- SEO: per-page titles/descriptions/Open Graph, Product JSON-LD, DB-generated `/sitemap.xml`, `robots.txt`
- Info pages: FAQ, Shipping, Returns, Warranty, Privacy, Terms (copy mirrors the actual checkout values — review it before launch)
- Forgot/reset password flow (token-based, 1-hour expiry, hashed token — email is sent via SMTP if `EMAIL_HOST`/`EMAIL_USER`/`EMAIL_PASS` are set, otherwise the reset link is logged to the server console so it's still testable)
- GSAP animation system, light/dark themes, responsive layouts, every input has a placeholder

### Sitemap
The backend serves `/sitemap.xml`. In production, proxy `/sitemap.xml` from your frontend host to the API, and
replace `YOUR-DOMAIN` in `frontend/public/robots.txt`.

## Not built yet / known limitations

Being upfront so nothing surprises you:

- **Not verified by a real build.** The environment this was written in had no network, so `npm install` / `vite build`
  were never run. Every file passes a syntax check and every relative import resolves, but run
  `npm install && npm run build` in `frontend/` first and fix anything it reports.
- **Storefront features from the v2 spec still missing:** Quick View modal, product image zoom/fullscreen viewer,
  product comparison, Recently Viewed UI (table + schema exist), save-for-later in the cart UI, customer notification
  center UI (API exists), account Security/sessions page.
- **Admin gaps:** homepage/content CMS (table exists, no API/UI yet), analytics date-range filters, inventory
  adjustment history, and the product form exposes core fields only (cost price, SEO, collection, barcode, etc. exist in
  the database but not yet in the form).
- **Build Your Watch pricing:** the configurator shows a live custom price, but the cart line's stored unit price still
  comes from the base product. A price-override column on `cart_items`/`order_items` is the proper fix.
- **Card payment:** data model supports it; no payment processor is integrated (orders are created `unpaid`).
- **Google login** uses Google Identity Services (client-side button + server token verification), not a
  server-redirect/callback flow.
