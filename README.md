# 🌬️ Breeze (SQLite Edition)

> A minimal, zero-Docker **Bun + Hono + GraphQL Yoga + Drizzle ORM (SQLite)** starter with JWT auth, DataLoader, Zod, and Biome.

---

## ✨ Features

- ⚡️ **[Bun Runtime](https://bun.sh)** – Instant startup and high throughput.
- 🌐 **[Hono HTTP Framework](https://hono.dev)** – Webhook routers (`/webhooks/stripe`), CORS, and health checks (`/health`).
- 📜 **[GraphQL Yoga 5](https://the-guild.dev/graphql/yoga-server)** – Fast, standards-compliant GraphQL engine with interactive Studio.
- 🗄️ **[Drizzle ORM](https://orm.drizzle.team/) + SQLite** – Type-safe embedded database with zero external setup needed.
- 📦 **Feature Module Pattern** – Clean co-location of `types`, `resolvers`, `services`, and `loaders`.
- 🔐 **JWT Authentication & Guards** – Token verification via `jose` with `requireAuth()` and `requireRole()`.
- 🛡️ **`GraphQLException` v2** – Typed error handling mapped to standard HTTP status codes.
- 📊 **Dual-Mode Structured Logger** – Pretty colored terminal in development, structured JSON in production.

---

## 🌿 Branches

- **`main`**: Full SaaS architecture with **PostgreSQL 17, Redis, Docker Compose, and Hono**.
- **`sqlite`** *(Current)*: Minimalist zero-Docker version running on **embedded SQLite**.

---

## 📂 Architecture & Directory Structure

```text
src/
├── index.ts                       # Hono HTTP router + Yoga mount + Bun.serve
├── env.ts                         # Zod-validated environment variables
│
├── lib/
│   ├── auth/jwt.ts                # Fast JWT signing & verification (jose)
│   ├── error/exceptions.ts        # Typed GraphQLException with HTTP status mapping
│   └── utils/logger.ts            # Dual-mode structured logger
│
├── db/
│   ├── index.ts                   # Drizzle SQLite client
│   ├── schema/                    # SQLite table definitions & Zod schemas
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
            └── task.loader.ts     # Batched DataLoader (N+1 protection)
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
bun install
```

### 2. Run Migrations
```bash
bun run db:migrate
```

### 3. Start Development Server
```bash
bun run dev
```

- ⚡ **GraphQL Studio**: [http://localhost:3000/graphql](http://localhost:3000/graphql)
- 🌐 **API Status**: [http://localhost:3000/](http://localhost:3000/)
- 🩺 **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development server with hot-reloading |
| `bun run db:migrate` | Execute pending database migrations |
| `bun run db:generate` | Generate new Drizzle SQL migration files |
| `bun run db:push` | Push schema changes directly to SQLite |
| `bun run db:start-studio` | Open interactive Drizzle Studio in browser |
| `bun run format` | Format codebase with Biome |
| `bun run lint` | Check and fix lint issues with Biome |

---

## 🔐 Environment Variables (`.env`)

```bash
PORT=3000
NODE_ENV=development
DB_FILE_NAME=breeze.sqlite
DEBUG=1
JWT_SECRET=super-secret-key-change-in-production-min-32-chars-long
```

---

## 📄 License

MIT © [Mohamed](https://github.com/mohxmd)
