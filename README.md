# Elara

**Elara — Your life, intelligently organized.**

A personal life-management app (tasks, calendar, notes, expenses, shopping lists)
built offline-first, with a React Native/Expo client and a NestJS/PostgreSQL backend.
See [`docs/architecture/`](docs/architecture) for the full architecture plan.

AI assistant functionality is intentionally not implemented yet — `packages/ai` is a
scaffolded seam for a later phase.

## Structure

```
apps/
  mobile/   Expo Router app (React Native + TypeScript)
  api/      NestJS API (PostgreSQL via Prisma)
packages/
  types/        Domain types (inferred from validation schemas)
  validation/   Zod schemas — single source of truth for API/mobile contracts
  shared/       Framework-agnostic utils (date, currency)
  config/       Shared tsconfig/eslint/prettier presets
  ai/           Scaffold only — no implementation yet
infrastructure/docker/   Reserved for production Dockerfiles (Phase 12)
```

## Prerequisites

- Node.js 20+
- npm 10+ (ships with Node)
- Docker Desktop (for local Postgres/Redis)

## Setup

```bash
npm install
docker compose up -d          # Postgres on host port 5433, Redis on 6379
cp apps/api/.env.example apps/api/.env
npm run prisma:migrate -w apps/api
```

> The Postgres container is mapped to host port **5433**, not 5432 — this avoids
> colliding with any Postgres already installed natively on your machine. Adjust
> `DATABASE_URL` in `apps/api/.env` if you change the mapping.

> First install: npm 11's script-allowlisting will pause on Prisma's (and
> fsevents' on macOS) install scripts. Run `npm approve-scripts --allow-scripts-pending`
> and re-run `npm install` — this repo's `allowScripts` list in the root
> `package.json` already trusts them for subsequent installs.

## Development

```bash
npm run dev              # runs mobile + api together via Turborepo
npm run dev:api          # api only — http://localhost:3000/api/v1/health
npm run dev:mobile       # mobile only — Expo dev server (press i/a/w)
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run format
```

Husky runs `lint-staged` on commit (ESLint + Prettier on staged files).

## Current status

Phase 1 (project setup) is complete: monorepo scaffold, shared
types/validation packages, Docker Compose for Postgres/Redis, a NestJS API with
a working `/api/v1/health` check backed by the full Prisma schema, and an Expo
Router mobile app that boots successfully. Feature modules (tasks, calendar,
notes, expenses, shopping, auth, offline sync, notifications) land in the phases
that follow, per the architecture plan.
