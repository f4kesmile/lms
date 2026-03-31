# 🎓 Nusa Belajar - Learning Management System

Learning Management System (LMS) berbasis Web dengan AI-powered chatbot, built dengan Next.js 16 dan Prisma ORM.

> **Migrasi dari:** Express + MongoDB stack  
> **Target:** Next.js 16, Prisma ORM v7, CockroachDB

---

## 📚 Dokumentasi Lengkap

Dokumentasi project tersedia dalam **6 Phase** terstruktur di folder `/docs`:

| Phase       | Deskripsi                                                | Link                                                      |
| ----------- | -------------------------------------------------------- | --------------------------------------------------------- |
| **Phase 1** | Setup awal, instalasi, konfigurasi database & OAuth      | [PHASE-1-SETUP.md](docs/PHASE-1-SETUP.md)                 |
| **Phase 2** | Arsitektur, database schema, auth flow, folder structure | [PHASE-2-ARCHITECTURE.md](docs/PHASE-2-ARCHITECTURE.md)   |
| **Phase 3** | API Reference lengkap dengan semua endpoints             | [PHASE-3-API-REFERENCE.md](docs/PHASE-3-API-REFERENCE.md) |
| **Phase 4** | Fitur-fitur utama (auth, courses, chat, admin panel)     | [PHASE-4-FEATURES.md](docs/PHASE-4-FEATURES.md)           |
| **Phase 5** | Development guide, workflow, menambah fitur baru         | [PHASE-5-DEVELOPMENT.md](docs/PHASE-5-DEVELOPMENT.md)     |
| **Phase 6** | Troubleshooting, environment variables, security         | [PHASE-6-REFERENCE.md](docs/PHASE-6-REFERENCE.md)         |

**👉 [Mulai dari sini →](docs/DOKUMENTASI_RINGKASAN.md)** untuk overview lengkap dan panduan navigasi dokumentasi.

---

## 🚀 Quick Start

### Prerequisites

Pastikan sudah install:

- **Node.js** >= 18.x (gunakan `node -v` untuk cek)
- **npm** >= 9.x atau **yarn**
- **Git**
- **Database**: PostgreSQL 12+ atau CockroachDB cloud account
- (Optional) **Google Cloud Account** untuk OAuth
- (Optional) **Microsoft Azure Account** untuk Microsoft OAuth

### 1. Clone & Install dependencies

```bash
git clone https://github.com/your-org/nusa-belajar.git
cd next-app
npm install
```

### 2. Setup Database

**Option A: PostgreSQL lokal**

```bash
# Install PostgreSQL jika belum ada (macOS)
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb nusa_belajar_dev
```

**Option B: CockroachDB Cloud (recommended untuk production)**

1. Buat cluster di [cockroachlabs.com](https://cockroachlabs.com)
2. Copy connection string dari dashboard

**Option C: Render.com PostgreSQL (free tier)**

1. Login ke [render.com](https://render.com)
2. Create PostgreSQL database
3. Copy `DATABASE_URL`

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` dengan values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nusa_belajar_dev

# JWT Secret (generate dengan: node scripts/generate-jwt-secret.js)
JWT_SECRET=your-512-bit-secret-here

# Google OAuth (dari Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxx

# Microsoft OAuth (dari Azure Entra ID)
MICROSOFT_OAUTH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_OAUTH_CLIENT_SECRET=xxx
MICROSOFT_OAUTH_TENANT_ID=common

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email restriction (optional)
AUTH_EMAIL_MODE=public
# AUTH_ALLOWED_EMAIL_DOMAINS=domain.ac.id
```

**Lihat [Phase 1: Environment Configuration](docs/PHASE-1-SETUP.md#4-environment-configuration) untuk full reference semua variabel.**

### 4. Generate Prisma client & run migrations

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### 5. (Optional) Seed database dengan data dummy

```bash
npx prisma db seed
```

### 6. Run development server

```bash
npm run dev
```

Server jalan di `http://localhost:3000`. Buka di browser & login dengan akun yang sudah di-seed atau daftarkan akun baru.

---

## 🔑 OAuth Setup Cepat

### Google Workspace OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Create Project → Aktifkan "Google+ API"
3. Create OAuth 2.0 Client ID (Web application)
4. **Authorized origins:** `http://localhost:3000`
5. **Authorized redirect URIs:** `http://localhost:3000/api/auth/oauth/google/callback`
6. Copy Client ID & Secret ke `.env`

**Detail lengkap:** [Phase 1: Google OAuth Setup](docs/PHASE-1-SETUP.md#6-oauth--sso-setup)

### Microsoft 365 OAuth

1. Buka [Azure Entra ID](https://entra.microsoft.com)
2. App registrations → New registration
3. Nama: "Nusa Belajar"
4. Redirect URI (Web): `http://localhost:3000/api/auth/oauth/microsoft/callback`
5. Buat Client Secret di **Certificates & secrets**
6. Copy Client ID, Secret, Tenant ID ke `.env`

**Detail lengkap:** [Phase 1: Microsoft OAuth Setup](docs/PHASE-1-SETUP.md#6-oauth--sso-setup)

---

## 📋 Tech Stack

| Component          | Technology               | Version |
| ------------------ | ------------------------ | ------- |
| **Framework**      | Next.js                  | 16.0.0  |
| **ORM**            | Prisma                   | 7.0.0   |
| **Database**       | CockroachDB / PostgreSQL | Latest  |
| **UI Framework**   | React + Tailwind CSS     | Latest  |
| **Authentication** | JWT + OAuth 2.0          | -       |
| **Editor**         | TipTap (Rich Text)       | 3.21.0  |
| **Chat**           | Real-time + AI           | -       |

---

## ✨ Key Features

- ✅ **Authentication:** Email + Password, Google Workspace OAuth, Microsoft SSO
- ✅ **Courses:** Course catalog, enrollment, materials management
- ✅ **Teaching Schedule:** Dosen schedule management dengan integration
- ✅ **Chat System:** User-to-user + AI-powered academic chatbot
- ✅ **Knowledge Base:** FAQ, document search, RAG (Retrieval Augmented Generation)
- ✅ **Admin Panel:** User management, system logs, academic year management
- ✅ **RBAC:** Admin, Dosen (Teacher), Mahasiswa (Student) roles

---

## 🏗️ Architecture

Nusa Belajar menggunakan:

- Modern Next.js 16 dengan App Router
- Server Components + Server Actions untuk secure API calls
- Prisma ORM dengan type-safe queries
- JWT + HttpOnly cookies untuk authentication
- Role-based access control (RBAC)
- RAG pattern untuk AI integration

See [Phase 2: Architecture](docs/PHASE-2-ARCHITECTURE.md) for detailed architecture documentation.

---

## 📝 Development Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Run production build
npm run lint                   # Check code style
npm run lint -- --fix         # Auto-fix linting

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Create & apply migration
npx prisma studio            # Open database GUI
npx prisma db seed           # Populate with seed data
```

See [Phase 5: Development Guide](docs/PHASE-5-DEVELOPMENT.md) for complete command reference.

---

## 🐛 Troubleshooting

Common issues and solutions are documented in [Phase 6: Troubleshooting](docs/PHASE-6-REFERENCE.md#1-troubleshooting-guide).

---

## 📚 Full Documentation Path

If you're reading this on GitHub and want complete documentation:

1. **Start Here:** [docs/DOKUMENTASI_RINGKASAN.md](docs/DOKUMENTASI_RINGKASAN.md) - Overview of all phases
2. **Setup:** [docs/PHASE-1-SETUP.md](docs/PHASE-1-SETUP.md) - Initial setup guide
3. **Architecture:** [docs/PHASE-2-ARCHITECTURE.md](docs/PHASE-2-ARCHITECTURE.md) - System design
4. **API Reference:** [docs/PHASE-3-API-REFERENCE.md](docs/PHASE-3-API-REFERENCE.md) - All endpoints
5. **Features:** [docs/PHASE-4-FEATURES.md](docs/PHASE-4-FEATURES.md) - Feature details
6. **Development:** [docs/PHASE-5-DEVELOPMENT.md](docs/PHASE-5-DEVELOPMENT.md) - Development workflow
7. **Reference:** [docs/PHASE-6-REFERENCE.md](docs/PHASE-6-REFERENCE.md) - Troubleshooting & reference

---

## 🎯 Quick Links

- **API Docs:** [Phase 3 - All Endpoints](docs/PHASE-3-API-REFERENCE.md)
- **Feature Status:** [Phase 4 - Features Summary](docs/PHASE-4-FEATURES.md#7-key-features-summary)
- **Environment Variables:** [Phase 6 - Env Reference](docs/PHASE-6-REFERENCE.md#2-environment-variables-reference)
- **Common Issues:** [Phase 6 - Troubleshooting](docs/PHASE-6-REFERENCE.md#1-troubleshooting-guide)

---

## 📊 Database Schema (Quick Overview)

Nusa Belajar menggunakan **13 core models** (lihat [Phase 2: Full Schema](docs/PHASE-2-ARCHITECTURE.md#2-database-schema) untuk details):

**Core Models:**

- `User` — Admin, Dosen, Mahasiswa dengan role-based access
- `Course` — Kursus yang bisa di-enroll
- `Subject` — Mata pelajaran (misal: "Algoritma", "Basis Data")
- `Class` — Kelas (misal: "3A", "3B")
- `ClassSubject` — Join table untuk subject per class
- `SubjectMeeting` — Jadwal pertemuan setiap minggu
- `CourseMaterial` — Material pembelajaran (bisa dengan attachment file)
- `ChatSession`, `ChatTurn` — User-to-user & AI chatbot messages
- `ChatbotSetting` — Configurasi knowledge base & RAG untuk AI
- `AcademicYear` — Tahun ajaran (2024/2025, etc)

**Relasi Utama:**

```
User 1--(many)--> Course (enrollment)
User 1--(many)--> ChatSession
Subject 1--(many)--> SubjectMeeting
Class 1--(many)--> ClassSubject 1--(many)--> Subject
CourseMaterial 1--(many)--> Chunked embeddings (untuk RAG)
```

---

## 🔐 Authentication & Authorization

**Auth Flows:**

1. **Email + Password** — Login manual dengan bcrypt hash
2. **Google OAuth** — SSO via Google Workspace domain
3. **Microsoft OAuth** — SSO via Microsoft 365 / Azure Entra ID

**JWT Structure:**

```
Header: HS512 algorithm
Payload: userId, role, issuedAt, expiresAt
Storage: HttpOnly cookie (secure by default)
```

**RBAC (Role-Based Access Control) — 3 roles:**
| Role | Permissions |
| ---------- | ----------------------------------------- |
| `admin` | Full system access, user management |
| `dosen` | Create courses, manage materials, chat |
| `mahasiswa`| Enroll courses, view materials, chat |

Proteksi endpoint menggunakan middleware di [lib/auth](lib/auth/) — lihat [Phase 4: Feature Details](docs/PHASE-4-FEATURES.md#1-authentication--authorization) untuk flow lengkap.

---

## 📂 Project Structure

```
next-app/
├── app/                          # Next.js App Router (routes + pages)
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (admin)/                  # Admin pages (dashboard, users, logs)
│   ├── (public)/                 # Public pages (courses, about, materials)
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── courses/              # Course CRUD
│   │   ├── chat/                 # Chat & chatbot
│   │   ├── admin/                # Admin endpoints
│   │   └── ...
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── features/                 # Feature-specific components
│   ├── layout/                   # Layout components (Navbar, Footer, etc)
│   ├── shared/                   # Reusable UI components
│   └── ui/                       # Shadcn/Radix UI primitives
│
├── lib/                          # Utilities & core logic
│   ├── auth/                     # Auth helpers (JWT, OAuth)
│   ├── actions/                  # Server Actions (courses, users, etc)
│   ├── ai/                       # RAG, chunking, chatbot logic
│   ├── services/                 # Business logic
│   ├── core/                     # Database, HTTP, logging
│   └── utils/                    # String, date, image helpers
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seeding script
│
└── docs/                         # Full documentation (6 phases)
```

---

## 💡 Key Concepts

### RAG (Retrieval Augmented Generation)

AI chatbot yang "belajar" dari knowledge base Anda. Alur:

1. Admin upload materials ke `/admin/knowledge`
2. Materials di-chunk & disimpan dengan embeddings
3. User tanya pertanyaan di `/chatbot`
4. Sistem cari embedding paling relevan → pass ke AI model
5. AI jawab dengan "references" dari materials

Lihat [Phase 4: Knowledge Base & Chatbot](docs/PHASE-4-FEATURES.md#5-knowledge-base--faq) untuk implementasi.

### Server Actions vs API Routes

Kedua-duanya untuk backend logic, tapi gunakan kapan:

- **Server Actions** — Untuk form submission, data mutation dari client component
- **API Routes** — Untuk REST endpoints, 3rd-party webhooks, non-form requests

Lihat [Phase 5: Development Guide](docs/PHASE-5-DEVELOPMENT.md#adding-a-new-feature-step-by-step) untuk contoh.

---

## 🤝 Contributing

### Adding a New Feature (High-Level)

1. **Database Model** → Update `prisma/schema.prisma` → Run `npm run prisma:migrate`
2. **Server Actions** → Create in `lib/actions/feature-name.ts`
3. **API Route** (opsional) → Create in `app/api/feature/route.ts`
4. **Component/Page** → Create in `components/` atau `app/(group)/page/`
5. **Test** → Manual testing di dev server
6. **Document** → Update relevant Phase docs

**Untuk detail lengkap**: [Phase 5: Step-by-Step Feature Addition](docs/PHASE-5-DEVELOPMENT.md#adding-a-new-feature-step-by-step)

### Code Conventions

- **Language:** TypeScript (type-safe required)
- **UI Components:** Shadcn/Radix UI + Tailwind CSS
- **Styling:** Utility-first Tailwind (no hardcoded colors)
- **Database Queries:** Prisma ORM (typed queries)
- **File naming:** kebab-case untuk files, PascalCase untuk components

See [Phase 5: Code Style & Organization](docs/PHASE-5-DEVELOPMENT.md#code-organization-best-practices) untuk conventions lengkap.

---

## 🧪 Testing & Validation

### Manual Testing Checklist

**Authentication:**

```
□ Login dengan Email + Password
□ Logout & verify session cleared
□ Login dengan Google OAuth
□ Login dengan Microsoft OAuth
□ Domain restriction working (jika enabled)
```

**Courses & Materials:**

```
□ Admin bisa create course
□ Student bisa enroll course
□ Student bisa view course materials
□ Dosen bisa upload materials (dengan file)
□ Materials bisa di-delete
```

**Chat System:**

```
□ User-to-user chat working
□ AI chatbot dapat menjawab pertanyaan
□ Answers show references (dari knowledge base)
□ Chat history tersimpan & terload
```

**Admin Panel:**

```
□ Admin bisa lihat system logs
□ Admin bisa manage users (create, edit, delete)
□ Admin bisa manage academic years
□ Admin bisa upload knowledge base materials
```

**Database:**

```bash
# Buka Prisma Studio GUI
npx prisma studio

# Check data langsung di database
```

---

## 📱 Common Development Workflows

### 1. Menambah field baru ke User model

```bash
# 1. Edit prisma/schema.prisma
# Tambah field di model User

# 2. Create migration
npm run prisma:migrate -- --name add_field_to_user

# 3. Generate Prisma client
npm run prisma:generate

# 4. Restart dev server
npm run dev
```

### 2. Create API route baru

```bash
# Create file: app/api/feature/route.ts
touch app/api/feature/route.ts

# Example GET endpoint:
```

**File:** `app/api/feature/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

### 3. Create Server Action baru

**File:** `lib/actions/feature.ts`

```typescript
"use server";

import { db } from "@/lib/core/db";
import { revalidatePath } from "next/cache";

export async function createThing(data: { name: string }) {
  try {
    const result = await db.thing.create({ data });
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

**Gunakan di component:**

```tsx
"use client";
import { createThing } from "@/lib/actions/feature";

export default function Form() {
  async function handleSubmit(formData: FormData) {
    const result = await createThing({
      name: formData.get("name"),
    });
    if (result.success) {
      // Success logic
    }
  }

  return <form action={handleSubmit}>...</form>;
}
```

---

## ⚡ Performance Tips

### Database Optimization

```sql
-- Indexes sudah ada di schema untuk main queries
-- Pastikan migration di-apply dengan: npm run prisma:migrate

-- Common slow queries & solutions:
-- 1. Fetching user dengan courses
--    Solution: Use Prisma include() untuk eager loading

-- 2. Full-text search di materials
--    Solution: Use @db.Text untuk searchable fields

-- 3. Chat history pagination
--    Solution: Use cursor-based pagination
```

### Frontend Optimization

```typescript
// 1. Use Next.js Image component (not <img>)
import Image from 'next/image'

// 2. Lazy load components
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <div>Loading...</div>
})

// 3. Use React.memo untuk prevent re-renders
export const MyComponent = React.memo(function Component() {
  // ...
})

// 4. Suspense untuk data fetching
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataComponent />
    </Suspense>
  )
}
```

### API Route Optimization

```typescript
// Add caching headers untuk static content
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: [] });
  response.headers.set("Cache-Control", "max-age=3600");
  return response;
}

// Add rate limiting untuk sensitive endpoints
import { limiter } from "@/lib/core/limiter";

export async function POST(request: NextRequest) {
  const limited = await limiter.limit(request);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ...
}
```

---

## 🚀 Deployment Guide

### Prerequisites untuk Production

- [ ] `.env` production values di Vercel/hosting
- [ ] `DATABASE_URL` pointing ke production database
- [ ] `JWT_SECRET` di-generate ulang (jangan pakai dev secret)
- [ ] OAuth redirect URIs updated di Google Cloud & Azure
- [ ] `NEXT_PUBLIC_APP_URL` = production domain

### Deploy ke Vercel (Recommended)

```bash
# 1. Push code ke GitHub
git push origin main

# 2. Connect repository ke Vercel
# Visit: https://vercel.com/new

# 3. Configure environment variables
# NEXT_PUBLIC_APP_URL
# DATABASE_URL
# JWT_SECRET
# GOOGLE_OAUTH_CLIENT_ID
# GOOGLE_OAUTH_CLIENT_SECRET
# MICROSOFT_OAUTH_CLIENT_ID
# MICROSOFT_OAUTH_CLIENT_SECRET
# MICROSOFT_OAUTH_TENANT_ID

# 4. Set root directory to: next-app

# 5. Deploy!
```

### Post-Deployment

```bash
# Run migrations di production
vercel env pull
npm run prisma:migrate -- --skip-generate

# Check logs
vercel logs

# Monitor performance
# Visit Vercel dashboard → Insights
```

**For detailed deployment guide**: [Phase 1: Production Setup](docs/PHASE-1-SETUP.md#vercel-deployment)

---

## Detailed Setup — Google & Microsoft OAuth

For detailed step-by-step OAuth setup, please refer to [Phase 1: OAuth Setup](docs/PHASE-1-SETUP.md#6-oauth--sso-setup).

Below is a quick reference:

### A. Google OAuth (Google Cloud Console)

#### Langkah 1 — Buat proyek di Google Cloud Console

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com)
2. Klik dropdown proyek di kiri atas → **New Project**.
3. Beri nama (contoh: `Nusa Belajar`) → **Create**.

#### Langkah 2 — Aktifkan OAuth consent screen

1. Di menu kiri, buka **APIs & Services → OAuth consent screen**.
2. Pilih **Internal** atau **External**
3. Isi form dengan app details
4. Pada **Scopes**, tambahkan: `email`, `profile`, `openid`
5. Simpan dan lanjutkan.

#### Langkah 3 — Buat OAuth 2.0 Client ID

1. Di menu kiri, buka **APIs & Services → Credentials**.
2. Klik **+ Create Credentials → OAuth client ID**.
3. Pilih **Application type: Web application**.
4. Beri nama (contoh: `Nusa Belajar Web`).
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

1. Buka [https://entra.microsoft.com](https://entra.microsoft.com)
2. Di menu kiri, buka **App registrations → + New registration**.
3. Isi **Name** (contoh: `Nusa Belajar`).
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

> **For complete setup documentation, see [Phase 1: Setup Guide](docs/PHASE-1-SETUP.md)**

---

## 📖 Additional Information

### Prisma v7 note

`DATABASE_URL` is configured in `prisma.config.ts`, not in `prisma/schema.prisma`.

### Seed first admin (manual quick way)

Use Prisma Studio after migration to insert one `User` with:

- role: `admin`
- password: bcrypt hash

### For Additional Help

- 📚 **Complete Documentation:** See [Full Documentation Path](#-full-documentation-path) section above
- 🐛 **Troubleshooting:** [Phase 6: Troubleshooting Guide](docs/PHASE-6-REFERENCE.md#1-troubleshooting-guide)
- 📝 **API Reference:** [Phase 3: API Documentation](docs/PHASE-3-API-REFERENCE.md)
- 💻 **Development Guide:** [Phase 5: Development Workflow](docs/PHASE-5-DEVELOPMENT.md)

---

## 🔌 API Endpoints (Detailed Reference)

**Full documentation dengan 50+ endpoints**: [Phase 3: API Reference](docs/PHASE-3-API-REFERENCE.md)

### 1. Authentication Endpoints

| Method | Endpoint                             | Deskripsi                       | Status   |
| ------ | ------------------------------------ | ------------------------------- | -------- |
| POST   | `/api/auth/register`                 | Register user baru              | 201, 400 |
| POST   | `/api/auth/login`                    | Login dengan email+password     | 200, 401 |
| POST   | `/api/auth/logout`                   | Logout & clear session          | 200      |
| GET    | `/api/auth/oauth/google/start`       | Redirect ke Google login        | 302      |
| GET    | `/api/auth/oauth/google/callback`    | Handle Google OAuth callback    | 302, 401 |
| GET    | `/api/auth/oauth/microsoft/start`    | Redirect ke Microsoft login     | 302      |
| GET    | `/api/auth/oauth/microsoft/callback` | Handle Microsoft OAuth callback | 302, 401 |

**Example: Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"hashedpassword"}'

# Response 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "mahasiswa"
  },
  "token": "jwt-token"
}
```

---

### 2. Users Endpoints

| Method | Endpoint         | Deskripsi                   | Auth        |
| ------ | ---------------- | --------------------------- | ----------- |
| GET    | `/api/users/me`  | Get current user profile    | ✅ Required |
| GET    | `/api/users`     | List all users (admin only) | ✅ Admin    |
| POST   | `/api/users`     | Create new user (admin)     | ✅ Admin    |
| PATCH  | `/api/users/:id` | Update user (admin or self) | ✅ Required |
| DELETE | `/api/users/:id` | Delete user (admin only)    | ✅ Admin    |

**Example: Get Current User**

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer jwt-token"

# Response 200 OK
{
  "id": "uuid",
  "email": "mahasiswa@campus.ac.id",
  "name": "Ahmad Yusuf",
  "role": "mahasiswa",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 3. Courses Endpoints

| Method | Endpoint                    | Deskripsi              | Auth        |
| ------ | --------------------------- | ---------------------- | ----------- |
| GET    | `/api/courses`              | List all courses       | ✅ Required |
| GET    | `/api/courses/:id`          | Get course details     | ✅ Required |
| POST   | `/api/courses`              | Create course (dosen+) | ✅ Dosen    |
| PATCH  | `/api/courses/:id`          | Update course (dosen+) | ✅ Dosen    |
| DELETE | `/api/courses/:id`          | Delete course (dosen+) | ✅ Dosen    |
| POST   | `/api/courses/:id/enroll`   | Enroll to course       | ✅ Required |
| DELETE | `/api/courses/:id/unenroll` | Unenroll from course   | ✅ Required |

**Example: List Courses**

```bash
curl -X GET "http://localhost:3000/api/courses?page=1&limit=10" \
  -H "Authorization: Bearer jwt-token"

# Response 200 OK
{
  "data": [
    {
      "id": "uuid",
      "title": "Algoritma & Struktur Data",
      "description": "Fundamental course...",
      "instructor": { "id": "uuid", "name": "Dr. Budi" },
      "enrollmentCount": 45,
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 87 }
}
```

**Example: Create Course**

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development Basics",
    "description": "Learn HTML, CSS, JavaScript",
    "code": "CS101"
  }'

# Response 201 Created
{
  "id": "new-uuid",
  "title": "Web Development Basics",
  "code": "CS101",
  "instructorId": "uuid"
}
```

---

### 4. Course Materials Endpoints

| Method | Endpoint                     | Deskripsi               | Auth        |
| ------ | ---------------------------- | ----------------------- | ----------- |
| GET    | `/api/courses/:id/materials` | List course materials   | ✅ Required |
| POST   | `/api/courses/:id/materials` | Upload material (dosen) | ✅ Dosen    |
| GET    | `/api/materials/:id`         | Get material details    | ✅ Required |
| DELETE | `/api/materials/:id`         | Delete material (dosen) | ✅ Dosen    |

**Example: Upload Material**

```bash
curl -X POST http://localhost:3000/api/courses/course-uuid/materials \
  -H "Authorization: Bearer jwt-token" \
  -F "title=Chapter 1: Intro" \
  -F "description=Introduction materials" \
  -F "file=@chapter1.pdf"

# Response 201 Created
{
  "id": "material-uuid",
  "title": "Chapter 1: Intro",
  "courseId": "course-uuid",
  "fileUrl": "/uploads/materials/chapter1.pdf",
  "uploadedAt": "2024-03-31T14:20:00Z"
}
```

---

### 5. Classes Endpoints

| Method | Endpoint           | Deskripsi            | Auth        |
| ------ | ------------------ | -------------------- | ----------- |
| GET    | `/api/classes`     | List all classes     | ✅ Required |
| POST   | `/api/classes`     | Create class (admin) | ✅ Admin    |
| GET    | `/api/classes/:id` | Get class details    | ✅ Required |
| PATCH  | `/api/classes/:id` | Update class (admin) | ✅ Admin    |
| DELETE | `/api/classes/:id` | Delete class (admin) | ✅ Admin    |

**Example: List Classes**

```bash
curl -X GET http://localhost:3000/api/classes \
  -H "Authorization: Bearer jwt-token"

# Response 200 OK
{
  "data": [
    {
      "id": "uuid",
      "name": "3A INFORMATIKA",
      "academicYearId": "uuid",
      "subjects": [
        { "id": "uuid", "name": "Algoritma" }
      ]
    }
  ]
}
```

---

### 6. Academic Years Endpoints

| Method | Endpoint                      | Deskripsi           | Auth        |
| ------ | ----------------------------- | ------------------- | ----------- |
| GET    | `/api/academic-years`         | List academic years | ✅ Required |
| GET    | `/api/academic-years/current` | Get current year    | ✅ Required |
| POST   | `/api/academic-years`         | Create year (admin) | ✅ Admin    |
| PATCH  | `/api/academic-years/:id`     | Update year (admin) | ✅ Admin    |
| DELETE | `/api/academic-years/:id`     | Delete year (admin) | ✅ Admin    |

---

### 7. Chat Endpoints

| Method | Endpoint                     | Deskripsi                       | Auth        |
| ------ | ---------------------------- | ------------------------------- | ----------- |
| POST   | `/api/chat/ask`              | Send message to chatbot         | ✅ Required |
| GET    | `/api/chat/sessions/:id`     | Get chat session (with history) | ✅ Required |
| GET    | `/api/chat/sessions`         | List user's chat sessions       | ✅ Required |
| POST   | `/api/chat/turns/:id/rating` | Rate chatbot answer             | ✅ Required |
| DELETE | `/api/chat/sessions/:id`     | Delete session                  | ✅ Required |

**Example: Ask Chatbot (RAG)**

```bash
curl -X POST http://localhost:3000/api/chat/ask \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Apa itu stack dalam data structures?",
    "sessionId": "session-uuid-or-null"
  }'

# Response 200 OK
{
  "sessionId": "session-uuid",
  "turnId": "turn-uuid",
  "message": "Apa itu stack dalam data structures?",
  "answer": "Stack adalah struktur data LIFO...",
  "references": [
    {
      "materialId": "uuid",
      "title": "Chapter 3: Data Structures",
      "excerpt": "Stack adalah..."
    }
  ],
  "responseTime": "1.2s"
}
```

---

### 8. Knowledge Base Endpoints

| Method | Endpoint                        | Deskripsi                      | Auth     |
| ------ | ------------------------------- | ------------------------------ | -------- |
| GET    | `/api/kb/materials`             | List knowledge base materials  | ✅ Admin |
| POST   | `/api/kb/materials`             | Upload new material (admin)    | ✅ Admin |
| GET    | `/api/kb/materials/:id`         | Get material details           | ✅ Admin |
| DELETE | `/api/kb/materials/:id`         | Delete material (admin)        | ✅ Admin |
| POST   | `/api/kb/materials/:id/reindex` | Reindex for embeddings (admin) | ✅ Admin |

**Example: Upload Knowledge Base Material**

```bash
curl -X POST http://localhost:3000/api/kb/materials \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Algoritma Sorting",
    "content": "Quicksort, Mergesort, Bubblesort...",
    "metadata": {"category": "algorithms", "level": "intermediate"}
  }'

# Response 201 Created
{
  "id": "kb-uuid",
  "title": "Algoritma Sorting",
  "embeddingsCount": 5,
  "createdAt": "2024-03-31T14:25:00Z"
}
```

---

### 9. Admin Endpoints

| Method | Endpoint                    | Deskripsi                   | Auth     |
| ------ | --------------------------- | --------------------------- | -------- |
| GET    | `/api/admin/logs`           | Get system logs (paginated) | ✅ Admin |
| GET    | `/api/admin/stats`          | Get system statistics       | ✅ Admin |
| GET    | `/api/admin/users`          | List all users (detailed)   | ✅ Admin |
| POST   | `/api/admin/users/:id/role` | Change user role            | ✅ Admin |
| DELETE | `/api/admin/users/:id`      | Delete user (hard delete)   | ✅ Admin |

**Example: Get System Logs**

```bash
curl -X GET "http://localhost:3000/api/admin/logs?page=1&level=info" \
  -H "Authorization: Bearer jwt-token"

# Response 200 OK
{
  "data": [
    {
      "id": "log-uuid",
      "level": "info",
      "message": "User mahasiswa@campus.ac.id enrolled to course",
      "timestamp": "2024-03-31T14:30:00Z"
    }
  ],
  "pagination": { "page": 1, "total": 1250 }
}
```

---

### API Response Format

**Success (200, 201)**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error (400, 401, 403, 500)**

```json
{
  "success": false,
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

### Common Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | OK - Success                   |
| 201  | Created - Resource created     |
| 400  | Bad Request - Invalid input    |
| 401  | Unauthorized - No/invalid auth |
| 403  | Forbidden - Access denied      |
| 404  | Not Found - Resource not found |
| 429  | Too Many Requests - Rate limit |
| 500  | Server Error - Internal error  |

### Authentication & Headers

Semua request (kecuali auth endpoints) membutuhkan:

```bash
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Token dikirim via:

- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `auth_token=<token>` (HttpOnly, secure)

**For complete examples & detailed parameters**: [Phase 3: API Reference](docs/PHASE-3-API-REFERENCE.md)

**For testing guide & UI pages**, see [Phase 5: Development Guide](docs/PHASE-5-DEVELOPMENT.md#testing)

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
