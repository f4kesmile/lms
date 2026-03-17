# Nusa Belajar Next.js 16 Migration Base

This folder is the migration target from the old Express + MongoDB stack to:

- Next.js 16
- Prisma ORM v7
- CockroachDB

## 1) Install dependencies

```bash
cd next-app
npm install
```

## 2) Configure environment variables

Copy `.env.example` to `.env` and fill the values.

Required:

- `DATABASE_URL`
- `JWT_SECRET`

## 3) Generate Prisma client and run migration

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## 4) Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Prisma v7 note

`DATABASE_URL` is configured in `prisma.config.ts`, not in `prisma/schema.prisma`.

## Seed first admin (manual quick way)

Use Cockroach SQL client or Prisma Studio after migration, then insert one `User` with:

- role: `admin`
- password: bcrypt hash

## Migrated endpoints (initial)

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/academic-years`
- `POST /api/academic-years`
- `GET /api/academic-years/current`
- `PATCH /api/academic-years/:id`
- `DELETE /api/academic-years/:id`
- `GET /api/classes`
- `POST /api/classes`
- `PATCH /api/classes/:id`
- `DELETE /api/classes/:id`
- `GET /api/subjects`
- `POST /api/subjects`
- `PATCH /api/subjects/:id`
- `DELETE /api/subjects/:id`

## RAG Chatbot endpoints

- `GET /api/kb/materials`
- `POST /api/kb/materials`
- `DELETE /api/kb/materials/:id`
- `POST /api/chat/ask`
- `GET /api/chat/sessions/:id`
- `POST /api/chat/turns/:id/rating`
- `GET /api/chat/stats`

## UI pages for required screenshots

- `GET /chatbot` for chatbot window, answer + references, chat history, and rating
- `GET /admin/knowledge` for admin knowledge base dashboard
- `GET /admin/stats` for chatbot usage statistics

## RAG test minimum

- Prepare at least 1-3 materials in `/admin/knowledge`
- Ask 10 questions in `/chatbot`
- Ensure at least 7 answers show references in the answer card
- Verify response time metric in `/admin/stats`

## Current user roles

- `admin`
- `dosen`
- `mahasiswa`

## Vercel deployment

1. Import repository to Vercel.
2. Set root directory to `next-app`.
3. Add env vars in Vercel project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GOOGLE_GENERATIVE_AI_API_KEY` (optional)
4. Deploy.
