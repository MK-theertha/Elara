# Elara — Architecture Plan

## Context

Elara is a greenfield personal life-management mobile app (tasks, calendar, notes,
expenses, shopping lists) with an offline-first mobile client and a NestJS/Postgres
backend, explicitly scoped to exclude AI/LLM functionality until a later phase. The
target directory (`/Users/bititude/Documents/projects/Elara`) is empty, so this is a
full greenfield build. The goal of this document is to lock in architecture, schema,
API contracts, navigation, and sync strategy _before_ any code is written, so that
implementation can proceed feature-by-feature without major rework — and so the AI
layer can be bolted on later without touching core data models.

No repository exists yet, so there is nothing to explore — this plan is a from-scratch
design based on the requirements given.

---

## 1. Proposed Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│         Mobile App          │  REST/  │           API Server          │
│  Expo / React Native / TS   │  WS     │   NestJS (Node.js / TS)       │
│                              │◄───────►│                                │
│  UI (Expo Router)            │         │  Controllers → Services       │
│  TanStack Query (server st.) │         │  → Repositories (Prisma)      │
│  Zustand (client/UI state)   │         │  Guards (JWT auth)             │
│  SQLite (offline domain data)│         │  WebSocket Gateway (sync push) │
│  Sync Engine + Mutation Queue│         └───────────────┬────────────────┘
│  NetInfo (connectivity)      │                         │
│  Expo Notifications          │                         ▼
└──────────────────────────────┘                ┌─────────────────┐
                                                   │   PostgreSQL     │
                                                   │   (Prisma ORM)   │
                                                   └─────────────────┘
                                                   ┌─────────────────┐
                                                   │      Redis        │
                                                   │ (rate limit, cache,│
                                                   │  WS pub/sub, jobs) │
                                                   └─────────────────┘
```

**Core architectural decisions:**

- **Offline-first, local-first writes.** Every mutation writes to SQLite first, updates
  the UI immediately, and is queued for sync. The API is a sync target, not a
  dependency for the write path.
- **Layered backend.** Controllers (HTTP/DTO boundary) → Services (business logic) →
  Prisma (persistence). Domain models never leak directly into API responses — every
  endpoint returns a versioned DTO shape.
- **Shared contracts, not shared runtime code.** `packages/types` and
  `packages/validation` (Zod schemas) are imported by both `apps/mobile` and
  `apps/api`, so a task's shape and validation rules are defined once and can't drift
  between client and server.
- **Sync is pull + push, not real-time-only.** WebSockets are used for _live push_ of
  changes (so a second device sees updates quickly) but the source of truth for
  consistency is a REST sync endpoint with `updatedAt`/cursor-based pagination — the
  app must work correctly even if the socket never connects.
- **AI-ready seams, not AI code.** `packages/ai` is scaffolded with empty
  `assistant/tools/embeddings/rag/prompts` directories and no dependencies. Domain
  services (`TaskService`, `CalendarService`, etc.) are written as the natural place
  for a future AI tool-calling layer to call into — no LLM code, no vector DB, no API
  keys in this phase.

---

## 2. Repository Structure

npm workspaces + Turborepo (lightweight, fast, ideal for a mobile+api+shared-packages
monorepo; avoids Nx's heavier plugin model for a project this size).

```
elara/
├── apps/
│   ├── mobile/                  # Expo Router app
│   │   ├── app/                 # file-based routes (see Nav section)
│   │   ├── src/
│   │   │   ├── components/      # design system (Button, Card, etc.)
│   │   │   ├── features/        # tasks/, calendar/, notes/, expenses/, shopping/
│   │   │   ├── db/              # SQLite schema, migrations, DAO layer
│   │   │   ├── sync/            # mutation queue, sync engine, conflict resolution
│   │   │   ├── api/              # generated/typed API client (TanStack Query hooks)
│   │   │   ├── stores/          # Zustand stores
│   │   │   ├── hooks/
│   │   │   ├── theme/           # design tokens
│   │   │   └── lib/             # notifications, secure storage, network
│   │   └── app.config.ts
│   └── api/                     # NestJS app
│       ├── src/
│       │   ├── modules/         # auth/, users/, tasks/, events/, notes/,
│       │   │                    # expenses/, shopping-lists/, reminders/, sync/
│       │   ├── common/          # guards, interceptors, filters, decorators
│       │   └── prisma/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── test/
│
├── packages/
│   ├── shared/                  # framework-agnostic utils (date, currency, etc.)
│   ├── types/                   # domain types (Task, Event, Note, Expense, ...)
│   ├── validation/              # Zod schemas, single source of truth for both apps
│   ├── config/                  # shared eslint/tsconfig/prettier configs
│   └── ai/                      # SCAFFOLD ONLY — no deps, no implementation yet
│       └── src/{assistant,tools,embeddings,rag,prompts}/.gitkeep
│
├── infrastructure/
│   └── docker/                  # postgres, redis, api Dockerfiles
├── docs/
│   └── architecture/            # this plan, ADRs as decisions evolve
├── .github/workflows/           # pr.yml, staging.yml, production.yml
├── docker-compose.yml
├── turbo.json
└── package.json   # "workspaces": ["apps/*", "packages/*"]
```

---

## 3. Technology Choices & Reasoning

| Area                | Choice                                                                                                          | Why                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile framework    | Expo (managed, latest SDK) + RN new architecture                                                                | Fast iteration, OTA updates, first-class TS support, `expo-notifications`/`expo-sqlite`/`expo-secure-store` cover most native needs without ejecting                                    |
| Routing             | Expo Router                                                                                                     | File-based, typed routes, native deep-linking, pairs naturally with tab+stack nav described below                                                                                       |
| Server state        | TanStack Query v5                                                                                               | Battle-tested caching/retry/refetch; pairs with a custom persister backed by SQLite for offline reads                                                                                   |
| Client/UI state     | Zustand                                                                                                         | Minimal boilerplate, no context-provider tree, easy to keep UI state (theme, filters, modals) separate from server/domain state                                                         |
| Forms               | React Hook Form + Zod resolver                                                                                  | Uncontrolled inputs = good perf on mobile; Zod schemas shared with backend via `packages/validation`                                                                                    |
| Local persistence   | `expo-sqlite` (SQLite)                                                                                          | Relational, transactional, supports the mutation-queue pattern; better fit than AsyncStorage/MMKV for structured, queryable domain data                                                 |
| Animations/gestures | Reanimated + Gesture Handler                                                                                    | Needed for swipe-to-complete/delete on tasks and shopping items, bottom sheets, smooth tab transitions                                                                                  |
| Backend framework   | NestJS                                                                                                          | Opinionated module/DI structure scales well across 7+ resource modules, first-class support for guards/interceptors/pipes (validation, auth, rate limiting), built-in WebSocket gateway |
| ORM                 | Prisma                                                                                                          | Type-safe queries, migrations, good DX; schema doubles as living documentation                                                                                                          |
| Database            | PostgreSQL                                                                                                      | Relational integrity for user-owned resource graphs, strong indexing/query support                                                                                                      |
| Cache/queue         | Redis                                                                                                           | Rate limiting store, WS pub/sub across API instances, later home for background job queue (BullMQ) if needed                                                                            |
| Auth                | JWT access token (short-lived) + rotating refresh token, stored via `expo-secure-store`                         | Avoids AsyncStorage for tokens (plain text on disk); refresh-token rotation + revocation list in Redis/Postgres gives a path to OAuth later without redesign                            |
| Monorepo tooling    | npm workspaces + Turborepo                                                                                      | Simple, fast, minimal config overhead vs Nx; good caching for CI                                                                                                                        |
| Testing             | Jest + React Native Testing Library (mobile), Jest + Supertest (api), Detox scaffold (e2e, not implemented yet) | Matches Expo/NestJS ecosystem defaults                                                                                                                                                  |
| Lint/format/hooks   | ESLint + Prettier + Husky + lint-staged                                                                         | Standard, CI-enforced                                                                                                                                                                   |

All packages will be pinned to their current stable majors compatible with the latest
Expo SDK at setup time (exact versions resolved when `apps/mobile` is scaffolded, since
Expo SDK compatibility is the binding constraint on RN/Reanimated/Gesture-Handler
versions).

---

## 4. Database Schema (PostgreSQL via Prisma)

Every user-owned table has a `userId` FK with `onDelete: Cascade` and a compound index
`(userId, ...)` matching its primary list-query pattern. All tables get `id` (uuid),
`createdAt`, `updatedAt`; sync-relevant tables also get `deletedAt` (soft delete, so
deletions can be synced to offline clients) and a `version` int (optimistic
concurrency for conflict detection).

```prisma
enum Priority { LOW MEDIUM HIGH URGENT }
enum TaskStatus { PENDING COMPLETED }        // "Overdue" is derived (pending + dueDate < now)
enum RecurrenceFreq { NONE DAILY WEEKLY MONTHLY YEARLY }
enum PaymentMethod { CASH CARD BANK_TRANSFER OTHER }
enum ExpenseCategory { FOOD TRANSPORT SHOPPING BILLS ENTERTAINMENT HEALTH TRAVEL OTHER }
enum ShoppingCategory { GROCERIES HOUSEHOLD ELECTRONICS TRAVEL CUSTOM }

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String?
  timezone      String   @default("UTC")
  currency      String   @default("USD")
  themeMode     String   @default("system")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  refreshTokens RefreshToken[]
  tasks         Task[]
  events        Event[]
  notes         Note[]
  expenses      Expense[]
  shoppingLists ShoppingList[]
  reminders     Reminder[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String
  revokedAt DateTime?
  expiresAt DateTime
  createdAt DateTime @default(now())
  @@index([userId])
}

model Task {
  id          String     @id @default(uuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  notes       String?
  status      TaskStatus @default(PENDING)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  category    String?
  recurrence  RecurrenceFreq @default(NONE)
  parentTaskId String?        // recurring-series origin, self-relation
  subtasks    Subtask[]
  reminders   Reminder[]
  version     Int        @default(1)
  deletedAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@index([userId, status, dueDate])
  @@index([userId, deletedAt, updatedAt])   // sync cursor pattern
}

model Subtask {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title     String
  completed Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([taskId])
}

model Event {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  startAt     DateTime
  endAt       DateTime
  location    String?
  category    String?
  recurrence  RecurrenceFreq @default(NONE)
  externalId  String?        // future external-calendar sync (e.g. Google Calendar UID)
  reminders   Reminder[]
  version     Int      @default(1)
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([userId, startAt])
  @@index([userId, deletedAt, updatedAt])
}

model Reminder {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskId     String?
  task       Task?    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  eventId    String?
  event      Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  remindAt   DateTime
  message    String?
  fired      Boolean  @default(false)
  deletedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([userId, remindAt])
}

model Note {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  body        String?               // plain text now; structure allows rich-text JSON later
  type        String   @default("text")  // "text" | "checklist"
  checklist   Json?                 // [{ text, checked }] when type = checklist
  tags        String[]
  category    String?
  pinned      Boolean  @default(false)
  archived    Boolean  @default(false)
  version     Int      @default(1)
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([userId, pinned, archived])
  @@index([userId, deletedAt, updatedAt])
}

model Expense {
  id            String          @id @default(uuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount        Decimal         @db.Decimal(12, 2)
  currency      String
  category      ExpenseCategory
  description   String?
  paymentMethod PaymentMethod   @default(CASH)
  occurredAt    DateTime
  version       Int             @default(1)
  deletedAt     DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  @@index([userId, occurredAt])
  @@index([userId, category])
}

model ShoppingList {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  category  ShoppingCategory @default(CUSTOM)
  items     ShoppingItem[]
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([userId])
}

model ShoppingItem {
  id         String   @id @default(uuid())
  listId     String
  list       ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
  name       String
  quantity   Int      @default(1)
  category   String?
  notes      String?
  purchased  Boolean  @default(false)
  sortOrder  Int      @default(0)
  deletedAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([listId, purchased, sortOrder])
}
```

Notes: `Reminder` is deliberately its own table (rather than a column on Task/Event) so
notification scheduling/cancellation logic is uniform across both, and so
`packages/ai` can later query "all upcoming reminders" without touching two schemas.

---

## 5. API Design

**Conventions**

- Base path `/api/v1`. Every response uses a consistent envelope:
  ```ts
  // success
  { success: true, data: T, meta?: { page, pageSize, total, cursor } }
  // error
  { success: false, error: { code: string, message: string, details?: unknown } }
  ```
- Pagination: cursor-based (`?cursor=<updatedAt>_<id>&limit=50`) for sync endpoints;
  offset-based (`?page=&pageSize=`) for simple UI lists. Filtering/sorting via query
  params validated per-endpoint with Zod DTOs (`?status=pending&sort=-dueDate`).
- All DTOs (request bodies and response shapes) live in `packages/validation`
  (Zod schemas) and `packages/types` (inferred TS types) — the NestJS controllers use
  a `ZodValidationPipe`, and the mobile API client is typed against the same schemas.
- Standard HTTP status codes; validation errors → 422 with field-level `details`.
- Auth: `Authorization: Bearer <accessToken>`; `POST /auth/refresh` rotates refresh
  tokens (stored hashed, revocable). Rate limiting (per-IP and per-user) via Nest
  `ThrottlerModule` backed by Redis.

**Endpoint groups**

```
/auth        POST /register  POST /login  POST /refresh  POST /logout
             POST /forgot-password  POST /reset-password
/users       GET /me   PATCH /me   PATCH /me/preferences
/tasks       GET / POST /   GET/PATCH/DELETE /:id
             POST /:id/complete  POST /:id/restore
             GET/POST /:id/subtasks   PATCH/DELETE /subtasks/:id
/events      GET / POST /   GET/PATCH/DELETE /:id   (?from=&to=&view= for range queries)
/notes       GET / POST /   GET/PATCH/DELETE /:id   POST /:id/pin  POST /:id/archive
/expenses    GET / POST /   GET/PATCH/DELETE /:id   GET /summary  GET /by-category
/shopping-lists  GET / POST /   GET/PATCH/DELETE /:id
                 POST /:id/items  PATCH/DELETE /items/:id  POST /items/:id/purchase
/reminders   GET / POST /   PATCH/DELETE /:id
/sync        GET /pull?since=<cursor>&resources=tasks,events,...
             POST /push   { mutations: [{ resource, op, id, payload, clientVersion }] }
```

`/sync/pull` and `/sync/push` are the backbone of the offline strategy (detailed
below) — every resource module also exposes normal REST CRUD for simple
online-first debugging/tools use, but the mobile app talks to `/sync` for its
primary read/write path.

**WebSocket gateway** (`/ws`, namespaced per user via JWT handshake auth): emits
`resource.changed` events `{ resource, id, op }` so other active devices know to
call `/sync/pull` — the socket carries _invalidation signals_, not the data itself,
keeping the source of truth single (the sync endpoint).

---

## 6. Offline-First & Sync Strategy

**Local schema mirrors the server schema** (SQLite tables matching the Prisma models
above, minus `User`/auth tables which stay server-only + a local `session` table).
Every local table additionally has a `syncStatus: 'synced' | 'pending' | 'error'`
column.

**Write path**

```
UI action → write to SQLite (generate uuid client-side) → mark syncStatus='pending'
   → UI reads from SQLite via TanStack Query (SQLite-backed queryFn) → instant update
   → insert into local `mutation_queue` table (resource, op, payload, createdAt)
```

**Sync engine** (`apps/mobile/src/sync/`), triggered on: app foreground, network
reconnect (via `@react-native-community/netinfo`), periodic background task
(`expo-background-fetch` / `expo-task-manager`), and manual pull-to-refresh:

1. **Push**: drain `mutation_queue` in order, batch to `POST /sync/push`. Each
   mutation carries the client's last-known `version`. Server accepts if
   `version` matches current row version (increments it); on mismatch returns a
   `conflict` entry instead of erroring the whole batch.
2. **Pull**: `GET /sync/pull?since=<cursor>` returns all rows changed since the
   cursor (including soft-deleted rows, so local deletes propagate), applied to
   SQLite in a transaction; cursor advances only on success.
3. **Conflict resolution**: default is **last-write-wins by field-group** — since
   most conflicts here are on independent fields (e.g., title edited on phone A,
   `completed` toggled on phone B) — the loser's row is kept locally as a
   dismissible "updated elsewhere" notice rather than silently discarded, so no
   user data is lost without visibility.
4. **Retry**: failed pushes stay in the queue with exponential backoff
   (`syncStatus='error'`, retry count, next-attempt timestamp); surfaced in the
   sync-status indicator, not blocking further local writes.

**Sync status indicator**: a Zustand store (`useSyncStore`) driven by the sync
engine exposes `'synced' | 'syncing' | 'offline' | 'error'`, rendered as the
unobtrusive `✓ / ↻ / ⚠` indicator in the app header — never a blocking modal.

**Why not a generic CRDT library**: the data model here is simple per-resource
records (not collaborative rich text), so field-group LWW + explicit conflict
surfacing gives predictable behavior with far less complexity than a full CRDT,
while remaining swappable later if collaborative note-editing is ever added.

---

## 7. Navigation Structure (Expo Router)

```
app/
├── (auth)/                 # unauthenticated stack
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (tabs)/                 # authenticated, bottom tab navigator
│   ├── index.tsx           # Home dashboard
│   ├── tasks/
│   │   ├── index.tsx       # Today / Upcoming / Completed / All (segmented)
│   │   └── [id].tsx
│   ├── calendar/
│   │   ├── index.tsx       # day/week/month toggle
│   │   └── [id].tsx        # event detail
│   ├── expenses/
│   │   ├── index.tsx       # spending dashboard + charts
│   │   └── [id].tsx
│   └── more/
│       ├── index.tsx       # entry to notes, shopping, settings
│       ├── notes/{index,[id]}.tsx
│       ├── shopping/{index,[listId]}.tsx
│       └── settings/{index,profile,notifications,appearance,security}.tsx
├── create/                 # modal-presented creation flows
│   ├── task.tsx  event.tsx  note.tsx  expense.tsx  shopping-item.tsx
└── _layout.tsx              # root: auth gate, theme provider, query client
```

The floating action button (rendered in the `(tabs)` layout, not per-screen) opens a
quick-action sheet routing to `/create/*` modals. Auth gating happens in the root
layout by checking secure-storage session state before rendering `(tabs)` vs
`(auth)`.

---

## 8. Development Phases

Each phase ends with the app runnable (`npm run dev` boots mobile + api) and, from Phase
3 onward, testable end-to-end for the features built so far.

1. **Setup** — monorepo scaffold, `packages/config`, `packages/types`,
   `packages/validation` skeletons, Docker Compose (Postgres+Redis), NestJS app
   boots with health check, Expo app boots to a blank screen.
2. **Design system + navigation** — tokens, core components (Button, Card, TextInput,
   EmptyState, etc.), tab/stack navigation shell with placeholder screens.
3. **Authentication** — register/login/refresh/logout end-to-end, secure token
   storage, auth-gated navigation.
4. **Tasks** — full CRUD + subtasks + priorities + recurrence, local SQLite +
   API, no sync engine yet (online-first, straight API calls) to keep scope moving.
5. **Calendar + reminders** — event CRUD, day/week/month views, reminder model +
   local notification scheduling.
6. **Notes** — CRUD, pin/archive, checklist type, tags, search.
7. **Expenses** — CRUD, category summaries, charts.
8. **Shopping lists** — multi-list CRUD, reorderable items.
9. **Offline-first storage + sync** — retrofit the mutation-queue/sync-engine
   described above across all resources built in phases 4–8; this is the phase
   that turns "online CRUD" into "offline-first."
10. **Notifications** — permission flows, scheduling/cancellation/reschedule tied
    to task/event edits, background sync task.
11. **Testing** — fill in unit/component/API test coverage across what's built,
    Detox scaffold.
12. **CI/CD + observability** — GitHub Actions (PR/staging/production), logging
    and error-tracking abstractions wired but pointed at no-op/local providers.
13. **Performance & accessibility pass** — screen-reader labels, touch targets,
    contrast, list virtualization/perf profiling.

AI (`packages/ai`) is scaffolded (empty dirs, no deps) in Phase 1 and remains
untouched until all of the above ship.

---

## 9. Risks & Technical Trade-offs

- **Sync retrofit (Phase 9) is the highest-risk step.** Building features
  online-first in Phases 4–8 and adding the offline queue afterward avoids
  building sync machinery before there's anything to sync, but each resource's API
  client hooks will need to be swapped from direct REST calls to the SQLite-backed
  pattern — flagged explicitly so it isn't underestimated.
- **Field-group last-write-wins is simple but not perfect.** True concurrent edits
  to the _same field_ on two offline devices will pick one winner; the mitigation
  (surfacing a dismissible conflict notice) is UX-cheap but not a full merge —
  acceptable for a single-user personal app, worth revisiting if collaboration/
  sharing is ever added.
- **Expo managed workflow + background tasks.** iOS background fetch timing is
  OS-controlled and not guaranteed to run on a fixed schedule; local notification
  scheduling (not background sync) is the reliable mechanism for reminders — sync
  freshness on reopen/foreground is the fallback, which is why the sync engine also
  triggers on foreground/reconnect, not just background task.
- **Schema duplication (Postgres ⟷ SQLite).** Two schemas must stay in lockstep;
  mitigated by generating the SQLite schema/migrations from the same
  `packages/types`/`packages/validation` definitions rather than hand-maintaining
  both, but this is still a manual sync point on every model change.
- **Monorepo overhead vs. two separate repos.** Turborepo + npm workspaces adds
  initial setup cost, but is justified here specifically because `packages/types`
  and `packages/validation` need to be shared to keep mobile/API contracts from
  drifting — the stated top priority.
- **NestJS + Prisma is more scaffolding than a minimal Express API** would need,
  traded deliberately for the DI/guard/pipe structure that keeps auth, validation,
  and rate limiting consistent across 8 resource modules instead of duplicated
  per-route.
- **Large overall scope.** This is a multi-week build even at a senior engineering
  pace. The phase plan is designed so value ships incrementally and nothing beyond
  Phase 1 is a prerequisite for demoing later phases out of order if priorities
  shift — but the full checklist (20 requirement areas) will not be "done" after
  a single implementation session.

---

## Verification Approach (ongoing, not a one-time step)

- After each phase, `npm run dev` runs mobile (Expo) + api (NestJS) together via
  Docker Compose for Postgres/Redis; manual walkthrough of that phase's golden path
  in the Expo simulator.
- From Phase 3 onward: `npm test` runs unit/API tests in CI on every PR (lint →
  typecheck → test → build), per the CI/CD requirements.
- Offline behavior (Phase 9+) verified manually via simulator airplane mode:
  create/edit while offline → reconnect → confirm sync indicator transitions
  `⚠ offline → ↻ syncing → ✓ synced` and data appears server-side.
