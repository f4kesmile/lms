# Phase 4: Dokumentasi Fitur 🎯

Penjelasan mendalam tentang fitur-fitur utama Nusa Belajar dan cara kerjanya.

---

## 1. Authentication & User Management

### Login System

#### Email + Password Authentication

**Flow:**

```
┌─────────────────────────────────┐
│ User Input Email & Password     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ login/page.tsx                  │
│ - Form input validation          │
│ - Call loginAction()            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ lib/actions/auth.ts             │
│ loginAction(email, password)    │
├─────────────────────────────────┤
│ 1. Validate input (Zod)         │
│ 2. Find user by email           │
│ 3. Compare password (bcrypt)    │
│ 4. Check isActive flag          │
│ 5. Generate JWT token           │
│ 6. Set httpOnly cookie          │
└────────────┬────────────────────┘
             │
     ┌───────┴───────┐
     │               │
Success ✓        Error ✗
Redirect          Show toast
 to dash
```

**Key Implementation:**

```typescript
// lib/auth/index.ts - Token handling
export function signAuthToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ userId }, secret, {
    expiresIn: "30d",
    algorithm: "HS512",
  });
}

export async function setAuthCookie(userId: string): Promise<void> {
  const token = signAuthToken(userId);
  const cookieStore = await cookies();
  cookieStore.set("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

// app/(auth)/login/page.tsx
async function loginAction(email: string, password: string) {
  // Find user
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  // Verify password
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid password");

  if (!user.isActive) throw new Error("User not active");

  // Set auth cookie
  await setAuthCookie(user.id);

  // Redirect based on role
  const redirectUrl = user.role === "admin" ? "/admin" : "/courses";
  redirect(redirectUrl);
}
```

#### Domain Validation

Sistem mendukung **domain restriction** untuk keamanan:

```
AUTH_EMAIL_MODE=restricted
AUTH_ALLOWED_EMAIL_DOMAINS=kampus.ac.id,student.kampus.ac.id
```

**Check pada register:**

```typescript
function validateEmailDomain(email: string): boolean {
  const allowed = process.env.AUTH_ALLOWED_EMAIL_DOMAINS?.split(",");
  const domain = email.split("@")[1];
  return allowed?.includes(domain);
}

async function registerAction(data) {
  if (process.env.AUTH_EMAIL_MODE === "restricted") {
    if (!validateEmailDomain(data.email)) {
      throw new Error("Email domain not allowed");
    }
  }
  // Continue with registration
}
```

### OAuth/SSO Authentication

#### Google Workspace OAuth

**Setup flow saat login tersedia:**

```
1. User click "Login with Google"
   ↓
2. Redirect ke Google OAuth:
   https://accounts.google.com/o/oauth2/v2/auth
   ?client_id=YOUR_CLIENT_ID
   &scope=email+profile+openid
   &response_type=code
   &redirect_uri=http://localhost:3000/api/auth/google/callback
   &state=<CSRF_TOKEN>
   ↓
3. User grant permission
   ↓
4. Google redirect ke /api/auth/google/callback?code=AUTH_CODE&state=STATE
   ↓
5. Backend:
   - Verify state token
   - Exchange code → access_token
   - Fetch user profile
   - Create or update user
   - Set JWT cookie
   ↓
6. Redirect ke /courses or /admin
```

**Implementation:**

```typescript
// app/api/auth/google/callback/route.ts
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify CSRF state
  const sessionState = getCsrfState(); // From session/storage
  if (state !== sessionState) {
    return redirect("/login?error=invalid_state");
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const profile = await profileResponse.json();

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      // Check domain restriction
      if (process.env.AUTH_EMAIL_MODE === "restricted") {
        const domain = profile.email.split("@")[1];
        if (!allowed_domains.includes(domain)) {
          return redirect("/forbidden");
        }
      }

      // Create new user
      user = await db.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          password: generateRandomPassword(), // Dummy password
          role: "mahasiswa", // Default role
        },
      });
    }

    // Set auth cookie
    await setAuthCookie(user.id);

    // Redirect
    return redirect(user.role === "admin" ? "/admin" : "/courses");
  } catch (error) {
    return redirect("/login?error=oauth_failed");
  }
}
```

#### Microsoft Azure Entra ID (SSO)

Mirip dengan Google, dengan beberapa perbedaan:

```
OAuth Endpoint: https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize
Token Endpoint: https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token
Profile Endpoint: https://graph.microsoft.com/v1.0/me
```

### Role Management

**3 Role System:**

```
┌─────────────┬──────────────────────┬──────────────┐
│ Role        │ Default Permissions  │ Use Case     │
├─────────────┼──────────────────────┼──────────────┤
│ admin       │ Full system access   │ System ops   │
│ dosen       │ Create materials     │ Teachers     │
│ mahasiswa   │ Browse & enroll      │ Students     │
└─────────────┴──────────────────────┴──────────────┘
```

**Assignment Flow:**

```typescript
// Admin can change user role
async function changeUserRole(userId: string, newRole: UserRole) {
  const currentUser = await requireRole("admin");

  const user = await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Log action
  await logAction({
    admin: currentUser.id,
    action: "ROLE_CHANGED",
    targetUser: userId,
    newRole,
  });

  return user;
}
```

---

## 2. Course Management

### Course Browsing

**Public course catalog:**

```
┌─────────────────────────────┐
│ /courses (Public Route)     │
├─────────────────────────────┤
│ 1. Fetch published courses  │
│ 2. Show search & filters    │
│ 3. List courses with        │
│    title, description,      │
│    teacher name            │
│ 4. Click → see detail      │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│ /courses/[courseId]         │
├─────────────────────────────┤
│ 1. Show full description    │
│ 2. List materials           │
│ 3. Show teacher info        │
│ 4. [Enroll] button for      │
│    mahasiswa                │
└─────────────────────────────┘
```

**Search Implementation:**

```typescript
// features/courses/CourseSearch.tsx
export function CourseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(searchTerm: string) {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const response = await fetch(`/api/courses?search=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();
    setResults(data.data);
  }

  return (
    <div>
      <input
        placeholder="Search courses..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {results.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### Course Enrollment

**Mahasiswa can enroll dengan 2 cara:**

**1. Direct Enrollment (dari course detail):**

```
1. Mahasiswa browse course
2. Click [Enroll] button
3. Server action: enrollCourse(courseId)
   - Verify user is mahasiswa
   - Check class capacity
   - Create ClassStudent record
4. Success → show "Enrolled!"
5. Course appears di /courses/enrolled
```

**2. Enrollment dengan Key:**

```
1. Dosen share enrollment key (e.g., "ENROLL-ABC123")
2. Mahasiswa:
   - Go to /courses/enroll-with-key
   - Enter enrollment key
3. System:
   - Find class by enrollment key
   - Verify capacity
   - Create ClassStudent
4. Success!
```

**Implementation:**

```typescript
// lib/actions/course.ts
"use server";

export async function enrollCourse(courseId: string) {
  const user = await requireRole("mahasiswa");

  // Find course / class
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) throw new Error("Course not found");

  // Check if already enrolled
  const existing = await db.classStudent.findUnique({
    where: {
      userId_classId: {
        userId: user.id,
        classId: courseId,
      },
    },
  });

  if (existing) throw new Error("Already enrolled");

  // Check capacity
  const students = await db.classStudent.count({
    where: { classId: courseId },
  });

  const capacity = await db.class.findUnique({
    where: { id: courseId },
    select: { capacity: true },
  });

  if (students >= capacity.capacity) {
    throw new Error("Class is full");
  }

  // Create enrollment
  const enrollment = await db.classStudent.create({
    data: {
      userId: user.id,
      classId: courseId,
      progress: 0,
    },
  });

  revalidatePath("/courses");
  return enrollment;
}
```

### Creating Materials

**Dosen/Admin dapat buat course materials:**

```
┌──────────────────────┐
│ /dosen/materials     │
├──────────────────────┤
│ 1. Select course     │
│ 2. Enter title       │
│ 3. Rich editor untuk │
│    write content     │
│ 4. Save → chunking   │
│    untuk RAG         │
└──────────────────────┘
```

**Material with Chunking:**

```typescript
// Saat material di-save, otomatis di-chunk untuk RAG
async function createMaterial(
  title: string,
  content: string,
  courseId: string,
) {
  const user = await requireRole("dosen", "admin");

  // Create material
  const material = await db.courseMaterial.create({
    data: {
      title,
      content,
      courseId,
      createdById: user.id,
      module: "1",
      page: "1",
    },
  });

  // Chunk content untuk RAG
  const chunks = chunkText(content, {
    maxChunkSize: 500, // 500 chars per chunk
    overlapSize: 50, // 50 chars overlap
  });

  for (let i = 0; i < chunks.length; i++) {
    await db.materialChunk.create({
      data: {
        materialId: material.id,
        chunkIndex: i,
        content: chunks[i],
      },
    });
  }

  revalidatePath("/admin/materials");
  return material;
}

// Utility untuk chunking
function chunkText(
  text: string,
  options: { maxChunkSize: number; overlapSize: number },
): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > options.maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = currentChunk.slice(-options.overlapSize) + sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}
```

---

## 3. Teaching Schedule Management

### Schedule Overview

**Struktur Schedule:**

```
Subject (e.g., "Algoritma")
  ↓
  ClassSubject (Kelas A1 mengambil Algoritma)
    ├─ Hari: MONDAY
    ├─ Jam: 08:00 - 10:00
    ├─ Ruang: Lab 1 Lt.3
    └─ Dosen: Dr. Smith

Meeting (Pertemuan ke-1, ke-2, dst)
  ├─ Meeting No: 1
  ├─ Title: "Introduction to Algorithms"
  ├─ Content: "..."
  └─ Chunks: [chunk1, chunk2, ...]
```

### View Schedule

**Dosen dapat lihat jadwal mengajar mereka:**

```
┌──────────────────────────────────┐
│ /dosen/teaching-schedule         │
├──────────────────────────────────┤
│ Monday:                          │
│  08:00-10:00  Algoritma (A1)     │
│  10:00-12:00  Database (B1)      │
│                                  │
│ Tuesday:                         │
│  09:00-11:00  Web Dev (A2)       │
└──────────────────────────────────┘
```

**Implementation:**

```typescript
// app/dosen/teaching-schedule/page.tsx
export default async function TeachingSchedulePage() {
  const user = await getCurrentUser();

  // Get all subjects taught by this dosen
  const subjects = await db.subjectTeacher.findMany({
    where: { userId: user.id },
    include: {
      subject: {
        include: {
          classes: {
            include: { class: true }
          }
        }
      }
    }
  });

  // Group by day of week
  const scheduleByDay = groupBy(subjects, "dayOfWeek");

  return (
    <div>
      {Object.entries(scheduleByDay).map(([day, items]) => (
        <div key={day}>
          <h3>{day}</h3>
          {items.map(item => (
            <ScheduleCard
              key={item.id}
              subject={item.subject.name}
              class={item.class.name}
              time={`${item.startTime}-${item.endTime}`}
              room={item.room}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Add Meeting

**Dosen dapat tambah meeting untuk subject:**

```
┌──────────────────────────────┐
│ /dosen/[subjectId]/meetings  │
├──────────────────────────────┤
│ [Meeting List]               │
│ Meeting 1: Intro             │
│ Meeting 2: ...               │
│                              │
│ [+ New Meeting]              │
└──────────────────────────────┘
        ↓
┌──────────────────────────────┐
│ Create Meeting Form          │
├──────────────────────────────┤
│ Title: ___________           │
│ Content: [Rich Editor] ✎     │
│ Assets: [Upload]            │
│                              │
│ [Save]                       │
└──────────────────────────────┘
```

---

## 4. Chat System

### User-to-User Chat (Future Feature)

Infrastruktur untuk P2P chat sudah ada di database dengan `ChatSession` dan `ChatTurn`.

### Chatbot (AI Academic Support)

**Floating Widget:**

```
┌─────────────────┐
│  🤖 Chatbot ⬇️  │  ← Floating widget (bottom right)
└────────┬────────┘
         │
    [Click]
         │
         ▼
┌─────────────────────┐
│ 🤖 Edunexus Chat    │
├─────────────────────┤
│ Hi! How can I help? │
└─────────────────────┘
│ [Input box...]      │
└─────────────────────┘
```

**How It Works:**

```
1. User: "What's binary search?"
           ↓
2. System:
   a. Retrieve context from knowledge base
      - Search course materials
      - Chunk-based retrieval (RAG)
      - Score results (minScore threshold)

   b. Build AI prompt:
      - System instruction
      - Chat history (context)
      - User message
      - Retrieved context from KB

   c. Call AI model (e.g., Claude, GPT-4)

   d. Stream response chunk by chunk

   e. Save to database
           ↓
3. User sees AI response
```

**RAG (Retrieval Augmented Generation) Implementation:**

```typescript
// lib/ai/rag.ts

export async function chat(sessionId: string, userMessage: string) {
  const user = await getCurrentUser();

  // 1. Retrieve relevant context from KB
  const context = await retrieveRelevantChunks(userMessage);

  // 2. Get chat history
  const history = await db.chatTurn.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 10, // Last 10 messages for context
  });

  // 3. Get chatbot settings
  const settings = await db.chatbotSetting.findUnique({
    where: { key: "default" },
  });

  // 4. Build messages for AI
  const messages = [
    {
      role: "system",
      content: settings.systemPrompt, // e.g., "You are an academic tutor..."
    },
    // Previous chat history
    ...history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    // User current message
    { role: "user", content: userMessage },
    // Context from KB
    {
      role: "context_provided",
      content: `Based on course materials:\n\n${context}`,
    },
  ];

  // 5. Get AI response
  const aiResponse = await generateAIResponse(messages);

  // 6. Save to DB
  await db.chatTurn.createMany({
    data: [
      {
        sessionId,
        role: "user",
        content: userMessage,
      },
      {
        sessionId,
        role: "assistant",
        content: aiResponse,
      },
    ],
  });

  return aiResponse;
}

// Retrieve chunks dengan RAG logic
async function retrieveRelevantChunks(query: string) {
  const settings = await db.chatbotSetting.findUnique({
    where: { key: "default" },
  });

  // Simple text matching (bisa di-enhance dengan embeddings)
  const queryTerms = query.toLowerCase().split(" ");

  const chunks = await db.materialChunk.findMany({
    where: {
      content: {
        search: queryTerms.join(" | "),
      },
    },
    take: settings.topK,
  });

  // Filter by relevance score
  const relevant = chunks.filter((chunk) => {
    const score = calculateRelevance(query, chunk.content);
    return score >= settings.minScore;
  });

  return relevant.map((c) => c.content).join("\n\n");
}

function calculateRelevance(query: string, content: string): number {
  const queryTerms = query.toLowerCase().split(" ");
  const contentLower = content.toLowerCase();

  let matches = 0;
  for (const term of queryTerms) {
    if (contentLower.includes(term)) matches++;
  }

  return matches / queryTerms.length;
}
```

**Chatbot Settings:**

Admin dapat configure chatbot behavior di `/admin/chatbot-settings`:

```json
{
  "systemPrompt": "You are an academic tutor for an Indonesian university...",
  "topK": 4,
  "minScore": 0.08,
  "temperature": 0.7,
  "maxTokens": 500
}
```

---

## 5. Admin Panel

### User Management

**Admin dapat manage users:**

```
┌──────────────────────────────┐
│ /admin/users                 │
├──────────────────────────────┤
│ Search: [_______] [Filter ▼] │
│                              │
│ Name      Role    Status  Atn│
│─────────────────────────────│
│ John      Student Active  ✓ │
│ Alice     Teacher Active  ✓ │
│ Bob       Admin  Inactive ✗ │
│                              │
│ [John] → Edit user details   │
│         → Change role        │
│         → Deactivate         │
│         → Reset password     │
└──────────────────────────────┘
```

**Actions:**

```typescript
// Change user role
async function changeUserRole(userId: string, newRole: UserRole) {
  const admin = await requireRole("admin");

  await db.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Log
  await createLog("USER_ROLE_CHANGED", {
    admin: admin.id,
    targetUser: userId,
    newRole,
  });

  revalidatePath("/admin/users");
}

// Deactivate user
async function toggleUserActive(userId: string, isActive: boolean) {
  const admin = await requireRole("admin");

  await db.user.update({
    where: { id: userId },
    data: { isActive },
  });

  revalidatePath("/admin/users");
}
```

### System Logs

**Live system logs monitoring:**

```
┌────────────────────────────────┐
│ /admin/logs                    │
├────────────────────────────────┤
│ Level: [All ▼] Auto-refresh ✓ │
│ From: [date] To: [date]        │
│                                │
│ Time         Level  Message    │
│────────────────────────────────│
│ 10:45:32     INFO   User login │
│ 10:42:15     ERROR  DB timeout │
│ 10:40:01     WARN   High memory│
│                                │
│ [< Previous] [Page 1/50] [Next>]
└────────────────────────────────┘
```

**Features:**

- Live refresh automatically setiap 2 detik
- Filter by level (INFO, WARNING, ERROR, DANGER)
- Pagination
- Date range filter
- Auto-prune old logs (configured in env)

**Auto-Pruning Configuration:**

```env
LOG_MAX_RECORDS=10000        # Keep max 10k records
LOG_RETENTION_DAYS=30        # Delete records older than 30 days
```

### Academic Year Management

**Admin manage tahun akademik:**

```
┌────────────────────────────────┐
│ /admin/academic-years          │
├────────────────────────────────┤
│ 2024/2025 (Current)           │
│ 2025/2026                     │
│ 2026/2027                     │
│                                │
│ [+ Add Academic Year]         │
│ [Edit] [Delete]               │
└────────────────────────────────┘
```

---

## 6. Knowledge Base & FAQ System

### Knowledge Base Retrieval

Saat user chat atau search, sistem mencari di knowledge base:

```
Search Query (e.g., "sorted array")
  ↓
  Search di material chunks & meeting chunks
  ↓
  Score results by relevance
  ↓
  Return top-K results with score > minScore
  ↓
  Display to user atau use as RAG context
```

### FAQs

**Public FAQ endpoint:**

```
/api/faqs?category=enrollment

Returns:
[
  {
    "id": "uuid",
    "category": "enrollment",
    "question": "How do I enroll?",
    "answer": "Go to courses...",
    "views": 234
  },
  ...
]
```

---

## 7. Key Features Summary

| Feature           | Availability | Access         |
| ----------------- | ------------ | -------------- |
| Course browsing   | ✓            | All            |
| Course enrollment | ✓            | Mahasiswa      |
| Material view     | ✓            | Course members |
| Create materials  | ✓            | Dosen/Admin    |
| Teaching schedule | ✓            | Dosen          |
| Chat with AI      | ✓            | All            |
| User management   | ✓            | Admin          |
| System logs       | ✓            | Admin          |
| Academic years    | ✓            | Admin          |
| OAuth login       | ✓            | All            |

---

**Next:** Baca [Phase 5 - Development Guide](PHASE-5-DEVELOPMENT.md) untuk workflow development new features.
