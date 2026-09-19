# Folio - free website builder for students & personal portfolios

Create a professional portfolio or personal website without writing code. Pick a
type, add your info, choose a template, restyle it, and publish to a free
subdomain (`you.yourdomain.com`).

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, **MongoDB**,
**NextAuth (Google OAuth)**, and **S3-compatible storage** (Cloudflare R2 / AWS S3).

## Features (MVP)

- **Google-only sign-in** (NextAuth v5) with a user dashboard.
- **Creation wizard** - choose a site type, template, and enter your content
  (name, photo, bio, skills, projects + images, social links, resume PDF).
- **3 responsive templates** - Modern Developer, Minimal Student, Simple
  Personal - all driven dynamically by your data.
- **Editor** - change colors & fonts, reorder / show / hide sections (drag &
  drop), switch templates, and see a **live preview** before publishing.
- **Publishing** - one click makes your site live at `subdomain.ROOT_DOMAIN`,
  served from a tag-cached read for fast loads.
- **Dashboard** - manage sites, track visit counts, edit content, republish.

## Architecture

| Concern            | Choice                                                            |
| ------------------ | ----------------------------------------------------------------- |
| App                | Next.js App Router, Server Actions, TypeScript, Tailwind          |
| Auth               | NextAuth v5, Google provider, MongoDB adapter, JWT sessions       |
| Data               | MongoDB. `User` (via adapter) + `Website` (Mongoose) documents    |
| Storage            | Any S3-compatible bucket (R2/S3); **local-disk fallback** in dev  |
| Publishing         | `middleware.ts` maps `sub.domain` → `/site/[sub]`; render is      |
|                    | cached and tagged `site:<sub>` and revalidated on edit/publish    |
| Analytics          | Client beacon → `/api/visit/[sub]` increments a counter           |

**Why not literal static-file generation per user?** For an MVP this is lower
cost and simpler to operate: every published site is a single MongoDB document
rendered by a shared, cache-tagged route. Publishing/editing calls
`revalidateTag`, so visitors get near-static performance without hosting
thousands of separate static bundles. The template layer is already isolated, so
swapping in true static export later is straightforward.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:

- **`AUTH_SECRET`** - run `npx auth secret` (or `openssl rand -base64 32`).
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** - create an OAuth client in the
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  Add redirect URI `http://localhost:3000/api/auth/callback/google`.
- **`MONGODB_URI`** - a local MongoDB or a free [Atlas](https://www.mongodb.com/atlas) cluster.
- **Storage (optional)** - leave the `S3_*` vars blank to use the local-disk
  fallback (`public/uploads`). Set them for R2/S3 in production.

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000.

### Testing subdomains locally

Published sites resolve at `http://<subdomain>.localhost:3000`. Modern browsers
route `*.localhost` to `127.0.0.1` automatically, so no hosts-file editing is
needed in most cases. If your browser doesn't, add entries to `/etc/hosts`:

```
127.0.0.1 alice.localhost
```

## Production notes

- Set `NEXT_PUBLIC_ROOT_DOMAIN` to your real domain (e.g. `folio.app`) and add a
  wildcard DNS record `*.folio.app` → your host. On Vercel, add `*.folio.app` as
  a domain to the project.
- Configure R2/S3 (`S3_*`) - the local-disk fallback is dev-only and won't work
  on serverless.
- Update the Google OAuth redirect URI to your production URL.

## Project layout

```
src/
  app/
    page.tsx                     Landing
    signin/                      Google sign-in
    dashboard/                   Auth-gated app (list, new wizard, editor)
    site/[subdomain]/            Public published-site renderer
    api/                         auth, upload, visit endpoints
    actions/website.ts           Server actions (create/update/publish/delete)
  templates/                     3 templates + shared renderer
  components/                    Reusable form controls (uploads, tags, content)
  models/Website.ts              Mongoose model
  lib/                           db, auth session, storage, types, helpers
  middleware.ts                  Subdomain router
```
# waitlist
