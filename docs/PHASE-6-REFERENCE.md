# Phase 6: Troubleshooting & Reference 🔍

Panduan mengatasi masalah umum dan referensi lengkap.

---

## 1. Troubleshooting Guide

### Authentication Issues

#### Error: "Cannot find module '@prisma/client'"

**Symptoms:** Build atau dev server error saat start

**Solution:**

```bash
npm run prisma:generate
npm install
npm run dev
```

**Explanation:** Prisma client belum di-generate. Ini diperlukan setelah instalasi atau schema changes.

---

#### Error: "JWT_SECRET is not configured"

**Symptoms:** Login page error saat submit

**Solution:**

1. Check `.env` file exists dan terletak di root folder
2. Verify `JWT_SECRET` field ada
3. Jika belum, generate:
   ```bash
   node scripts/generate-jwt-secret.js
   # Copy output ke .env
   ```
4. Restart dev server: `npm run dev`

**Prevention:**

```env
# .env (template)
JWT_SECRET=your-generated-secret-here-min-32-chars
```

---

#### Error: "Invalid credentials" saat login (email ada, password correct)

**Symptoms:** Login form error "Invalid credentials"

**Possible Causes:**

1. User deactivated (isActive = false)
2. User email mismatch (verify case-sensitive)
3. Password changed

**Debug:**

```bash
# Check user status di database
npx prisma studio
# Navigate ke User table
# Verify: email matches, isActive = true
```

**Solution:**

1. Jika deactivated, admin set isActive = true
2. Reset password
3. Try login lagi

---

#### Error: "OAuth redirect URI mismatch"

**Symptoms:** OAuth login error

**Cause:** Redirect URI di OAuth provider tidak match aplikasi

**Solution:**

1. **Google Console:**
   - Buka https://console.cloud.google.com
   - APIs & Services → Credentials
   - Edit OAuth client
   - Verify "Authorized redirect URIs" includes:
     ```
     http://localhost:3000/api/auth/google/callback  (dev)
     https://yourdomain.com/api/auth/google/callback (prod)
     ```

2. **Microsoft Entra:**
   - Buka https://entra.microsoft.com
   - App registrations → Your app
   - Authentication
   - Verify "Redirect URIs" includes:
     ```
     http://localhost:3000/api/auth/microsoft/callback
     ```

**Note:** Harus exact match, termasuk `http://` vs `https://`

---

### Database Issues

#### Error: "PrismaClientInitializationError: Cannot find query engine"

**Symptoms:** Prisma error saat query database

**Solution:**

```bash
# Regenerate Prisma
npm run prisma:generate

# If still failing:
rm -rf node_modules/.prisma
npm install
npm run prisma:generate
```

---

#### Error: "connect ECONNREFUSED" atau "Database connection failed"

**Symptoms:** Aplikasi crash, database unreachable

**Check Points:**

1. **Verify DATABASE_URL:**

   ```bash
   # .env
   DATABASE_URL=postgresql://user:pass@localhost:5432/nusa_belajar
   # Verify:
   # - user & password correct
   # - host reachable (localhost or IP)
   # - port correct (usually 5432)
   # - database name exists
   ```

2. **Test connection:**

   ```bash
   # psql (PostgreSQL command)
   psql postgresql://user:pass@localhost:5432/edunexus

   # If connected, you can run:
   \dt  # List tables
   \q   # Quit
   ```

3. **Check database service:**

   ```bash
   # macOS (Homebrew)
   brew services list | grep postgres
   # If stopped: brew services start postgresql

   # Linux
   sudo systemctl status postgresql
   # If stopped: sudo systemctl start postgresql

   # Windows
   # Services tab → PostgreSQL → Start
   # Or: pg_ctl -D "C:\Program Files\PostgreSQL\data" start
   ```

---

#### Error: "Unique constraint 'User_email_key' failed"

**Symptoms:** Register error when user email already exists

**Explanation:** Email sudah terdaftar di database

**Solution:**

1. **Use different email** (jika akun lama tidak diused lagi)
2. **Recover account** (jika ini akun lama Anda)
   - Use password reset
   - Or contact admin untuk reset
3. **Admin delete old account** (jika duplicate)
   ```bash
   npx prisma studio
   # Find user by email
   # Delete manually
   ```

---

#### Error: "No migrations found in prisma/migrations"

**Symptoms:** Error saat `npm run prisma:migrate`

**Solution:**

```bash
# Initialize migrations (first time setup)
npm run prisma:migrate -- --name init

# This creates:
# - prisma/migrations/ folder
# - First migration file
```

---

### Performance Issues

#### Symptom: Slow database queries

**Debug:**

```env
# .env - Enable Prisma query logging
DATABASE_URL="postgresql://...?log=query"
```

**Check logs di terminal:**

```
prisma:engine Query executed (2500 ms)
SELECT "User"."id" FROM "User" ...
```

**Optimize:**

```typescript
// ❌ SLOW - No include
const course = await db.course.findUnique({
  where: { id: courseId },
});
const creator = await db.user.findUnique({
  where: { id: course.createdById },
});

// ✓ FAST - Use include
const course = await db.course.findUnique({
  where: { id: courseId },
  include: { createdBy: true },
});
```

---

#### Symptom: High memory usage

**Check:**

```bash
# Terminal: Monitor process
top  # macOS/Linux
# Or Task Manager on Windows
```

**Cause:** Infinite loops atau memory leak

**Solution:**

1. Check for `while(true)` loops
2. Verify event listeners cleanup
3. Check for circular dependencies
4. Restart dev server

---

### Frontend Issues

#### Error: "Cannot read property of undefined"

**Symptoms:** Blank page atau component error

**Causes:**

- Async data not ready
- API response structure different
- Missing null check

**Solution:**

```typescript
// ❌ BAD
function UserProfile({ user }) {
  return <h1>{user.name}</h1>; // Crash if user undefined
}

// ✓ GOOD
function UserProfile({ user }) {
  if (!user) return <div>Loading...</div>;
  return <h1>{user.name}</h1>;
}

// ✓ GOOD with optional chaining
function UserProfile({ user }) {
  return <h1>{user?.name ?? "Unknown"}</h1>;
}
```

---

#### Error: "Hydration mismatch"

**Symptoms:** Page renders differently on client vs server

**Solution:**

```typescript
// ❌ BAD - Different on server vs client
export function Clock() {
  const [time, setTime] = useState(new Date());
  return <div>{time.toLocaleString()}</div>;
}

// ✓ GOOD - Use useEffect untuk client-only rendering
export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
  }, []);

  if (!time) return null; // Don't render on server
  return <div>{time.toLocaleString()}</div>;
}

// Better: Use suppressHydrationWarning
export function Clock() {
  return (
    <div suppressHydrationWarning>
      {new Date().toLocaleString()}
    </div>
  );
}
```

---

### Deployment Issues

#### Error: Build succeeds locally but fails on Vercel

**Common cause:** Environment variables not set

**Solution:**

1. Go to Vercel project → Settings → Environment Variables
2. Add all required variables:
   ```
   DATABASE_URL
   JWT_SECRET
   NEXT_PUBLIC_APP_URL
   GOOGLE_OAUTH_CLIENT_ID
   GOOGLE_OAUTH_CLIENT_SECRET
   MICROSOFT_OAUTH_CLIENT_ID
   MICROSOFT_OAUTH_CLIENT_SECRET
   MICROSOFT_OAUTH_TENANT_ID
   ```
3. Redeploy

---

#### Error: Prisma client error on deploy

**Solution:**

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

Add `prisma generate` sebelum build untuk ensure Prisma client generated.

---

## 2. Environment Variables Reference

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=<generated-secret-min-32-chars>

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development  # development | production
```

### OAuth Configuration

```env
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=<from-google-cloud-console>
GOOGLE_OAUTH_CLIENT_SECRET=<from-google-cloud-console>

# Microsoft OAuth
MICROSOFT_OAUTH_CLIENT_ID=<from-azure-portal>
MICROSOFT_OAUTH_CLIENT_SECRET=<from-azure-portal>
MICROSOFT_OAUTH_TENANT_ID=common  # or specific tenant ID
```

### Authentication & Domain Control

```env
# Domain restriction mode
AUTH_EMAIL_MODE=restricted  # restricted | public

# Allowed email domains (comma-separated)
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id,student.kampus.ac.id

# OAuth debugging
AUTH_OAUTH_DEBUG_TIMING=false  # true | false
AUTH_OAUTH_LATENCY_WARN_MS=2500  # milliseconds
```

### Logging Configuration

```env
# System logs
LOG_MAX_RECORDS=10000        # Maximum log records to keep
LOG_RETENTION_DAYS=30        # Delete logs older than this
```

### Complete .env Template

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nusa_belajar

# Auth
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# OAuth - Google
GOOGLE_OAUTH_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxx

# OAuth - Microsoft
MICROSOFT_OAUTH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_OAUTH_CLIENT_SECRET=xxxxxxx.xxxxxxxxxxxxxxxxxxxxxx
MICROSOFT_OAUTH_TENANT_ID=common

# Auth Configuration
AUTH_EMAIL_MODE=restricted
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id,student.kampus.ac.id
AUTH_OAUTH_DEBUG_TIMING=false
AUTH_OAUTH_LATENCY_WARN_MS=2500

# Logging
LOG_MAX_RECORDS=10000
LOG_RETENTION_DAYS=30
```

---

## 3. API Error Codes Reference

### HTTP Status Codes

| Code | Meaning           | Example                       |
| ---- | ----------------- | ----------------------------- |
| 200  | OK                | Course retrieved successfully |
| 201  | Created           | User account created          |
| 204  | No Content        | Resource deleted              |
| 400  | Bad Request       | Invalid input (missing field) |
| 401  | Unauthorized      | JWT expired or invalid        |
| 403  | Forbidden         | User lacks permission         |
| 404  | Not Found         | Course ID not exist           |
| 409  | Conflict          | Email already registered      |
| 422  | Unprocessable     | Validation error              |
| 429  | Too Many Requests | Rate limit exceeded           |
| 500  | Server Error      | Internal error                |

### Common Error Responses

**Invalid Input:**

```json
{
  "status": "error",
  "message": "Invalid email format",
  "errors": {
    "email": "Must be valid email"
  }
}
```

**Unauthenticated:**

```json
{
  "status": "error",
  "message": "Unauthorized: JWT token invalid or expired"
}
```

**Insufficient Permission:**

```json
{
  "status": "error",
  "message": "Forbidden: Only admin can access this resource"
}
```

---

## 4. Security Best Practices

### Password Security

```typescript
// Use bcrypt untuk hash password (already implemented)
import bcrypt from "bcryptjs";

// Hash password saat register
const hashedPassword = await bcrypt.hash(password, 10);

// Verify saat login
const match = await bcrypt.compare(inputPassword, hashedPassword);

// NEVER store plain password
// NEVER send password over unsecured connection
```

### JWT Security

```
✓ Token stored dalam httpOnly cookie (secure)
✓ HTTPS required in production
✓ Token expiration: 30 days
✓ Signed dengan HS512 algorithm

✗ NEVER store token in localStorage (XSS vulnerable)
✗ NEVER send token in URL params
✗ NEVER share JWT secret publicly
```

### Input Validation

```typescript
// Use Zod untuk runtime validation
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// Validate before processing
const validateUser = (data) => {
  return UserSchema.parse(data);
};
```

### SQL Injection Prevention

```typescript
// ✓ GOOD - Prisma handles escaping
await db.user.findUnique({
  where: { email: userInput }, // Safe from SQL injection
});

// ❌ BAD - String concatenation (vulnerable)
const query = `SELECT * FROM User WHERE email = '${userInput}'`;
```

### CORS & CSRF

```typescript
// CSRF protection via SameSite cookie
httpOnly: true;
sameSite: "strict"; // Prevents CSRF attacks

// CORS configured in next.config.ts
```

### Secrets Management

```
✓ Use environment variables for secrets
✓ .env file in .gitignore (never commit)
✓ Use different secrets for dev vs prod
✓ Rotate secrets periodically in production

✗ Never hardcode secrets in code
✗ Never commit .env to git
✗ Never share secrets with team (use SecOps)
```

---

## 5. Performance Tuning

### Database Indexing

```prisma
// Add indexes untuk frequently queried fields
model User {
  id    String @id
  email String @unique  // Already indexed
  role  String

  @@index([role])  // Index for filtering by role
}

model Log {
  id        String @id
  level     String
  createdAt DateTime

  @@index([createdAt])  // Index for date range queries
  @@index([level])      // Index for level filtering
}
```

### Query Optimization

```typescript
// ❌ Fetch all then filter
const users = await db.user.findMany();
const admins = users.filter((u) => u.role === "admin");

// ✓ Filter at database level
const admins = await db.user.findMany({
  where: { role: "admin" },
});
```

### Caching

```typescript
// Use Next.js revalidatePath untuk ISR
import { revalidatePath } from "next/cache";

async function updateCourse(id, data) {
  await db.course.update({ where: { id }, data });
  revalidatePath("/courses"); // Invalidate cache
}
```

---

## 6. Glossary

| Term           | Meaning                                     |
| -------------- | ------------------------------------------- |
| **JWT**        | JSON Web Token - stateless authentication   |
| **OAuth**      | Authorization protocol for delegated access |
| **Prisma**     | ORM for database access                     |
| **RSC**        | React Server Components (Next.js feature)   |
| **RAG**        | Retrieval Augmented Generation (AI context) |
| **API**        | Application Programming Interface           |
| **CORS**       | Cross-Origin Resource Sharing               |
| **CSRF**       | Cross-Site Request Forgery attack type      |
| **Middleware** | Function that intercepts requests           |
| **Endpoint**   | API URL path (e.g., `/api/courses`)         |
| **Payload**    | Data sent in request/response               |
| **Schema**     | Data structure definition                   |
| **Migration**  | Database schema version change              |
| **Chunking**   | Breaking text into smaller pieces           |
| **Embedding**  | Vector representation of text               |
| **ISR**        | Incremental Static Regeneration             |
| **SSR**        | Server-Side Rendering                       |
| **SSO**        | Single Sign-On authentication               |

---

## 7. Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server on :3000
npm run build                  # Optimize production build
npm run start                  # Run production build
npm run lint                   # Check code style
npm run lint -- --fix         # Auto-fix linting issues

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Create + apply migration
npx prisma studio            # Open database GUI
npx prisma db seed           # Populate with seed data

# Database (reset)
npx prisma migrate reset      # Reset to initial state (! Loses data)

# Debugging
node scripts/drop-all.ts      # Drop all database records
node scripts/test-login.ts    # Test login functionality
```

---

## 8. Getting Help

### Resources

1. **Documentation:**
   - Project: See DOKUMENTASI_RINGKASAN.md
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - TypeScript: https://www.typescriptlang.org/docs

2. **Search:**
   - GitHub Issues (this repo)
   - Stack Overflow (tag: next.js, prisma)
   - Discussion forums

3. **Contact:**
   - Team lead/manager
   - Slack channel
   - Email support

### Debug Mindset

```
1. Read error message carefully
2. Check console/logs
3. Verify environment variables
4. Test with minimal example
5. Check database state
6. Use browser DevTools
7. Add console.log() strategically
8. Try restarting services
9. Isolate the problem
10. Ask for help (provide context & errors)
```

---

## 9. Frequently Asked Questions

**Q: Bagaimana cara reset password user?**  
A: Admin buka `/admin/users`, pilih user, click "Reset Password", kirim new password ke user.

**Q: Berapa lama token JWT valid?**  
A: 30 hari (configured in lib/auth/index.ts)

**Q: Bagaimana kalau lupa JWT_SECRET?**  
A: Generate baru dengan `node scripts/generate-jwt-secret.js` dan update .env. Token existing akan invalid.

**Q: Bisa integrate dengan Third-party service?**  
A: Ya, via API route handler. Contoh: Stripe, SendGrid, dll untuk payments/email.

**Q: Database transaction support?**  
A: Ya, Prisma support $transaction. Gunakan untuk atomic multi-step operations.

---

## 10. Monitoring & Logs

### Check Live Logs

```
/admin/logs → Admin panel → see system logs
Filter by: level, date range, search
Auto-refresh every 2 seconds
```

### Debug OAuth Timing

```env
AUTH_OAUTH_DEBUG_TIMING=true
AUTH_OAUTH_LATENCY_WARN_MS=2500
```

Then check logs untuk detailed timing information per OAuth stage.

### Database Connection Pool

CockroachDB dan PostgreSQL maintain connection pool untuk performance. Biasanya auto-managed, tidak perlu manual config.

---

**Selamat! Anda sudah membaca seluruh dokumentasi Nusa Belajar.** 🎉

Jika ada pertanyaan atau issue, lihat Troubleshooting section di atas atau contact team lead.

**Happy coding!** 💻✨
