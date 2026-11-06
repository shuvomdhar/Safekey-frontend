# Safekey — frontend

The Next.js web app for Safekey. It talks to the Express API through the
`/api/*` rewrite configured in `next.config.ts` and authenticates with
**Supabase Auth**.

The browser owns the Supabase session (email/password and Google OAuth) and
sends the access token as `Authorization: Bearer …` on every API request. There
is no Safekey session cookie. Password recovery is handled by the API without
any email.

For full setup, environment variables, API documentation, security notes, and
the project overview, see the [root README](../README.md).

## Local development

```bash
cp .env.example .env    # or: Copy-Item .env.example .env
npm install
npm run dev
```

Required values in `.env`:

```dotenv
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
```

Use the same Supabase project as `SUPABASE_URL`/`SUPABASE_ANON_KEY` in the API.
`NEXT_PUBLIC_*` values are inlined at build time, so rebuild after changing
them. The app expects the API at `BACKEND_URL` (default
`http://localhost:4000`). Running `npm run dev` from the repository root starts
both apps.

In the Supabase dashboard:

- **Authentication → Providers → Email**: enable the provider. **Confirm email**
  can be off (recommended) or on; `/register` creates a confirmed user through
  the API, so it does not depend on this toggle.
- **Authentication → URL Configuration → Redirect URLs**: add
  `http://localhost:3000/auth/callback` (and the production equivalent).

## Auth screens

| Route | Purpose |
| ----- | ------- |
| `/login` | `supabase.auth.signInWithPassword` + Google OAuth |
| `/register` | `POST /api/auth/register`, then `supabase.auth.signInWithPassword` |
| `/forgot-password` | enters an email, then sets a new password through `/api/auth/password-reset` (no email is sent) |
| `/reset-password` | old recovery links redirect to `/forgot-password` |
| `/auth/callback` | waits for the OAuth/recovery session and redirects safely |

## Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start Next.js in development mode.       |
| `npm run build`   | Production build (includes typechecking).|
| `npm run start`   | Serve the production build.              |
| `npm run typecheck` | TypeScript check without emitting.     |
| `npm run lint`    | ESLint.                                  |

## Key directories

- `app/page.tsx` — landing page
- `app/(auth)/` — login, register, forgot/reset password, and the Supabase callback
- `app/dashboard/` — vault list, vault detail, settings
- `components/` — UI primitives, auth, dashboard, folder and entry components
- `lib/` — API client (bearer token), auth context, Supabase client, shared types and formatting helpers
