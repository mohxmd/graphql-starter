# 🌬️ Breeze

> A minimal **Bun + GraphQL Yoga + Drizzle ORM** starter with Zod, Biome, and a sprinkle of fun.

---

## ✨ Features

- ⚡️ [Bun](https://bun.sh) runtime for speed
- 📜 [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) – simple, modern GraphQL server
- 🗄️ [Drizzle ORM](https://orm.drizzle.team/) + SQLite for typed database access
- ✅ [Zod](https://zod.dev) for runtime schema validation
- 🧹 [Biome](https://biomejs.dev) for linting & formatting (auto on save!)
- 🎭 Custom error handling with `GraphQLException`
- 🏗️ Modular folder structure – `src/graphql/modules/*` keeps resolvers/types organized

---

## 📂 Project Structure

```bash
src/
├── db/            # Database (drizzle + migrations)
├── env.ts         # Zod-powered environment validation
├── graphql/       # GraphQL schema, resolvers, context
│   ├── modules/   # Modularized features (task, user, etc.)
│   └── schema.ts  # Yoga schema entrypoint
├── lib/           # Utilities & custom exceptions
└── index.ts       # Server entrypoint
```

---

## 🚀 Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run migrations
bun run db:migrate
```

INFO Server is running on:
👉 [http://localhost:3000/graphql](http://localhost:3000/graphql)

---

## 🛠️ Scripts

- `bun run dev` – Start server in dev mode
- `bun run format` – Format code with Biome
- `bun run lint` – Lint & fix with Biome
- `bun run db:migrate` – Run database migrations
- `bun run db:generate` – Generate Drizzle migration files
- `bun run db:push` – Push schema directly
- `bun run db:start-studio` – Open Drizzle Studio

---

## 🔐 Environment Variables

```bash
PORT=3000
NODE_ENV=development
DB_FILE_NAME=./breeze.sqlite
DEBUG=1
```

Validated with Zod in `src/env.ts`. Invalid configs will 🚫 exit early.

---

## ❗ Error Handling

Instead of raw `GraphQLError`, Breeze ships with a custom `GraphQLException`:

```ts
throw new GraphQLException("NOT_FOUND", {
  message: "Task not found",
});
```

This ensures consistent error responses with `extensions.code`.
Available codes: `BAD_USER_INPUT`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, `GRAPHQL_PARSE_FAILED`, `GRAPHQL_VALIDATION_FAILED`.

---

## 🧑‍💻 Contributing

PRs and issues are welcome! 🎉 Fork it, hack it, and send improvements.
