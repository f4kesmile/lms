# Phase 2: Arsitektur & Konsep Inti 🏗️

Pemahaman mendalam tentang architecture, database schema, authentication flow, dan code organization Edunexus.

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER / CLIENT                        │
│              (React SPA + Next.js Server Components)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Next.js Router │
                    │  & Middleware   │
                    └────────┬────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
   ┌────▼─────┐                         ┌────────▼──────┐
   │ Page      │                         │ API Routes    │
   │ Components│                         │ (RPC + REST)  │
   └────┬──────┘                         └────────┬──────┘
        │                                         │
        │            ┌────────────────────────────┘
        │            │
        └────┬───────┤
             │       │
        ┌────▼───────▼──────────────┐
        │   Server Actions / Lib    │
        │  - Auth Logic              │
        │  - Database Access         │
        │  - AI Processing           │
        │  - RAG Engine              │
        └────┬──────────────────────┘
             │
        ┌────▼──────────────────────┐
        │  Prisma ORM               │
        │  (Query Builder + Types)  │
        └────┬──────────────────────┘
             │
        ┌────▼──────────────────────┐
        │  CockroachDB / PostgreSQL │
        │  (Persistent Storage)     │
        └───────────────────────────┘
```

### Layered Architecture

Nusa Belajar menggunakan **3-layer architecture**:

```
┌─────────────────────────────────────────────┐
│   PRESENTATION LAYER                        │
│  (React Components, Pages, UI Logic)        │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   BUSINESS LOGIC LAYER                      │
│  (Server Actions, API Routes, Services)     │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│   DATA ACCESS LAYER                         │
│  (Prisma ORM, Database)                     │
└─────────────────────────────────────────────┘
```

---

## 2. Database Schema

### Entity Relationship Diagram

```
User ◄─────────────► UserRole (Enum: admin, dosen, mahasiswa)
 ▲
 │ 1:N
 ├─────────────────────────────┬────────────────┐
 │                             │                │
 │                      1..*   1..*         1..*
 │                             │                │
 ├───► ChatSession             ├─► ClassStudent
 ├───► ChatTurn                │    ▲
 ├───► ClassSubject ────────────┘    │
 │    (Teacher of Subjects)         │
 ├───► SubjectTeacher               │
 │                               1  │
 ├───► Course ───► CourseMaterial   │
 │                    ▼             │
 │              MaterialChunk    Class ──────┐
 │                               ▲           │
 └───────────────────────────────┘           │
                                         1:N │
                        AcademicYear ◄──────┘

Subject ◄──────┐
  │   1:N      │
  │            │
  ├─► ClassSubject
  │    (Meeting at classroom)
  ├─► SubjectMeeting
  │    ▼
  └─► SubjectMeeting ──► MeetingChunk
       (Lecture notes)

ChatbotSetting (Single config for AI)
```

### Core Models

#### 1. **User** - User Account

```
- id: UUID (primary key)
- name: String
- email: String (unique)
- password: String (hashed dengan bcrypt)
- role: UserRole enum (admin, dosen, mahasiswa)
- isActive: Boolean
- nip: String (Nomor Induk Pegawai, untuk dosen)
- specialization: String (keahlian dosen)
- studentClassId: FK ← Class (untuk mahasiswa)
- createdAt, updatedAt: Timestamps

Relations:
- 1:N → ChatSession (chat history)
- 1:N → ClassStudent (enrolled classes)
- 1:N → ClassSubject (teaching assignments)
- 1:N → SubjectTeacher (subject assignments)
- 1:N → Course (created courses)
- 1:N → CourseMaterial (created materials)
```

#### 2. **Course** - Kursus Pembelajaran

```
- id: UUID (primary key)
- code: String (unique, e.g., "CS101")
- title: String (e.g., "Algoritma & Struktur Data")
- description: String
- learningOutcomes: String (learning objectives)
- status: CourseStatus (published, draft, archived)
- createdById: FK → User
- createdAt, updatedAt: Timestamps

Relations:
- N:1 → User (creator)
- 1:N → CourseMaterial (course materials/chapters)
```

#### 3. **AcademicYear** - Tahun Akademik

```
- id: UUID (primary key)
- name: String (e.g., "2024/2025")
- fromYear: DateTime (start date)
- toYear: DateTime (end date)
- isCurrent: Boolean (marking current academic year)
- createdAt, updatedAt: Timestamps

Relations:
- 1:N → Class (classes in this year)
```

#### 4. **Class** - Kelas

```
- id: UUID (primary key)
- name: String (e.g., "A1", "B2")
- academicYearId: FK → AcademicYear
- capacity: Int (max students)
- enrollmentKey: String (secret key untuk enroll)
- createdAt, updatedAt: Timestamps
- Unique constraint: (name, academicYearId)

Relations:
- N:1 → AcademicYear
- 1:N → ClassStudent (students in class)
- 1:N → ClassSubject (subjects taught in class)
```

#### 5. **Subject** - Mata Pelajaran

```
- id: UUID (primary key)
- name: String (e.g., "Pemrograman Web")
- code: String (unique, e.g., "WEB201")
- isActive: Boolean
- bannerImage: String (URL)
- credits: Int (SKS: semester credit hours)
- description: String
- learningOutcomes: String
- status: CourseStatus
- createdAt, updatedAt: Timestamps

Relations:
- 1:N → ClassSubject (taught in classes)
- 1:N → SubjectMeeting (lectures/meetings)
- 1:N → SubjectTeacher (assigned teachers)
```

#### 6. **ClassSubject** - Subject di Class (Junction + Schedule)

```
Composite Key: (classId, subjectId)
- classId: FK → Class
- subjectId: FK → Subject
- teacherUserId: FK → User (assigned teacher)
- dayOfWeek: DayOfWeek enum (MON, TUE, WED, THU, FRI, SAT, SUN)
- startTime: String (e.g., "08:00")
- endTime: String (e.g., "10:00")
- room: String (e.g., "Lab 1 Lt.3")
- createdAt, updatedAt: Timestamps

Use case:
- "Algoritma" subject diajar di class "A1" Senin jam 08:00-10:00 di Lab 1
```

#### 7. **SubjectMeeting** - Pertemuan/Materi Pembelajaran

```
- id: UUID (primary key)
- subjectId: FK → Subject
- meetingNo: Int (urutan, 1, 2, 3, ...)
- title: String (e.g., "Introduction to Algorithms")
- content: String (rich HTML content)
- assets: JSON (optional media references)
- createdAt, updatedAt: Timestamps
- Unique constraint: (subjectId, meetingNo)

Relations:
- N:1 → Subject
- 1:N → MeetingChunk (chunked content for RAG)
```

#### 8. **MeetingChunk** - Chunks for RAG (Vector Database)

```
- id: UUID (primary key)
- meetingId: FK → SubjectMeeting
- chunkIndex: Int (order of chunks)
- content: String (chunk text for embedding)
- createdAt: Timestamp
- Unique constraint: (meetingId, chunkIndex)

Use case:
- Breaking down meeting notes untuk AI embedding
```

#### 9. **ChatSession** - Chat Conversation

```
- id: UUID (primary key)
- userId: FK → User
- title: String (session title, optional)
- createdAt, updatedAt: Timestamps

Relations:
- N:1 → User
- 1:N → ChatTurn (messages in session)
```

#### 10. **ChatTurn** - Messages dalam Chat

```
- id: UUID (primary key)
- sessionId: FK → ChatSession
- role: ChatRole ("user", "assistant", "system", "context_provided")
- content: String (message content)
- createdAt: Timestamp

Use case:
- Store chat history untuk context dalam conversations
```

#### 11. **CourseMaterial** - Bahan Pembelajaran

```
- id: UUID (primary key)
- title: String
- module: String (bab/modul)
- page: String (halaman reference, optional)
- content: String (HTML content)
- courseId: FK → Course
- createdById: FK → User
- createdAt, updatedAt: Timestamps

Relations:
- N:1 → Course
- N:1 → User
- 1:N → MaterialChunk (for RAG)
```

#### 12. **MaterialChunk** - Chunks for Course Material RAG

```
- id: UUID (primary key)
- materialId: FK → CourseMaterial
- chunkIndex: Int (order)
- content: String (chunk text)
- createdAt: Timestamp
- Unique constraint: (materialId, chunkIndex)
```

#### 13. **ChatbotSetting** - Konfigurasi AI Chatbot

```
- id: UUID (primary key)
- key: String (unique, default: "default")
- topK: Int (number of relevant chunks to retrieve)
- minScore: Float (minimum relevance threshold)
- systemPrompt: String (AI system instruction)
- createdAt, updatedAt: Timestamps

Use case:
- Single source of truth untuk RAG configuration
```

---

## 3. Enums & Constants

### UserRole

```typescript
enum UserRole {
  admin      // Admin panel access, user management
  dosen      // Teacher: create materials, manage classes
  mahasiswa  // Student: browse courses, chat
}
```

### CourseStatus

```typescript
enum CourseStatus {
  draft      // Not published yet
  published  // Available for enrollment
  archived   // No longer available
}
```

### DayOfWeek

```typescript
enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}
```

### ChatRole

```typescript
enum ChatRole {
  user                // User message
  assistant           // AI assistant response
  system              // System message
  context_provided    // Context used for response
}
```

---

## 4. Authentication & Authorization

### Authentication Flow

#### Email + Password Authentication

```
User Input
  │
  ├─► Form Submission (email, password)
  │
  ├─► POST /api/auth/login
  │   ├─ Validate input (Zod schema)
  │   ├─ Find user by email
  │   ├─ Compare password dengan bcrypt
  │   │   └─ If mismatch → error "Invalid credentials"
  │   ├─ Generate JWT token
  │   │   └─ Payload: { userId, exp: +30d }
  │   ├─ Set httpOnly cookie "jwt"
  │   └─ Return { status: "success" }
  │
  ├─► Redirect ke /admin atau / (based on role)
  │
Success ✓
```

#### OAuth Flow (Google/Microsoft)

```
User Click "Login with Google/Microsoft"
  │
  ├─► Redirect ke Google/Microsoft OAuth endpoint
  │   └─ scope: email, profile
  │   └─ redirect_uri: /api/auth/google/callback or /api/auth/microsoft/callback
  │   └─ state: CSRF token
  │
  ├─ User Grant Permission at Provider
  │
  ├─► Provider Redirect ke /api/auth/[provider]/callback
  │   ├─ code & state received
  │   ├─ Verify state token
  │   ├─ Exchange code → access_token
  │   ├─ Fetch user profile (email, name)
  │   ├─ Check if user exists
  │   │   ├─ If exists: Use existing user
  │   │   └─ If not exists:
  │   │       ├─ Check domain restriction (AUTH_EMAIL_MODE)
  │   │       ├─ Create new user dengan role "mahasiswa"
  │   ├─ Generate JWT & set cookie
  │   └─ Redirect ke dashboard
  │
  ├─► Redirect ke /admin atau /
  │
Success ✓
```

### JWT Token Structure

```
Header:
{
  "alg": "HS512",
  "typ": "JWT"
}

Payload:
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1704067200,
  "exp": 1706745600  // 30 days dari now
}

Signature:
HMACSHA512(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Auth Token Verification

```typescript
// Setiap request ke protected route:

1. Read cookie "jwt" dari headers
2. Verify signature dengan JWT_SECRET
3. Check expiration (exp > now)
4. Extract userId dari payload
5. Query user di database (verify still active)
6. Attach user ke context/request

If any step fails → 401 Unauthorized
```

### Cookie Configuration

```
httpOnly: true       // Prevent JavaScript access
secure: true         // Hanya kirim via HTTPS (production)
sameSite: "strict"   // CSRF protection
maxAge: 2592000      // 30 days in seconds
path: "/"            // Available globally
```

---

## 5. Authorization (RBAC)

### Role-Based Access Control

```
┌──────────────┬─────────────┬─────────────┬──────────────┐
│ Resource     │ Admin       │ Dosen       │ Mahasiswa    │
├──────────────┼─────────────┼─────────────┼──────────────┤
│ Admin Panel  │ ✓ Full      │ ✗           │ ✗            │
│ User Mgmt    │ ✓ Full      │ ✗           │ ✗            │
│ Logs         │ ✓ View      │ ✗           │ ✗            │
│              │             │             │              │
│ Create       │ ✓           │ ✓           │ ✗            │
│ Subject      │             │             │              │
│              │             │             │              │
│ Create       │ ✓           │ ✓ Own only  │ ✗            │
│ Material     │             │             │              │
│              │             │             │              │
│ Create       │ ✗           │ ✓ Own only  │ ✗            │
│ Meeting      │             │             │              │
│              │             │             │              │
│ Browse       │ ✓           │ ✓           │ ✓            │
│ Courses      │             │             │              │
│              │             │             │              │
│ Enroll       │ ✗           │ ✗           │ ✓            │
│ Course       │             │             │              │
│              │             │             │              │
│ View Chat    │ ✗           │ ✓ Own only  │ ✓ Own only   │
│ History      │             │             │              │
└──────────────┴─────────────┴─────────────┴──────────────┘
```

### Authorization Check Middleware

```typescript
// Pattern untuk check authorization:

async function requireRole(...allowedRoles: UserRole[]) {
  const userId = await getCurrentUserIdFromCookie();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized");
  }

  return user;
}

// Usage in server action atau API route:
async function createSubject(data) {
  const user = await requireRole("admin", "dosen");
  // Safe to proceed
}
```

---

## 6. Folder Structure & Code Organization

### Root Level Structure

```
next-app/
├── app/                  # Next.js routing
├── components/           # Shared UI components
├── features/             # Feature modules
├── lib/                  # Shared utilities & logic
├── prisma/               # Database schema & migrations
├── public/               # Static assets
├── docs/                 # Documentation (you are here)
├── scripts/              # Utility scripts
├── types/                # TypeScript type definitions
├── .env                  # Environment variables (git ignored)
├── .env.example          # Template for .env
├── next.config.ts        # Next.js config
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
├── package.json          # Dependencies
└── README.md             # Project README
```

### `app/` - File-Based Routing

```
app/
├── (public)/                  # Public routes (no auth required)
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Public layout
│   ├── about/
│   │   └── page.tsx
│   ├── courses/
│   │   ├── page.tsx           # Course catalog
│   │   ├── [classId]/
│   │   │   ├── page.tsx       # Course detail
│   │   │   ├── _components/
│   │   │   │   └── CourseSearch.tsx
│   │   │   └── _lib/
│   │   │       └── course.ts  # Local service
│   │   └── CourseCatalogBrowser.tsx
│   ├── help/
│   └── materials/
│
├── (auth)/                    # Auth routes (login/register)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (admin)/                   # Admin routes (requires admin role)
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   ├── academic-years/
│   │   ├── logs/
│   │   └── teaching-schedule/
│   │
│   └── dosen/                 # Dosen-specific routes
│       ├── layout.tsx
│       └── ...
│
├── api/                       # API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   ├── logout/
│   │   │   └── route.ts
│   │   ├── google/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── microsoft/
│   │       └── callback/
│   │           └── route.ts
│   ├── courses/
│   │   ├── route.ts           # GET /api/courses
│   │   ├── [courseId]/
│   │   │   └── route.ts       # GET /api/courses/[courseId]
│   │   └── [courseId]/materials/
│   │       └── route.ts       # GET /api/courses/[courseId]/materials
│   ├── subjects/
│   ├── classes/
│   ├── academic-years/
│   ├── users/
│   ├── admin/
│   │   ├── users/
│   │   └── logs/
│   ├── chat/
│   │   ├── route.ts           # POST /api/chat (send message)
│   │   └── history/
│   │       └── route.ts       # GET /api/chat/history
│   ├── kb/                    # Knowledge Base
│   │   └── route.ts
│   └── faqs/
│       └── route.ts
│
├── forbidden/                 # 403 error page
│   ├── page.tsx
│   └── ForbiddenClient.tsx
│
├── unauthorized/              # 401 error page
│   ├── page.tsx
│   └── UnauthorizedClient.tsx
│
├── layout.tsx                 # Root layout
├── not-found.tsx              # 404 error page
└── globals.css                # Global styles
```

### `components/` - Reusable UI Components

```
components/
├── layout/
│   ├── AdminLayout.tsx        # Wrapper with sidebar
│   ├── DosenLayout.tsx        # Teacher layout
│   ├── Footer.tsx             # Footer shared
│   ├── Navbar.tsx             # Top navbar
│   ├── NavbarClient.tsx       # Client-side navbar
│   └── PageWrapper.tsx        # Page container
│
├── shared/
│   ├── AppToaster.tsx         # Toast notification provider
│   ├── EmptyState.tsx         # Empty state component
│   ├── Logo.tsx
│   └── ThemeProvider.tsx      # Dark/light mode
│
├── ui/                        # Shadcn UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   └── ... (other UI components)
│
└── features/
    ├── chat/
    │   ├── Chat.tsx
    │   └── ChatbotVisibilityGuard.tsx
    │
    └── courses/
        ├── Catalog.tsx
        ├── CourseSearch.tsx
        └── EnrollButton.tsx
```

### `features/` - Domain Feature Modules

```
features/
├── chat/                      # Chat feature
│   ├── Chat.tsx               # Main chat UI
│   ├── ChatbotVisibilityGuard.tsx
│   └── hooks/
│       └── (custom hooks)
│
├── chatbot/                   # AI Chatbot feature
│   ├── FloatingChatbot.tsx    # Floating widget
│   └── types.ts
│
└── courses/
    ├── Catalog.tsx
    ├── CourseCatalogBrowser.tsx
    ├── CourseSearch.tsx
    ├── EnrollButton.tsx
    └── types.ts
```

### `lib/` - Shared Business Logic

```
lib/
├── actions/                   # Server actions (RSC + form-based)
│   ├── course.ts              # Course-related actions
│   ├── dosen.ts               # Dosen/Teacher actions
│   ├── meeting.ts             # Meeting actions
│   └── ...
│
├── ai/                        # AI-related utilities
│   ├── chatbot.ts             # Chatbot logic
│   ├── rag.ts                 # RAG (Retrieval Augmented Generation)
│   ├── chunking.ts            # Text chunking for embeddings
│   └── settings.ts            # AI settings
│
├── auth/                      # Authentication utilities
│   ├── index.ts               # Core auth (sign/verify token, cookie)
│   ├── domain.ts              # Domain whitelist checking
│   ├── dosen-access.ts        # Dosen-specific access control
│   └── user.ts                # User utilities
│
├── core/                      # Core infrastructure
│   ├── db.ts                  # Prisma client
│   ├── http.ts                # HTTP helper
│   ├── limiter.ts             # Rate limiter
│   └── logs.ts                # Logging system
│
├── constants/
│   ├── index.ts               # Global constants
│   ├── navigation.ts          # Navigation links
│   └── site.ts                # Site configuration
│
├── services/
│   └── course.ts              # Course business logic
│
└── utils/
    ├── date.ts                # Date utilities
    ├── image-compress.ts      # Image compression
    ├── index.ts               # General utils
    ├── material-content.ts    # Material parsing
    ├── string.ts              # String utilities
    └── toast.ts               # Toast helpers
```

### Code Organization Principles

#### 1. **Separation of Concerns**

```typescript
// ❌ BAD - All logic mixed
// app/courses/[id]/page.tsx
export default function Page({ params }) {
  const db = require("..."); // Database access in component
  const course = db.course.findUnique(...); // Direct query in component
  const recommendation = // AI logic here
  return <div>{course.name}</div>;
}

// ✓ GOOD - Separated concerns
// lib/services/course.ts
export async function getCourseWithRecommendations(courseId) {
  const course = await db.course.findUnique(...);
  const recommendations = await generateRecommendations(courseId);
  return { course, recommendations };
}

// app/courses/[id]/page.tsx
import { getCourseWithRecommendations } from "@/lib/services/course";

export default async function Page({ params }) {
  const { course, recommendations } = await getCourseWithRecommendations(params.id);
  return <div>{course.name}</div>;
}
```

#### 2. **Naming Conventions**

```
Folders:        lowercase-kebab-case  (except React components)
Files:          PascalCase.tsx for components
                camelCase.ts for utilities
Functions:      camelCase
Constants:      UPPER_SNAKE_CASE
Types/Enums:    PascalCase

Examples:
  ✓ app/teaching-schedule/page.tsx
  ✓ components/AdminLayout.tsx
  ✓ lib/actions/course.ts
  ✓ const API_BASE_URL = "...";
  ✓ interface UserPayload {}
```

#### 3. **Local Route Logic**

Untuk per-route specific logic, gunakan `_components/` dan `_lib/`:

```
app/courses/[courseId]/
├── page.tsx                    # Route component
├── _components/
│   ├── CourseHeader.tsx
│   ├── CourseContent.tsx
│   └── CourseReviews.tsx
└── _lib/
    ├── fetch-course.ts
    └── calculate-progress.ts
```

Keuntungan:

- Isolasi logic per route
- Avoid naming collisions
- Easier testing & refactoring

---

## 7. Key Architectural Patterns

### Server Actions Pattern

```typescript
// lib/actions/course.ts
"use server";

import { requireRole } from "@/lib/auth";

export async function enrollCourse(courseId: string) {
  const user = await requireRole("mahasiswa");

  // Verify user can enroll
  const course = await db.course.findUnique({
    where: { id: courseId }
  });

  if (!course) throw new Error("Course not found");

  // Perform action
  await db.classStudent.create({
    data: {
      userId: user.id,
      classId: courseId
    }
  });

  revalidatePath("/courses");
  return { success: true };
}

// In component:
"use client";

import { enrollCourse } from "@/lib/actions/course";

export function EnrollButton({ courseId }) {
  const [pending, setPending] = useState(false);

  async function handleEnroll() {
    setPending(true);
    try {
      await enrollCourse(courseId);
      toast.success("Enrolled successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={handleEnroll} disabled={pending}>
      {pending ? "Enrolling..." : "Enroll"}
    </button>
  );
}
```

### API Route Pattern

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

// GET /api/courses
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole("mahasiswa", "dosen", "admin");

    const courses = await db.course.findMany({
      where: { status: "published" },
      include: { createdBy: true },
    });

    return NextResponse.json({
      status: "success",
      data: courses,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 401 },
    );
  }
}

// POST /api/courses
export async function POST(req: NextRequest) {
  const user = await requireRole("admin", "dosen");
  const body = await req.json();

  // Validate dengan Zod
  const validated = CreateCourseSchema.parse(body);

  const course = await db.course.create({
    data: {
      ...validated,
      createdById: user.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
```

### RAG (Retrieval Augmented Generation) Pattern

```typescript
// lib/ai/rag.ts

export async function retrieveContext(userQuery: string) {
  // 1. Get chatbot settings
  const settings = await db.chatbotSetting.findUnique({
    where: { key: "default" },
  });

  // 2. Break query ke terms (simple approach)
  const terms = userQuery.toLowerCase().split(" ");

  // 3. Retrieve chunks dari material
  const chunks = await db.materialChunk.findMany({
    where: {
      content: { search: terms.join(" | ") },
    },
    take: settings.topK,
  });

  // 4. Filter berdasarkan relevance score (minScore threshold)
  const relevantChunks = chunks.filter((c) => {
    const score = calculateRelevance(userQuery, c.content);
    return score >= settings.minScore;
  });

  return relevantChunks.map((c) => c.content).join("\n\n");
}

export async function chat(sessionId: string, userMessage: string) {
  // 1. Retrieve relevant context
  const context = await retrieveContext(userMessage);

  // 2. Get chat history
  const history = await db.chatTurn.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  // 3. Build messages untuk AI
  const messages = [
    { role: "system", content: settings.systemPrompt },
    ...history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: "user", content: userMessage },
    {
      role: "context_provided",
      content: `Context from knowledge base:\n\n${context}`,
    },
  ];

  // 4. Call AI model (example: OpenAI)
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
  });

  // 5. Save to DB
  await db.chatTurn.createMany({
    data: [
      { sessionId, role: "user", content: userMessage },
      {
        sessionId,
        role: "assistant",
        content: response.choices[0].message.content,
      },
    ],
  });

  return response.choices[0].message.content;
}
```

---

## 8. Data Flow Examples

### Course Enrollment Flow

```
1. User Browse Public Course
   GET /api/courses
   ↓
2. Click "Enroll" Button
   Client calls enrollCourse(courseId)
   ↓
3. Server Action
   enrollCourse → lib/actions/course.ts
   - Verify user is mahasiswa
   - Create ClassStudent record
   - Revalidate page cache
   ↓
4. Success Response
   UI shows "Enrolled successfully"
   Redirect ke /courses/enrolled
```

### Chat Message Flow

```
1. User Types Message
   handleSendMessage(message)
   ↓
2. Client Sends
   POST /api/chat
   { message: "...", sessionId: "..." }
   ↓
3. Server Side
   - Verify user owns session
   - Call lib/ai/rag.ts → retrieve context
   - Call AI model
   - Save user message + AI response to DB
   ↓
4. Stream Response
   Send AI response chunk by chunk
   ↓
5. Client Render
   UI shows message in real-time
```

---

## Summary

Nusa Belajar menggunakan:

- ✅ Modern Next.js 16 dengan App Router
- ✅ Prisma ORM untuk type-safe database access
- ✅ Server Actions untuk secure backend calls
- ✅ Role-based access control (RBAC)
- ✅ JWT tokens untuk stateless authentication
- ✅ RAG pattern untuk AI integration
- ✅ Clean code organization dengan separation of concerns

**Next:** Lanjut ke [Phase 3 - API Reference](PHASE-3-API-REFERENCE.md) untuk detail lengkap semua endpoints.
