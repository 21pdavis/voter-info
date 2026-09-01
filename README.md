# Voter Info

A mobile app that democratizes voter information — starting with the people who
represent you: your **U.S. Senators** (federal), your **state senators**, and
your **state representatives** (state House / Assembly).

> Status: hello-world proof of concept. The mobile app fetches a list of
> legislators from the API and renders it, grouped by office. Everything else
> (real data, auth, storage) is stubbed and ready to wire up.

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Mobile     | React Native + Expo (TypeScript)                   |
| API        | Node.js + Express (TypeScript), hosted on Render   |
| Database   | PostgreSQL on Supabase                             |
| ORM        | Drizzle                                            |
| Auth       | Clerk (wired in the API, gated behind env vars)    |
| CI/CD      | GitHub Actions → Render deploy hook on push to main |

Request flow: `React Native (Expo)` → `Clerk (JWT, later)` → `Render (Express)` → `Drizzle` → `Supabase (Postgres)`

## Repo layout

```
apps/
  api/      Express API. Runs on bundled sample data until DATABASE_URL is set.
  mobile/   Expo app. Points at EXPO_PUBLIC_API_URL.
.github/workflows/ci.yml   typecheck + build, then trigger Render deploy
render.yaml                Render Blueprint for the API
```

There is no npm workspace / monorepo tooling on purpose — each app installs and
runs on its own.

## Run it locally

### 1. API

```bash
cd apps/api
cp .env.example .env        # fine to leave everything blank for now
npm install
npm run dev                 # http://localhost:4000
```

Check it: `curl http://localhost:4000/api/legislators` → JSON with `"source": "sample"`.

### 2. Mobile

```bash
cd apps/mobile
cp .env.example .env        # set EXPO_PUBLIC_API_URL — see the file's comments
npm install
npm start                   # press "i", "a", or scan the QR with Expo Go
```

**On a physical phone:** your phone can't see `localhost`. Set
`EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to `http://<your-computer-LAN-IP>:4000`
(find it with `ipconfig`), make sure the phone and computer are on the same
Wi-Fi, and restart `npm start`.

## Wiring up the real services

- **Supabase**: put the Postgres URI in `apps/api/.env` as `DATABASE_URL`, then
  `npm run db:push` and `npm run db:seed` from `apps/api`. The API switches from
  sample data to the database automatically.
- **Clerk**: add `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` to `apps/api/.env`.
  The Clerk middleware activates automatically. Adding sign-in UI to the mobile
  app (`@clerk/clerk-expo`) is the next step after hello-world.
- **Render**: create a Blueprint from `render.yaml`, set the env vars in the
  dashboard, and add the service's deploy hook URL as the `RENDER_DEPLOY_HOOK_URL`
  GitHub Actions secret.

## State senators vs. federal senators

Yes, they're different people in different bodies:

- **U.S. Senators** — 2 per state, serve in the U.S. Senate in Washington, D.C.
  (federal law). `role: "us_senator"`.
- **State senators** — serve in your state legislature's upper chamber and write
  state law. Every state except Nebraska also has a lower chamber (State House or
  Assembly) whose members are **state representatives**. `role: "state_senator"`
  and `role: "state_representative"`.

Nebraska is the one exception: its legislature is unicameral, so it has state
senators but no state representatives.
