# 🌬️ Breeze GraphQL Starter (Enterprise SaaS Edition)

> An enterprise-grade **Bun + Hono + GraphQL Yoga + Drizzle ORM (PostgreSQL 17) + Redis** starter designed for high-performance SaaS backends.

---

## ✨ Features

- ⚡️ **[Bun Runtime](https://bun.sh)** – Instant startup and high throughput.
- 🌐 **[Hono HTTP Framework](https://hono.dev)** – Webhook routers (`/webhooks/stripe`), CORS, security headers, and health probes (`/health`).
- 📜 **[GraphQL Yoga 5](https://the-guild.dev/graphql/yoga-server)** – Fast, standards-compliant GraphQL engine with interactive Studio.
- 🐘 **[Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL 17** – End-to-end type safety with native UUIDs, timestamps, and relational queries.
- 🔴 **Redis L2 Caching & PubSub** – Multi-key DataLoader caching to eliminate N+1 database queries.
- 📦 **Feature Module Pattern** – Clean co-location of `types`, `resolvers`, `services`, and `loaders`.
- 🔐 **JWT Authentication & Guards** – Token verification via `jose` with `requireAuth()` and `requireRole()`.
- 🛡️ **`GraphQLException` v2** – Typed error handling mapped to standard HTTP status codes.
- 📊 **Dual-Mode Structured Logger** – Pretty colored terminal in development, single-line structured JSON in production.
- 🐳 **Docker Compose** – 1-command startup for PostgreSQL 17 and Redis 7.

---

## 📂 Architecture & Directory Structure

```text
src/
├── index.ts                       # Hono HTTP router + Yoga mount + Webhooks + Bun.serve
├── env.ts                         # Zod-validated environment variables
│
├── lib/
│   ├── auth/jwt.ts                # Fast JWT signing & verification (jose)
│   ├── error/exceptions.ts        # Typed GraphQLException with HTTP status mapping
│   ├── redis/index.ts             # Singleton Redis connection client
│   └── utils/logger.ts            # Dual-mode structured logger
│
├── db/
│   ├── index.ts                   # Drizzle PostgreSQL client (postgres-js)
│   ├── schema/                    # PostgreSQL table definitions & Drizzle-Zod schemas
│   ├── migrations/                # Generated SQL migration files
│   └── migrate.ts                 # Programmatic migration runner
│
└── graphql/
    ├── context.ts                 # GraphQL Context (db, user, requireAuth, loaders)
    ├── schema.ts                  # Root schema merger
    │
    └── modules/
        └── task/                  # 📦 Feature Module
            ├── task.types.ts      # GraphQL TypeDefs & Pagination inputs
            ├── task.services.ts   # Atomic 1-query business logic (.returning())
            ├── task.resolvers.ts  # Resolvers with unmasked error handling
            └── task.loader.ts     # Batched DataLoader with Redis L2 cache
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
bun install
```

### 2. Start PostgreSQL & Redis via Docker
```bash
bun run db:up
```

### 3. Run Database Migrations
```bash
bun run db:migrate
```

### 4. Start Development Server
```bash
bun run dev
```

- ⚡ **GraphQL Studio**: [http://localhost:3000/graphql](http://localhost:3000/graphql)
- 🌐 **API Status**: [http://localhost:3000/](http://localhost:3000/)
- 🩺 **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 🌿 Branches

- **`main`** *(Flagship)*: Full SaaS architecture with **PostgreSQL 17, Redis, Docker Compose, and Hono**.
- **`sqlite`**: Minimalist zero-Docker version running on **embedded SQLite**.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development server with hot-reloading |
| `bun run db:up` | Start PostgreSQL 17 and Redis Docker containers |
| `bun run db:down` | Stop Docker containers safely |
| `bun run db:logs` | View real-time database and redis logs |
| `bun run db:generate` | Generate new Drizzle SQL migration files |
| `bun run db:migrate` | Execute pending database migrations |
| `bun run db:studio` | Open interactive Drizzle Studio in browser |
| `bun run typecheck` | Run TypeScript compiler type check |
| `bun run format` | Format codebase with Biome |
| `bun run lint` | Check and fix lint issues with Biome |

---

## 🔐 Environment Variables (`.env`)

```bash
PORT=3000
NODE_ENV=development
DEBUG=1

# Database & Redis
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/breeze_db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=super-secret-key-change-in-production-min-32-chars-long
```

---

## 🛡️ Error Handling

Breeze uses `GraphQLException` mapped to standard HTTP status codes:

```ts
// In your services or resolvers:
throw GraphQLException.notFound("Task not found");
throw GraphQLException.unauthenticated("Authentication required");
throw GraphQLException.forbidden("Admin access only");
throw GraphQLException.badInput("Invalid task name");
```

---

## 📄 License

MIT © [Mohamed](https://github.com/mohxmd)
