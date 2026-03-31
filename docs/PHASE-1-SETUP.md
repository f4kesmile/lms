# Phase 1: Pengaturan & Setup Awal 🚀

Panduan lengkap untuk setup project Nusa Belajar dari nol.

---

## 1. Overview Project

### Tentang Nusa Belajar

**Nusa Belajar** adalah Learning Management System (LMS) berbasis Web yang dikembangkan untuk mendukung pembelajaran di institusi pendidikan. Sistem ini dilengkapi dengan AI-powered chatbot untuk support akademik, manajemen kursus, jadwal pembelajaran, dan komunikasi real-time.

### Tech Stack

| Komponen            | Teknologi               | Versi  |
| ------------------- | ----------------------- | ------ |
| **Framework**       | Next.js                 | 16.0.0 |
| **Database**        | CockroachDB             | -      |
| **ORM**             | Prisma                  | 7.0.0  |
| **UI Framework**    | Tailwind CSS + Radix UI | 4.2.1  |
| **Runtime**         | Node.js                 | 18+    |
| **Package Manager** | npm                     | 10+    |
| **Language**        | TypeScript              | Latest |
| **Authentication**  | OAuth 2.0               | -      |
| **Rich Editor**     | TipTap                  | 3.21.0 |
| **Code Editor**     | Ace Editor              | 1.43.6 |

### Dependencies Utama

**Frontend:**

- React 19.2.0
- @radix-ui/\* (UI components)
- Tailwind CSS (@tailwindcss/postcss)
- Recharts (charting)
- Sonner (toast notifications)

**Backend & Authentication:**

- Prisma ORM 7.0.0 + PG adapter
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- sanitize-html (content sanitization)

**Development:**

- ESLint (linting)
- TypeScript (type checking)
- PostCSS (CSS processing)

---

## 2. Prasyarat

Sebelum mulai, pastikan sudah installed:

### System Requirements

- **OS:** Windows / macOS / Linux
- **Node.js:** v18.0.0 atau lebih baru
- **npm:** v10.0.0 atau lebih baru

### Check Installation

```bash
node --version      # Harus v18.0.0+
npm --version       # Harus v10.0.0+
```

---

## 3. Instalasi Dependencies

### Step 1: Clone Repository

```bash
# Jika belum, clone project
git clone <repository-url>
cd next-app
```

### Step 2: Install Dependencies

```bash
npm install
```

Tunggu sampai selesai. Ini akan install semua dependencies dari `package.json`.

### Step 3: Verify Installation

```bash
npm run lint    # Check if setup berhasil
```

---

## 4. Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

Atau manual: buat file `.env` di root folder dengan template dari `.env.example`.

### Step 2: Configure Required Variables

Edit `.env` dan isi required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nusa_belajar

# JWT Secret (generate baru)
JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-chars

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth Mode: 'restricted' = domain only, 'public' = semua
AUTH_EMAIL_MODE=restricted
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id,student.kampus.ac.id

# Logging
LOG_MAX_RECORDS=10000
LOG_RETENTION_DAYS=30
```

### Step 3: Optional - OAuth Configuration

Jika ingin setup Google atau Microsoft OAuth:

```env
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# Microsoft OAuth
MICROSOFT_OAUTH_CLIENT_ID=your-client-id
MICROSOFT_OAUTH_CLIENT_SECRET=your-client-secret
MICROSOFT_OAUTH_TENANT_ID=common
```

### Generate JWT Secret

Gunakan helper script:

```bash
node scripts/generate-jwt-secret.js
```

Atau generate manual:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 5. Database Configuration

### Setup CockroachDB

#### Option A: CockroachDB Cloud (Recommended)

1. Buat akun di [https://www.cockroachlabs.com/](https://www.cockroachlabs.com/)
2. Buat cluster baru
3. Copy connection string
4. Update `DATABASE_URL` di `.env`

#### Option B: Local CockroachDB

```bash
# Install CockroachDB locally (macOS dengan Homebrew)
brew install cockroachdb/tap/cockroach

# Start local instance
cockroach start-single-node --insecure

# Connection string
DATABASE_URL=postgresql://root@localhost:26257/nusa_belajar?sslmode=disable
```

#### Option C: PostgreSQL (Alternative)

Jika ingin pakai PostgreSQL biasa:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nusa_belajar
```

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Run Initial Migration

```bash
npm run prisma:migrate -- --name init
```

### Seed Database (Optional)

```bash
npx prisma db seed
```

Ini akan populate database dengan sample data dari `prisma/seed.ts`.

### Verify Database

Buka Prisma Studio:

```bash
npx prisma studio
```

Browser akan terbuka dengan UI untuk lihat database.

---

## 6. OAuth & SSO Setup

### Google OAuth Setup

#### Langkah 1: Create Project di Google Cloud Console

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com)
2. Klik dropdown project di kiri atas → **New Project**
3. Beri nama: `Nusa Belajar`
4. Klik **Create**

#### Langkah 2: Enable OAuth Consent Screen

1. Menu kiri → **APIs & Services → OAuth consent screen**
2. Pilih **Internal** (untuk org Google Workspace) atau **External** (semua Google account)
3. Isi form:
   - **App name:** Edunexus
   - **User support email:** your-email@kampus.ac.id
   - **Developer contact:** your-email@kampus.ac.id
4. Pilih **Scopes:** email, profile, openid (biasanya default)
5. Klik **Save and Continue**

#### Langkah 3: Create OAuth Credentials

1. Menu kiri → **APIs & Services → Credentials**
2. **+ Create Credentials → OAuth client ID**
3. **Application type:** Web application
4. **Name:** Nusa Belajar Web
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback
   ```
7. Klik **Create**
8. Copy **Client ID** dan **Client Secret** → masukkan ke `.env`

### Microsoft OAuth Setup

#### Langkah 1: Register Application

1. Buka [https://entra.microsoft.com](https://entra.microsoft.com)
2. **Applications → App registrations → New registration**
3. **Name:** Nusa Belajar
4. **Supported account types:** Pilih sesuai kebutuhan
5. **Redirect URI:** Web
   ```
   http://localhost:3000/api/auth/microsoft/callback
   ```
6. Klik **Register**

#### Langkah 2: Create Client Secret

1. Di panel kiri → **Certificates & secrets**
2. **+ New client secret**
3. **Description:** Edunexus Auth
4. **Expires:** Sesuai kebijakan
5. Copy value → masukkan ke `.env` sebagai `MICROSOFT_OAUTH_CLIENT_SECRET`

#### Langkah 3: Configure Permissions

1. Panel kiri → **API permissions**
2. **+ Add a permission → Microsoft Graph**
3. Pilih permissions:
   - `email`
   - `profile`
   - `openid`
4. Klik **Add permissions**

#### Langkah 4: Update Environment

```env
MICROSOFT_OAUTH_CLIENT_ID=your-app-id
MICROSOFT_OAUTH_CLIENT_SECRET=your-secret
MICROSOFT_OAUTH_TENANT_ID=common  # atau specific tenant ID
```

---

## 7. Run Development Server

### Start Dev Server

```bash
npm run dev
```

Output:

```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Access Application

Buka browser: [http://localhost:3000](http://localhost:3000)

---

## 8. Verify Setup

Checklist untuk pastikan setup berhasil:

- [ ] `npm install` completed tanpa error
- [ ] `.env` sudah dikonfigurasi dengan `DATABASE_URL` dan `JWT_SECRET`
- [ ] Database connected (verify dengan `npx prisma studio`)
- [ ] `npm run dev` berjalan tanpa error
- [ ] Login page accessible di `http://localhost:3000/login`
- [ ] Bisa melakukan register/login dengan email-password
- [ ] (Optional) OAuth buttons visible jika sudah configure Google/Microsoft

### Test Login

**Test Accounts** disimpan dalam [TEST-ACCOUNTS.md](../TEST-ACCOUNTS.md)

---

## 9. Common Setup Issues

### Error: "Cannot find module 'next'"

**Solusi:**

```bash
npm install
npm run prisma:generate
```

### Error: "DATABASE_URL is not set"

**Solusi:** Pastikan `.env` sudah:

- Terletak di root folder (`next-app/.env`)
- Berisi `DATABASE_URL=...`
- File saved

### Error: "PrismaClientInitializationError"

**Solusi:**

```bash
npm run prisma:generate
npx prisma db push
```

### OAuth Redirect URI Mismatch

**Solusi:**

- Google Console: Pastikan redirect URI match exactly (including `http://` vs `https://`)
- Microsoft Entra: Sama seperti Google
- `.env`: `NEXT_PUBLIC_APP_URL` harus match dengan authorized origins

### Port 3000 Already in Use

**Solusi:**

```bash
# Windows - Find process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Atau gunakan port lain
PORT=3001 npm run dev
```

---

## 10. Production Build

### Build untuk Production

```bash
npm run build
npm run start
```

### Verify Build

```bash
npm run build  # Build project
npm run start  # Run production server
```

Server akan running di `http://localhost:3000`.

---

## 📝 Next Steps

1. **Dev pertama:** Lanjut ke [Phase 2 - Architecture](PHASE-2-ARCHITECTURE.md)
2. **Build API:** Lihat [Phase 3 - API Reference](PHASE-3-API-REFERENCE.md)
3. **Develop fitur:** Baca [Phase 5 - Development Guide](PHASE-5-DEVELOPMENT.md)

---

## 🆘 Need Help?

- Lihat `.env.example` untuk lengkap environment variables
- Check `README.md` untuk info lebih detail
- Lihat [Phase 6 - Troubleshooting](PHASE-6-REFERENCE.md) untuk common issues

---

**Setup complete! Lanjut ke Phase 2 untuk understand architecture.** 🎉
