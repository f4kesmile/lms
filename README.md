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

- Jika `AUTH_EMAIL_MODE=restricted`, maka login/register (password + OAuth Google + SSO Microsoft) wajib sesuai `AUTH_ALLOWED_EMAIL_DOMAINS`.
- Jika `AUTH_EMAIL_MODE=public`, maka pembatasan domain dimatikan untuk semua metode login/register.
- Dengan ini cukup ubah 1 variabel `AUTH_EMAIL_MODE` untuk aktif/nonaktifkan pembatasan domain global.

Akses log sistem:

- Buka panel admin di `/admin/logs` (khusus role `admin`).
- Halaman ini live refresh tiap 2 detik, bisa filter level log (INFO, WARNING, ERROR, EMERGENCY, DANGER).
- Log sekarang disimpan ke database dan auto-prune berdasarkan:
  - `LOG_MAX_RECORDS` (default: 10000)
  - `LOG_RETENTION_DAYS` (default: 30)
- Opsi debug latensi OAuth untuk production hardening:
  - `AUTH_OAUTH_DEBUG_TIMING` (default: `false`) -> jika `true`, log INFO OAuth menyertakan detail timing per tahap.
  - `AUTH_OAUTH_LATENCY_WARN_MS` (default: `2500`) -> ambang waktu total OAuth untuk memicu log WARNING latency tinggi.
- Untuk Vercel production, ini lebih stabil dibanding in-memory karena data log tidak hilang saat instance berganti.

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

## 5) Setup SSO — Google & Microsoft OAuth

SSO diimplementasikan dengan OAuth 2.0 Authorization Code Flow secara manual (tanpa NextAuth).
Dua provider tersedia: **Google Workspace** dan **Microsoft (Azure Entra ID / Microsoft 365)**.

---

### A. Google OAuth (Google Cloud Console)

#### Langkah 1 — Buat proyek di Google Cloud Console

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com)
2. Klik dropdown proyek di kiri atas → **New Project**.
3. Beri nama (contoh: `Edunexus`) → **Create**.

#### Langkah 2 — Aktifkan OAuth consent screen

1. Di menu kiri, buka **APIs & Services → OAuth consent screen**.
2. Pilih **Internal** (hanya akun di organisasi Google Workspace Anda) atau **External** (semua akun Google).
   - Untuk institusi pendidikan yang punya Google Workspace, gunakan **Internal** supaya lebih aman.
3. Isi **App name**, **User support email**, dan **Developer contact information**.
4. Pada **Scopes**, tambahkan: `email`, `profile`, `openid` (sudah ada secara default).
5. Simpan dan lanjutkan.

#### Langkah 3 — Buat OAuth 2.0 Client ID

1. Di menu kiri, buka **APIs & Services → Credentials**.
2. Klik **+ Create Credentials → OAuth client ID**.
3. Pilih **Application type: Web application**.
4. Beri nama (contoh: `Edunexus Web`).
5. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://domain-produksi-anda.com` (production)
6. Tambahkan **Authorized redirect URIs** berikut ini:

   **Development:**

   ```
   http://localhost:3000/api/auth/oauth/google/callback
   ```

   **Production:**

   ```
   https://domain-produksi-anda.com/api/auth/oauth/google/callback
   ```

   > Tambahkan keduanya sekaligus agar dev dan production sama-sama berjalan.

7. Klik **Create**.
8. Salin **Client ID** dan **Client Secret** yang muncul.

#### Langkah 4 — Isi .env

```env
GOOGLE_OAUTH_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
```

---

### B. Microsoft OAuth (Azure Entra ID / Microsoft 365)

#### Langkah 1 — Buat App Registration

1. Buka [https://entra.microsoft.com](https://entra.microsoft.com) (atau [https://portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID**).
2. Di menu kiri, buka **App registrations → + New registration**.
3. Isi **Name** (contoh: `Edunexus`).
4. Pilih **Supported account types** sesuai kebutuhan:

   | Pilihan                                           | `MICROSOFT_OAUTH_TENANT_ID`      |
   | ------------------------------------------------- | -------------------------------- |
   | Hanya akun di direktori organisasi ini saja       | ID tenant organisasi Anda (GUID) |
   | Akun di semua direktori organisasi (multi-tenant) | `organizations`                  |
   | Akun organisasi + akun Microsoft pribadi          | `common`                         |

5. Pada **Redirect URI**, pilih platform **Web**, lalu masukkan:

   **Development:**

   ```
   http://localhost:3000/api/auth/oauth/microsoft/callback
   ```

   **Production:**

   ```
   https://domain-produksi-anda.com/api/auth/oauth/microsoft/callback
   ```

   > Tambahkan keduanya sekaligus. Redirect URI tambahan juga bisa ditambah nanti di **Authentication → Add a platform → Web**.

6. Klik **Register**.

#### Langkah 2 — Salin Client ID dan Tenant ID

Setelah registrasi, di halaman **Overview**:

- **Application (client) ID** → `MICROSOFT_OAUTH_CLIENT_ID`
- **Directory (tenant) ID** → `MICROSOFT_OAUTH_TENANT_ID` (jika memilih organisasi saja di langkah 4)

#### Langkah 3 — Buat Client Secret

1. Di menu kiri aplikasi, buka **Certificates & secrets**.
2. Klik **+ New client secret**.
3. Beri deskripsi dan pilih masa berlaku.
4. Salin nilai **Value** (hanya tampil sekali). → `MICROSOFT_OAUTH_CLIENT_SECRET`

> **Penting:** Simpan secret segera karena tidak bisa dilihat ulang setelah halaman ditutup.

#### Langkah 4 — Verifikasi API Permissions

1. Di menu kiri, buka **API permissions**.
2. Pastikan izin berikut sudah ada (defaultnya sudah ada):
   - `Microsoft Graph → User.Read` (Delegated)
   - `openid`, `profile`, `email` (OpenID Connect)
3. Klik **Grant admin consent for [organisasi]** jika diminta.

#### Langkah 5 — Isi .env

```env
MICROSOFT_OAUTH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MICROSOFT_OAUTH_TENANT_ID=common
```

---

### C. Konfigurasi Domain Restriction

Kontrol siapa yang boleh login menggunakan satu variabel `AUTH_EMAIL_MODE`:

```env
# Hanya email dari domain tertentu yang boleh masuk
AUTH_EMAIL_MODE=restricted
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id,student.kampus.ac.id

# Semua email boleh masuk (matikan pembatasan domain)
AUTH_EMAIL_MODE=public
```

Pembatasan berlaku untuk **semua metode login**: password, Google OAuth, dan Microsoft OAuth.

---

### D. Generate JWT Secret yang Aman

Gunakan script bawaan untuk membuat JWT secret baru:

```bash
node scripts/generate-jwt-secret.js
# Output: JWT_SECRET=xxxxxxxx... (512-bit)
```

Salin nilai tersebut ke `.env`:

```env
JWT_SECRET=nilai-yang-di-generate
```

---

### E. Ringkasan variabel SSO di .env

```env
NEXT_PUBLIC_APP_URL=https://domain-produksi-anda.com

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# Microsoft OAuth
MICROSOFT_OAUTH_CLIENT_ID=
MICROSOFT_OAUTH_CLIENT_SECRET=
MICROSOFT_OAUTH_TENANT_ID=common

# Domain restriction
AUTH_EMAIL_MODE=restricted
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id

# JWT
JWT_SECRET=
```

---

### F. Checklist sebelum production

- [ ] `NEXT_PUBLIC_APP_URL` sudah diisi domain production (bukan `localhost`)
- [ ] Redirect URI production sudah ditambahkan di Google Cloud Console
- [ ] Redirect URI production sudah ditambahkan di Azure App Registration
- [ ] `GOOGLE_OAUTH_CLIENT_SECRET` dan `MICROSOFT_OAUTH_CLIENT_SECRET` sudah diisi
- [ ] `JWT_SECRET` sudah di-generate ulang untuk production (jangan pakai nilai dev)
- [ ] `AUTH_EMAIL_MODE` dan `AUTH_ALLOWED_EMAIL_DOMAINS` sudah sesuai kebijakan institusi

---

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
