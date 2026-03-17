# Vision Valley Next.js Rewrite

This folder contains the in-progress full rewrite of Vision Valley Blog Website using:

- Next.js App Router
- SQLite (via Prisma)
- shadcn-style UI primitives
- API route handlers replacing the Flask backend

## Quick Start

1. Install packages:

```bash
npm install
```

2. Generate Prisma client and create SQLite schema:

```bash
npm run db:generate
npm run db:push
```

3. Import existing legacy JSON content from ../server_data:

```bash
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Implemented So Far

- Prisma schema for posts, pages, media, drive embeds, settings, comments, admin users, and sessions
- JSON-to-SQLite import script: scripts/import-legacy-json.ts
- Core API routes:
  - auth login/logout/session
  - posts CRUD + by-slug
  - pages CRUD + by-slug
  - media upload/list/get/delete
  - drive embeds CRUD
  - settings get/update
  - stats get
  - comments list/create
- Initial public routes: home, about, blog, blog detail, gallery, contact
- Initial admin routes: login and dashboard

## Notes

- Media uploads are persisted to public/uploads.
- Legacy static blog HTML regeneration is intentionally replaced by dynamic Next routes.
- Admin authentication is DB-backed (session cookie), without Firebase.
