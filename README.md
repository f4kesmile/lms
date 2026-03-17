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

OAuth/SSO (Google Workspace compatible):

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `MICROSOFT_OAUTH_CLIENT_ID`
- `MICROSOFT_OAUTH_CLIENT_SECRET`
- `MICROSOFT_OAUTH_TENANT_ID` (contoh: `common` atau tenant id organisasi)
- `NEXT_PUBLIC_APP_URL` (contoh: `http://localhost:3000`)
- `AUTH_EMAIL_MODE` (`restricted` untuk domain-only, `public` untuk bebas umum)
- `AUTH_ALLOWED_EMAIL_DOMAINS` (contoh: `kampus.ac.id,student.kampus.ac.id`)

Catatan mode domain:

- Jika `AUTH_EMAIL_MODE=restricted`, maka login/register (password + OAuth Google + OAuth Microsoft) wajib sesuai `AUTH_ALLOWED_EMAIL_DOMAINS`.
- Jika `AUTH_EMAIL_MODE=public`, maka pembatasan domain dimatikan untuk semua metode login/register.
- Dengan ini cukup ubah 1 variabel `AUTH_EMAIL_MODE` untuk aktif/nonaktifkan pembatasan domain global.

Akses log sistem:

- Buka panel admin di `/admin/logs` (khusus role `admin`).
- Halaman ini live refresh tiap 2 detik, bisa filter level log (INFO, WARNING, ERROR, EMERGENCY, DANGER).
- Untuk Vercel production, log in-memory hanya sementara per instance. Untuk audit permanen tetap disarankan pakai layanan log eksternal.

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
- `POST /api/auth/register`
- `GET /api/auth/oauth/google/start`
- `GET /api/auth/oauth/google/callback`
- `GET /api/auth/oauth/microsoft/start`
- `GET /api/auth/oauth/microsoft/callback`
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
