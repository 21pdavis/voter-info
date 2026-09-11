# Voter Info

A mobile app that democratizes voter information — starting with the people who
represent you: your **U.S. Senators** (federal), your **state senators**, and
your **state representatives** (state House / Assembly).

> Status: real data (Neon Postgres) and Clerk auth are wired end-to-end
> across dev/qa/prod. The app itself is still a single feature — see who
> represents you — with room to grow.

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Mobile     | React Native + Expo Router (TypeScript)            |
| Web        | Same Expo app, via `react-native-web` — one codebase, no separate web app |
| API        | Node.js + Express (TypeScript), hosted on Render   |
| Database   | PostgreSQL on Neon                                 |
| ORM        | Drizzle                                            |
| Auth       | Clerk (email/password, wired in both the API and the app) |
| CI/CD      | GitHub Actions → Render deploy hooks on push to main/qa |

Request flow: `Expo (React Native + react-native-web)` → `Clerk (JWT)` → `Render (Express)` → `Drizzle` → `Neon (Postgres)`

## Environments

Three tiers, mirroring a typical dev → qa → prod flow:

| Tier | API | Database | Mobile | Web |
| ---- | --- | -------- | ------ | --- |
| **dev**  | your machine (`npm run dev`) | Neon `dev` branch (or unset — sample data) | `npx expo start`, EAS `development` build profile | `npx expo start --web` |
| **qa**   | Render `voter-info-api-qa`, tracks `qa` branch | Neon `qa` branch | EAS `preview` build profile | Render `voter-info-web-qa`, tracks `qa` branch |
| **prod** | Render `voter-info-api`, tracks `main` branch  | Neon `main` branch | EAS `production` build profile | Render `voter-info-web`, tracks `main` branch |

Workflow: land feature work on `qa` first (CI deploys `voter-info-api-qa` and `voter-info-web-qa` automatically), verify there, then merge/PR `qa` into `main` to ship to prod. Every `render.yaml` service is CI-gated (`autoDeploy: false`) — GitHub Actions only pings each service's deploy hook after typecheck + build pass for that branch (see `.github/workflows/ci.yml`).

Mobile build profiles live in `apps/mobile/eas.json` — `eas build --profile preview` / `--profile production` bake in the matching `EXPO_PUBLIC_API_URL`. The web static sites bake the same var in at build time via each Render service's env vars (see `render.yaml`).

### Web build details

`apps/mobile/src/app` is the Expo Router route tree (shared by native and web). `npm run build:web` (`expo export --platform web`) statically pre-renders each route to its own HTML file into `apps/mobile/dist` — no SPA rewrite rule needed, direct links like `/sign-in` resolve on their own. Clerk's token cache is native-only (`expo-secure-store`); on web it's `undefined` by design and Clerk falls back to its own browser storage — no platform branching required in app code.

## Repo layout

```
apps/
  api/      Express API. Runs on bundled sample data until DATABASE_URL is set.
  mobile/   Expo app (native + web, via react-native-web). Routes live in
            src/app; points at EXPO_PUBLIC_API_URL.
.github/workflows/ci.yml   typecheck + build, then trigger Render deploy hooks
render.yaml                Render Blueprint for the API and the web export
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

### 3. Web

From `apps/mobile`, with the same `.env` as above:

```bash
npm run web                 # dev server at http://localhost:8081
npm run build:web           # static export to apps/mobile/dist
```

## Wiring up the real services

- **Neon**: create a project, then create `main`, `qa`, and `dev` branches
  (Neon Console → Branches → New Branch). Put the matching branch's pooled
  connection string in `apps/api/.env` as `DATABASE_URL` locally (use the
  `dev` branch), and in each Render service's dashboard env vars (`main`
  branch → `voter-info-api`, `qa` branch → `voter-info-api-qa`). Then
  `npm run db:push` and `npm run db:seed` from `apps/api` against whichever
  branch you're pointed at. The API switches from sample data to the database
  automatically once `DATABASE_URL` is set.
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
